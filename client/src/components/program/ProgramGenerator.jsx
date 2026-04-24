import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, Loader2, Database, Brain, FlaskConical, Sparkles, FileText } from 'lucide-react';
import { generateProgram, getProgramStatus } from '../../api/program.api';
import { useToast } from '../shared/Toast';

const STEPS = [
  { label: 'Loading child profile',   icon: <FileText size={13} />,     desc: 'Reading clinical baseline data' },
  { label: 'ML prediction',           icon: <Brain size={13} />,         desc: 'XGBoost success probability analysis' },
  { label: 'Decay analysis',          icon: <FlaskConical size={13} />,  desc: 'Estimating plateau & rotation week' },
  { label: 'Evidence retrieval',      icon: <Database size={13} />,      desc: 'Querying DREAM + Mendeley (1,689 records)' },
  { label: 'Assembling evidence',     icon: <Sparkles size={13} />,      desc: 'Building clinical context package' },
  { label: 'Generating ABA plan',     icon: <Brain size={13} />,         desc: 'Claude synthesising evidence into plan' },
  { label: 'Digital twin projection', icon: <FlaskConical size={13} />,  desc: 'Forecasting long-term trajectory' },
  { label: 'Pre-generating pivots',   icon: <Zap size={13} />,           desc: 'Creating backup pivots per activity' },
  { label: 'Saving to database',      icon: <FileText size={13} />,      desc: 'Persisting program + evidence references' },
  { label: 'Complete',                icon: <CheckCircle size={13} />,   desc: 'Program ready for BCBA review' },
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
  const [status,    setStatus]    = useState('idle');
  const [progress,  setProgress]  = useState(0);
  const [programId, setProgramId] = useState(null);
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
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
          <CheckCircle size={30} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Program Ready</h3>
        <p className="text-slate-500 text-sm mb-2">Evidence-grounded ABA plan generated successfully</p>
        <p className="text-xs text-slate-400 mb-8">Sourced from DREAM Clinical Study + Mendeley Therapy Library</p>
        <button onClick={() => navigate(`/programs/${programId}`)} className="btn-primary text-base px-8 py-3">
          View Full Program →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-8">
      {!isRunning ? (
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <Zap size={36} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Generate Evidence-Based Program</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Powered by the DREAM Clinical Study (4,000+ sessions) and Mendeley Therapy Library. Every activity is grounded in historical evidence.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {[
              { val: '1,689', label: 'Clinical records' },
              { val: '<5 min', label: 'Generation time' },
              { val: '6–8', label: 'Activities' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>{s.val}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Evidence badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <span className="badge badge-indigo flex items-center gap-1"><Database size={10} /> DREAM Dataset</span>
            <span className="badge badge-purple flex items-center gap-1"><Database size={10} /> Mendeley Library</span>
            <span className="badge badge-green flex items-center gap-1"><Brain size={10} /> XGBoost Prediction</span>
            <span className="badge badge-amber flex items-center gap-1"><Sparkles size={10} /> Claude 3.5 Sonnet</span>
          </div>

          <button onClick={kickoff} className="btn-primary text-sm px-10 py-3">
            <Zap size={15} /> Generate Program
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
            <div>
              <h3 className="font-semibold text-slate-800">Generating evidence-based program…</h3>
              <p className="text-xs text-slate-400 mt-0.5">Querying {1689} clinical records in ChromaDB</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-track mb-6">
            <motion.div className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: [0.34, 1.56, 0.64, 1], duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-right text-slate-400 -mt-5 mb-6">{progress}%</p>

          {/* Steps */}
          <div className="space-y-1">
            <AnimatePresence>
              {STEPS.map((step, i) => {
                const done    = i < stepIdx;
                const current = i === stepIdx;
                const future  = i > stepIdx;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: future ? 0.3 : 1, x: 0 }}
                    className="flex items-center gap-3 py-1.5 px-3 rounded-xl transition-all"
                    style={{ background: current ? 'rgba(99,102,241,0.06)' : 'transparent' }}>

                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all"
                         style={{
                           background: done    ? 'linear-gradient(135deg, #10b981, #34d399)' :
                                       current ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' :
                                                 'rgba(0,0,0,0.06)',
                           color: done || current ? '#fff' : '#94a3b8',
                           boxShadow: done    ? '0 2px 8px rgba(16,185,129,0.4)'  :
                                      current ? '0 2px 8px rgba(99,102,241,0.5)' : 'none',
                         }}>
                      {done ? '✓' : i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none"
                         style={{ color: done ? '#059669' : current ? '#6366f1' : '#94a3b8' }}>
                        {step.label}
                        {current && <span className="ml-2 text-[10px] font-normal text-indigo-400 animate-pulse">running…</span>}
                      </p>
                      {current && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                      )}
                    </div>

                    <span className="text-slate-300 shrink-0">{step.icon}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
