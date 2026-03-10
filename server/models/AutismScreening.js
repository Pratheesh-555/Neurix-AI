const mongoose = require('mongoose');

const autismScreeningSchema = new mongoose.Schema({
  childId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  bcbaId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },

  // 20 binary answers: 0 = no concern, 1 = concern flagged
  answers: {
    type:     [Number],
    validate: { validator: v => v.length === 20, message: 'Exactly 20 answers required' },
  },

  totalScore: { type: Number, required: true },
  riskLevel:  { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'], required: true },

  // Snapshot of session behavioral metrics at time of screening
  sessionSnapshot: {
    totalSessions:      Number,
    avgEngagementScore: Number,
    resistanceRate:     Number,
    pivotRate:          Number,
  },

  llmInterpretation: String,
  mlProbability:     Number,   // ASD probability from trained classifier (0-1)
  mlBased:           { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AutismScreening', autismScreeningSchema);
