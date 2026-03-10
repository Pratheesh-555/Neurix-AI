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

const SCREENING_FALLBACK = {
  riskLevel:    null,
  probability:  null,
  asdPredicted: null,
  mlBased:      false,
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

async function predictASDRisk(answers, child) {
  try {
    const { data } = await axios.post(`${ML_URL}/screening/predict`, {
      answers,
      age:              child.age,
      speechDelay:      child.behavioralChallenges?.includes('Speech Delay') ? 1 : 0,
      learningDisorder: child.behavioralChallenges?.includes('Learning Disorder') ? 1 : 0,
      geneticDisorders: 0,
    }, { timeout: 10000 });
    return data;
  } catch (err) {
    console.warn('ML predictASDRisk failed (non-fatal):', err.message);
    return SCREENING_FALLBACK;
  }
}

module.exports = { predict, predictDecay, predictASDRisk };
