import React, { useEffect, useState } from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { api, fetchBlob } from '../../lib/api';
import { PageLoader, EmptyState, Avatar } from '../../components/ui/primitives';
import { useBrand } from '../../contexts/BrandContext';
import { fmtDate } from '../../lib/format';

export default function ReportCardsPage() {
  const { org } = useBrand();
  const [exams, setExams] = useState<any[]>([]);
  const [examId, setExamId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api('/api/exams').then((r: any) => setExams(r.data.filter((e: any) => ['published', 'results_published', 'locked'].includes(e.status)))); }, []);
  useEffect(() => {
    if (!examId) { setResults([]); return; }
    setLoading(true);
    api(`/api/exams/${examId}/results`).then((r: any) => setResults(r.data)).finally(() => setLoading(false));
  }, [examId]);

  const openPreview = async (studentId: number) => {
    const r: any = await api(`/api/exams/${examId}/result/${studentId}`);
    setPreview(r.data);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Report Cards</h1>
        <p className="text-sm text-slate-500">Preview, print and download professional report cards</p>
      </div>

      <div className="card p-4 flex items-end gap-3">
        <div>
          <label className="label">Select Exam</label>
          <select className="input !w-auto" value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">Choose exam…</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {loading && <PageLoader />}
      {!loading && examId && results.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((r) => (
            <button key={r.id} onClick={() => openPreview(r.student_id)} className="card p-4 text-left card-hover flex items-center gap-3">
              <Avatar name={r.name} size={44} />
              <div className="min-w-0 grow">
                <p className="font-semibold truncate">{r.name}</p>
                <p className="text-xs text-slate-400">{r.class_name}{r.section_name ? `-${r.section_name}` : ''} • Roll {r.roll_no}</p>
              </div>
              <div className="text-right"><p className="font-bold">{r.percentage}%</p><p className="text-[11px] text-slate-400">{r.grade}</p></div>
            </button>
          ))}
        </div>
      )}
      {!loading && examId && results.length === 0 && <EmptyState title="No results for this exam" sub="Compute results first from the exam page." />}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-[95] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <ReportCardPreview data={preview} org={org} examName={exams.find((e) => e.id === Number(examId))?.name} />
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 sticky bottom-0 bg-white no-print">
              <button className="btn-outline" onClick={() => setPreview(null)}>Close</button>
              <button className="btn-outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</button>
              <button className="btn-primary" onClick={() => fetchBlob(`/api/report-card/${examId}/${preview.student_id}/pdf`, `report-card-${preview.sid}.pdf`)}><Download className="h-4 w-4" /> Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCardPreview({ data, org, examName }: { data: any; org: any; examName?: string }) {
  return (
    <div className="p-8" id="report-card">
      <div className="text-center border-b-2 pb-4" style={{ borderColor: 'var(--brand-secondary)' }}>
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--brand-deep)' }}>{org?.name}</h1>
        <p className="text-sm">{data.school_name}</p>
        <p className="text-xs text-slate-500">{org?.address} • {org?.phone}</p>
        <h2 className="text-lg font-bold mt-3" style={{ color: 'var(--brand-primary)' }}>REPORT CARD — {examName || ''}</h2>
      </div>
      <div className="flex justify-between items-start mt-5 gap-6">
        <div className="text-sm space-y-1">
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Roll No:</strong> {data.roll_no} <span className="ml-4"><strong>ID:</strong> {data.sid}</span></p>
          <p><strong>Class:</strong> {data.class_name} {data.section_name ? `- ${data.section_name}` : ''}</p>
          <p><strong>Father:</strong> {data.father_name || '—'}</p>
          <p><strong>Mother:</strong> {data.mother_name || '—'}</p>
        </div>
        <Avatar name={data.name} src={data.photo} size={84} />
      </div>
      <table className="w-full mt-5 text-sm border border-slate-200">
        <thead><tr className="text-white" style={{ background: 'var(--brand-secondary)' }}><th className="p-2 text-left">Subject</th><th className="p-2 text-center">Full</th><th className="p-2 text-center">Pass</th><th className="p-2 text-center">Marks</th><th className="p-2 text-center">Grade</th><th className="p-2 text-center">Result</th></tr></thead>
        <tbody>
          {data.subjects.map((s: any, i: number) => (
            <tr key={i} className={i % 2 ? 'bg-slate-50' : ''}>
              <td className="p-2">{s.subject_name}</td>
              <td className="p-2 text-center">{s.full_marks}</td>
              <td className="p-2 text-center">{s.pass_marks}</td>
              <td className="p-2 text-center font-semibold">{s.total ?? '-'}</td>
              <td className="p-2 text-center">{s.grade || '-'}</td>
              <td className="p-2 text-center">{(s.total ?? 0) >= (s.pass_marks || 33) ? 'Pass' : 'Fail'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4 text-sm font-bold" style={{ color: 'var(--brand-deep)' }}>
        <span>Total: {data.total_marks}/{data.max_marks}</span>
        <span>Percentage: {data.percentage}%</span>
        <span>Grade: {data.grade}</span>
        <span>Result: {data.result_status?.toUpperCase()}</span>
        {data.rank && <span>Rank: #{data.rank}</span>}
      </div>
      <div className="flex justify-between mt-12 text-sm">
        <div className="text-center"><div className="border-t border-slate-400 w-40 pt-1">Class Teacher</div></div>
        <div className="text-center"><div className="border-t border-slate-400 w-40 pt-1">Headmaster</div></div>
        <div className="text-center"><div className="border-t border-slate-400 w-40 pt-1">Parent / Guardian</div></div>
      </div>
    </div>
  );
}
