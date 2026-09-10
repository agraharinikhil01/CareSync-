const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentEmail } = require('../services/emailService');
const { generateAppointmentQR } = require('../services/qrService');

// POST /api/appointments (Patient or Receptionist)
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;
    let patientId = req.body.patient;

    if (req.user.role === 'PATIENT') {
      patientId = req.user._id;
    } else if (!patientId) {
      return res.status(400).json({ success: false, message: 'Please specify a patient' });
    }

    // Verify doctor exists
    const doctorUser = await User.findOne({ _id: doctor, role: 'DOCTOR' });
    if (!doctorUser) {
      return res.status(404).json({ success: false, message: 'Doctor not found or invalid' });
    }

    const apptDate = new Date(date);
    apptDate.setHours(0, 0, 0, 0);

    // CRITICAL: Double Booking Prevention
    const conflict = await Appointment.findOne({
      doctor,
      date: apptDate,
      time,
      status: { $ne: 'CANCELLED' },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctorUser.name} already has an appointment booked on ${new Date(date).toLocaleDateString()} at ${time}. Please choose another time slot.`,
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor,
      date: apptDate,
      time,
      reason: reason || 'General Clinical Consultation',
      status: req.user.role === 'RECEPTIONIST' || req.user.role === 'ADMIN' ? 'CONFIRMED' : 'PENDING',
    });

    await appointment.populate(['patient', 'doctor']);

    // Send email notification in background
    sendAppointmentEmail(appointment, 'CONFIRMATION').catch((e) => console.log('Appointment email note:', e.message));

    const qrCode = await generateAppointmentQR(appointment._id.toString());

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { ...appointment.toObject(), qrCode },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments
const getAppointments = async (req, res) => {
  try {
    const { status, date, search } = req.query;
    let filter = {};

    // Role-specific scoping
    if (req.user.role === 'PATIENT') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      filter.doctor = req.user._id;
    }

    if (status) filter.status = status.toUpperCase();

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      filter.date = { $gte: d, $lt: nextD };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone specialization')
      .sort({ date: -1, time: 1 });

    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Authorization check
    if (req.user.role === 'PATIENT' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.user.role === 'DOCTOR' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const qrCode = await generateAppointmentQR(appointment._id.toString());
    res.json({ success: true, data: { ...appointment.toObject(), qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, time, date } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate(['patient', 'doctor']);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // If rescheduling, check for conflicts
    if (date || time) {
      const newDate = date ? new Date(date) : appointment.date;
      newDate.setHours(0, 0, 0, 0);
      const newTime = time || appointment.time;

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor._id,
        date: newDate,
        time: newTime,
        status: { $ne: 'CANCELLED' },
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Conflict: Doctor already has an appointment booked for that rescheduled date & time slot.',
        });
      }

      appointment.date = newDate;
      appointment.time = newTime;
    }

    if (status) appointment.status = status.toUpperCase();
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    if (appointment.status === 'CANCELLED') {
      sendAppointmentEmail(appointment, 'CANCELLATION').catch((e) => console.log('Cancel email note:', e.message));
    }

    res.json({ success: true, message: `Appointment status set to ${appointment.status}`, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
