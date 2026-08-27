import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../auth';
import {
  LayoutDashboard, School, GraduationCap, Users, UserCog, ClipboardList, FileCheck2,
  CalendarCheck, BookOpen, BedDouble, Bell, CalendarDays, Image, LayoutTemplate,
  Award, FileSpreadsheet, ShieldCheck, ScrollText, LogOut, Menu, X, Globe,
} from 'lucide-react';
import { useState } from 'react';

const NAV: { group: string; items: { to: string; label: string; icon: any }[] }[] = [
  {
    group: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Institutions',
    items: [
      { to: '/app/schools', label: 'Schools & SMC', icon: School },
      { to: '/app/students', label: 'Students', icon: GraduationCap },
      { to: '/app/teachers', label: 'Teachers', icon: Users },
      { to: '/app/staff', label: 'Staff', icon: UserCog },
    ],
  },
  {
    group: 'Academics',
    items: [
      { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/app/exams', label: 'Exams & Mark Sheets', icon: ClipboardList },
      { to: '/app/subjects', label: 'Ol-Itun Subjects', icon: BookOpen },
      { to: '/app/timetable', label: 'Timetable', icon: CalendarDays },
    ],
  },
  {
    group: 'Facilities',
    items: [
      { to: '/app/hostel', label: 'Hostel', icon: BedDouble },
      { to: '/app/library', label: 'Library', icon: BookOpen },
    ],
  },
  {
    group: 'Website & Content',
    items: [
      { to: '/app/notices', label: 'Notice Board', icon: Bell },
      { to: '/app/events', label: 'Events', icon: CalendarDays },
      { to: '/app/media', label: 'Media Library', icon: Image },
      { to: '/app/pages', label: 'Page Builder', icon: LayoutTemplate },
    ],
  },
  {
    group: 'Administration',
    items: [
      { to: '/app/certificates', label: 'Certificates & ID Cards', icon: Award },
      { to: '/app/excel', label: 'Excel Center', icon: FileSpreadsheet },
      { to: '/app/users', label: 'Users & Roles', icon: ShieldCheck },
      { to: '/app/audit', label: 'Audit Logs', icon: ScrollText },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-white font-bold text-lg shadow-lg">ᱚ</div>
        <div>
          <div className="text-white font-bold leading-tight text-sm">BRANCH ASECA</div>
          <div className="text-emerald-200/80 text-[11px] font-olchiki leading-tight">ᱫᱟᱸᱜᱩᱣᱟᱹ ᱥᱟᱠᱷᱟ</div>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
        {NAV.map((grp) => (
          <div key={grp.group}>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">{grp.group}</div>
            <div className="space-y-0.5">
              {grp.items
                .filter((i) => !(i.to === '/app/users' || i.to === '/app/audit') || isAdmin)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/15 text-white shadow-inner' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={17} />
                    {item.label}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link to="/" className="flex items-center gap-2 text-emerald-100/80 hover:text-white text-xs mb-3 px-1">
          <Globe size={14} /> View public website
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/90 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
            <div className="text-emerald-200/70 text-[10px]">{ROLE_LABELS[user?.role || ''] || user?.role}</div>
          </div>
          <button onClick={() => { logout(); nav('/'); }} className="text-emerald-100/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-brand-gradient z-30 no-print">{sidebar}</aside>
      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 no-print">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-gradient">{sidebar}</aside>
          <button className="absolute top-4 right-4 text-white" onClick={() => setOpen(false)}><X /></button>
        </div>
      )}
      <div className="lg:ml-72">
        <header className="lg:hidden sticky top-0 z-20 bg-forest text-white flex items-center gap-3 px-4 py-3 no-print">
          <button onClick={() => setOpen(true)}><Menu /></button>
          <span className="font-bold text-sm">BRANCH ASECA DANGACHUA — ERP</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
