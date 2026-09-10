const Appointment = require('../models/Appointment');
const User = require('../models/User');

// POST /api/appointments
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;
    const doctorExists = await User.findOne({ _id: doctor, role: 'doctor' });
    if (!doctorExists) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason,
    });
    await appointment.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments (admin/receptionist gets all)
const getAppointments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'doctor') filter.doctor = req.user._id;
    if (req.user.role === 'patient') filter.patient = req.user._id;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name email')
      .sort({ date: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate(['patient', 'doctor']);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/appointments/:id
const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus, deleteAppointment };
