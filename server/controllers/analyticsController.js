const Child      = require('../models/Child');
const Program    = require('../models/Program');
const SessionLog = require('../models/SessionLog');

// GET /api/analytics/overview
async function overview(req, res, next) {
  try {
    const bcbaId  = req.user._id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalChildren, programs, totalSessions, childIdsWithProgram, programsThisWeek] = await Promise.all([
      Child.countDocuments({ bcbaId }),
      Program.find({ bcbaId }, 'status mlPrediction.successProbability createdAt'),
      SessionLog.countDocuments({ bcbaId }),
      Program.distinct('childId', { bcbaId, status: 'completed' }),
      Program.countDocuments({ bcbaId, createdAt: { $gte: weekAgo } }),
    ]);

    const completed  = programs.filter(p => p.status === 'completed');
    const totalPrograms = programs.length;
    const avgSuccessProbability = completed.length > 0
      ? Math.round(
          completed.reduce((s, p) => s + (p.mlPrediction?.successProbability || 0), 0)
          / completed.length * 10
        ) / 10
      : 0;

    const childrenNeedingProgram = Math.max(0, totalChildren - childIdsWithProgram.length);

    res.json({
      totalChildren,
      totalPrograms,
      avgSuccessProbability,
      totalSessions,
      programsThisWeek,
      childrenNeedingProgram,
    });
  } catch (err) { next(err); }
}

// GET /api/analytics/outcomes
async function outcomes(req, res, next) {
  try {
    const bcbaId = req.user._id;

    const programs = await Program
      .find({ bcbaId, status: 'completed' }, 'childId mlPrediction.successProbability createdAt')
      .populate('childId', 'name')
      .sort('createdAt');

    const byChild = new Map();
    for (const p of programs) {
      const id   = (p.childId?._id || p.childId).toString();
      const name = p.childId?.name || 'Unknown';
      if (!byChild.has(id)) byChild.set(id, { childId: id, childName: name, programs: [] });
      byChild.get(id).programs.push({
        date:               p.createdAt,
        successProbability: p.mlPrediction?.successProbability || 0,
        programId:          p._id,
      });
    }

    res.json({ children: Array.from(byChild.values()) });
  } catch (err) { next(err); }
}

// GET /api/analytics/shap-summary
async function shapSummary(req, res, next) {
  try {
    const bcbaId = req.user._id;

    const programs = await Program.find(
      { bcbaId, status: 'completed' },
      'mlPrediction.shapValues'
    );

    const totals = new Map();
    const counts = new Map();

    for (const p of programs) {
      const raw = p.mlPrediction?.shapValues;
      if (!raw) continue;

      // Handle both array [{feature,value}] and legacy dict {feature:value}
      const entries = Array.isArray(raw)
        ? raw
        : Object.entries(raw).map(([feature, value]) => ({ feature, value }));

      for (const { feature, value } of entries) {
        totals.set(feature, (totals.get(feature) || 0) + value);
        counts.set(feature, (counts.get(feature) || 0) + 1);
      }
    }

    const summary = Array.from(totals.entries())
      .map(([feature, total]) => {
        const avgImpact = Math.round((total / counts.get(feature)) * 10000) / 10000;
        return { feature, avgImpact, direction: avgImpact >= 0 ? 'positive' : 'negative' };
      })
      .sort((a, b) => Math.abs(b.avgImpact) - Math.abs(a.avgImpact));

    res.json({ topFeatures: summary });
  } catch (err) { next(err); }
}

module.exports = { overview, outcomes, shapSummary };
