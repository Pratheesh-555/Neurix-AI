const AutismScreening = require('../models/AutismScreening');
const SessionLog      = require('../models/SessionLog');
const Child           = require('../models/Child');
const { generateScreeningInterpretation } = require('../services/claudeService');
const mlService       = require('../services/mlService');

const QUESTIONS = [
  // Domain 1 — Social Communication (Q1-5, critical: 0,1,2)
  { id: 1,  text: 'Does the child rarely or never make eye contact during conversation or play?',                        domain: 'Social Communication', critical: true  },
  { id: 2,  text: 'Does the child rarely point to show you something interesting (not just to request)?',               domain: 'Social Communication', critical: true  },
  { id: 3,  text: 'Does the child fail to respond to their name when called in a quiet environment?',                   domain: 'Social Communication', critical: true  },
  { id: 4,  text: 'Does the child rarely share enjoyment by alternating gaze between an object and you?',              domain: 'Social Communication', critical: false },
  { id: 5,  text: 'Does the child show little interest in other children or prefer to play alone?',                     domain: 'Social Communication', critical: false },
  // Domain 2 — Repetitive Behavior (Q6-10, critical: 5)
  { id: 6,  text: 'Does the child engage in repetitive movements such as hand-flapping, rocking, or spinning?',         domain: 'Repetitive Behavior',  critical: true  },
  { id: 7,  text: 'Does the child insist on identical routines and become distressed when they change?',                domain: 'Repetitive Behavior',  critical: false },
  { id: 8,  text: 'Does the child focus obsessively on parts of objects (e.g., spinning wheels, lining up items)?',    domain: 'Repetitive Behavior',  critical: false },
  { id: 9,  text: 'Does the child have an unusually intense, narrow interest that dominates their attention?',          domain: 'Repetitive Behavior',  critical: false },
  { id: 10, text: 'Does the child repeat words or phrases out of context (echolalia)?',                                domain: 'Repetitive Behavior',  critical: false },
  // Domain 3 — Sensory Processing (Q11-15)
  { id: 11, text: 'Does the child show unusual sensitivity to sounds (covering ears, distress at normal volumes)?',     domain: 'Sensory Processing',   critical: false },
  { id: 12, text: 'Does the child seek sensory input intensely (spinning, crashing, mouthing objects)?',                domain: 'Sensory Processing',   critical: false },
  { id: 13, text: 'Does the child react unusually strongly to certain textures in food or clothing?',                   domain: 'Sensory Processing',   critical: false },
  { id: 14, text: 'Does the child appear to not notice pain or temperature at normal thresholds?',                      domain: 'Sensory Processing',   critical: false },
  { id: 15, text: 'Does the child avoid or strongly resist physical contact such as hugs?',                             domain: 'Sensory Processing',   critical: false },
  // Domain 4 — Communication & Flexibility (Q16-20, critical: 16)
  { id: 16, text: 'Does the child have significant difficulty initiating or maintaining back-and-forth conversation?',  domain: 'Communication',        critical: false },
  { id: 17, text: 'Does the child rarely or never use gestures (waving, nodding, shaking head)?',                      domain: 'Communication',        critical: true  },
  { id: 18, text: 'Does the child have difficulty understanding or expressing emotions appropriately?',                 domain: 'Communication',        critical: false },
  { id: 19, text: 'Does the child rarely imitate the actions or play of others?',                                      domain: 'Communication',        critical: false },
  { id: 20, text: 'Does the child have trouble transitioning between activities without significant distress?',         domain: 'Communication',        critical: false },
];

const CRITICAL_INDICES = QUESTIONS.reduce((acc, q, i) => { if (q.critical) acc.push(i); return acc; }, []);

// Fallback rule-based scorer used only when the ML service is unavailable
function computeRiskLevelFallback(answers) {
  const total          = answers.reduce((s, a) => s + a, 0);
  const criticalFlagged = CRITICAL_INDICES.filter(i => answers[i] === 1).length;
  if (total >= 9)                          return { totalScore: total, riskLevel: 'High Risk' };
  if (total >= 4 || criticalFlagged >= 3)  return { totalScore: total, riskLevel: 'Medium Risk' };
  return { totalScore: total, riskLevel: 'Low Risk' };
}

async function buildSessionSnapshot(childId) {
  const sessions = await SessionLog.find({ childId }).lean();
  if (!sessions.length) return { totalSessions: 0, avgEngagementScore: 0, resistanceRate: 0, pivotRate: 0 };

  let totalLogs = 0, resistant = 0, pivoted = 0, engagementSum = 0;
  for (const s of sessions) {
    engagementSum += s.overallEngagementScore || 0;
    for (const log of (s.activityLogs || [])) {
      totalLogs++;
      if (log.result === 'resistant') resistant++;
      if (log.result === 'pivoted')   pivoted++;
    }
  }
  return {
    totalSessions:      sessions.length,
    avgEngagementScore: Math.round(engagementSum / sessions.length),
    resistanceRate:     totalLogs > 0 ? Math.round((resistant / totalLogs) * 100) : 0,
    pivotRate:          totalLogs > 0 ? Math.round((pivoted  / totalLogs) * 100) : 0,
  };
}

// POST /api/screening
const submitScreening = async (req, res) => {
  try {
    const { childId, answers } = req.body;
    if (!childId || !Array.isArray(answers) || answers.length !== 20)
      return res.status(400).json({ error: 'childId and exactly 20 answers are required' });
    if (!answers.every(a => a === 0 || a === 1))
      return res.status(400).json({ error: 'Each answer must be 0 or 1' });

    const child = await Child.findOne({ _id: childId, bcbaId: req.user._id });
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const totalScore = answers.reduce((s, a) => s + a, 0);

    // ML-based risk prediction (falls back to rule-based if ML service is down)
    const mlResult = await mlService.predictASDRisk(answers, child);
    const riskLevel = mlResult.mlBased
      ? mlResult.riskLevel
      : computeRiskLevelFallback(answers).riskLevel;
    const sessionSnapshot           = await buildSessionSnapshot(childId);
    const llmInterpretation         = await generateScreeningInterpretation(
      child, answers, totalScore, riskLevel, sessionSnapshot, QUESTIONS
    );

    const screening = await AutismScreening.create({
      childId, bcbaId: req.user._id,
      answers, totalScore, riskLevel,
      sessionSnapshot, llmInterpretation,
      mlProbability: mlResult.probability ?? null,
      mlBased:       mlResult.mlBased,
    });

    res.status(201).json({ screening });
  } catch (err) {
    console.error('submitScreening error:', err.message);
    res.status(500).json({ error: 'Could not submit screening' });
  }
};

// GET /api/screening/child/:childId
const getScreeningHistory = async (req, res) => {
  try {
    const screenings = await AutismScreening
      .find({ childId: req.params.childId, bcbaId: req.user._id })
      .select('totalScore riskLevel createdAt')
      .sort({ createdAt: -1 });
    res.json({ screenings });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch screening history' });
  }
};

// GET /api/screening/:id
const getScreening = async (req, res) => {
  try {
    const screening = await AutismScreening
      .findOne({ _id: req.params.id, bcbaId: req.user._id })
      .populate('childId', 'name age diagnosisLevel communicationLevel');
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    res.json({ screening });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch screening' });
  }
};

module.exports = { submitScreening, getScreeningHistory, getScreening };
