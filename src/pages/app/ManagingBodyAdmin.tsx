import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, Avatar, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';

export default function ManagingBodyAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, reload } = useApi('/api/managing-body');
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'managing_body', 'update');

  const save = async () => {
    try {
      const body = { ...modal, order_index: Number(modal.order_index || 0) };
      if (modal.id) await api(`/api/managing-body/${modal.id}`, { method: 'PUT', body });
      else await api('/api/managing-body', { method: 'POST', body });
      toast('success', 'Saved'); setModal(null); reload();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Managing Body</h1><p className="text-sm text-slate-500">{data?.length || 0} members</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ name: '', designation: '', bio: '', order_index: data?.length || 0, status: 'active' })}><Plus className="h-4 w-4" /> Add Member</button>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <PageLoader /> : data?.map((m: any) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={m.name} src={m.photo} size={48} />
              <div className="min-w-0">
                <h3 className="font-bold truncate">{m.name}</h3>
                <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>{m.designation}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{m.bio}</p>
            {canEdit && <div className="flex gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button className="btn-outline !py-1.5 flex-1 text-xs" onClick={() => setModal(m)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
              <button className="btn-danger !py-1.5" onClick={() => setDel(m)}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>}
          </div>
        ))}
        {!loading && data?.length === 0 && <EmptyState />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Member' : 'Add Member'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="space-y-4">
          <Field label="Name *"><input className="input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} /></Field>
          <Field label="Designation"><input className="input" value={modal.designation} onChange={(e) => setModal({ ...modal, designation: e.target.value })} /></Field>
          <Field label="Photo URL"><input className="input" value={modal.photo || ''} onChange={(e) => setModal({ ...modal, photo: e.target.value })} placeholder="/uploads/photo.jpg" /></Field>
          <Field label="Short Biography"><textarea className="input min-h-[100px]" value={modal.bio || ''} onChange={(e) => setModal({ ...modal, bio: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Order"><input type="number" className="input" value={modal.order_index} onChange={(e) => setModal({ ...modal, order_index: e.target.value })} /></Field>
            <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['active', 'inactive'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          </div>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Remove Member?" onConfirm={async () => { await api(`/api/managing-body/${del.id}`, { method: 'DELETE' }); toast('success', 'Removed'); setDel(null); reload(); }} />
    </div>
  );
}
