import { useState } from 'react';
import { Clock, Target, Gamepad2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { DIFFICULTY_COLORS } from '../../utils/constants';

export default function ActivityCard({ activity, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showPivot, setShowPivot] = useState(false);

  const diff = activity.difficulty || 'Medium';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {index + 1}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{activity.name}</p>
              <p className="text-xs text-indigo-600 font-medium">{activity.theme}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${DIFFICULTY_COLORS[diff] || DIFFICULTY_COLORS.Medium}`}>
            {diff}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-3">{activity.objective}</p>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1"><Clock size={12} />{activity.duration} min</div>
          <div className="flex items-center gap-1"><Target size={12} />{activity.successMetric}</div>
          {activity.gamificationElement && (
            <div className="flex items-center gap-1"><Gamepad2 size={12} />{activity.gamificationElement}</div>
          )}
        </div>
      </div>

      {/* Expandable details */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors">
        <span>Instructions & Sensory Notes</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-3 border-t border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Instructions</p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{activity.instructions}</p>
          </div>
          {activity.reinforcementStrategy && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reinforcement</p>
              <p className="text-sm text-slate-700">{activity.reinforcementStrategy}</p>
            </div>
          )}
          {activity.sensoryConsiderations && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Sensory Considerations</p>
              <p className="text-sm text-slate-700">{activity.sensoryConsiderations}</p>
            </div>
          )}
        </div>
      )}

      {/* Pre-generated pivot */}
      {activity.pivotActivity && (
        <>
          <button onClick={() => setShowPivot(p => !p)}
            className="w-full flex items-center justify-between px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-1.5"><RefreshCw size={12} /> Pre-generated Pivot Activity</div>
            {showPivot ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showPivot && (
            <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
              <p className="text-xs font-semibold text-amber-700 mb-1">{activity.pivotActivity.name}</p>
              <p className="text-xs text-amber-600 mb-2">{activity.pivotActivity.theme} · {activity.pivotActivity.duration} min · {activity.pivotActivity.difficulty}</p>
              <p className="text-sm text-slate-700">{activity.pivotActivity.instructions}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
