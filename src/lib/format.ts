export function fmtDate(d?: string | null, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

export function fmtDateTime(d?: string | null): string {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtINR(n?: number | null): string {
  if (n === null || n === undefined) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function fmtNum(n?: number | null): string {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-IN');
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function timeAgo(d?: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export function schoolInitials(name?: string | null): string {
  if (!name) return '🏫';
  return name.split(' ').filter((w) => w.length > 1).map((w) => w[0]).slice(0, 3).join('').toUpperCase();
}

export const ATTENDANCE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: 'Present', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  absent: { label: 'Absent', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-900/50' },
  late: { label: 'Late', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  half_day: { label: 'Half Day', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/50' },
  leave: { label: 'Leave', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/50' },
};

export const FEE_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  partial: { label: 'Partial', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  pending: { label: 'Pending', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
  waived: { label: 'Waived', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  disabled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  expired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  results_published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  locked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

export function badge(status: string): string {
  return STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
}

export const GRADES = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'Other'];
