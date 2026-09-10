const mongoose = require('mongoose');

const ServiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
});

const BillSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      default: null,
    },
    appointmentCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    bedCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherServices: [ServiceItemSchema],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', BillSchema);
