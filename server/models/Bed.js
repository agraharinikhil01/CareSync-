const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['ICU', 'General Ward', 'Private Room', 'Emergency', 'Semi-Private'],
      required: [true, 'Bed type is required'],
    },
    ward: {
      type: String,
      required: [true, 'Ward identifier is required'], // e.g. "Floor 2 - East Wing"
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: [0, 'Daily rate cannot be negative'],
    },
    features: {
      type: [String],
      default: ['Oxygen Supply', 'Adjustable Height'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bed', bedSchema);
