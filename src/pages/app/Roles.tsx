import React, { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { PageLoader } from '../../components/ui/primitives';

const MODULES: Record<string, string> = {
  dashboard: 'Dashboard', schools: 'Schools', students: 'Students', staff: 'Staff', academics: 'Academics',
  attendance: 'Attendance', exams: 'Exams', results: 'Results', report_cards: 'Report Cards', timetable: 'Timetable',
  fees: 'Fees', hostel: 'Hostel', library: 'Library', notices: 'Notices', events: 'Events', gallery: 'Gallery',
  documents: 'Documents', certificates: 'Certificates', id_cards: 'ID Cards', reports: 'Reports', users: 'Users',
  roles: 'Roles', settings: 'Settings', audit_logs: 'Audit Logs', notifications: 'Notifications', culture: 'Culture',
  achievements: 'Achievements', managing_body: 'Managing Body',
};
const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export'];

export default function RolesPage() {
  const { data: roles, loading, reload } = useApi('/api/roles');
  const { toast } = useToast();
  const [selected, setSelected] = useState<any>(null);

  React.useEffect(() => {
    if (roles && !selected) setSelected(roles[0]);
  }, [roles]);

  if (loading) return <PageLoader />;

  const perms: Record<string, string[]> = selected?.permissions ? JSON.parse(selected.permissions) : {};

  const toggle = (mod: string, action: string) => {
    const cur = new Set(perms[mod] || []);
    cur.has(action) ? cur.delete(action) : cur.add(action);
    const next = { ...perms, [mod]: Array.from(cur) };
    setSelected({ ...selected, permissions: JSON.stringify(next) });
  };

  const setAll = (mod: string, on: boolean) => {
    const next = { ...perms, [mod]: on ? [...ACTIONS] : [] };
    setSelected({ ...selected, permissions: JSON.stringify(next) });
  };

  const save = async () => {
    await api(`/api/roles/${selected.id}`, { method: 'PUT', body: { permissions: JSON.parse(selected.permissions) } });
    toast('success', 'Role permissions saved');
    reload();
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><KeyRound className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Roles & Permissions</h1><p className="text-sm text-slate-500">Configure what each role can view and do</p></div>

      <div className="flex gap-2 flex-wrap">
        {roles?.map((r: any) => (
          <button key={r.id} onClick={() => setSelected(r)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selected?.id === r.id ? 'text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'}`} style={selected?.id === r.id ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
            {r.name} {r.is_system ? '🔒' : ''}
          </button>
        ))}
      </div>

      {selected && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selected.name}</h3>
              <p className="text-xs text-slate-400">{selected.description}</p>
            </div>
            {!selected.is_system || ['super_admin', 'org_admin'].includes(selected.key) ? <button className="btn-primary" onClick={save}><Save className="h-4 w-4" /> Save</button> : <span className="text-xs text-slate-400">System role (locked)</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="th">Module</th>
                  {ACTIONS.map((a) => <th key={a} className="th text-center capitalize">{a}</th>)}
                  <th className="th text-center">All</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(MODULES).map(([mod, label]) => (
                  <tr key={mod}>
                    <td className="td font-medium">{label}</td>
                    {ACTIONS.map((a) => {
                      const on = (perms[mod] || []).includes(a);
                      return (
                        <td key={a} className="td text-center">
                          <input type="checkbox" checked={on} disabled={selected.key === 'super_admin'} onChange={() => toggle(mod, a)} className="h-4 w-4 accent-blue-600" />
                        </td>
                      );
                    })}
                    <td className="td text-center">
                      <button className="text-xs text-blue-600 hover:underline" disabled={selected.key === 'super_admin'} onClick={() => setAll(mod, (perms[mod] || []).length !== ACTIONS.length)}>
                        {(perms[mod] || []).length === ACTIONS.length ? 'None' : 'All'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
