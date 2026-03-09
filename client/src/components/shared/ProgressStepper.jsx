import { Check } from 'lucide-react';

export default function ProgressStepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                ${done   ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                ${active ? 'bg-white border-indigo-600 text-indigo-600' : ''}
                ${!done && !active ? 'bg-white border-slate-300 text-slate-400' : ''}
              `}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-14px] transition-all ${done ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
