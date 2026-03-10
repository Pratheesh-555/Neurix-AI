import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, AlertCircle, CalendarCheck, Plus } from 'lucide-react';
import Navbar    from '../components/shared/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import ChildCard from '../components/child/ChildCard';
import Loader    from '../components/shared/Loader';
import { getChildren }          from '../api/child.api';
import { getAnalyticsOverview } from '../api/program.api';
import useAuthStore             from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  const { data: childrenData, isLoading, isError } = useQuery({
    queryKey: ['children'],
    queryFn:  () => getChildren().then(r => r.data),
  });

  // Single request replaces N parallel getProgramHistory calls
  const { data: overviewData } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  () => getAnalyticsOverview().then(r => r.data),
    staleTime: 60_000,
  });

  const children = childrenData?.children || [];
  const overview = overviewData || {};

  const lastProgramDateByChild = {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Here's your caseload overview for today
            </p>
          </div>
          <Link to="/children/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
            <Plus size={16} /> Add Child
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<Users size={20} />}         label="Active Children"    value={overview.totalChildren        ?? children.length} sub="on your caseload"      color="indigo" />
          <StatsCard icon={<FileText size={20} />}      label="Programs This Week" value={overview.programsThisWeek     ?? 0}               sub="generated last 7 days" color="green"  />
          <StatsCard icon={<AlertCircle size={20} />}   label="Needs Program"      value={overview.childrenNeedingProgram ?? 0}             sub="no program yet"        color="amber"  />
          <StatsCard icon={<CalendarCheck size={20} />} label="Sessions This Week" value={overview.totalSessions        ?? 0}               sub="live sessions logged"  color="indigo" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Your Children</h2>
          <Link to="/analytics" className="text-sm text-indigo-600 hover:underline">View Analytics →</Link>
        </div>

        {isLoading ? (
          <Loader text="Loading children…" />
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-xl border border-red-100">
            <p className="text-red-500 font-medium">Failed to load children</p>
            <p className="text-slate-400 text-sm mt-1">Check your connection and refresh</p>
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No children yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Add your first child to generate their ABA program</p>
            <Link to="/children/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              <Plus size={15} /> Add First Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map(child => (
              <ChildCard
                key={child._id}
                child={child}
                lastProgramDate={lastProgramDateByChild[child._id] || null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
