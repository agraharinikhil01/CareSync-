const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true });
    const profiles = await DoctorProfile.find().populate('user', 'name email phone gender profilePhoto');
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.params.id }).populate('user', '-password');
    if (!profile) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/my-profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id }).populate('user', '-password');
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/doctors/my-profile
const updateMyProfile = async (req, res) => {
  try {
    const { specialization, department, qualification, experience, consultationFee, isAvailable, schedule } = req.body;
    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { specialization, department, qualification, experience, consultationFee, isAvailable, schedule },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/my-appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone age gender bloodGroup')
      .sort({ date: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/my-prescriptions
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, getMyProfile, updateMyProfile, getMyAppointments, getMyPrescriptions };
