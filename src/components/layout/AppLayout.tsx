import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, School, Users, UserCog, BookOpen, CalendarCheck, ClipboardList, FileText,
  CalendarDays, Wallet, Building2, LibraryBig, Megaphone, PartyPopper, Images, FolderOpen,
  Award, FileBadge, IdCard, BarChart3, ShieldCheck, KeyRound, Settings, ScrollText, Bell,
  Search, Sun, Moon, Menu, X, LogOut, User as UserIcon, Languages, ChevronDown, GraduationCap, Home, ArrowLeft, BookOpenCheck,
} from 'lucide-react';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useBrand } from '../../contexts/BrandContext';
import { useToast } from '../ui/toast';
import { api } from '../../lib/api';
import { Avatar, Logo } from '../ui/primitives';
import { timeAgo } from '../../lib/format';

const GROUPS: { label: string; items: { to: string; icon: any; label: string; module: string }[] }[] = [
  { label: 'Overview', items: [{ to: '/app', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' }] },
  {
    label: 'School', items: [
      { to: '/app/schools', icon: School, label: 'Schools', module: 'schools' },
      { to: '/app/students', icon: Users, label: 'Students', module: 'students' },
      { to: '/app/staff', icon: UserCog, label: 'Teachers & Staff', module: 'staff' },
      { to: '/app/academics', icon: BookOpen, label: 'Classes & Subjects', module: 'academics' },
      { to: '/app/attendance', icon: CalendarCheck, label: 'Attendance', module: 'attendance' },
      { to: '/app/timetable', icon: CalendarDays, label: 'Timetable', module: 'timetable' },
    ],
  },
  {
    label: 'Academics & Exams', items: [
      { to: '/app/exams', icon: ClipboardList, label: 'Exams & Results', module: 'exams' },
      { to: '/app/report-cards', icon: FileText, label: 'Report Cards', module: 'report_cards' },
    ],
  },
  {
    label: 'Finance & Facilities', items: [
      { to: '/app/fees', icon: Wallet, label: 'Fees', module: 'fees' },
      { to: '/app/hostel', icon: Building2, label: 'Hostel', module: 'hostel' },
      { to: '/app/library', icon: LibraryBig, label: 'Library', module: 'library' },
    ],
  },
  {
    label: 'Communication', items: [
      { to: '/app/notices', icon: Megaphone, label: 'Notices', module: 'notices' },
      { to: '/app/events', icon: PartyPopper, label: 'Events', module: 'events' },
      { to: '/app/gallery', icon: Images, label: 'Gallery', module: 'gallery' },
      { to: '/app/documents', icon: FolderOpen, label: 'Documents', module: 'documents' },
      { to: '/app/certificates', icon: FileBadge, label: 'Certificates', module: 'certificates' },
      { to: '/app/id-cards', icon: IdCard, label: 'ID Cards', module: 'id_cards' },
    ],
  },
  {
    label: 'Culture & Community', items: [
      { to: '/app/culture', icon: Languages, label: 'Santali Culture', module: 'culture' },
      { to: '/app/achievements', icon: Award, label: 'Achievements', module: 'achievements' },
      { to: '/app/managing-body', icon: Users, label: 'Managing Body', module: 'managing_body' },
    ],
  },
  {
    label: 'Administration', items: [
      { to: '/app/reports', icon: BarChart3, label: 'Reports', module: 'reports' },
      { to: '/app/users', icon: ShieldCheck, label: 'Users', module: 'users' },
      { to: '/app/roles', icon: KeyRound, label: 'Roles & Permissions', module: 'roles' },
      { to: '/app/settings', icon: Settings, label: 'Settings', module: 'settings' },
      { to: '/app/audit', icon: ScrollText, label: 'Audit Logs', module: 'audit_logs' },
    ],
  },
];

const PORTAL_ITEMS = [
  { to: '/app/portal', icon: LayoutDashboard, label: 'My Portal', module: 'dashboard' },
  { to: '/app/notices', icon: Megaphone, label: 'Notices', module: 'notices' },
  { to: '/app/events', icon: PartyPopper, label: 'Events', module: 'events' },
  { to: '/app/timetable', icon: CalendarDays, label: 'Timetable', module: 'timetable' },
  { to: '/app/exams', icon: BookOpenCheck, label: 'Results', module: 'results' },
  { to: '/app/fees', icon: Wallet, label: 'Fees', module: 'fees' },
  { to: '/app/documents', icon: FolderOpen, label: 'Documents', module: 'documents' },
  { to: '/app/library', icon: LibraryBig, label: 'Library', module: 'library' },
];

function isPortalRole(key: string) {
  return ['student', 'parent'].includes(key);
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { org } = useBrand();
  const { resolved, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const portal = user ? isPortalRole(user.role_key) : false;

  useEffect(() => {
    if (user && ['super_admin', 'org_admin'].includes(user.role_key)) {
      api('/api/schools').then((r: any) => setSchools(r.data)).catch(() => {});
    }
  }, [user]);

  const switchSchool = (schoolId: number | null) => {
    localStorage.setItem('aseca_active_school', schoolId == null ? '' : String(schoolId));
    window.dispatchEvent(new Event('aseca:school-switch'));
    toast('success', schoolId ? 'School switched' : 'Showing all schools');
  };

  const activeSchoolId = localStorage.getItem('aseca_active_school');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Logo name={org?.name} src={org?.logo} size={38} />
          <div className="leading-tight min-w-0">
            <p className="font-extrabold text-[13px] truncate" style={{ color: 'var(--brand-deep)' }}>{org?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">Multi-School ERP</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {portal ? (
            <nav className="space-y-1">
              {PORTAL_ITEMS.filter((i) => hasPerm(user, i.module)).map((i) => (
                <SideLink key={i.to} {...i} />
              ))}
            </nav>
          ) : (
            GROUPS.map((g) => {
              const items = g.items.filter((i) => hasPerm(user, i.module));
              if (!items.length) return null;
              return (
                <div key={g.label}>
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{g.label}</p>
                  <nav className="space-y-0.5">
                    {items.map((i) => <SideLink key={i.to} {...i} />)}
                  </nav>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 shrink-0">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Home className="h-4 w-4" /> Back to Website
          </Link>
          <Link to="/app/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <UserIcon className="h-4 w-4" /> My Profile
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 glass border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-3 px-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Menu className="h-5 w-5" /></button>

          {!portal && user.role_key === 'super_admin' && (
            <div className="hidden sm:block">
              <SchoolSwitcher schools={schools} active={activeSchoolId} onChange={switchSchool} />
            </div>
          )}

          <div className="flex-1" />

          <button onClick={() => setSearchOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 w-64">
            <Search className="h-4 w-4" /> <span className="flex-1 text-left">Search…</span> <kbd className="text-[10px] border border-slate-300 dark:border-slate-600 rounded px-1.5">/</kbd>
          </button>

          <NotificationsBell open={notifOpen} setOpen={setNotifOpen} notifs={notifs} setNotifs={setNotifs} />

          <button onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <UserMenu user={user} onLogout={() => { logout(); navigate('/'); }} />
        </header>

        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function SideLink({ to, icon: Icon, label }: { to: string; icon: any; label: string; module: string }) {
  return (
    <NavLink to={to} end={to === '/app'}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${isActive ? 'text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      style={({ isActive }) => isActive ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
      <Icon className="h-4.5 w-4.5" /> {label}
    </NavLink>
  );
}

function SchoolSwitcher({ schools, active, onChange }: { schools: any[]; active: string | null; onChange: (id: number | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium shadow-sm hover:shadow">
        <School className="h-4 w-4 text-emerald-600" />
        <span className="max-w-[180px] truncate">{active ? schools.find((s) => String(s.id) === active)?.name || 'School' : 'All Schools'}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-80 z-20 card p-2 max-h-96 overflow-y-auto animate-fade-up">
            <button onClick={() => { onChange(null); setOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${!active ? 'bg-emerald-50 dark:bg-emerald-900/30 font-semibold' : ''}`}>
              🏛️ All Schools
            </button>
            {schools.map((s) => (
              <button key={s.id} onClick={() => { onChange(s.id); setOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${String(active) === String(s.id) ? 'bg-emerald-50 dark:bg-emerald-900/30 font-semibold' : ''}`}>
                <span className="block truncate font-medium">{s.name}</span>
                <span className="text-[11px] text-slate-400">{s.code} • {s.medium}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsBell({ open, setOpen, notifs, setNotifs }: any) {
  const [unread, setUnread] = useState(0);
  const load = () => api('/api/notifications').then((r: any) => { setNotifs(r.data); setUnread(r.unread); }).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { if (open) load(); }, [open]);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 z-20 card overflow-hidden animate-fade-up">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="font-semibold text-sm">Notifications</p>
              <button onClick={() => { api('/api/notifications/read', { method: 'POST', body: { all: true } }).then(load); }} className="text-xs text-blue-600 hover:underline">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifs.length === 0 && <p className="text-sm text-slate-400 text-center py-10">No notifications</p>}
              {notifs.map((n: any) => (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex items-start gap-2">
                    {n.is_important && <span className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 truncate">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 pl-1">
        <Avatar name={user.name} src={user.avatar} size={34} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 z-20 card overflow-hidden animate-fade-up">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mt-1.5">{user.role_name}</span>
            </div>
            <div className="p-2">
              <button onClick={() => { setOpen(false); navigate('/app/profile'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile & Security</button>
              <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!q) { setRes(null); return; }
    const t = setTimeout(() => api(`/api/search?q=${encodeURIComponent(q)}`).then((r: any) => setRes(r.data)).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const groups = res ? [
    ['Students', res.students, (s: any) => navigate(`/app/students/${s.id}`)],
    ['Teachers', res.teachers, (s: any) => navigate('/app/staff')],
    ['Schools', res.schools, (s: any) => navigate('/app/schools')],
    ['Classes', res.classes, () => navigate('/app/academics')],
    ['Notices', res.notices, () => navigate('/app/notices')],
    ['Books', res.books, () => navigate('/app/library')],
  ] : [];
  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl card overflow-hidden animate-fade-up">
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input autoFocus className="flex-1 py-4 text-sm bg-transparent outline-none" placeholder="Search students, teachers, schools, notices, books…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!res && <p className="text-sm text-slate-400 text-center py-8">Type to search across the whole system…</p>}
          {res && groups.every((g) => !(g[1] as any[]).length) && <p className="text-sm text-slate-400 text-center py-8">No results for “{q}”</p>}
          {groups.map(([label, items, go]: any) => items?.length ? (
            <div key={label} className="mb-2">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              {items.map((it: any) => (
                <button key={it.id} onClick={() => { onClose(); go(it); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm flex items-center justify-between">
                  <span className="truncate">{it.name || it.title}</span>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">{it.student_id || it.employee_id || it.code || it.author || ''}</span>
                </button>
              ))}
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  );
}
