import { useEffect, useState } from 'react';
import { get, post, put, del, uploadFile } from '../api';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { BedDouble, BookOpen, Plus, Pencil, Trash2, LogIn, LogOut, Upload, Search } from 'lucide-react';

export default function FacilitiesPage({ mode }: { mode: 'hostel' | 'library' }) {
  return mode === 'hostel' ? <Hostel /> : <Library />;
}

/* ---------------- HOSTEL ---------------- */
function Hostel() {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('1');
  const [hostels, setHostels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [alloc, setAlloc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { get('/schools').then((s) => { setSchools(s); if (s[0]) setSchoolId(String(s[0].id)); }); }, []);
  const load = () => {
    setLoading(true);
    get(`/hostels?school_id=${schoolId}`).then(setHostels).finally(() => setLoading(false));
    get(`/students?school_id=${schoolId}`).then(setStudents);
  };
  useEffect(() => { if (schoolId) load(); }, [schoolId]);

  const save = async () => {
    await post('/hostels', edit);
    toast.show('Hostel saved');
    setEdit(null);
    load();
  };
  const allocate = async () => {
    await post('/hostels/allocate', alloc);
    toast.show('Boarder allocated');
    setAlloc(null);
    load();
  };
  const vacate = async (id: number) => {
    if (!confirmAction('Vacate this boarder?')) return;
    await post(`/hostels/vacate/${id}`, {});
    load();
  };

  return (
    <div>
      <PageHeader
        title="Hostel Management"
        subtitle="Boys & girls hostels, wardens, room allocation and boarders"
        icon={<BedDouble size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-56">
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Button onClick={() => setEdit({ name: '', type: 'Boys', warden: '', capacity: 40 })}><Plus size={15} /> Add Hostel</Button>
        </div>}
      />
      {loading ? <Loading /> : hostels.length === 0 ? <EmptyState text="No hostels in this school" /> : (
        <div className="grid lg:grid-cols-2 gap-5">
          {hostels.map((h) => (
            <Card key={h.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-forest-dark flex items-center gap-2">
                    <BedDouble size={18} className={h.type === 'Girls' ? 'text-terra' : 'text-royal'} /> {h.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{h.type} Hostel · Warden: {h.warden}</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(h)}><Pencil size={14} /></button>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Occupancy</span><span>{h.occupied}/{h.capacity} beds</span></div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${h.occupied / h.capacity > 0.9 ? 'bg-terra' : 'bg-forest'}`} style={{ width: `${Math.min(100, (h.occupied / h.capacity) * 100)}%` }} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Boarders ({h.allocations.filter((a: any) => a.status === 'boarding').length})</span>
                  <Button size="sm" variant="outline" onClick={() => setAlloc({ hostel_id: h.id, student_id: '', room_no: '', bed: '' })}><LogIn size={12} /> Allocate</Button>
                </div>
                <div className="space-y-1.5">
                  {h.allocations.filter((a: any) => a.status === 'boarding').map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <span><strong>{a.student_name}</strong> <span className="text-xs text-slate-400">· Room {a.room_no}, Bed {a.bed} · since {a.check_in}</span></span>
                      <button onClick={() => vacate(a.id)} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Vacate"><LogOut size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Hostel' : 'Add Hostel'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Hostel Name *"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} placeholder="Birsa Boys Hostel" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><Select value={edit.type} onChange={(e: any) => setEdit({ ...edit, type: e.target.value })}><option>Boys</option><option>Girls</option></Select></Field>
              <Field label="Capacity"><Input type="number" value={edit.capacity} onChange={(e: any) => setEdit({ ...edit, capacity: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Warden"><Input value={edit.warden} onChange={(e: any) => setEdit({ ...edit, warden: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!alloc} onClose={() => setAlloc(null)} title="Allocate Boarder">
        {alloc && (
          <div className="space-y-3">
            <Field label="Student *"><Select value={alloc.student_id} onChange={(e: any) => setAlloc({ ...alloc, student_id: Number(e.target.value) })}>
              <option value="">— select —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
            </Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Room No"><Input value={alloc.room_no} onChange={(e: any) => setAlloc({ ...alloc, room_no: e.target.value })} placeholder="B-1" /></Field>
              <Field label="Bed"><Input value={alloc.bed} onChange={(e: any) => setAlloc({ ...alloc, bed: e.target.value })} placeholder="B1-2" /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAlloc(null)}>Cancel</Button>
              <Button onClick={allocate} disabled={!alloc.student_id}>Allocate</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

/* ---------------- LIBRARY ---------------- */
function Library() {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'books' | 'issues'>('books');
  const [edit, setEdit] = useState<any>(null);
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { get('/schools').then((s) => { setSchools(s); setSchoolId(String(s[0]?.id || '')); }); }, []);
  const load = () => {
    setLoading(true);
    get(`/books${schoolId ? `?school_id=${schoolId}` : ''}`).then(setBooks).finally(() => setLoading(false));
    get('/book-issues').then(setIssues);
    get('/students').then(setStudents);
  };
  useEffect(() => { if (schoolId !== '') load(); }, [schoolId]);

  const save = async () => {
    await post('/books', { ...edit, school_id: Number(schoolId) });
    toast.show('Book saved');
    setEdit(null);
    load();
  };
  const issueBook = async () => {
    const stu = students.find((s) => s.id === Number(issue.member_id));
    await post('/book-issues', { book_id: issue.book_id, member_type: 'student', member_id: issue.member_id, member_name: stu?.name });
    toast.show('Book issued (30-day due)');
    setIssue(null);
    load();
  };
  const returnBook = async (id: number) => {
    await post(`/book-issues/return/${id}`, {});
    toast.show('Book returned');
    load();
  };
  const onPdf = async (f: File) => {
    const r = await uploadFile(f, 'document', edit.title);
    setEdit({ ...edit, pdf_file: r.url });
    toast.show('PDF attached');
  };

  const filtered = books.filter((b) => !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.author?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Library"
        subtitle="Book catalogue with copies, issue/return tracking and PDF book uploads"
        icon={<BookOpen size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-52">
            <option value="">All schools</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name.split(',')[0]}</option>)}
          </Select>
          <Button onClick={() => setEdit({ title: '', author: '', isbn: '', category: 'General', copies: 1, available: 1, pdf_file: '' })}><Plus size={15} /> Add Book</Button>
        </div>}
      />

      <div className="flex gap-2 mb-4">
        {(['books', 'issues'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-forest text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
            {t === 'books' ? 'Catalogue' : 'Issue Register'}
          </button>
        ))}
      </div>

      {tab === 'books' ? (
        <Card>
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search title or author…" value={q} onChange={(e: any) => setQ(e.target.value)} />
            </div>
          </div>
          {loading ? <Loading /> : (
            <Table headers={['Title', 'Author', 'Category', 'ISBN', 'Copies', 'Available', 'PDF', '']}>
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{b.title}</td>
                  <td className="px-4 py-3 text-xs">{b.author}</td>
                  <td className="px-4 py-3"><Badge color="gold">{b.category}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs">{b.isbn}</td>
                  <td className="px-4 py-3 text-center">{b.copies}</td>
                  <td className="px-4 py-3 text-center"><Badge color={b.available > 0 ? 'green' : 'red'}>{b.available}</Badge></td>
                  <td className="px-4 py-3">{b.pdf_file ? <a href={b.pdf_file} target="_blank" rel="noreferrer" className="text-royal text-xs underline">View PDF</a> : <span className="text-slate-300 text-xs">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" disabled={b.available <= 0} onClick={() => setIssue({ book_id: b.id })}><LogIn size={12} /> Issue</Button>
                      <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(b)}><Pencil size={14} /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded" onClick={async () => { if (confirmAction('Delete book?')) { await del(`/books/${b.id}`); load(); } }}><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      ) : (
        <Card>
          <Table headers={['Book', 'Issued To', 'Issue Date', 'Due Date', 'Return Date', 'Status', '']}>
            {issues.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{i.title}</td>
                <td className="px-4 py-3 text-sm">{i.member_name}</td>
                <td className="px-4 py-3 text-xs">{i.issue_date}</td>
                <td className="px-4 py-3 text-xs">{i.due_date}</td>
                <td className="px-4 py-3 text-xs">{i.return_date || '—'}</td>
                <td className="px-4 py-3"><Badge color={i.status === 'returned' ? 'green' : 'gold'}>{i.status}</Badge></td>
                <td className="px-4 py-3">{i.status === 'issued' && <Button size="sm" variant="outline" onClick={() => returnBook(i.id)}><LogOut size={12} /> Return</Button>}</td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Book' : 'Add Book'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Title *"><Input value={edit.title} onChange={(e: any) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Author"><Input value={edit.author} onChange={(e: any) => setEdit({ ...edit, author: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><Input value={edit.category} onChange={(e: any) => setEdit({ ...edit, category: e.target.value })} /></Field>
              <Field label="ISBN"><Input value={edit.isbn} onChange={(e: any) => setEdit({ ...edit, isbn: e.target.value })} /></Field>
              <Field label="Copies"><Input type="number" value={edit.copies} onChange={(e: any) => setEdit({ ...edit, copies: Number(e.target.value), available: Number(e.target.value) })} /></Field>
              <Field label="Available"><Input type="number" value={edit.available} onChange={(e: any) => setEdit({ ...edit, available: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Book PDF (optional)">
              <label className="inline-flex items-center gap-2 text-sm text-royal font-semibold cursor-pointer border border-dashed border-royal/40 rounded-lg px-3 py-2 hover:bg-blue-50">
                <Upload size={14} /> {edit.pdf_file ? 'Replace PDF' : 'Upload PDF book'}
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onPdf(e.target.files[0])} />
              </label>
              {edit.pdf_file && <a href={edit.pdf_file} target="_blank" rel="noreferrer" className="ml-3 text-xs text-forest underline">Current PDF</a>}
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save} disabled={!edit.title}>Save Book</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!issue} onClose={() => setIssue(null)} title="Issue Book">
        {issue && (
          <div className="space-y-3">
            <Field label="Student / Member"><Select value={issue.member_id} onChange={(e: any) => setIssue({ ...issue, member_id: e.target.value })}>
              <option value="">— select —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
            </Select></Field>
            <p className="text-xs text-slate-500">Due date is automatically set to 30 days from issue.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIssue(null)}>Cancel</Button>
              <Button onClick={issueBook} disabled={!issue.member_id}>Issue Book</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}
