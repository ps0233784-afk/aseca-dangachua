import React, { useRef, useState } from 'react';
import { Upload, FolderOpen, FileText, Trash2, Download, Lock } from 'lucide-react';
import { api, fetchBlob } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, EmptyState, Spinner, SearchBox } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { useDebounced } from '../../lib/hooks';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [addModal, setAddModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [studentQ, setStudentQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const dq = useDebounced(q, 300);
  const canEdit = hasPerm(user, 'documents', 'create');

  const load = () => {
    setLoading(true);
    api(`/api/search?q=${encodeURIComponent(dq)}`).then((r: any) => setRows(r.data.documents || [])).finally(() => setLoading(false));
  };
  React.useEffect(load, [dq]);

  React.useEffect(() => {
    if (studentQ.length >= 2) api(`/api/students?q=${encodeURIComponent(studentQ)}&limit=8`).then((r: any) => setStudents(r.data));
    else setStudents([]);
  }, [studentQ]);

  const doUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !addModal?.student_id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up: any = await api('/api/upload', { method: 'POST', formData: fd });
      await api(`/api/students/${addModal.student_id}/documents`, { method: 'POST', body: { name: addModal.name || file.name, doc_type: addModal.doc_type || 'other', file_path: up.url, file_size: up.size, is_sensitive: addModal.is_sensitive ? 1 : 0 } });
      toast('success', 'Document uploaded');
      setAddModal(null); load();
    } catch (e: any) { toast('error', e.message); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Documents</h1><p className="text-sm text-slate-500">Secure document management for students, staff and schools</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setAddModal({ student_id: '', name: '', doc_type: 'certificate', is_sensitive: false })}><Upload className="h-4 w-4" /> Upload Document</button>}
      </div>

      <SearchBox value={q} onChange={setQ} placeholder="Search documents…" className="max-w-md" />

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Document</th><th className="th">Type</th><th className="th">Sensitivity</th><th className="th">Uploaded</th><th className="th">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((doc: any) => (
                <tr key={doc.id}>
                  <td className="td"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /><span className="font-medium">{doc.name}</span></div></td>
                  <td className="td capitalize">{doc.doc_type}</td>
                  <td className="td">{doc.is_sensitive ? <span className="badge bg-amber-100 text-amber-700"><Lock className="h-3 w-3" /> Sensitive</span> : 'Public'}</td>
                  <td className="td text-xs">{doc.created_at}</td>
                  <td className="td"><div className="flex gap-1">
                    {doc.file_path && <button className="btn-outline !p-2" onClick={() => fetchBlob(doc.file_path, doc.name)}><Download className="h-4 w-4" /></button>}
                    {canEdit && <button className="btn-danger !p-2" onClick={() => setDel(doc)}><Trash2 className="h-4 w-4" /></button>}
                  </div></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={5}><EmptyState title="No documents" sub="Search by name to find documents, or upload a new one." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!addModal} onClose={() => setAddModal(null)} title="Upload Document"
        footer={<><button className="btn-outline" onClick={() => setAddModal(null)}>Cancel</button><button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <Spinner /> : 'Upload'}</button></>}>
        <div className="space-y-4">
          <input ref={fileRef} type="file" className="hidden" onChange={doUpload} />
          <Field label="Student">
            <input className="input" placeholder="Search student…" value={studentQ} onChange={(e) => setStudentQ(e.target.value)} />
            <div className="max-h-36 overflow-y-auto mt-1 space-y-1">
              {students.map((s: any) => <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setAddModal({ ...addModal, student_id: s.id, _n: `${s.name} (${s.student_id})` }); setStudentQ(`${s.name} (${s.student_id})`); setStudents([]); }}>{s.name} <span className="text-slate-400">({s.student_id})</span></button>)}
            </div>
            {addModal?._n && <p className="text-xs text-emerald-600 mt-1">Selected: {addModal._n}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Document Name"><input className="input" value={addModal?.name || ''} onChange={(e) => setAddModal({ ...addModal, name: e.target.value })} /></Field>
            <Field label="Type"><select className="input" value={addModal?.doc_type} onChange={(e) => setAddModal({ ...addModal, doc_type: e.target.value })}>{['certificate', 'identity', 'academic', 'medical', 'other'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addModal?.is_sensitive} onChange={(e) => setAddModal({ ...addModal, is_sensitive: e.target.checked })} /> Mark as sensitive (Aadhaar/ID)</label>
        </div>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Document?" onConfirm={async () => { await api(`/api/documents/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); load(); }} />
    </div>
  );
}
