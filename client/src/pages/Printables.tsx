import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api';
import { Loading } from '../components/ui';
import { Printer, ArrowLeft } from 'lucide-react';

function Letterhead() {
  return (
    <div className="text-center border-b-2 border-forest pb-3 mb-5">
      <div className="flex items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center text-gold-light text-2xl font-bold font-olchiki">ᱚ</div>
        <div>
          <h1 className="text-lg font-extrabold text-forest-dark leading-tight">ADIVASI SOCIO-EDUCATIONAL &amp; CULTURAL ASSOCIATION, ODISHA (ASECA)</h1>
          <p className="font-olchiki text-sm text-terra font-semibold">ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ ᱠᱮᱱᱫᱩᱡᱷᱟᱹᱨ, ᱩᱰᱤᱥᱟ (ᱳᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱠᱟᱹᱢᱤᱥᱟᱲᱟ)</p>
          <p className="text-xs font-semibold text-gold-dark tracking-widest">Education • Culture • Community</p>
        </div>
      </div>
      <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap justify-center gap-x-6">
        <span><strong>H.O.:</strong> Regd No-2667/269 of 1964, Rairangpur</span>
        <span><strong>B.O.:</strong> Regd No-77/26 of 2026, At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha</span>
      </div>
    </div>
  );
}

function PrintBar({ back }: { back: string }) {
  return (
    <div className="no-print flex items-center justify-between mb-4 max-w-4xl mx-auto mt-6">
      <Link to={back} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest"><ArrowLeft size={15} /> Back</Link>
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-forest text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-forest-light">
        <Printer size={15} /> Print / Save as PDF
      </button>
    </div>
  );
}

/* ============ AFFILIATION / RENEWAL FORM ============ */
export function AffiliationPrint() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState<any>(null);
  useEffect(() => { get(`/schools/${schoolId}`).then(setSchool); }, [schoolId]);
  if (!school) return <Loading />;

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <PrintBar back="/app/schools" />
      <div className="print-sheet max-w-4xl mx-auto rounded-2xl shadow-xl p-10 text-[13px] text-slate-800">
        <Letterhead />
        <h2 className="text-center text-base font-extrabold text-forest-dark mb-1">AFFILIATION / RENEWAL FORM FOR OL-ITUN ASHRA</h2>
        <p className="text-center text-[11px] text-slate-500 mb-5">(To be submitted to the Branch Office, Dangachua for the academic session 2026-27)</p>

        <table className="w-full border-collapse mb-5">
          <tbody>
            {[
              ['Name of the Ol-Itun Ashra', school.name],
              ['Ol Chiki Name', school.ol_chiki_name, true],
              ['Village (At)', school.village],
              ['Post Office (P.O.)', school.po],
              ['Police Station (P.S.)', school.ps],
              ['District', school.district],
              ['PIN', school.pin],
              ['State', school.state],
              ['Headmaster / Prabhari', school.headmaster],
              ['Affiliation No.', school.affiliation_no || '(new)'],
              ['Affiliation / Renewal Date', school.affiliation_date || '—'],
            ].map(([k, v, ol], i) => (
              <tr key={i}>
                <td className="border border-slate-400 px-3 py-2 font-semibold bg-slate-50 w-2/5">{k}</td>
                <td className={`border border-slate-400 px-3 py-2 ${ol ? 'font-olchiki' : ''}`}>{v || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="font-extrabold text-forest-dark mb-2">School Managing Committee (11 Members)</h3>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-forest text-white">
              {['Sl No', 'Member Name', "Father's Name", 'Designation', 'Mobile No.', 'Signature'].map((h) => (
                <th key={h} className="border border-slate-400 px-2 py-1.5 text-[11px] font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 11 }).map((_, i) => {
              const m = school.smc?.[i];
              return (
                <tr key={i}>
                  <td className="border border-slate-400 px-2 py-2 text-center">{String(i + 1).padStart(2, '0')}</td>
                  <td className="border border-slate-400 px-2 py-2">{m?.name || ''}</td>
                  <td className="border border-slate-400 px-2 py-2">{m?.father_name || ''}</td>
                  <td className="border border-slate-400 px-2 py-2">{m?.designation || ''}</td>
                  <td className="border border-slate-400 px-2 py-2">{m?.mobile || ''}</td>
                  <td className="border border-slate-400 px-2 py-2 h-9">{m?.signature_status === 'signed' ? '✓' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-10 mt-14">
          <div>
            <p className="text-[11px] text-slate-500 mb-8">Date: .......................</p>
            <p className="border-t border-slate-500 pt-1 font-semibold">Signature of Secretary</p>
            <p className="text-[11px] text-slate-500">School Managing Committee</p>
          </div>
          <div className="text-center">
            <div className="h-20 w-20 mx-auto rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">SEAL</div>
            <p className="mt-2 font-semibold">Managing Committee Seal</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-10 font-olchiki">ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱥᱮᱪᱮᱫ · ᱟᱹᱨᱤᱪᱟᱹᱞᱤ ᱛᱮ ᱡᱤᱣᱤ</p>
      </div>
    </div>
  );
}

/* ============ EXAM MARK SHEET ============ */
export function MarkSheetPrint() {
  const { examId } = useParams();
  const [exam, setExam] = useState<any>(null);
  useEffect(() => { get(`/exams/${examId}/results`).then(setExam); }, [examId]);
  if (!exam) return <Loading />;

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <PrintBar back={`/app/exams/${examId}`} />
      <div className="print-sheet max-w-5xl mx-auto rounded-2xl shadow-xl p-8 text-[11px] text-slate-800">
        <Letterhead />
        <div className="text-center mb-1">
          <h2 className="text-base font-extrabold text-terra">{exam.name}</h2>
          <p className="text-xs font-semibold">Session: {exam.session} · {exam.standard}</p>
        </div>
        <table className="w-full border-collapse mb-4">
          <tbody>
            <tr>
              <td className="border border-slate-400 px-2 py-1.5 font-semibold bg-slate-50">Exam Centre</td>
              <td className="border border-slate-400 px-2 py-1.5">{exam.exam_center}</td>
              <td className="border border-slate-400 px-2 py-1.5 font-semibold bg-slate-50">Centre Code</td>
              <td className="border border-slate-400 px-2 py-1.5 font-mono font-bold">{exam.center_code}</td>
            </tr>
            <tr>
              <td className="border border-slate-400 px-2 py-1.5 font-semibold bg-slate-50">School / Branch</td>
              <td className="border border-slate-400 px-2 py-1.5" colSpan={3}>{exam.school_name} · Affiliation No: {exam.affiliation_no}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-forest text-white">
              {['Sl', 'Name of Student', 'Roll No', "Mother's Name", "Father's Name", 'D.O.B.',
                'MIL-I', 'MIL-II', 'MIL-III', 'MIL-IV', 'ODIA', 'ENG', 'Total', 'Grade', 'Result'].map((h, i) => (
                <th key={i} className="border border-slate-400 px-1.5 py-1.5 text-[9px] font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exam.results.map((r: any, i: number) => (
              <tr key={r.id || i}>
                <td className="border border-slate-400 px-1.5 py-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 whitespace-nowrap font-semibold">{r.student_name}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 font-mono text-[9px] whitespace-nowrap">{r.roll_no}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 whitespace-nowrap">{r.mother_name}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 whitespace-nowrap">{r.father_name}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 whitespace-nowrap">{r.dob}</td>
                {[r.mil1, r.mil2, r.mil3, r.mil4, r.odia, r.english].map((m, j) => (
                  <td key={j} className={`border border-slate-400 px-1.5 py-1.5 text-center font-mono ${m < 30 ? 'font-bold text-red-700' : ''}`}>{m}</td>
                ))}
                <td className="border border-slate-400 px-1.5 py-1.5 text-center font-bold">{r.total}</td>
                <td className="border border-slate-400 px-1.5 py-1.5 text-center font-bold">{r.grade}</td>
                <td className={`border border-slate-400 px-1.5 py-1.5 text-center font-bold ${r.result === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>{r.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[9px] text-slate-500 mt-2">MIL = Modern Indian Language (Santali in Ol Chiki script, Papers I–IV). Pass marks: 30 per paper · 33% aggregate · Full marks 100 per paper.</p>

        <div className="grid grid-cols-3 gap-8 mt-14 text-center text-[11px]">
          <div className="border-t border-slate-500 pt-1 font-semibold">Centre Superintendent</div>
          <div className="border-t border-slate-500 pt-1 font-semibold">Branch Secretary, ASECA</div>
          <div className="border-t border-slate-500 pt-1 font-semibold">Controller of Examinations</div>
        </div>
      </div>
    </div>
  );
}

/* ============ CERTIFICATES ============ */
export function CertificatePrint() {
  const { studentId, type } = useParams();
  const [stu, setStu] = useState<any>(null);
  useEffect(() => { get(`/students/${studentId}`).then(setStu); }, [studentId]);
  if (!stu) return <Loading />;

  const titles: Record<string, string> = {
    bonafide: 'BONAFIDE CERTIFICATE',
    conduct: 'CONDUCT & CHARACTER CERTIFICATE',
    tc: 'TRANSFER CERTIFICATE',
  };
  const bodies: Record<string, string> = {
    bonafide: `This is to certify that ${stu.name}, Roll No ${stu.roll_no}, is a bonafide student of this institution, studying in ${stu.class}, Section ${stu.section}, for the academic year ${stu.academic_year}.`,
    conduct: `This is to certify that ${stu.name}, Roll No ${stu.roll_no}, bears a good moral character and conduct during their period of study at this institution.`,
    tc: `This is to certify that ${stu.name}, Roll No ${stu.roll_no}, Admission No ${stu.admission_no}, has been relieved from this institution and the Transfer Certificate is issued on request.`,
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <PrintBar back="/app/certificates" />
      <div className="print-sheet max-w-3xl mx-auto rounded-2xl shadow-xl p-14 text-slate-800 relative" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-3 border-4 border-double border-gold/60 rounded-xl pointer-events-none" />
        <Letterhead />
        <h2 className="text-center text-xl font-extrabold text-terra mt-8 mb-8 tracking-wider">{titles[type || 'bonafide']}</h2>
        <p className="text-[14px] leading-8 text-justify px-6">{bodies[type || 'bonafide']}</p>
        <div className="grid grid-cols-2 gap-4 mt-6 px-6 text-[12px] text-slate-600">
          <div><strong>School:</strong> {stu.school?.name}</div>
          <div><strong>Class:</strong> {stu.class} · Section {stu.section}</div>
          <div><strong>Date of Birth:</strong> {stu.dob}</div>
          <div><strong>Category:</strong> {stu.category}</div>
        </div>
        <div className="grid grid-cols-2 gap-10 mt-20 px-6 text-[12px]">
          <div><p className="mb-10 text-slate-500">Date: {new Date().toISOString().slice(0, 10)}</p><p className="border-t border-slate-500 pt-1 font-semibold">Clerk / Office In-charge</p></div>
          <div className="text-center"><p className="mb-10">&nbsp;</p><p className="border-t border-slate-500 pt-1 font-semibold">Headmaster / Principal</p></div>
        </div>
        <p className="text-center font-olchiki text-gold-dark mt-10">ᱥᱮᱪᱮᱫ • ᱟᱹᱨᱤᱪᱟᱹᱞᱤ • ᱜᱟᱶᱛᱟ</p>
      </div>
    </div>
  );
}

/* ============ ID CARD ============ */
export function IdCardPrint() {
  const { studentId } = useParams();
  const [stu, setStu] = useState<any>(null);
  useEffect(() => { get(`/students/${studentId}`).then(setStu); }, [studentId]);
  if (!stu) return <Loading />;

  const Card = ({ side }: { side: 'front' | 'back' }) => (
    <div className="w-86 rounded-2xl overflow-hidden shadow-xl border-2 border-gold/50" style={{ width: '340px' }}>
      {side === 'front' ? (
        <>
          <div className="bg-brand-gradient text-white p-3 text-center">
            <div className="text-[10px] font-bold tracking-wide">BRANCH ASECA DANGACHUA</div>
            <div className="font-olchiki text-[10px] text-gold-light">ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱫᱟᱸᱜᱩᱣᱟᱹ</div>
          </div>
          <div className="bg-white p-4 text-center">
            {stu.photo
              ? <img src={stu.photo} className="w-20 h-24 rounded-lg object-cover mx-auto border-2 border-forest/20" alt="" />
              : <div className="w-20 h-24 rounded-lg bg-forest-50 text-forest flex items-center justify-center text-3xl font-bold mx-auto">{stu.name?.charAt(0)}</div>}
            <div className="font-bold text-forest-dark mt-2 text-sm">{stu.name}</div>
            <div className="text-[10px] text-slate-500 font-olchiki">{stu.name_santali}</div>
            <table className="text-left text-[10px] w-full mt-3">
              <tbody>
                <tr><td className="font-semibold py-0.5">Roll No</td><td className="font-mono">{stu.roll_no}</td></tr>
                <tr><td className="font-semibold py-0.5">Class</td><td>{stu.class} ({stu.section})</td></tr>
                <tr><td className="font-semibold py-0.5">DOB</td><td>{stu.dob}</td></tr>
                <tr><td className="font-semibold py-0.5">Blood</td><td>{stu.blood_group || '—'}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-gold/10 px-4 py-2 text-[9px] text-center text-gold-dark font-semibold">Valid for academic year {stu.academic_year}</div>
        </>
      ) : (
        <div className="bg-white p-4 text-[10px] text-slate-700 h-full">
          <div className="font-bold text-forest-dark mb-2">Address & Contact</div>
          <p>{stu.village}, {stu.block}, {stu.district}, {stu.state} — {stu.pin}</p>
          <p className="mt-2"><strong>Guardian:</strong> {stu.guardian_name || stu.father_name}</p>
          <p><strong>Mobile:</strong> {stu.guardian_mobile}</p>
          <div className="mt-4 font-bold text-forest-dark">Issued by</div>
          <p>{stu.school?.name}</p>
          <p className="text-slate-500">{stu.school?.village}, {stu.school?.po}, {stu.school?.district} — {stu.school?.pin}</p>
          <div className="mt-6 text-center">
            <div className="h-10 w-24 mx-auto bg-[repeating-linear-gradient(45deg,#111_0_3px,#fff_3px_6px)] rounded opacity-80" title="barcode" />
            <p className="font-mono mt-1">{stu.admission_no}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <PrintBar back="/app/certificates" />
      <div className="flex flex-wrap justify-center gap-8">
        <Card side="front" />
        <Card side="back" />
      </div>
    </div>
  );
}
