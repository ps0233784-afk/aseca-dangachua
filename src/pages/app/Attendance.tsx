import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCheck, Save, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { PageLoader, Avatar, EmptyState, StatCard } from '../../components/ui/primitives';
import { ATTENDANCE_STATUS } from '../../lib/format';
import { useAuth } from '../../contexts/AuthContext';

const STATUSES = ['present', 'absent', 'late', 'half_day', 'leave'];
const today = () => new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState(today());
  const [personType, setPersonType] = useState<'student' | 'staff'>('student');
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState(user?.school_id ? String(user.school_id) : '');
  const [classId, setClassId] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api('/api/schools').then((r: any) => setSchools(r.data)).catch(() => {}); api('/api/classes').then((r: any) => setClasses(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (classId) api(`/api/sections?class_id=${classId}`).then((r: any) => setSections(r.data)).catch(() => {}); }, [classId]);

  const load = () => {
    if (personType === 'student' && !sectionId && !classId) { setRecords([]); return; }
    setLoading(true);
    const p = new URLSearchParams({ date, person_type: personType });
    if (sectionId) p.set('section_id', sectionId); else if (classId) p.set('class_id', classId);
    if (schoolId) p.set('school_id', schoolId);
    api(`/api/attendance?${p}`).then((r: any) => setRecords(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [date, sectionId, classId, schoolId, personType]);

  const setStatus = (personId: number, status: string) => {
    setRecords((rs) => rs.map((r) => r.person_id === personId ? { ...r, attendance: { ...(r.attendance || {}), status } } : r));
  };
  const markAll = (status: string) => setRecords((rs) => rs.map((r) => ({ ...r, attendance: { ...(r.attendance || {}), status } })));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { date, person_type: personType, records: records.map((r) => ({ person_id: r.person_id, school_id: r.school_id || schoolId || null, status: r.attendance?.status || 'present', remark: r.attendance?.remark || null })) };
      await api('/api/attendance', { method: 'POST', body: payload });
      toast('success', `Attendance saved for ${records.length} ${personType === 'student' ? 'students' : 'staff'}`);
    } catch (e: any) { toast('error', e.message); } finally { setSaving(false); }
  };

  const counts = records.reduce((a, r) => { const s = r.attendance?.status; if (s) a[s] = (a[s] || 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarCheck className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Attendance</h1>
        <p className="text-sm text-slate-500">Mark daily attendance — mobile friendly</p>
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div><label className="label">Date</label><input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="label">Type</label>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['student', 'staff'] as const).map((t) => (
              <button key={t} onClick={() => { setPersonType(t); setSectionId(''); setClassId(''); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${personType === t ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}>{t}s</button>
            ))}
          </div>
        </div>
        {personType === 'student' && (
          <>
            <div><label className="label">School</label><select className="input !w-auto" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}><option value="">All</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Class</label><select className="input !w-auto" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}><option value="">Select…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            {sections.length > 0 && <div><label className="label">Section</label><select className="input !w-auto" value={sectionId} onChange={(e) => setSectionId(e.target.value)}><option value="">All sections</option>{sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
          </>
        )}
        {personType === 'staff' && <div><label className="label">School</label><select className="input !w-auto" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}><option value="">All</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
      </div>

      {records.length > 0 && (
        <>
          {/* Quick actions */}
          <div className="card p-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => markAll(s)} className={`badge !px-3 !py-1.5 !text-xs ${ATTENDANCE_STATUS[s].bg} ${ATTENDANCE_STATUS[s].color} border border-current/20 hover:brightness-95`}>{ATTENDANCE_STATUS[s].label} all</button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              {Object.entries(counts).map(([k, v]) => { const st = ATTENDANCE_STATUS[k] || { label: k, bg: '', color: '' }; return <span key={k} className={`badge ${st.bg} ${st.color}`}>{st.label}: {String(v)}</span>; })}
              <button className="btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save</>}</button>
            </div>
          </div>

          {/* Student list */}
          <div className="grid gap-2">
            {loading ? <PageLoader /> : records.map((r) => (
              <div key={r.person_id} className="card p-3 flex items-center gap-3">
                <Avatar name={r.name} size={40} />
                <div className="min-w-0 grow">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  <p className="text-[11px] text-slate-400">{personType === 'student' ? `Roll ${r.roll_no} • ${r.student_id}` : r.designation}</p>
                </div>
                <div className="flex gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => setStatus(r.person_id, s)}
                      className={`h-9 min-w-[36px] px-2 rounded-lg text-[11px] font-semibold border transition ${r.attendance?.status === s ? 'text-white border-transparent shadow' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      style={r.attendance?.status === s ? { background: { present: '#0ea576', absent: '#e11d48', late: '#d9a033', half_day: '#38bdf8', leave: '#8b7bd8' }[s] } : {}}>
                      {ATTENDANCE_STATUS[s].label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && records.length === 0 && <EmptyState title="Select a class and section" sub="Choose date, school and class to load students for attendance marking." icon={<Users className="h-6 w-6" />} />}
    </div>
  );
}
