import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import ProgressStepper  from '../shared/ProgressStepper';
import InterestTagInput from './InterestTagInput';
import { createChild, updateChild } from '../../api/child.api';
import { useToast } from '../shared/Toast';
import {
  DIAGNOSIS_LEVELS, COMMUNICATION_LEVELS, LEARNING_STYLES
} from '../../utils/constants';

// ── Sai Teja — Stream 1: Personalization Engine
// Step 1: name, age, diagnosis level
// Step 2: communication level + learning style
// Step 3: interests — tag input, minimum 3  ← MOST IMPORTANT
// Step 4: sensory profile — hypersensitive triggers as tags
// Step 5: goals — tag input, minimum 2

const STEPS = ['Basic Info', 'Communication', 'Interests', 'Sensory Profile', 'Goals'];

// ── Defined outside the component so React never remounts it on re-render ──
function Select({ label, field, value, onChange, options, required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && ' *'}
      </label>
      <select
        value={value}
        onChange={e => onChange(field, e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const EMPTY = {
  name: '', age: '', diagnosisLevel: '',
  communicationLevel: '', learningStyle: '',
  interests: [],
  sensoryProfile: { hypersensitive: [], hyposensitive: [], seeksBehaviors: [] },
  targetGoals: [],
  // extra fields kept for API compatibility
  obsessionIntensity: '', behavioralChallenges: [], currentSkills: [],
  previousTherapyMonths: 0,
};

export default function ChildProfileForm({ existing }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(existing ? { ...EMPTY, ...existing } : EMPTY);
  const navigate     = useNavigate();
  const toast        = useToast();
  const qc           = useQueryClient();

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setSensory = (key, val) => setForm(f => ({ ...f, sensoryProfile: { ...f.sensoryProfile, [key]: val } }));

  const mutation = useMutation({
    mutationFn: existing
      ? (data) => updateChild(existing._id, data)
      : (data) => createChild(data),
    onSuccess: (res) => {
      qc.invalidateQueries(['children']);
      const childId = existing?._id ?? res.data?.child?._id;
      toast(
        existing ? 'Profile updated — ready to generate program' : 'Profile created — ready to generate program',
        'success'
      );
      navigate(existing ? `/children/${childId}` : `/children/${childId}`);
    },
    onError: (err) => toast(err.response?.data?.error || 'Save failed', 'error'),
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // Per-step validation before allowing Continue
  const canContinue = () => {
    if (step === 0) return form.name.trim() && form.age && form.diagnosisLevel;
    if (step === 1) return form.communicationLevel;
    if (step === 2) return form.interests.length >= 3;
    if (step === 4) return form.targetGoals.length >= 2;
    return true;
  };

  const submit = () => {
    if (form.targetGoals.length < 2) {
      toast('Please add at least 2 goals', 'error');
      return;
    }
    const payload = { ...form, age: Number(form.age) };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <ProgressStepper steps={STEPS} current={step} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

        {/* ── Step 1: Basic Info ──────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">Tell us about the child</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Child's Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Aryan"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Age *</label>
              <input
                type="number" min={2} max={18}
                value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Select label="Diagnosis Level *" field="diagnosisLevel" value={form.diagnosisLevel} onChange={set} options={DIAGNOSIS_LEVELS} />
          </div>
        )}

        {/* ── Step 2: Communication + Learning Style ──────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Communication & Learning</h2>
              <p className="text-sm text-slate-500 mt-0.5">How does the child communicate and learn best?</p>
            </div>
            <Select label="Communication Level *" field="communicationLevel" value={form.communicationLevel} onChange={set} options={COMMUNICATION_LEVELS} />
            <Select label="Learning Style" field="learningStyle" value={form.learningStyle} onChange={set} options={LEARNING_STYLES} required={false} />
          </div>
        )}

        {/* ── Step 3: Interests (MOST IMPORTANT) ──────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800">Interests</h2>
                <span className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
                  <Sparkles size={11} /> Most Important
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                These drive activity themes. Add at least <strong>3</strong> — the more, the better.
              </p>
            </div>
            <div>
              <InterestTagInput
                value={form.interests}
                onChange={v => set('interests', v)}
                placeholder="Type an interest and press Enter…"
                tagColor="bg-indigo-100 text-indigo-700"
              />
              <p className={`text-xs mt-2 font-medium ${
                form.interests.length >= 3 ? 'text-green-600' : 'text-slate-400'
              }`}>
                {form.interests.length} / 3 minimum added
                {form.interests.length >= 3 && ' ✓'}
              </p>
            </div>
            {form.interests.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
                <strong>Tip:</strong> Think about what the child can talk about for hours — those make the best program themes.
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Sensory Profile ──────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Sensory Profile</h2>
              <p className="text-sm text-slate-500 mt-0.5">What triggers does the child need us to avoid?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hypersensitive Triggers</label>
              <InterestTagInput
                value={form.sensoryProfile.hypersensitive}
                onChange={v => setSensory('hypersensitive', v)}
                placeholder="Loud noises, bright lights, crowd…"
                tagColor="bg-orange-100 text-orange-700"
              />
              <p className="text-xs text-slate-400 mt-1.5">These will be avoided in all generated activities.</p>
            </div>
          </div>
        )}

        {/* ── Step 5: Goals ───────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Therapy Goals</h2>
              <p className="text-sm text-slate-500 mt-0.5">What should this child achieve? Add at least <strong>2</strong>.</p>
            </div>
            <div>
              <InterestTagInput
                value={form.targetGoals}
                onChange={v => set('targetGoals', v)}
                placeholder="e.g. Eye contact, turn-taking, following 2-step instructions…"
                tagColor="bg-green-100 text-green-700"
              />
              <p className={`text-xs mt-2 font-medium ${
                form.targetGoals.length >= 2 ? 'text-green-600' : 'text-slate-400'
              }`}>
                {form.targetGoals.length} / 2 minimum added
                {form.targetGoals.length >= 2 && ' ✓'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={back} disabled={step === 0}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} disabled={!canContinue()}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-indigo-300 transition-colors">
              Continue
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={mutation.isPending || form.targetGoals.length < 2}
              className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:bg-green-400 transition-colors">
              {mutation.isPending ? 'Saving…' : existing ? 'Update Profile' : 'Create Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
