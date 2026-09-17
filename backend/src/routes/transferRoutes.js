const express = require('express');
const router = express.Router();
const { getTransfers, createTransfer, updateTransferStatus } = require('../controllers/transferController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTransfers);
router.post('/', protect, authorize('ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'), createTransfer);
router.patch('/:id', protect, authorize('ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateTransferStatus);

module.exports = router;
