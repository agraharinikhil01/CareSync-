const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: [true, 'Please provide bed identifier'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      enum: [1, 2, 3, 4],
    },
    room: {
      type: String,
      default: 'General',
    },
    type: {
      type: String,
      enum: ['General', 'ICU', 'Private', 'Semi-Private'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    dischargedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bed', BedSchema);
