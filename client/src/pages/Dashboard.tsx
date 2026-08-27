import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api';
import { Card, StatCard, Loading, Select } from '../components/ui';
import { School, GraduationCap, Users, UserCog, Bell, BookOpen, BedDouble, ClipboardList, FileSignature } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE = ['#1B4332', '#D97706', '#1E3A8A', '#0284C7', '#7F2E1E'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');

  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => { get(`/dashboard/stats${schoolId ? `?school_id=${schoolId}` : ''}`).then(setData); }, [schoolId]);

  if (!data) return <Loading />;
  const s = data.stats;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Branch Dashboard</h1>
          <p className="text-sm text-slate-500">ASECA Dangachua — schools, students, examinations & content at a glance</p>
        </div>
        <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-64">
          <option value="">All schools (branch-wide)</option>
          {schools.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<School size={22} />} label="Affiliated Schools" value={s.schools} color="forest" />
        <StatCard icon={<GraduationCap size={22} />} label="Active Students" value={s.students} color="royal" />
        <StatCard icon={<Users size={22} />} label="Teachers" value={s.teachers} color="gold" />
        <StatCard icon={<UserCog size={22} />} label="Support Staff" value={s.staff} color="terra" />
        <StatCard icon={<ClipboardList size={22} />} label="Examinations" value={s.exams} color="sky" />
        <StatCard icon={<BookOpen size={22} />} label="Library Titles" value={s.books} color="forest" />
        <StatCard icon={<BedDouble size={22} />} label="Hostels" value={s.hostels} color="royal" />
        <StatCard icon={<FileSignature size={22} />} label="SMC Signatures" value={`${s.smcSigned}/${s.smcTotal}`} color="gold" sub="11-member committees" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-forest-dark mb-4">Attendance Trend (last 14 working days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.attendanceTrend}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B4332" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1B4332" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="present" name="Present" stroke="#1B4332" fill="url(#gp)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#7F2E1E" fill="#7F2E1E33" strokeWidth={1.5} />
              <Area type="monotone" dataKey="late" name="Late" stroke="#D97706" fill="#D9770633" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-forest-dark mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.genderSplit} dataKey="c" nameKey="gender" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {data.genderSplit.map((_: any, i: number) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-forest-dark mb-4">Students per School</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.schoolWise.map((x: any) => ({ ...x, short: x.name.split(' OL-ITUN')[0] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="short" tick={{ fontSize: 9 }} interval={0} angle={-12} height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="students" name="Students" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-forest-dark flex items-center gap-2"><Bell size={16} className="text-terra" /> Latest Notices</h3>
            <Link to="/app/notices" className="text-xs text-forest font-semibold">Manage →</Link>
          </div>
          <div className="space-y-3">
            {data.recentNotices.map((n: any) => (
              <div key={n.id} className="border-l-3 border-gold pl-3">
                <div className="text-sm font-semibold text-slate-700 line-clamp-1">{n.title}</div>
                <div className="text-[11px] text-slate-400">{n.date} · {n.category}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
