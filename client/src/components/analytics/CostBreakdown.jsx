import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, TrendingDown } from 'lucide-react';
import { COST_PER_PROGRAM } from '../../utils/constants';

export default function CostBreakdown({ totalPrograms = 0, totalCostInr = 0 }) {
  const manualCost = totalPrograms * 56000;
  const savings    = manualCost - totalCostInr;
  const savingsPct = manualCost > 0 ? ((savings / manualCost) * 100).toFixed(0) : 0;

  const barData = [
    { label: 'AI Cost (BCBA Copilot)', value: totalCostInr,  fill: '#6366f1' },
    { label: 'Manual Cost (Traditional)', value: manualCost, fill: '#e2e8f0' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <IndianRupee size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Cost Breakdown</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-indigo-700">₹{totalCostInr.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Total AI Cost</p>
          <p className="text-xs text-indigo-400">₹{COST_PER_PROGRAM} × {totalPrograms}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-600">₹{(manualCost / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-500 mt-1">Manual Cost</p>
          <p className="text-xs text-slate-400">₹56K × {totalPrograms}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-700">{savingsPct}%</p>
          <p className="text-xs text-slate-500 mt-1">Cost Reduction</p>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            <TrendingDown size={10} className="text-green-500" />
            <p className="text-xs text-green-500">₹{(savings / 1000).toFixed(0)}K saved</p>
          </div>
        </div>
      </div>

      {totalPrograms > 0 && (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${v < 1 ? v.toFixed(3) : (v/1000).toFixed(0)+'K'}`} />
            <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(v) => [`₹${v < 1 ? v.toFixed(3) : v.toLocaleString('en-IN')}`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
