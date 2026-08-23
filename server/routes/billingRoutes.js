const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updatePaymentStatus,
  getPublicInvoice,
  payPublicInvoice,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Mobile QR Checkout Routes (For phone scans)
router.get('/public/:id', getPublicInvoice);
router.post('/public/:id/pay', payPublicInvoice);

router.use(protect);

router.post('/', authorize('receptionist', 'admin'), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.patch('/:id/pay', updatePaymentStatus);

module.exports = router;
