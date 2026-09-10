const crypto = require('crypto');
const Prescription = require('../models/Prescription');

// POST /api/prescriptions
const createPrescription = async (req, res) => {
  try {
    const { patient, appointment, diagnosis, medicines, advice, followUpDate } = req.body;

    const hash = crypto.createHash('sha256')
      .update(`${patient}-${req.user._id}-${diagnosis}-${Date.now()}`)
      .digest('hex');

    const prescription = await Prescription.create({
      patient,
      doctor: req.user._id,
      appointment,
      diagnosis,
      medicines,
      advice,
      followUpDate,
      verificationHash: hash,
    });
    await prescription.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions (doctor sees own, admin sees all)
const getPrescriptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'doctor') filter.doctor = req.user._id;
    if (req.user.role === 'patient') filter.patient = req.user._id;

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email age gender bloodGroup')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/verify/:hash (public)
const verifyPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ verificationHash: req.params.hash })
      .populate('patient', 'name age gender')
      .populate('doctor', 'name');
    if (!prescription) {
      return res.json({ success: false, genuine: false, message: '⚠️ Prescription NOT found or may be counterfeit.' });
    }
    res.json({ success: true, genuine: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPrescription, getPrescriptions, verifyPrescription };
