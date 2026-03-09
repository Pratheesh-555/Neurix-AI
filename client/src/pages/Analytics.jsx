import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import Navbar    from '../components/shared/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import Loader    from '../components/shared/Loader';
import { getMe }             from '../api/auth.api';
import { getChildren }       from '../api/child.api';
import { getProgramHistory } from '../api/program.api';
import useAuthStore          from '../store/authStore';

// Demo data — always shown when real data is absent
const DEMO_SUCCESS = [
  { name: 'Aryan', probability: 73 },
  { name: 'Priya', probability: 81 },
  { name: 'Rohan', probability: 62 },
];

const DEMO_ENGAGEMENT = [
  { day: 'Mon', engaged: 65, resistant: 25, pivoted: 10 },
  { day: 'Tue', engaged: 72, resistant: 18, pivoted: 10 },
  { day: 'Wed', engaged: 68, resistant: 22, pivoted: 10 },
  { day: 'Thu', engaged: 80, resistant: 12, pivoted:  8 },
  { day: 'Fri', engaged: 75, resistant: 15, pivoted: 10 },
  { day: 'Sat', engaged: 70, resistant: 20, pivoted: 10 },
  { day: 'Sun', engaged: 78, resistant: 14, pivoted:  8 },
];

const DEMO_GOALS = [
  { name: 'Aryan',  completed: 2, remaining: 1, total: 3 },
  { name: 'Priya',  completed: 3, remaining: 0, total: 3 },
  { name: 'Rohan',  completed: 1, remaining: 2, total: 3 },
];

export default function Analytics() {
  const { user } = useAuthStore();

  const { data: meData }                      = useQuery({ queryKey: ['me'],       queryFn: () => getMe().then(r => r.data) });
  const { data: childrenData, isLoading }     = useQuery({ queryKey: ['children'], queryFn: () => getChildren().then(r => r.data) });

  const me       = meData?.user || user || {};
  const children = childrenData?.children || [];

  const { data: allPrograms } = useQuery({
    queryKey: ['all-programs'],
    queryFn: async () => {
      const results = await Promise.all(children.map(c => getProgramHistory(c._id).then(r => r.data.programs || [])));
      return results.flat().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    enabled: children.length > 0,
  });

  const programs  = allPrograms || [];
  const completed = programs.filter(p => p.status === 'completed');
  const avgSuccess = completed.length > 0
    ? Math.round(completed.reduce((s, p) => s + (p.mlPrediction?.successProbability || 0), 0) / completed.length)
    : 0;

  // Build real success data per child; fall back to demo
  const successData = children.length > 0
    ? children.map(child => {
        const childProgs = completed.filter(p => (p.childId?._id || p.childId) === child._id);
        const prob = childProgs.length > 0
          ? Math.round(childProgs.reduce((s, p) => s + (p.mlPrediction?.successProbability || 0), 0) / childProgs.length)
          : null;
        return { name: child.name, probability: prob };
      }).filter(d => d.probability !== null)
    : [];

  const successChartData = successData.length > 0 ? successData : DEMO_SUCCESS;
  const usingDemoSuccess  = successData.length === 0;

  // Build goal data from real children or demo
  const goalData = children.length > 0
    ? children.map(child => {
        const childProgs   = programs.filter(p => (p.childId?._id || p.childId) === child._id);
        const total        = (child.targetGoals || []).length || 3;
        const addressedPct = Math.min(childProgs.length, total);
        return { name: child.name, completed: addressedPct, remaining: total - addressedPct, total };
      })
    : DEMO_GOALS;
  const usingDemoGoals = children.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        </div>

        {isLoading ? <Loader /> : (
          <div className="space-y-6">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatsCard icon={<Users size={18} />}      label="Active Children"    value={children.length}                    color="indigo" />
              <StatsCard icon={<FileText size={18} />}   label="Programs Generated" value={me.totalProgramsGenerated || 0}     color="green"  />
              <StatsCard icon={<TrendingUp size={18} />} label="Avg Success Prob."  value={`${avgSuccess || 72}%`}             color="amber"  />
            </div>

            {/* Chart 1 — Success Probability per Child */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Success Probability per Child</h3>
                {usingDemoSuccess && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">sample data</span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={successChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={v => [`${v}%`, 'Success Probability']}
                  />
                  <Bar dataKey="probability" name="Success Probability" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2 — Session Engagement Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Session Engagement Trend</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">sample data</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEMO_ENGAGEMENT} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={v => [`${v}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="engaged"   name="Engaged"   stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pivoted"   name="Pivoted"   stackId="a" fill="#f59e0b" />
                  <Bar dataKey="resistant" name="Resistant" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3 — Goal Completion per Child */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Goal Completion Rate</h3>
                {usingDemoGoals && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">sample data</span>
                )}
              </div>
              <div className="space-y-4">
                {goalData.map(child => (
                  <div key={child.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{child.name}</span>
                      <span className="text-slate-500">{child.completed}/{child.total} goals addressed</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((child.completed / child.total) * 100)}%`,
                          backgroundColor: child.completed === child.total ? '#22c55e' : child.completed > 0 ? '#6366f1' : '#e2e8f0',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-child detail table */}
            {children.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Per-Child Summary</h3>
                <div className="space-y-3">
                  {children.map(child => {
                    const childPrograms = programs.filter(p => (p.childId?._id || p.childId) === child._id);
                    const avgPct = childPrograms.length > 0
                      ? Math.round(childPrograms.reduce((s, p) => s + (p.mlPrediction?.successProbability || 0), 0) / childPrograms.length)
                      : null;
                    return (
                      <div key={child._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{child.name}</p>
                          <p className="text-xs text-slate-400">{child.diagnosisLevel} · {childPrograms.length} programs</p>
                        </div>
                        {avgPct !== null ? (
                          <div className="text-right">
                            <p className={`text-sm font-bold ${avgPct >= 70 ? 'text-green-600' : avgPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                              {avgPct}%
                            </p>
                            <p className="text-xs text-slate-400">avg success</p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">No program yet</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
