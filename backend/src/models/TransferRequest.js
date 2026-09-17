const mongoose = require('mongoose');

const TransferRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientAge: {
      type: Number,
      required: true,
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    fromHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Sending hospital is required'],
      index: true,
    },
    toHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Receiving hospital is required'],
      index: true,
    },
    requiredDepartment: {
      type: String,
      required: true,
      trim: true,
    },
    requiredBedType: {
      type: String,
      enum: ['GENERAL', 'ICU', 'EMERGENCY', 'ISOLATION', 'PRIVATE'],
      default: 'ICU',
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'CRITICAL'],
      default: 'URGENT',
    },
    reason: {
      type: String,
      required: [true, 'Transfer reason is required'],
      trim: true,
    },
    clinicalSummary: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TransferRequest', TransferRequestSchema);
