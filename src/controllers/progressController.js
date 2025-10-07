const Progress = require('../models/Progress');
const User = require('../models/User');

// Save progress
const saveProgress = async (req, res) => {
  try {
    const { simulationId, simulationName, timeSpent, parameters, results, score } = req.body;
    const userId = req.user._id;

    const progressData = new Progress({
      userId,
      simulationId,
      simulationName,
      timeSpent: timeSpent || 0,
      parameters: parameters || {},
      results: results || {},
      score: score || 0
    });

    await progressData.save();

    res.status(201).json({
      message: 'Progress saved successfully',
      progress: progressData
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ message: 'Failed to save progress' });
  }
};

// Get user progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { simulationId } = req.query;

    let query = { userId };
    if (simulationId) {
      query.simulationId = simulationId;
    }

    const progress = await Progress.find(query)
      .sort({ completedAt: -1 })
      .limit(50); // Limit to last 50 entries

    res.json({
      progress,
      count: progress.length
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to get progress' });
  }
};

// Get progress statistics
const getProgressStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall statistics
    const overallStats = await Progress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalExperiments: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          completedSimulations: { $addToSet: '$simulationId' }
        }
      }
    ]);

    // Get statistics by simulation
    const simulationStats = await Progress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$simulationId',
          simulationName: { $first: '$simulationName' },
          attempts: { $sum: 1 },
          totalTime: { $sum: '$timeSpent' },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          lastAttempt: { $max: '$completedAt' }
        }
      },
      { $sort: { lastAttempt: -1 } }
    ]);

    // Calculate weekly progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyStats = await Progress.aggregate([
      { 
        $match: { 
          userId: userId,
          completedAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: null,
          experimentsThisWeek: { $sum: 1 },
          timeThisWeek: { $sum: '$timeSpent' }
        }
      }
    ]);

    const overall = overallStats[0] || {
      totalExperiments: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      bestScore: 0,
      completedSimulations: []
    };

    const weekly = weeklyStats[0] || {
      experimentsThisWeek: 0,
      timeThisWeek: 0
    };

    // Calculate achievement level
    let achievementLevel = 'Beginner Explorer';
    if (overall.totalExperiments >= 5) achievementLevel = 'Physics Student';
    if (overall.totalExperiments >= 15) achievementLevel = 'Lab Assistant';
    if (overall.totalExperiments >= 30) achievementLevel = 'Physics Expert';
    if (overall.totalExperiments >= 50) achievementLevel = 'Master Physicist';

    res.json({
      overall: {
        experimentsCompleted: `${overall.completedSimulations.length}/3`,
        totalExperiments: overall.totalExperiments,
        studyTime: Math.round(overall.totalTimeSpent / 3600 * 10) / 10, // Convert to hours
        achievementLevel,
        averageScore: Math.round(overall.averageScore || 0),
        bestScore: Math.round(overall.bestScore || 0)
      },
      weekly: {
        experimentsThisWeek: weekly.experimentsThisWeek,
        studyTimeThisWeek: Math.round(weekly.timeThisWeek / 3600 * 10) / 10
      },
      bySimulation: simulationStats
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Failed to get progress statistics' });
  }
};

// Delete progress entry
const deleteProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.findOneAndDelete({
      _id: progressId,
      userId: userId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json({ message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ message: 'Failed to delete progress' });
  }
};

module.exports = {
  saveProgress,
  getUserProgress,
  getProgressStats,
  deleteProgress
};