const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate a patient'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate a doctor'],
    },
    date: {
      type: Date,
      required: [true, 'Please specify appointment date'],
    },
    time: {
      type: String,
      required: [true, 'Please specify appointment time slot'],
    },
    reason: {
      type: String,
      trim: true,
      default: 'Routine Consultation',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index to help prevent double booking
AppointmentSchema.index({ doctor: 1, date: 1, time: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
