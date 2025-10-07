const express = require('express');
const router = express.Router();
const { 
  saveProgress, 
  getUserProgress, 
  getProgressStats,
  deleteProgress 
} = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, progressSchema } = require('../middleware/validation');

// Save progress (protected)
router.post('/', authenticateToken, validateRequest(progressSchema), saveProgress);

// Get user progress (protected)
router.get('/', authenticateToken, getUserProgress);

// Get progress statistics (protected)
router.get('/stats', authenticateToken, getProgressStats);

// Delete specific progress entry (protected)
router.delete('/:progressId', authenticateToken, deleteProgress);

module.exports = router;