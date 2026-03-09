import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Play, CheckCircle, IndianRupee } from 'lucide-react';
import OutcomePredictorPanel from './OutcomePredictorPanel';
import DigitalTwinPanel      from './DigitalTwinPanel';
import DecayPredictor        from './DecayPredictor';
import ActivityCard          from './ActivityCard';
import TherapistScript       from './TherapistScript';
import ParentHomePlan        from './ParentHomePlan';
import { approveProgram, startSession } from '../../api/program.api';
import { useToast } from '../shared/Toast';

// Mock program used when Claude API credits are absent
const MOCK_PROGRAM = {
  summary: 'A 4-week ABA program focused on joint attention and communication through dinosaur-themed play activities.',
  activities: [
    {
      id: 'act_1', name: 'Dino Eye-Contact Game', theme: 'Dinosaur Expedition', difficulty: 'Easy',
      objective: 'Sustain eye contact for 3 seconds during play',
      instructions: '1. Hold favourite dinosaur at eye level\n2. Wait for child to look\n3. Say "great looking!" and hand over dino\n4. Repeat 5 times',
      duration: 10, successMetric: 'Eye contact ≥3 seconds on 4/5 trials',
      gamificationElement: 'Collect dino stickers for each successful look',
      reinforcementStrategy: 'Immediate access to preferred dinosaur toy',
      sensoryConsiderations: 'Keep room lighting warm; avoid fluorescent lights',
    },
    {
      id: 'act_2', name: 'Dino Sound Imitation', theme: 'Dinosaur Sounds', difficulty: 'Easy',
      objective: 'Imitate 2 animal sounds on request',
      instructions: '1. Show picture card of dinosaur\n2. BCBA models the sound (e.g. "roaaarrr")\n3. Wait 5s for imitation\n4. Reinforce any vocalisation',
      duration: 8, successMetric: 'Spontaneous imitation on 3/5 trials',
      gamificationElement: 'Build a Dino Pack — each sound adds a new dinosaur',
      reinforcementStrategy: 'High-five + verbal praise',
      sensoryConsiderations: 'Use soft voice; avoid sudden loud sounds',
    },
    {
      id: 'act_3', name: 'Dino Matching Pairs', theme: 'Dinosaur Museum', difficulty: 'Medium',
      objective: 'Match identical objects/pictures across 3 categories',
      instructions: '1. Lay 6 dino picture cards face up\n2. Hand child a card and say "find the same"\n3. Prompt physically if needed (least-to-most)',
      duration: 12, successMetric: 'Independent match on 4/6 trials',
      gamificationElement: 'Build a dinosaur museum display wall',
      reinforcementStrategy: 'Token board — 5 tokens = dino video clip',
      sensoryConsiderations: 'Laminated cards reduce sensory noise',
    },
  ],
  therapistScript: 'Welcome to today\'s session! We\'re going on a dinosaur adventure.\n\n[Activity 1 — Eye Contact]\n"Look at the T-Rex! Can you find it?" (hold at eye level, wait 3s)\n\n[Activity 2 — Sounds]\n"What sound does a T-Rex make? Let\'s try — ROARRR!" (model, wait, reinforce)\n\n[Activity 3 — Matching]\n"Let\'s build our museum. Find the same dinosaur!" (lay cards, prompt as needed)',
  weeklySchedule: { Monday: 'Act 1 + Act 2', Wednesday: 'Act 2 + Act 3', Friday: 'Act 1 + Act 3' },
  parentHomeActivities: [
    { activity: 'Dino Book Time (10 min)', description: 'Read together; pause and wait for child to vocalise or point.' },
    { activity: 'Eye Contact Game', description: 'Hold dino toy at eye level before handing over — wait for look.' },
    { activity: 'Sound Imitation Play', description: 'Make animal sounds during bath or mealtimes; celebrate any imitation.' },
  ],
  dataTrackingPlan: 'Record trial-by-trial data for each activity. Target: 80% independent in 4 consecutive sessions before advancing.',
};

export default function ProgramDisplay({ program, childId }) {
  const [approved, setApproved] = useState(program?.status === 'approved');
  const toast = useToast();

  // Use real program content or mock if not available (Claude credits absent)
  const content = program?.program?.summary ? program.program : MOCK_PROGRAM;
  const ml      = program?.mlPrediction;
  const twin    = program?.digitalTwin;
  const decay   = ml?.decayPrediction;

  const approveMutation = useMutation({
    mutationFn: () => approveProgram(program._id),
    onSuccess:  () => { setApproved(true); toast('Added to your writing style (Ghost Mode)', 'success'); },
    onError:    ()  => toast('Could not approve program', 'error'),
  });

  const sessionMutation = useMutation({
    mutationFn: () => startSession(program._id),
    onSuccess:  (res) => {
      window.location.href = `/sessions/${res.data.sessionId}`;
    },
    onError: () => toast('Could not start session', 'error'),
  });

  return (
    <div className="space-y-6">
      {/* Program Summary + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completed</span>
              <span className="text-xs text-slate-400">₹{(program?.costInr || 0.124).toFixed(3)} · {program?.generationTimeMs ? `${(program.generationTimeMs/1000).toFixed(1)}s` : '—'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">ABA Program</h2>
            <p className="text-slate-600 text-sm">{content.summary}</p>
          </div>

          <div className="flex gap-2 flex-wrap shrink-0">
            {!approved && (
              <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
                className="flex items-center gap-1.5 text-sm border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50">
                <CheckCircle size={14} /> {approveMutation.isPending ? 'Approving…' : 'Approve (Ghost Mode)'}
              </button>
            )}
            {approved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 border border-green-200 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle size={14} /> In Ghost Mode
              </span>
            )}
            <button onClick={() => sessionMutation.mutate()} disabled={sessionMutation.isPending}
              className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <Play size={14} /> {sessionMutation.isPending ? 'Starting…' : 'Start Live Session'}
            </button>
          </div>
        </div>
      </div>

      {/* ML + Digital Twin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutcomePredictorPanel mlPrediction={ml} />
        <DigitalTwinPanel      digitalTwin={twin} />
      </div>

      {/* Decay Predictor */}
      {decay && <DecayPredictor decay={decay} />}

      {/* Activities */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">
          Activities ({content.activities?.length || 0})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.activities || []).map((act, i) => (
            <ActivityCard key={act.id || i} activity={act} index={i} />
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      {content.weeklySchedule && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Weekly Schedule</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(content.weeklySchedule).map(([day, plan]) => (
              <div key={day} className="text-center bg-indigo-50 rounded-lg p-3">
                <p className="text-xs font-bold text-indigo-600 mb-1">{day}</p>
                <p className="text-xs text-slate-600">{String(plan)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapist Script + Parent Home Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TherapistScript script={content.therapistScript} />
        <ParentHomePlan  plan={content.parentHomeActivities} />
      </div>

      {/* Data Tracking */}
      {content.dataTrackingPlan && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-xs text-indigo-500 uppercase tracking-wide font-semibold mb-1">Data Tracking Plan</p>
          <p className="text-sm text-indigo-900">{content.dataTrackingPlan}</p>
        </div>
      )}
    </div>
  );
}
