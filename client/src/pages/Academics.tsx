import { useEffect, useState } from 'react';
import { get, post, put, del } from '../api';
import { useAuth } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { BookOpen, CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function AcademicsPage({ mode }: { mode: 'subjects' | 'timetable' }) {
  return mode === 'subjects' ? <Subjects /> : <Timetable />;
}

/* ---------------- Dynamic Ol-Itun Ashra Subjects ---------------- */
function Subjects() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('0');
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => get(`/subjects?school_id=${schoolId}`).then((d) => { setRows(d); setLoading(false); });
  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => { load(); }, [schoolId]);

  const save = async () => {
    if (edit.id) await put(`/subjects/${edit.id}`, edit);
    else await post('/subjects', { ...edit, school_id: Number(schoolId) || 0 });
    toast.show('Subject saved');
    setEdit(null);
    load();
  };
  const remove = async (id: number) => {
    if (!confirmAction('Deactivate this subject?')) return;
    await del(`/subjects/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Dynamic Ol-Itun Subjects"
        subtitle="MIL Santali Papers I–IV, Odia, English and editable branch subjects"
        icon={<BookOpen size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-56">
            <option value="0">All schools (global subjects)</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          {canWrite && <Button onClick={() => setEdit({ name: '', code: '', class_level: '', paper_group: 'Core', max_marks: 100 })}><Plus size={15} /> Add Subject</Button>}
        </div>}
      />
      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No subjects" /> : (
          <Table headers={['Subject', 'Code', 'Paper Group', 'Class Level', 'Max Marks', 'Scope', '']}>
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3"><Badge color={s.paper_group?.includes('Santali') ? 'gold' : s.paper_group?.includes('Odia') ? 'purple' : 'blue'}>{s.paper_group}</Badge></td>
                <td className="px-4 py-3 text-xs">{s.class_level}</td>
                <td className="px-4 py-3 text-xs">{s.max_marks}</td>
                <td className="px-4 py-3"><Badge color={s.school_id === 0 ? 'green' : 'gray'}>{s.school_id === 0 ? 'Global' : 'School-specific'}</Badge></td>
                <td className="px-4 py-3">{canWrite && <span className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(s)}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => remove(s.id)}><Trash2 size={14} className="text-red-500" /></button>
                </span>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Subject' : 'Add Subject'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Subject Name *"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} placeholder="MIL-V — Santali Paper 5" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code"><Input value={edit.code} onChange={(e: any) => setEdit({ ...edit, code: e.target.value })} /></Field>
              <Field label="Max Marks"><Input type="number" value={edit.max_marks} onChange={(e: any) => setEdit({ ...edit, max_marks: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Paper Group"><Select value={edit.paper_group} onChange={(e: any) => setEdit({ ...edit, paper_group: e.target.value })}>
              <option>MIL (Santali)</option><option>MIL (Odia)</option><option>Language</option><option>Core</option><option>Heritage</option><option>Elective</option>
            </Select></Field>
            <Field label="Class Level"><Input value={edit.class_level} onChange={(e: any) => setEdit({ ...edit, class_level: e.target.value })} placeholder="Matric & +2" /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>Save Subject</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

/* ---------------- Timetable ---------------- */
function Timetable() {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('1');
  const [cls, setCls] = useState('Matric (Class X)');
  const [rows, setRows] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { get('/schools').then((s) => { setSchools(s); if (s[0]) setSchoolId(String(s[0].id)); }); }, []);
  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    get(`/timetable?school_id=${schoolId}&class=${encodeURIComponent(cls)}`).then((d) => { setRows(d); setLoading(false); });
    get(`/teachers?school_id=${schoolId}`).then(setTeachers);
  }, [schoolId, cls]);

  const save = async () => {
    await post('/timetable', { ...edit, school_id: Number(schoolId) });
    toast.show('Period saved');
    setEdit(null);
    get(`/timetable?school_id=${schoolId}&class=${encodeURIComponent(cls)}`).then(setRows);
  };
  const remove = async (id: number) => {
    if (!confirmAction('Delete this period?')) return;
    await del(`/timetable/${id}`);
    get(`/timetable?school_id=${schoolId}&class=${encodeURIComponent(cls)}`).then(setRows);
  };

  const cell = (day: string, period: number) => rows.find((r) => r.day === day && r.period === period);

  return (
    <div>
      <PageHeader
        title="Weekly Timetable"
        subtitle="Class-wise period grid with subject and teacher assignment"
        icon={<CalendarDays size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-48">
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name.split(',')[0]}</option>)}
          </Select>
          <Select value={cls} onChange={(e: any) => setCls(e.target.value)} className="w-48">
            {['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Matric (Class X)', '+2 (Class XII)'].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Button onClick={() => setEdit({ day: 'Monday', period: 1, start_time: '10:00', end_time: '10:45', subject: '', teacher: '', class: cls, section: 'A' })}><Plus size={15} /> Period</Button>
        </div>}
      />
      <Card className="p-4">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-forest text-white">
                  <th className="px-3 py-2 text-left text-xs">Day / Period</th>
                  {PERIODS.map((p) => <th key={p} className="px-3 py-2 text-center text-xs min-w-36">P{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-semibold text-forest-dark whitespace-nowrap bg-forest-50">{day}</td>
                    {PERIODS.map((p) => {
                      const c = cell(day, p);
                      return (
                        <td key={p} className="px-2 py-2">
                          {c ? (
                            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2 group relative">
                              <div className="font-semibold text-xs text-royal">{c.subject}</div>
                              <div className="text-[10px] text-slate-500">{c.teacher}</div>
                              <div className="text-[10px] text-slate-400">{c.start_time}–{c.end_time}</div>
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                <button className="bg-white p-0.5 rounded shadow" onClick={() => setEdit(c)}><Pencil size={10} /></button>
                                <button className="bg-white p-0.5 rounded shadow" onClick={() => remove(c.id)}><Trash2 size={10} className="text-red-500" /></button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setEdit({ day, period: p, start_time: '10:00', end_time: '10:45', subject: '', teacher: '', class: cls, section: 'A' })}
                              className="w-full h-14 rounded-lg border border-dashed border-slate-200 text-slate-300 hover:border-forest hover:text-forest text-lg">+</button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Period' : 'Assign Period'}>
        {edit && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Day"><Select value={edit.day} onChange={(e: any) => setEdit({ ...edit, day: e.target.value })}>{DAYS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
            <Field label="Period"><Select value={edit.period} onChange={(e: any) => setEdit({ ...edit, period: Number(e.target.value) })}>{PERIODS.map((p) => <option key={p} value={p}>Period {p}</option>)}</Select></Field>
            <Field label="Start Time"><Input type="time" value={edit.start_time} onChange={(e: any) => setEdit({ ...edit, start_time: e.target.value })} /></Field>
            <Field label="End Time"><Input type="time" value={edit.end_time} onChange={(e: any) => setEdit({ ...edit, end_time: e.target.value })} /></Field>
            <Field label="Subject *" className="col-span-2"><Input value={edit.subject} onChange={(e: any) => setEdit({ ...edit, subject: e.target.value })} placeholder="MIL-I Santali" /></Field>
            <Field label="Teacher" className="col-span-2"><Select value={edit.teacher} onChange={(e: any) => setEdit({ ...edit, teacher: e.target.value })}>
              <option value="">—</option>{teachers.map((t) => <option key={t.id}>{t.name}</option>)}
            </Select></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save} disabled={!edit.subject}>Save Period</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}
