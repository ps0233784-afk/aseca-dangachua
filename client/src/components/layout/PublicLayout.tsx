import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, GraduationCap, LogIn } from 'lucide-react';

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-gray-900 text-lg leading-tight">ASECA</div>
                <div className="text-xs text-gray-500">Dangachua Branch</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/about" current={location.pathname}>About</NavLink>
              <NavLink to="/schools" current={location.pathname}>Schools</NavLink>
              <NavLink to="/dictionary" current={location.pathname}>Dictionary</NavLink>
              <NavLink to="/olchiki-lab" current={location.pathname}>Ol Chiki Lab</NavLink>
              <NavLink to="/managing-body" current={location.pathname}>Managing Body</NavLink>
              <NavLink to="/notices" current={location.pathname}>Notices</NavLink>
              <NavLink to="/events" current={location.pathname}>Events</NavLink>
              <NavLink to="/gallery" current={location.pathname}>Gallery</NavLink>
              <NavLink to="/contact" current={location.pathname}>Contact</NavLink>
            </div>

            {/* Auth Button */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn-ghost">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/20 animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/schools" onClick={() => setMobileOpen(false)}>Schools</MobileNavLink>
              <MobileNavLink to="/dictionary" onClick={() => setMobileOpen(false)}>Dictionary</MobileNavLink>
              <MobileNavLink to="/olchiki-lab" onClick={() => setMobileOpen(false)}>Ol Chiki Lab</MobileNavLink>
              <MobileNavLink to="/managing-body" onClick={() => setMobileOpen(false)}>Managing Body</MobileNavLink>
              <MobileNavLink to="/notices" onClick={() => setMobileOpen(false)}>Notices</MobileNavLink>
              <MobileNavLink to="/events" onClick={() => setMobileOpen(false)}>Events</MobileNavLink>
              <MobileNavLink to="/gallery" onClick={() => setMobileOpen(false)}>Gallery</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileNavLink>
              <div className="pt-3 border-t border-gray-200">
                <Link to="/login" className="btn-primary w-full" onClick={() => setMobileOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-lg">BRANCH ASECA DANGACHUA</div>
                  <div className="text-sm text-gray-400">Education • Culture • Community</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                Adivasi Socio-Educational & Cultural Association, Odisha. Promoting Santali education through Ol Chiki script, preserving indigenous culture, and strengthening Adivasi communities across Kendujhar district.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/schools" className="block hover:text-white transition">Our Schools</Link>
                <Link to="/dictionary" className="block hover:text-white transition">Santali Dictionary</Link>
                <Link to="/olchiki-lab" className="block hover:text-white transition">Ol Chiki Lab</Link>
                <Link to="/managing-body" className="block hover:text-white transition">Managing Body</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>At-Dangachua, P.O.-Bidyadharpur</p>
                <p>P.S.-Soso, Dist-Kendujhar</p>
                <p>PIN-758078, Odisha</p>
                <p className="pt-2">
                  <a href="mailto:info@branchasecadangachua.org" className="hover:text-white transition">
                    info@branchasecadangachua.org
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© 2026 BRANCH ASECA DANGACHUA. All rights reserved.</p>
            <p className="mt-1">
              ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ ᱠᱮᱱᱫᱩᱡᱷᱟᱹᱨ, ᱩᱰᱤᱥᱟ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, current, children }: { to: string; current: string; children: React.ReactNode }) {
  const isActive = current === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'text-brand-600 bg-brand-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
    >
      {children}
    </Link>
  );
}
