const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function findSimilar(child, n = 3) {
  try {
    const { data } = await axios.post(`${ML_URL}/embed/similar`, {
      childData: {
        age:                  child.age,
        diagnosisLevel:       child.diagnosisLevel,
        communicationLevel:   child.communicationLevel,
        interests:            child.interests,
        behavioralChallenges: child.behavioralChallenges,
        targetGoals:          child.targetGoals
      },
      n
    }, { timeout: 15000 });

    // Return full evidence objects including new clinical fields
    return data.similar || [];
    // Shape: [{ childId, similarityScore, source, effectiveApproaches,
    //           interestOverlap, adosTotal, successLabel, protocol,
    //           therapyDomain, initialCondition }]
  } catch (err) {
    console.warn('ChromaDB findSimilar failed (non-fatal):', err.message);
    return [];
  }
}

async function storeEmbedding(child, effectiveApproaches = []) {
  try {
    await axios.post(`${ML_URL}/embed/store`, {
      childId:  child._id.toString(),
      childData: {
        age:                  child.age,
        diagnosisLevel:       child.diagnosisLevel,
        communicationLevel:   child.communicationLevel,
        interests:            child.interests,
        behavioralChallenges: child.behavioralChallenges,
        targetGoals:          child.targetGoals
      },
      effectiveApproaches,
      adosTotal:    'unknown',
      successLabel: 'unknown',
      protocol:     'ABA',
    }, { timeout: 10000 });
  } catch (err) {
    console.warn('ChromaDB storeEmbedding failed (non-fatal):', err.message);
  }
}

module.exports = { findSimilar, storeEmbedding };
