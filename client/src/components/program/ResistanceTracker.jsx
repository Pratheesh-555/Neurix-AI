import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Loader2, Clock, Target } from 'lucide-react';
import { logActivity, triggerPivot } from '../../api/program.api';
import useSessionStore from '../../store/sessionStore';
import { useToast }    from '../shared/Toast';
import { DIFFICULTY_COLORS } from '../../utils/constants';

export default function ResistanceTracker({ activity, sessionId, index }) {
  const [loading, setLoading]       = useState(false);
  const [pivoting, setPivoting]     = useState(false);
  const [pivotData, setPivotData]   = useState(activity.pivotActivity || null);
  const [showPivot, setShowPivot]   = useState(false);

  const { addLog, setPivot, consecutiveResistance } = useSessionStore();
  const toast = useToast();

  const consec = consecutiveResistance(activity.id);

  const log = async (result) => {
    if (loading || pivoting) return;
    setLoading(true);
    addLog(activity.id, result);
    try {
      const { data } = await logActivity(sessionId, { activityId: activity.id, result });
      if (data.pivotTriggered && data.pivotActivity) {
        setPivot(activity.id, data.pivotActivity);
        setPivotData(data.pivotActivity);
        setShowPivot(true);
        toast('Pivot activity ready — 3 consecutive resistances detected', 'info');
      }
    } catch (e) {
      toast('Could not log activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const manualPivot = async () => {
    setPivoting(true);
    try {
      const { data } = await triggerPivot(sessionId, activity.id);
      setPivot(activity.id, data.pivotActivity);
      setPivotData(data.pivotActivity);
      setShowPivot(true);
      toast('Pivot generated', 'success');
    } catch (e) {
      toast('Could not generate pivot', 'error');
    } finally {
      setPivoting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Activity header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{activity.name}</p>
              <p className="text-xs text-indigo-600">{activity.theme}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${DIFFICULTY_COLORS[activity.difficulty] || ''}`}>
            {activity.difficulty}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">{activity.objective}</p>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1"><Clock size={11} /> {activity.duration} min</span>
          <span className="flex items-center gap-1"><Target size={11} /> {activity.successMetric}</span>
        </div>

        {/* ✅ / ❌ Buttons */}
        <div className="flex gap-2">
          <button onClick={() => log('engaged')} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Engaged ✅
          </button>
          <button onClick={() => log('resistant')} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Resistant ❌
          </button>
        </div>

        {/* Resistance counter */}
        {consec > 0 && (
          <div className={`mt-3 flex items-center justify-between text-xs rounded-lg px-3 py-2 ${consec >= 2 ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
            <span className={consec >= 2 ? 'text-red-600' : 'text-amber-600'}>
              {consec} consecutive ❌{consec >= 3 ? ' — pivot triggered!' : consec >= 2 ? ' — one more triggers pivot' : ''}
            </span>
            {consec >= 2 && !pivotData && (
              <button onClick={manualPivot} disabled={pivoting}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium ml-3">
                {pivoting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Pivot now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pivot Activity */}
      <AnimatePresence>
        {showPivot && pivotData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-amber-200 bg-amber-50 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={14} className="text-amber-600" />
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Pivot Activity</p>
            </div>
            <p className="text-sm font-semibold text-slate-800">{pivotData.name}</p>
            <p className="text-xs text-amber-600 mb-2">{pivotData.theme} · {pivotData.duration} min · {pivotData.difficulty}</p>
            <p className="text-sm text-slate-700">{pivotData.instructions}</p>
            {pivotData.gamificationElement && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span className="font-medium">Gamification:</span> {pivotData.gamificationElement}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
