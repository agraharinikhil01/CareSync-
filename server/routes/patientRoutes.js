const express = require('express');
const router = express.Router();
const { getAllPatients, getMyProfile, updateMyProfile, getMyAppointments, getMyPrescriptions, getMyBills } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'receptionist', 'doctor'), getAllPatients);
router.get('/my-profile', protect, authorize('patient'), getMyProfile);
router.patch('/my-profile', protect, authorize('patient'), updateMyProfile);
router.get('/my-appointments', protect, authorize('patient'), getMyAppointments);
router.get('/my-prescriptions', protect, authorize('patient'), getMyPrescriptions);
router.get('/my-bills', protect, authorize('patient'), getMyBills);

module.exports = router;
