const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  checkDrugSafety,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-safety', checkDrugSafety);
router.post('/', authorize('doctor'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);

module.exports = router;
