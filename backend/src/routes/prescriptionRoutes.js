const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPDF,
  verifyPrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public verification route
router.get('/verify/:hash', verifyPrescription);

router.use(protect);

router.post('/', authorize('DOCTOR', 'ADMIN'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.get('/:id/pdf', downloadPrescriptionPDF);

module.exports = router;
