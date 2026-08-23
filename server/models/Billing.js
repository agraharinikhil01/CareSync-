const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [billItemSchema],
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      default: 'UPI/Online',
    },
    transactionId: {
      type: String,
      default: '',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
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

module.exports = mongoose.model('Billing', billingSchema);
