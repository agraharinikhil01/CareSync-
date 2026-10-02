const getBrevoApiKey = () => {
  return (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your_brevo_api_key_here')
    ? process.env.BREVO_API_KEY.trim()
    : '';
};

const getSenderEmail = () => {
  return (process.env.BREVO_SENDER_EMAIL && process.env.BREVO_SENDER_EMAIL.trim()) || 'agraharinikhil999@gmail.com';
};

const getSenderName = () => {
  return process.env.BREVO_SENDER_NAME || 'CareSync Healthcare OS';
};

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  const apiKey = getBrevoApiKey();

  if (!apiKey) {
    console.log(`[Email Service Simulated] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const senderEmail = getSenderEmail();
    const senderName = getSenderName();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent: htmlContent || `<p>${textContent || subject}</p>`,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('Brevo API delivery issue:', errData);
      return { success: false, error: errData };
    }

    const data = await response.json().catch(() => ({}));
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('Email sending exception (handled gracefully):', err.message);
    return { success: false, error: err.message };
  }
};

const sendOTPEmail = async ({ email, otp, purpose = 'LOGIN' }) => {
  const isLogin = purpose === 'LOGIN';
  const isRegister = purpose === 'REGISTER';

  const badgeText = isLogin ? 'Login Verification' : isRegister ? 'Registration Verification' : 'Email Verification';
  const actionText = isLogin
    ? 'sign in to your CareSync portal'
    : isRegister
      ? 'complete your CareSync account registration'
      : 'verify your CareSync email address';

  const subject = `🔐 ${otp} is your CareSync verification code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #0284c7, #0f172a); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .badge { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px; }
        .info { font-size: 14px; color: #334155; line-height: 1.6; margin: 8px 0; }
        .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #0369a1; font-family: 'Courier New', Courier, monospace; }
        .expiry { margin: 8px 0 0; font-size: 12px; color: #0284c7; font-weight: 600; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 8px; font-size: 12px; color: #b45309; margin-top: 22px; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 CareSync Healthcare OS</h1>
          <p>Next-Gen Hospital Management Platform</p>
        </div>
        <div class="content">
          <span class="badge">${badgeText}</span>
          <p class="info">Hello,</p>
          <p class="info">Use the 6-digit one-time password (OTP) below to <strong>${actionText}</strong>:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p class="expiry">⏱️ Valid for 10 minutes</p>
          </div>

          <div class="warning">
            ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. CareSync hospital staff will never ask for your verification code.
          </div>
          <p class="info" style="font-size: 12px; color: #64748b; margin-top: 20px;">
            If you did not initiate this request, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0; font-weight: 600; color: #64748b;">CareSync Hospital Management System</p>
          <p style="margin: 4px 0 0;">HIPAA Compliant • 256-bit Encrypted • Brevo Certified Delivery</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    htmlContent,
    textContent: `Your CareSync verification code is ${otp}. Valid for 10 minutes.`,
  });
};

const sendRegistrationEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to CareSync Hospital Management System',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0284c7; margin-top: 0;">Welcome to CareSync HMS, ${user.name}!</h2>
        <p style="color: #334155; line-height: 1.6;">Your hospital portal account has been successfully created with role: <strong>${user.role}</strong>.</p>
        <p style="color: #334155; line-height: 1.6;">You can sign in to your dashboard to manage appointments, digital prescriptions, bed availability, and patient health records.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">© 2026 CareSync Hospital Management System</p>
      </div>
    `,
  });
};

const sendAppointmentEmail = async (appointment, type = 'CONFIRMATION') => {
  const isCancel = type === 'CANCELLATION';
  const subject = isCancel
    ? `CareSync Appointment Cancelled - ${new Date(appointment.date).toLocaleDateString()}`
    : `CareSync Appointment Confirmed - ${new Date(appointment.date).toLocaleDateString()}`;

  const recipientEmail = appointment.patient?.email;
  if (!recipientEmail) return;

  return sendEmail({
    to: recipientEmail,
    subject,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h3 style="color: ${isCancel ? '#dc2626' : '#059669'}; margin-top: 0;">${isCancel ? 'Appointment Cancelled' : 'Appointment Confirmed'}</h3>
        <p style="color: #334155;">Patient: <strong>${appointment.patient?.name}</strong></p>
        <p style="color: #334155;">Doctor: <strong>Dr. ${appointment.doctor?.name}</strong></p>
        <p style="color: #334155;">Date & Time: <strong>${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}</strong></p>
        <p style="color: #334155;">Status: <strong>${appointment.status}</strong></p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'CareSync HMS - Password Reset Request',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h3 style="color: #0284c7; margin-top: 0;">Password Reset Request</h3>
        <p style="color: #334155; line-height: 1.6;">You are receiving this email because a password reset request was requested for your CareSync HMS account.</p>
        <p style="color: #334155; line-height: 1.6;">Please click the button below to reset your password within 30 minutes:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendRegistrationEmail,
  sendAppointmentEmail,
  sendPasswordResetEmail,
};
