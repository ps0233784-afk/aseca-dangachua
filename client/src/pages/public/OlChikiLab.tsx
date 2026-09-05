import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Gamepad2, Headphones, LockKeyhole, RotateCcw, Sparkles, Volume2, WandSparkles } from 'lucide-react';
import PublicPageHero from '../../components/public/PublicPageHero';
import { api } from '../../lib/api';
import { demoOlChikiLetters } from '../../lib/publicData';

const modes = [
  { id: 'learn', label: 'LEARN', icon: BookOpen, description: 'Explore letter cards at your own pace.' },
  { id: 'listen', label: 'LISTEN', icon: Headphones, description: 'Play configured pronunciation audio.' },
  { id: 'match', label: 'MATCH', icon: Gamepad2, description: 'Match a character with its card.' },
  { id: 'practice', label: 'PRACTICE', icon: WandSparkles, description: 'Write down what you recognise.' },
  { id: 'quiz', label: 'QUIZ', icon: Sparkles, description: 'A small, friendly knowledge check.' },
  { id: 'review', label: 'REVIEW', icon: RotateCcw, description: 'Return to your saved learning later.' },
] as const;

type Letter = typeof demoOlChikiLetters[number] & { id: string; audio_url?: string; sound_url?: string };
export default function OlChikiLabPage() {
  const [letters, setLetters] = useState<Letter[]>(demoOlChikiLetters);
  const [lessons, setLessons] = useState<any[]>([]);
  const [mode, setMode] = useState<(typeof modes)[number]['id']>('learn');
  const [selected, setSelected] = useState(0);
  const [sourceStatus, setSourceStatus] = useState('Demo lesson content');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    Promise.all([api.get<Letter[]>('/public/olchiki/letters'), api.get<any[]>('/public/olchiki/lessons')])
      .then(([nextLetters, nextLessons]) => { if (nextLetters.length) setLetters(nextLetters); setLessons(nextLessons); setSourceStatus('Published lesson content'); })
      .catch(() => undefined);
  }, []);

  const letter = letters[selected] || letters[0];
  const progress = Math.round(((selected + 1) / Math.max(letters.length, 1)) * 100);
  const next = () => setSelected((current) => (current + 1) % Math.max(letters.length, 1));
  const audio = letter?.audio_url || letter?.sound_url;

  return <div className="bg-[#f4f2e9]">
    <PublicPageHero eyebrow="Playful language learning" title="Welcome to the" accent="Ol Chiki Lab." description="A gentle place to meet the script, listen to verified sounds and practise one step at a time. Guests can explore; sign in when you want your progress saved." />
    <section id="page-content" className="relative overflow-hidden bg-[#0b1710] px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-10">
      <div className="public-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="public-kicker"><span />Learn by playing</div><h2 className="public-display mt-4 text-4xl font-extrabold tracking-[-.05em] sm:text-6xl">Pick a mode.<br /><span className="text-lime-300">Make it yours.</span></h2></div><span className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold text-white/60">{sourceStatus}</span></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{modes.map(({ id, label, icon: Icon, description }) => <button key={id} onClick={() => setMode(id)} className={`group rounded-2xl border p-5 text-left transition ${mode === id ? 'border-lime-300 bg-lime-300 text-[#0b1710]' : 'border-white/10 bg-white/[.04] text-white hover:border-white/25'}`}><div className="flex items-center justify-between"><Icon className="h-5 w-5" /><span className="text-[10px] font-extrabold tracking-[.2em] opacity-60">{label}</span></div><p className="mt-6 text-sm font-bold">{description}</p></button>)}</div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_.75fr] lg:items-center">
          <div className="rounded-[2rem] bg-[#f4f2e9] p-6 text-[#0b1710] sm:p-10"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-emerald-800">{mode} · Letter {selected + 1} of {letters.length}</p><div className="mt-3 h-2 w-40 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-emerald-800 transition-all" style={{ width: `${progress}%` }} /></div></div><span className="font-olchiki text-5xl text-emerald-800/15">ᱚ</span></div><div className="py-12 text-center sm:py-16"><div className="font-olchiki text-[9rem] font-bold leading-none text-emerald-800 sm:text-[12rem]">{letter?.character || 'ᱚ'}</div><h3 className="public-display mt-6 text-3xl font-extrabold tracking-[-.04em]">{letter?.name || 'Letter not configured'}</h3><p className="mt-2 text-sm text-[#34483c]/60">{letter?.roman || 'Verified transliteration pending'}</p></div><div className="flex flex-wrap justify-center gap-3"><button onClick={() => audio && new Audio(audio).play()} disabled={!audio} className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-extrabold text-lime-300 transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Volume2 className="h-4 w-4" /> {audio ? 'Play sound' : 'Sound pending'}</button><button onClick={next} className="inline-flex items-center gap-2 rounded-full border border-[#14251b]/15 px-5 py-3 text-sm font-extrabold">Next card <ArrowRight className="h-4 w-4" /></button></div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-7 sm:p-10"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-lime-300">{mode === 'quiz' ? 'Quick check' : 'Card details'}</p>{mode === 'quiz' ? <Quiz letters={letters} onComplete={() => setCompleted(true)} /> : <><h3 className="public-display mt-5 text-3xl font-extrabold">{letter?.example_word || 'An example word will appear here.'}</h3><p className="mt-3 text-sm leading-7 text-white/50">{letter?.meaning || 'The administrator can add a verified example word, meaning and image through the Ol Chiki Lab editor.'}</p><div className="mt-8 rounded-2xl bg-amber-300 p-5 text-[#0b1710]"><p className="text-[10px] font-extrabold uppercase tracking-[.18em]">Learning note</p><p className="mt-2 text-sm font-bold leading-6">Every sound and word should be configured from an approved source before it is published.</p></div></>}</div>
        </div>
        {lessons.length > 0 && <div className="mt-12"><p className="public-kicker"><span />Lesson library</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{lessons.map((lesson) => <article key={lesson.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><span className="text-[10px] font-bold uppercase tracking-[.15em] text-lime-300">{lesson.difficulty || 'beginner'}</span><h3 className="mt-3 font-extrabold">{lesson.title}</h3><p className="mt-2 text-xs leading-6 text-white/50">{lesson.description}</p></article>)}</div></div>}
      </div>
    </section>
    <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] bg-amber-300 p-8 sm:grid-cols-[1fr_auto] sm:items-center sm:p-12"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em]">Save your learning journey</p><h2 className="public-display mt-3 text-3xl font-extrabold tracking-[-.04em]">Create a learner account when you’re ready.</h2><p className="mt-2 text-sm text-[#34483c]/65">{completed ? 'Nice work — your quiz attempt is ready to save.' : 'Guests can play freely. Login makes progress, badges and review available.'}</p></div><a href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#101a14] px-6 py-4 text-sm font-extrabold text-white"><LockKeyhole className="h-4 w-4 text-lime-300" /> ERP login</a></div></section>
  </div>;
}
function Quiz({ letters, onComplete }: { letters: Letter[]; onComplete: () => void }) { const [answer, setAnswer] = useState<string | null>(null); const question = letters[0]; const options = useMemo(() => letters.slice(0, 3), [letters]); return <div className="mt-6"><h3 className="public-display text-2xl font-extrabold">Which card starts the lab?</h3><p className="mt-2 text-sm text-white/50">Choose the configured first card to check your recognition.</p><div className="mt-6 grid grid-cols-3 gap-2">{options.map((option) => <button key={option.id} onClick={() => { setAnswer(option.id); if (option.id === question?.id) onComplete(); }} className={`rounded-xl border p-4 font-olchiki text-3xl transition ${answer === option.id ? option.id === question?.id ? 'border-lime-300 bg-lime-300 text-[#0b1710]' : 'border-red-300 bg-red-300/20' : 'border-white/10 hover:bg-white/10'}`}>{option.character}</button>)}</div>{answer && <p className="mt-5 flex items-center gap-2 text-sm font-bold text-lime-300">{answer === question?.id ? <Check className="h-4 w-4" /> : 'Try again — the first card is highlighted by the lesson order.'}</p>}</div>; }
