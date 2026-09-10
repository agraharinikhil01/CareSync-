const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, getMyProfile, updateMyProfile, getMyAppointments, getMyPrescriptions } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllDoctors);
router.get('/my-profile', protect, authorize('doctor'), getMyProfile);
router.patch('/my-profile', protect, authorize('doctor'), updateMyProfile);
router.get('/my-appointments', protect, authorize('doctor'), getMyAppointments);
router.get('/my-prescriptions', protect, authorize('doctor'), getMyPrescriptions);
router.get('/:id', protect, getDoctorById);

module.exports = router;
