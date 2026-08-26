import React, { useEffect, useState } from 'react';
import { Plus, Building2, BedDouble, Users, DoorOpen, LogOut } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/toast';
import { Modal, Field, PageLoader, EmptyState, StatCard } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';

export default function HostelPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, occupied: 0, available: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<any>(null);
  const [hostelModal, setHostelModal] = useState<any>(null);
  const [roomModal, setRoomModal] = useState<any>(null);
  const [allocModal, setAllocModal] = useState<any>(null);
  const [studentQ, setStudentQ] = useState('');
  const [loading, setLoading] = useState(true);
  const canEdit = hasPerm(user, 'hostel', 'create');

  const load = () => {
    setLoading(true);
    Promise.all([api('/api/hostels'), api('/api/hostel/allocations'), api('/api/hostel/stats')])
      .then(([h, a, s]) => { setHostels(h.data); setAllocations(a.data); setStats(s.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    if (selectedHostel) api(`/api/hostels/${selectedHostel.id}/rooms`).then((r: any) => setRooms(r.data));
  }, [selectedHostel]);

  useEffect(() => {
    if (studentQ.length >= 2) api(`/api/students?q=${encodeURIComponent(studentQ)}&limit=8`).then((r: any) => setStudents(r.data));
    else setStudents([]);
  }, [studentQ]);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Hostel</h1><p className="text-sm text-slate-500">Hostels, rooms, beds and student allocation</p></div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Beds" value={stats.total} icon={<BedDouble className="h-5 w-5" />} tone="blue" />
        <StatCard label="Occupied" value={stats.occupied} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label="Available" value={stats.available} icon={<DoorOpen className="h-5 w-5" />} tone="gold" />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{hostels.length} hostels</p>
        {canEdit && <button className="btn-primary" onClick={() => setHostelModal({ name: '', type: 'boys', address: '', total_rooms: 4, total_beds: 16 })}><Plus className="h-4 w-4" /> Add Hostel</button>}
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {hostels.map((h) => (
            <div key={h.id} className={`card p-5 cursor-pointer transition ${selectedHostel?.id === h.id ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedHostel(selectedHostel?.id === h.id ? null : h)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl text-white flex items-center justify-center" style={{ background: h.type === 'boys' ? 'linear-gradient(135deg,#1a56db,#1456e1)' : 'linear-gradient(135deg,#8b7bd8,#6d5ac4)' }}><Building2 className="h-5 w-5" /></div>
                  <div><h3 className="font-bold">{h.name}</h3><p className="text-xs text-slate-400 capitalize">{h.type} • {h.room_count} rooms</p></div>
                </div>
                <div className="text-right"><p className="font-bold text-lg">{h.occupied}/{h.total_beds}</p><p className="text-[10px] text-slate-400">occupied</p></div>
              </div>
              {selectedHostel?.id === h.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold">Rooms</p>
                    {canEdit && <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => setRoomModal({ room_no: '', beds: 4 })}><Plus className="h-3.5 w-3.5" /> Room</button>}
                  </div>
                  <div className="space-y-2">
                    {rooms.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-sm">
                        <span className="font-medium">Room {r.room_no}</span>
                        <span className="text-xs text-slate-400">{r.occupied}/{r.beds} beds</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{r.occupants || 'Empty'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {hostels.length === 0 && <EmptyState title="No hostels" />}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold">Allocations</h3>
          {canEdit && <button className="btn-primary !py-1.5 !px-3 text-xs" onClick={() => setAllocModal({ hostel_id: selectedHostel?.id || hostels[0]?.id, room_id: '', student_id: '', from_date: '', fee: 6000 })}><Plus className="h-3.5 w-3.5" /> Allocate</button>}
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Student</th><th className="th">Hostel</th><th className="th">Room</th><th className="th">From</th><th className="th text-right">Fee</th><th className="th">Status</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {allocations.map((a) => (
              <tr key={a.id}>
                <td className="td font-medium">{a.student_name} <span className="text-[11px] text-slate-400">({a.sid})</span></td>
                <td className="td">{a.hostel_name}</td>
                <td className="td">Room {a.room_no}</td>
                <td className="td">{a.from_date || '—'}</td>
                <td className="td text-right">₹{a.fee}</td>
                <td className="td capitalize">{a.status}</td>
                <td className="td">{a.status === 'active' && <button className="btn-outline !py-1.5 !px-3 text-xs text-rose-600" onClick={() => api(`/api/hostel/allocations/${a.id}/vacate`, { method: 'POST' }).then(load)}><LogOut className="h-3.5 w-3.5" /> Vacate</button>}</td>
              </tr>
            ))}
            {allocations.length === 0 && <tr><td colSpan={7}><EmptyState title="No allocations" /></td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!hostelModal} onClose={() => setHostelModal(null)} title="Add Hostel"
        footer={<><button className="btn-outline" onClick={() => setHostelModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { await api('/api/hostels', { method: 'POST', body: hostelModal }); toast('success', 'Hostel added'); setHostelModal(null); load(); }}>Save</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name *"><input className="input" value={hostelModal?.name} onChange={(e) => setHostelModal({ ...hostelModal, name: e.target.value })} /></Field>
          <Field label="Type"><select className="input" value={hostelModal?.type} onChange={(e) => setHostelModal({ ...hostelModal, type: e.target.value })}>{['boys', 'girls'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Rooms"><input type="number" className="input" value={hostelModal?.total_rooms} onChange={(e) => setHostelModal({ ...hostelModal, total_rooms: Number(e.target.value) })} /></Field>
          <Field label="Beds"><input type="number" className="input" value={hostelModal?.total_beds} onChange={(e) => setHostelModal({ ...hostelModal, total_beds: Number(e.target.value) })} /></Field>
        </div>
      </Modal>

      <Modal open={!!roomModal} onClose={() => setRoomModal(null)} title="Add Room"
        footer={<><button className="btn-outline" onClick={() => setRoomModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { await api(`/api/hostels/${selectedHostel.id}/rooms`, { method: 'POST', body: roomModal }); toast('success', 'Room added'); setRoomModal(null); api(`/api/hostels/${selectedHostel.id}/rooms`).then((r: any) => setRooms(r.data)); }}>Save</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Room No *"><input className="input" value={roomModal?.room_no} onChange={(e) => setRoomModal({ ...roomModal, room_no: e.target.value })} /></Field>
          <Field label="Beds"><input type="number" className="input" value={roomModal?.beds} onChange={(e) => setRoomModal({ ...roomModal, beds: Number(e.target.value) })} /></Field>
        </div>
      </Modal>

      <Modal open={!!allocModal} onClose={() => setAllocModal(null)} title="Allocate Student"
        footer={<><button className="btn-outline" onClick={() => setAllocModal(null)}>Cancel</button><button className="btn-primary" onClick={async () => { try { await api('/api/hostel/allocations', { method: 'POST', body: allocModal }); toast('success', 'Allocated'); setAllocModal(null); load(); } catch (e: any) { toast('error', e.message); } }}>Allocate</button></>}>
        <div className="space-y-4">
          <Field label="Hostel"><select className="input" value={allocModal?.hostel_id} onChange={(e) => setAllocModal({ ...allocModal, hostel_id: e.target.value })}>{hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>
          <Field label="Room"><select className="input" value={allocModal?.room_id} onChange={(e) => setAllocModal({ ...allocModal, room_id: e.target.value })}><option value="">Select…</option>{rooms.map((r) => <option key={r.id} value={r.id}>Room {r.room_no} ({r.occupied}/{r.beds})</option>)}</select></Field>
          <Field label="Student">
            <input className="input" placeholder="Search student…" value={studentQ} onChange={(e) => setStudentQ(e.target.value)} />
            <div className="max-h-36 overflow-y-auto mt-1 space-y-1">{students.map((s: any) => <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setAllocModal({ ...allocModal, student_id: s.id, _n: `${s.name} (${s.student_id})` }); setStudentQ(`${s.name} (${s.student_id})`); setStudents([]); }}>{s.name} <span className="text-slate-400">({s.student_id})</span></button>)}</div>
            {allocModal?._n && <p className="text-xs text-emerald-600 mt-1">Selected: {allocModal._n}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From Date"><input type="date" className="input" value={allocModal?.from_date || ''} onChange={(e) => setAllocModal({ ...allocModal, from_date: e.target.value })} /></Field>
            <Field label="Fee"><input type="number" className="input" value={allocModal?.fee} onChange={(e) => setAllocModal({ ...allocModal, fee: Number(e.target.value) })} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
