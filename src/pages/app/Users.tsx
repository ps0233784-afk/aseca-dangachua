import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, Avatar, StatusBadge, EmptyState } from '../../components/ui/primitives';
import { fmtDateTime } from '../../lib/format';

const empty = { name: '', username: '', email: '', phone: '', password: '', role_id: '', school_id: '', status: 'active', gender: 'Male' };

export default function UsersPage() {
  const { toast } = useToast();
  const { data: users, loading, reload } = useApi('/api/users');
  const { data: roles } = useApi('/api/roles');
  const { data: schools } = useApi('/api/schools');
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);

  const save = async () => {
    try {
      const body = { ...modal, role_id: Number(modal.role_id), school_id: modal.school_id ? Number(modal.school_id) : null };
      if (modal.id) await api(`/api/users/${modal.id}`, { method: 'PUT', body });
      else await api('/api/users', { method: 'POST', body });
      toast('success', modal.id ? 'User updated' : 'User created');
      setModal(null); reload();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Users</h1><p className="text-sm text-slate-500">{users?.length || 0} user accounts</p></div>
        <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">User</th><th className="th">Username</th><th className="th">Role</th><th className="th">School</th><th className="th">Status</th><th className="th">Last Login</th><th className="th">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={7}><PageLoader /></td></tr> : users?.map((u: any) => (
                <tr key={u.id}>
                  <td className="td"><div className="flex items-center gap-3"><Avatar name={u.name} src={u.avatar} size={36} /><div><p className="font-medium">{u.name}</p><p className="text-[11px] text-slate-400">{u.email}</p></div></div></td>
                  <td className="td font-mono text-xs">{u.username}</td>
                  <td className="td"><span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{u.role_name}</span></td>
                  <td className="td text-xs">{u.school_name || '— All —'}</td>
                  <td className="td"><StatusBadge status={u.status} /></td>
                  <td className="td text-xs">{fmtDateTime(u.last_login)}</td>
                  <td className="td"><div className="flex gap-1">
                    <button className="btn-ghost !p-2" onClick={() => setModal(u)}><Pencil className="h-4 w-4" /></button>
                    <button className="btn-ghost !p-2 text-rose-500" onClick={() => setDel(u)}><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
              {!loading && users?.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? `Edit User — ${modal.name}` : 'Add User'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Username *"><input className="input" value={modal.username} onChange={(e) => setModal({ ...modal, username: e.target.value })} /></Field>
          <Field label="Email"><input className="input" value={modal.email || ''} onChange={(e) => setModal({ ...modal, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={modal.phone || ''} onChange={(e) => setModal({ ...modal, phone: e.target.value })} /></Field>
          <Field label={modal.id ? 'New Password (leave blank to keep)' : 'Password *'}><input type="password" className="input" value={modal.password || ''} onChange={(e) => setModal({ ...modal, password: e.target.value })} placeholder={modal.id ? '••••••' : 'Min 6 characters'} /></Field>
          <Field label="Gender"><select className="input" value={modal.gender} onChange={(e) => setModal({ ...modal, gender: e.target.value })}>{['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}</select></Field>
          <Field label="Role *"><select className="input" value={modal.role_id} onChange={(e) => setModal({ ...modal, role_id: e.target.value })}><option value="">Select…</option>{roles?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <Field label="School (for school-scoped roles)"><select className="input" value={modal.school_id || ''} onChange={(e) => setModal({ ...modal, school_id: e.target.value })}><option value="">All schools</option>{schools?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['active', 'inactive'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete User?" message={`Delete ${del?.name}'s account? They will lose access immediately.`} onConfirm={async () => { await api(`/api/users/${del.id}`, { method: 'DELETE' }); toast('success', 'User deleted'); setDel(null); reload(); }} />
    </div>
  );
}
