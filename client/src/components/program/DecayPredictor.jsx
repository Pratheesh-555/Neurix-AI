import { AlertTriangle, Calendar, RefreshCw, CheckCircle2, Circle } from 'lucide-react';

const MOCK_DECAY = {
  estimatedPlateauWeek:  9,
  recommendedSwitchDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  decayReason:           'Moderate habituation to repeated stimuli typically occurs at this interval.',
  earlyWarningSignals:   [
    'Increased self-stimming during structured tasks',
    'Longer latency to respond to prompts',
  ],
};

const MAX_WEEK = 16;

function urgency(week) {
  if (week < 4)  return 'red';
  if (week <= 8) return 'amber';
  return 'green';
}

const STYLE = {
  red:   { banner: 'bg-red-50 border-red-200',     badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500',   icon: 'text-red-500',   label: 'text-red-700'   },
  amber: { banner: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: 'text-amber-500', label: 'text-amber-700' },
  green: { banner: 'bg-teal-50 border-teal-200',   badge: 'bg-teal-100 text-teal-700',   dot: 'bg-teal-500',  icon: 'text-teal-600',  label: 'text-teal-700'  },
};

const URGENCY_LABEL = {
  red:   'Plateau soon — review activities',
  amber: 'Plateau approaching',
  green: 'Good runway ahead',
};

function formatDate(raw) {
  if (!raw) return '—';
  try { return new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return raw; }
}

export default function DecayPredictor({ decay }) {
  const d   = decay || MOCK_DECAY;
  const isDemo = !decay;
  const {
    estimatedPlateauWeek  = 9,
    recommendedSwitchDate,
    decayReason           = '',
    earlyWarningSignals   = [],
    rotationRecommendation,
  } = d;

  const u       = urgency(estimatedPlateauWeek);
  const s       = STYLE[u];
  const markerPct = Math.min(100, Math.max(0, (estimatedPlateauWeek / MAX_WEEK) * 100));

  return (
    <div className={`rounded-xl border p-5 ${s.banner}`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className={s.icon} />
          <div>
            <h4 className={`font-semibold text-sm ${s.label}`}>Activity Decay Predictor</h4>
            {isDemo && <span className="text-xs text-slate-400">(sample data)</span>}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
          {URGENCY_LABEL[u]}
        </span>
      </div>

      {/* Plateau week display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-4xl font-bold ${s.label}`}>Week {estimatedPlateauWeek}</span>
        <span className="text-sm text-slate-500">estimated plateau</span>
      </div>

      {/* Timeline bar */}
      <div className="mb-5">
        <div className="flex text-xs text-slate-400 justify-between mb-1">
          <span>Week 1</span>
          <span>Week 8</span>
          <span>Week 16</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden flex">
          <div className="bg-red-300"   style={{ width: `${(3  / MAX_WEEK) * 100}%` }} />
          <div className="bg-amber-300" style={{ width: `${(5  / MAX_WEEK) * 100}%` }} />
          <div className="bg-teal-300"  style={{ width: `${(8  / MAX_WEEK) * 100}%` }} />
        </div>
        {/* Marker */}
        <div className="relative h-4" style={{ marginTop: '-22px' }}>
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
          >
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${s.dot}`} />
          </div>
        </div>
        <div className="flex gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" />{'< 4 wks'}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />4–8 wks</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-300 inline-block" />{'>8 wks'}</span>
        </div>
      </div>

      {/* Decay reason callout */}
      {decayReason && (
        <div className="bg-white/60 rounded-lg px-4 py-3 mb-4 text-sm text-slate-700 border border-slate-200">
          {decayReason}
        </div>
      )}

      {/* Switch date + rotation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
        {recommendedSwitchDate && (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Recommended switch</p>
              <p className="font-semibold text-slate-700">{formatDate(recommendedSwitchDate)}</p>
            </div>
          </div>
        )}
        {rotationRecommendation && (
          <div className="flex items-center gap-2">
            <RefreshCw size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Rotation</p>
              <p className="font-medium text-slate-700 text-xs leading-relaxed">{rotationRecommendation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Early warning signals checklist */}
      {earlyWarningSignals.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
            Early Warning Signals
          </p>
          <ul className="space-y-1.5">
            {earlyWarningSignals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Circle size={14} className="text-slate-300 shrink-0 mt-0.5" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
