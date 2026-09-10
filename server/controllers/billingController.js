const Bill = require('../models/Bill');
const User = require('../models/User');
const Bed = require('../models/Bed');
const Appointment = require('../models/Appointment');

// POST /api/billing
const createBill = async (req, res) => {
  try {
    const { patient, appointment, items } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const bill = await Bill.create({ patient, appointment, items, totalAmount });
    await bill.populate('patient', 'name email');
    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing
const getBills = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    const bills = await Bill.find(filter).populate('patient', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/billing/:id/pay
const markAsPaid = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidAt: new Date(), paymentMethod: paymentMethod || 'cash' },
      { new: true }
    ).populate('patient', 'name email');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing/stats (admin)
const getBillingStats = async (req, res) => {
  try {
    const totalRevenue = await Bill.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const pendingBills = await Bill.countDocuments({ isPaid: false });
    res.json({ success: true, data: { totalRevenue: totalRevenue[0]?.total || 0, pendingBills } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBill, getBills, markAsPaid, getBillingStats };
