const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard-stats', getAdminDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
