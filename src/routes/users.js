const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getUserStats,
  deleteAccount 
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, updateUserSchema } = require('../middleware/validation');

// Get user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// Update user profile (protected)
router.put('/profile', authenticateToken, validateRequest(updateUserSchema), updateProfile);

// Get user statistics (protected)
router.get('/stats', authenticateToken, getUserStats);

// Delete user account (protected)
router.delete('/account', authenticateToken, deleteAccount);

module.exports = router;