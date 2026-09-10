const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { type: String },
  allergies: { type: [String], default: [] },
  chronicConditions: { type: [String], default: [] },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String },
  },
  address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
