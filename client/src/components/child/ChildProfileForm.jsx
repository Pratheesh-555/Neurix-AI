import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgressStepper  from '../shared/ProgressStepper';
import InterestTagInput from './InterestTagInput';
import { createChild, updateChild } from '../../api/child.api';
import { useToast } from '../shared/Toast';
import {
  DIAGNOSIS_LEVELS, COMMUNICATION_LEVELS,
  LEARNING_STYLES, OBSESSION_INTENSITY, SESSION_FREQUENCIES
} from '../../utils/constants';

const STEPS = ['Basic Info', 'Communication', 'Sensory & Behaviour', 'Therapy History', 'Review'];

const EMPTY = {
  name: '', age: '', diagnosisLevel: '', communicationLevel: '',
  learningStyle: '', obsessionIntensity: '',
  interests: [], behavioralChallenges: [], currentSkills: [], targetGoals: [],
  sensoryProfile: { hypersensitive: [], hyposensitive: [], seeksBehaviors: [] },
  previousTherapyMonths: 0, sessionFrequency: '3x per week', sessionDurationMinutes: 60,
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
      toast(existing ? 'Child updated' : 'Child created', 'success');
      navigate(existing ? `/children/${existing._id}` : `/children/${res.data.child._id}`);
    },
    onError: (err) => toast(err.response?.data?.error || 'Save failed', 'error'),
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = () => {
    const payload = { ...form, age: Number(form.age), previousTherapyMonths: Number(form.previousTherapyMonths) };
    mutation.mutate(payload);
  };

  const Select = ({ label, field, options, required = true }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && ' *'}</label>
      <select value={form[field]} onChange={e => set(field, e.target.value)} required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <ProgressStepper steps={STEPS} current={step} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">

        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Child's Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required
                  placeholder="Aryan" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Age *</label>
                <input type="number" min={2} max={18} value={form.age} onChange={e => set('age', e.target.value)} required
                  placeholder="7" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <Select label="Diagnosis Level" field="diagnosisLevel" options={DIAGNOSIS_LEVELS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Interests (press Enter to add)</label>
              <InterestTagInput value={form.interests} onChange={v => set('interests', v)} placeholder="Dinosaurs, trains, water play…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Obsession Intensity</label>
              <Select label="" field="obsessionIntensity" options={OBSESSION_INTENSITY} required={false} />
            </div>
          </div>
        )}

        {/* Step 1 — Communication */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Communication & Learning</h2>
            <Select label="Communication Level"   field="communicationLevel" options={COMMUNICATION_LEVELS} />
            <Select label="Learning Style"        field="learningStyle"      options={LEARNING_STYLES} required={false} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Goals (press Enter to add)</label>
              <InterestTagInput value={form.targetGoals} onChange={v => set('targetGoals', v)} placeholder="Eye contact, turn-taking…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Skills</label>
              <InterestTagInput value={form.currentSkills} onChange={v => set('currentSkills', v)} placeholder="Can match shapes, follows 1-step instructions…" />
            </div>
          </div>
        )}

        {/* Step 2 — Sensory & Behaviour */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Sensory Profile & Behaviour</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hypersensitive to (add triggers)</label>
              <InterestTagInput value={form.sensoryProfile.hypersensitive} onChange={v => setSensory('hypersensitive', v)} placeholder="Loud noises, bright lights…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hyposensitive to</label>
              <InterestTagInput value={form.sensoryProfile.hyposensitive} onChange={v => setSensory('hyposensitive', v)} placeholder="Touch, temperature…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sensory-Seeking Behaviours</label>
              <InterestTagInput value={form.sensoryProfile.seeksBehaviors} onChange={v => setSensory('seeksBehaviors', v)} placeholder="Spinning, hand-flapping…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Behavioural Challenges</label>
              <InterestTagInput value={form.behavioralChallenges} onChange={v => set('behavioralChallenges', v)} placeholder="Meltdowns, elopement…" />
            </div>
          </div>
        )}

        {/* Step 3 — Therapy History */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Therapy History & Schedule</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Previous Therapy (months)</label>
              <input type="number" min={0} value={form.previousTherapyMonths} onChange={e => set('previousTherapyMonths', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <Select label="Session Frequency" field="sessionFrequency" options={SESSION_FREQUENCIES} required={false} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Duration (minutes)</label>
              <input type="number" min={15} max={120} step={15} value={form.sessionDurationMinutes}
                onChange={e => set('sessionDurationMinutes', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Review & Confirm</h2>
            {[
              ['Name',             form.name],
              ['Age',              `${form.age} years`],
              ['Diagnosis Level',  form.diagnosisLevel],
              ['Communication',    form.communicationLevel],
              ['Learning Style',   form.learningStyle || '—'],
              ['Interests',        form.interests.join(', ') || '—'],
              ['Target Goals',     form.targetGoals.join(', ') || '—'],
              ['Behavioural Challenges', form.behavioralChallenges.join(', ') || '—'],
              ['Session Frequency', form.sessionFrequency],
              ['Prior Therapy',    `${form.previousTherapyMonths} months`],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3 text-sm border-b border-slate-100 pb-3">
                <span className="text-slate-500 w-40 shrink-0">{label}</span>
                <span className="text-slate-800 font-medium">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={back} disabled={step === 0}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              disabled={step === 0 && (!form.name || !form.age || !form.diagnosisLevel)}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-indigo-300 transition-colors">
              Continue
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={mutation.isPending}
              className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:bg-green-400 transition-colors">
              {mutation.isPending ? 'Saving…' : existing ? 'Update Child' : 'Create Child'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
