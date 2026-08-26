import React, { useEffect, useState } from 'react';
import { IdCard, Printer, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useBrand } from '../../contexts/BrandContext';
import { Avatar, PageLoader, EmptyState, SearchBox } from '../../components/ui/primitives';
import { useDebounced } from '../../lib/hooks';

export default function IdCardsPage() {
  const { org } = useBrand();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const dq = useDebounced(q, 300);

  useEffect(() => {
    setLoading(true);
    api(`/api/students?limit=200${dq ? `&q=${encodeURIComponent(dq)}` : ''}`).then((r: any) => setStudents(r.data)).finally(() => setLoading(false));
  }, [dq]);

  const toggleAll = () => setSelected(selected.size === students.length ? new Set() : new Set(students.map((s) => s.id)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><IdCard className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> ID Cards</h1><p className="text-sm text-slate-500">Student & staff ID cards with photo, ID and QR code</p></div>
        <div className="flex gap-2">
          <SearchBox value={q} onChange={setQ} placeholder="Search students…" className="w-64" />
          <button className="btn-outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print Selected ({selected.size})</button>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <input type="checkbox" checked={selected.size === students.length && students.length > 0} onChange={toggleAll} />
        <span className="text-sm text-slate-500">Select all students</span>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="id-cards-grid">
          {students.filter((s) => selected.size === 0 || selected.has(s.id)).slice(0, 40).map((s) => (
            <div key={s.id} className="card overflow-hidden">
              <label className="absolute m-3 z-10"><input type="checkbox" checked={selected.has(s.id)} onChange={() => { const n = new Set(selected); n.has(s.id) ? n.delete(s.id) : n.add(s.id); setSelected(n); }} /></label>
              <div className="h-16 text-white flex items-center px-4" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }}>
                <span className="text-xs font-bold truncate">{org?.name}</span>
              </div>
              <div className="p-4 flex gap-3">
                <Avatar name={s.name} src={s.photo} size={64} />
                <div className="min-w-0 grow">
                  <p className="font-bold text-sm truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.class_name}{s.section_name ? `-${s.section_name}` : ''} • Roll {s.roll_no}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.student_id}</p>
                </div>
                <img src={`/api/qr?text=${encodeURIComponent(s.student_id)}`} alt="QR" className="h-14 w-14 rounded" />
              </div>
            </div>
          ))}
          {students.length === 0 && <EmptyState title="No students" />}
        </div>
      )}
    </div>
  );
}
