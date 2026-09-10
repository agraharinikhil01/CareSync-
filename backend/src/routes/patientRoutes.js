const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/me/profile', authorize('PATIENT'), getMyPatientProfile);
router.get('/', authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getPatients);
router.post('/', authorize('ADMIN'), createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', authorize('ADMIN'), deletePatient);

module.exports = router;
