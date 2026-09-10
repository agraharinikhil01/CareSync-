const express = require('express');
const router = express.Router();
const { getBeds, admitPatient, dischargePatient } = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getBeds);
router.patch('/:id/admit', protect, authorize('receptionist', 'admin'), admitPatient);
router.patch('/:id/discharge', protect, authorize('receptionist', 'admin'), dischargePatient);

module.exports = router;
