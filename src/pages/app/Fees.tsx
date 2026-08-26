import React, { useEffect, useState } from 'react';
import { Plus, Wallet, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { useDebounced } from '../../lib/hooks';
import { Modal, Field, PageLoader, EmptyState, SearchBox, StatCard, StatusBadge } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtINR, fmtDate, FEE_STATUS } from '../../lib/format';

export default function FeesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'dues' | 'structures' | 'payments'>('dues');
  const [list, setList] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<any>(null);
  const [payModal, setPayModal] = useState<any>(null);
  const [structureModal, setStructureModal] = useState<any>(null);
  const [studentQ, setStudentQ] = useState('');
  const dq = useDebounced(q, 300);
  const canEdit = hasPerm(user, 'fees', 'create');

  useEffect(() => { api('/api/fee-categories').then((r: any) => setCats(r.data)); api('/api/classes').then((r: any) => setClasses(r.data)); api('/api/schools').then((r: any) => setSchools(r.data)); }, []);
  useEffect(() => { api('/api/fee-structures').then((r: any) => setStructures(r.data)); api('/api/payments').then((r: any) => setPayments(r.data)); }, []);

  const loadDues = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (dq) p.set('q', dq);
    if (status !== 'all') p.set('status', status);
    api(`/api/fee-assignments?${p}`).then((r: any) => setList(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { if (tab === 'dues') loadDues(); }, [dq, status, tab]);

  const totalDue = list.reduce((a, f) => a + (f.amount - f.paid), 0);
  const totalCollected = list.reduce((a, f) => a + (f.paid || 0), 0);

  const searchStudents = async (qtext: string) => {
    if (qtext.length < 2) { setStudents([]); return; }
    api(`/api/students?q=${encodeURIComponent(qtext)}&limit=8`).then((r: any) => setStudents(r.data));
  };
  useEffect(() => { searchStudents(studentQ); }, [studentQ]);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Fees</h1><p className="text-sm text-slate-500">Fee structures, dues and payments</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Due" value={fmtINR(totalDue)} icon={<Wallet className="h-5 w-5" />} tone="red" />
        <StatCard label="Collected" value={fmtINR(totalCollected)} icon={<Receipt className="h-5 w-5" />} tone="green" />
        <StatCard label="Assignments" value={list.length} icon={<Wallet className="h-5 w-5" />} tone="blue" />
        <StatCard label="Structures" value={structures.length} icon={<Wallet className="h-5 w-5" />} tone="gold" />
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {([['dues', 'Student Dues'], ['structures', 'Fee Structures'], ['payments', 'Payments']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'dues' && (
        <>
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <SearchBox value={q} onChange={setQ} placeholder="Search student…" className="flex-1 min-w-[220px]" />
            <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>{['all', 'pending', 'partial', 'paid', 'waived'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}</select>
            {canEdit && <button className="btn-primary" onClick={() => setAssignModal({ student_id: '', amount: '', due_date: '', structure_id: '' })}><Plus className="h-4 w-4" /> Assign Fee</button>}
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Student</th><th className="th">Class</th><th className="th">Category</th><th className="th text-right">Amount</th><th className="th text-right">Paid</th><th className="th text-right">Due</th><th className="th">Status</th><th className="th">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? <tr><td colSpan={8}><PageLoader /></td></tr> : list.map((f) => (
                    <tr key={f.id}>
                      <td className="td font-medium">{f.student_name} <span className="text-[11px] text-slate-400">({f.sid})</span></td>
                      <td className="td">{f.class_name}</td>
                      <td className="td">{f.category_name || '—'}</td>
                      <td className="td text-right">{fmtINR(f.amount)}</td>
                      <td className="td text-right text-emerald-600">{fmtINR(f.paid)}</td>
                      <td className="td text-right font-semibold text-rose-600">{fmtINR(f.amount - f.paid)}</td>
                      <td className="td"><span className={`badge ${FEE_STATUS[f.status]?.cls}`}>{FEE_STATUS[f.status]?.label}</span></td>
                      <td className="td">{canEdit && f.status !== 'paid' && <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => setPayModal(f)}><Receipt className="h-3.5 w-3.5" /> Receive</button>}</td>
                    </tr>
                  ))}
                  {!loading && list.length === 0 && <tr><td colSpan={8}><EmptyState title="No fee records" /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'structures' && (
        <>
          <div className="flex justify-end">{canEdit && <button className="btn-primary" onClick={() => setStructureModal({ school_id: '', class_id: '', category_id: cats[0]?.id, amount: '', due_date: '' })}><Plus className="h-4 w-4" /> Add Structure</button>}</div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Class</th><th className="th">Category</th><th className="th">School</th><th className="th text-right">Amount</th><th className="th">Due Date</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {structures.map((s) => (
                  <tr key={s.id}>
                    <td className="td font-medium">{s.class_name || 'All'}</td>
                    <td className="td">{s.category_name}</td>
                    <td className="td">{s.school_name || 'All'}</td>
                    <td className="td text-right font-semibold">{fmtINR(s.amount)}</td>
                    <td className="td">{fmtDate(s.due_date)}</td>
                  </tr>
                ))}
                {structures.length === 0 && <tr><td colSpan={5}><EmptyState /></td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'payments' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Receipt</th><th className="th">Student</th><th className="th text-right">Amount</th><th className="th">Method</th><th className="th">Date</th><th className="th">Received By</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="td font-mono text-xs">{p.reference || `PAY-${p.id}`}</td>
                  <td className="td font-medium">{p.student_name}</td>
                  <td className="td text-right font-semibold text-emerald-600">{fmtINR(p.amount)}</td>
                  <td className="td">{p.method}</td>
                  <td className="td">{fmtDate(p.payment_date || p.created_at)}</td>
                  <td className="td">{p.received_by_name || '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={6}><EmptyState title="No payments yet" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign fee modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Fee"
        footer={<><button className="btn-outline" onClick={() => setAssignModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/fee-assignments', { method: 'POST', body: { ...assignModal, amount: Number(assignModal.amount), student_id: Number(assignModal.student_id) } }); toast('success', 'Fee assigned'); setAssignModal(null); loadDues(); } catch (e: any) { toast('error', e.message); } }}>Assign</button></>}>
        <div className="space-y-4">
          <Field label="Student *">
            <input className="input" placeholder="Type name/ID to search…" value={studentQ} onChange={(e) => setStudentQ(e.target.value)} />
            <div className="max-h-40 overflow-y-auto mt-1 space-y-1">
              {students.map((s: any) => <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setAssignModal({ ...assignModal, student_id: s.id, _name: `${s.name} (${s.student_id})` }); setStudentQ(`${s.name} (${s.student_id})`); setStudents([]); }}>{s.name} <span className="text-slate-400">({s.student_id})</span></button>)}
            </div>
            {assignModal._name && <p className="text-xs text-emerald-600 mt-1">Selected: {assignModal._name}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Structure (optional)"><select className="input" value={assignModal.structure_id || ''} onChange={(e) => setAssignModal({ ...assignModal, structure_id: e.target.value })}><option value="">None</option>{structures.map((s) => <option key={s.id} value={s.id}>{s.category_name} — {fmtINR(s.amount)}</option>)}</select></Field>
            <Field label="Amount *"><input type="number" className="input" value={assignModal.amount} onChange={(e) => setAssignModal({ ...assignModal, amount: e.target.value })} /></Field>
            <Field label="Due Date"><input type="date" className="input" value={assignModal.due_date || ''} onChange={(e) => setAssignModal({ ...assignModal, due_date: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>

      {/* Receive payment modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title={`Receive Payment — ${payModal?.student_name}`}
        footer={<><button className="btn-outline" onClick={() => setPayModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/payments', { method: 'POST', body: { student_id: payModal.student_id, fee_assignment_id: payModal.id, amount: Number(payModal._amount), method: payModal._method || 'Cash', payment_date: payModal._date || new Date().toISOString().slice(0, 10) } }); toast('success', 'Payment recorded'); setPayModal(null); loadDues(); api('/api/payments').then((r: any) => setPayments(r.data)); } catch (e: any) { toast('error', e.message); } }}>Record</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount *"><input type="number" className="input" value={payModal?._amount || ''} onChange={(e) => setPayModal({ ...payModal, _amount: e.target.value })} /></Field>
          <Field label="Method"><select className="input" value={payModal?._method || 'Cash'} onChange={(e) => setPayModal({ ...payModal, _method: e.target.value })}>{['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'DD'].map((m) => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Date"><input type="date" className="input" value={payModal?._date || ''} onChange={(e) => setPayModal({ ...payModal, _date: e.target.value })} /></Field>
        </div>
      </Modal>

      {/* Structure modal */}
      <Modal open={!!structureModal} onClose={() => setStructureModal(null)} title="Add Fee Structure"
        footer={<><button className="btn-outline" onClick={() => setStructureModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/fee-structures', { method: 'POST', body: { ...structureModal, amount: Number(structureModal.amount) } }); toast('success', 'Structure added'); setStructureModal(null); api('/api/fee-structures').then((r: any) => setStructures(r.data)); } catch (e: any) { toast('error', e.message); } }}>Save</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><select className="input" value={structureModal?.category_id} onChange={(e) => setStructureModal({ ...structureModal, category_id: e.target.value })}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Class"><select className="input" value={structureModal?.class_id || ''} onChange={(e) => setStructureModal({ ...structureModal, class_id: e.target.value })}><option value="">All classes</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="School"><select className="input" value={structureModal?.school_id || ''} onChange={(e) => setStructureModal({ ...structureModal, school_id: e.target.value })}><option value="">All schools</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Amount *"><input type="number" className="input" value={structureModal?.amount || ''} onChange={(e) => setStructureModal({ ...structureModal, amount: e.target.value })} /></Field>
          <Field label="Due Date"><input type="date" className="input" value={structureModal?.due_date || ''} onChange={(e) => setStructureModal({ ...structureModal, due_date: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
