const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('patient', 'receptionist'), createAppointment);
router.get('/', protect, getAppointments);
router.patch('/:id/status', protect, authorize('doctor', 'receptionist', 'admin'), updateAppointmentStatus);
router.delete('/:id', protect, authorize('admin', 'receptionist'), deleteAppointment);

module.exports = router;
