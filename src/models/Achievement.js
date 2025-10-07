const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'first_simulation',
      'time_milestone',
      'accuracy_expert',
      'explorer',
      'scientist',
      'completionist',
      'speed_runner',
      'precision_master',
      'dedicated_learner',
      'physics_master'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, unlockedAt: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;