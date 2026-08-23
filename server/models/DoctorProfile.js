const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g., "09:00"
  },
  endTime: {
    type: String,
    required: true, // e.g., "17:00"
  },
});

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    biography: {
      type: String,
      default: '',
    },
    roomNumber: {
      type: String,
      default: '',
    },
    availableSlots: [availableSlotSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
