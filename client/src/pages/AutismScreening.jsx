import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Navbar          from '../components/shared/Navbar';
import ProgressStepper from '../components/shared/ProgressStepper';
import { useToast }    from '../components/shared/Toast';
import { submitScreening } from '../api/screening.api';

const STEP_LABELS = ['Social Communication', 'Repetitive Behaviors', 'Sensory Processing', 'Communication'];

const QUESTIONS = [
  // Social Communication (0-4)
  'Does the child rarely or never make eye contact during conversation or play?',
  'Does the child rarely point to show you something interesting (not just to request)?',
  'Does the child fail to respond to their name when called in a quiet environment?',
  'Does the child rarely share enjoyment by alternating gaze between an object and you?',
  'Does the child show little interest in other children or prefer to play alone?',
  // Repetitive Behavior (5-9)
  'Does the child engage in repetitive movements such as hand-flapping, rocking, or spinning?',
  'Does the child insist on identical routines and become distressed when they change?',
  'Does the child focus obsessively on parts of objects (e.g., spinning wheels, lining up items)?',
  'Does the child have an unusually intense, narrow interest that dominates their attention?',
  'Does the child repeat words or phrases out of context (echolalia)?',
  // Sensory Processing (10-14)
  'Does the child show unusual sensitivity to sounds (covering ears, distress at normal volumes)?',
  'Does the child seek sensory input intensely (spinning, crashing, mouthing objects)?',
  'Does the child react unusually strongly to certain textures in food or clothing?',
  'Does the child appear to not notice pain or temperature at normal thresholds?',
  'Does the child avoid or strongly resist physical contact such as hugs?',
  // Communication & Flexibility (15-19)
  'Does the child have significant difficulty initiating or maintaining back-and-forth conversation?',
  'Does the child rarely or never use gestures (waving, nodding, shaking head)?',
  'Does the child have difficulty understanding or expressing emotions appropriately?',
  'Does the child rarely imitate the actions or play of others?',
  'Does the child have trouble transitioning between activities without significant distress?',
];

export default function AutismScreening() {
  const { id: childId } = useParams();
  const navigate        = useNavigate();
  const toast           = useToast();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState(new Array(20).fill(-1));

  const setAnswer = (idx, val) => {
    setAnswers(prev => { const next = [...prev]; next[idx] = val; return next; });
  };

  const stepAnswered = () => answers.slice(step * 5, step * 5 + 5).every(a => a !== -1);

  const { mutate, isPending } = useMutation({
    mutationFn: () => submitScreening({ childId, answers }),
    onSuccess: (res) => {
      toast('Screening complete', 'success');
      navigate(`/screening/${res.data.screening._id}`);
    },
    onError: (err) => toast(err.response?.data?.error || 'Submission failed', 'error'),
  });

  const base = step * 5;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link to={`/children/${childId}`} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Autism Screening</h1>
            <p className="text-slate-500 text-sm">M-CHAT-R style 20-question behavioral checklist</p>
          </div>
        </div>

        <div className="mb-8">
          <ProgressStepper steps={STEP_LABELS} current={step} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">{STEP_LABELS[step]}</h2>
          <p className="text-sm text-slate-500 mb-6">
            Questions {base + 1}–{base + 5} of 20. Answer based on typical observed behavior.
          </p>

          <div className="space-y-6">
            {QUESTIONS.slice(base, base + 5).map((q, i) => {
              const idx = base + i;
              return (
                <div key={idx}>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    <span className="text-indigo-500 font-semibold mr-1">{idx + 1}.</span>{q}
                  </p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Yes — concern', val: 1, sel: 'border-red-400 bg-red-50 text-red-700' },
                      { label: 'No — typical',  val: 0, sel: 'border-green-400 bg-green-50 text-green-700' },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => setAnswer(idx, opt.val)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${answers[idx] === opt.val
                            ? opt.sel
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
              Back
            </button>
            {step < STEP_LABELS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!stepAnswered()}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-indigo-300 transition-colors">
                Continue
              </button>
            ) : (
              <button onClick={() => mutate()} disabled={!stepAnswered() || isPending}
                className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:bg-purple-300 transition-colors">
                {isPending ? 'Analysing…' : 'Submit Screening'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
