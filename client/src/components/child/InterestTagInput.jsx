import { useId, useState } from 'react';
import { X } from 'lucide-react';

export default function InterestTagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter…',
  tagColor = 'bg-indigo-100 text-indigo-700',
}) {
  const [input, setInput] = useState('');
  const uid = useId();

  const add = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput('');
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]);
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 border border-slate-300 rounded-lg px-3 py-2 min-h-[44px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white cursor-text"
      onClick={() => document.getElementById(uid)?.focus()}
    >
      {value.map((tag) => (
        <span key={tag} className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tagColor}`}>
          {tag}
          <button type="button" onClick={() => remove(tag)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        id={uid}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[140px] outline-none text-sm bg-transparent placeholder-slate-400"
      />
    </div>
  );
}
