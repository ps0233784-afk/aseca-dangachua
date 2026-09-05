import { useEffect, useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, Headphones, Search, Sparkles, Volume2 } from 'lucide-react';
import PublicPageHero from '../../components/public/PublicPageHero';
import { api } from '../../lib/api';
import { demoDictionaryEntries, DemoDictionaryEntry } from '../../lib/publicData';

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DemoDictionaryEntry[]>(demoDictionaryEntries);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'all' | 'ol_chiki' | 'roman' | 'odia' | 'hindi' | 'english'>('all');
  const [loading, setLoading] = useState(true);
  const [sourceStatus, setSourceStatus] = useState('Demo preview');

  useEffect(() => {
    api.get<{ entries: DemoDictionaryEntry[]; categories: any[] }>('/public/dictionary')
      .then((data) => { setEntries(data.entries); setCategories(data.categories || []); setSourceStatus('Source-verified entries'); })
      .catch(() => setSourceStatus('Demo preview'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => entries.filter((entry) => {
    const haystack = language === 'all' ? Object.values(entry).join(' ') : String(entry[language as keyof DemoDictionaryEntry] || '');
    return !query.trim() || haystack.toLowerCase().includes(query.toLowerCase().trim());
  }), [entries, query, language]);

  return (
    <div className="bg-[#f4f2e9]">
      <PublicPageHero eyebrow="Santali language platform" title="Find the word." accent="Keep it alive." description="A growing, source-aware Santali dictionary across Ol Chiki, Roman, Odia, Hindi and English. Entries are reviewed before they are published." />
      <section id="page-content" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-[#0b1710] p-5 text-white shadow-2xl shadow-emerald-950/10 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lime-300" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a word, meaning or script…" aria-label="Search dictionary" className="w-full rounded-2xl border border-white/10 bg-white/[.07] px-12 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime-300/60" />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/55"><span className="h-2 w-2 rounded-full bg-lime-300" />{sourceStatus}</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(['all', 'ol_chiki', 'roman', 'odia', 'hindi', 'english'] as const).map((item) => (
                <button key={item} onClick={() => setLanguage(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${language === item ? 'bg-lime-300 text-[#0b1710]' : 'bg-white/[.07] text-white/60 hover:bg-white/15 hover:text-white'}`}>{item === 'all' ? 'All scripts' : item === 'ol_chiki' ? 'Ol Chiki' : item[0].toUpperCase() + item.slice(1)}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[#34483c]/60">
            <BookMarked className="h-4 w-4 text-emerald-800" />
            {categories.length ? `${categories.length} categories · ` : ''}{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} shown
            <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-100 px-3 py-1 font-bold text-amber-800">Never publish unsourced language data</span>
          </div>

          {loading ? <DictionarySkeleton /> : filtered.length === 0 ? <EmptyDictionary query={query} /> : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filtered.map((entry) => <DictionaryCard key={entry.id} entry={entry} />)}
            </div>
          )}
        </div>
      </section>
      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] bg-lime-300 p-8 text-[#0b1710] sm:grid-cols-[1fr_auto] sm:items-center sm:p-12">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em]">Help it grow responsibly</p><h2 className="public-display mt-3 text-3xl font-extrabold tracking-[-.04em]">Have a source-verified word or recording?</h2><p className="mt-2 max-w-xl text-sm text-[#34483c]/70">Contact the branch team so an authorized editor can review and publish it.</p></div>
          <a href="mailto:info@branchasecadangachua.org?subject=Santali%20dictionary%20contribution" className="inline-flex items-center justify-center rounded-full bg-[#101a14] px-6 py-4 text-sm font-extrabold text-white">Suggest an entry <Sparkles className="ml-2 h-4 w-4 text-lime-300" /></a>
        </div>
      </section>
    </div>
  );
}

function DictionaryCard({ entry }: { entry: DemoDictionaryEntry }) {
  const audio = entry.audio_url;
  return <article className="rounded-[1.6rem] border border-[#14251b]/10 bg-white/65 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl sm:p-7">
    <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="font-olchiki text-3xl font-bold text-emerald-800">{entry.ol_chiki || '—'}</span>{entry.verified ? <span title="Source verified"><CheckCircle2 className="h-4 w-4 text-emerald-700" /></span> : <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-amber-800">Demo / draft</span>}</div><p className="mt-2 text-xs font-bold text-[#34483c]/50">{entry.roman || 'Roman spelling not added'}</p></div><AudioButton src={audio} /> </div>
    <div className="mt-5 grid grid-cols-2 gap-3 text-xs"><Info label="Odia" value={entry.odia} /><Info label="Hindi" value={entry.hindi} /><Info label="English" value={entry.english} /><Info label="Part of speech" value={entry.part_of_speech} /></div>
    <p className="mt-5 text-sm leading-7 text-[#34483c]/75">{entry.definition}</p>
    {entry.example && <p className="mt-4 rounded-xl bg-[#f4f2e9] p-3 text-xs italic text-[#34483c]/65">“{entry.example}”</p>}
    <p className="mt-5 border-t border-[#14251b]/10 pt-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#34483c]/40">Source: {entry.source || 'Not supplied'}</p>
  </article>;
}
function AudioButton({ src }: { src?: string }) { const [playing, setPlaying] = useState(false); return src ? <button onClick={() => { const audio = new Audio(src); setPlaying(true); audio.play().finally(() => setPlaying(false)); }} className="grid h-11 w-11 place-items-center rounded-full bg-emerald-800 text-lime-300 transition hover:scale-105" aria-label="Play pronunciation"><Volume2 className={`h-5 w-5 ${playing ? 'animate-pulse' : ''}`} /></button> : <span className="grid h-11 w-11 place-items-center rounded-full border border-[#14251b]/10 text-[#34483c]/30" title="Audio not configured"><Headphones className="h-4 w-4" /></span>; }
function Info({ label, value }: { label: string; value?: string }) { return <div className="rounded-xl bg-[#f4f2e9] px-3 py-2"><span className="block text-[9px] font-extrabold uppercase tracking-[.14em] text-[#34483c]/40">{label}</span><span className="mt-1 block font-semibold text-[#17221c]">{value || '—'}</span></div>; }
function DictionarySkeleton() { return <div className="mt-5 grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.6rem] bg-[#e8e5da]" />)}</div>; }
function EmptyDictionary({ query }: { query: string }) { return <div className="mt-5 rounded-[1.6rem] border border-dashed border-[#14251b]/20 p-12 text-center"><Search className="mx-auto h-8 w-8 text-[#34483c]/30" /><h2 className="mt-4 text-xl font-extrabold">No entries found</h2><p className="mt-2 text-sm text-[#34483c]/60">{query ? 'Try another script or spelling.' : 'Verified entries will appear here after editorial review.'}</p></div>; }
