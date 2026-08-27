import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post } from '../api';
import { Card, Button, Badge, Modal, Field, Input, Select, useToast, Loading } from '../components/ui';
import { ArrowLeft, Save, Printer, Plus, Trash2, Calculator } from 'lucide-react';

function gradeOf(m: any) {
  const vals = [m.mil1, m.mil2, m.mil3, m.mil4, m.odia, m.english].map((v) => Number(v) || 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const fail = vals.some((v) => v < 30);
  const pct = (total / 600) * 100;
  let grade = 'F';
  if (!fail) {
    if (pct >= 80) grade = 'A+'; else if (pct >= 70) grade = 'A'; else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C'; else if (pct >= 40) grade = 'D'; else if (pct >= 33) grade = 'E';
  }
  return { total, grade, result: fail || pct < 33 ? 'FAIL' : 'PASS' };
}

const PAPERS = [
  { key: 'mil1', label: 'MIL-I' }, { key: 'mil2', label: 'MIL-II' }, { key: 'mil3', label: 'MIL-III' },
  { key: 'mil4', label: 'MIL-IV' }, { key: 'odia', label: 'ODIA' }, { key: 'english', label: 'ENGLISH' },
];

export default function MarkSheetPage() {
  const { id } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const toast = useToast();

  const load = () => get(`/exams/${id}/results`).then((d) => {
    setExam(d);
    setRows(d.results || []);
  });
  useEffect(() => {
    load();
    get('/students').then(setStudents);
  }, [id]);

  const totals = useMemo(() => {
    const passed = rows.filter((r) => gradeOf(r).result === 'PASS').length;
    return { passed, failed: rows.length - passed };
  }, [rows]);

  const setMark = (idx: number, key: string, val: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: Math.max(0, Math.min(100, Number(val) || 0)) };
    setRows(next);
  };
  const setField = (idx: number, key: string, val: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: val };
    setRows(next);
  };

  const save = async () => {
    try {
      await post(`/exams/${id}/results`, { results: rows });
      toast.show(`Mark sheet saved — ${rows.length} candidates`);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };

  const addCandidate = () => {
    const stu = students.find((s) => s.id === Number(draft.student_id));
    setRows([...rows, {
      ...draft,
      student_id: stu?.id || null,
      student_name: draft.student_name || stu?.name || '',
      mother_name: draft.mother_name || stu?.mother_name || '',
      father_name: draft.father_name || stu?.father_name || '',
      dob: draft.dob || stu?.dob || '',
      mil1: 0, mil2: 0, mil3: 0, mil4: 0, odia: 0, english: 0,
    }]);
    setAddOpen(false);
    setDraft(null);
    toast.show('Candidate added — enter marks and save');
  };

  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

  if (!exam) return <Loading />;

  return (
    <div>
      <Link to="/app/exams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-forest mb-4 no-print">
        <ArrowLeft size={15} /> All Examinations
      </Link>

      <Card className="p-5 mb-5 bg-brand-gradient text-white border-0">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold">{exam.name}</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Session {exam.session} · {exam.standard} · Centre: {exam.exam_center} <span className="font-mono font-bold">(Code {exam.center_code})</span>
            </p>
            <p className="text-emerald-200/80 text-xs mt-1">{exam.school_name} · Affiliation {exam.affiliation_no}</p>
          </div>
          <div className="flex gap-3 no-print">
            <div className="glass-dark rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold">{rows.length}</div><div className="text-[10px] text-emerald-200">Candidates</div>
            </div>
            <div className="glass-dark rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-green-300">{totals.passed}</div><div className="text-[10px] text-emerald-200">Passing</div>
            </div>
            <div className="glass-dark rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-red-300">{totals.failed}</div><div className="text-[10px] text-emerald-200">Failing</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-3 no-print">
        <Button onClick={save}><Save size={15} /> Save Mark Sheet</Button>
        <Button variant="gold" onClick={() => { setDraft({ roll_no: '', student_name: '', mother_name: '', father_name: '', dob: '' }); setAddOpen(true); }}>
          <Plus size={15} /> Add Candidate
        </Button>
        <Link to={`/print/marksheet/${id}`} target="_blank"><Button variant="outline"><Printer size={15} /> Printable Mark Sheet</Button></Link>
        <span className="text-xs text-slate-400 self-center flex items-center gap-1 ml-2"><Calculator size={13} /> Totals, grades (A+…F) and PASS/FAIL auto-calculate. Pass mark 30/paper, 33% aggregate.</span>
      </div>

      <Card>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-forest text-white">
                <th className="px-2 py-2.5 text-left text-xs">Sl</th>
                <th className="px-2 py-2.5 text-left text-xs min-w-44">Name of Student</th>
                <th className="px-2 py-2.5 text-left text-xs min-w-32">Roll No</th>
                <th className="px-2 py-2.5 text-left text-xs min-w-32">Mother's Name</th>
                <th className="px-2 py-2.5 text-left text-xs min-w-32">Father's Name</th>
                <th className="px-2 py-2.5 text-left text-xs">D.O.B.</th>
                {PAPERS.map((p) => <th key={p.key} className="px-2 py-2.5 text-center text-xs min-w-16">{p.label}</th>)}
                <th className="px-2 py-2.5 text-center text-xs">Total</th>
                <th className="px-2 py-2.5 text-center text-xs">Grade</th>
                <th className="px-2 py-2.5 text-center text-xs">Result</th>
                <th className="px-2 py-2.5 no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => {
                const g = gradeOf(r);
                return (
                  <tr key={r.id || i} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5 text-slate-400">{i + 1}</td>
                    <td className="px-2 py-1.5"><Input className="py-1 text-sm" value={r.student_name} onChange={(e: any) => setField(i, 'student_name', e.target.value)} /></td>
                    <td className="px-2 py-1.5"><Input className="py-1 text-xs font-mono" value={r.roll_no} onChange={(e: any) => setField(i, 'roll_no', e.target.value)} placeholder="36SSMS026001" /></td>
                    <td className="px-2 py-1.5"><Input className="py-1 text-sm" value={r.mother_name} onChange={(e: any) => setField(i, 'mother_name', e.target.value)} /></td>
                    <td className="px-2 py-1.5"><Input className="py-1 text-sm" value={r.father_name} onChange={(e: any) => setField(i, 'father_name', e.target.value)} /></td>
                    <td className="px-2 py-1.5"><Input type="date" className="py-1 text-xs" value={r.dob} onChange={(e: any) => setField(i, 'dob', e.target.value)} /></td>
                    {PAPERS.map((p) => (
                      <td key={p.key} className="px-1 py-1.5 text-center">
                        <input
                          type="number" min={0} max={100}
                          className={`w-14 text-center rounded-md border py-1 text-sm font-mono focus:ring-2 focus:ring-forest/40 ${(Number(r[p.key]) || 0) < 30 ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300'}`}
                          value={r[p.key] ?? ''}
                          onChange={(e) => setMark(i, p.key, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-bold text-forest">{g.total}</td>
                    <td className="px-2 py-1.5 text-center"><Badge color={g.grade.startsWith('A') ? 'green' : g.grade === 'F' ? 'red' : 'blue'}>{g.grade}</Badge></td>
                    <td className="px-2 py-1.5 text-center"><Badge color={g.result === 'PASS' ? 'green' : 'red'}>{g.result}</Badge></td>
                    <td className="px-2 py-1.5 no-print"><button className="p-1 hover:bg-red-50 rounded" onClick={() => removeRow(i)}><Trash2 size={14} className="text-red-500" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Examination Candidate">
        {draft && (
          <div className="space-y-3">
            <Field label="Pick existing student (optional)">
              <Select onChange={(e: any) => {
                const stu = students.find((s) => s.id === Number(e.target.value));
                if (stu) setDraft({ ...draft, student_id: stu.id, student_name: stu.name, mother_name: stu.mother_name, father_name: stu.father_name, dob: stu.dob });
              }}>
                <option value="">— select —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
              </Select>
            </Field>
            <Field label="Roll No *"><Input className="font-mono" value={draft.roll_no} onChange={(e: any) => setDraft({ ...draft, roll_no: e.target.value })} placeholder={exam.standard.includes('+2') ? '36SS+2S026013' : '36SSMS026005'} /></Field>
            <Field label="Student Name *"><Input value={draft.student_name} onChange={(e: any) => setDraft({ ...draft, student_name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mother's Name"><Input value={draft.mother_name} onChange={(e: any) => setDraft({ ...draft, mother_name: e.target.value })} /></Field>
              <Field label="Father's Name"><Input value={draft.father_name} onChange={(e: any) => setDraft({ ...draft, father_name: e.target.value })} /></Field>
            </div>
            <Field label="D.O.B."><Input type="date" value={draft.dob} onChange={(e: any) => setDraft({ ...draft, dob: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={addCandidate} disabled={!draft.student_name || !draft.roll_no}>Add Candidate</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}
