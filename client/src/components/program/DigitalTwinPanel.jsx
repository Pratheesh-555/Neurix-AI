import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

// Teal-first palette — no purple
const COLORS  = ['#0d9488', '#0ea5e9', '#22c55e', '#f59e0b'];
const METRICS = ['communication', 'social', 'behavioral', 'skills'];
const METRIC_LABELS = {
  communication: 'Communication',
  social:        'Social',
  behavioral:    'Behavioral',
  skills:        'Skills',
};

const MOCK_DATA = [
  { month: 'Now', communication: 22, social: 18, behavioral: 25, skills: 20 },
  { month: '1mo', communication: 30, social: 25, behavioral: 33, skills: 27 },
  { month: '2mo', communication: 39, social: 33, behavioral: 41, skills: 36 },
  { month: '3mo', communication: 48, social: 42, behavioral: 50, skills: 45 },
  { month: '4mo', communication: 56, social: 51, behavioral: 58, skills: 53 },
  { month: '5mo', communication: 63, social: 58, behavioral: 65, skills: 61 },
  { month: '6mo', communication: 70, social: 65, behavioral: 72, skills: 68 },
];

function parseNum(text, fallback) {
  if (!text) return fallback;
  const n = parseFloat(text);
  return isNaN(n) ? fallback : n;
}

function buildChartData(projectedOutcomes = []) {
  if (!projectedOutcomes.length) return MOCK_DATA;

  return [
    {
      month: 'Now',
      communication: parseNum(projectedOutcomes[0]?.currentBaseline,    22),
      social:        parseNum(projectedOutcomes[1]?.currentBaseline,    18),
      behavioral:    parseNum(projectedOutcomes[2]?.currentBaseline,    25),
      skills:        parseNum(projectedOutcomes[3]?.currentBaseline,    20),
    },
    {
      month: '3mo',
      communication: parseNum(projectedOutcomes[0]?.projectedAt3Months, 48),
      social:        parseNum(projectedOutcomes[1]?.projectedAt3Months, 42),
      behavioral:    parseNum(projectedOutcomes[2]?.projectedAt3Months, 50),
      skills:        parseNum(projectedOutcomes[3]?.projectedAt3Months, 45),
    },
    {
      month: '6mo',
      communication: parseNum(projectedOutcomes[0]?.projectedAt6Months, 70),
      social:        parseNum(projectedOutcomes[1]?.projectedAt6Months, 65),
      behavioral:    parseNum(projectedOutcomes[2]?.projectedAt6Months, 72),
      skills:        parseNum(projectedOutcomes[3]?.projectedAt6Months, 68),
    },
  ];
}

export default function DigitalTwinPanel({ digitalTwin }) {
  const twin = digitalTwin || {};
  const { conditionedOn, projectedOutcomes = [] } = twin;
  const data = buildChartData(projectedOutcomes);
  const isDemo = !projectedOutcomes.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-teal-600" />
          <h3 className="font-semibold text-slate-800">6-Month Progress Projection</h3>
        </div>
        {isDemo && (
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">sample data</span>
        )}
      </div>

      {conditionedOn && (
        <p className="text-xs text-slate-400 mb-4 italic">Conditioned on: {conditionedOn}</p>
      )}
      {!conditionedOn && <div className="mb-4" />}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
          <defs>
            {METRICS.map((k, i) => (
              <linearGradient key={k} id={`dtg-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS[i]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0}   />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            label={{ value: 'Months', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#94a3b8' }}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={v => [`${v}%`]}
            labelFormatter={v => v}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {METRICS.map((k, i) => (
            <Area key={k} type="monotone" dataKey={k} name={METRIC_LABELS[k]}
              stroke={COLORS[i]} strokeWidth={2}
              fill={`url(#dtg-${k})`}
              dot={{ r: 4, fill: COLORS[i], strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs text-slate-400 text-center mt-1.5">
        Projection based on child profile + ML success probability
      </p>

      {/* Outcome detail rows — only when real API data is present */}
      {projectedOutcomes.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          {projectedOutcomes.map((o, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5">Now</p>
                <p className="font-medium text-slate-700">{o.currentBaseline}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">3mo</p>
                <p className="font-medium text-amber-700">{o.projectedAt3Months}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">6mo</p>
                <p className="font-medium text-teal-700">{o.projectedAt6Months}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
