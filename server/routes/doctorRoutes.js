const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorPatients,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes for patient doctor search
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Doctor protected routes
router.get('/dashboard/metrics', protect, authorize('doctor'), getDoctorDashboard);
router.get('/dashboard/appointments', protect, authorize('doctor'), getDoctorAppointments);
router.get('/dashboard/patients', protect, authorize('doctor'), getDoctorPatients);

module.exports = router;
