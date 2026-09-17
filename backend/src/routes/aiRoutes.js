const express = require('express');
const router = express.Router();
const { chatWithAI, analyzePrescriptionOCR } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAI);
router.post('/analyze-prescription', protect, analyzePrescriptionOCR);

module.exports = router;
