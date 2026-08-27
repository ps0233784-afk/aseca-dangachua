import { useEffect, useState } from 'react';
import { get, post, put, del } from '../api';
import { useAuth, ROLE_LABELS } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading } from '../components/ui';
import { ShieldCheck, Plus, Pencil, Trash2, ScrollText } from 'lucide-react';

export default function UsersPage({ mode = 'users' }: { mode?: 'users' | 'audit' }) {
  return mode === 'audit' ? <AuditLogs /> : <Users />;
}

function Users() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user: me } = useAuth();

  const load = () => { get('/users').then((d) => { setRows(d); setLoading(false); }); get('/schools').then(setSchools); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (edit.id) await put(`/users/${edit.id}`, edit);
      else await post('/users', edit);
      toast.show('User saved');
      setEdit(null);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };
  const remove = async (id: number) => {
    if (!confirmAction('Delete this user?')) return;
    await del(`/users/${id}`);
    toast.show('User deleted');
    load();
  };

  const blank = { name: '', email: '', password: '', role: 'viewer', school_id: '', phone: '', active: true };

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Multi-role access control across the branch" icon={<ShieldCheck size={22} />}
        action={<Button onClick={() => setEdit({ ...blank })}><Plus size={15} /> Add User</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table headers={['Name', 'Email', 'Role', 'School', 'Phone', 'Status', '']}>
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-bold">{u.name?.charAt(0)}</span>
                  {u.name}{u.id === me?.id && <Badge color="gold">you</Badge>}
                </td>
                <td className="px-4 py-3 text-xs font-mono">{u.email}</td>
                <td className="px-4 py-3"><Badge color={u.role === 'super_admin' ? 'gold' : u.role === 'admin' ? 'purple' : 'blue'}>{ROLE_LABELS[u.role] || u.role}</Badge></td>
                <td className="px-4 py-3 text-xs">{schools.find((s) => s.id === u.school_id)?.name?.split(',')[0] || 'Branch (all)'}</td>
                <td className="px-4 py-3 text-xs">{u.phone || '—'}</td>
                <td className="px-4 py-3"><Badge color={u.active ? 'green' : 'red'}>{u.active ? 'Active' : 'Disabled'}</Badge></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit({ ...u, password: '' })}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" disabled={u.id === me?.id} onClick={() => remove(u.id)}><Trash2 size={14} className="text-red-500" /></button>
                </div></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit User' : 'Add User'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Full Name *"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Email *"><Input type="email" value={edit.email} onChange={(e: any) => setEdit({ ...edit, email: e.target.value })} disabled={!!edit.id} /></Field>
            <Field label={edit.id ? 'New Password (leave blank to keep)' : 'Password *'}>
              <Input type="text" value={edit.password} onChange={(e: any) => setEdit({ ...edit, password: e.target.value })} placeholder={edit.id ? '••••••' : ''} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role"><Select value={edit.role} onChange={(e: any) => setEdit({ ...edit, role: e.target.value })}>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select></Field>
              <Field label="Phone"><Input value={edit.phone} onChange={(e: any) => setEdit({ ...edit, phone: e.target.value })} /></Field>
            </div>
            <Field label="Assigned School"><Select value={edit.school_id} onChange={(e: any) => setEdit({ ...edit, school_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Branch-wide (all schools)</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select></Field>
            {edit.id && (
              <Field label="Status"><Select value={edit.active ? 1 : 0} onChange={(e: any) => setEdit({ ...edit, active: Number(e.target.value) })}>
                <option value={1}>Active</option><option value={0}>Disabled</option>
              </Select></Field>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>{edit.id ? 'Update User' : 'Create User'}</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

function AuditLogs() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { get('/audit-logs').then((d) => { setRows(d); setLoading(false); }); }, []);
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable record of logins, creates, updates, imports and attendance" icon={<ScrollText size={22} />} />
      <Card>
        {loading ? <Loading /> : (
          <Table headers={['When', 'User', 'Action', 'Entity', 'Detail']}>
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{l.created_at}</td>
                <td className="px-4 py-2.5 text-xs font-mono">{l.username}</td>
                <td className="px-4 py-2.5"><Badge color={l.action === 'DELETE' ? 'red' : l.action === 'CREATE' ? 'green' : l.action === 'LOGIN' ? 'blue' : 'gold'}>{l.action}</Badge></td>
                <td className="px-4 py-2.5 text-xs font-semibold">{l.entity}</td>
                <td className="px-4 py-2.5 text-xs text-slate-600">{l.detail}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
