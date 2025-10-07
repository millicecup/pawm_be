const User = require('../models/User');
const Progress = require('../models/Progress');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get progress statistics
    const progressStats = await Progress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalExperiments: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' },
          averageScore: { $avg: '$score' },
          completedSimulations: { $addToSet: '$simulationId' }
        }
      }
    ]);

    const stats = progressStats[0] || {
      totalExperiments: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      completedSimulations: []
    };

    // Calculate achievement level
    let achievementLevel = 'Beginner';
    if (stats.totalExperiments >= 10) achievementLevel = 'Intermediate';
    if (stats.totalExperiments >= 25) achievementLevel = 'Advanced';
    if (stats.totalExperiments >= 50) achievementLevel = 'Expert';

    res.json({
      stats: {
        experimentsCompleted: `${stats.completedSimulations.length}/3`,
        totalExperiments: stats.totalExperiments,
        studyTime: Math.round(stats.totalTimeSpent / 3600 * 10) / 10, // Convert to hours
        achievementLevel,
        averageScore: Math.round(stats.averageScore || 0),
        completedSimulations: stats.completedSimulations
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user statistics' });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's progress
    await Progress.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  deleteAccount
};