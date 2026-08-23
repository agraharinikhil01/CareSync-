const express = require('express');
const router = express.Router();
const {
  getBeds,
  createBed,
  allocateBed,
  releaseBed,
  deleteBed,
} = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBeds);
router.post('/', authorize('admin'), createBed);
router.patch('/:id/allocate', authorize('receptionist', 'admin', 'doctor', 'patient'), allocateBed);
router.patch('/:id/release', authorize('receptionist', 'admin', 'doctor', 'patient'), releaseBed);
router.delete('/:id', authorize('admin'), deleteBed);

module.exports = router;
