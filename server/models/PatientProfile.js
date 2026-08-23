const mongoose = require('mongoose');

const medicalRecordEntrySchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
  },
  diagnosedDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  treatedBy: {
    type: String,
    default: '',
  },
});

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Please enter a realistic age'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalHistory: [medicalRecordEntrySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
