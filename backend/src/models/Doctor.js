const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide doctor specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      default: 'MBBS, MD',
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 500,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    schedule: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        startTime: { type: String, default: '09:00 AM' },
        endTime: { type: String, default: '05:00 PM' },
      },
    ],
    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
