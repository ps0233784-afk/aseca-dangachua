import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, Lock, Megaphone, FileText, Download, Plus, Trash2 } from 'lucide-react';
import { api, fetchBlob } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { PageLoader, StatusBadge, Field, Modal, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

export default function ExamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [exam, setExam] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [tab, setTab] = useState<'subjects' | 'marks' | 'results'>('subjects');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [marksheet, setMarksheet] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);

  const loadExam = () => api(`/api/exams/${id}`).then((r: any) => setExam(r.data)).catch(() => {});
  useEffect(() => { loadExam(); api('/api/classes').then((r: any) => setClasses(r.data)); api('/api/subjects').then((r: any) => setAllSubjects(r.data)); }, [id]);

  const loadMarks = () => {
    if (!classId || !subjectId) { setMarksheet([]); return; }
    api(`/api/exams/${id}/marksheet?class_id=${classId}&subject_id=${subjectId}`).then((r: any) => setMarksheet(r.data));
  };
  useEffect(loadMarks, [classId, subjectId]);

  const loadResults = () => {
    api(`/api/exams/${id}/results${classId ? `?class_id=${classId}` : ''}`).then((r: any) => setResults(r.data));
  };
  useEffect(() => { if (tab === 'results') loadResults(); }, [tab, classId]);

  if (!exam) return <PageLoader />;

  const canEdit = hasPerm(user, 'exams', 'update');

  const saveMarks = async () => {
    setBusy(true);
    try {
      const entries = marksheet.filter((m) => m.mark !== null && (m._edit || m.mark)).map((m) => ({ student_id: m.student_id, subject_id: Number(subjectId), theory_marks: m.mark?.theory_marks ?? m._theory ?? '', practical_marks: m.mark?.practical_marks ?? 0 }));
      await api(`/api/exams/${id}/marks`, { method: 'POST', body: { entries, status: 'submitted' } });
      toast('success', `Marks saved for ${entries.length} students`);
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  const computeResults = async () => {
    setBusy(true);
    try {
      const r: any = await api(`/api/exams/${id}/compute-results`, { method: 'POST' });
      toast('success', `Results computed for ${r.computed} students`);
      loadResults();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  const autoSubjects = async () => {
    // add all class_subjects for the exam's classes
    const perClass = exam.classes.map((c: any) => allSubjects.filter(() => false));
    const subs: any[] = [];
    for (const c of exam.classes) {
      const r: any = await api(`/api/classes/${c.id}/subjects`);
      for (const s of r.data) subs.push({ class_id: c.id, subject_id: s.id, full_marks: s.full_marks, pass_marks: s.pass_marks });
    }
    await api(`/api/exams/${id}/subjects`, { method: 'POST', body: { subjects: subs } });
    toast('success', `${subs.length} subject configurations added`);
    loadExam();
  };

  return (
    <div className="space-y-5">
      <Link to="/app/exams" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Back to Exams</Link>

      <div className="card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{exam.name}</h1>
            <StatusBadge status={exam.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">{exam.exam_type} • {exam.academic_year_name} • {fmtDate(exam.start_date)} → {fmtDate(exam.end_date)}</p>
          <div className="flex flex-wrap gap-2 mt-2">{exam.classes.map((c: any) => <span key={c.id} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{c.name}</span>)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={computeResults} disabled={busy}><Calculator className="h-4 w-4" /> Compute Results</button>
          {exam.status !== 'results_published' && exam.status !== 'locked' && canEdit && <button className="btn-primary" onClick={() => api(`/api/exams/${id}/publish`, { method: 'POST' }).then(() => { toast('success', 'Results published'); loadExam(); })}><Megaphone className="h-4 w-4" /> Publish Results</button>}
          {canEdit && <button className="btn-outline text-rose-600" onClick={() => api(`/api/exams/${id}/lock`, { method: 'POST' }).then(() => { toast('success', 'Exam locked'); loadExam(); })}><Lock className="h-4 w-4" /> Lock</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {([['subjects', 'Subjects'], ['marks', 'Marks Entry'], ['results', 'Results']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{exam.subjects?.length || 0} subject configurations</p>
            {canEdit && <div className="flex gap-2"><button className="btn-outline" onClick={autoSubjects}><Plus className="h-4 w-4" /> Auto-add from class subjects</button></div>}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Subject</th><th className="th">Class</th><th className="th text-center">Full Marks</th><th className="th text-center">Pass Marks</th><th className="th">Exam Date</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exam.subjects?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="td font-medium">{s.subject_name}</td>
                    <td className="td">{classes.find((c) => c.id === s.class_id)?.name || s.class_id}</td>
                    <td className="td text-center">{s.full_marks}</td>
                    <td className="td text-center">{s.pass_marks}</td>
                    <td className="td">{fmtDate(s.exam_date)}</td>
                  </tr>
                ))}
                {!exam.subjects?.length && <tr><td colSpan={5}><EmptyState title="No subjects configured" sub="Use Auto-add to pull subjects from class configuration." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'marks' && (
        <div className="space-y-4">
          <div className="card p-4 flex flex-wrap gap-3 items-end">
            <Field label="Class"><select className="input !w-auto" value={classId} onChange={(e) => { setClassId(e.target.value); setSubjectId(''); }}><option value="">Select…</option>{exam.classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Subject">
              <select className="input !w-auto" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select…</option>
                {exam.subjects.filter((s: any) => s.class_id === Number(classId)).map((s: any) => <option key={s.id} value={s.subject_id}>{s.subject_name} ({s.full_marks})</option>)}
              </select>
            </Field>
            {marksheet.length > 0 && <button className="btn-primary ml-auto" onClick={saveMarks} disabled={busy}>{busy ? 'Saving…' : <><Save className="h-4 w-4" /> Save Marks</>}</button>}
          </div>

          {marksheet.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0"><tr><th className="th">Roll</th><th className="th">Student</th><th className="th text-center">Marks</th><th className="th text-center">Grade</th><th className="th text-center">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {marksheet.map((m) => (
                      <tr key={m.student_id}>
                        <td className="td">{m.roll_no}</td>
                        <td className="td font-medium">{m.name}</td>
                        <td className="td text-center">
                          <input type="number" className="input !w-24 !py-1.5 text-center" defaultValue={m.mark?.theory_marks ?? ''} onChange={(e) => { m._theory = e.target.value; m._edit = true; }} />
                        </td>
                        <td className="td text-center">{m.mark?.grade || '—'}</td>
                        <td className="td text-center">{m.mark ? <StatusBadge status={m.mark.status} /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!marksheet.length && <EmptyState title="Select class and subject" sub="Choose a class and subject above to enter marks." />}
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <select className="input !w-auto" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">All classes</option>{exam.classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Rank</th><th className="th">Student</th><th className="th">Class</th><th className="th text-center">Total</th><th className="th text-center">%</th><th className="th text-center">Grade</th><th className="th text-center">Status</th><th className="th">Report Card</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((r: any) => (
                    <tr key={r.id}>
                      <td className="td font-bold">{r.rank || '—'}</td>
                      <td className="td font-medium">{r.name} <span className="text-[11px] text-slate-400">({r.sid})</span></td>
                      <td className="td">{r.class_name}{r.section_name ? `-${r.section_name}` : ''}</td>
                      <td className="td text-center">{r.total_marks}/{r.max_marks}</td>
                      <td className="td text-center font-semibold">{r.percentage}%</td>
                      <td className="td text-center"><span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{r.grade}</span></td>
                      <td className="td text-center">{r.result_status === 'pass' ? '✅' : '❌'}</td>
                      <td className="td"><button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => fetchBlob(`/api/report-card/${id}/${r.student_id}/pdf`, `report-card-${r.sid}.pdf`)}><Download className="h-3.5 w-3.5" /> PDF</button></td>
                    </tr>
                  ))}
                  {results.length === 0 && <tr><td colSpan={8}><EmptyState title="No results yet" sub="Click Compute Results to calculate totals, percentage, grades and ranks." /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
