const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  department: { type: String },
  qualification: { type: String },
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 500 },
  isAvailable: { type: Boolean, default: true },
  schedule: {
    days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
  },
}, { timestamps: true });

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
