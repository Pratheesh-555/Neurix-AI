import { AlertTriangle, RefreshCw, Calendar } from 'lucide-react';

export default function DecayPredictor({ decay }) {
  if (!decay) return null;
  const { estimatedPlateauWeek, recommendedSwitchDate, decayReason, earlyWarningSignals = [], rotationRecommendation } = decay;

  const urgency = estimatedPlateauWeek <= 4 ? 'red' : estimatedPlateauWeek <= 8 ? 'amber' : 'green';
  const bg  = { red: 'bg-red-50   border-red-200',   amber: 'bg-amber-50 border-amber-200', green: 'bg-green-50 border-green-200' };
  const txt = { red: 'text-red-700',                  amber: 'text-amber-700',               green: 'text-green-700' };
  const ic  = { red: 'text-red-500',                  amber: 'text-amber-500',               green: 'text-green-500' };

  return (
    <div className={`rounded-xl border p-5 ${bg[urgency]}`}>
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle size={20} className={`${ic[urgency]} shrink-0 mt-0.5`} />
        <div>
          <h4 className={`font-semibold ${txt[urgency]}`}>Activity Decay Predictor</h4>
          <p className="text-sm text-slate-600 mt-0.5">{decayReason}</p>
        </div>
        <div className={`ml-auto text-right shrink-0`}>
          <p className={`text-2xl font-bold ${txt[urgency]}`}>Week {estimatedPlateauWeek}</p>
          <p className="text-xs text-slate-400">est. plateau</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {recommendedSwitchDate && (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Recommended switch</p>
              <p className="font-medium text-slate-700">{recommendedSwitchDate}</p>
            </div>
          </div>
        )}
        {rotationRecommendation && (
          <div className="flex items-center gap-2">
            <RefreshCw size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Rotation recommendation</p>
              <p className="font-medium text-slate-700">{rotationRecommendation}</p>
            </div>
          </div>
        )}
      </div>

      {earlyWarningSignals.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Early Warning Signals</p>
          <ul className="space-y-1">
            {earlyWarningSignals.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${ic[urgency].replace('text-', 'bg-')}`} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
