const express = require('express');
const router = express.Router();
const {
  getNearbyHospitals,
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  getHospitalBeds,
  updateHospitalBeds,
  getHospitalDepartments,
  createHospitalDepartment,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Discovery & Listing
router.get('/nearby', getNearbyHospitals);
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Public / Authenticated Hospital Registration
router.post('/', (req, res, next) => {
  // Allow registration anonymously or if logged in
  if (req.headers.authorization) {
    return protect(req, res, () => createHospital(req, res, next));
  }
  createHospital(req, res, next);
});

// Protected Hospital Management
router.patch('/:id', protect, authorize('ADMIN', 'HOSPITAL_ADMIN'), updateHospital);

// Beds
router.get('/:id/beds', getHospitalBeds);
router.patch('/:id/beds', protect, authorize('ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), updateHospitalBeds);

// Departments
router.get('/:id/departments', getHospitalDepartments);
router.post('/:id/departments', protect, authorize('ADMIN', 'HOSPITAL_ADMIN'), createHospitalDepartment);

module.exports = router;
