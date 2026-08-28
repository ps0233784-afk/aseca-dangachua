import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api';
import {
  School, GraduationCap, Users, Library, Bell, CalendarDays, MapPin, ChevronDown,
  BookOpen, UserCog, Award, Sparkles, ArrowRight, X, Menu, LogIn, Phone, Mail,
  Target, Eye, Heart, Landmark, FlaskConical, Bus, Droplets, Wifi, Trophy, Music,
  MonitorPlay, BedDouble, UsersRound, Quote, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Data hook (existing public API only)                                */
/* ------------------------------------------------------------------ */
function useHomeData() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { get('/public/home').then(setData).catch(() => setData({})); }, []);
  return data;
}

/* Scroll reveal */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/* Animated counter */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* Smooth anchor helper for same-page sections */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.location.href = '/#' + id;
}

/* Elegant initial avatar (used until admin uploads real photos) */
function InitialAvatar({ name, ring = 'gold', size = 'md' }: { name: string; ring?: 'gold' | 'forest' | 'blue' | 'terra'; size?: 'lg' | 'md' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const grad: Record<string, string> = {
    gold: 'linear-gradient(135deg,#F59E0B,#D97706)',
    forest: 'linear-gradient(135deg,#2D6A4F,#1B4332)',
    blue: 'linear-gradient(135deg,#3B5BDB,#1E3A8A)',
    terra: 'linear-gradient(135deg,#A8422E,#7F2E1E)',
  };
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg mx-auto ${size === 'lg' ? 'w-28 h-28 text-3xl' : 'w-20 h-20 text-xl'}`}
      style={{ background: grad[ring], boxShadow: '0 10px 26px rgba(27,67,50,.22), inset 0 2px 6px rgba(255,255,255,.35)' }}
      aria-hidden
    >
      <span className="drop-shadow">{initials}</span>
    </div>
  );
}

/* Committee member portrait: shows the real uploaded photo when available,
   otherwise falls back to elegant initials. Never shows a broken image. */
function MemberPortrait({ name, photo, ring = 'gold', size = 'md' }: { name: string; photo?: string | null; ring?: 'gold' | 'forest' | 'blue' | 'terra'; size?: 'lg' | 'md' }) {
  const [failed, setFailed] = useState(false);
  const dims = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';
  if (!photo || failed) return <InitialAvatar name={name} ring={ring} size={size} />;
  return (
    <div className={`relative ${dims} mx-auto`}>
      <div className="absolute inset-0 rounded-full p-[3px]"
        style={{ background: 'conic-gradient(from 210deg, #D97706, #F59E0B, #38BDF8, #1B4332, #D97706)' }}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-[0_10px_26px_rgba(27,67,50,.25)]">
          <img
            src={photo}
            alt={`Portrait of ${name}, Managing Committee member`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

const ORG = {
  name: 'BRANCH ASECA DANGACHUA',
  full: 'Adivasi Socio-Educational & Cultural Association, Odisha',
  olchiki: 'ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ',
  tagline: 'Education • Culture • Community',
  bo: 'At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha',
  ho: 'Regd No-2667/269 of 1964, Rairangpur',
  bno: 'Regd No-77/26 of 2026',
};

/* ================================================================== */
export default function HomeNew() {
  const data = useHomeData();
  useReveal();
  const [galleryOpen, setGalleryOpen] = useState<string | null>(null);

  // Scroll to section when arriving via /#section from another public page
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const t = setTimeout(() => scrollToId(id), 350);
      return () => clearTimeout(t);
    }
  }, [data]);

  const stats = data?.stats || {};
  const schools = data?.schools || [];
  const notices = data?.notices || [];
  const events = data?.events || [];
  const media = data?.media || [];

  return (
    <div className="bg-cream overflow-x-clip text-slate-800">
      <NAV />
      <HERO stats={stats} />
      <STATS stats={stats} />
      <ABOUT />
      <COMMITTEE committee={data?.committee || []} />
      <HEADMASTER schools={schools} />
      <ACADEMICS />
      <FACILITIES stats={stats} />
      <GALLERY media={media} open={galleryOpen} setOpen={setGalleryOpen} />
      <NOTICES notices={notices} />
      <EVENTS events={events} />
      <HERITAGE />
      <CONTACT />
      <FOOTER />
    </div>
  );
}

/* ================================================================== */
/* NAV                                                                 */
/* ================================================================== */
const NAV_LINKS = [
  { label: 'Home', id: 'home', route: '/' },
  { label: 'About', id: 'about', route: '/#about' },
  { label: 'Committee', id: 'committee', route: '/#committee' },
  { label: 'Academics', id: 'academics', route: '/#academics' },
  { label: 'Facilities', id: 'facilities', route: '/#facilities' },
  { label: 'Gallery', id: 'gallery', route: '/#gallery' },
  { label: 'Notices', id: 'notices', route: '/#notices' },
  { label: 'Contact', id: 'contact', route: '/#contact' },
];

function NAV() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (id: string) => { setOpen(false); scrollToId(id); };
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className={`flex items-center justify-between rounded-2xl px-3 sm:px-5 py-2.5 transition-all duration-300 ${scrolled ? 'glass shadow-glass' : 'bg-transparent'}`}>
          <a href="#home" onClick={(e) => { e.preventDefault(); go('home'); }} className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center text-gold-light text-2xl font-bold font-olchiki shadow-lg shrink-0">ᱚ</div>
            <div className="min-w-0">
              <div className="font-extrabold text-forest-dark leading-tight text-[13px] sm:text-base truncate">BRANCH ASECA DANGACHUA</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate font-olchiki">ᱫᱟᱸᱜᱩᱣᱟᱹ ᱥᱟᱠᱷᱟ · Kendujhar, Odisha</div>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-forest hover:bg-forest-50 transition-colors whitespace-nowrap">
                {l.label}
              </button>
            ))}
            <Link to="/login" className="ml-2 inline-flex items-center gap-2 bg-warm-gradient text-white px-4 py-2 rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <LogIn size={15} /> Staff Login
            </Link>
          </nav>
          <button className="lg:hidden p-2 text-forest" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden glass rounded-2xl mt-2 p-3 shadow-glass max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-forest-50">
                {l.label}
              </button>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 bg-warm-gradient text-white px-4 py-3 rounded-xl text-sm font-bold mt-2">
              <LogIn size={16} /> ERP Staff Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

/* ================================================================== */
/* HERO                                                                */
/* ================================================================== */
function HERO({ stats }: { stats: any }) {
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center pt-24 pb-16 bg-brand-gradient text-white overflow-hidden">
      {/* tribal + blob decorations */}
      <div className="absolute inset-0 tribal-pattern opacity-20" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/30 blur-3xl animate-drift" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-sky2/30 blur-3xl animate-drift-2" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-terra/30 blur-3xl animate-drift" />

      <div className="relative max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-10 items-center w-full">
        <div className="lg:col-span-7">
          <div className="hero-in hero-in-1 inline-flex items-center gap-2 glass-dark-card px-4 py-2 rounded-full text-xs font-semibold mb-6">
            <Sparkles size={14} className="text-gold-light" />
            <span className="text-emerald-100">Regd No-77/26 of 2026 · Kendujhar District, Odisha</span>
          </div>
          <h1 className="hero-in hero-in-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            BRANCH <span className="text-gradient">ASECA</span><br />DANGACHUA
          </h1>
          <p className="hero-in hero-in-2 font-olchiki text-emerald-200 text-lg sm:text-xl mt-4">{ORG.olchiki}</p>
          <p className="hero-in hero-in-3 text-emerald-100/90 mt-5 max-w-xl leading-relaxed text-[15px]">
            {ORG.full} — nurturing Adivasi/Santali children through <strong className="text-white">Ol-Itun Ashras</strong>,
            the <strong className="text-white">Ol Chiki script</strong>, and culturally rooted education across
            Kendujhar's villages.
          </p>
          <div className="hero-in hero-in-3 mt-3 h-px w-56 shine-line" />
          <p className="hero-in hero-in-3 mt-3 text-gold-light font-bold tracking-[0.25em] text-sm">{ORG.tagline}</p>
          <div className="hero-in hero-in-4 mt-8 flex flex-wrap gap-3">
            <button onClick={() => scrollToId('committee')} className="group inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-6 py-3.5 rounded-xl font-bold shadow-xl hover:-translate-y-0.5 transition-all">
              Explore Our Institution <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollToId('gallery')} className="inline-flex items-center gap-2 glass-dark-card hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-bold transition-all">
              View Gallery
            </button>
            <button onClick={() => scrollToId('contact')} className="inline-flex items-center gap-2 border border-white/40 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl font-bold transition-all">
              Contact Us
            </button>
          </div>
        </div>

        {/* Floating glass stat cluster */}
        <div className="lg:col-span-5 relative hidden md:block">
          <div className="relative h-[420px]">
            <div className="glass-dark-card absolute top-2 left-6 p-6 w-52 animate-float">
              <GraduationCap className="text-gold-light mb-2" size={28} />
              <div className="text-3xl font-extrabold">{stats.students ?? '—'}</div>
              <div className="text-xs text-emerald-200">Students Enrolled</div>
            </div>
            <div className="glass-dark-card absolute top-32 right-2 p-6 w-52 animate-float-slow">
              <School className="text-sky2-light mb-2" size={28} />
              <div className="text-3xl font-extrabold">{stats.schools ?? '—'}</div>
              <div className="text-xs text-emerald-200">Ol-Itun Ashras</div>
            </div>
            <div className="glass-dark-card absolute bottom-8 left-0 p-6 w-52 animate-float" style={{ animationDelay: '1.2s' }}>
              <Users className="text-gold-light mb-2" size={28} />
              <div className="text-3xl font-extrabold">{stats.teachers ?? '—'}</div>
              <div className="text-xs text-emerald-200">Dedicated Teachers</div>
            </div>
            <div className="glass-dark-card absolute bottom-24 right-6 p-6 w-48 animate-float-slow" style={{ animationDelay: '0.6s' }}>
              <Library className="text-emerald-300 mb-2" size={26} />
              <div className="text-3xl font-extrabold">{stats.books ?? '—'}</div>
              <div className="text-xs text-emerald-200">Library Books</div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-brand-gradient border-2 border-gold/60 flex items-center justify-center font-olchiki text-4xl text-gold-light shadow-2xl animate-pulse-slow" style={{ animation: 'asecapulse 4s infinite' }}>
              ᱚ
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 animate-float">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}

/* ================================================================== */
/* STATS                                                               */
/* ================================================================== */
function STATS({ stats }: { stats: any }) {
  const items = [
    { icon: School, label: 'Affiliated Schools', value: stats.schools || 0, color: 'from-forest to-forest-light' },
    { icon: GraduationCap, label: 'Active Students', value: stats.students || 0, color: 'from-royal to-royal-light' },
    { icon: Users, label: 'Teachers', value: stats.teachers || 0, color: 'from-gold to-gold-light' },
    { icon: UserCog, label: 'Support Staff', value: stats.staff || 0, color: 'from-terra to-terra-light' },
    { icon: Library, label: 'Library Books', value: stats.books || 0, color: 'from-sky2 to-sky2-light' },
    { icon: UsersRound, label: 'SMC Members', value: (stats.committees || 0) * 11, color: 'from-forest to-sky2' },
  ];
  return (
    <section className="relative -mt-14 z-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it, i) => (
          <div key={it.label} className="glass-card glass-ring p-5 text-center reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <div className={`w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${it.color} text-white flex items-center justify-center mb-2 shadow`}>
              <it.icon size={20} />
            </div>
            <div className="text-2xl font-extrabold text-forest-dark"><Counter to={it.value} /></div>
            <div className="text-[11px] text-slate-500 font-medium leading-tight">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* SECTION HEADING                                                     */
/* ================================================================== */
function SectionHead({ kicker, title, olchiki, dark }: { kicker: string; title: string; olchiki?: string; dark?: boolean }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12 reveal">
      <div className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-3 ${dark ? 'text-gold-light' : 'text-gold-dark'}`}>
        <span className="w-8 h-px bg-current" /> {kicker} <span className="w-8 h-px bg-current" />
      </div>
      <h2 className={`text-3xl sm:text-4xl font-extrabold ${dark ? 'text-white' : 'text-forest-dark'}`}>{title}</h2>
      {olchiki && <p className={`font-olchiki mt-2 text-lg ${dark ? 'text-emerald-200' : 'text-slate-500'}`}>{olchiki}</p>}
    </div>
  );
}

/* ================================================================== */
/* ABOUT                                                               */
/* ================================================================== */
function ABOUT() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Who We Are" title="About the Institution" olchiki="ᱟᱵᱳ ᱪᱮᱫᱟᱜ?" />
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong className="text-forest-dark">ADIVASI SOCIO-EDUCATIONAL &amp; CULTURAL ASSOCIATION, ODISHA (ASECA)</strong> works
              for the educational and cultural uplift of Adivasi communities — particularly the Santal people of
              Mayurbhanj &amp; Kendujhar. The <strong>Dangachua branch</strong> supervises a network of
              <strong> Ol-Itun Ashras</strong>, where children learn through the <strong>Ol Chiki script</strong> created by
              Pandit Raghunath Murmu, alongside Odia and English.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              From primary learning through Matric &amp; +2 examinations with MIL Santali Papers I–IV, to hostels, libraries,
              cultural observances and community governance, the branch keeps education rooted in identity.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest flex items-center justify-center mb-2"><Target size={20} /></div>
                <h3 className="font-bold text-forest-dark">Our Mission</h3>
                <p className="text-sm text-slate-500 mt-1">Quality, mother-tongue based education for every Adivasi child through Ol Chiki literacy.</p>
              </div>
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-royal flex items-center justify-center mb-2"><Eye size={20} /></div>
                <h3 className="font-bold text-forest-dark">Our Vision</h3>
                <p className="text-sm text-slate-500 mt-1">Self-reliant, culturally proud communities empowered by education and heritage.</p>
              </div>
            </div>
          </div>
          <div className="reveal">
            <div className="glass-card glass-ring p-6 relative">
              <div className="absolute -top-3 left-6 bg-warm-gradient text-white text-xs font-bold px-3 py-1 rounded-full shadow">Heritage &amp; Identity</div>
              <div className="tribal-pattern-dark h-3 rounded mb-5 opacity-60" />
              <div className="space-y-4">
                {[
                  { icon: Landmark, t: 'Registered Institution', d: 'H.O. Regd No-2667/269 of 1964, Rairangpur · B.O. Regd No-77/26 of 2026, Dangachua' },
                  { icon: BookOpen, t: 'Ol Chiki Medium', d: 'Santali in Ol Chiki script with MIL Santali Papers I–IV, Odia & English' },
                  { icon: Heart, t: 'Community Governed', d: 'Statutory 11-member School Managing Committee in every Ol-Itun Ashra' },
                  { icon: Music, t: 'Cultural Vibrancy', d: 'Ol Chiki Divas, Santal Hul remembrance, sports & cultural programmes' },
                ].map((f) => (
                  <div key={f.t} className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow"><f.icon size={19} /></div>
                    <div>
                      <div className="font-bold text-forest-dark text-sm">{f.t}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* MANAGING COMMITTEE                                                  */
/* ================================================================== */
function COMMITTEE({ committee }: { committee: any[] }) {
  const schools = Array.from(new Map(committee.map((m) => [m.school_id, { id: m.school_id, name: m.school_name, ol: m.school_olchiki }])).values());
  const [active, setActive] = useState<number>(schools[0]?.id ?? 1);
  useEffect(() => { if (!schools.find((s) => s.id === active) && schools[0]) setActive(schools[0].id); }, [committee.length]);
  const members = (committee.filter((m) => m.school_id === active) || []).slice(0, 11);
  const ringFor = (d: string) =>
    d === 'Chairman' ? 'gold' : d === 'Secretary' ? 'blue' : d === 'Headmaster' ? 'forest' : d === 'Treasurer' ? 'terra' : 'forest';
  const featured = members.filter((m) => ['Chairman', 'Secretary'].includes(m.designation));
  const rest = members.filter((m) => !['Chairman', 'Secretary'].includes(m.designation));
  const roles: Record<string, string> = {
    Chairman: 'Presides over the School Managing Committee',
    Secretary: 'Official correspondence & affiliation',
    Treasurer: 'Committee accounts & records',
    Headmaster: 'Academic head of the Ashra',
    'Asst. Teacher': 'Teaching faculty representative',
    'Lady Teacher': "Girls' welfare & faculty representative",
    'Executive Member': 'Community representative',
  };

  return (
    <section id="committee" className="relative py-24 px-4 bg-brand-gradient text-white overflow-hidden">
      <div className="absolute inset-0 tribal-pattern opacity-15" />
      <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative max-w-7xl mx-auto">
        <SectionHead dark kicker="Governance" title="School Managing Committee" olchiki="ᱥᱠᱩᱞ ᱢᱮᱱᱮᱡᱤᱝ ᱠᱟᱹᱢᱤᱴᱤ" />

        {schools.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10 reveal">
            {schools.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${active === s.id ? 'bg-gold text-white shadow-lg' : 'glass-dark-card text-emerald-100 hover:bg-white/20'}`}>
                {String(s.name).replace(/ OL-ITUN ASHRA.*$/i, '')}
              </button>
            ))}
          </div>
        )}

        {/* Featured Chairman / Secretary */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
          {featured.map((m, i) => (
            <div key={m.sl_no} className="glass-dark-card p-7 text-center reveal hover:-translate-y-1 transition-transform" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="-mt-14 mb-3"><MemberPortrait name={m.name} photo={m.photo} ring={ringFor(m.designation)} size="lg" /></div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-gold-light uppercase">{m.designation}</div>
              <h3 className="text-lg font-extrabold mt-1">{m.name}</h3>
              <p className="text-xs text-emerald-200/80 mt-1">{roles[m.designation]}</p>
            </div>
          ))}
        </div>

        {/* Other members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rest.map((m, i) => (
            <div key={m.sl_no} className="glass-dark-card p-5 text-center reveal hover:-translate-y-1 transition-transform group" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="mb-3 transition-transform duration-300 group-hover:scale-105"><MemberPortrait name={m.name} photo={m.photo} ring={ringFor(m.designation)} /></div>
              <h4 className="font-bold text-sm leading-tight">{m.name}</h4>
              <div className="inline-block mt-1.5 text-[10px] font-bold tracking-wide text-gold-light bg-white/10 px-2.5 py-0.5 rounded-full">{m.designation}</div>
              <p className="text-[11px] text-emerald-200/70 mt-2 leading-snug">{roles[m.designation] || 'Community representative'}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-emerald-200/60 mt-8 reveal">
          The statutory 11-member structure includes Chairman, Secretary, Treasurer, Headmaster, Asst. Teacher, Lady Teacher &amp; five Executive Members.
          Contact details are kept private in the branch office.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/* HEADMASTER                                                          */
/* ================================================================== */
function HEADMASTER({ schools }: { schools: any[] }) {
  const main = schools.find((s) => s.id === 1) || schools[0] || {};
  return (
    <section className="py-24 px-4 bg-cream">
      <div className="max-w-5xl mx-auto">
        <SectionHead kicker="Leadership" title="From the Headmaster's Desk" olchiki="ᱯᱨᱚᱫᱷᱟᱱ ᱟᱪᱮᱛᱤᱭᱟᱹ" />
        <div className="glass-card glass-ring p-8 grid md:grid-cols-[auto_1fr] gap-8 items-center reveal">
          <div className="text-center">
            <InitialAvatar name={main.headmaster || 'Headmaster'} ring="forest" size="lg" />
            <div className="mt-4 font-extrabold text-forest-dark">{main.headmaster || 'Headmaster'}</div>
            <div className="text-xs text-slate-500">Headmaster</div>
            <div className="text-[11px] text-gold-dark font-semibold mt-1">{String(main.name || '').split(',')[0]}</div>
          </div>
          <div>
            <Quote size={34} className="text-gold/40 mb-2" />
            <p className="text-slate-700 italic leading-relaxed">
              "Our Ol-Itun Ashras are more than schools — they are the keepers of the Ol Chiki script and of Santali
              identity. Every child who learns to read ᱚᱞ ᱪᱤᱠᱤ carries forward the dream of Pandit Raghunath Murmu.
              With the support of the managing committee, guardians and the ASECA branch, we nurture our students
              to succeed in Matric &amp; +2 while staying rooted in their culture and community."
            </p>
            <div className="mt-4 h-px w-24 bg-gold/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* ACADEMICS                                                           */
/* ================================================================== */
function ACADEMICS() {
  const cards = [
    { icon: BookOpen, title: 'Primary & Upper Primary', d: 'Foundational learning in Ol Chiki, Odia & English with activity-based teaching.', color: 'from-forest to-forest-light' },
    { icon: GraduationCap, title: 'Matric (Class X)', d: 'MIL Santali Papers I–IV, Odia & English — board-pattern assessment at the Ragudia centre.', color: 'from-royal to-royal-light' },
    { icon: Award, title: 'Higher Secondary (+2)', d: 'Senior section with MIL language papers, preparing students for higher education.', color: 'from-sky2 to-sky2-light' },
    { icon: BookOpen, title: 'Santali / Ol Chiki', d: 'MIL-I to MIL-IV Santali in Ol Chiki script — the cultural core of the curriculum.', color: 'from-gold to-gold-light' },
    { icon: FlaskConical, title: 'Examinations', d: 'SUMMER-2026-27 Matric & +2 exams with centre code, roll numbers and report cards.', color: 'from-terra to-terra-light' },
    { icon: Trophy, title: 'Co-Curricular', d: 'Calligraphy, recitation, sports and cultural events tied to the academic calendar.', color: 'from-forest to-sky2' },
  ];
  return (
    <section id="academics" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Learning Pathways" title="Academics & Curriculum" olchiki="ᱥᱮᱪᱮᱫ ᱟᱹᱛᱩ" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <div key={c.title} className="glass-card p-6 reveal group" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-4 shadow group-hover:scale-110 transition-transform`}>
                <c.icon size={22} />
              </div>
              <h3 className="font-extrabold text-forest-dark mb-1.5">{c.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FACILITIES                                                          */
/* ================================================================== */
function FACILITIES({ stats }: { stats: any }) {
  const cards = [
    { icon: MonitorPlay, title: 'Classrooms', d: 'Bright, well-ventilated Ol-Itun Ashra classrooms' },
    { icon: Library, title: 'Library', d: `${stats.books || 0}+ titles incl. Santali & Ol Chiki readers, with PDF books` },
    { icon: BedDouble, title: 'Hostel', d: `${stats.hostels || 0} residential hostels for boys & girls with wardens` },
    { icon: FlaskConical, title: 'Learning Corner', d: 'Teaching-learning materials & practical kits' },
    { icon: Trophy, title: 'Playground', d: 'Football, archery, kabaddi & athletics grounds' },
    { icon: Wifi, title: 'Digital Records', d: 'Computerised attendance, mark sheets & report cards' },
    { icon: Music, title: 'Cultural Space', d: 'Venues for Ol Chiki Divas & Santali cultural programmes' },
    { icon: Droplets, title: 'Drinking Water', d: 'Safe drinking water & mid-day meal arrangements' },
    { icon: Bus, title: 'Outreach', d: 'Branch transport & coordination across Kendujhar villages' },
  ];
  return (
    <section id="facilities" className="relative py-24 px-4 bg-gradient-to-b from-forest-50 to-cream">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Campus Life" title="Facilities" olchiki="ᱥᱩᱵᱤᱫᱷᱟ" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <div key={c.title} className="glass-card p-5 flex items-start gap-4 reveal" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="w-11 h-11 shrink-0 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow"><c.icon size={19} /></div>
              <div>
                <h3 className="font-bold text-forest-dark text-sm">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* GALLERY                                                             */
/* ================================================================== */
const GALLERY_FALLBACK = [
  { title: 'Ol Chiki Learning', glyph: 'ᱚᱞ', c: 'linear-gradient(135deg,#1B4332,#2D6A4F)' },
  { title: 'Cultural Programme', glyph: 'ᱮᱱᱮᱡ', c: 'linear-gradient(135deg,#7F2E1E,#D97706)' },
  { title: 'Classroom', glyph: 'ᱯᱟᱹᱦᱤᱴ', c: 'linear-gradient(135deg,#1E3A8A,#0284C7)' },
  { title: 'Sports Meet', glyph: 'ᱠᱷᱮᱞᱚᱸᱰ', c: 'linear-gradient(135deg,#D97706,#F59E0B)' },
  { title: 'Library', glyph: 'ᱯᱩᱛᱷᱤ', c: 'linear-gradient(135deg,#2D6A4F,#0284C7)' },
  { title: 'Branch Office', glyph: 'ᱚᱲᱟᱜ', c: 'linear-gradient(135deg,#5C1F13,#A8422E)' },
  { title: 'Community Gathering', glyph: 'ᱜᱟᱶᱛᱟ', c: 'linear-gradient(135deg,#13245C,#3B5BDB)' },
  { title: 'Festival Celebration', glyph: 'ᱯᱟᱨᱟᱵ', c: 'linear-gradient(135deg,#B45309,#F59E0B)' },
];

function GALLERY({ media, open, setOpen }: { media: any[]; open: string | null; setOpen: (v: string | null) => void }) {
  const images = media.filter((m) => m.type === 'image' && m.file_path);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  // A media image whose file is missing (uploads dir) falls back to a glyph tile.
  const validImages = images.filter((m) => !failed[m.file_path]);

  const glyphTile = (t: any, i: number) => (
    <div className="w-full flex flex-col items-center justify-center text-white" style={{ background: t.c || GALLERY_FALLBACK[i % GALLERY_FALLBACK.length].c, minHeight: i % 3 === 0 ? 320 : 200 }}>
      <span className="font-olchiki text-5xl mb-2 opacity-90 drop-shadow">{t.glyph || GALLERY_FALLBACK[i % GALLERY_FALLBACK.length].glyph}</span>
      <span className="tribal-pattern w-full h-4 opacity-40" />
    </div>
  );

  const tiles: any[] = validImages.length
    ? validImages.map((m) => ({ title: m.title, src: m.file_path }))
    : GALLERY_FALLBACK.map((g) => ({ title: g.title, glyph: g.glyph, c: g.c }));

  return (
    <section id="gallery" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Moments" title="Gallery" olchiki="ᱛᱚᱵᱤᱛᱚ" />
        {validImages.length === 0 && (
          <p className="text-center text-xs text-slate-400 -mt-6 mb-8">Photographs will appear here as the branch uploads them to the Media Library.</p>
        )}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {tiles.map((t: any, i) => (
            <button key={i} onClick={() => setOpen(t.src ? t.src : `placeholder:${t.glyph || GALLERY_FALLBACK[i % GALLERY_FALLBACK.length].glyph}`)}
              className="glass-card mb-4 block w-full overflow-hidden text-left reveal group"
              style={{ transitionDelay: `${i * 60}ms` }}>
              {t.src ? (
                <img loading="lazy" src={t.src} alt={t.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ minHeight: 200 }}
                  onError={() => setFailed((f) => ({ ...f, [t.src]: true }))} />
              ) : (
                glyphTile(t, i)
              )}
              <div className="px-4 py-3">
                <div className="text-sm font-bold text-forest-dark">{t.title}</div>
                <div className="text-[11px] text-slate-400">ASECA Dangachua</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <button className="absolute top-5 right-5 text-white p-2 glass-dark-card rounded-full" aria-label="Close preview"><X size={22} /></button>
          {open.startsWith('placeholder:') ? (
            <div className="glass-dark-card p-14 text-center text-white">
              <div className="font-olchiki text-7xl mb-3">{open.split(':')[1]}</div>
              <p className="text-emerald-200 text-sm">Photograph to be added by the branch</p>
            </div>
          ) : (
            <img src={open} alt="Gallery preview" className="max-h-[85vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain"
              onError={() => setOpen(null)} />
          )}
        </div>
      )}
    </section>
  );
}

/* ================================================================== */
/* NOTICES                                                             */
/* ================================================================== */
function NOTICES({ notices }: { notices: any[] }) {
  const list = notices || [];
  return (
    <section id="notices" className="relative py-24 px-4 bg-brand-gradient text-white overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <SectionHead kicker="Stay Informed" title="Notice Board" olchiki="ᱠᱟᱹᱣᱰᱷᱤ" />
          <p className="text-emerald-100/80 text-sm leading-relaxed reveal">Latest announcements on affiliation, examinations, SMC meetings and branch programmes across all Ol-Itun Ashras.</p>
          <Link to="/notices" className="inline-flex items-center gap-2 mt-5 bg-gold hover:bg-gold-dark text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all">
            All Notices <ArrowRight size={16} />
          </Link>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {(list.length ? list : []).slice(0, 6).map((n, i) => (
            <div key={i} className="glass-dark-card p-4 flex gap-4 items-start reveal hover:bg-white/15 transition-colors" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="w-14 shrink-0 text-center bg-warm-gradient rounded-xl py-2 shadow">
                <div className="text-xl font-extrabold leading-none">{n.date ? new Date(n.date).getDate() : '—'}</div>
                <div className="text-[9px] uppercase font-bold">{n.date ? new Date(n.date).toLocaleString('en', { month: 'short' }) : ''}</div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm">{n.title}</h3>
                  {n.priority === 'high' && <span className="text-[9px] font-bold bg-terra px-2 py-0.5 rounded-full">IMPORTANT</span>}
                </div>
                <p className="text-xs text-emerald-100/75 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
              </div>
              <span className="text-[10px] text-emerald-200/70 shrink-0 hidden sm:block">{n.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* EVENTS                                                              */
/* ================================================================== */
function EVENTS({ events }: { events: any[] }) {
  const list = (events || []).slice(0, 6);
  return (
    <section id="events" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Mark the Date" title="Events & Activities" olchiki="ᱠᱟᱹᱢᱤ ᱦᱚᱨᱟ" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((e, i) => (
            <div key={i} className="glass-card p-5 flex gap-4 reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="w-16 shrink-0 rounded-xl bg-brand-gradient text-white flex flex-col items-center justify-center py-2.5 shadow">
                <span className="text-2xl font-extrabold leading-none">{e.date ? new Date(e.date).getDate() : '—'}</span>
                <span className="text-[10px] uppercase font-bold mt-0.5">{e.date ? new Date(e.date).toLocaleString('en', { month: 'short', year: '2-digit' }) : ''}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gold-dark uppercase tracking-wide">{e.category}</div>
                <h3 className="font-bold text-forest-dark text-sm leading-tight">{e.title}</h3>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1"><MapPin size={11} /> {e.venue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CULTURAL HERITAGE                                                   */
/* ================================================================== */
function HERITAGE() {
  return (
    <section className="relative py-24 px-4 overflow-hidden bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-brand-gradient text-white p-10 sm:p-14 overflow-hidden reveal">
          <div className="absolute inset-0 tribal-pattern opacity-20" />
          <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-gold-light text-xs font-bold tracking-[0.2em] uppercase mb-3"><Sparkles size={14} /> Santali Heritage</div>
              <h2 className="text-3xl font-extrabold leading-tight">ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱥᱮᱪᱮᱫ<br />ᱟᱹᱨᱤᱪᱟᱹᱞᱤ ᱛᱮ ᱡᱤᱣᱤ</h2>
              <p className="text-emerald-100/90 text-sm mt-4 leading-relaxed">
                Education through the Ol Chiki script, life through culture. Our institutions celebrate <strong className="text-white">Ol Chiki Divas</strong>,
                remember the <strong className="text-white">Santal Hul (1855)</strong>, and keep Santal language, song and
                tradition alive in every classroom.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { g: 'ᱚ', t: 'Ol Chiki' },
                { g: 'ᱥ', t: 'Education' },
                { g: 'ᱟ', t: 'Culture' },
                { g: 'ᱜ', t: 'Community' },
                { g: 'ᱡ', t: 'Heritage' },
                { g: 'ᱥ', t: 'Identity' },
              ].map((x, i) => (
                <div key={i} className="glass-dark-card p-4 hover:-translate-y-1 transition-transform">
                  <div className="font-olchiki text-3xl text-gold-light">{x.g}</div>
                  <div className="text-[10px] text-emerald-200 mt-1 font-semibold">{x.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CONTACT                                                             */
/* ================================================================== */
function CONTACT() {
  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHead kicker="Reach Us" title="Contact the Branch" olchiki="ᱡᱚᱯᱲᱟᱣ" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card glass-ring p-7 reveal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warm-gradient text-white flex items-center justify-center shadow shrink-0"><MapPin size={22} /></div>
              <div>
                <h3 className="font-extrabold text-forest-dark">Branch Office (B.O.)</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha</p>
                <p className="text-xs text-gold-dark font-bold mt-2">{ORG.bno}</p>
              </div>
            </div>
          </div>
          <div className="glass-card glass-ring p-7 reveal" style={{ transitionDelay: '100ms' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow shrink-0"><Landmark size={22} /></div>
              <div>
                <h3 className="font-extrabold text-forest-dark">Head Office (H.O.)</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">Rairangpur, Mayurbhanj, Odisha</p>
                <p className="text-xs text-gold-dark font-bold mt-2">{ORG.ho}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 glass-card p-7 text-center reveal">
          <p className="text-slate-600 text-sm">For affiliation, SMC registration and examination enquiries, please visit or write to the Dangachua branch office.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button onClick={() => scrollToId('about')} className="inline-flex items-center gap-2 bg-forest hover:bg-forest-light text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition-all"><Mail size={16} /> Get in Touch</button>
            <Link to="/login" className="inline-flex items-center gap-2 bg-warm-gradient hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition-all"><LogIn size={16} /> Staff / ERP Login</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FOOTER                                                              */
/* ================================================================== */
function FOOTER() {
  const quick = NAV_LINKS;
  return (
    <footer className="bg-forest-dark text-emerald-100 pt-16 pb-8 px-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 tribal-pattern h-6 opacity-30" />
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-white text-2xl font-bold font-olchiki shadow">ᱚ</div>
            <div>
              <div className="font-extrabold text-white leading-tight">BRANCH ASECA DANGACHUA</div>
              <div className="font-olchiki text-emerald-300/80 text-xs">{ORG.olchiki}</div>
            </div>
          </div>
          <p className="text-emerald-200/75 leading-relaxed max-w-md text-[13px]">
            {ORG.full} — empowering Adivasi/Santali communities through Ol-Itun Ashras, Ol Chiki literacy and
            cultural preservation in Kendujhar district.
          </p>
          <p className="font-olchiki text-gold-light mt-4">ᱥᱮᱪᱮᱫ • ᱟᱹᱨᱤᱪᱟᱹᱞᱤ • ᱜᱟᱶᱛᱟ</p>
        </div>
        <div>
          <div className="font-bold text-white mb-4">Quick Links</div>
          <ul className="space-y-2">
            {quick.map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollToId(l.id)} className="text-emerald-200/75 hover:text-gold-light text-[13px] text-left">{l.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-bold text-white mb-4">Contact</div>
          <ul className="space-y-3 text-[13px] text-emerald-200/75">
            <li className="flex gap-2"><MapPin size={15} className="text-gold-light shrink-0 mt-0.5" /> Dangachua, Bidyadharpur, Soso, Kendujhar — 758078</li>
            <li className="flex gap-2"><Landmark size={15} className="text-gold-light shrink-0 mt-0.5" /> B.O. {ORG.bno}</li>
            <li className="flex gap-2"><Landmark size={15} className="text-gold-light shrink-0 mt-0.5" /> H.O. {ORG.ho}</li>
            <li><Link to="/login" className="inline-flex items-center gap-2 text-gold-light font-bold mt-1"><LogIn size={14} /> ERP Staff Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-5 text-center text-xs text-emerald-300/60">
        © {new Date().getFullYear()} ASECA Dangachua Branch · {ORG.tagline} · Ol Chiki: ᱚᱞ ᱪᱤᱠᱤ
      </div>
    </footer>
  );
}
