const crypto = require('crypto');
const Prescription = require('../models/Prescription');
const { generatePrescriptionPDF } = require('../services/pdfService');
const { generatePrescriptionVerificationQR } = require('../services/qrService');

// POST /api/prescriptions (Doctor only)
const createPrescription = async (req, res) => {
  try {
    const { patient, appointment, diagnosis, medicines, instructions, notes } = req.body;

    if (!patient || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide patient, diagnosis, and at least one medicine' });
    }

    const verificationHash = crypto
      .createHash('sha256')
      .update(`${patient}-${req.user._id}-${diagnosis}-${Date.now()}`)
      .digest('hex');

    const prescription = await Prescription.create({
      patient,
      doctor: req.user._id,
      appointment: appointment || null,
      diagnosis,
      medicines,
      instructions: instructions || '',
      notes: notes || '',
      verificationHash,
    });

    await prescription.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, message: 'Prescription created', data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions
const getPrescriptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'PATIENT') filter.patient = req.user._id;
    if (req.user.role === 'DOCTOR') filter.doctor = req.user._id;

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const qrCode = await generatePrescriptionVerificationQR(prescription._id.toString(), prescription.verificationHash);
    res.json({ success: true, data: { ...prescription.toObject(), qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id/pdf (Download PDF)
const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    generatePrescriptionPDF(prescription, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/verify/:hash (Public verification)
const verifyPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ verificationHash: req.params.hash })
      .populate('patient', 'name')
      .populate('doctor', 'name');

    if (!prescription) {
      return res.json({
        success: false,
        genuine: false,
        message: 'Invalid or counterfeit prescription record.',
      });
    }

    res.json({
      success: true,
      genuine: true,
      message: 'Verified authentic prescription issued by CareSync Hospital.',
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPDF,
  verifyPrescription,
};
