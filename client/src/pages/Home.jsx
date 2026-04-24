import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, AlertCircle, CalendarCheck, Plus, Sparkles } from 'lucide-react';
import Navbar    from '../components/shared/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import ChildCard from '../components/child/ChildCard';
import Loader    from '../components/shared/Loader';
import { getChildren }          from '../api/child.api';
import { getAnalyticsOverview } from '../api/program.api';
import useAuthStore             from '../store/authStore';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Home() {
  const { user } = useAuthStore();

  const { data: childrenData, isLoading, isError } = useQuery({
    queryKey: ['children'],
    queryFn:  () => getChildren().then(r => r.data),
  });

  const { data: overviewData } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  () => getAnalyticsOverview().then(r => r.data),
    staleTime: 60_000,
  });

  const children = childrenData?.children || [];
  const overview = overviewData || {};

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {greeting}, <span style={{ color: '#6366f1' }}>{user?.name?.split(' ')[0] || 'BCBA'}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Your caseload overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link to="/children/new" className="btn-primary">
            <Plus size={15} /> Add Child
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div variants={stagger} initial="initial" animate="animate"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Users size={18} />,         label: 'Active Children',    value: overview.totalChildren         ?? children.length, sub: 'on your caseload',      color: 'indigo' },
            { icon: <FileText size={18} />,      label: 'Programs This Week', value: overview.programsThisWeek      ?? 0,               sub: 'generated last 7 days', color: 'green'  },
            { icon: <AlertCircle size={18} />,   label: 'Needs Program',      value: overview.childrenNeedingProgram ?? 0,              sub: 'no plan yet',           color: 'amber'  },
            { icon: <CalendarCheck size={18} />, label: 'Sessions This Week', value: overview.totalSessions         ?? 0,               sub: 'live sessions logged',  color: 'rose'   },
          ].map(s => (
            <motion.div key={s.label} variants={fadeUp}>
              <StatsCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Evidence Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="evidence-banner flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">Evidence Engine Active</p>
            <p className="text-xs text-indigo-600">1,689 clinical records ready · DREAM Study + Mendeley Therapy Library + XGBoost Prediction</p>
          </div>
        </motion.div>

        {/* Children */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Your Children</h2>
          <Link to="/analytics" className="text-sm font-medium hover:underline" style={{ color: '#6366f1' }}>
            View Analytics →
          </Link>
        </div>

        {isLoading ? (
          <Loader text="Loading children…" />
        ) : isError ? (
          <div className="glass-card text-center py-16">
            <p className="text-red-500 font-medium">Failed to load children</p>
            <p className="text-slate-400 text-sm mt-1">Check your connection and refresh</p>
          </div>
        ) : children.length === 0 ? (
          <div className="glass-card text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'rgba(99,102,241,0.08)' }}>
              <Users size={28} className="text-indigo-300" />
            </div>
            <p className="text-slate-600 font-medium">No children yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Add your first child to generate an evidence-based ABA program</p>
            <Link to="/children/new" className="btn-primary inline-flex">
              <Plus size={14} /> Add First Child
            </Link>
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map(child => (
              <motion.div key={child._id} variants={fadeUp}>
                <ChildCard child={child} lastProgramDate={null} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
