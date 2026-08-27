import { Outlet, NavLink, Link } from 'react-router-dom';
import { Menu, X, LogIn, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/schools', label: 'Schools' },
  { to: '/notices', label: 'Notices' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Top strip */}
      <div className="bg-forest-dark text-emerald-100 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap justify-between gap-2">
          <span className="font-olchiki">ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ, ᱠᱮᱱᱫᱩᱡᱷᱟᱹᱨ</span>
          <span>Education • Culture • Community</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 glass shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-gold-light text-2xl font-bold font-olchiki shadow-lg">ᱚ</div>
            <div>
              <div className="font-extrabold text-forest-dark leading-tight text-sm sm:text-base">BRANCH ASECA DANGACHUA</div>
              <div className="text-[11px] text-slate-500 leading-tight">Adivasi Socio-Educational &amp; Cultural Association, Odisha</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-forest text-white' : 'text-slate-700 hover:bg-forest-50 hover:text-forest'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" className="ml-2 inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-semibold shadow">
              <LogIn size={15} /> ERP Login
            </Link>
          </nav>
          <button className="md:hidden p-2 text-forest" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-forest-50">
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-gold">ERP Login →</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-forest-dark text-emerald-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center text-white text-xl font-bold font-olchiki">ᱚ</div>
              <div className="font-bold text-white">BRANCH ASECA DANGACHUA</div>
            </div>
            <p className="text-emerald-200/80 leading-relaxed">
              ADIVASI SOCIO-EDUCATIONAL &amp; CULTURAL ASSOCIATION, ODISHA (ASECA) — empowering Adivasi/Santali
              communities through Ol-Itun Ashras, Ol Chiki literacy, and cultural preservation in Kendujhar district.
            </p>
            <p className="font-olchiki mt-3 text-emerald-200/70">ᱥᱮᱪᱮᱫ • ᱟᱹᱨᱤᱪᱟᱹᱞᱤ • ᱜᱟᱶᱛᱟ</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Offices</div>
            <div className="space-y-2 text-emerald-200/80">
              <div><span className="text-gold-light font-semibold">H.O.:</span> Regd No-2667/269 of 1964, Rairangpur</div>
              <div><span className="text-gold-light font-semibold">B.O.:</span> Regd No-77/26 of 2026, At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Quick Links</div>
            <div className="space-y-2">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="block text-emerald-200/80 hover:text-gold-light">{l.label}</Link>
              ))}
              <Link to="/login" className="block text-gold-light font-semibold">ERP Login</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-emerald-300/60">
          © {new Date().getFullYear()} ASECA Dangachua Branch · Ol Chiki: ᱚᱞ ᱪᱤᱠᱤ · Built for Education, Culture &amp; Community
        </div>
      </footer>
    </div>
  );
}

export function ContactStrip() {
  return (
    <div className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><MapPin size={13} className="text-terra" /> Dangachua, Bidyadharpur, Soso, Kendujhar — 758078</span>
        <span className="flex items-center gap-1.5"><Phone size={13} className="text-forest" /> Branch helpline via branch office</span>
        <span className="flex items-center gap-1.5"><Mail size={13} className="text-royal" /> info@aseca.org</span>
      </div>
    </div>
  );
}
