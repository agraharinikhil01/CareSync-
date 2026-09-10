const express = require('express');
const router = express.Router();
const {
  getBeds,
  getBedStats,
  assignBed,
  transferBed,
  dischargeBed,
  toggleMaintenance,
} = require('../controllers/bedController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getBeds);
router.get('/stats', getBedStats);
router.post('/:id/assign', authorize('RECEPTIONIST', 'ADMIN'), assignBed);
router.post('/:id/transfer', authorize('RECEPTIONIST', 'ADMIN'), transferBed);
router.post('/:id/discharge', authorize('RECEPTIONIST', 'ADMIN'), dischargeBed);
router.patch('/:id/maintenance', authorize('RECEPTIONIST', 'ADMIN'), toggleMaintenance);

module.exports = router;
