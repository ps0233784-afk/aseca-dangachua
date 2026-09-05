import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, X, UserCheck } from 'lucide-react';

export default function TeachersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get<any[]>('/teachers')
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { api.get<any[]>('/schools').then(setSchools).catch(console.error); load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', schoolId: schools[0]?.id, designation: 'Asst. Teacher', status: 'active' });
    setModalOpen(true); setError('');
  };

  const openEdit = (item: any) => {
    setEditing(item); setForm({ ...item }); setModalOpen(true); setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.schoolId) { setError('Name and school are required'); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/teachers/${editing.id}`, form);
      else await api.post('/teachers', form);
      setModalOpen(false); load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return;
    await api.delete(`/teachers/${id}`); load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 mt-1">Manage teaching staff across schools</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Add Teacher</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse"><div className="h-6 bg-gray-100 rounded w-1/2 mb-3" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No teachers yet</h3>
          <p className="text-gray-500 mb-6">Add your first teacher to get started.</p>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Add Teacher</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">{item.name?.charAt(0)}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-display font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-brand-600 font-medium mb-2">{item.designation}</p>
              <p className="text-sm text-gray-500">{item.qualification}</p>
              <p className="text-sm text-gray-500 mt-1">{item.subjectSpec}</p>
              {item.phone && <p className="text-sm text-gray-500 mt-1">📞 {item.phone}</p>}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{schools.find(s => s.id === item.schoolId)?.name || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
              <Input label="Full Name *" value={form.name || ''} onChange={(v) => setForm({ ...form, name: v })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">School *</label>
                  <select value={form.schoolId || ''} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <Input label="Designation" value={form.designation || ''} onChange={(v) => setForm({ ...form, designation: v })} />
                <Input label="Qualification" value={form.qualification || ''} onChange={(v) => setForm({ ...form, qualification: v })} />
                <Input label="Subject Specialization" value={form.subjectSpec || ''} onChange={(v) => setForm({ ...form, subjectSpec: v })} />
                <Input label="Employee ID" value={form.employeeId || ''} onChange={(v) => setForm({ ...form, employeeId: v })} />
                <Input label="Phone" value={form.phone || ''} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label="Email" value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
                <Input label="Joining Date" type="date" value={form.joiningDate || ''} onChange={(v) => setForm({ ...form, joiningDate: v })} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
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
