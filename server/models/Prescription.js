const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true, // e.g. "500mg"
  },
  frequency: {
    type: String,
    required: true, // e.g. "Twice a day (1-0-1)"
  },
  duration: {
    type: String,
    required: true, // e.g. "5 days"
  },
  instructions: {
    type: String,
    default: 'After meals',
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    symptoms: {
      type: String,
      default: '',
    },
    medicines: [medicineSchema],
    tests: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      default: 'Drink plenty of water and get adequate rest.',
    },
    followUpDate: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
