import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, uploadFile } from '../api';
import { Card, Tabs, Loading, Badge, Button, Field, Input } from '../components/ui';
import { useAuth } from '../auth';
import {
  ArrowLeft, ShieldCheck, FileText, BookOpen, CalendarDays, Award, Upload,
  CheckCircle2, XCircle, Clock, BedDouble,
} from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const [stu, setStu] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [timetable, setTimetable] = useState<any[]>([]);
  const { canWrite } = useAuth();

  useEffect(() => { get(`/students/${id}`).then(setStu); }, [id]);
  useEffect(() => {
    if (stu) get(`/timetable?school_id=${stu.school_id}&class=${encodeURIComponent(stu.class)}`).then(setTimetable).catch(() => {});
  }, [stu]);

  if (!stu) return <Loading />;

  const masked = (a: string) => !a ? '—' : a.length > 4 ? 'XXXX-XXXX-' + a.slice(-4) : a;
  const verified = !!stu.aadhaar && stu.aadhaar.replace(/\D/g, '').length === 12;

  const uploadDoc = async (key: string, f: File) => {
    const r = await uploadFile(f, 'document', stu.name + ' ' + key);
    await (await import('../api')).put(`/students/${stu.id}`, { ...stu, [key]: r.url });
    setStu({ ...stu, [key]: r.url });
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FileText size={14} /> },
    { key: 'identity', label: 'Identity & Verification', icon: <ShieldCheck size={14} /> },
    { key: 'academic', label: 'Academic', icon: <Award size={14} /> },
    { key: 'attendance', label: 'Attendance', icon: <Clock size={14} /> },
    { key: 'exams', label: 'Examinations & Results', icon: <FileText size={14} /> },
    { key: 'documents', label: 'Documents', icon: <Upload size={14} /> },
    { key: 'library', label: 'Library', icon: <BookOpen size={14} /> },
    { key: 'timetable', label: 'Timetable', icon: <CalendarDays size={14} /> },
    { key: 'certificates', label: 'Certificates', icon: <Award size={14} /> },
  ];

  return (
    <div>
      <Link to="/app/students" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest mb-4 no-print">
        <ArrowLeft size={15} /> Back to Students
      </Link>

      {/* Profile header */}
      <Card className="p-5 mb-5">
        <div className="flex flex-wrap items-center gap-5">
          {stu.photo
            ? <img src={stu.photo} className="w-20 h-20 rounded-2xl object-cover border-4 border-forest-50" alt="" />
            : <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl font-bold">{stu.name?.charAt(0)}</div>}
          <div className="flex-1 min-w-60">
            <h1 className="text-xl font-bold text-forest-dark">{stu.name}</h1>
            {stu.name_santali && <p className="font-olchiki text-slate-500 text-sm">{stu.name_santali}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge color="blue">{stu.class} · Sec {stu.section}</Badge>
              <Badge color="green">{stu.school?.name?.split(',')[0]}</Badge>
              <Badge color="gold">Roll: {stu.roll_no}</Badge>
              <Badge color={verified ? 'green' : 'red'}>
                {verified ? <span className="flex items-center gap-1"><CheckCircle2 size={11} /> Aadhaar Verified</span> : <span className="flex items-center gap-1"><XCircle size={11} /> Unverified</span>}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-forest">{stu.attendance_pct ?? '—'}%</div>
            <div className="text-xs text-slate-500">Attendance</div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-5">
          <Info title="Personal Information" rows={[
            ['Date of Birth', stu.dob], ['Gender', stu.gender], ['Blood Group', stu.blood_group || '—'],
            ['Category', stu.category], ['Admission No', stu.admission_no], ['Admission Date', stu.admission_date],
            ['Previous School', stu.previous_school || '—'], ['Status', stu.status],
          ]} />
          <Info title="Family & Guardian" rows={[
            ["Father's Name", stu.father_name], ["Mother's Name", stu.mother_name],
            ['Guardian', stu.guardian_name], ['Guardian Mobile', stu.guardian_mobile],
          ]} />
          <Info title="Address" rows={[
            ['Village (At)', stu.village], ['Block / P.S.', stu.block], ['District', stu.district],
            ['State', stu.state], ['PIN', stu.pin],
          ]} />
          <Card className="p-5">
            <h3 className="font-bold text-forest-dark mb-3 flex items-center gap-2"><BedDouble size={16} className="text-royal" /> Hostel</h3>
            {stu.hostel
              ? <p className="text-sm text-slate-600">Boarding — <strong>{stu.hostel.student_name && ''}</strong>Room {stu.hostel.room_no}, Bed {stu.hostel.bed} since {stu.hostel.check_in}</p>
              : <p className="text-sm text-slate-400">Not allocated to any hostel.</p>}
          </Card>
        </div>
      )}

      {tab === 'identity' && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-bold text-forest-dark mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-green-600" /> Aadhaar Verification</h3>
            <div className="space-y-3 text-sm">
              <IdRow label="Student Aadhaar" value={canWrite ? (stu.aadhaar || '—') : masked(stu.aadhaar)} ok={verified} />
              <IdRow label="Father's Aadhaar" value={canWrite ? (stu.father_aadhaar || '—') : masked(stu.father_aadhaar)} ok={!!stu.father_aadhaar} />
              <IdRow label="Mother's Aadhaar" value={canWrite ? (stu.mother_aadhaar || '—') : masked(stu.mother_aadhaar)} ok={!!stu.mother_aadhaar} />
            </div>
            <p className="text-[11px] text-slate-400 mt-4">Identity documents are kept in private storage and shown masked to staff without administrator privileges.</p>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-forest-dark mb-3">Aadhaar Document</h3>
            {stu.aadhaar_doc
              ? <a href={stu.aadhaar_doc} target="_blank" rel="noreferrer" className="text-sm text-royal underline flex items-center gap-2"><FileText size={15} /> View uploaded document</a>
              : <p className="text-sm text-slate-400">No document uploaded.</p>}
          </Card>
        </div>
      )}

      {tab === 'academic' && (
        <Info title="Academic Record" rows={[
          ['Academic Year', stu.academic_year], ['Class', stu.class], ['Section', stu.section],
          ['Roll No', stu.roll_no], ['Admission No', stu.admission_no], ['School', stu.school?.name],
          ['Previous School', stu.previous_school || '—'],
        ]} />
      )}

      {tab === 'attendance' && (
        <Card className="p-5">
          <h3 className="font-bold text-forest-dark mb-4">Recent Attendance</h3>
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
            {stu.attendance.map((a: any) => (
              <div key={a.id} title={`${a.date}: ${a.status}`}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold text-white ${
                  a.status === 'present' ? 'bg-forest' : a.status === 'absent' ? 'bg-terra' : 'bg-gold'}`}>
                {a.status[0].toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-forest inline-block" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-terra inline-block" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gold inline-block" /> Late</span>
          </div>
        </Card>
      )}

      {tab === 'exams' && (
        <Card className="p-5">
          {stu.results.length === 0 ? <p className="text-sm text-slate-400">No examination results yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-forest-50 text-forest-dark">
                {['Exam', 'Session', 'MIL-I', 'MIL-II', 'MIL-III', 'MIL-IV', 'Odia', 'English', 'Total', 'Grade', 'Result'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y">
                {stu.results.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{r.exam_name}</td>
                    <td className="px-3 py-2">{r.session}</td>
                    {[r.mil1, r.mil2, r.mil3, r.mil4, r.odia, r.english].map((m, i) => (
                      <td key={i} className={`px-3 py-2 font-mono ${m < 30 ? 'text-red-600 font-bold' : ''}`}>{m}</td>
                    ))}
                    <td className="px-3 py-2 font-bold">{r.total}</td>
                    <td className="px-3 py-2"><Badge color={r.grade.startsWith('A') ? 'green' : r.grade === 'F' ? 'red' : 'blue'}>{r.grade}</Badge></td>
                    <td className="px-3 py-2"><Badge color={r.result === 'PASS' ? 'green' : 'red'}>{r.result}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'documents' && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { key: 'aadhaar_doc', label: 'Aadhaar Card' },
            { key: 'caste_doc', label: 'Caste / Category Certificate' },
            { key: 'photo', label: 'Birth Certificate / Photo' },
          ].map((d) => (
            <Card key={d.key} className="p-5">
              <div className="flex items-center gap-2 mb-2"><FileText size={16} className="text-royal" /><span className="font-semibold text-sm">{d.label}</span></div>
              {(stu as any)[d.key]
                ? <a href={(stu as any)[d.key]} target="_blank" rel="noreferrer" className="text-xs text-royal underline break-all">View / download file</a>
                : <p className="text-xs text-slate-400">Not uploaded</p>}
              {canWrite && (
                <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-forest cursor-pointer border border-dashed border-forest/40 rounded-lg px-3 py-2 hover:bg-forest-50">
                  <Upload size={13} /> Upload
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDoc(d.key, e.target.files[0])} />
                </label>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'library' && (
        <Card className="p-5">
          {stu.issues.length === 0 ? <p className="text-sm text-slate-400">No books issued.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-forest-50 text-forest-dark">{['Book', 'Issued', 'Due', 'Status'].map((h) => <th key={h} className="px-3 py-2 text-left text-xs">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {stu.issues.map((i: any) => (
                  <tr key={i.id}>
                    <td className="px-3 py-2">{i.title}</td>
                    <td className="px-3 py-2">{i.issue_date}</td>
                    <td className="px-3 py-2">{i.due_date}</td>
                    <td className="px-3 py-2"><Badge color={i.status === 'returned' ? 'green' : 'gold'}>{i.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'timetable' && (
        <Card className="p-5">
          {timetable.length === 0 ? <p className="text-sm text-slate-400">No timetable published for this class.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-forest-50 text-forest-dark">
                  {['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'].map((h) => <th key={h} className="px-2 py-2 text-left">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <tr key={day}>
                      <td className="px-2 py-2 font-semibold whitespace-nowrap">{day}</td>
                      {[1, 2, 3, 4, 5, 6].map((p) => {
                        const slot = timetable.find((t) => t.day === day && t.period === p);
                        return <td key={p} className="px-2 py-2">{slot ? <div><div className="font-medium">{slot.subject}</div><div className="text-slate-400 text-[10px]">{slot.teacher}</div></div> : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'certificates' && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { type: 'bonafide', label: 'Bonafide Certificate', desc: 'Proof of enrolment at the Ol-Itun Ashra' },
            { type: 'conduct', label: 'Conduct / Character Certificate', desc: 'For transfers and admissions' },
            { type: 'tc', label: 'Transfer Certificate', desc: 'School leaving certificate' },
          ].map((c) => (
            <Card key={c.type} className="p-5 text-center">
              <Award size={32} className="mx-auto text-gold mb-2" />
              <div className="font-bold text-forest-dark text-sm">{c.label}</div>
              <p className="text-xs text-slate-500 mt-1 mb-4">{c.desc}</p>
              <Link to={`/print/certificate/${stu.id}/${c.type}`} target="_blank"><Button size="sm" variant="outline" className="w-full justify-center">Generate & Print</Button></Link>
            </Card>
          ))}
          <Card className="p-5 text-center">
            <Award size={32} className="mx-auto text-royal mb-2" />
            <div className="font-bold text-forest-dark text-sm">Student ID Card</div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Photo identity with roll & school</p>
            <Link to={`/print/idcard/${stu.id}`} target="_blank"><Button size="sm" variant="royal" className="w-full justify-center">Generate ID Card</Button></Link>
          </Card>
        </div>
      )}
    </div>
  );
}

function Info({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <Card className="p-5">
      <h3 className="font-bold text-forest-dark mb-3">{title}</h3>
      <dl className="divide-y divide-slate-100 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-medium text-slate-800 text-right">{v || '—'}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function IdRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono font-semibold flex items-center gap-1.5 ${ok ? 'text-green-700' : 'text-slate-400'}`}>
        {value} {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      </span>
    </div>
  );
}
