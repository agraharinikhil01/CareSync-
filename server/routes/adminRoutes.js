const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  getAllPatients,
  getAllStaff,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Role authorization
router.use(protect);

router.get('/patients', authorize('admin', 'receptionist'), getAllPatients);
router.get('/doctors', authorize('admin', 'receptionist'), getAllDoctors);

// Admin-only routes
router.use(authorize('admin'));
router.get('/stats', getDashboardStats);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.get('/staff', getAllStaff);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
