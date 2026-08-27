import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, put, del } from '../api';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { ClipboardList, Plus, Pencil, Trash2, Printer, ChevronRight } from 'lucide-react';

export default function ExamsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const toast = useToast();

  const load = () => {
    get('/exams').then((d) => { setRows(d); setLoading(false); });
    get('/schools').then(setSchools);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (edit.id) await put(`/exams/${edit.id}`, edit);
      else await post('/exams', edit);
      toast.show('Examination saved');
      setEdit(null);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };
  const remove = async (id: number) => {
    if (!confirmAction('Delete exam and all its mark entries?')) return;
    await del(`/exams/${id}`);
    toast.show('Exam deleted');
    load();
  };

  const blank = {
    school_id: 1, name: '', session: '2026-27', standard: 'Matric (Class X)',
    exam_center: 'Ragudia Primary School, Ragudia', center_code: '026',
    exam_date: '', status: 'published',
  };

  return (
    <div>
      <PageHeader
        title="Matric & +2 Examinations"
        subtitle="Exam centre records, candidate mark sheets (MIL Santali I–IV, Odia, English), grades & results"
        icon={<ClipboardList size={22} />}
        action={<Button onClick={() => setEdit({ ...blank })}><Plus size={16} /> New Examination</Button>}
      />

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No examinations created" /> : (
          <Table headers={['Examination', 'Standard', 'Session', 'Centre (Code)', 'Date', 'Candidates', 'Status', 'Actions']}>
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-forest-dark">{e.name}</td>
                <td className="px-4 py-3"><Badge color="blue">{e.standard}</Badge></td>
                <td className="px-4 py-3 text-xs">{e.session}</td>
                <td className="px-4 py-3 text-xs">{e.exam_center} <span className="font-mono font-bold">({e.center_code})</span></td>
                <td className="px-4 py-3 text-xs">{e.exam_date}</td>
                <td className="px-4 py-3"><Badge color="gold">{e.candidate_count}</Badge></td>
                <td className="px-4 py-3"><Badge color={e.status === 'published' ? 'green' : 'gray'}>{e.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <Link to={`/app/exams/${e.id}`}><Button size="sm" variant="outline">Mark Sheet <ChevronRight size={12} /></Button></Link>
                    <Link to={`/print/marksheet/${e.id}`} target="_blank"><button className="p-1.5 hover:bg-amber-50 rounded text-gold-dark" title="Print mark sheet"><Printer size={15} /></button></Link>
                    <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(e)}><Pencil size={14} /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => remove(e.id)}><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Examination' : 'Create Examination'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Examination Name *"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} placeholder="MATRIC EXAMINATION — SUMMER-2026-27" /></Field>
            <Field label="School / Centre Owner"><Select value={edit.school_id} onChange={(e: any) => setEdit({ ...edit, school_id: Number(e.target.value) })}>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Standard"><Select value={edit.standard} onChange={(e: any) => setEdit({ ...edit, standard: e.target.value })}>
                <option>Matric (Class X)</option><option>+2 (Class XII)</option><option>Class VIII</option>
              </Select></Field>
              <Field label="Session"><Input value={edit.session} onChange={(e: any) => setEdit({ ...edit, session: e.target.value })} /></Field>
              <Field label="Exam Centre"><Input value={edit.exam_center} onChange={(e: any) => setEdit({ ...edit, exam_center: e.target.value })} /></Field>
              <Field label="Centre Code"><Input value={edit.center_code} onChange={(e: any) => setEdit({ ...edit, center_code: e.target.value })} /></Field>
              <Field label="Exam Start Date"><Input type="date" value={edit.exam_date} onChange={(e: any) => setEdit({ ...edit, exam_date: e.target.value })} /></Field>
              <Field label="Status"><Select value={edit.status} onChange={(e: any) => setEdit({ ...edit, status: e.target.value })}>
                <option value="published">Published</option><option value="draft">Draft</option><option value="completed">Completed</option>
              </Select></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>Save Examination</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}
