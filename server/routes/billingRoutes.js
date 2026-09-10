const express = require('express');
const router = express.Router();
const { createBill, getBills, markAsPaid, getBillingStats } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'receptionist'), createBill);
router.get('/', protect, getBills);
router.get('/stats', protect, authorize('admin'), getBillingStats);
router.patch('/:id/pay', protect, authorize('admin', 'receptionist', 'patient'), markAsPaid);

module.exports = router;
