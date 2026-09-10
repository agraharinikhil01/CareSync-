const Bill = require('../models/Bill');
const { generateInvoicePDF } = require('../services/pdfService');

// POST /api/bills (Admin or Receptionist)
const createBill = async (req, res) => {
  try {
    const { patient, appointment, bed, appointmentCharge, bedCharge, otherServices, discount, tax, paymentMethod } = req.body;

    if (!patient) return res.status(400).json({ success: false, message: 'Patient is required' });

    const apptCharge = Number(appointmentCharge) || 0;
    const bCharge = Number(bedCharge) || 0;
    const disc = Number(discount) || 0;
    const tx = Number(tax) || 0;

    const services = Array.isArray(otherServices) ? otherServices : [];
    const servicesTotal = services.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    const subtotal = apptCharge + bCharge + servicesTotal;
    const totalAmount = Math.max(0, subtotal - disc + tx);

    const bill = await Bill.create({
      patient,
      appointment: appointment || null,
      bed: bed || null,
      appointmentCharge: apptCharge,
      bedCharge: bCharge,
      otherServices: services,
      discount: disc,
      tax: tx,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'UNPAID',
    });

    await bill.populate(['patient', 'appointment', 'bed']);
    res.status(201).json({ success: true, message: 'Hospital bill generated', data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bills
const getBills = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'PATIENT') filter.patient = req.user._id;

    const bills = await Bill.find(filter)
      .populate('patient', 'name email phone')
      .populate('appointment')
      .populate('bed', 'bedNumber floor')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bills/:id
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('appointment')
      .populate('bed', 'bedNumber floor');

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    if (req.user.role === 'PATIENT' && bill.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bills/:id/pay
const markBillPaid = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.paymentStatus = 'PAID';
    bill.paidAt = new Date();
    if (req.body.paymentMethod) bill.paymentMethod = req.body.paymentMethod;

    await bill.save();
    res.json({ success: true, message: 'Bill payment recorded successfully', data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bills/:id/pdf (Download invoice)
const downloadInvoicePDF = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('patient', 'name email phone');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    generateInvoicePDF(bill, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bills/stats/revenue (Admin only)
const getRevenueStats = async (req, res) => {
  try {
    const [paidBills, unpaidBills] = await Promise.all([
      Bill.find({ paymentStatus: 'PAID' }),
      Bill.find({ paymentStatus: 'UNPAID' }),
    ]);

    const paidRevenue = paidBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const pendingRevenue = unpaidBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue: paidRevenue + pendingRevenue,
        paidRevenue,
        pendingRevenue,
        totalBillsCount: paidBills.length + unpaidBills.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  markBillPaid,
  downloadInvoicePDF,
  getRevenueStats,
};
