import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, HeartHandshake, Landmark, Users, GraduationCap, MapPin, Sparkles,
  Megaphone, CalendarDays, Trophy, Image as ImageIcon, Search, CheckCircle2, Languages,
  ScrollText, BookMarked, PartyPopper, TreePine, FolderOpen, History, ShieldCheck, Phone, Mail, Send,
} from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useI18n } from '../../lib/i18n';
import { api } from '../../lib/api';
import { SectionHeading, CountUp, Img } from '../../components/public/shared';
import { fmtDate } from '../../lib/format';

export default function Home() {
  const { org, stats, languages } = useBrand();
  const { t } = useI18n();
  const [members, setMembers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any>({ albums: [], photos: [] });
  const [culture, setCulture] = useState<Record<string, any>>({});

  useEffect(() => {
    api('/api/public/managing-body').then((r: any) => setMembers(r.data)).catch(() => {});
    api('/api/public/schools').then((r: any) => setSchools(r.data)).catch(() => {});
    api('/api/public/notices').then((r: any) => setNotices(r.data)).catch(() => {});
    api('/api/public/events').then((r: any) => setEvents(r.data)).catch(() => {});
    api('/api/public/achievements').then((r: any) => setAchievements(r.data)).catch(() => {});
    api('/api/public/gallery').then((r: any) => setGallery(r.data)).catch(() => {});
    api('/api/public/culture').then((r: any) => setCulture(r.data)).catch(() => {});
  }, []);

  const cultureItems = [
    { key: 'language', icon: Languages, title: 'Santali Language' },
    { key: 'olchiki', icon: ScrollText, title: 'Ol Chiki' },
    { key: 'literature', icon: BookMarked, title: 'Santali Literature' },
    { key: 'festivals', icon: PartyPopper, title: 'Festivals' },
    { key: 'knowledge', icon: TreePine, title: 'Traditional Knowledge' },
    { key: 'resources', icon: FolderOpen, title: 'Educational Resources' },
    { key: 'history', icon: History, title: 'Community History' },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0">
          <Img src={org?.hero_image} alt="ASECA" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e1c]/90 via-[#0c4a2e]/70 to-transparent" />
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold text-emerald-100">
              <Sparkles className="h-4 w-4 text-amber-300" /> {org?.tagline || 'Education • Culture • Community'}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
              {t('hero_title')}
            </h1>
            <p className="mt-5 text-lg text-emerald-50/90 max-w-xl leading-relaxed">{t('hero_sub')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/schools" className="btn-gold !px-6 !py-3.5 text-base">{t('hero_explore')} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/results" className="btn !px-6 !py-3.5 text-base text-white border border-white/40 bg-white/10 hover:bg-white/20 backdrop-blur">
                <Search className="h-4 w-4" /> {t('hero_result')}
              </Link>
            </div>
          </div>

          {/* Floating stats */}
          <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              { label: t('stat_schools'), value: stats.schools, icon: Landmark, suffix: '+' },
              { label: t('stat_students'), value: stats.students, icon: Users, suffix: '+' },
              { label: t('stat_teachers'), value: stats.teachers, icon: GraduationCap, suffix: '+' },
              { label: t('stat_community'), value: 1, icon: HeartHandshake, suffix: '' },
            ].map((s, i) => (
              <div key={i} className={`glass rounded-3xl p-6 hover:scale-[1.03] transition-transform ${i % 2 ? 'translate-y-6' : ''}`}>
                <s.icon className="h-7 w-7 text-amber-300 mb-3" />
                <p className="text-3xl font-extrabold"><CountUp to={s.value} suffix={s.suffix} /></p>
                <p className="text-sm text-emerald-100/90 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="About Us" title={t('about_title')} sub={org?.about?.slice(0, 180) || ''} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: t('about_quality'), text: 'Well-structured classrooms, trained teachers and regular assessments ensure every child learns with confidence.' },
              { icon: Landmark, title: t('about_heritage'), text: 'Santali language, Ol Chiki script and community traditions are woven into everyday learning with respect and pride.' },
              { icon: HeartHandshake, title: t('about_community'), text: 'From self-help groups to parent committees, the community participates in running and growing our schools.' },
            ].map((c, i) => (
              <div key={i} className="card card-hover p-7 group">
                <div className="h-14 w-14 rounded-2xl text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
                  <c.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-16 relative text-white hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading light title={t('stats_title')} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { v: stats.schools, l: t('stat_schools'), s: '+' },
              { v: stats.students, l: t('stat_students'), s: '+' },
              { v: stats.teachers, l: t('stat_teachers'), s: '+' },
              { v: stats.staff, l: t('stats_staff'), s: '+' },
              { v: stats.years, l: t('stats_years'), s: '' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-4xl font-extrabold text-amber-300"><CountUp to={s.v} suffix={s.s} /></p>
                <p className="text-sm text-emerald-100/90 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANAGING BODY ============ */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Leadership" title={t('managing_title')} sub="The dedicated people guiding the organisation's mission." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {members.slice(0, 6).map((m) => (
              <div key={m.id} className="card card-hover p-4 text-center">
                <div className="mx-auto h-20 w-20 rounded-full overflow-hidden mb-3" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
                  <Img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-semibold text-sm leading-tight truncate">{m.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.designation}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/managing-body" className="btn-primary !px-6">{t('managing_viewall')} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ============ SCHOOLS ============ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Our Network" title={t('schools_title')} sub="A growing network of community schools across the region." />
          <div className="grid md:grid-cols-3 gap-6">
            {schools.slice(0, 3).map((s) => (
              <div key={s.id} className="card card-hover overflow-hidden flex flex-col">
                <div className="h-40 relative">
                  <Img src={s.photo || '/uploads/gallery-school.jpg'} alt={s.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 badge bg-white/90 text-slate-700 backdrop-blur">{s.school_type}</span>
                </div>
                <div className="p-5 flex flex-col grow">
                  <h3 className="font-bold text-lg leading-snug mb-1">{s.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"><MapPin className="h-3.5 w-3.5" /> {s.village}, {s.district}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 grow">{s.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400">{s.medium}</span>
                    <Link to="/schools" className="text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>{t('schools_view')} →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CULTURE ============ */}
      <section className="py-20 sm:py-24 relative text-white hero-gradient overflow-hidden">
        <div className="absolute inset-0"><Img src="/uploads/culture-pattern.jpg" alt="" className="w-full h-full object-cover opacity-10" /></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading light kicker="Heritage" title={t('culture_title')} sub="Learning rooted in the living Santali tradition." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cultureItems.map((c, i) => (
              <div key={c.key} className={`glass rounded-2xl p-5 card-hover ${i === 6 ? 'lg:col-span-1' : ''}`}>
                <c.icon className="h-6 w-6 text-amber-300 mb-3" />
                <h3 className="font-semibold mb-1.5">{culture[c.key]?.title || c.title}</h3>
                <p className="text-sm text-emerald-50/80 line-clamp-3">{culture[c.key]?.body || ''}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/culture" className="btn-gold !px-6">Explore Santali Culture <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ============ NOTICES & EVENTS ============ */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Stay Updated" title={t('notices_title')} />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-5"><Megaphone className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} /> Latest Notices</h3>
              <div className="space-y-3">
                {notices.slice(0, 5).map((n) => (
                  <Link to="/notices" key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] opacity-80">{fmtDate(n.publish_at || n.created_at).split(' ')[1]}</span>
                      <span className="text-sm font-bold leading-none">{fmtDate(n.publish_at || n.created_at).split(' ')[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-blue-600 transition">{n.title}</p>
                      <span className="text-[11px] text-slate-400">{n.category}</span>
                    </div>
                  </Link>
                ))}
                {notices.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No notices published yet.</p>}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-5"><CalendarDays className="h-5 w-5" style={{ color: 'var(--brand-secondary)' }} /> {t('events_upcoming')}</h3>
              <div className="space-y-3">
                {events.slice(0, 5).map((e) => (
                  <Link to="/events" key={e.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] opacity-80">{fmtDate(e.event_date).split(' ')[1]}</span>
                      <span className="text-sm font-bold leading-none">{fmtDate(e.event_date).split(' ')[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-emerald-600 transition">{e.title}</p>
                      <span className="text-[11px] text-slate-400">{e.category} • {e.venue}</span>
                    </div>
                  </Link>
                ))}
                {events.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No upcoming events.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACHIEVEMENTS ============ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Milestones" title={t('achievements_title')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.slice(0, 6).map((a) => (
              <div key={a.id} className="card card-hover p-5 flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shrink-0"><Trophy className="h-5 w-5" /></div>
                <div>
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mb-1.5">{a.category}</span>
                  <p className="font-semibold leading-snug">{a.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Moments" title={t('gallery_title')} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {gallery.photos.slice(0, 5).map((p: any) => (
              <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                <Img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                  <span className="text-white text-xs font-medium">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8"><Link to="/gallery" className="btn-outline !px-6"><ImageIcon className="h-4 w-4" /> View Full Gallery</Link></div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 relative text-white hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <ShieldCheck className="h-12 w-12 text-amber-300 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight">{t('cta_title')}</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/schools" className="btn-gold !px-7 !py-3.5 text-base">{t('cta_explore')}</Link>
            <Link to="/contact" className="btn !px-7 !py-3.5 text-base text-white border border-white/40 bg-white/10 hover:bg-white/20">{t('cta_contact')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
