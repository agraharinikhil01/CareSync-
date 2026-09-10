const mongoose = require('mongoose');

const MedicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '500mg' },
  frequency: { type: String, default: '1-0-1' },
  duration: { type: String, default: '5 Days' },
  instructions: { type: String, default: 'After meals' },
});

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: [true, 'Please provide clinical diagnosis'],
      trim: true,
    },
    medicines: [MedicineItemSchema],
    instructions: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    verificationHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);
