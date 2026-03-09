import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} className="text-green-600" />,
  error:   <XCircle    size={18} className="text-red-600"   />,
  info:    <AlertCircle size={18} className="text-indigo-600" />,
};

const BG = {
  success: 'border-green-200 bg-green-50',
  error:   'border-red-200   bg-red-50',
  info:    'border-indigo-200 bg-indigo-50',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map(({ id, message, type }) => (
          <div key={id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm max-w-sm animate-in slide-in-from-right ${BG[type]}`}>
            {ICONS[type]}
            <span className="flex-1 text-slate-700">{message}</span>
            <button onClick={() => remove(id)}><X size={14} className="text-slate-400 hover:text-slate-600" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
