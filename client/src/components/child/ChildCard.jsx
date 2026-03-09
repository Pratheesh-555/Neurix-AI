import { Link } from 'react-router-dom';
import { User, ChevronRight, Zap } from 'lucide-react';

const LEVEL_COLOR = {
  'Level 1 - Mild':     'bg-green-100 text-green-700',
  'Level 2 - Moderate': 'bg-amber-100 text-amber-700',
  'Level 3 - Severe':   'bg-red-100   text-red-700',
};

export default function ChildCard({ child }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{child.name}</p>
            <p className="text-xs text-slate-500">{child.age} yrs · {child.communicationLevel}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${LEVEL_COLOR[child.diagnosisLevel] || 'bg-slate-100 text-slate-600'}`}>
          {child.diagnosisLevel?.replace('Level ', 'L')}
        </span>
      </div>

      {child.interests?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {child.interests.slice(0, 4).map(i => (
            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{i}</span>
          ))}
          {child.interests.length > 4 && (
            <span className="text-xs text-slate-400">+{child.interests.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <Link to={`/children/${child._id}/generate`}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-1 justify-center">
          <Zap size={13} /> Generate Program
        </Link>
        <Link to={`/children/${child._id}`}
          className="flex items-center gap-1 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          View <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
