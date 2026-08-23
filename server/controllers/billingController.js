const Billing = require('../models/Billing');
const User = require('../models/User');

// @desc    Create manual billing invoice
// @route   POST /api/billing
// @access  Private (Receptionist, Admin)
const createInvoice = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentId, items, discountAmount, paymentStatus, paymentMethod, notes } = req.body;

    if (!patientId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify patient and at least one bill item' });
    }

    const subTotal = items.reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
    const taxAmount = Math.round(subTotal * 0.05); // 5% standard hospital service tax
    const discount = Number(discountAmount || 0);
    const totalAmount = Math.max(0, subTotal + taxAmount - discount);

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const billing = await Billing.create({
      invoiceNumber,
      patientId,
      doctorId: doctorId || null,
      appointmentId: appointmentId || null,
      items: items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        amount: Number(item.quantity || 1) * Number(item.unitPrice || 0),
      })),
      subTotal,
      taxAmount,
      discountAmount: discount,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      paymentMethod: paymentMethod || 'Pending Selection',
      invoiceDate: new Date(),
      notes: notes || '',
    });

    const populatedBilling = await Billing.findById(billing._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedBilling,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invoices (Role filtered)
// @route   GET /api/billing
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    let query = {};
    const { paymentStatus } = req.query;

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Billing.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email')
      .populate('appointmentId')
      .sort({ invoiceDate: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email')
      .populate('appointmentId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Role check for patients
    if (req.user.role === 'patient' && invoice.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice payment status
// @route   PATCH /api/billing/:id/pay
// @access  Private (Receptionist, Admin, Patient)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId, paymentStatus } = req.body;
    const invoice = await Billing.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.paymentStatus = paymentStatus || 'Paid';
    invoice.paymentMethod = paymentMethod || 'UPI/Online';
    invoice.transactionId = transactionId || `TXN-${Date.now()}`;

    await invoice.save();

    const updated = await Billing.findById(invoice._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Public Invoice for Mobile QR Scan Checkout
// @route   GET /api/billing/public/:id
// @access  Public
const getPublicInvoice = async (req, res, next) => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Hospital Invoice not found' });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Public Mobile Payment from QR Scan
// @route   POST /api/billing/public/:id/pay
// @access  Public
const payPublicInvoice = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const invoice = await Billing.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.paymentStatus = 'Paid';
    invoice.paymentMethod = paymentMethod || 'Mobile UPI Checkout';
    invoice.transactionId = transactionId || `TXN-MOB-${Date.now().toString().slice(-8)}`;

    await invoice.save();

    const updated = await Billing.findById(invoice._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Mobile payment processed successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updatePaymentStatus,
  getPublicInvoice,
  payPublicInvoice,
};

