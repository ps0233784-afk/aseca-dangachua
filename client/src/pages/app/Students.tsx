import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, X, Search, Users as UsersIcon, Filter } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (schoolFilter) params.set('schoolId', schoolFilter);
    if (search) params.set('q', search);
    api.get<any[]>(`/students?${params}`)
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<any[]>('/schools').then(setSchools).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [schoolFilter, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', schoolId: schoolFilter || schools[0]?.id, gender: 'Male', bloodGroup: '', village: '', block: '', district: 'Kendujhar', state: 'Odisha', category: 'ST', status: 'active' });
    setModalOpen(true);
    setError('');
  };

  const openEdit = (student: any) => {
    setEditing(student);
    setForm({ ...student });
    setModalOpen(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.schoolId) { setError('Name and school are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, form);
      } else {
        await api.post('/students', form);
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
    if (!confirm('Are you sure you want to delete this student?')) return;
    await api.delete(`/students/${id}`);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage student records across all schools</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, admission no..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="input-field sm:w-64"
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="card p-12 text-center">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 mb-6">
            {search || schoolFilter ? 'Try adjusting your filters.' : 'Add your first student to get started.'}
          </p>
          {!search && !schoolFilter && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" /> Add Student
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gender</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">School</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-brand-700">{student.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.admissionNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.rollNo || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.className || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${student.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                        {student.gender || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{student.school?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(student)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h2 className="font-display text-xl font-bold">{editing ? 'Edit Student' : 'Add Student'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name *" value={form.name || ''} onChange={(v) => setForm({ ...form, name: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">School *</label>
                  <select value={form.schoolId || ''} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="input-field">
                    <option value="">Select School</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Admission No" value={form.admissionNo || ''} onChange={(v) => setForm({ ...form, admissionNo: v })} />
                <Input label="Roll No" value={form.rollNo || ''} onChange={(v) => setForm({ ...form, rollNo: v })} />
                <Input label="Ol Chiki Name" value={form.olChikiName || ''} onChange={(v) => setForm({ ...form, olChikiName: v })} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Date of Birth" type="date" value={form.dob || ''} onChange={(v) => setForm({ ...form, dob: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input label="Blood Group" value={form.bloodGroup || ''} onChange={(v) => setForm({ ...form, bloodGroup: v })} placeholder="O+" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Father's Name" value={form.fatherName || ''} onChange={(v) => setForm({ ...form, fatherName: v })} />
                <Input label="Mother's Name" value={form.motherName || ''} onChange={(v) => setForm({ ...form, motherName: v })} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Guardian Name" value={form.guardianName || ''} onChange={(v) => setForm({ ...form, guardianName: v })} />
                <Input label="Guardian Mobile" value={form.guardianMobile || ''} onChange={(v) => setForm({ ...form, guardianMobile: v })} placeholder="9430000000" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Village" value={form.village || ''} onChange={(v) => setForm({ ...form, village: v })} />
                <Input label="Block" value={form.block || ''} onChange={(v) => setForm({ ...form, block: v })} />
                <Input label="District" value={form.district || ''} onChange={(v) => setForm({ ...form, district: v })} />
                <Input label="PIN" value={form.pin || ''} onChange={(v) => setForm({ ...form, pin: v })} />
                <Input label="Category" value={form.category || ''} onChange={(v) => setForm({ ...form, category: v })} placeholder="ST" />
                <Input label="Aadhaar (12 digits)" value={form.aadhaar || ''} onChange={(v) => setForm({ ...form, aadhaar: v })} placeholder="123456789012" />
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
