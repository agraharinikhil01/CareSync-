const express = require('express');
const router = express.Router();
const { handleAIChat, getAISuggestions } = require('../controllers/aiController');

// Public AI Assistant Endpoints (Available to all logged-in and public users)
router.post('/chat', handleAIChat);
router.get('/suggestions', getAISuggestions);

module.exports = router;
