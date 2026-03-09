export default function StatsCard({ icon, label, value, sub, color = 'indigo' }) {
  const bg   = { indigo: 'bg-indigo-50', green: 'bg-green-50', amber: 'bg-amber-50', rose: 'bg-rose-50' };
  const text = { indigo: 'text-indigo-600', green: 'text-green-600', amber: 'text-amber-600', rose: 'text-rose-600' };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`${bg[color]} p-3 rounded-lg`}>
        <span className={`${text[color]}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
