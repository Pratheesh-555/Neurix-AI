/**
 * pivotService.js
 *
 * Single source of truth for pivot generation.
 * Resolution order (cheapest → most expensive):
 *   1. Pre-generated pivot already stored on the activity   → FREE
 *   2. Live Claude call (generateInstantPivot)              → ₹0.003
 *   3. Rule-based mock                                      → FREE fallback while Claude credits are absent
 */

const Program = require('../models/Program');

// Lazy-require so the service still loads even if claudeService fails to import
let _claude = null;
function getClaudeService() {
  if (!_claude) _claude = require('./claudeService');
  return _claude;
}

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * Check whether the last N logs for a specific activity are all 'resistant'.
 * Used by sessionController to decide when to auto-trigger.
 *
 * @param {Array}  activityLogs  session.activityLogs array
 * @param {string} activityId    id of the activity to check
 * @param {number} threshold     consecutive count required (default 3)
 */
function isConsecutiveResistance(activityLogs, activityId, threshold = 3) {
  const logsForActivity = activityLogs.filter(l => l.activityId === activityId);
  if (logsForActivity.length < threshold) return false;

  const last = logsForActivity.slice(-threshold);
  return last.every(l => l.result === 'resistant');
}

/**
 * Generate (or retrieve) a pivot activity and persist it on the Program doc.
 *
 * @param {Object} session   Mongoose SessionLog document
 * @param {string} activityId
 * @param {string} bcbaId
 * @param {Object} child     Mongoose Child document (already loaded by caller)
 * @returns {Object|null}    pivot activity JSON, or null on hard failure
 */
async function generatePivot(session, activityId, bcbaId, child) {
  const program = await Program.findOne({ _id: session.programId, bcbaId });
  if (!program) return null;

  const activity = program.program?.activities?.find(a => a.id === activityId);
  if (!activity) return null;

  // 1. Pre-generated pivot — use it for free
  if (activity.pivotActivity) {
    return activity.pivotActivity;
  }

  // 2. Live Claude call
  let pivotActivity = null;
  try {
    pivotActivity = await getClaudeService().generateInstantPivot(child, activity);
  } catch (e) {
    console.warn('Claude pivot unavailable, using mock fallback:', e.message);
    pivotActivity = _mockPivot(activity, child);
  }

  // 3. Persist on Program so the same pivot is reused next time
  if (pivotActivity) {
    await Program.updateOne(
      { _id: program._id, 'program.activities.id': activityId },
      {
        $set: { 'program.activities.$.pivotActivity': pivotActivity },
        $inc: { 'program.activities.$.resistanceCount': 1 }
      }
    );
  }

  return pivotActivity;
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
// Matches the exact PRD pivot schema so frontend/tests work without Claude credits.

function _mockPivot(activity, child) {
  const interest = child?.interests?.[0] || 'a favourite toy';
  return {
    id:                  `pivot_${activity.id || 'act'}`,
    name:                `${activity.name || 'Activity'} — Fun Twist`,
    theme:               interest,
    objective:           activity.objective || 'Practice the same skill in a playful way',
    instructions:        `Turn the original task into a game using ${interest}. ` +
                         'Reduce steps, add sound effects, let the child lead the pace. ' +
                         'Celebrate every micro-success with high-fives or a preferred item.',
    duration:            5,
    difficulty:          'Easy',
    successMetric:       'Child attempts the activity at least once without turning away',
    gamificationElement: `Collect "${interest}" stickers — one per attempt, five to unlock a preferred break activity`
  };
}

module.exports = { isConsecutiveResistance, generatePivot };
