const mongoose = require('mongoose');

const EmergencyRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emergencyType: {
      type: String,
      enum: ['ACCIDENT', 'CARDIAC', 'TRAUMA', 'RESPIRATORY', 'MATERNITY', 'OTHER'],
      default: 'OTHER',
      required: true,
    },
    priority: {
      type: String,
      enum: ['HIGH', 'CRITICAL'],
      default: 'CRITICAL',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        default: '',
      },
    },
    targetHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DISPATCHED', 'ADMITTED', 'RESOLVED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

EmergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);
