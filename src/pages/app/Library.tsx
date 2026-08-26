import React, { useEffect, useState } from 'react';
import { Plus, LibraryBig, BookOpen, BookMarked, Clock, Search as SearchIcon, Undo2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { useDebounced } from '../../lib/hooks';
import { Modal, Field, PageLoader, EmptyState, StatCard, SearchBox, StatusBadge } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

export default function LibraryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, issued: 0, overdue: 0, available: 0 });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState<any>(null);
  const [issueModal, setIssueModal] = useState<any>(null);
  const [personQ, setPersonQ] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const dq = useDebounced(q, 300);
  const canEdit = hasPerm(user, 'library', 'create');

  const load = () => {
    setLoading(true);
    Promise.all([api(`/api/books${dq ? `?q=${encodeURIComponent(dq)}` : ''}`), api('/api/library/transactions'), api('/api/library/stats')])
      .then(([b, t, s]) => { setBooks(b.data); setTransactions(t.data); setStats(s.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [dq]);

  useEffect(() => {
    if (personQ.length >= 2) {
      api(`/api/students?q=${encodeURIComponent(personQ)}&limit=6`).then((r: any) => setStudents(r.data));
      api(`/api/staff?q=${encodeURIComponent(personQ)}`).then((r: any) => setStaff(r.data));
    } else { setStudents([]); setStaff([]); }
  }, [personQ]);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><LibraryBig className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Library</h1><p className="text-sm text-slate-500">Books, issue, returns and fines</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={stats.total} icon={<BookOpen className="h-5 w-5" />} tone="blue" />
        <StatCard label="Available Copies" value={stats.available} icon={<BookMarked className="h-5 w-5" />} tone="green" />
        <StatCard label="Issued" value={stats.issued} icon={<LibraryBig className="h-5 w-5" />} tone="gold" />
        <StatCard label="Overdue" value={stats.overdue} icon={<Clock className="h-5 w-5" />} tone="red" />
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search title, author, ISBN, category…" className="flex-1 min-w-[220px]" />
        {canEdit && <button className="btn-primary" onClick={() => setBookModal({ title: '', author: '', publisher: '', isbn: '', category: 'General', copies_total: 1, rack_no: '' })}><Plus className="h-4 w-4" /> Add Book</button>}
        {canEdit && <button className="btn-outline" onClick={() => setIssueModal({ book_id: '', person_type: 'student', person_id: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '' })}><BookOpen className="h-4 w-4" /> Issue Book</button>}
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Books */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold">Books ({books.length})</div>
            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {books.map((b) => (
                <div key={b.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="h-10 w-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0" />
                  <div className="min-w-0 grow">
                    <p className="font-medium text-sm truncate">{b.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{b.author} • {b.category} {b.rack_no ? `• Rack ${b.rack_no}` : ''}</p>
                  </div>
                  <span className={`badge ${b.copies_available > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'}`}>{b.copies_available}/{b.copies_total}</span>
                </div>
              ))}
              {books.length === 0 && <EmptyState title="No books found" />}
            </div>
          </div>

          {/* Transactions */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold">Recent Transactions</div>
            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((t) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{t.title}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-[11px] text-slate-400">{t.person_name} • Due {fmtDate(t.due_date)}{t.fine > 0 ? ` • Fine ₹${t.fine}` : ''}</p>
                  {t.status === 'issued' && canEdit && <button className="text-[11px] text-blue-600 hover:underline mt-1" onClick={() => api('/api/library/return', { method: 'POST', body: { transaction_id: t.id, fine: 0 } }).then(load)}><Undo2 className="h-3 w-3 inline mr-1" />Mark returned</button>}
                </div>
              ))}
              {transactions.length === 0 && <EmptyState title="No transactions" />}
            </div>
          </div>
        </div>
      )}

      <Modal open={!!bookModal} onClose={() => setBookModal(null)} title="Add Book"
        footer={<><button className="btn-outline" onClick={() => setBookModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/books', { method: 'POST', body: { ...bookModal, copies_total: Number(bookModal.copies_total) } }); toast('success', 'Book added'); setBookModal(null); load(); } catch (e: any) { toast('error', e.message); } }}>Save</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title *" className="col-span-2"><input className="input" value={bookModal?.title} onChange={(e) => setBookModal({ ...bookModal, title: e.target.value })} /></Field>
          <Field label="Author"><input className="input" value={bookModal?.author || ''} onChange={(e) => setBookModal({ ...bookModal, author: e.target.value })} /></Field>
          <Field label="Publisher"><input className="input" value={bookModal?.publisher || ''} onChange={(e) => setBookModal({ ...bookModal, publisher: e.target.value })} /></Field>
          <Field label="ISBN"><input className="input" value={bookModal?.isbn || ''} onChange={(e) => setBookModal({ ...bookModal, isbn: e.target.value })} /></Field>
          <Field label="Category"><input className="input" value={bookModal?.category} onChange={(e) => setBookModal({ ...bookModal, category: e.target.value })} /></Field>
          <Field label="Copies"><input type="number" className="input" value={bookModal?.copies_total} onChange={(e) => setBookModal({ ...bookModal, copies_total: Number(e.target.value) })} /></Field>
          <Field label="Rack No"><input className="input" value={bookModal?.rack_no || ''} onChange={(e) => setBookModal({ ...bookModal, rack_no: e.target.value })} /></Field>
        </div>
      </Modal>

      <Modal open={!!issueModal} onClose={() => setIssueModal(null)} title="Issue Book"
        footer={<><button className="btn-outline" onClick={() => setIssueModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/library/issue', { method: 'POST', body: { ...issueModal, book_id: Number(issueModal.book_id), person_id: Number(issueModal.person_id) } }); toast('success', 'Book issued'); setIssueModal(null); load(); } catch (e: any) { toast('error', e.message); } }}>Issue</button></>}>
        <div className="space-y-4">
          <Field label="Book *"><select className="input" value={issueModal?.book_id} onChange={(e) => setIssueModal({ ...issueModal, book_id: e.target.value })}><option value="">Select…</option>{books.filter((b) => b.copies_available > 0).map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select></Field>
          <Field label="Borrower Type"><select className="input" value={issueModal?.person_type} onChange={(e) => setIssueModal({ ...issueModal, person_type: e.target.value, person_id: '' })}>{['student', 'staff'].map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Borrower">
            <input className="input" placeholder="Search name…" value={personQ} onChange={(e) => setPersonQ(e.target.value)} />
            <div className="max-h-36 overflow-y-auto mt-1 space-y-1">
              {(issueModal?.person_type === 'student' ? students : staff).map((s: any) => (
                <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setIssueModal({ ...issueModal, person_id: s.id, _n: `${s.name}` }); setPersonQ(s.name); setStudents([]); setStaff([]); }}>{s.name}</button>
              ))}
            </div>
            {issueModal?._n && <p className="text-xs text-emerald-600 mt-1">Selected: {issueModal._n}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Issue Date"><input type="date" className="input" value={issueModal?.issue_date} onChange={(e) => setIssueModal({ ...issueModal, issue_date: e.target.value })} /></Field>
            <Field label="Due Date"><input type="date" className="input" value={issueModal?.due_date || ''} onChange={(e) => setIssueModal({ ...issueModal, due_date: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
