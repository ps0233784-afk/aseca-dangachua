import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { Card, PageHeader, Button, Select, Table, Badge, useToast, Loading, EmptyState } from '../components/ui';
import { CalendarCheck, Check, X, Clock, Save } from 'lucide-react';

export default function AttendancePage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string>('1');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<any[]>([]);
  const [teacherRows, setTeacherRows] = useState<any[]>([]);
  const [tab, setTab] = useState<'students' | 'teachers' | 'summary'>('students');
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { get('/schools').then((s) => { setSchools(s); if (s[0]) setSchoolId(String(s[0].id)); }); }, []);
  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    if (tab === 'students') get(`/attendance?school_id=${schoolId}&date=${date}`).then((d) => { setRows(d); setLoading(false); });
    if (tab === 'teachers') get(`/teacher-attendance?school_id=${schoolId}&date=${date}`).then((d) => { setTeacherRows(d); setLoading(false); });
    if (tab === 'summary') get(`/attendance/summary?school_id=${schoolId}`).then((d) => { setSummary(d); setLoading(false); });
  }, [schoolId, date, tab]);

  const setStatus = (i: number, status: string) => {
    const next = [...rows];
    next[i] = { ...next[i], status };
    setRows(next);
  };
  const setTeacherStatus = (i: number, status: string) => {
    const next = [...teacherRows];
    next[i] = { ...next[i], status };
    setTeacherRows(next);
  };

  const markAll = (status: string) => setRows(rows.map((r) => ({ ...r, status })));

  const save = async () => {
    if (tab === 'students') {
      await post('/attendance', { school_id: Number(schoolId), date, records: rows.map((r) => ({ student_id: r.id, status: r.status === 'unmarked' ? 'absent' : r.status, note: r.note })) });
    } else {
      await post('/teacher-attendance', { school_id: Number(schoolId), date, records: teacherRows.map((r) => ({ teacher_id: r.id, status: r.status === 'unmarked' ? 'absent' : r.status })) });
    }
    toast.show('Attendance saved & audit-logged');
  };

  return (
    <div>
      <PageHeader
        title="Attendance Register"
        subtitle="Daily student & teacher attendance with per-record audit logs"
        icon={<CalendarCheck size={22} />}
        action={<div className="flex gap-2 flex-wrap">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-56">
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-forest/40" />
        </div>}
      />

      <div className="flex gap-1 mb-4 no-print">
        {(['students', 'teachers', 'summary'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-forest text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {t === 'summary' ? 'Term Summary' : t + " Attendance"}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <Card className="p-4">
          {tab === 'students' && (
            <>
              <div className="flex gap-2 mb-3 no-print">
                <Button size="sm" variant="outline" onClick={() => markAll('present')}><Check size={13} /> All Present</Button>
                <Button size="sm" variant="ghost" onClick={save}><Save size={13} /> Save Register</Button>
                <span className="text-xs text-slate-400 self-center">{rows.filter((r) => r.status !== 'unmarked').length}/{rows.length} marked</span>
              </div>
              {rows.length === 0 ? <EmptyState text="No active students in this school" /> : (
                <Table headers={['Roll', 'Student', 'Class', 'Present', 'Absent', 'Late']}>
                  {rows.map((r, i) => (
                    <tr key={r.id} className={r.status === 'present' ? 'bg-green-50/40' : r.status === 'absent' ? 'bg-red-50/40' : r.status === 'late' ? 'bg-amber-50/40' : ''}>
                      <td className="px-4 py-2 font-mono text-xs">{r.roll_no}</td>
                      <td className="px-4 py-2 font-medium">{r.name}</td>
                      <td className="px-4 py-2 text-xs text-slate-500">{r.class}</td>
                      {(['present', 'absent', 'late'] as const).map((st) => (
                        <td key={st} className="px-4 py-2 text-center">
                          <button onClick={() => setStatus(i, st)}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border-2 transition-all ${
                              r.status === st
                                ? st === 'present' ? 'bg-forest text-white border-forest' : st === 'absent' ? 'bg-terra text-white border-terra' : 'bg-gold text-white border-gold'
                                : 'border-slate-200 text-slate-300 hover:border-slate-400'}`}>
                            {st === 'present' ? <Check size={15} /> : st === 'absent' ? <X size={15} /> : <Clock size={14} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </Table>
              )}
            </>
          )}

          {tab === 'teachers' && (
            <>
              <div className="flex gap-2 mb-3 no-print">
                <Button size="sm" variant="ghost" onClick={save}><Save size={13} /> Save Teacher Attendance</Button>
              </div>
              <Table headers={['Teacher', 'Designation', 'Present', 'Absent', 'Leave']}>
                {teacherRows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{r.designation}</td>
                    {(['present', 'absent', 'late'] as const).map((st) => (
                      <td key={st} className="px-4 py-2 text-center">
                        <button onClick={() => setTeacherStatus(i, st)}
                          className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border-2 ${
                            r.status === st
                              ? st === 'present' ? 'bg-royal text-white border-royal' : st === 'absent' ? 'bg-terra text-white border-terra' : 'bg-gold text-white border-gold'
                              : 'border-slate-200 text-slate-300'}`}>
                          {st === 'present' ? <Check size={15} /> : st === 'absent' ? <X size={15} /> : <Clock size={14} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </Table>
            </>
          )}

          {tab === 'summary' && (
            <Table headers={['Student', 'Class', 'Present', 'Absent', 'Late', 'Working Days', 'Attendance %', 'Status']}>
              {summary.map((r) => {
                const pct = r.total ? Math.round((r.present / r.total) * 100) : 0;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{r.class}</td>
                    <td className="px-4 py-2 text-green-700 font-semibold">{r.present}</td>
                    <td className="px-4 py-2 text-red-700 font-semibold">{r.absent}</td>
                    <td className="px-4 py-2 text-amber-700 font-semibold">{r.late}</td>
                    <td className="px-4 py-2">{r.total}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${pct >= 75 ? 'bg-forest' : pct >= 60 ? 'bg-gold' : 'bg-terra'}`} style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-xs font-bold">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2"><Badge color={pct >= 75 ? 'green' : pct >= 60 ? 'gold' : 'red'}>{pct >= 75 ? 'Regular' : pct >= 60 ? 'Needs attention' : 'Irregular'}</Badge></td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>
      )}
      {toast.node}
    </div>
  );
}
