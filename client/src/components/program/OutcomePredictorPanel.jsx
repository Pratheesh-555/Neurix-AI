import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const FEATURE_LABELS = {
  age:                        'Age',
  diagnosis_level:            'Diagnosis Level',
  communication_level:        'Communication',
  num_interests:              'No. of Interests',
  num_sensory_triggers:       'Sensory Triggers',
  num_behavioral_challenges:  'Behavioural Challenges',
  learning_style:             'Learning Style',
  num_target_goals:           'Target Goals',
  prior_therapy_months:       'Prior Therapy (mo.)',
};

const CONFIDENCE_COLOR = { High: 'text-green-600 bg-green-50', Medium: 'text-amber-600 bg-amber-50', Low: 'text-red-600 bg-red-50' };

export default function OutcomePredictorPanel({ mlPrediction }) {
  if (!mlPrediction) return null;

  const { successProbability = 0, shapValues = {}, topFeatures = [], confidenceLevel = 'Medium' } = mlPrediction;

  const chartData = Object.entries(shapValues)
    .map(([key, val]) => ({ feature: FEATURE_LABELS[key] || key, value: Math.abs(val), raw: val }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const pct = Math.round(successProbability);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Outcome Predictor</h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONFIDENCE_COLOR[confidenceLevel] || CONFIDENCE_COLOR.Medium}`}>
          {confidenceLevel} confidence
        </span>
      </div>

      {/* Big probability circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={pct >= 70 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'}
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
          <p className="text-sm font-medium text-slate-600">Success Probability</p>
          <p className="text-xs text-slate-400 mt-1">XGBoost prediction based on child profile and therapy history</p>
          <p className="text-xs text-slate-400 mt-0.5">Top factors: {topFeatures.slice(0, 3).map(f => FEATURE_LABELS[f] || f).join(', ')}</p>
        </div>
      </div>

      {/* SHAP bar chart */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">SHAP Feature Importance</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="feature" width={130} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(v, _, { payload }) => [`${payload.raw >= 0 ? '+' : ''}${payload.raw.toFixed(3)}`, 'SHAP']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.raw >= 0 ? '#6366f1' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-2">Purple = positive impact · Red = negative impact</p>
        </div>
      )}
    </div>
  );
}
