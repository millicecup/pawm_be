const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulationId: {
    type: String,
    required: true,
    enum: ['pendulum', 'circuit', 'cannonball']
  },
  simulationName: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  experimentsCompleted: {
    type: Number,
    default: 1
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed, // Store simulation parameters
    default: {}
  },
  results: {
    type: mongoose.Schema.Types.Mixed, // Store simulation results
    default: {}
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure unique progress per user per simulation session
progressSchema.index({ userId: 1, simulationId: 1, completedAt: 1 });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;