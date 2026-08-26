import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, IdCard, FileText, CalendarCheck, Wallet, LibraryBig, CalendarDays, Award, BookOpen, User } from 'lucide-react';
import { api, fetchBlob } from '../../lib/api';
import { Avatar, PageLoader, StatusBadge } from '../../components/ui/primitives';
import { fmtDate, fmtINR, ATTENDANCE_STATUS, FEE_STATUS } from '../../lib/format';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'academic', label: 'Academic', icon: BookOpen },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'exams', label: 'Exams', icon: Award },
  { key: 'fees', label: 'Fees', icon: Wallet },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'library', label: 'Library', icon: LibraryBig },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays },
  { key: 'certificates', label: 'Certificates', icon: IdCard },
];

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [attendance, setAttendance] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  useEffect(() => { api(`/api/students/${id}`).then((r: any) => setStudent(r.data)).catch(() => {}); }, [id]);
  useEffect(() => { if (student) api(`/api/attendance/summary?student_id=${id}`).then((r: any) => setAttendance(r)).catch(() => {}); }, [student]);
  useEffect(() => { if (student) api(`/api/student-fees/${id}`).then((r: any) => setFees(r.data)).catch(() => {}); }, [student]);
  useEffect(() => { if (student) api(`/api/student-results/${id}`).then((r: any) => setResults(r.data)).catch(() => {}); }, [student]);
  useEffect(() => { if (student) api(`/api/library/student/${id}`).then((r: any) => setLibrary(r.data)).catch(() => {}); }, [student]);
  useEffect(() => { if (student) api(`/api/timetable/student/${id}`).then((r: any) => setTimetable(r.data)).catch(() => {}); }, [student]);

  if (!student) return <PageLoader />;

  const printCard = () => { window.open(`/app/id-cards?student=${student.student_id}`, '_blank'); };

  return (
    <div className="space-y-5">
      <Link to="/app/students" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Back to Students</Link>

      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="h-24" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }} />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-wrap items-end gap-4">
            <div className="rounded-full ring-4 ring-white dark:ring-slate-900 overflow-hidden"><Avatar name={student.name} src={student.photo} size={84} /></div>
            <div className="grow min-w-[200px]">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-sm text-slate-500">{student.student_id} • Roll {student.roll_no} • {student.class_name}{student.section_name ? `-${student.section_name}` : ''}</p>
              <p className="text-sm text-slate-500">{student.school_name}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={student.status} />
              <button className="btn-outline !py-2" onClick={printCard}><IdCard className="h-4 w-4" /> ID Card</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === tb.key ? 'text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`} style={tab === tb.key ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
            <tb.icon className="h-4 w-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <InfoRow label="Date of Birth" value={fmtDate(student.dob)} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Blood Group" value={student.blood_group} />
            <InfoRow label="Category" value={student.category} />
            <InfoRow label="Admission Date" value={fmtDate(student.admission_date)} />
            <InfoRow label="Admission No" value={student.admission_no} />
            <InfoRow label="Previous School" value={student.previous_school} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Family & Contact</h3>
            <InfoRow label="Father" value={student.father_name} />
            <InfoRow label="Mother" value={student.mother_name} />
            <InfoRow label="Guardian" value={`${student.guardian_name}${student.guardian_relation ? ` (${student.guardian_relation})` : ''}`} />
            <InfoRow label="Mobile" value={student.mobile} />
            <InfoRow label="Address" value={`${student.address || ''} ${student.village}, ${student.block}, ${student.district} — ${student.pincode}`} />
          </div>
        </div>
      )}

      {tab === 'academic' && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Current Academic Details</h3>
          <InfoRow label="Academic Year" value={student.academic_year_name || '2025–2026'} />
          <InfoRow label="Class" value={student.class_name} />
          <InfoRow label="Section" value={student.section_name} />
          <InfoRow label="Roll Number" value={student.roll_no} />
          <InfoRow label="School" value={student.school_name} />
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Attendance Summary</h3>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center"><p className="text-4xl font-extrabold" style={{ color: 'var(--brand-secondary)' }}>{attendance?.summary?.percentage ?? 0}%</p><p className="text-xs text-slate-400 mt-1">Overall</p></div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(attendance?.summary?.counts || {}).map(([k, v]: any) => (
                <span key={k} className={`badge ${ATTENDANCE_STATUS[k]?.bg} ${ATTENDANCE_STATUS[k]?.color}`}>{ATTENDANCE_STATUS[k]?.label}: {v}</span>
              ))}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {attendance?.data?.slice(0, 30).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-sm">{fmtDate(a.date)}</span>
                <span className={`badge ${ATTENDANCE_STATUS[a.status]?.bg} ${ATTENDANCE_STATUS[a.status]?.color}`}>{ATTENDANCE_STATUS[a.status]?.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'exams' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Exam</th><th className="th text-center">Total</th><th className="th text-center">Percentage</th><th className="th text-center">Grade</th><th className="th text-center">Status</th><th className="th text-center">Rank</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((r: any) => (
                <tr key={r.exam_id}>
                  <td className="td font-medium">{r.exam_name}</td>
                  <td className="td text-center">{r.total_marks}/{r.max_marks}</td>
                  <td className="td text-center font-semibold">{r.percentage}%</td>
                  <td className="td text-center"><span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{r.grade}</span></td>
                  <td className="td text-center">{r.result_status === 'pass' ? '✅' : '❌'}</td>
                  <td className="td text-center">{r.rank ? `#${r.rank}` : '—'}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={6} className="td text-center text-slate-400 py-8">No exam results yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fees' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Category</th><th className="th text-right">Amount</th><th className="th text-right">Paid</th><th className="th text-right">Due</th><th className="th">Status</th><th className="th">Due Date</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fees.map((f: any) => (
                <tr key={f.id}>
                  <td className="td font-medium">{f.category_name || 'Fee'}</td>
                  <td className="td text-right">{fmtINR(f.amount)}</td>
                  <td className="td text-right text-emerald-600">{fmtINR(f.paid)}</td>
                  <td className="td text-right text-rose-600">{fmtINR(f.amount - f.paid)}</td>
                  <td className="td"><span className={`badge ${FEE_STATUS[f.status]?.cls}`}>{FEE_STATUS[f.status]?.label || f.status}</span></td>
                  <td className="td">{fmtDate(f.due_date)}</td>
                </tr>
              ))}
              {fees.length === 0 && <tr><td colSpan={6} className="td text-center text-slate-400 py-8">No fees assigned.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'documents' && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Documents</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {student.documents?.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-400">{doc.doc_type} {doc.is_sensitive ? '• 🔒 Sensitive' : ''}</p>
                </div>
              </div>
            ))}
            {!student.documents?.length && <p className="text-sm text-slate-400">No documents uploaded.</p>}
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Book</th><th className="th">Issued</th><th className="th">Due</th><th className="th">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {library.map((l: any) => (
                <tr key={l.id}>
                  <td className="td font-medium">{l.title}</td>
                  <td className="td">{fmtDate(l.issue_date)}</td>
                  <td className="td">{fmtDate(l.due_date)}</td>
                  <td className="td"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
              {library.length === 0 && <tr><td colSpan={4} className="td text-center text-slate-400 py-8">No library history.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'timetable' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Day</th><th className="th">Period</th><th className="th">Time</th><th className="th">Subject</th><th className="th">Teacher</th><th className="th">Room</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {timetable.map((t: any, i: number) => (
                <tr key={i}>
                  <td className="td">{['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][t.day]}</td>
                  <td className="td">{t.period_name}</td>
                  <td className="td">{t.start_time}–{t.end_time}</td>
                  <td className="td font-medium">{t.subject_name}</td>
                  <td className="td">{t.teacher_name || '—'}</td>
                  <td className="td">{t.room || '—'}</td>
                </tr>
              ))}
              {timetable.length === 0 && <tr><td colSpan={6} className="td text-center text-slate-400 py-8">No timetable set.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {student.certificates?.map((c: any) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="min-w-0 grow">
                <p className="font-semibold text-sm">{c.title || c.type}</p>
                <p className="text-[11px] text-slate-400">{c.certificate_no} • {fmtDate(c.issue_date)}</p>
              </div>
              <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => fetchBlob(`/api/certificates/${c.id}/pdf`, `certificate-${c.certificate_no}.pdf`)}>PDF</button>
            </div>
          ))}
          {!student.certificates?.length && <p className="text-sm text-slate-400 col-span-2">No certificates issued.</p>}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}
