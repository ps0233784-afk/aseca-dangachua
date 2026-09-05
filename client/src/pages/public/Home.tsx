import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Languages,
  Leaf,
  MapPin,
  Quote,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { fallbackSchools, organization } from '../../lib/publicData';

const pillars = [
  {
    number: '01',
    icon: Languages,
    title: 'Learn in your language',
    description: 'Santali-first learning with Ol Chiki at the centre, so children begin with confidence and a strong sense of identity.',
    color: 'lime',
  },
  {
    number: '02',
    icon: GraduationCap,
    title: 'Grow through education',
    description: 'Committed teachers, connected schools and practical academic support for every learner in our community.',
    color: 'amber',
  },
  {
    number: '03',
    icon: Users,
    title: 'Lead with community',
    description: 'Families, educators and managing committees working together to build accountable, joyful local schools.',
    color: 'blue',
  },
];

const values = ['OL CHIKI', 'COMMUNITY', 'SANTALI', 'EDUCATION', 'IDENTITY', 'CULTURE'];

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#f4f2e9]">
      <section className="home-hero relative min-h-[760px] overflow-hidden bg-[#08110c] text-white lg:min-h-screen">
        <div className="public-grid absolute inset-0 opacity-25" />
        <div className="public-orb public-orb-one" />
        <div className="absolute -right-20 top-28 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[100px]" />

        <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-16 px-5 pb-20 pt-32 sm:px-8 lg:min-h-screen lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:pb-16 lg:pt-28 xl:px-16">
          <div className="relative z-10 max-w-3xl">
            <div className="hero-enter hero-enter-one public-kicker mb-7"><span />{organization.registration} · Odisha</div>
            <h1 className="hero-enter hero-enter-two public-display text-[clamp(3.4rem,7.2vw,7.4rem)] font-extrabold leading-[0.88] tracking-[-0.07em]">
              Education that
              <br />
              <em className="relative not-italic text-lime-300">
                feels like home.
                <svg className="absolute -bottom-3 left-1 h-3 w-[96%] text-lime-300/60" viewBox="0 0 500 18" fill="none" aria-hidden="true"><path d="M3 13C109 3 247 3 497 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>
              </em>
            </h1>
            <p className="hero-enter hero-enter-three mt-9 max-w-xl text-base leading-8 text-white/62 sm:text-lg">
              Community-led schools where Santali children learn through Ol Chiki, stay rooted in culture and grow ready for the world.
            </p>
            <p className="hero-enter hero-enter-three mt-4 font-olchiki text-lg text-lime-200/80">{organization.olChikiName}</p>

            <div className="hero-enter hero-enter-four mt-9 flex flex-wrap gap-3">
              <Link to="/schools" className="inline-flex items-center gap-3 rounded-full bg-lime-300 px-6 py-4 text-sm font-extrabold text-[#08110c] transition hover:bg-lime-200 sm:px-7">
                Explore our schools <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:px-7">
                Our story <ArrowRight className="h-4 w-4 text-lime-300" />
              </Link>
            </div>

            <div className="hero-enter hero-enter-four mt-12 flex items-center gap-6 border-t border-white/10 pt-7">
              <div className="flex -space-x-3" aria-hidden="true">
                {['ᱚ', 'ᱛ', 'ᱜ', 'ᱞ'].map((letter, index) => (
                  <span key={letter} className={`grid h-11 w-11 place-items-center rounded-full border-2 border-[#08110c] font-olchiki text-lg font-bold ${index % 2 ? 'bg-amber-300 text-[#182018]' : 'bg-emerald-700 text-white'}`}>{letter}</span>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ol Chiki ready</p>
                <p className="mt-1 text-xs text-white/40">Language, learning and identity—together.</p>
              </div>
            </div>
          </div>

          <div className="hero-enter hero-enter-three relative z-10 mx-auto w-full max-w-[650px] lg:mx-0">
            <div className="hero-image-shell relative ml-auto aspect-[4/4.45] max-h-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#132219] shadow-[0_35px_100px_rgba(0,0,0,.45)] sm:rounded-[3rem]">
              <img
                src="/images/aseca-learning-hero.jpg"
                alt="Santali students learning together near their community school"
                className="h-full w-full object-cover object-[62%_center]"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07100b]/90 via-transparent to-[#07100b]/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-300">Learning together</p>
                    <p className="public-display mt-2 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">Rooted here. Ready everywhere.</p>
                  </div>
                  <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-lime-300 text-[#08110c] sm:grid"><ArrowUpRight className="h-5 w-5" /></span>
                </div>
              </div>
            </div>

            <div className="hero-float-card absolute -left-4 top-[14%] rounded-2xl border border-white/10 bg-[#14251a]/90 p-4 shadow-2xl backdrop-blur-xl sm:-left-12 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-300 text-[#17221c]"><School className="h-5 w-5" /></span>
                <div><strong className="block text-lg leading-none">3</strong><span className="text-[10px] text-white/50">Ol-Itun Ashras</span></div>
              </div>
            </div>
            <div className="hero-float-card hero-float-delayed absolute -right-2 top-[54%] rounded-2xl border border-white/10 bg-[#14251a]/90 p-4 shadow-2xl backdrop-blur-xl sm:-right-10 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-300 text-[#17221c]"><BookOpen className="h-5 w-5" /></span>
                <div><strong className="block text-lg leading-none">23+</strong><span className="text-[10px] text-white/50">Young learners</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-[#122018]/10 bg-lime-300 py-4 text-[#0b1510]">
        <div className="value-track flex min-w-max items-center gap-8">
          {[...values, ...values].map((value, index) => (
            <div key={`${value}-${index}`} className="flex items-center gap-8">
              <span className="text-[11px] font-extrabold tracking-[0.24em]">{value}</span>
              <Sparkles className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <div className="public-kicker public-kicker-dark mb-5"><span />Why ASECA</div>
              <h2 className="public-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-[#101a14] sm:text-6xl">A stronger start,<br /><em className="not-italic text-emerald-700">in every village.</em></h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#34483c]/70 lg:justify-self-end lg:text-lg">
              Our schools bring education closer to home without asking children to leave language or culture behind. Each classroom connects academic learning with belonging, care and community participation.
            </p>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {pillars.map(({ number, icon: Icon, title, description, color }) => (
              <article key={number} className={`pillar-card pillar-${color} group relative min-h-[390px] overflow-hidden rounded-[2rem] border border-[#15251b]/10 p-7 transition duration-500 hover:-translate-y-2 sm:p-9`}>
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#132019]/10 bg-white/50"><Icon className="h-6 w-6" /></span>
                  <span className="public-display text-sm font-extrabold opacity-35">{number}</span>
                </div>
                <div className="absolute inset-x-7 bottom-8 sm:inset-x-9 sm:bottom-9">
                  <h3 className="public-display max-w-xs text-3xl font-extrabold leading-[1.02] tracking-[-0.035em]">{title}</h3>
                  <p className="mt-5 text-sm leading-7 opacity-65">{description}</p>
                  <Link to={number === '01' ? '/about' : number === '02' ? '/schools' : '/managing-body'} className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em]">Learn more <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b1710] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10">
        <div className="public-grid absolute inset-0 opacity-20" />
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <div className="public-kicker mb-5"><span />Our learning network</div>
              <h2 className="public-display text-5xl font-extrabold leading-[0.95] tracking-[-0.055em] sm:text-7xl">Three schools.<br /><em className="not-italic text-lime-300">One shared purpose.</em></h2>
            </div>
            <div className="lg:pb-2">
              <p className="text-base leading-8 text-white/55">Each Ol-Itun Ashra is shaped by its village and connected by a shared commitment to Santali-medium learning.</p>
              <Link to="/schools" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-lime-300">View school directory <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
            {fallbackSchools.map((school, index) => (
              <Link key={school.id} to="/schools" className="school-row group grid gap-5 py-7 transition hover:bg-white/[0.025] sm:grid-cols-[70px_1fr_auto] sm:items-center sm:px-5">
                <span className="public-display text-3xl font-bold text-white/20 transition group-hover:text-lime-300">0{index + 1}</span>
                <div>
                  <h3 className="public-display text-xl font-bold tracking-[-0.02em] sm:text-2xl">{school.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-white/40"><MapPin className="h-3.5 w-3.5 text-lime-300" />{school.village}, {school.district} · Est. {school.established_year}</p>
                </div>
                <div className="flex items-center gap-5 sm:justify-end">
                  <span className="hidden text-right text-xs text-white/35 md:block">Headmaster<br /><strong className="font-semibold text-white/65">{school.principal}</strong></span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition group-hover:border-lime-300 group-hover:bg-lime-300 group-hover:text-[#0b1710]"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f2e9] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
            <div className="relative">
              <div className="aspect-[4/4.3] overflow-hidden rounded-[2.5rem] bg-amber-200">
                <img src="/images/aseca-learning-hero.jpg" alt="Students sharing a lesson" className="h-full w-full object-cover object-[70%_center]" loading="lazy" />
              </div>
              <div className="absolute -bottom-6 -right-2 max-w-[260px] rounded-3xl bg-lime-300 p-6 text-[#0b1510] shadow-2xl sm:-right-8">
                <Quote className="h-7 w-7" />
                <p className="public-display mt-4 text-lg font-extrabold leading-snug">“When children learn in their own language, they learn without fear.”</p>
              </div>
            </div>

            <div>
              <div className="public-kicker public-kicker-dark mb-5"><span />More than a classroom</div>
              <h2 className="public-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-[#101a14] sm:text-6xl">Culture is not an extra.<br /><em className="not-italic text-emerald-700">It is the foundation.</em></h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#34483c]/70">Our approach brings language, stories, local knowledge and community life into everyday education—helping learners understand where they come from and imagine where they can go.</p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {['Ol Chiki literacy', 'Santali-medium learning', 'Community governance', 'Safe student records'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#132019]/10 bg-white/55 px-4 py-4 text-sm font-bold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-800 text-lime-300"><Check className="h-3.5 w-3.5" /></span>{item}
                  </div>
                ))}
              </div>
              <Link to="/about" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#101a14] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-emerald-900">Discover our mission <ChevronRight className="h-4 w-4 text-lime-300" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-amber-300 px-7 py-16 text-[#101a14] sm:px-14 sm:py-20 lg:px-20">
          <div className="absolute -right-10 -top-20 font-olchiki text-[18rem] font-bold leading-none text-[#101a14]/[0.05]" aria-hidden="true">ᱚ</div>
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em]">Build the next chapter with us</p>
              <h2 className="public-display mt-5 max-w-3xl text-5xl font-extrabold leading-[0.96] tracking-[-0.055em] sm:text-6xl">Every learner deserves a school that knows their name—and their language.</h2>
            </div>
            <Link to="/contact" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#101a14] px-7 py-4 text-sm font-extrabold text-white transition hover:bg-emerald-900">Connect with ASECA <ArrowUpRight className="h-4 w-4 text-lime-300" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
