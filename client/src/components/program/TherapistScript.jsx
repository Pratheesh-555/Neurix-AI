import { BookOpen, Copy } from 'lucide-react';
import { useToast } from '../shared/Toast';

export default function TherapistScript({ script }) {
  const toast = useToast();
  if (!script) return null;

  const copy = () => {
    navigator.clipboard.writeText(script);
    toast('Script copied to clipboard', 'success');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Therapist Script</h3>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          <Copy size={13} /> Copy
        </button>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed font-mono border border-slate-100">
        {script}
      </div>
    </div>
  );
}
