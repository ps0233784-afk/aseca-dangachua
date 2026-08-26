import React, { useEffect, useState } from 'react';
import { Award, Plus, Download, Trash2 } from 'lucide-react';
import { api, fetchBlob } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, Field, PageLoader, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const TYPES = ['bonafide', 'transfer', 'character', 'study', 'participation', 'custom'];

export default function CertificatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [studentQ, setStudentQ] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'certificates', 'create');

  const load = () => api('/api/certificates').then((r: any) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (studentQ.length >= 2) api(`/api/students?q=${encodeURIComponent(studentQ)}&limit=8`).then((r: any) => setStudents(r.data));
    else setStudents([]);
  }, [studentQ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Certificates</h1><p className="text-sm text-slate-500">Bonafide, transfer, character and custom certificates</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ student_id: '', type: 'bonafide', title: '', issue_date: new Date().toISOString().slice(0, 10) })}><Plus className="h-4 w-4" /> Issue Certificate</button>}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Certificate No</th><th className="th">Student</th><th className="th">Type</th><th className="th">Issue Date</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={5}><PageLoader /></td></tr> : list.map((c) => (
              <tr key={c.id}>
                <td className="td font-mono text-xs">{c.certificate_no}</td>
                <td className="td font-medium">{c.student_name} <span className="text-[11px] text-slate-400">({c.sid})</span></td>
                <td className="td capitalize">{c.title || c.type}</td>
                <td className="td">{fmtDate(c.issue_date)}</td>
                <td className="td"><div className="flex gap-1">
                  <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => fetchBlob(`/api/certificates/${c.id}/pdf`, `${c.type}-${c.certificate_no}.pdf`)}><Download className="h-3.5 w-3.5" /> PDF</button>
                  {canEdit && <button className="btn-danger !p-2" onClick={() => setDel(c)}><Trash2 className="h-4 w-4" /></button>}
                </div></td>
              </tr>
            ))}
            {!loading && list.length === 0 && <tr><td colSpan={5}><EmptyState title="No certificates issued" /></td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title="Issue Certificate"
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/certificates', { method: 'POST', body: { ...modal, student_id: Number(modal.student_id) } }); toast('success', 'Certificate issued'); setModal(null); load(); } catch (e: any) { toast('error', e.message); } }}>Issue</button></>}>
        <div className="space-y-4">
          <Field label="Student">
            <input className="input" placeholder="Search student…" value={studentQ} onChange={(e) => setStudentQ(e.target.value)} />
            <div className="max-h-36 overflow-y-auto mt-1 space-y-1">{students.map((s: any) => <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setModal({ ...modal, student_id: s.id, _n: `${s.name} (${s.student_id})` }); setStudentQ(`${s.name} (${s.student_id})`); setStudents([]); }}>{s.name} <span className="text-slate-400">({s.student_id})</span></button>)}</div>
            {modal?._n && <p className="text-xs text-emerald-600 mt-1">Selected: {modal._n}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type"><select className="input" value={modal?.type} onChange={(e) => setModal({ ...modal, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
            <Field label="Issue Date"><input type="date" className="input" value={modal?.issue_date} onChange={(e) => setModal({ ...modal, issue_date: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Certificate?" onConfirm={async () => { await api(`/api/certificates/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); load(); }} />
    </div>
  );
}
