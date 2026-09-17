const express = require('express');
const router = express.Router();
const { createEmergencyRequest, getEmergencyRequests, updateEmergencyStatus } = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => createEmergencyRequest(req, res, next));
  }
  createEmergencyRequest(req, res, next);
});

router.get('/', protect, getEmergencyRequests);
router.patch('/:id', protect, authorize('ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateEmergencyStatus);

module.exports = router;
