const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
});

const BillSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: [BillItemSchema],
  totalAmount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'online'], default: 'cash' },
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
