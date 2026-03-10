const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const PREDICT_FALLBACK = {
  successProbability: 0.70,
  confidenceLevel:    'Medium',
  topFeatures:        [],
  shapValues:         {},
};

const DECAY_FALLBACK = {
  estimatedPlateauWeek:    8,
  recommendedSwitchDate:   null,
  decayReason:             'ML service unavailable — using default estimate',
};

async function predict(child) {
  try {
    const { data } = await axios.post(`${ML_URL}/predict/`, {
      age:                   child.age,
      diagnosisLevel:        child.diagnosisLevel        || 'Level 2 - Moderate',
      communicationLevel:    child.communicationLevel    || 'Emerging Verbal',
      interests:             child.interests             || [],
      sensoryProfile:        child.sensoryProfile        || { hypersensitive: [], hyposensitive: [], seeksBehaviors: [] },
      behavioralChallenges:  child.behavioralChallenges  || [],
      learningStyle:         child.learningStyle         || 'Mixed',
      targetGoals:           child.targetGoals           || [],
      previousTherapyMonths: child.previousTherapyMonths || 0
    }, { timeout: 15000 });
    return data;
  } catch (err) {
    console.warn('ML predict failed (non-fatal):', err.message);
    return PREDICT_FALLBACK;
  }
}

async function predictDecay(child) {
  try {
    const { data } = await axios.post(`${ML_URL}/decay/`, {
      age:                   child.age,
      diagnosisLevel:        child.diagnosisLevel,
      obsessionIntensity:    child.obsessionIntensity    || 'Moderate',
      previousTherapyMonths: child.previousTherapyMonths,
      numInterests:          child.interests?.length     || 3
    }, { timeout: 10000 });
    return data;
  } catch (err) {
    console.warn('ML predictDecay failed (non-fatal):', err.message);
    return DECAY_FALLBACK;
  }
}

module.exports = { predict, predictDecay };
