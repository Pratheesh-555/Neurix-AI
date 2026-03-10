import { Link } from 'react-router-dom';
import { User, Calendar, Zap, ChevronRight, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChild } from '../../api/child.api';

const LEVEL_COLOR = {
  'Level 1 - Mild':     'bg-green-100 text-green-700 border-green-200',
  'Level 2 - Moderate': 'bg-amber-100 text-amber-700 border-amber-200',
  'Level 3 - Severe':   'bg-red-100   text-red-700   border-red-200',
};

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChildCard({ child, lastProgramDate }) {
  const badge = LEVEL_COLOR[child.diagnosisLevel] || 'bg-slate-100 text-slate-600 border-slate-200';
  const topInterests = child.interests?.slice(0, 3) || [];
  const queryClient = useQueryClient();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteChild(child._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['children'] }),
  });

  function handleDelete() {
    if (window.confirm(`Delete ${child.name}? This cannot be undone.`)) {
      remove();
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-3">

      {/* Header: name + age + diagnosis badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{child.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{child.age} yrs old</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${badge}`}>
            {child.diagnosisLevel?.replace('Level ', 'L')}
          </span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete child"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Top 3 interest tags */}
      {topInterests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topInterests.map((i) => (
            <span key={i} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
              {i}
            </span>
          ))}
          {child.interests.length > 3 && (
            <span className="text-xs text-slate-400 self-center">+{child.interests.length - 3} more</span>
          )}
        </div>
      )}

      {/* Last program date */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar size={12} />
        {lastProgramDate
          ? <span>Last program: <span className="text-slate-600 font-medium">{fmt(lastProgramDate)}</span></span>
          : <span>No program yet</span>
        }
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          to={`/children/${child._id}/generate`}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
        >
          <Zap size={13} /> Generate Program
        </Link>
        <Link
          to={`/children/${child._id}`}
          className="flex items-center gap-1 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          View <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
