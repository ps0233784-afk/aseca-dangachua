import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  School, Users, UserCog, CalendarCheck, Wallet, ClipboardList, Megaphone, GraduationCap,
  Plus, TrendingUp, BookOpenCheck, Building2, LibraryBig, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { StatCard, PageLoader } from '../../components/ui/primitives';
import { SimpleBar, Donut, MultiLine } from '../../components/charts/Charts';
import { useBrand } from '../../contexts/BrandContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { org } = useBrand();
  const [d, setD] = useState<any>(null);
  const [studentsByClass, setStudentsByClass] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/api/dashboard'),
      api('/api/students?limit=500').then((r: any) => {
        const map: Record<string, number> = {};
        (r.data || []).forEach((s: any) => { map[s.class_name || '—'] = (map[s.class_name || '—'] || 0) + 1; });
        setStudentsByClass(Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
      }),
      api('/api/attendance/class-stats').then((r: any) => setAttendanceStats(r.data || [])),
    ]).then(([dash]) => setD(dash.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading dashboard…" />;

  const isOrg = ['super_admin', 'org_admin'].includes(user!.role_key);

  const quickActions = [
    { to: '/app/schools', label: 'Add School', icon: School, module: 'schools' },
    { to: '/app/students', label: 'Add Student', icon: Users, module: 'students' },
    { to: '/app/staff', label: 'Add Teacher', icon: UserCog, module: 'staff' },
    { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck, module: 'attendance' },
    { to: '/app/exams', label: 'Enter Marks', icon: ClipboardList, module: 'exams' },
    { to: '/app/notices', label: 'New Notice', icon: Megaphone, module: 'notices' },
    { to: '/app/reports', label: 'Reports', icon: TrendingUp, module: 'reports' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card relative overflow-hidden text-white p-6 sm:p-8">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-100/90">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">{user!.name} 👋</h1>
            <p className="text-sm text-emerald-100/80 mt-1">{user!.school ? user!.school.name : 'Organisation-wide view'} • {user!.role_name}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickActions.filter((a) => ['super_admin', 'org_admin'].includes(user!.role_key) || ['students','staff','attendance','exams','notices'].includes(a.module)).map((a) => (
              <Link key={a.label} to={a.to} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <Plus className="h-4 w-4" /> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Schools" value={d?.schools ?? 0} icon={<School className="h-5 w-5" />} tone="blue" />
        <StatCard label="Students" value={d?.students ?? 0} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label="Teachers & Staff" value={d?.teachers ?? 0} icon={<UserCog className="h-5 w-5" />} tone="gold" />
        <StatCard label="Today's Attendance" value={`${d?.today_attendance ?? 0}/${d?.attendance_total ?? 0}`} icon={<CalendarCheck className="h-5 w-5" />} tone="purple" />
        <StatCard label="Pending Fees" value={`₹${Math.round(d?.pending_fees ?? 0).toLocaleString('en-IN')}`} icon={<Wallet className="h-5 w-5" />} tone="red" />
        <StatCard label="Exams" value={d?.exams ?? 0} icon={<ClipboardList className="h-5 w-5" />} tone="sky" />
        <StatCard label="Results Published" value={d?.results ?? 0} icon={<BookOpenCheck className="h-5 w-5" />} tone="green" />
        <StatCard label="Published Notices" value={d?.notices ?? 0} icon={<Megaphone className="h-5 w-5" />} tone="blue" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} /> Students by Class</h3>
          <SimpleBar data={studentsByClass} xKey="value" yKey="name" color="#1a56db" height={300} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><CalendarCheck className="h-4 w-4" style={{ color: 'var(--brand-secondary)' }} /> Attendance Overview</h3>
          <AttendanceChart data={attendanceStats} />
        </div>
      </div>
    </div>
  );
}

function AttendanceChart({ data }: { data: any[] }) {
  // aggregate present vs others per class
  const classes = Array.from(new Set(data.map((d) => d.class_name)));
  const present = classes.map((c) => ({ name: c, present: data.filter((d) => d.class_name === c && d.status === 'present').reduce((a, b) => a + b.n, 0), absent: data.filter((d) => d.class_name === c && d.status === 'absent').reduce((a, b) => a + b.n, 0), late: data.filter((d) => d.class_name === c && ['late', 'half_day'].includes(d.status)).reduce((a, b) => a + b.n, 0) }));
  if (!data.length) return <p className="text-sm text-slate-400 text-center py-16">No attendance data yet.</p>;
  return <MultiLine data={present} xKey="name" lines={[{ key: 'present', color: '#147d4b', name: 'Present' }, { key: 'absent', color: '#e11d48', name: 'Absent' }, { key: 'late', color: '#d9a033', name: 'Late/Half' }]} height={300} />;
}
