import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Layers, FlaskConical, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';

export default function AcademicsPage() {
  const [tab, setTab] = useState<'classes' | 'sections' | 'subjects'>('classes');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Academics</h1>
        <p className="text-sm text-slate-500">Classes, sections, subjects and academic years</p>
      </div>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {([['classes', 'Classes', BookOpen], ['sections', 'Sections', Layers], ['subjects', 'Subjects', FlaskConical]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === k ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}><I className="h-4 w-4" /> {l}</button>
        ))}
      </div>
      {tab === 'classes' && <Classes />}
      {tab === 'sections' && <Sections />}
      {tab === 'subjects' && <Subjects />}
    </div>
  );
}

function Classes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectModal, setSubjectModal] = useState<any>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const canEdit = hasPerm(user, 'academics', 'update');
  const load = () => api('/api/classes').then((r: any) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); api('/api/subjects').then((r: any) => setSubjects(r.data)); }, []);

  const save = async () => {
    try {
      if (modal.id) await api(`/api/classes/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/classes', { method: 'POST', body: modal });
      toast('success', 'Saved'); setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };

  const openSubjects = async (c: any) => {
    const r: any = await api(`/api/classes/${c.id}/subjects`);
    setSelected(r.data.map((s: any) => s.id));
    setSubjectModal(c);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{list.length} classes</p>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ name: '', code: '', order_index: list.length + 1, default_capacity: 40 })}><Plus className="h-4 w-4" /> Add Class</button>}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Class</th><th className="th">Code</th><th className="th text-center">Sections</th><th className="th text-center">Subjects</th><th className="th text-center">Capacity</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={6}><PageLoader /></td></tr> : list.map((c) => (
              <tr key={c.id}>
                <td className="td font-semibold">{c.name}</td>
                <td className="td">{c.code}</td>
                <td className="td text-center">{c.section_count}</td>
                <td className="td text-center">{c.subject_count}</td>
                <td className="td text-center">{c.default_capacity}</td>
                <td className="td"><div className="flex gap-1">
                  <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => openSubjects(c)}><FlaskConical className="h-3.5 w-3.5" /> Subjects</button>
                  {canEdit && <button className="btn-ghost !p-2" onClick={() => setModal(c)}><Pencil className="h-4 w-4" /></button>}
                  {canEdit && <button className="btn-ghost !p-2 text-rose-500" onClick={() => api(`/api/classes/${c.id}`, { method: 'DELETE' }).then(() => { toast('success', 'Deleted'); load(); })}><Trash2 className="h-4 w-4" /></button>}
                </div></td>
              </tr>
            ))}
            {!loading && list.length === 0 && <tr><td colSpan={6}><EmptyState /></td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Class' : 'Add Class'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid grid-cols-2 gap-4">
          <Field label="Class Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Code"><input className="input" value={modal.code || ''} onChange={(e) => setModal({ ...modal, code: e.target.value })} /></Field>
          <Field label="Order"><input type="number" className="input" value={modal.order_index} onChange={(e) => setModal({ ...modal, order_index: Number(e.target.value) })} /></Field>
          <Field label="Default Capacity"><input type="number" className="input" value={modal.default_capacity} onChange={(e) => setModal({ ...modal, default_capacity: Number(e.target.value) })} /></Field>
        </div>}
      </Modal>

      <Modal open={!!subjectModal} onClose={() => setSubjectModal(null)} title={`Subjects for ${subjectModal?.name}`}
        footer={<><button className="btn-outline" onClick={() => setSubjectModal(null)}>Cancel</button><button className="btn-primary" onClick={() => api(`/api/classes/${subjectModal.id}/subjects`, { method: 'PUT', body: { subject_ids: selected } }).then(() => { toast('success', 'Subjects updated'); setSubjectModal(null); load(); })}><Save className="h-4 w-4" /> Save</button></>}>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {subjects.map((s) => (
            <label key={s.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${selected.includes(s.id) ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="checkbox" checked={selected.includes(s.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, s.id] : selected.filter((x) => x !== s.id))} />
              <span className="text-sm">{s.name}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function Sections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [modal, setModal] = useState<any>(null);
  const canEdit = hasPerm(user, 'academics', 'update');
  const load = () => api(`/api/sections${schoolId ? `?school_id=${schoolId}` : ''}`).then((r: any) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [schoolId]);
  useEffect(() => { api('/api/schools').then((r: any) => setSchools(r.data)); api('/api/classes').then((r: any) => setClasses(r.data)); api('/api/staff?staff_type=teaching').then((r: any) => setStaff(r.data)); }, []);

  const save = async () => {
    try {
      if (modal.id) await api(`/api/sections/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/sections', { method: 'POST', body: modal });
      toast('success', 'Saved'); setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-wrap gap-3 items-center">
        <select className="input !w-auto" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}><option value="">All Schools</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ name: 'A', school_id: schoolId || '', class_id: '', room: '', capacity: 40, class_teacher_id: '' })}><Plus className="h-4 w-4" /> Add Section</button>}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">School</th><th className="th">Class</th><th className="th">Section</th><th className="th">Room</th><th className="th text-center">Students</th><th className="th">Class Teacher</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={7}><PageLoader /></td></tr> : list.map((s) => (
              <tr key={s.id}>
                <td className="td text-xs max-w-[180px] truncate">{s.school_name}</td>
                <td className="td font-medium">{s.class_name}</td>
                <td className="td">{s.name}</td>
                <td className="td">{s.room || '—'}</td>
                <td className="td text-center">{s.student_count}</td>
                <td className="td">{s.class_teacher_name || '—'}</td>
                <td className="td">{canEdit && <div className="flex gap-1"><button className="btn-ghost !p-2" onClick={() => setModal(s)}><Pencil className="h-4 w-4" /></button><button className="btn-ghost !p-2 text-rose-500" onClick={() => api(`/api/sections/${s.id}`, { method: 'DELETE' }).then(load)}><Trash2 className="h-4 w-4" /></button></div>}</td>
              </tr>
            ))}
            {!loading && list.length === 0 && <tr><td colSpan={7}><EmptyState title="No sections" sub="Add sections to organise students within a class." /></td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Section' : 'Add Section'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid grid-cols-2 gap-4">
          <Field label="School *"><select className="input" value={modal.school_id} onChange={(e) => setModal({ ...modal, school_id: e.target.value })}><option value="">Select…</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Class *"><select className="input" value={modal.class_id} onChange={(e) => setModal({ ...modal, class_id: e.target.value })}><option value="">Select…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Section Name"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Room"><input className="input" value={modal.room || ''} onChange={(e) => setModal({ ...modal, room: e.target.value })} /></Field>
          <Field label="Capacity"><input type="number" className="input" value={modal.capacity} onChange={(e) => setModal({ ...modal, capacity: Number(e.target.value) })} /></Field>
          <Field label="Class Teacher"><select className="input" value={modal.class_teacher_id || ''} onChange={(e) => setModal({ ...modal, class_teacher_id: e.target.value })}><option value="">Select…</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        </div>}
      </Modal>
    </div>
  );
}

function Subjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const canEdit = hasPerm(user, 'academics', 'update');
  const load = () => api('/api/subjects').then((r: any) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const save = async () => {
    try {
      if (modal.id) await api(`/api/subjects/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/subjects', { method: 'POST', body: modal });
      toast('success', 'Saved'); setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{list.length} subjects</p>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ name: '', code: '', full_marks: 100, pass_marks: 33, theory_marks: 100, practical_marks: 0, subject_type: 'core', color: '#1a56db' })}><Plus className="h-4 w-4" /> Add Subject</button>}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Subject</th><th className="th">Code</th><th className="th text-center">Full Marks</th><th className="th text-center">Pass Marks</th><th className="th text-center">Theory/Practical</th><th className="th">Type</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={7}><PageLoader /></td></tr> : list.map((s) => (
              <tr key={s.id}>
                <td className="td font-medium"><span className="inline-block h-3 w-3 rounded-full mr-2" style={{ background: s.color }} />{s.name}</td>
                <td className="td">{s.code}</td>
                <td className="td text-center">{s.full_marks}</td>
                <td className="td text-center">{s.pass_marks}</td>
                <td className="td text-center">{s.theory_marks}/{s.practical_marks}</td>
                <td className="td capitalize">{s.subject_type}</td>
                <td className="td">{canEdit && <div className="flex gap-1"><button className="btn-ghost !p-2" onClick={() => setModal(s)}><Pencil className="h-4 w-4" /></button><button className="btn-ghost !p-2 text-rose-500" onClick={() => api(`/api/subjects/${s.id}`, { method: 'DELETE' }).then(load)}><Trash2 className="h-4 w-4" /></button></div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Subject' : 'Add Subject'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid grid-cols-2 gap-4">
          <Field label="Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Code"><input className="input" value={modal.code || ''} onChange={(e) => setModal({ ...modal, code: e.target.value })} /></Field>
          <Field label="Full Marks"><input type="number" className="input" value={modal.full_marks} onChange={(e) => setModal({ ...modal, full_marks: Number(e.target.value) })} /></Field>
          <Field label="Pass Marks"><input type="number" className="input" value={modal.pass_marks} onChange={(e) => setModal({ ...modal, pass_marks: Number(e.target.value) })} /></Field>
          <Field label="Theory Marks"><input type="number" className="input" value={modal.theory_marks} onChange={(e) => setModal({ ...modal, theory_marks: Number(e.target.value) })} /></Field>
          <Field label="Practical Marks"><input type="number" className="input" value={modal.practical_marks} onChange={(e) => setModal({ ...modal, practical_marks: Number(e.target.value) })} /></Field>
          <Field label="Type"><select className="input" value={modal.subject_type} onChange={(e) => setModal({ ...modal, subject_type: e.target.value })}>{['core', 'language', 'elective', 'activity'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Color"><input type="color" className="input h-11" value={modal.color} onChange={(e) => setModal({ ...modal, color: e.target.value })} /></Field>
        </div>}
      </Modal>
    </div>
  );
}
