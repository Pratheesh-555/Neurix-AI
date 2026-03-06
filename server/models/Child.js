const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  bcbaId:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:                 { type: String, required: true },
  age:                  { type: Number, required: true, min: 2, max: 18 },
  diagnosisLevel:       { type: String, enum: ['Level 1 - Mild', 'Level 2 - Moderate', 'Level 3 - Severe'], required: true },
  communicationLevel:   { type: String, enum: ['Non-verbal', 'Emerging Verbal', 'Functional Verbal', 'Conversational'], required: true },
  interests:            [String],
  obsessionIntensity:   { type: String, enum: ['Mild', 'Moderate', 'Intense'] },
  sensoryProfile: {
    hypersensitive:     [String],
    hyposensitive:      [String],
    seeksBehaviors:     [String]
  },
  behavioralChallenges: [String],
  learningStyle:        { type: String, enum: ['Visual', 'Auditory', 'Kinesthetic', 'Mixed'] },
  currentSkills:        [String],
  targetGoals:          [String],
  previousTherapyMonths:{ type: Number, default: 0 },
  chromaEmbeddingId:    String,
  createdAt:            { type: Date, default: Date.now },
  updatedAt:            { type: Date, default: Date.now }
});

module.exports = mongoose.model('Child', childSchema);
