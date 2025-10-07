const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  simulationId: {
    type: String,
    required: true,
    unique: true,
    enum: ['pendulum', 'circuit', 'cannonball']
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  parameters: [{
    name: String,
    type: String, // 'slider', 'input', 'select'
    min: Number,
    max: Number,
    default: Number,
    unit: String,
    description: String
  }],
  learningObjectives: [String],
  prerequisites: [String],
  materials: [{
    title: String,
    url: String,
    type: String // 'video', 'article', 'worksheet'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Simulation = mongoose.model('Simulation', simulationSchema);

module.exports = Simulation;