const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
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
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  objective: {
    type: String,
    required: true
  },
  hypothesis: {
    type: String
  },
  methodology: {
    type: String
  },
  experiments: [{
    name: String,
    parameters: mongoose.Schema.Types.Mixed,
    results: mongoose.Schema.Types.Mixed,
    observations: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  dataAnalysis: {
    graphs: [{
      type: String, // 'line', 'scatter', 'bar'
      title: String,
      xAxis: String,
      yAxis: String,
      data: mongoose.Schema.Types.Mixed
    }],
    calculations: mongoose.Schema.Types.Mixed,
    observations: String
  },
  conclusion: {
    type: String
  },
  reflection: {
    type: String
  },
  references: [String],
  status: {
    type: String,
    enum: ['draft', 'completed', 'reviewed', 'approved'],
    default: 'draft'
  },
  grade: {
    score: Number,
    feedback: String,
    gradedBy: String,
    gradedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

labReportSchema.index({ userId: 1, simulationId: 1 });
labReportSchema.index({ reportId: 1 });
labReportSchema.index({ status: 1 });

const LabReport = mongoose.model('LabReport', labReportSchema);

module.exports = LabReport;