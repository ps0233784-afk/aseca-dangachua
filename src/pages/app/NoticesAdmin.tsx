import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Megaphone, Paperclip } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, StatusBadge, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const empty = { title: '', body: '', category: 'General', target_type: 'all', priority: 'normal', status: 'draft', publish_at: '', expire_at: '' };

export default function NoticesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState('all');
  const { data, loading, reload } = useApi(`/api/notices?status=${status}`, [status]);
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'notices', 'create');

  const save = async () => {
    try {
      if (modal.id) await api(`/api/notices/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/notices', { method: 'POST', body: modal });
      toast('success', modal.id ? 'Notice updated' : 'Notice created');
      setModal(null); reload();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Notices</h1><p className="text-sm text-slate-500">{data?.length || 0} notices</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> New Notice</button>}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {['all', 'draft', 'published', 'scheduled', 'expired'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-4 py-1.5 rounded-lg text-sm capitalize ${status === s ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <PageLoader /> : data?.map((n: any) => (
          <div key={n.id} className="card p-5 flex flex-wrap items-start gap-4">
            <div className="min-w-0 grow">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{n.category}</span>
                {n.priority === 'high' && <span className="badge bg-rose-100 text-rose-700">High priority</span>}
                <StatusBadge status={n.status} />
              </div>
              <h3 className="font-bold mt-2">{n.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.body}</p>
              <p className="text-[11px] text-slate-400 mt-2">By {n.created_by_name || '—'} • {fmtDate(n.publish_at || n.created_at)}</p>
            </div>
            {canEdit && (
              <div className="flex gap-1.5">
                <button className="btn-outline !p-2" onClick={() => setModal(n)}><Pencil className="h-4 w-4" /></button>
                <button className="btn-danger !p-2" onClick={() => setDel(n)}><Trash2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        ))}
        {!loading && data?.length === 0 && <EmptyState title="No notices" />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Notice' : 'New Notice'} wide
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="space-y-4">
          <Field label="Title *"><input className="input" value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></Field>
          <Field label="Body"><textarea className="input min-h-[120px]" value={modal.body || ''} onChange={(e) => setModal({ ...modal, body: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Category"><input className="input" value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })} /></Field>
            <Field label="Priority"><select className="input" value={modal.priority} onChange={(e) => setModal({ ...modal, priority: e.target.value })}>{['normal', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['draft', 'published', 'scheduled', 'expired'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Publish At"><input type="datetime-local" className="input" value={modal.publish_at ? modal.publish_at.replace('Z', '') : ''} onChange={(e) => setModal({ ...modal, publish_at: e.target.value })} /></Field>
            <Field label="Expire At"><input type="datetime-local" className="input" value={modal.expire_at ? modal.expire_at.replace('Z', '') : ''} onChange={(e) => setModal({ ...modal, expire_at: e.target.value })} /></Field>
          </div>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Notice?" onConfirm={async () => { await api(`/api/notices/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); reload(); }} />
    </div>
  );
}
