import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const FEATURE_LABELS = {
  age:                       'Age',
  diagnosis_level:           'Diagnosis Level',
  communication_level:       'Communication',
  num_interests:             'No. of Interests',
  num_sensory_triggers:      'Sensory Triggers',
  num_behavioral_challenges: 'Behavioral Challenges',
  learning_style:            'Learning Style',
  num_target_goals:          'Target Goals',
  prior_therapy_months:      'Prior Therapy',
};

const CONFIDENCE_STYLE = {
  High:   'text-teal-700   bg-teal-50   border border-teal-200',
  Medium: 'text-amber-700  bg-amber-50  border border-amber-200',
  Low:    'text-red-700    bg-red-50    border border-red-200',
};

const MOCK_SHAP = [
  { feature: 'prior_therapy_months',      value:  0.18 },
  { feature: 'diagnosis_level',           value:  0.15 },
  { feature: 'communication_level',       value:  0.12 },
  { feature: 'age',                       value:  0.09 },
  { feature: 'num_interests',             value: -0.07 },
  { feature: 'num_behavioral_challenges', value: -0.05 },
];

function normalise(shapValues) {
  if (!shapValues) return MOCK_SHAP;
  if (Array.isArray(shapValues) && shapValues.length > 0) return shapValues;
  if (typeof shapValues === 'object') {
    const entries = Object.entries(shapValues);
    if (entries.length > 0) return entries.map(([feature, value]) => ({ feature, value }));
  }
  return MOCK_SHAP;
}

export default function OutcomePredictorPanel({ mlPrediction }) {
  const prediction = mlPrediction || {};
  const {
    successProbability = 72,
    shapValues         = null,
    topFeatures        = [],
    confidenceLevel    = 'Medium',
  } = prediction;

  const pct = Math.round(successProbability);

  const chartData = normalise(shapValues)
    .map(({ feature, value }) => ({
      feature: FEATURE_LABELS[feature] || feature,
      raw:     value,
      value:   Math.abs(value),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ringColor = pct >= 70 ? '#0d9488' : pct >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-teal-600" />
          <h3 className="font-semibold text-slate-800">Outcome Predictor</h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONFIDENCE_STYLE[confidenceLevel] || CONFIDENCE_STYLE.Medium}`}>
          {confidenceLevel} confidence
        </span>
      </div>

      {/* Probability ring + description */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={ringColor}
              strokeWidth="3.2"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Success Probability</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            XGBoost prediction based on child profile and therapy history
          </p>
          {topFeatures.length > 0 && (
            <p className="text-xs text-teal-600 font-medium mt-1.5">
              Top factors: {topFeatures.slice(0, 3).map(f => FEATURE_LABELS[f] || f).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* SHAP horizontal bar chart */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
          SHAP Feature Impact
        </p>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(_, __, { payload }) => [
                `${payload.raw >= 0 ? '+' : ''}${payload.raw.toFixed(3)}`,
                'SHAP impact',
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.raw >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-2">
          Green = positive impact · Red = negative impact
        </p>
      </div>

      {/* Top-factors detail rows */}
      {chartData.slice(0, 3).length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3 space-y-1.5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
            Top Factors
          </p>
          {chartData.slice(0, 3).map((entry, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className={entry.raw >= 0 ? 'text-teal-600' : 'text-red-500'}>
                  {entry.raw >= 0 ? '✓' : '⚠'}
                </span>
                {entry.feature}
              </span>
              <span className={`font-semibold ${entry.raw >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                {entry.raw >= 0 ? '+' : ''}{entry.raw.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
