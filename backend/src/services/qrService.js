const QRCode = require('qrcode');

const generateQRCodeDataURL = async (textData) => {
  try {
    const dataUrl = await QRCode.toDataURL(textData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 200,
      color: {
        dark: '#006088',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return null;
  }
};

const generatePatientIdQR = async (patientId, patientName) => {
  return generateQRCodeDataURL(`CareSync:PATIENT:${patientId}:${patientName}`);
};

const generatePrescriptionVerificationQR = async (prescriptionId, hash) => {
  return generateQRCodeDataURL(`CareSync:RX_VERIFY:${prescriptionId}:${hash}`);
};

const generateAppointmentQR = async (appointmentId) => {
  return generateQRCodeDataURL(`CareSync:APPOINTMENT:${appointmentId}`);
};

module.exports = {
  generateQRCodeDataURL,
  generatePatientIdQR,
  generatePrescriptionVerificationQR,
  generateAppointmentQR,
};
