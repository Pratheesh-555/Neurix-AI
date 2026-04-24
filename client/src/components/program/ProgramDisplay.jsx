import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Database, Sparkles, BookOpen, Calendar, Users, Activity } from 'lucide-react';
import OutcomePredictorPanel from './OutcomePredictorPanel';
import DigitalTwinPanel      from './DigitalTwinPanel';
import DecayPredictor        from './DecayPredictor';
import ActivityCard          from './ActivityCard';
import TherapistScript       from './TherapistScript';
import ParentHomePlan        from './ParentHomePlan';
import { approveProgram, startSession } from '../../api/program.api';
import { useToast } from '../shared/Toast';

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
      evidenceSource: 'Case 1 — DREAM Clinical Study (ADOS Total 14, Joint Attention Protocol)',
    },
    {
      id: 'act_2', name: 'Dino Sound Imitation', theme: 'Dinosaur Sounds', difficulty: 'Easy',
      objective: 'Imitate 2 animal sounds on request',
      instructions: '1. Show picture card\n2. BCBA models the sound\n3. Wait 5s\n4. Reinforce any vocalisation',
      duration: 8, successMetric: 'Spontaneous imitation on 3/5 trials',
      gamificationElement: 'Build a Dino Pack',
      reinforcementStrategy: 'High-five + verbal praise',
      sensoryConsiderations: 'Use soft voice; avoid sudden loud sounds',
      evidenceSource: 'Case 2 — Mendeley Therapy Library (anak perlu latihan imitasi)',
    },
  ],
  therapistScript: "Welcome to today's session! We're going on a dinosaur adventure.",
  weeklySchedule: { monday: ['act_1', 'act_2'], wednesday: ['act_1'], friday: ['act_2'] },
  parentHomeActivities: [{ name: 'Dino Book Time', instructions: 'Read together; wait for vocalisation.', frequency: 'daily', materials: ['dino book'] }],
  dataTrackingPlan: 'Record trial-by-trial data. Target: 80% independent in 4 consecutive sessions.',
  evidenceRationale: 'This plan draws on 2 similar cases: a child with ADOS Total 14 from the DREAM Clinical Study who responded well to Joint Attention activities, and a case from the Mendeley Therapy Library showing success with imitation-based tasks for children with emerging verbal communication.',
};

function EvidencePanel({ rationale, similarProfiles }) {
  if (!rationale && (!similarProfiles || similarProfiles.length === 0)) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="evidence-banner">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Database size={11} className="text-white" />
        </div>
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Clinical Evidence Base</p>
      </div>

      {rationale && (
        <p className="text-sm text-slate-700 leading-relaxed mb-3">{rationale}</p>
      )}

      {similarProfiles && similarProfiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {similarProfiles.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                 style={{ background: 'rgba(99,102,241,0.08)', color: '#4338ca' }}>
              <Sparkles size={9} />
              <span className="font-medium">
                {c.source === 'dream_dataset' ? 'DREAM' : 'Mendeley'}
              </span>
              <span className="text-indigo-400">
                {Math.round((c.similarityScore || 0) * 100)}% match
              </span>
              {c.protocol && <span className="text-indigo-300">· {c.protocol}</span>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ProgramDisplay({ program, childId }) {
  const [approved, setApproved] = useState(program?.status === 'approved');
  const toast = useToast();

  const content  = program?.program?.summary ? program.program : MOCK_PROGRAM;
  const ml       = program?.mlPrediction;
  const twin     = program?.digitalTwin;
  const decay    = ml?.decayPrediction;
  const evidence = content?.evidenceRationale || null;
  const similar  = program?.similarProfiles || [];

  const approveMutation = useMutation({
    mutationFn: () => approveProgram(program._id),
    onSuccess:  () => { setApproved(true); toast('Added to BCBA writing style (Ghost Mode)', 'success'); },
    onError:    () => toast('Could not approve program', 'error'),
  });

  const sessionMutation = useMutation({
    mutationFn: () => startSession(program._id),
    onSuccess:  (res) => { window.location.href = `/sessions/${res.data.sessionId}`; },
    onError:    () => toast('Could not start session', 'error'),
  });

  return (
    <div className="space-y-5">

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-green flex items-center gap-1">
                <CheckCircle size={9} /> Completed
              </span>
              <span className="text-xs text-slate-400">
                ₹{(program?.costInr || 0.124).toFixed(3)}
                {program?.generationTimeMs ? ` · ${(program.generationTimeMs / 1000).toFixed(1)}s` : ''}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">ABA Therapy Program</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{content.summary}</p>
          </div>

          <div className="flex gap-2 flex-wrap shrink-0">
            {!approved && (
              <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
                className="btn-ghost text-sm">
                <CheckCircle size={13} /> {approveMutation.isPending ? 'Approving…' : 'Approve (Ghost Mode)'}
              </button>
            )}
            {approved && (
              <span className="badge badge-green flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle size={13} /> In Ghost Mode
              </span>
            )}
            <button onClick={() => sessionMutation.mutate()} disabled={sessionMutation.isPending}
              className="btn-primary">
              <Play size={13} /> {sessionMutation.isPending ? 'Starting…' : 'Start Live Session'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Evidence banner */}
      <EvidencePanel rationale={evidence} similarProfiles={similar} />

      {/* ML + Digital Twin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OutcomePredictorPanel mlPrediction={ml} />
        <DigitalTwinPanel      digitalTwin={twin} />
      </div>

      {/* Decay */}
      {decay && <DecayPredictor decay={decay} />}

      {/* Activities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-slate-800">Activities ({content.activities?.length || 0})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.activities || []).map((act, i) => (
            <ActivityCard key={act.id || i} activity={act} index={i} />
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      {content.weeklySchedule && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Weekly Schedule</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(content.weeklySchedule).map(([day, plan]) => (
              <div key={day} className="text-center rounded-xl p-3"
                   style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wide">
                  {day.slice(0, 3)}
                </p>
                <p className="text-xs text-slate-600">{String(plan)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapist Script + Parent Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TherapistScript script={content.therapistScript} />
        <ParentHomePlan  plan={content.parentHomeActivities} />
      </div>

      {/* Data Tracking */}
      {content.dataTrackingPlan && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-indigo-500" />
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Data Tracking Plan</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{content.dataTrackingPlan}</p>
        </div>
      )}
    </div>
  );
}
