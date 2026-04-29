import { Link } from 'react-router-dom';
import { User, Calendar, Zap, ChevronRight, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChild } from '../../api/child.api';

const LEVEL_CONFIG = {
  'Level 1 - Mild':     { label: 'L1 Mild',     cls: 'badge-green'  },
  'Level 2 - Moderate': { label: 'L2 Moderate', cls: 'badge-amber'  },
  'Level 3 - Severe':   { label: 'L3 Severe',   cls: 'badge-indigo' },
};

const AVATAR_COLORS = [
  ['#6366f1','#8b5cf6'],
  ['#10b981','#34d399'],
  ['#f59e0b','#fbbf24'],
  ['#f43f5e','#fb7185'],
  ['#0ea5e9','#38bdf8'],
];

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChildCard({ child, lastProgramDate }) {
  const config      = LEVEL_CONFIG[child.diagnosisLevel] || { label: child.diagnosisLevel, cls: 'badge-indigo' };
  const topInterests = child.interests?.slice(0, 3) || [];
  const queryClient  = useQueryClient();

  const colorIdx  = child.name.charCodeAt(0) % AVATAR_COLORS.length;
  const [c1, c2]  = AVATAR_COLORS[colorIdx];

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteChild(child._id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['children'] }),
  });

  function handleDelete() {
    if (window.confirm(`Delete ${child.name}? This cannot be undone.`)) remove();
  }

  return (
    <div className="glass-card p-5 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-base"
               style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 4px 12px ${c1}55` }}>
            {child.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{child.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{child.age} years old</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${config.cls}`}>{config.label}</span>
          <button onClick={handleDelete} disabled={isPending}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Delete child">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Interest tags */}
      {topInterests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topInterests.map(i => (
            <span key={i} className="badge badge-indigo">{i}</span>
          ))}
          {child.interests.length > 3 && (
            <span className="text-xs text-slate-400 self-center">+{child.interests.length - 3}</span>
          )}
        </div>
      )}

      {/* Last program */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar size={11} />
        {lastProgramDate
          ? <span>Last program: <span className="text-slate-600 font-medium">{fmt(lastProgramDate)}</span></span>
          : <span>No program yet</span>
        }
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link to={`/children/${child._id}/generate`}
          className="btn-primary flex-1 justify-center text-xs py-2">
          <Zap size={12} /> Generate Program
        </Link>
        <Link to={`/children/${child._id}`}
          className="btn-ghost text-xs py-2 px-3">
          View <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}
