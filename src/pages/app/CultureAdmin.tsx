import React, { useState } from 'react';
import { Languages, ScrollText, BookMarked, PartyPopper, TreePine, FolderOpen, History, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { PageLoader, Field } from '../../components/ui/primitives';

const ITEMS = [
  { key: 'language', icon: Languages, title: 'Santali Language' },
  { key: 'olchiki', icon: ScrollText, title: 'Ol Chiki Script' },
  { key: 'literature', icon: BookMarked, title: 'Santali Literature' },
  { key: 'festivals', icon: PartyPopper, title: 'Festivals' },
  { key: 'knowledge', icon: TreePine, title: 'Traditional Knowledge' },
  { key: 'resources', icon: FolderOpen, title: 'Educational Resources' },
  { key: 'history', icon: History, title: 'Community History' },
];

export default function CultureAdmin() {
  const { data, loading, reload } = useApi('/api/culture-content');
  const { toast } = useToast();
  const [selected, setSelected] = useState<string>('language');
  const [form, setForm] = useState<any>({ title: '', body: '' });

  React.useEffect(() => {
    if (data) {
      const current = data.find((d: any) => d.section_key === selected);
      setForm({ title: current?.title || '', body: current?.body || '' });
    }
  }, [selected, data]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Languages className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Santali Culture Content</h1>
        <p className="text-sm text-slate-500">Edit the cultural content shown on the public website. Please keep content respectful and accurate.</p>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
        <div className="card p-2 space-y-1">
          {ITEMS.map((i) => (
            <button key={i.key} onClick={() => setSelected(i.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${selected === i.key ? 'text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`} style={selected === i.key ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
              <i.icon className="h-4 w-4" /> {i.title}
            </button>
          ))}
        </div>
        <div className="card p-6">
          <Field label="Section Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Content" className="mt-4"><textarea className="input min-h-[200px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <button className="btn-primary mt-4" onClick={async () => { await api(`/api/culture-content/${selected}`, { method: 'PUT', body: form }); toast('success', 'Saved — the website updates immediately'); reload(); }}>
            <Save className="h-4 w-4" /> Save Section
          </button>
        </div>
      </div>
    </div>
  );
}
