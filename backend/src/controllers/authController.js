const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const EmailOtp = require('../models/EmailOtp');
const { sendRegistrationEmail, sendPasswordResetEmail, sendOTPEmail } = require('../services/emailService');

const generateToken = (userId, role) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'caresync_super_secret_jwt_key_2026_change_this';
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const assignedRole = (role || 'PATIENT').toUpperCase();

    // Critical security constraint: Normal users MUST NOT register as ADMIN
    if (assignedRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Registration as Administrator is restricted. Please contact system administrator.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      phone: phone || '',
    });

    // Create associated profile document
    if (user.role === 'PATIENT') {
      await Patient.create({ user: user._id });
    } else if (user.role === 'DOCTOR') {
      await Doctor.create({
        user: user._id,
        specialization: req.body.specialization || 'General Medicine',
        consultationFee: req.body.consultationFee || 500,
      });
    }

    // Send welcome email (asynchronous & non-blocking)
    sendRegistrationEmail(user).catch((e) => console.log('Welcome email note:', e.message));

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      // Return 200 to prevent email enumeration
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Password reset link sent to registered email address.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-register new Google user as PATIENT
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: randomPassword,
        role: 'PATIENT',
        authProvider: 'google',
        googleId: googleId || '',
        profileImage: picture || '',
      });

      // Create Patient EMR profile
      await Patient.create({ user: user._id });
    } else {
      // Existing user: Link Google ID and update picture if not set
      if (googleId && !user.googleId) user.googleId = googleId;
      if (picture && !user.profileImage) user.profileImage = picture;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'LOGIN' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPurpose = (purpose || 'LOGIN').toString().toUpperCase();

    // Prevent duplicate/spam sends: enforce minimum 30-second gap per email
    const recentOtp = await EmailOtp.findOne({
      email: cleanEmail,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
    });
    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: 'A verification code was just sent. Please wait before requesting another code.',
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Ensure strictly one active OTP exists by clearing all previous ones
    await EmailOtp.deleteMany({ email: cleanEmail });

    // Store in EmailOtp
    await EmailOtp.create({
      email: cleanEmail,
      otp,
      purpose: cleanPurpose,
      expiresAt,
    });

    // Also associate to User if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      user.emailOtp = otp;
      user.emailOtpExpires = expiresAt;
      await user.save({ validateBeforeSave: false });
    }

    // Deliver transactional email
    const emailRes = await sendOTPEmail({ email: cleanEmail, otp, purpose: cleanPurpose });

    if (!emailRes.success && !emailRes.simulated) {
      console.warn('Email delivery notice:', emailRes.error);
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
      data: {
        email: cleanEmail,
        expiresInSeconds: 600,
      },
    });
  } catch (err) {
    console.error('Error in sendOTP:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
  }
};

// POST /api/auth/verify-otp-login
const verifyOTPLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email and 6-digit verification code' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Find valid OTP record
    const otpRecord = await EmailOtp.findOne({
      email: cleanEmail,
      expiresAt: { $gt: new Date() },
    });

    let user = await User.findOne({ email: cleanEmail }).select('+password +emailOtp +emailOtpExpires');

    const isValidInRecord = otpRecord && otpRecord.otp === cleanOtp;
    const isValidInUser = user && user.emailOtp === cleanOtp && user.emailOtpExpires && user.emailOtpExpires > new Date();

    if (!isValidInRecord && !isValidInUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new OTP.',
      });
    }

    // Clean up verified OTP
    await EmailOtp.deleteMany({ email: cleanEmail });

    // Auto-create Patient account if new email
    if (!user) {
      const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      user = await User.create({
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        email: cleanEmail,
        password: crypto.randomBytes(16).toString('hex') + 'Aa1!',
        role: 'PATIENT',
        isEmailVerified: true,
      });

      await Patient.create({
        user: user._id,
        bloodGroup: 'O+',
      });
    } else {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Email verified and logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          profileImage: user.profileImage || '',
          isEmailVerified: true,
        },
      },
    });
  } catch (err) {
    console.error('Error in verifyOTPLogin:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-email
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const targetEmail = (email || req.user?.email || '').trim().toLowerCase();

    if (!targetEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const cleanOtp = otp.toString().trim();
    const otpRecord = await EmailOtp.findOne({
      email: targetEmail,
      expiresAt: { $gt: new Date() },
    });

    let user = await User.findOne({ email: targetEmail }).select('+emailOtp +emailOtpExpires');
    const isValid = (otpRecord && otpRecord.otp === cleanOtp) || (user && user.emailOtp === cleanOtp && user.emailOtpExpires > new Date());

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    await EmailOtp.deleteMany({ email: targetEmail });

    if (user) {
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      message: 'Email address successfully verified!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTPLogin,
  verifyEmailOTP,
};
