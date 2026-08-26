import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, GraduationCap, Phone, Mail, MapPin, Globe, LogIn } from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../lib/i18n';
import { Logo } from '../ui/primitives';

const NAV = [
  { to: '/', key: 'nav_home' },
  { to: '/about', key: 'nav_about' },
  { to: '/managing-body', key: 'nav_managing' },
  { to: '/schools', key: 'nav_schools' },
  { to: '/academics', key: 'nav_academics' },
  { to: '/culture', key: 'nav_culture' },
  { to: '/notices', key: 'nav_notices' },
  { to: '/events', key: 'nav_events' },
  { to: '/gallery', key: 'nav_gallery' },
  { to: '/results', key: 'nav_results' },
  { to: '/contact', key: 'nav_contact' },
];

function LangSelector() {
  const { lang, setLang, t } = useI18n();
  const { languages } = useBrand();
  const opts: { id: string; label: string }[] = [
    { id: 'en', label: t('lang_en') },
    { id: 'od', label: t('lang_od') },
    { id: 'hi', label: t('lang_hi') },
    { id: 'sat', label: t('lang_sat') },
    ...(languages.olchiki_enabled ? [{ id: 'olc', label: t('lang_olc') }] : []),
  ];
  return (
    <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="input !w-auto !py-1.5 !px-2 !text-xs !rounded-lg bg-white/80">
      {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
      {resolved === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}

export default function PublicLayout() {
  const { org, languages } = useBrand();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top ribbon */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 text-[12px] text-white" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {org?.phone || '+91 94370 12345'}</span>
          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {org?.email || 'info@asecadangachua.org'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {org?.village}, {org?.district}, {org?.state}</span>
          <LangSelector />
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all ${scrolled ? 'glass shadow-soft' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <Logo name={org?.name} src={org?.logo} size={42} />
              <div className="leading-tight">
                <p className="font-extrabold text-[15px] tracking-tight" style={{ color: 'var(--brand-deep)' }}>{org?.name || 'BRANCH ASECA DANGACHUA'}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--brand-secondary)' }}>{org?.tagline || 'Education • Culture • Community'}</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'}
                  className={({ isActive }) => `px-3 py-2 rounded-lg text-[13px] font-medium transition ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  style={({ isActive }) => isActive ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
                  {t(n.key)}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/login" className="btn-primary !px-3.5 !py-2 hidden sm:inline-flex text-[13px]">
                <LogIn className="h-4 w-4" /> {t('login_erp')}
              </Link>
              <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden glass border-t border-slate-200 dark:border-slate-800 px-4 pb-4 max-h-[75vh] overflow-y-auto">
            <nav className="grid gap-1 pt-3">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'}
                  className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  style={({ isActive }) => isActive ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
                  {t(n.key)}
                </NavLink>
              ))}
              <Link to="/login" className="btn-primary mt-2"><LogIn className="h-4 w-4" /> {t('login_erp')}</Link>
              <div className="flex items-center justify-between px-1 mt-2"><LangSelector /><ThemeToggle /></div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  const { org } = useBrand();
  const { t } = useI18n();
  const links = NAV.slice(0, 11);
  const services = [
    { to: '/results', label: 'Check Result' },
    { to: '/schools', label: 'Find a School' },
    { to: '/notices', label: 'Latest Notices' },
    { to: '/gallery', label: 'Photo Gallery' },
    { to: '/login', label: 'Parent Portal' },
    { to: '/login', label: 'Staff Login' },
  ];
  return (
    <footer className="relative text-slate-300 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a2e1c, #0c4a2e 45%, #123a7a)' }}>
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Logo name={org?.name} src={org?.logo} size={46} />
            <div>
              <p className="font-bold text-white leading-tight text-sm">{org?.name}</p>
              <p className="text-[11px] text-emerald-300">{org?.tagline}</p>
            </div>
          </div>
          <p className="text-[13px] text-slate-300 leading-relaxed">{org?.footer_text || org?.about?.slice(0, 160) || 'Education • Culture • Community'}</p>
          <div className="flex gap-2 mt-4">
            {['facebook', 'twitter', 'instagram', 'youtube'].map((s) => (
              <a key={s} href={org?.social?.[s] || '#'} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold">{s[0].toUpperCase()}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('footer_quick')}</h4>
          <ul className="space-y-2.5">
            {links.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-[13px] text-slate-300 hover:text-white transition">{t(l.key)}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('footer_services')}</h4>
          <ul className="space-y-2.5">
            {services.map((s, i) => (
              <li key={i}><Link to={s.to} className="text-[13px] text-slate-300 hover:text-white transition">{s.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('footer_contact')}</h4>
          <ul className="space-y-3 text-[13px] text-slate-300">
            <li className="flex gap-2.5"><MapPin className="h-4 w-4 text-emerald-300 shrink-0" /> {org?.address || 'Dangachua, Mayurbhanj'}</li>
            <li className="flex gap-2.5"><Phone className="h-4 w-4 text-emerald-300 shrink-0" /> {org?.phone || '+91 94370 12345'}</li>
            <li className="flex gap-2.5"><Mail className="h-4 w-4 text-emerald-300 shrink-0" /> {org?.email || 'info@asecadangachua.org'}</li>
            <li className="flex gap-2.5"><Globe className="h-4 w-4 text-emerald-300 shrink-0" /> {org?.website || 'www.asecadangachua.org'}</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-slate-400">
          <p>© {new Date().getFullYear()} {org?.name || 'BRANCH ASECA DANGACHUA'}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/contact" className="hover:text-white">{t('footer_privacy')}</Link>
            <Link to="/contact" className="hover:text-white">{t('footer_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
