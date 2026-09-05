import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from 'lucide-react';
import { organization } from '../../lib/publicData';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Schools', to: '/schools' },
  { label: 'Managing Body', to: '/managing-body' },
  { label: 'Contact', to: '/contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="public-shell min-h-screen bg-[#f4f2e9] text-[#17221c]">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'px-3 pt-3 sm:px-5' : ''}`}>
        <div className={`mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 transition-all duration-300 sm:px-8 ${scrolled ? 'rounded-2xl border border-white/10 bg-[#0b1510]/90 shadow-2xl shadow-black/20 backdrop-blur-xl' : 'border-b border-white/10'}`}>
          <Link to="/" className="group flex min-w-0 items-center gap-3 text-white" aria-label="ASECA Dangachua home">
            <span className="public-logo-mark grid h-11 w-11 shrink-0 place-items-center rounded-full border border-lime-300/40 bg-lime-300 font-olchiki text-2xl font-bold text-[#0c1711] transition group-hover:rotate-6">ᱚ</span>
            <span className="min-w-0">
              <strong className="public-display block truncate text-sm font-extrabold tracking-[-0.02em] sm:text-base">ASECA DANGACHUA</strong>
              <span className="block truncate text-[9px] font-bold uppercase tracking-[0.2em] text-white/45 sm:text-[10px]">Education · Culture · Community</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-[13px] font-semibold transition ${isActive ? 'bg-white/10 text-lime-300' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-xs font-extrabold text-[#0b1510] transition hover:bg-lime-200 sm:inline-flex">
              ERP Login <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mx-3 mt-2 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1510]/95 p-3 shadow-2xl backdrop-blur-xl sm:mx-5 lg:hidden">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold transition ${isActive ? 'bg-lime-300 text-[#0b1510]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                {item.label}<ArrowUpRight className="h-4 w-4" />
              </NavLink>
            ))}
            <Link to="/login" className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4 text-sm font-bold text-white">
              ERP Login <LogIn className="h-4 w-4 text-lime-300" />
            </Link>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="relative overflow-hidden bg-[#07100b] text-white">
        <div className="public-grid absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 lg:px-10">
          <div className="grid gap-14 border-b border-white/10 pb-16 lg:grid-cols-[1.35fr_.65fr_.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-lime-300 font-olchiki text-2xl font-bold text-[#0b1510]">ᱚ</span>
                <div>
                  <strong className="public-display block text-lg font-extrabold">{organization.name}</strong>
                  <span className="text-xs text-white/45">{organization.olChikiName}</span>
                </div>
              </div>
              <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
                Community-led education that keeps Santali language, Ol Chiki learning and Adivasi identity at the heart of every classroom.
              </p>
              <div className="mt-7 flex gap-3">
                {[Facebook, Instagram].map((Icon, index) => (
                  <a key={index} href="#" aria-label={index === 0 ? 'Facebook' : 'Instagram'} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-lime-300 hover:text-lime-300">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300">Explore</p>
              <div className="space-y-3">
                {navigation.slice(1).map((item) => (
                  <Link key={item.to} to={item.to} className="block text-sm font-medium text-white/55 transition hover:translate-x-1 hover:text-white">{item.label}</Link>
                ))}
                <Link to="/login" className="block text-sm font-medium text-white/55 transition hover:translate-x-1 hover:text-white">ERP Portal</Link>
              </div>
            </div>

            <div>
              <p className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300">Get in touch</p>
              <div className="space-y-4 text-sm text-white/55">
                <a href={`mailto:${organization.email}`} className="flex items-start gap-3 transition hover:text-white"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />{organization.email}</a>
                <a href={`tel:${organization.phone.replace(/\s/g, '')}`} className="flex items-start gap-3 transition hover:text-white"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />{organization.phone}</a>
                <p className="flex items-start gap-3 leading-6"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />{organization.address}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-7 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {organization.name}. All rights reserved.</p>
            <p>{organization.registration} · Kendujhar, Odisha</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
