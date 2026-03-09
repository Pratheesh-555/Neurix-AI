import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery }        from '@tanstack/react-query';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Navbar            from '../components/shared/Navbar';
import Loader            from '../components/shared/Loader';
import ResistanceTracker from '../components/program/ResistanceTracker';
import { getSessionSummary } from '../api/program.api';
import { getProgram }        from '../api/program.api';
import useSessionStore       from '../store/sessionStore';

// Fallback mock activities for when program hasn't completed yet (no Claude credits)
const MOCK_ACTIVITIES = [
  { id: 'act_1', name: 'Dino Eye-Contact Game', theme: 'Dinosaur Expedition', difficulty: 'Easy', objective: 'Sustain eye contact for 3 seconds', duration: 10, successMetric: '4/5 trials' },
  { id: 'act_2', name: 'Dino Sound Imitation',  theme: 'Dinosaur Sounds',     difficulty: 'Easy', objective: 'Imitate 2 animal sounds on request', duration: 8, successMetric: '3/5 trials' },
  { id: 'act_3', name: 'Dino Matching Pairs',   theme: 'Dinosaur Museum',     difficulty: 'Medium', objective: 'Match identical pictures across 3 categories', duration: 12, successMetric: '4/6 cards' },
];

export default function LiveSession() {
  const { id: sessionId } = useParams();
  const { initSession, logs, engagementScore, activities: storeActivities, sessionId: storedId } = useSessionStore();

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn:  () => getSessionSummary(sessionId).then(r => r.data),
  });

  const session   = summaryData?.session;
  const programId = session?.programId?._id || session?.programId;

  const { data: programData } = useQuery({
    queryKey: ['program', programId],
    queryFn:  () => getProgram(programId).then(r => r.data),
    enabled:  !!programId,
  });

  const activities = programData?.program?.program?.activities || MOCK_ACTIVITIES;

  // Initialise Zustand store when session loads
  useEffect(() => {
    if (session && storedId !== sessionId) {
      initSession(sessionId, programId, activities);
    }
  }, [session, sessionId]);

  const engaged   = logs.filter(l => l.result === 'engaged').length;
  const resistant = logs.filter(l => l.result === 'resistant').length;
  const pivoted   = logs.filter(l => l.result === 'pivoted').length;
  const total     = logs.length;
  const score     = total > 0 ? Math.round(((engaged * 2 + pivoted) / (total * 2)) * 100) : 0;

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Navbar /><Loader text="Loading session…" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Live Session</h1>
            <p className="text-slate-500 text-sm">
              {session?.childId?.name || 'Child'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Live stats bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-green-600">{engaged}</p>
              <p className="text-xs text-slate-400">Engaged ✅</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{resistant}</p>
              <p className="text-xs text-slate-400">Resistant ❌</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{pivoted}</p>
              <p className="text-xs text-slate-400">Pivoted 🔄</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {score}%
              </p>
              <p className="text-xs text-slate-400">Engagement</p>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          )}
        </div>

        {/* Instructions banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-sm text-indigo-800">
          <span className="font-medium">How to use: </span>
          Tap ✅ Engaged or ❌ Resistant after each activity trial.
          After <strong>3 consecutive ❌</strong> on the same activity, a pivot alternative appears automatically.
        </div>

        {/* Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act, i) => (
            <ResistanceTracker
              key={act.id || i}
              activity={act}
              sessionId={sessionId}
              index={i}
            />
          ))}
        </div>

        {/* Session summary link */}
        {session && (
          <div className="mt-8 text-center">
            <Link to={`/sessions/${sessionId}/summary`}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
              <BarChart3 size={15} /> View Full Session Summary
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
