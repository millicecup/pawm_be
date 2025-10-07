const express = require('express');
const router = express.Router();
const {
  startSession,
  addSnapshot,
  endSession,
  getUserSessions,
  getSessionAnalytics
} = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

// Start new session
router.post('/start', authenticateToken, startSession);

// Add snapshot to session
router.post('/:sessionId/snapshot', authenticateToken, addSnapshot);

// End session
router.post('/:sessionId/end', authenticateToken, endSession);

// Get user sessions
router.get('/', authenticateToken, getUserSessions);

// Get session analytics
router.get('/analytics', authenticateToken, getSessionAnalytics);

module.exports = router;