import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; }

const ToastContext = createContext<{ toast: (type: Toast['type'], message: string) => void }>({ toast: () => {} });
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className="glass shadow-xl rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-up">
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0" />}
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
