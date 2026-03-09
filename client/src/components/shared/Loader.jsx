export default function Loader({ text = 'Loading…', size = 'md' }) {
  const sz = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sz} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
      {text && <p className="text-slate-500 text-sm">{text}</p>}
    </div>
  );
}
