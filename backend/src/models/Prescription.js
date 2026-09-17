const mongoose = require('mongoose');

const MedicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '500mg' },
  frequency: { type: String, default: '1-0-1' },
  duration: { type: String, default: '5 Days' },
  instructions: { type: String, default: 'After meals' },
});

const LabTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
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
    symptoms: {
      type: [String],
      default: [],
    },
    medicines: [MedicineItemSchema],
    advice: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    labTests: [LabTestSchema],
    followUpDate: {
      type: Date,
      default: null,
    },
    verificationHash: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String,
      default: '',
    },
    scannedImage: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Manual',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);
