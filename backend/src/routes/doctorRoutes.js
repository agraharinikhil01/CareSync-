const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorDashboardStats,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getDoctors);

router.use(protect);

router.get('/me/profile', authorize('DOCTOR'), getMyDoctorProfile);
router.get('/me/dashboard-stats', authorize('DOCTOR'), getDoctorDashboardStats);
router.post('/', authorize('ADMIN'), createDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctor);
router.delete('/:id', authorize('ADMIN'), deleteDoctor);

module.exports = router;
