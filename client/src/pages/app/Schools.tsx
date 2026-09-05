import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, X, School as SchoolIcon, MapPin, Phone, Mail, Users } from 'lucide-react';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get<any[]>('/schools')
      .then(setSchools)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', village: '', po: '', ps: '', block: '', district: '', pin: '', state: 'Odisha', phone: '', email: '', principal: '', type: 'Ol-Itun Ashra', medium: 'Santali' });
    setModalOpen(true);
    setError('');
  };

  const openEdit = (school: any) => {
    setEditing(school);
    setForm({ ...school });
    setModalOpen(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { setError('Name and code are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/schools/${editing.id}`, form);
      } else {
        await api.post('/schools', form);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;
    await api.delete(`/schools/${id}`);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-500 mt-1">Manage affiliated Ol-Itun Ashras</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Add School
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : schools.length === 0 ? (
        <div className="card p-12 text-center">
          <SchoolIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No schools yet</h3>
          <p className="text-gray-500 mb-6">Add your first affiliated school to get started.</p>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" /> Add School
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div key={school.id} className="card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center">
                  <SchoolIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(school)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(school.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-1">{school.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{school.code} • {school.type}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{school.village}, {school.district}</span>
                </div>
                {school.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{school.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{school.studentCount || 0} students • {school.teacherCount || 0} teachers</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`badge ${school.status === 'active' ? 'badge-forest' : 'badge-earth'}`}>
                  {school.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{editing ? 'Edit School' : 'Add School'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="School Code *" value={form.code || ''} onChange={(v) => setForm({ ...form, code: v })} placeholder="HH-OIA-026" />
                <Input label="Type" value={form.type || ''} onChange={(v) => setForm({ ...form, type: v })} placeholder="Ol-Itun Ashra" />
              </div>
              <Input label="School Name *" value={form.name || ''} onChange={(v) => setForm({ ...form, name: v })} placeholder="HANS HANSLI OL-ITUN ASHRA" />
              <Input label="Ol Chiki Name" value={form.olChikiName || ''} onChange={(v) => setForm({ ...form, olChikiName: v })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Village" value={form.village || ''} onChange={(v) => setForm({ ...form, village: v })} />
                <Input label="P.O." value={form.po || ''} onChange={(v) => setForm({ ...form, po: v })} />
                <Input label="P.S. / Block" value={form.ps || ''} onChange={(v) => setForm({ ...form, ps: v })} />
                <Input label="District" value={form.district || ''} onChange={(v) => setForm({ ...form, district: v })} />
                <Input label="PIN" value={form.pin || ''} onChange={(v) => setForm({ ...form, pin: v })} />
                <Input label="State" value={form.state || ''} onChange={(v) => setForm({ ...form, state: v })} />
                <Input label="Phone" value={form.phone || ''} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label="Email" value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
                <Input label="Principal / Headmaster" value={form.principal || ''} onChange={(v) => setForm({ ...form, principal: v })} />
                <Input label="Established Year" value={form.establishedYear || ''} onChange={(v) => setForm({ ...form, establishedYear: v })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Affiliation No." value={form.affiliationNo || ''} onChange={(v) => setForm({ ...form, affiliationNo: v })} />
                <Input label="Medium" value={form.medium || ''} onChange={(v) => setForm({ ...form, medium: v })} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </div>
  );
}
