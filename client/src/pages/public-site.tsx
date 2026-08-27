import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api';
import { School, Bell, CalendarDays, BookOpen, Users, GraduationCap, Library, MapPin, ChevronRight, Award } from 'lucide-react';

function usePublicHome() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { get('/public/home').then(setData).catch(() => setData({})); }, []);
  return data;
}

function HeroPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.13]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M0 40 L20 20 L40 40 L60 20 L80 40' fill='none' stroke='%23F59E0B' stroke-width='2.5'/%3E%3Cpath d='M0 70 L20 50 L40 70 L60 50 L80 70' fill='none' stroke='%23FFFFFF' stroke-width='1.5'/%3E%3C/svg%3E")`,
    }} />
  );
}

export function HomePage() {
  const data = usePublicHome();
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-gradient text-white overflow-hidden">
        <HeroPattern />
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <Award size={14} className="text-gold-light" /> Regd No-77/26 of 2026 · Kendujhar, Odisha
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              BRANCH <span className="text-gold-light">ASECA</span> DANGACHUA
            </h1>
            <p className="font-olchiki text-emerald-200 text-lg mt-3">
              ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ ᱠᱮᱱᱫᱩᱡᱷᱟᱹᱨ
            </p>
            <p className="mt-5 text-emerald-100/90 leading-relaxed max-w-xl">
              Adivasi Socio-Educational &amp; Cultural Association, Odisha — administering Ol-Itun Ashras and
              higher secondary schools for Adivasi/Santali communities through Ol Chiki literacy,
              cultural pride and community-driven education.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/schools" className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-xl font-semibold shadow-lg inline-flex items-center gap-2">
                Our Schools <ChevronRight size={17} />
              </Link>
              <Link to="/about" className="bg-white/10 hover:bg-white/20 border border-white/25 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
                About ASECA
              </Link>
            </div>
            <p className="mt-6 text-sm text-gold-light font-semibold tracking-wide">Education • Culture • Community</p>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: School, label: 'Affiliated Schools', key: 'schools', color: 'bg-white/10' },
              { icon: GraduationCap, label: 'Students', key: 'students', color: 'bg-white/10' },
              { icon: Users, label: 'Teachers', key: 'teachers', color: 'bg-white/10' },
              { icon: Library, label: 'Library Books', key: 'books', color: 'bg-white/10' },
            ].map((s) => (
              <div key={s.key} className="glass-dark rounded-2xl p-6">
                <s.icon size={28} className="text-gold-light mb-3" />
                <div className="text-3xl font-extrabold">{data?.stats?.[s.key] ?? '—'}</div>
                <div className="text-sm text-emerald-200/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <svg className="relative block w-full text-cream" viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0 60 L1440 60 L1440 20 Q720 60 0 20 Z" fill="currentColor" /></svg>
      </section>

      {/* About strip */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Ol Chiki Education', text: 'Santali-medium Ol-Itun Ashras with MIL Santali Papers I–IV, Odia and English — preserving the script of Pandit Raghunath Murmu.', color: 'text-forest bg-forest-50' },
            { icon: Users, title: 'Community Governance', text: 'Every school runs a statutory 11-member School Managing Committee (SMC) — Chairman, Secretary, Treasurer, Headmaster and executive members.', color: 'text-royal bg-blue-50' },
            { icon: Award, title: 'Culture & Heritage', text: 'Santal Hul remembrance, Ol Chiki Divas, sports and cultural programmes bind education with Adivasi identity across Kendujhar.', color: 'text-terra bg-orange-50' },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-glass transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${c.color.split(' ')[1]} ${c.color.split(' ')[0]} flex items-center justify-center mb-4`}><c.icon size={24} /></div>
              <h3 className="font-bold text-forest-dark text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Schools */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle title="Affiliated Ol-Itun Ashras" olchiki="ᱚᱞ ᱤᱴᱩᱱ ᱟᱥᱨᱟ" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {(data?.schools || []).map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-slate-100 shadow-card overflow-hidden hover:shadow-glass transition-shadow bg-cream">
                <div className="bg-brand-gradient p-5 text-white">
                  <div className="font-bold leading-tight">{s.name}</div>
                  <div className="font-olchiki text-emerald-200 text-sm mt-1">{s.ol_chiki_name}</div>
                </div>
                <div className="p-5 text-sm space-y-2 text-slate-600">
                  <div className="flex items-start gap-2"><MapPin size={15} className="text-terra mt-0.5 shrink-0" /> At-{s.village}, P.O.-{s.po}, P.S.-{s.ps}, Dist-{s.district}, PIN-{s.pin}</div>
                  <div><span className="font-semibold text-slate-700">Headmaster:</span> {s.headmaster}</div>
                  <div className="flex items-center gap-4 pt-2 text-xs">
                    <span className="bg-forest-50 text-forest px-2.5 py-1 rounded-full font-semibold">{s.student_count} students</span>
                    <span className="bg-amber-50 text-gold-dark px-2.5 py-1 rounded-full font-semibold">{s.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notices + Events */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-8">
        <div>
          <SectionTitle title="Notice Board" icon={<Bell size={22} className="text-terra" />} />
          <div className="mt-6 space-y-3">
            {(data?.notices || []).map((n: any, i: number) => (
              <Link to="/notices" key={i} className="block bg-white rounded-xl p-4 shadow-card border-l-4 border-gold hover:shadow-glass transition-shadow">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-forest-dark text-sm">{n.title}</span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.date}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.body}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle title="Upcoming Events" icon={<CalendarDays size={22} className="text-royal" />} />
          <div className="mt-6 space-y-3">
            {(data?.events || []).map((e: any, i: number) => (
              <Link to="/events" key={i} className="flex gap-4 bg-white rounded-xl p-4 shadow-card hover:shadow-glass transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-warm-gradient text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(e.date).toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div>
                  <div className="font-semibold text-forest-dark text-sm">{e.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{e.venue}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, olchiki, icon }: { title: string; olchiki?: string; icon?: any }) {
  return (
    <div className="motif-border inline-block">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-bold text-forest-dark">{title}</h2>
      </div>
      {olchiki && <p className="font-olchiki text-slate-500 text-sm mt-1">{olchiki}</p>}
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-forest-dark motif-border inline-block">About ASECA</h1>
      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed text-[15px]">
        <p>
          <strong className="text-forest-dark">ADIVASI SOCIO-EDUCATIONAL &amp; CULTURAL ASSOCIATION, ODISHA (ASECA)</strong> is a
          registered association working for the educational, social and cultural uplift of Adivasi communities —
          particularly the Santal people of Odisha's Mayurbhanj and Kendujhar districts.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border-t-4 border-forest">
            <div className="font-semibold text-forest-dark mb-1">Head Office</div>
            <p className="text-sm">Regd No-2667/269 of 1964<br />Rairangpur, Odisha</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-card border-t-4 border-gold">
            <div className="font-semibold text-forest-dark mb-1">Branch Office — Dangachua</div>
            <p className="text-sm">Regd No-77/26 of 2026<br />At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078</p>
          </div>
        </div>
        <p>
          The Dangachua branch supervises a network of <strong>Ol-Itun Ashras</strong> — Santali-medium schools where children
          learn through the <strong>Ol Chiki script</strong> (created by Pandit Raghunath Murmu), alongside Odia and English.
          The branch conducts Matric and +2 examinations with MIL Santali Papers I–IV, maintains statutory 11-member
          School Managing Committees, hostels and libraries, and organises cultural observances such as Ol Chiki Divas
          and Santal Hul Memorial Day.
        </p>
        <p className="font-olchiki text-lg text-forest bg-forest-50 rounded-2xl p-5">
          ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱥᱮᱪᱮᱫ, ᱟᱹᱨᱤᱪᱟᱹᱞᱤ ᱛᱮ ᱡᱤᱣᱤ, ᱜᱟᱶᱛᱟ ᱥᱟᱶ ᱥᱟᱶᱛᱮ ᱞᱟᱦᱟ᱾
        </p>
      </div>
    </div>
  );
}

export function PublicSchools() {
  const data = usePublicHome();
  return (
    <div className="max-w-7xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-forest-dark motif-border inline-block">Our Schools</h1>
      <p className="text-slate-600 mt-4 max-w-2xl text-sm">Ol-Itun Ashras affiliated to and monitored by the Dangachua branch.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {(data?.schools || []).map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="bg-brand-gradient p-5 text-white">
              <div className="font-bold">{s.name}</div>
              <div className="font-olchiki text-emerald-200 text-sm mt-1">{s.ol_chiki_name}</div>
            </div>
            <div className="p-5 text-sm text-slate-600 space-y-1.5">
              <div><strong>Village (At):</strong> {s.village}</div>
              <div><strong>P.O.:</strong> {s.po} · <strong>P.S.:</strong> {s.ps}</div>
              <div><strong>District:</strong> {s.district} · <strong>PIN:</strong> {s.pin}</div>
              <div><strong>Headmaster:</strong> {s.headmaster}</div>
              <div className="pt-2"><span className="bg-forest-50 text-forest px-2.5 py-1 rounded-full text-xs font-semibold">{s.student_count} enrolled students</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicNotices() {
  const data = usePublicHome();
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-forest-dark motif-border inline-block">Notice Board</h1>
      <div className="mt-8 space-y-4">
        {(data?.notices || []).map((n: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card border-l-4 border-terra">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-bold text-forest-dark">{n.title}</span>
              <span className="text-xs text-slate-400">{n.date} · {n.category}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicEvents() {
  const data = usePublicHome();
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-forest-dark motif-border inline-block">Events Calendar</h1>
      <div className="mt-8 space-y-4">
        {(data?.events || []).map((e: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-brand-gradient text-white flex flex-col items-center justify-center shrink-0">
              <span className="text-xl font-bold leading-none">{new Date(e.date).getDate()}</span>
              <span className="text-[10px] uppercase mt-1">{new Date(e.date).toLocaleString('en', { month: 'short' })} {new Date(e.date).getFullYear()}</span>
            </div>
            <div>
              <div className="font-bold text-forest-dark">{e.title}</div>
              <div className="text-xs text-gold-dark font-semibold mt-0.5">{e.venue}</div>
              <p className="text-sm text-slate-600 mt-1">{e.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-forest-dark motif-border inline-block">Reach Us</h1>
      <div className="grid sm:grid-cols-2 gap-6 mt-10">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-forest-dark mb-3 flex items-center gap-2"><MapPin size={18} className="text-terra" /> Branch Office (B.O.)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso,<br />
            Dist-Kendujhar, PIN-758078, Odisha<br />
            <strong>Regd No-77/26 of 2026</strong>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-forest-dark mb-3 flex items-center gap-2"><MapPin size={18} className="text-forest" /> Head Office (H.O.)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rairangpur, Mayurbhanj, Odisha<br />
            <strong>Regd No-2667/269 of 1964</strong>
          </p>
        </div>
      </div>
      <div className="mt-6 bg-brand-gradient text-white rounded-2xl p-8 text-center">
        <p className="font-olchiki text-xl text-gold-light">ᱥᱮᱪᱮᱫ • ᱟᱹᱨᱤᱪᱟᱹᱞᱤ • ᱜᱟᱶᱛᱟ</p>
        <p className="mt-2 text-emerald-100/90 text-sm">For school affiliation, SMC registration and examination enquiries, contact the Dangachua branch office.</p>
        <Link to="/login" className="inline-block mt-5 bg-gold hover:bg-gold-dark px-6 py-2.5 rounded-xl font-semibold text-white">ERP Staff Login</Link>
      </div>
    </div>
  );
}
