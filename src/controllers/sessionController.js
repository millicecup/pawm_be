const Session = require('../models/Session');
const Achievement = require('../models/Achievement');
const { v4: uuidv4 } = require('uuid');

// Start a new simulation session
const startSession = async (req, res) => {
  try {
    const { simulationId, deviceInfo } = req.body;
    const userId = req.user._id;

    // End any existing active sessions for this user and simulation
    await Session.updateMany(
      { userId, simulationId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    // Create new session
    const session = new Session({
      userId,
      simulationId,
      sessionId: uuidv4(),
      deviceInfo: deviceInfo || {},
      startTime: new Date(),
      isActive: true
    });

    await session.save();

    res.status(201).json({
      message: 'Session started successfully',
      sessionId: session.sessionId,
      session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Failed to start session' });
  }
};

// Add snapshot to session
const addSnapshot = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { parameters, results, userAction } = req.body;
    const userId = req.user._id;

    const session = await Session.findOne({ 
      sessionId, 
      userId, 
      isActive: true 
    });

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    session.snapshots.push({
      parameters: parameters || {},
      results: results || {},
      userAction: userAction || 'parameter_change'
    });

    session.interactionCount += 1;
    await session.save();

    res.json({
      message: 'Snapshot added successfully',
      snapshotCount: session.snapshots.length
    });
  } catch (error) {
    console.error('Add snapshot error:', error);
    res.status(500).json({ message: 'Failed to add snapshot' });
  }
};

// End session and save final results
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { finalResults, finalParameters } = req.body;
    const userId = req.user._id;

    const session = await Session.findOne({ 
      sessionId, 
      userId, 
      isActive: true 
    });

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    const endTime = new Date();
    const totalDuration = Math.floor((endTime - session.startTime) / 1000); // seconds

    session.endTime = endTime;
    session.totalDuration = totalDuration;
    session.finalResults = finalResults || {};
    session.parameters = finalParameters || {};
    session.isActive = false;

    await session.save();

    // Check for achievements
    await checkAndAwardAchievements(userId, session);

    res.json({
      message: 'Session ended successfully',
      duration: totalDuration,
      interactions: session.interactionCount
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Failed to end session' });
  }
};

// Get user sessions
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { simulationId, limit = 20, page = 1 } = req.query;

    let query = { userId };
    if (simulationId) {
      query.simulationId = simulationId;
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Failed to get sessions' });
  }
};

// Get detailed session analytics
const getSessionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$simulationId',
          totalSessions: { $sum: 1 },
          totalTime: { $sum: '$totalDuration' },
          avgTime: { $avg: '$totalDuration' },
          totalInteractions: { $sum: '$interactionCount' },
          avgInteractions: { $avg: '$interactionCount' },
          lastSession: { $max: '$startTime' }
        }
      },
      { $sort: { lastSession: -1 } }
    ]);

    // Overall statistics
    const overallStats = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalStudyTime: { $sum: '$totalDuration' },
          totalInteractions: { $sum: '$interactionCount' },
          avgSessionTime: { $avg: '$totalDuration' },
          uniqueSimulations: { $addToSet: '$simulationId' }
        }
      }
    ]);

    res.json({
      bySimulation: analytics,
      overall: overallStats[0] || {
        totalSessions: 0,
        totalStudyTime: 0,
        totalInteractions: 0,
        avgSessionTime: 0,
        uniqueSimulations: []
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
};

// Achievement checking logic
const checkAndAwardAchievements = async (userId, session) => {
  try {
    const existingAchievements = await Achievement.find({ userId });
    const achievementTypes = existingAchievements.map(a => a.type);

    // First simulation achievement
    if (!achievementTypes.includes('first_simulation')) {
      await Achievement.create({
        userId,
        type: 'first_simulation',
        title: 'First Steps',
        description: 'Completed your first physics simulation!',
        icon: '🎯',
        points: 100,
        rarity: 'common'
      });
    }

    // Time milestone achievements
    const userSessions = await Session.find({ userId });
    const totalTime = userSessions.reduce((sum, s) => sum + s.totalDuration, 0);
    
    if (totalTime >= 3600 && !achievementTypes.includes('time_milestone')) { // 1 hour
      await Achievement.create({
        userId,
        type: 'time_milestone',
        title: 'Dedicated Student',
        description: 'Spent over 1 hour learning physics!',
        icon: '⏰',
        points: 250,
        rarity: 'uncommon'
      });
    }

    // Interaction achievements
    if (session.interactionCount >= 50 && !achievementTypes.includes('explorer')) {
      await Achievement.create({
        userId,
        type: 'explorer',
        title: 'Curious Explorer',
        description: 'Made 50+ interactions in a single session!',
        icon: '🔍',
        points: 200,
        rarity: 'uncommon'
      });
    }
  } catch (error) {
    console.error('Achievement check error:', error);
  }
};

module.exports = {
  startSession,
  addSnapshot,
  endSession,
  getUserSessions,
  getSessionAnalytics
};