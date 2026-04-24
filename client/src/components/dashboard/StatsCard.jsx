export default function StatsCard({ icon, label, value, sub, color = 'indigo' }) {
  const gradients = {
    indigo: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    green:  'linear-gradient(135deg, #10b981, #34d399)',
    amber:  'linear-gradient(135deg, #f59e0b, #fbbf24)',
    rose:   'linear-gradient(135deg, #f43f5e, #fb7185)',
  };
  const glows = {
    indigo: 'rgba(99,102,241,0.3)',
    green:  'rgba(16,185,129,0.3)',
    amber:  'rgba(245,158,11,0.3)',
    rose:   'rgba(244,63,94,0.3)',
  };

  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: gradients[color], boxShadow: `0 4px 12px ${glows[color]}` }}>
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
