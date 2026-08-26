import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, StatusBadge, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const EXAM_TYPES = ['Weekly Test 1–10', 'Weekly Test', 'Unit Test', 'Half Yearly', 'Annual Examination', 'Pre-Test', 'Custom Exam'];

export default function ExamsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'exams', 'create');
  const load = () => api('/api/exams').then((r: any) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); api('/api/academic-years').then((r: any) => setYears(r.data)); api('/api/classes').then((r: any) => setClasses(r.data)); }, []);

  const save = async () => {
    try {
      const body = { ...modal, class_ids: modal.class_ids?.map(Number) };
      if (modal.id) await api(`/api/exams/${modal.id}`, { method: 'PUT', body });
      else await api('/api/exams', { method: 'POST', body });
      toast('success', modal.id ? 'Exam updated' : 'Exam created');
      setModal(null); load();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Exams & Results</h1><p className="text-sm text-slate-500">{list.length} exams</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ name: '', exam_type: 'Unit Test', academic_year_id: years.find((y) => y.is_current)?.id || '', start_date: '', end_date: '', publish_date: '', status: 'draft', class_ids: [] })}><Plus className="h-4 w-4" /> New Exam</button>}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? <PageLoader /> : list.map((e) => (
          <div key={e.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-bold leading-snug truncate">{e.name}</h3>
                <p className="text-xs text-slate-400">{e.exam_type} • {e.academic_year_name}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
            <p className="text-xs text-slate-500">{e.start_date ? `${fmtDate(e.start_date)} → ${fmtDate(e.end_date)}` : 'Dates not set'}</p>
            <p className="text-xs text-slate-400 mt-1">{e.results_count} results</p>
            <div className="flex gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link to={`/app/exams/${e.id}`} className="btn-primary !py-2 flex-1 text-xs"><ArrowUpRight className="h-3.5 w-3.5" /> Open</Link>
              {canEdit && <button className="btn-outline !py-2" onClick={() => setModal(e)}><Pencil className="h-3.5 w-3.5" /></button>}
              {canEdit && <button className="btn-danger !py-2" onClick={() => setDel(e)}><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
        ))}
        {!loading && list.length === 0 && <EmptyState title="No exams yet" />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Exam' : 'New Exam'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Exam Name *" className="sm:col-span-2"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Type"><select className="input" value={modal.exam_type} onChange={(e) => setModal({ ...modal, exam_type: e.target.value })}>{EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Academic Year"><select className="input" value={modal.academic_year_id} onChange={(e) => setModal({ ...modal, academic_year_id: e.target.value })}>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></Field>
          <Field label="Start Date"><input type="date" className="input" value={modal.start_date || ''} onChange={(e) => setModal({ ...modal, start_date: e.target.value })} /></Field>
          <Field label="End Date"><input type="date" className="input" value={modal.end_date || ''} onChange={(e) => setModal({ ...modal, end_date: e.target.value })} /></Field>
          <Field label="Publish Date"><input type="date" className="input" value={modal.publish_date || ''} onChange={(e) => setModal({ ...modal, publish_date: e.target.value })} /></Field>
          <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['draft', 'scheduled', 'published', 'results_published', 'locked'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Classes" className="sm:col-span-2">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {classes.map((c) => (
                <label key={c.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${(modal.class_ids || []).includes(String(c.id)) ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={(modal.class_ids || []).includes(String(c.id))} onChange={(e) => setModal({ ...modal, class_ids: e.target.checked ? [...(modal.class_ids || []), String(c.id)] : modal.class_ids.filter((x: string) => x !== String(c.id)) })} />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Exam?" message={`Delete "${del?.name}" and all its marks/results?`} onConfirm={async () => { await api(`/api/exams/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); load(); }} />
    </div>
  );
}
