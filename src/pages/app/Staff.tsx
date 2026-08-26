import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';
import { api } from '../../lib/api';
import { useDebounced } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, Avatar, StatusBadge, EmptyState, SearchBox } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const empty = { name: '', employee_id: '', designation: 'Teacher', staff_type: 'teaching', qualification: '', department: '', subject_ids: [], joining_date: '', mobile: '', email: '', gender: 'Male', school_id: '', status: 'active' };

export default function StaffPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [schools, setSchools] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const dq = useDebounced(q, 300);
  const canEdit = hasPerm(user, 'staff', 'update');

  useEffect(() => { api('/api/schools').then((r: any) => setSchools(r.data)).catch(() => {}); api('/api/subjects').then((r: any) => setSubjects(r.data)).catch(() => {}); }, []);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (dq) p.set('q', dq);
    if (type) p.set('staff_type', type);
    api(`/api/staff?${p}`).then((r: any) => setList(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [dq, type]);

  const save = async () => {
    try {
      const body = { ...modal, school_id: modal.school_id ? Number(modal.school_id) : null, subject_ids: modal.subject_ids?.map(Number) };
      if (modal.id) await api(`/api/staff/${modal.id}`, { method: 'PUT', body });
      else await api('/api/staff', { method: 'POST', body });
      toast('success', modal.id ? 'Staff updated' : 'Staff added');
      setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Teachers & Staff</h1><p className="text-sm text-slate-500">{list.length} members</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> Add Staff</button>}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, ID, designation…" className="flex-1 min-w-[220px]" />
        <select className="input !w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option><option value="teaching">Teaching</option><option value="non-teaching">Non-teaching</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? <PageLoader /> : list.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col">
            <div className="flex items-start gap-4">
              <Avatar name={s.name} src={s.photo} size={52} />
              <div className="min-w-0 grow">
                <h3 className="font-bold truncate">{s.name}</h3>
                <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>{s.designation}</p>
                <p className="text-[11px] text-slate-400">{s.employee_id} • {s.staff_type}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-xs text-slate-500 mt-3">{s.qualification} {s.department ? `• ${s.department}` : ''}</p>
            <p className="text-xs text-slate-400 mt-1">{s.school_name || '—'} • Joined {fmtDate(s.joining_date)}</p>
            {canEdit && (
              <div className="flex gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button className="btn-outline !py-1.5 flex-1 text-xs" onClick={() => setModal({ ...s, subject_ids: s.subject_ids ? JSON.parse(s.subject_ids) : [] })}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button className="btn-danger !py-1.5" onClick={() => setDel(s)}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        ))}
        {!loading && list.length === 0 && <EmptyState title="No staff found" />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Staff' : 'Add Staff'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
            <Field label="Employee ID"><input className="input" value={modal.employee_id} onChange={(e) => setModal({ ...modal, employee_id: e.target.value })} /></Field>
            <Field label="Designation"><input className="input" value={modal.designation} onChange={(e) => setModal({ ...modal, designation: e.target.value })} /></Field>
            <Field label="Type"><select className="input" value={modal.staff_type} onChange={(e) => setModal({ ...modal, staff_type: e.target.value })}><option value="teaching">Teaching</option><option value="non-teaching">Non-teaching</option></select></Field>
            <Field label="Qualification"><input className="input" value={modal.qualification || ''} onChange={(e) => setModal({ ...modal, qualification: e.target.value })} /></Field>
            <Field label="Department"><input className="input" value={modal.department || ''} onChange={(e) => setModal({ ...modal, department: e.target.value })} /></Field>
            <Field label="School"><select className="input" value={modal.school_id || ''} onChange={(e) => setModal({ ...modal, school_id: e.target.value })}><option value="">Select…</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
            <Field label="Subjects (multi-select)">
              <select multiple className="input min-h-[90px]" value={modal.subject_ids?.map(String) || []} onChange={(e) => setModal({ ...modal, subject_ids: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Joining Date"><input type="date" className="input" value={modal.joining_date || ''} onChange={(e) => setModal({ ...modal, joining_date: e.target.value })} /></Field>
            <Field label="Gender"><select className="input" value={modal.gender} onChange={(e) => setModal({ ...modal, gender: e.target.value })}>{['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Mobile"><input className="input" value={modal.mobile || ''} onChange={(e) => setModal({ ...modal, mobile: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={modal.email || ''} onChange={(e) => setModal({ ...modal, email: e.target.value })} /></Field>
            <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['active', 'inactive'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Staff?" message={`Permanently delete ${del?.name}?`} onConfirm={async () => { await api(`/api/staff/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); load(); }} />
    </div>
  );
}
