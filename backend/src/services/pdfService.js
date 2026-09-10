const PDFDocument = require('pdfkit');

const generatePrescriptionPDF = (prescription, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Prescription_${prescription._id.toString().slice(-6)}.pdf`
  );

  doc.pipe(res);

  // Hospital Header
  doc
    .fillColor('#006088')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('CareSync Hospital Management System', 40, 40);

  doc
    .fillColor('#64748b')
    .fontSize(10)
    .font('Helvetica')
    .text('Clinical Care & Digital Health Services | Helpline: 112 / +91-9999000001', 40, 68);

  doc.moveTo(40, 85).lineTo(555, 85).strokeColor('#cbd5e1').stroke();

  // Doctor & Patient Meta
  doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold').text('Doctor Details:', 40, 100);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(`Dr. ${prescription.doctor?.name || 'Consultant'}`);
  doc.text(`Consultant Physician | CareSync Medical Center`);

  doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold').text('Patient Details:', 320, 100);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(`Name: ${prescription.patient?.name || 'Patient'}`);
  doc.text(`Email / ID: ${prescription.patient?.email || 'N/A'}`);
  doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-IN')}`);

  doc.moveTo(40, 155).lineTo(555, 155).strokeColor('#e2e8f0').stroke();

  // Diagnosis Section
  doc.fontSize(12).fillColor('#006088').font('Helvetica-Bold').text('Clinical Diagnosis:', 40, 170);
  doc.fontSize(11).fillColor('#0f172a').font('Helvetica').text(prescription.diagnosis, 40, 190);

  // Rx Medicines Section
  doc.fontSize(14).fillColor('#006088').font('Helvetica-Bold').text('Rx Prescribed Medicines', 40, 220);

  // Table Header
  let y = 245;
  doc.rect(40, y, 515, 24).fill('#f1f5f9');
  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(10);
  doc.text('Medicine Name', 50, y + 7);
  doc.text('Dosage', 220, y + 7);
  doc.text('Frequency', 320, y + 7);
  doc.text('Duration', 420, y + 7);

  y += 26;
  doc.font('Helvetica').fontSize(9).fillColor('#334155');

  prescription.medicines?.forEach((med, idx) => {
    if (idx % 2 === 1) {
      doc.rect(40, y, 515, 22).fill('#f8fafc');
    }
    doc.fillColor('#0f172a').font('Helvetica-Bold').text(med.name, 50, y + 6);
    doc.font('Helvetica').fillColor('#334155');
    doc.text(med.dosage || 'Standard', 220, y + 6);
    doc.text(med.frequency || '1-0-1', 320, y + 6);
    doc.text(med.duration || '5 Days', 420, y + 6);

    if (med.instructions) {
      y += 18;
      doc.fillColor('#64748b').fontSize(8).text(`Instructions: ${med.instructions}`, 60, y + 2);
    }
    y += 24;
  });

  // Doctor's Advice
  if (prescription.advice || prescription.notes) {
    y += 15;
    doc.fontSize(11).fillColor('#006088').font('Helvetica-Bold').text('Doctor Advice & Instructions:', 40, y);
    y += 18;
    doc
      .fontSize(9)
      .fillColor('#334155')
      .font('Helvetica')
      .text(prescription.advice || prescription.notes, 40, y, { width: 515 });
    y += 35;
  }

  // Footer & Signature
  doc.moveTo(40, 720).lineTo(555, 720).strokeColor('#cbd5e1').stroke();
  doc.fontSize(9).fillColor('#64748b').text('Digitally generated & verified electronic prescription.', 40, 730);
  doc.text(`Verification Hash: ${prescription.verificationHash || prescription._id}`, 40, 744);

  doc
    .fontSize(10)
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text(`Dr. ${prescription.doctor?.name}`, 400, 730);
  doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Authorized Medical Officer Signature', 400, 744);

  doc.end();
};

const generateInvoicePDF = (bill, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice_${bill._id.toString().slice(-6)}.pdf`);

  doc.pipe(res);

  // Hospital Header
  doc
    .fillColor('#006088')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('CareSync Hospital Management System', 40, 40);

  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Official Patient Invoice & Receipt', 40, 68);

  doc.moveTo(40, 85).lineTo(555, 85).strokeColor('#cbd5e1').stroke();

  // Invoice Details
  doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold').text('Billed To:', 40, 100);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(`Patient: ${bill.patient?.name || 'Patient'}`);
  doc.text(`Email: ${bill.patient?.email || 'N/A'}`);

  doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold').text('Invoice Details:', 320, 100);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(`Invoice ID: #INV-${bill._id.toString().slice(-6).toUpperCase()}`);
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}`);
  doc.text(`Status: ${bill.paymentStatus}`);

  // Table
  let y = 160;
  doc.rect(40, y, 515, 24).fill('#f1f5f9');
  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(10);
  doc.text('Service / Charge Description', 50, y + 7);
  doc.text('Amount (INR)', 450, y + 7);

  y += 28;
  doc.font('Helvetica').fontSize(10).fillColor('#334155');

  if (bill.appointmentCharge > 0) {
    doc.text('Physician Consultation Fee', 50, y);
    doc.text(`Rs. ${bill.appointmentCharge.toFixed(2)}`, 450, y);
    y += 20;
  }

  if (bill.bedCharge > 0) {
    doc.text('In-Patient Ward Bed Charges', 50, y);
    doc.text(`Rs. ${bill.bedCharge.toFixed(2)}`, 450, y);
    y += 20;
  }

  bill.otherServices?.forEach((s) => {
    doc.text(s.name, 50, y);
    doc.text(`Rs. ${s.amount.toFixed(2)}`, 450, y);
    y += 20;
  });

  doc.moveTo(40, y + 10).lineTo(555, y + 10).strokeColor('#cbd5e1').stroke();
  y += 25;

  doc.fontSize(12).fillColor('#006088').font('Helvetica-Bold');
  doc.text('Total Payable Amount:', 300, y);
  doc.text(`Rs. ${bill.totalAmount.toFixed(2)}`, 450, y);

  doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('Payment Method: ' + (bill.paymentMethod || 'Cash/Online'), 40, y);

  // Footer
  doc.moveTo(40, 720).lineTo(555, 720).strokeColor('#cbd5e1').stroke();
  doc.fontSize(9).fillColor('#64748b').text('Thank you for choosing CareSync Hospital. For billing inquiries: accounts@caresync.com', 40, 735);

  doc.end();
};

module.exports = {
  generatePrescriptionPDF,
  generateInvoicePDF,
};
