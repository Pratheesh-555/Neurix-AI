import { IndianRupee, TrendingDown } from 'lucide-react';
import { COST_PER_PROGRAM } from '../../utils/constants';

export default function CostTracker({ totalPrograms = 0, totalCostInr = 0 }) {
  const manualCost  = totalPrograms * 56000;   // ₹56,000 manual cost per program
  const savings     = manualCost - totalCostInr;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee size={18} />
        <span className="font-semibold text-sm uppercase tracking-wide">Cost Tracker</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-indigo-200 text-xs mb-1">AI Cost</p>
          <p className="text-xl font-bold">₹{totalCostInr.toFixed(3)}</p>
          <p className="text-indigo-300 text-xs">₹{COST_PER_PROGRAM}/program</p>
        </div>
        <div>
          <p className="text-indigo-200 text-xs mb-1">Manual Cost</p>
          <p className="text-xl font-bold">₹{(manualCost / 1000).toFixed(0)}K</p>
          <p className="text-indigo-300 text-xs">₹56,000/program</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-green-300 mb-1">
            <TrendingDown size={14} />
            <p className="text-xs">Savings</p>
          </div>
          <p className="text-xl font-bold text-green-300">₹{(savings / 1000).toFixed(0)}K</p>
          <p className="text-green-400 text-xs">
            {manualCost > 0 ? `${((savings / manualCost) * 100).toFixed(0)}% saved` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
