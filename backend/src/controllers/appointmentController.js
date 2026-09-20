const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendAppointmentEmail } = require('../services/emailService');
const { generateAppointmentQR } = require('../services/qrService');

// POST /api/appointments (Patient or Receptionist or Admin)
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason, doctorName, doctorSpecialization, hospital, hospitalName, fee } = req.body;
    let patientId = req.user.role === 'PATIENT' ? req.user._id : req.body.patient;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Please specify a patient' });
    }

    // Check if patientId is a Patient document ID rather than User ID
    const patientDoc = await Patient.findById(patientId);
    if (patientDoc && patientDoc.user) {
      patientId = patientDoc.user;
    }

    // Resilient Doctor lookup: Supports ObjectId, Doctor Doc ID, Name matching, or auto-provisioning
    let doctorUserId = null;
    let doctorUser = null;

    if (doctor && mongoose.Types.ObjectId.isValid(doctor)) {
      doctorUser = await User.findOne({ _id: doctor, role: 'DOCTOR' });
      if (!doctorUser) {
        const docRecord = await Doctor.findById(doctor);
        if (docRecord && docRecord.user) {
          doctorUser = await User.findOne({ _id: docRecord.user, role: 'DOCTOR' });
        }
      }
      if (doctorUser) {
        doctorUserId = doctorUser._id;
      }
    }

    // Match by Doctor Name if ID lookup did not resolve
    if (!doctorUser && doctorName) {
      const namePart = doctorName.replace(/^Dr\.?\s*/i, '').trim();
      doctorUser = await User.findOne({
        role: 'DOCTOR',
        name: new RegExp(namePart, 'i'),
      });
      if (doctorUser) {
        doctorUserId = doctorUser._id;
      }
    }

    // Fallback: Ensure an on-duty specialist profile exists in DB
    if (!doctorUser) {
      const cleanName = (doctorName || 'Dr. Medical Officer').trim();
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const docEmail = `doctor.${slug || 'duty'}@caresync.org`;

      doctorUser = await User.findOneAndUpdate(
        { email: docEmail },
        {
          $setOnInsert: {
            name: cleanName.startsWith('Dr.') ? cleanName : `Dr. ${cleanName}`,
            email: docEmail,
            password: '$2a$10$CareSyncDoctorAutoPasswordHash2026',
            role: 'DOCTOR',
            phone: '+91 94508 22100',
            hospitalId: mongoose.Types.ObjectId.isValid(hospital) ? hospital : undefined,
          },
        },
        { upsert: true, new: true }
      );
      doctorUserId = doctorUser._id;

      // Ensure Doctor profile exists
      await Doctor.findOneAndUpdate(
        { user: doctorUserId },
        {
          $setOnInsert: {
            user: doctorUserId,
            hospital: mongoose.Types.ObjectId.isValid(hospital) ? hospital : undefined,
            specialization: doctorSpecialization || 'General Medicine',
            experience: 8,
            consultationFee: fee || 450,
            availability: true,
          },
        },
        { upsert: true, new: true }
      );
    }

    const apptDate = new Date(date);
    apptDate.setHours(0, 0, 0, 0);

    // Double Booking Prevention
    const conflict = await Appointment.findOne({
      doctor: doctorUserId,
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
      doctor: doctorUserId,
      hospital: mongoose.Types.ObjectId.isValid(hospital) ? hospital : undefined,
      hospitalName: hospitalName || '',
      doctorName: doctorUser.name || doctorName || '',
      doctorSpecialization: doctorSpecialization || '',
      fee: fee || 450,
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

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

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
      .populate('hospital', 'name address city state')
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
      .populate('doctor', 'name email phone')
      .populate('hospital', 'name address city state');

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
