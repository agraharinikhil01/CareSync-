const Bill = require('../models/Bill');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../services/pdfService');

// POST /api/bills (Admin or Receptionist)
const createBill = async (req, res) => {
  try {
    const {
      patient,
      appointment,
      bed,
      appointmentCharge,
      bedCharge,
      otherServices,
      items,
      discount,
      tax,
      paymentMethod,
    } = req.body;

    if (!patient) return res.status(400).json({ success: false, message: 'Patient is required' });

    // Normalize patient ID (whether User ID or Patient Doc ID)
    let patientUserId = patient;
    const patientDoc = await Patient.findById(patient);
    if (patientDoc && patientDoc.user) {
      patientUserId = patientDoc.user;
    }

    const apptCharge = Number(appointmentCharge) || 0;
    const bCharge = Number(bedCharge) || 0;
    const disc = Number(discount) || 0;
    const tx = Number(tax) || 0;

    // Harmonize items and otherServices
    let normalizedServices = [];
    let normalizedItems = [];

    if (Array.isArray(items) && items.length > 0) {
      normalizedItems = items.map((i) => ({
        description: i.description || i.name || 'Hospital Service',
        amount: Number(i.amount) || 0,
      }));
      normalizedServices = normalizedItems.map((i) => ({
        name: i.description,
        amount: i.amount,
      }));
    } else if (Array.isArray(otherServices) && otherServices.length > 0) {
      normalizedServices = otherServices.map((s) => ({
        name: s.name || s.description || 'Hospital Service',
        amount: Number(s.amount) || 0,
      }));
      normalizedItems = normalizedServices.map((s) => ({
        description: s.name,
        amount: s.amount,
      }));
    }

    const servicesTotal = normalizedServices.reduce((acc, s) => acc + s.amount, 0);
    const subtotal = apptCharge + bCharge + servicesTotal;
    const totalAmount = Math.max(0, subtotal - disc + tx);

    const bill = new Bill({
      patient: patientUserId,
      appointment: appointment || null,
      bed: bed || null,
      appointmentCharge: apptCharge,
      bedCharge: bCharge,
      otherServices: normalizedServices,
      items: normalizedItems,
      discount: disc,
      tax: tx,
      totalAmount,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: 'PENDING',
    });

    bill.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await bill.save();

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

    if (req.query.status && req.query.status !== 'ALL') {
      const st = req.query.status.toUpperCase();
      if (st === 'PENDING' || st === 'UNPAID') {
        filter.paymentStatus = { $in: ['PENDING', 'UNPAID'] };
      } else {
        filter.paymentStatus = st;
      }
    }

    const rawBills = await Bill.find(filter)
      .populate('patient', 'name email phone')
      .populate('appointment')
      .populate('bed', 'bedNumber floor')
      .sort({ createdAt: -1 });

    const bills = rawBills.map((b) => {
      const obj = b.toObject();
      if (!obj.invoiceNumber) {
        obj.invoiceNumber = `INV-${obj._id.toString().slice(-6).toUpperCase()}`;
      }
      if ((!obj.items || obj.items.length === 0) && obj.otherServices && obj.otherServices.length > 0) {
        obj.items = obj.otherServices.map((s) => ({ description: s.name, amount: s.amount }));
      }
      if (obj.paymentStatus === 'UNPAID') {
        obj.paymentStatus = 'PENDING';
      }
      return obj;
    });

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

    const obj = bill.toObject();
    if (!obj.invoiceNumber) {
      obj.invoiceNumber = `INV-${obj._id.toString().slice(-6).toUpperCase()}`;
    }
    if ((!obj.items || obj.items.length === 0) && obj.otherServices && obj.otherServices.length > 0) {
      obj.items = obj.otherServices.map((s) => ({ description: s.name, amount: s.amount }));
    }

    res.json({ success: true, data: obj });
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
      Bill.find({ paymentStatus: { $in: ['PENDING', 'UNPAID'] } }),
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
