import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { generateProgram, getProgramStatus } from '../../api/program.api';
import { useToast } from '../shared/Toast';

const STEPS_LABELS = [
  'Loading profile',
  'ML prediction',
  'Decay analysis',
  'Finding similar cases',
  'Building prompt',
  'Generating program',
  'Digital twin',
  'Pre-generating pivots',
  'Saving to database',
  'Complete',
];

function progressToStep(p) {
  if (p >= 100) return 9;
  if (p >= 94)  return 8;
  if (p >= 84)  return 7;
  if (p >= 72)  return 6;
  if (p >= 60)  return 5;
  if (p >= 50)  return 4;
  if (p >= 40)  return 3;
  if (p >= 30)  return 2;
  if (p >= 20)  return 1;
  return 0;
}

export default function ProgramGenerator({ childId }) {
  const [status,     setStatus]     = useState('idle');   // idle | queued | active | completed | failed
  const [progress,   setProgress]   = useState(0);
  const [programId,  setProgramId]  = useState(null);
  const [jobId,      setJobId]      = useState(null);
  const intervalRef = useRef(null);
  const toast       = useToast();
  const navigate    = useNavigate();

  const poll = async (jId) => {
    try {
      const { data } = await getProgramStatus(jId);
      setProgress(data.progress || 0);
      setStatus(data.state);
      if (data.state === 'completed') {
        clearInterval(intervalRef.current);
        setProgramId(data.programId);
      }
      if (data.state === 'failed') {
        clearInterval(intervalRef.current);
        toast('Program generation failed. Try again.', 'error');
      }
    } catch (_) {}
  };

  const kickoff = async () => {
    setStatus('queued');
    setProgress(0);
    try {
      const { data } = await generateProgram(childId);
      setJobId(data.jobId);
      intervalRef.current = setInterval(() => poll(data.jobId), 2000);
    } catch (err) {
      setStatus('idle');
      toast(err.response?.data?.error || 'Failed to start generation', 'error');
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const stepIdx   = progressToStep(progress);
  const isRunning = status === 'queued' || status === 'active';

  if (status === 'completed' && programId) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl border border-green-200 p-8 text-center shadow-sm">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-1">Program Ready</h3>
        <p className="text-slate-500 text-sm mb-6">Generated in {progress === 100 ? 'under 5 minutes' : '—'} for ₹0.124</p>
        <button onClick={() => navigate(`/programs/${programId}`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
          View Full Program →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      {!isRunning ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={30} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Generate ABA Program</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            AI-powered, personalised to this child's profile. ML prediction + ChromaDB RAG + Claude Haiku.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 mb-8">
            <div className="text-center"><p className="font-bold text-2xl text-indigo-600">₹0.124</p><p>per program</p></div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center"><p className="font-bold text-2xl text-indigo-600">&lt;5 min</p><p>generation time</p></div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center"><p className="font-bold text-2xl text-indigo-600">6–8</p><p>activities</p></div>
          </div>
          <button onClick={kickoff}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors shadow-sm">
            Generate Program
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Loader2 size={20} className="text-indigo-600 animate-spin" />
            <h3 className="font-semibold text-slate-800">Generating program…</h3>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {STEPS_LABELS.map((label, i) => {
              const done    = i < stepIdx;
              const current = i === stepIdx;
              return (
                <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${i > stepIdx ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs
                    ${done    ? 'bg-green-500 text-white' : ''}
                    ${current ? 'bg-indigo-600 text-white' : ''}
                    ${!done && !current ? 'bg-slate-200 text-slate-400' : ''}
                  `}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={current ? 'text-indigo-700 font-medium' : done ? 'text-green-700' : 'text-slate-400'}>
                    {label}
                    {current && <span className="ml-1.5 text-xs text-indigo-400">running…</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
