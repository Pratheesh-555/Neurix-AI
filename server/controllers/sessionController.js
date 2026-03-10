const SessionLog   = require('../models/SessionLog');
const Program      = require('../models/Program');
const Child        = require('../models/Child');
const pivotService = require('../services/pivotService');

// ── POST /api/sessions  (mount: /api/sessions) ───────────────────────────────
// Body: { programId }
// Creates a new live session for a completed program.
const start = async (req, res) => {
  try {
    const { programId } = req.body;
    if (!programId) return res.status(400).json({ error: 'programId is required' });

    const program = await Program.findOne({ _id: programId, bcbaId: req.user._id });
    if (!program) return res.status(404).json({ error: 'Program not found' });
    if (program.status !== 'completed') {
      return res.status(400).json({ error: 'Can only start a session for a completed program' });
    }

    const session = await SessionLog.create({
      programId,
      childId: program.childId,
      bcbaId:  req.user._id
    });

    res.status(201).json({ sessionId: session._id, programId, childId: program.childId });
  } catch (err) {
    console.error('start session error:', err.message);
    res.status(500).json({ error: 'Could not start session' });
  }
};

// ── POST /api/sessions/:id/log ───────────────────────────────────────────────
// Body: { activityId, result }  result: 'engaged' | 'resistant'
// Triggers pivot automatically after 3 CONSECUTIVE resistant logs for the same activity.
const logActivity = async (req, res) => {
  try {
    const { activityId, result } = req.body;
    if (!activityId || !result) {
      return res.status(400).json({ error: 'activityId and result are required' });
    }
    if (!['engaged', 'resistant'].includes(result)) {
      return res.status(400).json({ error: 'result must be engaged or resistant' });
    }

    const session = await SessionLog.findOne({ _id: req.params.id, bcbaId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Push the log entry
    session.activityLogs.push({ activityId, result, timestamp: new Date(), pivotTriggered: false });

    let pivotTriggered = false;
    let pivotActivity  = null;

    // Auto-pivot on 3 CONSECUTIVE resistant logs for this activity
    if (pivotService.isConsecutiveResistance(session.activityLogs, activityId, 3)) {
      const child = await Child.findById(session.childId);
      const pivotResult = await pivotService.generatePivot(session, activityId, req.user._id, child);
      if (pivotResult) {
        pivotTriggered = true;
        pivotActivity  = pivotResult;
        session.activityLogs[session.activityLogs.length - 1].pivotTriggered = true;
      }
    }

    session.overallEngagementScore = _computeScore(session.activityLogs);
    await session.save();

    // Count of resistant logs (for frontend display)
    const resistantCount = session.activityLogs.filter(
      l => l.activityId === activityId && l.result === 'resistant'
    ).length;

    res.json({ logged: true, resistantCount, pivotTriggered, pivotActivity });
  } catch (err) {
    console.error('logActivity error:', err.message);
    res.status(500).json({ error: 'Could not log activity' });
  }
};

// ── POST /api/sessions/:id/pivot ─────────────────────────────────────────────
// Body: { activityId }
// Explicit/manual pivot — BCBA can trigger at any time regardless of count.
const pivot = async (req, res) => {
  try {
    const { activityId } = req.body;
    if (!activityId) return res.status(400).json({ error: 'activityId is required' });

    const session = await SessionLog.findOne({ _id: req.params.id, bcbaId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const child = await Child.findById(session.childId);
    const pivotActivity = await pivotService.generatePivot(session, activityId, req.user._id, child);
    if (!pivotActivity) {
      return res.status(404).json({ error: 'Activity not found in program' });
    }

    session.activityLogs.push({
      activityId,
      result:         'pivoted',
      timestamp:      new Date(),
      pivotTriggered: true
    });
    session.overallEngagementScore = _computeScore(session.activityLogs);
    await session.save();

    res.json({ pivotActivity });
  } catch (err) {
    console.error('pivot error:', err.message);
    res.status(500).json({ error: 'Could not generate pivot' });
  }
};

// ── GET /api/sessions/:id/summary ────────────────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const session = await SessionLog.findOne({ _id: req.params.id, bcbaId: req.user._id })
      .populate('childId',   'name age diagnosisLevel')
      .populate('programId', 'program.summary mlPrediction.successProbability');

    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.overallEngagementScore = _computeScore(session.activityLogs);
    await session.save();

    res.json({ session });
  } catch (err) {
    console.error('getSummary error:', err.message);
    res.status(500).json({ error: 'Could not fetch session summary' });
  }
};

// ── Helper ────────────────────────────────────────────────────────────────────
// engaged=2, pivoted=1, resistant=0  →  % of max possible score
function _computeScore(logs) {
  if (!logs.length) return 0;
  const earned = logs.reduce((sum, l) => {
    if (l.result === 'engaged') return sum + 2;
    if (l.result === 'pivoted') return sum + 1;
    return sum;
  }, 0);
  return Math.round((earned / (logs.length * 2)) * 100);
}

// ── GET /api/sessions ─────────────────────────────────────────────────────────
// Query params: ?childId=  (optional filter)
const getSessions = async (req, res) => {
  try {
    const filter = { bcbaId: req.user._id };
    if (req.query.childId) filter.childId = req.query.childId;

    const sessions = await SessionLog.find(filter)
      .populate('childId',   'name age diagnosisLevel')
      .populate('programId', 'program.summary')
      .sort({ sessionDate: -1 })
      .limit(50);

    res.json({ sessions });
  } catch (err) {
    console.error('getSessions error:', err.message);
    res.status(500).json({ error: 'Could not fetch sessions' });
  }
};

module.exports = { start, logActivity, pivot, getSummary, getSessions };
