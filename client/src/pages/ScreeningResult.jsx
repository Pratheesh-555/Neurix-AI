import { useParams, Link } from 'react-router-dom';
import { useQuery }        from '@tanstack/react-query';
import { ArrowLeft, Brain, ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Loader from '../components/shared/Loader';
import { getScreening } from '../api/screening.api';

const QUESTIONS = [
  'Does the child rarely or never make eye contact during conversation or play?',
  'Does the child rarely point to show you something interesting (not just to request)?',
  'Does the child fail to respond to their name when called in a quiet environment?',
  'Does the child rarely share enjoyment by alternating gaze between an object and you?',
  'Does the child show little interest in other children or prefer to play alone?',
  'Does the child engage in repetitive movements such as hand-flapping, rocking, or spinning?',
  'Does the child insist on identical routines and become distressed when they change?',
  'Does the child focus obsessively on parts of objects (e.g., spinning wheels, lining up items)?',
  'Does the child have an unusually intense, narrow interest that dominates their attention?',
  'Does the child repeat words or phrases out of context (echolalia)?',
  'Does the child show unusual sensitivity to sounds (covering ears, distress at normal volumes)?',
  'Does the child seek sensory input intensely (spinning, crashing, mouthing objects)?',
  'Does the child react unusually strongly to certain textures in food or clothing?',
  'Does the child appear to not notice pain or temperature at normal thresholds?',
  'Does the child avoid or strongly resist physical contact such as hugs?',
  'Does the child have significant difficulty initiating or maintaining back-and-forth conversation?',
  'Does the child rarely or never use gestures (waving, nodding, shaking head)?',
  'Does the child have difficulty understanding or expressing emotions appropriately?',
  'Does the child rarely imitate the actions or play of others?',
  'Does the child have trouble transitioning between activities without significant distress?',
];

const DOMAINS = [
  { label: 'Social Communication', range: [0, 5]  },
  { label: 'Repetitive Behavior',  range: [5, 10] },
  { label: 'Sensory Processing',   range: [10, 15] },
  { label: 'Communication',        range: [15, 20] },
];

function RiskBadge({ level }) {
  const cfg = {
    'Low Risk':    { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  Icon: ShieldCheck   },
    'Medium Risk': { bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  Icon: AlertTriangle },
    'High Risk':   { bg: 'bg-red-50   border-red-200',    text: 'text-red-700',    Icon: ShieldAlert   },
  }[level];
  return (
    <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 ${cfg.bg}`}>
      <cfg.Icon size={20} className={cfg.text} />
      <span className={`text-xl font-bold ${cfg.text}`}>{level}</span>
    </div>
  );
}

export default function ScreeningResult() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['screening', id],
    queryFn:  () => getScreening(id).then(r => r.data),
  });

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Navbar /><Loader text="Loading screening results…" /></div>;
  if (isError || !data?.screening) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-red-500 font-medium">Could not load screening result.</p>
        <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">Back to Home</Link>
      </main>
    </div>
  );

  const { screening } = data;
  const child   = screening.childId;
  const answers = screening.answers;
  const snap    = screening.sessionSnapshot;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">

        <Link to={`/children/${child?._id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={15} /> Back to {child?.name || 'Child'}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center">
                <Brain size={20} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">{child?.name} — Autism Screening</h1>
                <p className="text-sm text-slate-500">{child?.age} yrs · {child?.diagnosisLevel}</p>
              </div>
            </div>
            <RiskBadge level={screening.riskLevel} />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-4">
            <span>Score: <strong className="text-slate-800">{screening.totalScore}/20</strong></span>
            <span>Date: <strong className="text-slate-800">
              {new Date(screening.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </strong></span>
          </div>
        </div>

        {/* LLM Clinical Interpretation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Brain size={15} className="text-purple-500" /> Clinical Interpretation
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {screening.llmInterpretation || '—'}
          </p>
        </div>

        {/* Domain breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-indigo-500" /> Score by Domain
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map(({ label, range: [start, end] }) => {
              const concerns = answers.slice(start, end).reduce((s, a) => s + a, 0);
              const pct      = (concerns / 5) * 100;
              const barColor = concerns >= 4 ? 'bg-red-500' : concerns >= 2 ? 'bg-amber-400' : 'bg-green-400';
              return (
                <div key={label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{concerns}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session behavioral context */}
        {snap?.totalSessions > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
            <h2 className="font-semibold text-slate-800 mb-3">Session Behavioral Context</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Sessions Analysed', `${snap.totalSessions}`],
                ['Avg Engagement',    `${snap.avgEngagementScore}%`],
                ['Resistance Rate',   `${snap.resistanceRate}%`],
                ['Pivot Rate',        `${snap.pivotRate}%`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagged questions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">
            Flagged Concerns ({screening.totalScore})
          </h2>
          {screening.totalScore === 0 ? (
            <p className="text-sm text-slate-400">No behavioral concerns were flagged.</p>
          ) : (
            <div className="space-y-2">
              {QUESTIONS.map((q, i) => answers[i] === 1 && (
                <div key={i} className="flex gap-2 items-start text-sm p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-red-500 font-semibold shrink-0">Q{i + 1}</span>
                  <span className="text-red-700">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
