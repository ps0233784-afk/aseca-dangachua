import React, { useState } from 'react';
import { Plus, Pencil, Archive, RotateCcw, Trash2, School, MapPin, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, EmptyState, PageLoader, Field, StatusBadge, Spinner, Logo } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';

const empty = { name: '', code: '', school_id: '', address: '', village: '', block: '', district: '', cluster: '', pincode: '', phone: '', email: '', principal_name: '', school_type: 'High School', medium: 'Odia + Santali', established_year: '', status: 'active', description: '' };

export default function SchoolsAdmin() {
  const { user } = useAuth();
  const { data, loading, reload } = useApi('/api/schools');
  const { toast } = useToast();
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const canEdit = hasPerm(user, 'schools', 'update');

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...modal, established_year: modal.established_year ? Number(modal.established_year) : null };
      if (modal.id) await api(`/api/schools/${modal.id}`, { method: 'PUT', body });
      else await api('/api/schools', { method: 'POST', body });
      toast('success', modal.id ? 'School updated' : 'School created');
      setModal(null); reload();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-sm text-slate-500">{data?.length || 0} schools • {data?.filter((s: any) => s.status === 'active').length || 0} active</p>
        </div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> Add School</button>}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data?.map((s: any) => (
          <div key={s.id} className="card overflow-hidden flex flex-col">
            <div className="h-28 relative" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }}>
              {s.photo && <img src={s.photo} className="w-full h-full object-cover" alt="" />}
              <div className="absolute -bottom-7 left-4"><Logo name={s.name} src={s.logo} size={56} /></div>
              <div className="absolute top-3 right-3"><StatusBadge status={s.status} /></div>
            </div>
            <div className="p-5 pt-10 grow">
              <h3 className="font-bold leading-snug">{s.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{s.code} • Est. {s.established_year} • {s.medium}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-600" /> {s.village}, {s.district}</span>
                <span className="flex items-center gap-1"><School className="h-3.5 w-3.5 text-blue-600" /> {s.school_type}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{s.description}</p>
              <p className="text-xs text-slate-400 mt-2">Principal: {s.principal_name}</p>
            </div>
            {canEdit && (
              <div className="flex gap-1.5 px-4 pb-4">
                <button className="btn-outline !py-2 flex-1" onClick={() => setModal({ ...s })}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                {s.status === 'active'
                  ? <button className="btn-outline !py-2" onClick={() => api(`/api/schools/${s.id}/archive`, { method: 'POST' }).then(reload)} title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  : <button className="btn-outline !py-2 text-emerald-600" onClick={() => api(`/api/schools/${s.id}/restore`, { method: 'POST' }).then(reload)} title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>}
                <button className="btn-danger !py-2" onClick={() => setDel(s)}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit School' : 'Add School'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" disabled={busy} onClick={save}>{busy ? <Spinner /> : 'Save'}</button></>}>
        {modal && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="School Name *" className="sm:col-span-2"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
            <Field label="Code"><input className="input" value={modal.code} onChange={(e) => setModal({ ...modal, code: e.target.value })} /></Field>
            <Field label="School ID"><input className="input" value={modal.school_id || ''} onChange={(e) => setModal({ ...modal, school_id: e.target.value })} /></Field>
            <Field label="Address" className="sm:col-span-2"><input className="input" value={modal.address || ''} onChange={(e) => setModal({ ...modal, address: e.target.value })} /></Field>
            <Field label="Village"><input className="input" value={modal.village || ''} onChange={(e) => setModal({ ...modal, village: e.target.value })} /></Field>
            <Field label="Block"><input className="input" value={modal.block || ''} onChange={(e) => setModal({ ...modal, block: e.target.value })} /></Field>
            <Field label="District"><input className="input" value={modal.district || ''} onChange={(e) => setModal({ ...modal, district: e.target.value })} /></Field>
            <Field label="Cluster"><input className="input" value={modal.cluster || ''} onChange={(e) => setModal({ ...modal, cluster: e.target.value })} /></Field>
            <Field label="PIN"><input className="input" value={modal.pincode || ''} onChange={(e) => setModal({ ...modal, pincode: e.target.value })} /></Field>
            <Field label="Phone"><input className="input" value={modal.phone || ''} onChange={(e) => setModal({ ...modal, phone: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={modal.email || ''} onChange={(e) => setModal({ ...modal, email: e.target.value })} /></Field>
            <Field label="Principal Name"><input className="input" value={modal.principal_name || ''} onChange={(e) => setModal({ ...modal, principal_name: e.target.value })} /></Field>
            <Field label="School Type">
              <select className="input" value={modal.school_type} onChange={(e) => setModal({ ...modal, school_type: e.target.value })}>
                {['High School', 'Upper Primary School', 'Primary School', 'Secondary School', 'Residential School', 'KGBV', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Medium"><input className="input" value={modal.medium} onChange={(e) => setModal({ ...modal, medium: e.target.value })} /></Field>
            <Field label="Established Year"><input type="number" className="input" value={modal.established_year || ''} onChange={(e) => setModal({ ...modal, established_year: e.target.value })} /></Field>
            <Field label="Status">
              <select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>
                {['active', 'disabled', 'archived'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2"><textarea className="input min-h-[80px]" value={modal.description || ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete School?" message={`This will permanently delete "${del?.name}". Students and records of this school will be orphaned.`} onConfirm={async () => { await api(`/api/schools/${del.id}`, { method: 'DELETE' }); toast('success', 'School deleted'); setDel(null); reload(); }} />
    </div>
  );
}
