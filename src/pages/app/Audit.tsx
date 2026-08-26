import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { api } from '../../lib/api';
import { useDebounced } from '../../lib/hooks';
import { PageLoader, EmptyState, SearchBox } from '../../components/ui/primitives';
import { fmtDateTime } from '../../lib/format';

const ACTION_COLORS: Record<string, string> = {
  create_: 'bg-emerald-100 text-emerald-700',
  update_: 'bg-blue-100 text-blue-700',
  delete_: 'bg-rose-100 text-rose-700',
  login: 'bg-slate-100 text-slate-600',
  logout: 'bg-slate-100 text-slate-600',
  publish_: 'bg-amber-100 text-amber-700',
  lock_: 'bg-purple-100 text-purple-700',
};

export default function AuditPage() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dq = useDebounced(q, 300);

  React.useEffect(() => {
    setLoading(true);
    api(`/api/audit-logs${dq ? `?action=${encodeURIComponent(dq)}` : ''}`).then((r: any) => setRows(r.data)).finally(() => setLoading(false));
  }, [dq]);

  const color = (action: string) => {
    for (const [k, v] of Object.entries(ACTION_COLORS)) if (action.includes(k.replace('_', '')) || action.startsWith(k.replace('_', ''))) return v;
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Audit Logs</h1><p className="text-sm text-slate-500">Track important actions across the system</p></div>
        <SearchBox value={q} onChange={setQ} placeholder="Filter by action…" className="w-72" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0"><tr><th className="th">Time</th><th className="th">User</th><th className="th">Action</th><th className="th">Entity</th><th className="th">Details</th><th className="th">IP</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={6}><PageLoader /></td></tr> : rows.map((a: any) => (
                <tr key={a.id}>
                  <td className="td text-xs">{fmtDateTime(a.created_at)}</td>
                  <td className="td font-medium">{a.user_name || 'System'}</td>
                  <td className="td"><span className={`badge ${color(a.action)}`}>{a.action}</span></td>
                  <td className="td text-xs capitalize">{a.entity_type}{a.entity_id ? ` #${a.entity_id}` : ''}</td>
                  <td className="td text-xs max-w-[200px] truncate">{a.details}</td>
                  <td className="td text-xs">{a.ip || '—'}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState title="No audit logs" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
