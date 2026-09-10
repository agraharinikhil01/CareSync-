const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  instructions: { type: String },
});

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  medicines: [MedicineSchema],
  advice: { type: String },
  followUpDate: { type: Date },
  verificationHash: { type: String, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
