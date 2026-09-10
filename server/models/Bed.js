const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true },
  floor: { type: Number, required: true, min: 1, max: 4 },
  ward: { type: String, required: true },
  type: { type: String, enum: ['General', 'ICU', 'Private', 'Semi-Private'], default: 'General' },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  admittedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Bed', BedSchema);
