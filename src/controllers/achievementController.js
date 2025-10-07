const Achievement = require('../models/Achievement');

// Get user achievements
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const achievements = await Achievement.find({ userId })
      .sort({ unlockedAt: -1 });

    // Calculate total points
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

    // Group by rarity
    const byRarity = achievements.reduce((acc, achievement) => {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      return acc;
    }, {});

    res.json({
      achievements,
      stats: {
        total: achievements.length,
        totalPoints,
        byRarity
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Failed to get achievements' });
  }
};

// Get achievement leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    let pipeline;

    if (type === 'points') {
      pipeline = [
        {
          $group: {
            _id: '$userId',
            totalPoints: { $sum: '$points' },
            achievementCount: { $sum: 1 },
            latestAchievement: { $max: '$unlockedAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            avatar: '$user.avatar',
            totalPoints: 1,
            achievementCount: 1,
            latestAchievement: 1
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: parseInt(limit) }
      ];
    } else if (type === 'achievements') {
      pipeline = [
        {
          $group: {
            _id: '$userId',
            achievementCount: { $sum: 1 },
            totalPoints: { $sum: '$points' },
            latestAchievement: { $max: '$unlockedAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            avatar: '$user.avatar',
            achievementCount: 1,
            totalPoints: 1,
            latestAchievement: 1
          }
        },
        { $sort: { achievementCount: -1, totalPoints: -1 } },
        { $limit: parseInt(limit) }
      ];
    }

    const leaderboard = await Achievement.aggregate(pipeline);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
};

// Manually award achievement (admin only)
const awardAchievement = async (req, res) => {
  try {
    const { userId, type, title, description, icon, points, rarity } = req.body;

    // Check if achievement already exists
    const existing = await Achievement.findOne({ userId, type });
    if (existing) {
      return res.status(400).json({ message: 'Achievement already awarded' });
    }

    const achievement = new Achievement({
      userId,
      type,
      title,
      description,
      icon,
      points: points || 0,
      rarity: rarity || 'common'
    });

    await achievement.save();

    res.status(201).json({
      message: 'Achievement awarded successfully',
      achievement
    });
  } catch (error) {
    console.error('Award achievement error:', error);
    res.status(500).json({ message: 'Failed to award achievement' });
  }
};

module.exports = {
  getUserAchievements,
  getLeaderboard,
  awardAchievement
};