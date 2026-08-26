import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, Pencil, Trash2, Users, Filter, ArrowUpRight, Archive, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useDebounced } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, Avatar, StatusBadge, Pagination, EmptyState, Spinner, SearchBox } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { GENDERS, CATEGORIES } from '../../lib/format';

const empty = { name: '', school_id: '', current_class_id: '', current_section_id: '', roll_no: '', student_id: '', admission_no: '', gender: 'Male', dob: '', father_name: '', mother_name: '', guardian_name: '', mobile: '', village: '', block: '', district: '', category: 'General', status: 'active', admission_date: '' };

export default function StudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [classId, setClassId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [status, setStatus] = useState('active');
  const [list, setList] = useState<any>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [imp, setImp] = useState(false);
  const [impResult, setImpResult] = useState<any>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sections, setSections] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const dq = useDebounced(q, 300);
  const canEdit = hasPerm(user, 'students', 'update');

  useEffect(() => { api('/api/schools').then((r: any) => setSchools(r.data)).catch(() => {}); api('/api/classes').then((r: any) => setClasses(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', status });
    if (dq) params.set('q', dq);
    if (classId) params.set('class_id', classId);
    if (schoolId) params.set('school_id', schoolId);
    api(`/api/students?${params}`).then((r: any) => setList(r)).catch(() => {}).finally(() => setLoading(false));
  }, [page, dq, classId, schoolId, status]);

  useEffect(() => {
    if (modal?.current_class_id) api(`/api/sections?class_id=${modal.current_class_id}`).then((r: any) => setSections(r.data)).catch(() => {});
    else setSections([]);
  }, [modal?.current_class_id]);

  const save = async () => {
    try {
      const body = { ...modal, current_class_id: modal.current_class_id ? Number(modal.current_class_id) : null, current_section_id: modal.current_section_id ? Number(modal.current_section_id) : null, school_id: Number(modal.school_id) };
      if (modal.id) await api(`/api/students/${modal.id}`, { method: 'PUT', body });
      else await api('/api/students', { method: 'POST', body });
      toast('success', modal.id ? 'Student updated' : 'Student added');
      setModal(null);
      setPage(1);
      const params = new URLSearchParams({ page: '1', limit: '20', status });
      api(`/api/students?${params}`).then((r: any) => setList(r));
    } catch (e: any) { toast('error', e.message); }
  };

  const exportCSV = () => {
    const rows = list.data.map((s: any) => ({ student_id: s.student_id, admission_no: s.admission_no, roll_no: s.roll_no, name: s.name, class: s.class_name, section: s.section_name, school: s.school_name, gender: s.gender, father_name: s.father_name, mobile: s.mobile, village: s.village, status: s.status }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students.xlsx');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    setImpResult(null);
    try {
      const res: any = await api('/api/students/import', { method: 'POST', body: { rows } });
      setImpResult(res);
      toast('success', `Imported ${res.valid} students`);
      const params = new URLSearchParams({ page: '1', limit: '20', status });
      api(`/api/students?${params}`).then((r: any) => setList(r));
    } catch (e: any) { toast('error', e.message); }
  };

  const bulkArchive = async () => {
    for (const id of selected) await api(`/api/students/${id}/archive`, { method: 'POST' });
    toast('success', `${selected.size} students archived`);
    setSelected(new Set());
    const params = new URLSearchParams({ page: '1', limit: '20', status });
    api(`/api/students?${params}`).then((r: any) => setList(r));
  };

  const toggleAll = () => {
    if (selected.size === list.data.length) setSelected(new Set());
    else setSelected(new Set(list.data.map((s: any) => s.id)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-slate-500">{list.total} students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <button className="btn-outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import</button>
          <button className="btn-outline" onClick={exportCSV}><Download className="h-4 w-4" /> Export</button>
          {canEdit && <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> Add Student</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, ID, admission no, mobile…" className="flex-1 min-w-[220px]" />
        <select className="input !w-auto" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
          <option value="">All Schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="input !w-auto" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['active', 'alumni', 'transferred', 'archived', 'all'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
        {selected.size > 0 && <button className="btn-outline text-rose-600" onClick={bulkArchive}><Archive className="h-4 w-4" /> Archive {selected.size}</button>}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="th w-8"><input type="checkbox" checked={selected.size === list.data.length && list.data.length > 0} onChange={toggleAll} /></th>
                <th className="th">Student</th>
                <th className="th">ID / Roll</th>
                <th className="th">Class</th>
                <th className="th">School</th>
                <th className="th">Parents</th>
                <th className="th">Mobile</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={9}><PageLoader /></td></tr> : list.data.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="td"><input type="checkbox" checked={selected.has(s.id)} onChange={() => { const n = new Set(selected); n.has(s.id) ? n.delete(s.id) : n.add(s.id); setSelected(n); }} /></td>
                  <td className="td">
                    <Link to={`/app/students/${s.id}`} className="flex items-center gap-3 group">
                      <Avatar name={s.name} src={s.photo} size={36} />
                      <div>
                        <p className="font-medium group-hover:text-blue-600 transition">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.gender}{s.blood_group ? ` • ${s.blood_group}` : ''}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="td"><span className="font-mono text-xs">{s.student_id}</span><p className="text-[11px] text-slate-400">Roll {s.roll_no}</p></td>
                  <td className="td">{s.class_name}{s.section_name ? `-${s.section_name}` : ''}</td>
                  <td className="td text-xs max-w-[160px] truncate">{s.school_name}</td>
                  <td className="td text-xs">{s.father_name}</td>
                  <td className="td text-xs">{s.mobile}</td>
                  <td className="td"><StatusBadge status={s.status} /></td>
                  <td className="td">
                    <div className="flex gap-1">
                      <Link to={`/app/students/${s.id}`} className="btn-ghost !p-2" title="View"><ArrowUpRight className="h-4 w-4" /></Link>
                      {canEdit && <button className="btn-ghost !p-2" onClick={() => setModal({ ...s })}><Pencil className="h-4 w-4" /></button>}
                      {canEdit && <button className="btn-ghost !p-2 text-rose-500" onClick={() => setDel(s)}><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && list.data.length === 0 && <tr><td colSpan={9}><EmptyState title="No students found" sub="Try adjusting filters or add a new student." /></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={20} total={list.total} onChange={setPage} />
      </div>

      {/* Add/Edit modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? `Edit Student — ${modal.name}` : 'Add Student'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save Student</button></>}>
        {modal && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
            <Field label="Gender"><select className="input" value={modal.gender} onChange={(e) => setModal({ ...modal, gender: e.target.value })}>{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="School *">
              <select className="input" value={modal.school_id} onChange={(e) => setModal({ ...modal, school_id: e.target.value })}>
                <option value="">Select…</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Class *">
              <select className="input" value={modal.current_class_id} onChange={(e) => setModal({ ...modal, current_class_id: e.target.value, current_section_id: '' })}>
                <option value="">Select…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Section">
              <select className="input" value={modal.current_section_id} onChange={(e) => setModal({ ...modal, current_section_id: e.target.value })}>
                <option value="">Select…</option>{sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Roll No"><input className="input" value={modal.roll_no || ''} onChange={(e) => setModal({ ...modal, roll_no: e.target.value })} /></Field>
            <Field label="Student ID"><input className="input" value={modal.student_id || ''} onChange={(e) => setModal({ ...modal, student_id: e.target.value })} placeholder="Auto if empty" /></Field>
            <Field label="Admission No"><input className="input" value={modal.admission_no || ''} onChange={(e) => setModal({ ...modal, admission_no: e.target.value })} placeholder="Auto if empty" /></Field>
            <Field label="Date of Birth"><input type="date" className="input" value={modal.dob || ''} onChange={(e) => setModal({ ...modal, dob: e.target.value })} /></Field>
            <Field label="Admission Date"><input type="date" className="input" value={modal.admission_date || ''} onChange={(e) => setModal({ ...modal, admission_date: e.target.value })} /></Field>
            <Field label="Father's Name"><input className="input" value={modal.father_name || ''} onChange={(e) => setModal({ ...modal, father_name: e.target.value })} /></Field>
            <Field label="Mother's Name"><input className="input" value={modal.mother_name || ''} onChange={(e) => setModal({ ...modal, mother_name: e.target.value })} /></Field>
            <Field label="Guardian Name"><input className="input" value={modal.guardian_name || ''} onChange={(e) => setModal({ ...modal, guardian_name: e.target.value })} /></Field>
            <Field label="Mobile"><input className="input" value={modal.mobile || ''} onChange={(e) => setModal({ ...modal, mobile: e.target.value })} /></Field>
            <Field label="Village"><input className="input" value={modal.village || ''} onChange={(e) => setModal({ ...modal, village: e.target.value })} /></Field>
            <Field label="Block"><input className="input" value={modal.block || ''} onChange={(e) => setModal({ ...modal, block: e.target.value })} /></Field>
            <Field label="District"><input className="input" value={modal.district || ''} onChange={(e) => setModal({ ...modal, district: e.target.value })} /></Field>
            <Field label="Category"><select className="input" value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['active', 'alumni', 'transferred', 'archived'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          </div>
        )}
      </Modal>

      {/* Import result */}
      <Modal open={imp} onClose={() => setImp(false)} title="Import Results" wide>
        {!impResult ? (
          <div className="text-center py-8">
            <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold">Upload Excel / CSV file</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Columns: name, school, class, gender, roll_no, father_name, mobile, village, dob</p>
            <button className="btn-primary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Choose File</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4"><p className="text-2xl font-bold text-emerald-600">{impResult.valid}</p><p className="text-xs text-emerald-600">Valid</p></div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 p-4"><p className="text-2xl font-bold text-amber-600">{impResult.duplicates?.length || 0}</p><p className="text-xs text-amber-600">Duplicates</p></div>
              <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 p-4"><p className="text-2xl font-bold text-rose-600">{impResult.invalid?.length || 0}</p><p className="text-xs text-rose-600">Errors</p></div>
            </div>
            {impResult.invalid?.length > 0 && <div className="max-h-40 overflow-y-auto text-xs"><p className="font-semibold mb-1">Errors:</p>{impResult.invalid.map((r: any, i: number) => <p key={i} className="text-rose-500">{r.name || r.Name}: {r.errors?.join(', ')}</p>)}</div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Student?" message={`Permanently delete ${del?.name}?`} onConfirm={async () => { await api(`/api/students/${del.id}`, { method: 'DELETE' }); toast('success', 'Student deleted'); setDel(null); api(`/api/students?page=1&limit=20&status=${status}`).then((r: any) => setList(r)); }} />
    </div>
  );
}
