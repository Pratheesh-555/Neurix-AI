import { Home } from 'lucide-react';

export default function ParentHomePlan({ plan }) {
  if (!plan) return null;
  const items = typeof plan === 'string'
    ? [{ activity: plan }]
    : Array.isArray(plan) ? plan
    : Object.entries(plan).map(([k, v]) => ({ activity: k, description: v }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Home size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Parent Home Plan</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">Activities parents can do between therapy sessions to reinforce skills.</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
            <div>
              <p className="font-medium text-slate-700">{item.activity || item.name || JSON.stringify(item)}</p>
              {item.description && <p className="text-slate-500 mt-0.5">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
