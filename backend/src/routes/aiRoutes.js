const express = require('express');
const router = express.Router();
const { chatWithAI, analyzePrescriptionOCR } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/chat', optionalAuth, chatWithAI);
router.post('/analyze-prescription', optionalAuth, analyzePrescriptionOCR);

module.exports = router;
