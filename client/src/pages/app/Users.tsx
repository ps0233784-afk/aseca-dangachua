import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, X, Settings, Shield } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => { setLoading(true); api.get<any[]>('/users').then(setUsers).catch(console.error).finally(() => setLoading(false)); };

  useEffect(() => { api.get<any[]>('/schools').then(setSchools).catch(console.error); load(); }, []);

  const roles = ['super_admin', 'org_admin', 'school_admin', 'principal', 'teacher', 'librarian', 'viewer'];

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'teacher', status: 'active' }); setModalOpen(true); setError(''); };
  const openEdit = (user: any) => { setEditing(user); setForm({ ...user, password: '' }); setModalOpen(true); setError(''); };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    if (!editing && !form.password) { setError('Password is required'); return; }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/users/${editing.id}`, form);
      else await api.post('/users', form);
      setModalOpen(false); load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete this user?')) return; await api.delete(`/users/${id}`); load(); };

  const roleColor = (role: string) => {
    const map: Record<string, string> = { super_admin: 'bg-red-50 text-red-700', org_admin: 'bg-brand-50 text-brand-700', school_admin: 'bg-blue-50 text-blue-700', principal: 'bg-purple-50 text-purple-700', teacher: 'bg-forest-50 text-forest-700', viewer: 'bg-gray-100 text-gray-600' };
    return map[role] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and access</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Add User</button>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="p-4 animate-pulse"><div className="h-4 bg-gray-100 rounded w-1/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No users yet</h3>
          <button onClick={openCreate} className="btn-primary mt-4"><Plus className="w-5 h-5 mr-2" /> Add User</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">School</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-brand-700">{user.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{schools.find(s => s.id === user.schoolId)?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.status === 'active' ? 'badge-forest' : 'badge-earth'}`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(user)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{editing ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
              <Input label="Full Name *" value={form.name || ''} onChange={(v) => setForm({ ...form, name: v })} />
              <Input label="Email *" type="email" value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
              <Input label={editing ? 'New Password (leave blank to keep)' : 'Password *'} type="password" value={form.password || ''} onChange={(v) => setForm({ ...form, password: v })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                    {roles.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">School</label>
                  <select value={form.schoolId || ''} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="input-field">
                    <option value="">None (Org-level)</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <Input label="Phone" value={form.phone || ''} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" placeholder={placeholder} />
    </div>
  );
}
