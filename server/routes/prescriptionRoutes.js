const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptions, verifyPrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/', protect, getPrescriptions);
router.get('/verify/:hash', verifyPrescription); // public route

module.exports = router;
