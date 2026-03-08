import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SuccessRateChart({ programs = [] }) {
  const data = programs
    .filter(p => p.status === 'completed' && p.mlPrediction?.successProbability)
    .slice(-12)
    .map((p, i) => ({
      name:    new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      success: Math.round(p.mlPrediction.successProbability),
      cost:    p.costInr || 0.124,
    }));

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Not enough programs to show trend (need at least 2)
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, 'Success Probability']} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="success" name="Success Probability"
          stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
