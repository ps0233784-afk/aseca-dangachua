import React, { useState } from 'react';
import { Plus, Pencil, Trash2, PartyPopper, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, EmptyState } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { fmtDate } from '../../lib/format';

const CATS = ['Cultural', 'Sports', 'Meeting', 'Holiday', 'Training', 'Community'];
const empty = { title: '', description: '', category: 'Cultural', event_date: '', start_time: '', end_time: '', venue: '', status: 'published' };

export default function EventsAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, reload } = useApi('/api/events');
  const [modal, setModal] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const canEdit = hasPerm(user, 'events', 'create');

  const save = async () => {
    try {
      if (modal.id) await api(`/api/events/${modal.id}`, { method: 'PUT', body: modal });
      else await api('/api/events', { method: 'POST', body: modal });
      toast('success', 'Saved'); setModal(null); reload();
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><PartyPopper className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Events</h1><p className="text-sm text-slate-500">{data?.length || 0} events</p></div>
        {canEdit && <button className="btn-primary" onClick={() => setModal({ ...empty })}><Plus className="h-4 w-4" /> New Event</button>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? <PageLoader /> : data?.map((e: any) => (
          <div key={e.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{e.category}</span>
                <h3 className="font-bold mt-2">{e.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.venue}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{e.description}</p>
                <p className="text-xs text-slate-400 mt-2">{fmtDate(e.event_date)} {e.start_time ? `• ${e.start_time}` : ''}</p>
              </div>
              {canEdit && <div className="flex gap-1"><button className="btn-outline !p-2" onClick={() => setModal(e)}><Pencil className="h-4 w-4" /></button><button className="btn-danger !p-2" onClick={() => setDel(e)}><Trash2 className="h-4 w-4" /></button></div>}
            </div>
          </div>
        ))}
        {!loading && data?.length === 0 && <EmptyState title="No events" />}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Event' : 'New Event'}
        footer={<><button className="btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>}>
        {modal && <div className="space-y-4">
          <Field label="Title *"><input className="input" value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })} /></Field>
          <Field label="Description"><textarea className="input min-h-[80px]" value={modal.description || ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><select className="input" value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Venue"><input className="input" value={modal.venue || ''} onChange={(e) => setModal({ ...modal, venue: e.target.value })} /></Field>
            <Field label="Date *"><input type="date" className="input" value={modal.event_date} onChange={(e) => setModal({ ...modal, event_date: e.target.value })} /></Field>
            <Field label="Status"><select className="input" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}>{['published', 'draft', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Start Time"><input type="time" className="input" value={modal.start_time || ''} onChange={(e) => setModal({ ...modal, start_time: e.target.value })} /></Field>
            <Field label="End Time"><input type="time" className="input" value={modal.end_time || ''} onChange={(e) => setModal({ ...modal, end_time: e.target.value })} /></Field>
          </div>
        </div>}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Event?" onConfirm={async () => { await api(`/api/events/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); reload(); }} />
    </div>
  );
}
