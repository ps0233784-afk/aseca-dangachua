import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const CATS = ['Academic', 'Student', 'Sports', 'Cultural', 'Activity'];

export default function AchievementsAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, reload } = useApi('/api/achievements');
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'achievements', 'update');

  const save = async () => {
    try {
      if (modal.id) await api(`/api/achievements/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/achievements', { method: 'POST', body: { ...modal, is_public: 1 } });
      toast('success', 'Saved'); setModal(null); reload();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Achievements</h1><p className="text-sm text-slate-500">{data?.length || 0} achievements</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ title: '', description: '', category: 'Academic', achievement_date: '' })}><Plus className="h-4 w-4" /> Add Achievement</button>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? <PageLoader /> : data?.map((a: any) => (
          <div key={a.id} className="card p-5 flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shrink-0"><Trophy className="h-5 w-5" /></div>
            <div className="min-w-0 grow">
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{a.category}</span>
              <h3 className="font-bold mt-1.5">{a.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{a.description}</p>
              <p className="text-[11px] text-slate-400 mt-1">{fmtDate(a.achievement_date)}</p>
            </div>
            {canEdit && <div className="flex gap-1"><button className="btn-outline !p-2" onClick={() => setModal(a)}><Pencil className="h-4 w-4" /></button><button className="btn-danger !p-2" onClick={() => setDel(a)}><Trash2 className="h-4 w-4" /></button></div>}
          </div>
        ))}
        {!loading && data?.length === 0 && <EmptyState />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Achievement' : 'Add Achievement'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="space-y-4">
          <Field label="Title *"><input className="input" value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></Field>
          <Field label="Description"><textarea className="input min-h-[80px]" value={modal.description || ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><select className="input" value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Date"><input type="date" className="input" value={modal.achievement_date || ''} onChange={(e) => setModal({ ...modal, achievement_date: e.target.value })} /></Field>
          </div>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Achievement?" onConfirm={async () => { await api(`/api/achievements/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); reload(); }} />
    </div>
  );
}
