const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    console.log(`[Email Service Simulated] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@caresync.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'CareSync HMS';

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
      const errData = await response.json();
      console.warn('Brevo API delivery issue:', errData);
      return { success: false, error: errData };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('Email sending exception (handled gracefully):', err.message);
    return { success: false, error: err.message };
  }
};

const sendRegistrationEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to CareSync Hospital Management System',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #006088;">Welcome to CareSync HMS, ${user.name}!</h2>
        <p>Your hospital portal account has been successfully created with role: <strong>${user.role}</strong>.</p>
        <p>You can sign in to your dashboard to manage appointments, clinical records, and hospital services.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">© 2026 CareSync Hospital Management System</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
        <h3 style="color: ${isCancel ? '#dc2626' : '#059669'};">${isCancel ? 'Appointment Cancelled' : 'Appointment Confirmed'}</h3>
        <p>Patient: <strong>${appointment.patient?.name}</strong></p>
        <p>Doctor: <strong>Dr. ${appointment.doctor?.name}</strong></p>
        <p>Date & Time: <strong>${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}</strong></p>
        <p>Status: <strong>${appointment.status}</strong></p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'CareSync HMS - Password Reset Request',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0;">
        <h3 style="color: #006088;">Password Reset Request</h3>
        <p>You are receiving this email because a password reset request was requested for your CareSync HMS account.</p>
        <p>Please click the button below to reset your password within 30 minutes:</p>
        <a href="${resetUrl}" style="background-color: #0087be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendAppointmentEmail,
  sendPasswordResetEmail,
};
