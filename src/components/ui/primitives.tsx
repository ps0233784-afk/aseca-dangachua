import React, { useEffect, useState } from 'react';
import { X, Search, ChevronLeft, ChevronRight, AlertTriangle, Inbox } from 'lucide-react';
import { initials, badge } from '../../lib/format';
import { useI18n } from '../../lib/i18n';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
      <Spinner className="h-8 w-8 text-blue-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', sub, icon }: { title?: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <p className="font-semibold text-slate-600 dark:text-slate-300">{title}</p>
      {sub && <p className="text-sm text-slate-400 mt-1 max-w-sm">{sub}</p>}
    </div>
  );
}

export function Avatar({ name, src, size = 40, className = '' }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
  const [err, setErr] = useState(false);
  const showImg = src && !err;
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold text-white ${className}`}
      style={{ width: size, height: size, background: showImg ? 'transparent' : 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', fontSize: size * 0.36 }}
    >
      {showImg ? (
        <img src={src} alt={name || ''} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export function Logo({ name, src, size = 44 }: { name?: string | null; src?: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name || 'logo'} style={{ width: size, height: size }} className="object-contain rounded-xl" onError={() => setErr(true)} />;
  }
  return (
    <div
      className="shrink-0 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md"
      style={{ width: size, height: size, background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', fontSize: size * 0.34 }}
    >
      {name?.split(' ').filter((w) => w.length > 1).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A'}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return <span className={`badge ${badge(status)}`}>{status.replace(/_/g, ' ')}</span>;
}

export function StatCard({ label, value, icon, tone = 'blue', sub }: { label: string; value: React.ReactNode; icon: React.ReactNode; tone?: string; sub?: string }) {
  const tones: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-green-700',
    gold: 'from-amber-400 to-orange-600',
    purple: 'from-violet-500 to-purple-700',
    red: 'from-rose-500 to-red-600',
    sky: 'from-sky-400 to-cyan-600',
  };
  return (
    <div className="card card-hover p-5 flex items-start gap-4">
      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${tones[tone] || tones.blue} text-white flex items-center justify-center shadow-md shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide = false }: {
  open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-fade-up max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto grow">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmLabel = 'Delete', danger = true }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title?: string; message?: string; confirmLabel?: string; danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={
      <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" />{title}</span>
    } footer={
      <>
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}>
          {busy ? <Spinner /> : confirmLabel}
        </button>
      </>
    }>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
}

export function Pagination({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs text-slate-500">Page {page} of {pages} • {total} records</p>
      <div className="flex gap-1">
        <button className="btn-ghost !px-2 !py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /></button>
        {Array.from({ length: Math.min(7, pages) }, (_, i) => {
          let p = i + 1;
          if (pages > 7) p = page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
          if (p < 1 || p > pages) return null;
          return <button key={p} onClick={() => onChange(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${p === page ? 'btn-primary !py-1.5' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{p}</button>;
        })}
        <button className="btn-ghost !px-2 !py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input className="input !pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Search…'} />
    </div>
  );
}

export function Field({ label, children, className = '', hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
