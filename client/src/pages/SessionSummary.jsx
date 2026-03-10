import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Calendar, Zap, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar  from '../components/shared/Navbar';
import Loader  from '../components/shared/Loader';
import { getSessionSummary } from '../api/program.api';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'text-green-600 bg-green-50 border-green-200'
               : score >= 40 ? 'text-amber-600 bg-amber-50 border-amber-200'
               :               'text-red-600   bg-red-50   border-red-200';
  return (
    <div className={`inline-flex flex-col items-center px-6 py-4 rounded-2xl border-2 ${color}`}>
      <span className="text-4xl font-bold">{score}%</span>
      <span className="text-xs font-medium mt-1">Engagement Score</span>
    </div>
  );
}

export default function SessionSummary() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['session-summary', id],
    queryFn:  () => getSessionSummary(id).then(r => r.data),
  });

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Navbar /><Loader text="Loading summary…" /></div>;

  if (isError || !data?.session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-red-500 font-medium">Could not load session summary.</p>
          <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const session  = data.session;
  const child    = session.childId;
  const logs     = session.activityLogs || [];
  const engaged  = logs.filter(l => l.result === 'engaged').length;
  const resistant= logs.filter(l => l.result === 'resistant').length;
  const pivoted  = logs.filter(l => l.result === 'pivoted').length;

  // Per-activity breakdown
  const activityMap = {};
  logs.forEach(l => {
    if (!activityMap[l.activityId]) activityMap[l.activityId] = { engaged: 0, resistant: 0, pivoted: 0 };
    activityMap[l.activityId][l.result]++;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={15} /> Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">
                <User size={20} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">{child?.name || 'Unknown Child'}</h1>
                <p className="text-sm text-slate-500">{child?.age} yrs · {child?.diagnosisLevel}</p>
              </div>
            </div>
            <ScoreBadge score={session.overallEngagementScore ?? 0} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
            <Calendar size={13} />
            <span>Session on <span className="text-slate-600 font-medium">{fmt(session.sessionDate)}</span></span>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Zap size={18} className="text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-800">{engaged}</p>
            <p className="text-xs text-slate-500 mt-0.5">Engaged</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <AlertCircle size={18} className="text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-800">{resistant}</p>
            <p className="text-xs text-slate-500 mt-0.5">Resistant</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <RefreshCw size={18} className="text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-800">{pivoted}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pivoted</p>
          </div>
        </div>

        {/* Per-activity breakdown */}
        {Object.keys(activityMap).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-indigo-500" /> Activity Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(activityMap).map(([actId, counts]) => {
                const total = counts.engaged + counts.resistant + counts.pivoted;
                const pct = total > 0 ? Math.round(((counts.engaged * 2 + counts.pivoted) / (total * 2)) * 100) : 0;
                return (
                  <div key={actId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-600 truncate">{actId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs shrink-0">
                      <span className="text-green-600 font-medium">{counts.engaged}E</span>
                      <span className="text-red-400 font-medium">{counts.resistant}R</span>
                      <span className="text-amber-500 font-medium">{counts.pivoted}P</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {logs.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
            No activity logs recorded for this session.
          </div>
        )}

      </main>
    </div>
  );
}
