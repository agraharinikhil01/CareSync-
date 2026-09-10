const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// GET /api/doctors (Public / Authenticated)
const getDoctors = async (req, res) => {
  try {
    const { specialization, availability, search } = req.query;
    let query = {};

    if (specialization) query.specialization = specialization;
    if (availability !== undefined) query.availability = availability === 'true';

    if (search) {
      const userMatches = await User.find({
        role: 'DOCTOR',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.user = { $in: userMatches.map((u) => u._id) };
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone profileImage')
      .sort({ specialization: 1 });

    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', '-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/me/profile
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', '-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors (Admin only)
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience, qualification, consultationFee, schedule } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Doctor@123',
      phone,
      role: 'DOCTOR',
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization: specialization || 'General Physician',
      experience: experience || 0,
      qualification: qualification || 'MBBS, MD',
      consultationFee: consultationFee || 500,
      schedule: schedule || [],
    });

    await doctor.populate('user', '-password');
    res.status(201).json({ success: true, message: 'Doctor registered successfully', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/:id (Admin or Doctor owner)
const updateDoctor = async (req, res) => {
  try {
    const { name, phone, specialization, experience, qualification, consultationFee, availability, schedule } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (req.user.role === 'DOCTOR' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (name || phone) {
      await User.findByIdAndUpdate(doctor.user, { name, phone });
    }

    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience !== undefined ? experience : doctor.experience;
    doctor.qualification = qualification || doctor.qualification;
    doctor.consultationFee = consultationFee !== undefined ? consultationFee : doctor.consultationFee;
    if (availability !== undefined) doctor.availability = availability;
    if (schedule) doctor.schedule = schedule;

    await doctor.save();
    await doctor.populate('user', '-password');

    res.json({ success: true, message: 'Doctor profile updated', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/doctors/:id (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Doctor record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/me/dashboard-stats
const getDoctorDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayAppointments, upcomingAppointments, totalPatients, pendingPrescriptions] = await Promise.all([
      Appointment.find({
        doctor: req.user._id,
        date: { $gte: todayStart, $lte: todayEnd },
      }).populate('patient', 'name email phone'),
      Appointment.find({
        doctor: req.user._id,
        date: { $gt: todayEnd },
      }).populate('patient', 'name email phone'),
      Appointment.distinct('patient', { doctor: req.user._id }),
      Appointment.countDocuments({
        doctor: req.user._id,
        status: 'CONFIRMED',
      }),
    ]);

    res.json({
      success: true,
      data: {
        todayAppointments,
        upcomingAppointments,
        totalAssignedPatients: totalPatients.length,
        pendingPrescriptions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorDashboardStats,
};
