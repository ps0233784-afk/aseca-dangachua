import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { PageLoader, EmptyState, Field, Modal } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetablePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState(user?.school_id ? String(user.school_id) : '');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const canEdit = hasPerm(user, 'timetable', 'update');

  useEffect(() => { api('/api/schools').then((r: any) => setSchools(r.data)); api('/api/classes').then((r: any) => setClasses(r.data)); api('/api/subjects').then((r: any) => setSubjects(r.data)); api('/api/staff?staff_type=teaching').then((r: any) => setStaff(r.data)); api('/api/periods').then((r: any) => setPeriods(r.data)); }, []);
  useEffect(() => { if (classId) api(`/api/sections?class_id=${classId}`).then((r: any) => setSections(r.data)); }, [classId]);

  const load = () => {
    if (!schoolId || !classId) { setRows([]); return; }
    setLoading(true);
    const p = new URLSearchParams({ school_id: schoolId, class_id: classId });
    if (sectionId) p.set('section_id', sectionId);
    api(`/api/timetable?${p}`).then((r: any) => setRows(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [schoolId, classId, sectionId]);

  const save = async () => {
    try {
      if (modal.id) await api(`/api/timetable/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/timetable', { method: 'POST', body: { ...modal, school_id: Number(schoolId), class_id: Number(classId) } });
      toast('success', 'Saved'); setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };

  // Build grid: day x period
  const grid = Array.from({ length: 7 }, (_, d) => Array.from({ length: periods.length }, (_, p) => null));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Timetable</h1>
        <p className="text-sm text-slate-500">Class-wise weekly timetable</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <Field label="School"><select className="input !w-auto" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}><option value="">Select…</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Class"><select className="input !w-auto" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}><option value="">Select…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        {sections.length > 0 && <Field label="Section"><select className="input !w-auto" value={sectionId} onChange={(e) => setSectionId(e.target.value)}><option value="">All</option>{sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>}
        {canEdit && schoolId && classId && <button className="btn-primary" onClick={() => setModal({ day: 1, period_id: periods[0]?.id, subject_id: '', teacher_id: '', room: '', section_id: sectionId || null })}><Plus className="h-4 w-4" /> Add Period</button>}
      </div>

      {loading ? <PageLoader /> : rows.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr><th className="th">Day</th>{periods.map((p) => <th key={p.id} className="th text-center">{p.name}<p className="text-[10px] font-normal normal-case">{p.start_time}–{p.end_time}</p></th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DAYS.slice(1).map((day, di) => (
                <tr key={di}>
                  <td className="td font-semibold">{day}</td>
                  {periods.map((p) => {
                    const cell = rows.find((r) => r.day === di + 1 && r.period_id === p.id);
                    return (
                      <td key={p.id} className="td text-center">
                        {cell ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-medium">{cell.subject_name}</span>
                            <span className="text-[10px] text-slate-400">{cell.teacher_name || '—'} {cell.room ? `• ${cell.room}` : ''}</span>
                            {canEdit && <button className="text-[10px] text-rose-400 hover:text-rose-600" onClick={() => api(`/api/timetable/${cell.id}`, { method: 'DELETE' }).then(load)}>✕</button>}
                          </div>
                        ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Select school and class" sub="Choose a school and class to view its timetable." />}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Period' : 'Add Period'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid grid-cols-2 gap-4">
          <Field label="Day"><select className="input" value={modal.day} onChange={(e) => setModal({ ...modal, day: Number(e.target.value) })}>{DAYS.slice(1).map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}</select></Field>
          <Field label="Period"><select className="input" value={modal.period_id} onChange={(e) => setModal({ ...modal, period_id: Number(e.target.value) })}>{periods.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.start_time})</option>)}</select></Field>
          <Field label="Subject"><select className="input" value={modal.subject_id} onChange={(e) => setModal({ ...modal, subject_id: e.target.value })}><option value="">Select…</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Teacher"><select className="input" value={modal.teacher_id || ''} onChange={(e) => setModal({ ...modal, teacher_id: e.target.value })}><option value="">Select…</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Room"><input className="input" value={modal.room || ''} onChange={(e) => setModal({ ...modal, room: e.target.value })} /></Field>
        </div>}
      </Modal>
    </div>
  );
}
