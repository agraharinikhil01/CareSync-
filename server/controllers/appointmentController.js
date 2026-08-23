const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Billing = require('../models/Billing');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient, Receptionist, Admin)
const createAppointment = async (req, res, next) => {
  try {
    let { patientId, doctorId, date, timeSlot, reason, type, notes } = req.body;

    // If patient is booking, set patientId from auth user
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    }

    if (!patientId || !doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Validate Doctor existence
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    // Check doctor slot conflict
    const existingSlot = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected doctor. Please pick another slot.',
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      type: type || 'General Consultation',
      notes: notes || '',
      status: req.user.role === 'patient' ? 'Pending' : 'Confirmed',
    });

    // Generate automatic initial billing invoice
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    const fee = doctorProfile ? doctorProfile.consultationFee : 500;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    await Billing.create({
      invoiceNumber,
      patientId,
      appointmentId: appointment._id,
      doctorId,
      items: [
        {
          description: `Doctor Consultation Fee (${doctor.name} - ${doctorProfile ? doctorProfile.specialization : 'General'})`,
          quantity: 1,
          unitPrice: fee,
          amount: fee,
        },
      ],
      subTotal: fee,
      taxAmount: 0,
      totalAmount: fee,
      paymentStatus: 'Pending',
      paymentMethod: 'Pending Selection',
      invoiceDate: new Date(),
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Role-filtered)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};
    const { status, date } = req.query;

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }
    // Admin and receptionist see all

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
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort({ date: -1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check
    if (
      req.user.role === 'patient' &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor, Receptionist, Admin, Patient)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role specific restrictions
    if (req.user.role === 'patient') {
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      }
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
