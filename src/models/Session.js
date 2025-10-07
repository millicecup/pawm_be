const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
  sessionId: {
    type: String,
    required: true,
    unique: true  // This already creates an index, no need to add it again below
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  snapshots: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    parameters: mongoose.Schema.Types.Mixed,
    results: mongoose.Schema.Types.Mixed,
    userAction: String
  }],
  finalResults: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  totalDuration: {
    type: Number, // in seconds
    default: 0
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  deviceInfo: {
    userAgent: String,
    screen: {
      width: Number,
      height: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound index for common queries
sessionSchema.index({ userId: 1, simulationId: 1, isActive: 1 });

// REMOVED: sessionSchema.index({ sessionId: 1 }); 
// ↑ This line was creating a duplicate because 'unique: true' above already creates this index

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;