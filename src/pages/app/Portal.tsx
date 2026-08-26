import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, CalendarCheck, Award, Wallet, Megaphone, Users, ArrowRight, CalendarDays, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, PageLoader, StatCard } from '../../components/ui/primitives';
import { fmtDate, fmtINR, ATTENDANCE_STATUS } from '../../lib/format';

export default function PortalPage() {
  const { user } = useAuth();
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/my-students').then((r: any) => {
      setMyStudents(r.data);
      if (r.data[0]) setSelected(r.data[0]);
    }).catch(() => {}).finally(() => setLoading(false));
    api('/api/public/notices').then((r: any) => setNotices(r.data.slice(0, 5)));
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    api(`/api/attendance/summary?student_id=${selected.id}`).then((r: any) => setAttendance(r));
    api(`/api/student-results/${selected.id}`).then((r: any) => setResults(r.data));
    api(`/api/student-fees/${selected.id}`).then((r: any) => setFees(r.data));
    api(`/api/timetable/student/${selected.id}`).then((r: any) => setTimetable(r.data));
  }, [selected]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="card relative overflow-hidden text-white p-6">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative">
          <p className="text-emerald-100/90 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.name} 👋</h1>
          <p className="text-emerald-100/80 text-sm mt-1">{user?.role_key === 'parent' ? 'Parent / Guardian Portal' : 'Student Portal'}</p>
        </div>
      </div>

      {/* Children selector (parent) */}
      {myStudents.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {myStudents.map((s) => (
            <button key={s.id} onClick={() => setSelected(s)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${selected?.id === s.id ? 'text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} style={selected?.id === s.id ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
              <Avatar name={s.name} src={s.photo} size={24} /> {s.name}
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <>
          {/* Student summary card */}
          <div className="card p-5 flex items-center gap-4">
            <Avatar name={selected.name} src={selected.photo} size={56} />
            <div className="min-w-0 grow">
              <h2 className="font-bold text-lg">{selected.name}</h2>
              <p className="text-sm text-slate-500">{selected.class_name}{selected.section_name ? `-${selected.section_name}` : ''} • Roll {selected.roll_no} • {selected.school_name}</p>
            </div>
            <Link to={`/app/students/${selected.id}`} className="btn-outline !py-2">Full Profile <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Attendance" value={`${attendance?.summary?.percentage ?? 0}%`} icon={<CalendarCheck className="h-5 w-5" />} tone="green" />
            <StatCard label="Exams Appeared" value={results.length} icon={<Award className="h-5 w-5" />} tone="blue" />
            <StatCard label="Fees Due" value={fmtINR(fees.reduce((a, f) => a + (f.amount - f.paid), 0))} icon={<Wallet className="h-5 w-5" />} tone="red" />
            <StatCard label="Notices" value={notices.length} icon={<Megaphone className="h-5 w-5" />} tone="gold" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Results */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Award className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} /> Latest Results</h3>
              <div className="space-y-3">
                {results.slice(0, 4).map((r: any) => (
                  <div key={r.exam_id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div><p className="text-sm font-medium">{r.exam_name}</p><p className="text-[11px] text-slate-400">{r.total_marks}/{r.max_marks}</p></div>
                    <div className="text-right"><p className="font-bold">{r.percentage}%</p><span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{r.grade}</span></div>
                  </div>
                ))}
                {results.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No results yet.</p>}
              </div>
            </div>

            {/* Notices */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Megaphone className="h-4 w-4" style={{ color: 'var(--brand-secondary)' }} /> Latest Notices</h3>
              <div className="space-y-2">
                {notices.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-400">{fmtDate(n.publish_at || n.created_at)}</p>
                  </div>
                ))}
                {notices.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No notices.</p>}
              </div>
            </div>

            {/* Timetable */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} /> Today's Classes</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {timetable.slice(0, 7).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs font-bold text-slate-400 w-16">{t.start_time}</span>
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">{t.subject_name}</span>
                  </div>
                ))}
                {timetable.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No timetable set.</p>}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-10 text-center text-slate-400">
          <Users className="h-10 w-10 mx-auto mb-3" />
          <p>No student profile linked to your account yet.</p>
          <p className="text-sm">Please contact the school administrator.</p>
        </div>
      )}
    </div>
  );
}
