const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  markBillPaid,
  downloadInvoicePDF,
  getRevenueStats,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('RECEPTIONIST', 'ADMIN'), createBill);
router.get('/', getBills);
router.get('/stats/revenue', authorize('ADMIN'), getRevenueStats);
router.get('/:id', getBillById);
router.patch('/:id/pay', markBillPaid);
router.get('/:id/pdf', downloadInvoicePDF);

module.exports = router;
