const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

// @desc    Get all active doctors (with filtering by specialization / search)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    let query = {};

    if (specialization && specialization !== 'All') {
      query.specialization = new RegExp(specialization, 'i');
    }

    let doctorProfiles = await DoctorProfile.find(query).populate({
      path: 'userId',
      select: 'name email phone profilePic isActive',
      match: { isActive: true },
    });

    // Filter out inactive doctors
    doctorProfiles = doctorProfiles.filter(doc => doc.userId !== null);

    if (search) {
      doctorProfiles = doctorProfiles.filter(doc =>
        doc.userId.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: doctorProfiles.length,
      data: doctorProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor profile by User ID or Profile ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({
      $or: [{ _id: req.params.id }, { userId: req.params.id }],
    }).populate('userId', 'name email phone profilePic isActive');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor dashboard metrics & daily queue
// @route   GET /api/doctors/dashboard/metrics
// @access  Private (Doctor only)
const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Today's Date Range (Start of today to End of today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate('patientId', 'name email phone profilePic');

    const totalAppointments = await Appointment.countDocuments({ doctorId });
    const pendingAppointments = await Appointment.countDocuments({ doctorId, status: 'Pending' });
    const completedAppointments = await Appointment.countDocuments({ doctorId, status: 'Completed' });
    const totalPrescriptions = await Prescription.countDocuments({ doctorId });

    // Distinct treated patients
    const distinctPatients = await Appointment.distinct('patientId', { doctorId });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          todayCount: todayAppointments.length,
          pendingCount: pendingAppointments,
          completedCount: completedAppointments,
          totalPatients: distinctPatients.length,
          totalPrescriptions,
        },
        todayQueue: todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor's assigned appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let query = { doctorId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const start = new Date(selectedDate.setHours(0, 0, 0, 0));
      const end = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone profilePic')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor's Patients with EHR Records
// @route   GET /api/doctors/patients
// @access  Private (Doctor)
const getDoctorPatients = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Get patient IDs from appointments
    const patientIds = await Appointment.distinct('patientId', { doctorId });

    const patients = await PatientProfile.find({
      userId: { $in: patientIds },
    }).populate('userId', 'name email phone profilePic');

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorPatients,
};
