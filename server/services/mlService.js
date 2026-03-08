const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function predict(child) {
  const { data } = await axios.post(`${ML_URL}/predict/`, {
    age:                   child.age,
    diagnosisLevel:        child.diagnosisLevel   || 'Level 2 - Moderate',
    communicationLevel:    child.communicationLevel || 'Emerging Verbal',
    interests:             child.interests          || [],
    sensoryProfile:        child.sensoryProfile     || { hypersensitive: [], hyposensitive: [], seeksBehaviors: [] },
    behavioralChallenges:  child.behavioralChallenges || [],
    learningStyle:         child.learningStyle      || 'Mixed',
    targetGoals:           child.targetGoals        || [],
    previousTherapyMonths: child.previousTherapyMonths || 0
  }, { timeout: 15000 });
  return data;   // { successProbability, shapValues, topFeatures, confidenceLevel }
}

async function predictDecay(child) {
  const { data } = await axios.post(`${ML_URL}/decay/`, {
    age:                   child.age,
    diagnosisLevel:        child.diagnosisLevel,
    obsessionIntensity:    child.obsessionIntensity || 'Moderate',
    previousTherapyMonths: child.previousTherapyMonths,
    numInterests:          child.interests?.length || 3
  }, { timeout: 10000 });
  return data;   // { estimatedPlateauWeek, recommendedSwitchDate, decayReason, ... }
}

module.exports = { predict, predictDecay };
