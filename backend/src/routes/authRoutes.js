const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTPLogin,
  verifyEmailOTP,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/send-otp', sendOTP);
router.post('/verify-otp-login', verifyOTPLogin);
router.post('/verify-email', verifyEmailOTP);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
