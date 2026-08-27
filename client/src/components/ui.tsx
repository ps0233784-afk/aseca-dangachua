import { ReactNode, useEffect, useState } from 'react';
import { X, Inbox, Loader2 } from 'lucide-react';

/* ---------- Button ---------- */
export function Button({
  children, variant = 'primary', size = 'md', className = '', ...props
}: any) {
  const styles: Record<string, string> = {
    primary: 'bg-forest text-white hover:bg-forest-light shadow-sm',
    royal: 'bg-royal text-white hover:bg-royal-light shadow-sm',
    gold: 'bg-gold text-white hover:bg-gold-dark shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-forest/30 text-forest hover:bg-forest-50 bg-white',
    ghost: 'text-slate-600 hover:bg-slate-100',
    white: 'bg-white text-forest hover:bg-forest-50 shadow',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-card border border-slate-100 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="w-11 h-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-glass">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------- Form fields ---------- */
export function Field({ label, children, required, className = '' }: { label: string; children: ReactNode; required?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-slate-600 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest bg-white';
export function Input(props: any) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />;
}
export function Select({ children, ...props }: any) {
  return <select {...props} className={`${inputCls} ${props.className || ''}`}>{children}</select>;
}
export function Textarea(props: any) {
  return <textarea rows={3} {...props} className={`${inputCls} ${props.className || ''}`} />;
}

/* ---------- Badge ---------- */
const badgeColors: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-700',
  gold: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-100 text-purple-800',
  terra: 'bg-orange-100 text-orange-800',
};
export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeColors[color]}`}>{children}</span>;
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-forest-dark text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Table ---------- */
export function Table({ headers, children, className = '' }: { headers: (string | ReactNode)[]; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto scrollbar-thin ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-forest-50 text-forest-dark">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Inbox size={40} strokeWidth={1.2} />
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20 text-forest">
      <Loader2 className="animate-spin" />
      <span className="ml-2 text-sm">Loading…</span>
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ icon, label, value, color = 'forest', sub }: { icon: ReactNode; label: string; value: ReactNode; color?: string; sub?: string }) {
  const colors: Record<string, string> = {
    forest: 'from-forest to-forest-light',
    royal: 'from-royal to-royal-light',
    terra: 'from-terra to-terra-light',
    gold: 'from-gold to-gold-light',
    sky: 'from-sky2 to-sky2-light',
  };
  return (
    <Card className="p-5 flex items-center gap-4 hover:shadow-glass transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-800 leading-tight">{value}</div>
        <div className="text-xs text-slate-500 truncate">{label}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </Card>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; icon?: ReactNode }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin border-b border-slate-200 mb-5 no-print">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            active === t.key ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-forest'
          }`}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Confirm / toast hooks ---------- */
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [msg]);
  return {
    msg,
    show: (text: string, ok = true) => setMsg({ text, ok }),
    node: msg ? (
      <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-fade-in ${msg.ok ? 'bg-forest' : 'bg-red-600'}`}>
        {msg.text}
      </div>
    ) : null,
  };
}

export function confirmAction(msg: string) {
  return window.confirm(msg);
}
