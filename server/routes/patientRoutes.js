const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboard,
  addMedicalRecord,
  getEmergencyProfile,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Emergency QR Profile Route (No authentication needed for paramedics/bystanders)
router.get('/emergency/:patientId', getEmergencyProfile);

router.use(protect);

router.get('/profile', getPatientProfile);
router.put('/profile', authorize('patient'), updatePatientProfile);
router.get('/dashboard', authorize('patient'), getPatientDashboard);
router.post('/:id/medical-records', authorize('doctor', 'admin'), addMedicalRecord);

module.exports = router;
