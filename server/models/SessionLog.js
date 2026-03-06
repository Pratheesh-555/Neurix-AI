const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
  programId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  childId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  bcbaId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionDate: { type: Date, default: Date.now },
  activityLogs: [{
    activityId:     String,
    result:         { type: String, enum: ['engaged', 'resistant', 'pivoted'] },
    timestamp:      Date,
    pivotTriggered: Boolean
  }],
  overallEngagementScore: Number,
  notes: String
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);
