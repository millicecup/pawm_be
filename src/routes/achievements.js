const express = require('express');
const router = express.Router();
const {
  getUserAchievements,
  getLeaderboard,
  awardAchievement
} = require('../controllers/achievementController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get user achievements
router.get('/', authenticateToken, getUserAchievements);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Award achievement (admin only)
router.post('/award', authenticateToken, authorizeRoles('admin'), awardAchievement);

module.exports = router;