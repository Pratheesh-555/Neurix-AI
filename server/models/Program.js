const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id:                    String,
  name:                  String,
  theme:                 String,
  objective:             String,
  instructions:          String,
  duration:              Number,
  difficulty:            { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  successMetric:         String,
  gamificationElement:   String,
  reinforcementStrategy: String,
  sensoryConsiderations: String,
  resistanceCount:       { type: Number, default: 0 },
  pivotActivity:         mongoose.Schema.Types.Mixed
});

const programSchema = new mongoose.Schema({
  childId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  bcbaId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  jobId:            String,
  status:           { type: String, enum: ['queued','predicting','retrieving','generating','completed','failed'], default: 'queued' },
  generationTimeMs: Number,
  costInr:          { type: Number, default: 0.124 },

  mlPrediction: {
    successProbability: Number,
    shapValues:         mongoose.Schema.Types.Mixed,
    topFeatures:        [String],
    confidenceLevel:    String,
    decayPrediction: {
      estimatedPlateauWeek:  Number,
      recommendedSwitchDate: Date,
      decayReason:           String
    }
  },

  similarProfiles: [{
    childId:             String,
    similarityScore:     Number,
    effectiveApproaches: [String],
    interestOverlap:     [String]
  }],

  digitalTwin: {
    conditionedOn:     String,
    projectedOutcomes: [{
      metric:             String,
      currentBaseline:    String,
      projectedAt3Months: String,
      projectedAt6Months: String
    }]
  },

  program: {
    summary:              String,
    goals:                [String],
    activities:           [activitySchema],
    weeklySchedule:       mongoose.Schema.Types.Mixed,
    parentHomeActivities: mongoose.Schema.Types.Mixed,
    therapistScript:      String,
    dataTrackingPlan:     String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Program', programSchema);
