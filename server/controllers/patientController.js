const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');

// GET /api/patients (admin/receptionist)
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isActive: true }).select('-password');
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/my-profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user._id }).populate('user', '-password');
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: { ...user.toObject(), profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/patients/my-profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, age, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name, phone, age, gender, bloodGroup });
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user._id },
      { bloodGroup, allergies, chronicConditions, emergencyContact, address },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/my-appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email')
      .sort({ date: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/my-prescriptions
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/my-bills
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllPatients, getMyProfile, updateMyProfile, getMyAppointments, getMyPrescriptions, getMyBills };
