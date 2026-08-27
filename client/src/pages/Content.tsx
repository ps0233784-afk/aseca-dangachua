import { useEffect, useState } from 'react';
import { get, post, put, del, uploadFile } from '../api';
import { useAuth } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Textarea, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { Bell, CalendarDays, Image as ImageIcon, LayoutTemplate, Plus, Pencil, Trash2, Upload, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export default function ContentPage({ mode }: { mode: 'notices' | 'events' | 'media' | 'pages' }) {
  if (mode === 'notices') return <Notices />;
  if (mode === 'events') return <Events />;
  if (mode === 'media') return <Media />;
  return <PageBuilder />;
}

/* ---------------- NOTICES ---------------- */
function Notices() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => {
    get(`/notices${schoolId ? `?school_id=${schoolId}` : ''}`).then((d) => { setRows(d); setLoading(false); });
  };
  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => { load(); }, [schoolId]);

  const save = async () => {
    if (edit.id) await put(`/notices/${edit.id}`, edit);
    else await post('/notices', edit);
    toast.show('Notice published');
    setEdit(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Notice Board" subtitle="Branch & school notices for staff, students and the public website" icon={<Bell size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-52">
            <option value="">All notices</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name.split(',')[0]}</option>)}
          </Select>
          {canWrite && <Button onClick={() => setEdit({ title: '', body: '', category: 'General', priority: 'normal', date: new Date().toISOString().slice(0, 10), audience: 'all', school_id: 0 })}><Plus size={15} /> New Notice</Button>}
        </div>} />
      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No notices" /> : (
          <div className="divide-y divide-slate-100">
            {rows.map((n) => (
              <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                <div className={`w-1.5 self-stretch rounded-full ${n.priority === 'high' ? 'bg-terra' : 'bg-gold'}`} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-forest-dark">{n.title}</span>
                    <Badge color="purple">{n.category}</Badge>
                    {n.priority === 'high' && <Badge color="red">High priority</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                  <div className="text-[11px] text-slate-400 mt-1">{n.date} · Audience: {n.audience}</div>
                </div>
                {canWrite && <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(n)}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" onClick={async () => { if (confirmAction('Delete notice?')) { await del(`/notices/${n.id}`); load(); } }}><Trash2 size={14} className="text-red-500" /></button>
                </div>}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Notice' : 'New Notice'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Title *"><Input value={edit.title} onChange={(e: any) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Body"><Textarea value={edit.body} onChange={(e: any) => setEdit({ ...edit, body: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><Select value={edit.category} onChange={(e: any) => setEdit({ ...edit, category: e.target.value })}>
                {['General', 'Examination', 'Affiliation', 'Academic', 'Meeting', 'Event', 'Holiday'].map((c) => <option key={c}>{c}</option>)}
              </Select></Field>
              <Field label="Priority"><Select value={edit.priority} onChange={(e: any) => setEdit({ ...edit, priority: e.target.value })}>
                <option value="normal">Normal</option><option value="high">High</option>
              </Select></Field>
              <Field label="Date"><Input type="date" value={edit.date} onChange={(e: any) => setEdit({ ...edit, date: e.target.value })} /></Field>
              <Field label="Audience"><Select value={edit.audience} onChange={(e: any) => setEdit({ ...edit, audience: e.target.value })}>
                <option value="all">All</option><option value="students">Students</option><option value="staff">Staff</option><option value="smc">SMC Members</option>
              </Select></Field>
              <Field label="Scope" className="col-span-2"><Select value={edit.school_id} onChange={(e: any) => setEdit({ ...edit, school_id: Number(e.target.value) })}>
                <option value={0}>Branch-wide (all schools)</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save} disabled={!edit.title}>Publish</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

/* ---------------- EVENTS ---------------- */
function Events() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => get('/events').then((d) => { setRows(d); setLoading(false); });
  useEffect(() => { get('/schools').then(setSchools); load(); }, []);
  const save = async () => {
    if (edit.id) await put(`/events/${edit.id}`, edit);
    else await post('/events', edit);
    toast.show('Event saved');
    setEdit(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Event Calendar" subtitle="Cultural, academic and branch events" icon={<CalendarDays size={22} />}
        action={canWrite && <Button onClick={() => setEdit({ title: '', description: '', date: '', venue: '', category: 'Cultural', school_id: 0 })}><Plus size={15} /> New Event</Button>} />
      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No events" /> : (
          <Table headers={['Date', 'Event', 'Venue', 'Category', '']}>
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-forest">{e.date}</td>
                <td className="px-4 py-3"><div className="font-semibold">{e.title}</div><div className="text-xs text-slate-500">{e.description}</div></td>
                <td className="px-4 py-3 text-xs">{e.venue}</td>
                <td className="px-4 py-3"><Badge color="gold">{e.category}</Badge></td>
                <td className="px-4 py-3">{canWrite && <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(e)}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" onClick={async () => { if (confirmAction('Delete event?')) { await del(`/events/${e.id}`); load(); } }}><Trash2 size={14} className="text-red-500" /></button>
                </div>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Event' : 'New Event'}>
        {edit && (
          <div className="space-y-3">
            <Field label="Title *"><Input value={edit.title} onChange={(e: any) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea value={edit.description} onChange={(e: any) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={edit.date} onChange={(e: any) => setEdit({ ...edit, date: e.target.value })} /></Field>
              <Field label="Category"><Select value={edit.category} onChange={(e: any) => setEdit({ ...edit, category: e.target.value })}>
                {['Cultural', 'Academic', 'Sports', 'Meeting', 'Examination', 'Observance'].map((c) => <option key={c}>{c}</option>)}
              </Select></Field>
              <Field label="Venue" className="col-span-2"><Input value={edit.venue} onChange={(e: any) => setEdit({ ...edit, venue: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save} disabled={!edit.title || !edit.date}>Save Event</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

/* ---------------- MEDIA LIBRARY ---------------- */
function Media() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { canWrite } = useAuth();
  const load = () => get('/media').then((d) => { setRows(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const onUpload = async (files: FileList) => {
    for (const f of Array.from(files)) {
      await uploadFile(f, 'media', f.name);
    }
    toast.show(`${files.length} file(s) uploaded`);
    load();
  };

  return (
    <div>
      <PageHeader title="Media Library" subtitle="Photos and documents stored in secure object storage" icon={<ImageIcon size={22} />}
        action={canWrite && (
          <label className="inline-flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-forest-light">
            <Upload size={15} /> Upload Media
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files)} />
          </label>
        )} />
      {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No media uploaded" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((m) => (
            <Card key={m.id} className="overflow-hidden group">
              {m.type === 'image'
                ? <img src={m.file_path} alt={m.title} className="w-full h-36 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')} />
                : <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-slate-400"><ImageIcon size={32} /></div>}
              <div className="p-3">
                <div className="text-xs font-semibold truncate">{m.title}</div>
                <div className="flex justify-between items-center mt-2">
                  <Badge color={m.type === 'image' ? 'blue' : 'gray'}>{m.type}</Badge>
                  <button className="p-1 hover:bg-red-50 rounded text-red-500"
                    onClick={async () => { if (confirmAction('Delete media?')) { await del(`/media/${m.id}`); load(); } }}><Trash2 size={13} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {toast.node}
    </div>
  );
}

/* ---------------- VISUAL PAGE BUILDER ---------------- */
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner' },
  { type: 'about', label: 'Text / About' },
  { type: 'stats', label: 'Live Stats' },
  { type: 'schools', label: 'Schools Grid' },
  { type: 'notices', label: 'Notice Board' },
  { type: 'events', label: 'Events List' },
  { type: 'contact', label: 'Contact Block' },
];

function PageBuilder() {
  const [pages, setPages] = useState<any[]>([]);
  const [slug, setSlug] = useState('home');
  const [title, setTitle] = useState('Home');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const toast = useToast();

  useEffect(() => { get('/pages').then(setPages).catch(() => {}); }, []);
  useEffect(() => {
    get(`/pages/${slug}`).then((p) => { setTitle(p.title); setBlocks(p.blocks); setLoaded(true); }).catch(() => setLoaded(true));
  }, [slug]);

  const save = async () => {
    await put(`/pages/${slug}`, { title, blocks });
    toast.show('Page published to public website');
    get('/pages').then(setPages).catch(() => {});
  };
  const move = (i: number, dir: -1 | 1) => {
    const next = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const update = (i: number, patch: any) => setBlocks(blocks.map((b, x) => (x === i ? { ...b, ...patch } : b)));

  if (!loaded) return <Loading />;

  return (
    <div>
      <PageHeader title="Visual Page Builder" subtitle="Drag-style block builder for the public landing page (reflects live on the website)" icon={<LayoutTemplate size={22} />}
        action={<div className="flex gap-2">
          <Select value={slug} onChange={(e: any) => setSlug(e.target.value)} className="w-44">
            <option value="home">Home</option><option value="about">About</option>
          </Select>
          <Button onClick={save}>Publish Page</Button>
        </div>} />

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Block palette */}
        <Card className="p-4 h-fit">
          <h3 className="font-bold text-forest-dark text-sm mb-3">Add Block</h3>
          <div className="space-y-2">
            {BLOCK_TYPES.map((b) => (
              <button key={b.type}
                onClick={() => setBlocks([...blocks, { type: b.type, title: b.label, body: '', olchiki: '', subtitle: '', tagline: '', enabled: true }])}
                className="w-full text-left px-3 py-2.5 rounded-lg border border-dashed border-forest/30 text-sm text-forest hover:bg-forest-50 flex items-center gap-2">
                <Plus size={14} /> {b.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Canvas */}
        <div className="lg:col-span-3 space-y-3">
          {blocks.length === 0 && <Card className="p-10 text-center text-slate-400 text-sm">Empty page — add blocks from the left.</Card>}
          {blocks.map((b, i) => (
            <Card key={i} className={`p-4 ${b.enabled ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <GripVertical size={15} className="text-slate-300" />
                <Badge color="blue">{BLOCK_TYPES.find((x) => x.type === b.type)?.label}</Badge>
                <div className="flex-1" />
                <button onClick={() => move(i, -1)} className="p-1 hover:bg-slate-100 rounded"><ArrowUp size={14} /></button>
                <button onClick={() => move(i, 1)} className="p-1 hover:bg-slate-100 rounded"><ArrowDown size={14} /></button>
                <button onClick={() => update(i, { enabled: !b.enabled })} className="p-1 hover:bg-slate-100 rounded">
                  {b.enabled ? <Eye size={14} className="text-forest" /> : <EyeOff size={14} className="text-slate-400" />}
                </button>
                <button onClick={() => setBlocks(blocks.filter((_, x) => x !== i))} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-500" /></button>
              </div>
              {b.type !== 'stats' && b.type !== 'schools' && b.type !== 'notices' && b.type !== 'events' && (
                <div className="space-y-2">
                  <Input placeholder="Heading / Title" value={b.title || ''} onChange={(e: any) => update(i, { title: e.target.value })} />
                  {(b.type === 'about' || b.type === 'contact') && (
                    <Textarea placeholder="Body text…" rows={3} value={b.body || ''} onChange={(e: any) => update(i, { body: e.target.value })} />
                  )}
                  {b.type === 'hero' && (
                    <>
                      <Input className="font-olchiki" placeholder="Ol Chiki heading" value={b.olchiki || ''} onChange={(e: any) => update(i, { olchiki: e.target.value })} />
                      <Input placeholder="Subtitle" value={b.subtitle || ''} onChange={(e: any) => update(i, { subtitle: e.target.value })} />
                      <Input placeholder="Tagline" value={b.tagline || ''} onChange={(e: any) => update(i, { tagline: e.target.value })} />
                    </>
                  )}
                </div>
              )}
              {(b.type === 'stats' || b.type === 'schools' || b.type === 'notices' || b.type === 'events') && (
                <p className="text-xs text-slate-400">Dynamic block — pulls live data automatically.</p>
              )}
            </Card>
          ))}
        </div>
      </div>
      {toast.node}
    </div>
  );
}
