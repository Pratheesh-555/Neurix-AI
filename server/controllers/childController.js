const axios = require('axios');
const Child = require('../models/Child');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ── embed helper (fire-and-forget; child is saved even if ML is unavailable) ──

async function embedInChroma(child) {
  try {
    await axios.post(`${ML_URL}/embed/store`, {
      childId:             child._id.toString(),
      childData:           {
        age:                  child.age,
        diagnosisLevel:       child.diagnosisLevel,
        communicationLevel:   child.communicationLevel,
        interests:            child.interests,
        behavioralChallenges: child.behavioralChallenges,
        targetGoals:          child.targetGoals,
      },
      effectiveApproaches: [],
    }, { timeout: 5000 });

    await Child.findByIdAndUpdate(child._id, { chromaEmbeddingId: child._id.toString() });
  } catch (err) {
    // ML service unavailable — non-fatal; embedding will be retried on program generation
    console.warn(`ChromaDB embed skipped for child ${child._id}: ${err.message}`);
  }
}

// ── controllers ──────────────────────────────────────────────────────────────

// POST /api/children
const createChild = async (req, res) => {
  try {
    const {
      name, age, diagnosisLevel, communicationLevel,
      interests, obsessionIntensity, sensoryProfile,
      behavioralChallenges, learningStyle, currentSkills,
      targetGoals, previousTherapyMonths,
    } = req.body;

    if (!name || !age || !diagnosisLevel || !communicationLevel) {
      return res.status(400).json({ error: 'name, age, diagnosisLevel, and communicationLevel are required' });
    }

    const child = await Child.create({
      bcbaId: req.user._id,
      name, age, diagnosisLevel, communicationLevel,
      interests:             interests             || [],
      // Optional enum fields — omit entirely when blank so Mongoose skips validation
      obsessionIntensity:    obsessionIntensity    || undefined,
      learningStyle:         learningStyle         || undefined,
      sensoryProfile:        sensoryProfile        || { hypersensitive: [], hyposensitive: [], seeksBehaviors: [] },
      behavioralChallenges:  behavioralChallenges  || [],
      currentSkills:         currentSkills         || [],
      targetGoals:           targetGoals           || [],
      previousTherapyMonths: previousTherapyMonths || 0,
    });

    // Kick off embedding asynchronously — do not block response
    embedInChroma(child);

    res.status(201).json({ child });
  } catch (err) {
    console.error('createChild error:', err.message);
    res.status(500).json({ error: 'Could not create child profile' });
  }
};

// GET /api/children
const getChildren = async (req, res) => {
  try {
    const children = await Child.find({ bcbaId: req.user._id }).sort({ createdAt: -1 });
    res.json({ children });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch children' });
  }
};

// GET /api/children/:id
const getChild = async (req, res) => {
  try {
    const child = await Child.findOne({ _id: req.params.id, bcbaId: req.user._id });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json({ child });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch child' });
  }
};

// PUT /api/children/:id
const updateChild = async (req, res) => {
  try {
    const allowed = [
      'name','age','diagnosisLevel','communicationLevel','interests',
      'obsessionIntensity','sensoryProfile','behavioralChallenges',
      'learningStyle','currentSkills','targetGoals','previousTherapyMonths',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();

    const child = await Child.findOneAndUpdate(
      { _id: req.params.id, bcbaId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!child) return res.status(404).json({ error: 'Child not found' });

    // Re-embed updated profile in ChromaDB
    embedInChroma(child);

    res.json({ child });
  } catch (err) {
    console.error('updateChild error:', err.message);
    res.status(500).json({ error: 'Could not update child profile' });
  }
};

// DELETE /api/children/:id
const deleteChild = async (req, res) => {
  try {
    const child = await Child.findOneAndDelete({ _id: req.params.id, bcbaId: req.user._id });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json({ message: 'Child profile deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete child profile' });
  }
};

module.exports = { createChild, getChildren, getChild, updateChild, deleteChild };
