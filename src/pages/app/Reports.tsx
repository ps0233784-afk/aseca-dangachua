import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Users, CalendarCheck, Wallet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';
import { useBrand } from '../../contexts/BrandContext';
import { PageLoader, StatCard } from '../../components/ui/primitives';
import { SimpleBar, Donut } from '../../components/charts/Charts';

export default function ReportsPage() {
  const { org } = useBrand();
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/api/students?limit=500'),
      api('/api/attendance/class-stats'),
      api('/api/fee-assignments'),
    ]).then(([s, a, f]) => { setStudents(s.data); setAttendance(a.data); setFees(f.data); }).finally(() => setLoading(false));
  }, []);

  const byClass = Object.entries(students.reduce((m: any, s) => { m[s.class_name || '—'] = (m[s.class_name || '—'] || 0) + 1; return m; }, {})).map(([name, value]: any) => ({ name, value })).sort((a, b) => b.value - a.value);
  const byGender: { name: string; value: number }[] = [['Male', students.filter((s) => s.gender === 'Male').length], ['Female', students.filter((s) => s.gender === 'Female').length]].map(([name, value]) => ({ name: name as string, value: value as number }));
  const feeSummary = [
    { name: 'Paid', value: fees.filter((f) => f.status === 'paid').length },
    { name: 'Partial', value: fees.filter((f) => f.status === 'partial').length },
    { name: 'Pending', value: fees.filter((f) => f.status === 'pending').length },
  ];
  const totalDue = fees.reduce((a, f) => a + (f.amount - f.paid), 0);

  const exportReport = (rows: any[], name: string) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 28));
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const printReport = () => window.print();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Reports</h1><p className="text-sm text-slate-500">Analytics and exports for {org?.name}</p></div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={printReport}><Download className="h-4 w-4" /> Print</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Students" value={students.length} icon={<Users className="h-5 w-5" />} tone="blue" />
        <StatCard label="Fee Records" value={fees.length} icon={<Wallet className="h-5 w-5" />} tone="gold" />
        <StatCard label="Pending Fees" value={`₹${Math.round(totalDue).toLocaleString('en-IN')}`} icon={<Wallet className="h-5 w-5" />} tone="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Students by Class</h3>
          <SimpleBar data={byClass} xKey="value" yKey="name" color="#1a56db" height={300} />
          <button className="btn-outline !py-1.5 !px-3 text-xs mt-2" onClick={() => exportReport(students.map((s) => ({ name: s.name, student_id: s.student_id, class: s.class_name, section: s.section_name, gender: s.gender, school: s.school_name, mobile: s.mobile })), 'students-report')}><Download className="h-3.5 w-3.5" /> Export Excel</button>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Students by Gender</h3>
          <Donut data={byGender} height={300} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Fee Collection Status</h3>
          <Donut data={feeSummary} height={280} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Attendance by Class</h3>
          {attendance.length ? (
            <SimpleBar data={attendance.filter((a) => a.status === 'present').map((a) => ({ name: a.class_name, present: a.n }))} xKey="present" yKey="name" color="#147d4b" height={280} />
          ) : <p className="text-sm text-slate-400 text-center py-16">No attendance data</p>}
        </div>
      </div>
    </div>
  );
}
