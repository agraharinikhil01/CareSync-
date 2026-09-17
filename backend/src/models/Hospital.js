const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide hospital email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide hospital contact phone'],
      trim: true,
    },
    emergencyPhone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
      },
    },
    hospitalType: {
      type: String,
      enum: ['Multi-Specialty', 'Super-Specialty', 'Government', 'Private Clinic', 'Trauma Center', 'General Hospital'],
      default: 'Multi-Specialty',
    },
    licenseNumber: {
      type: String,
      default: '',
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    emergencyAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    ambulanceAvailable: {
      type: Boolean,
      default: true,
    },
    bloodBankAvailable: {
      type: Boolean,
      default: false,
    },
    pharmacyAvailable: {
      type: Boolean,
      default: true,
    },
    diagnosticAvailable: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      type: String,
      default: '24/7 Open',
    },
    departments: [
      {
        type: String,
        trim: true,
      },
    ],
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    capacitySummary: {
      general: {
        total: { type: Number, default: 50, min: 0 },
        available: { type: Number, default: 15, min: 0 },
      },
      icu: {
        total: { type: Number, default: 10, min: 0 },
        available: { type: Number, default: 3, min: 0 },
      },
      emergency: {
        total: { type: Number, default: 8, min: 0 },
        available: { type: Number, default: 2, min: 0 },
      },
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 120,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

HospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', HospitalSchema);
