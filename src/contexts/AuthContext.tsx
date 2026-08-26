import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, getToken, setToken } from '../lib/api';

export interface User {
  id: number;
  org_id: number;
  school_id: number | null;
  role_id: number;
  role_key: string;
  role_name: string;
  name: string;
  username: string;
  email: string | null;
  phone?: string | null;
  avatar?: string | null;
  language?: string;
  theme?: string;
  status?: string;
  school?: { id: number; name: string; code: string } | null;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  can: (module: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthCtx>(null as any);
export function useAuth() { return useContext(AuthContext); }

const FULL_MODULES = ['dashboard', 'schools', 'students', 'staff', 'academics', 'attendance', 'exams', 'results',
  'report_cards', 'timetable', 'fees', 'hostel', 'library', 'notices', 'events', 'gallery', 'documents', 'certificates',
  'id_cards', 'reports', 'users', 'roles', 'settings', 'audit_logs', 'notifications', 'culture', 'achievements', 'managing_body'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const res: any = await api('/api/auth/me');
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUnauth = () => setUser(null);
    window.addEventListener('aseca:unauthorized', onUnauth);
    return () => window.removeEventListener('aseca:unauthorized', onUnauth);
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const res: any = await api('/api/auth/login', { method: 'POST', body: { username, password } });
    setToken(res.token);
    setUser(res.user);
    return res.user as User;
  }, []);

  const logout = useCallback(() => {
    api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  const can = useCallback((module: string, action = 'view') => {
    if (!user) return false;
    if (user.role_key === 'super_admin') return true;
    return true; // fine-grained checks are enforced server-side; nav visibility handled by permission map below
  }, [user]);

  const value = useMemo(() => ({ user, loading, login, logout, refresh, can }), [user, loading, login, logout, refresh, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Client-side permission map (mirrors server defaults) for hiding menu items.
export function hasPerm(user: User | null, module: string, action = 'view'): boolean {
  if (!user) return false;
  if (['super_admin', 'org_admin'].includes(user.role_key)) return true;
  const presets: Record<string, string[]> = {
    school_admin: ['dashboard','schools','students','staff','academics','attendance','exams','results','report_cards','timetable','fees','hostel','library','notices','events','gallery','documents','certificates','id_cards','reports','notifications','culture','achievements','managing_body'],
    principal: ['dashboard','schools','students','staff','academics','attendance','exams','results','report_cards','timetable','fees','hostel','library','notices','events','gallery','documents','certificates','id_cards','reports','notifications','culture','achievements','managing_body'],
    teacher: ['dashboard','students','attendance','exams','results','report_cards','timetable','notices','events','library','documents','notifications'],
    accountant: ['dashboard','students','fees','reports','notices','notifications'],
    librarian: ['dashboard','library','students','notices','notifications'],
    staff: ['dashboard','students','attendance','notices','documents','notifications'],
    student: ['dashboard','notices','events','timetable','results','documents','library','notifications'],
    parent: ['dashboard','notices','events','timetable','results','fees','documents','notifications'],
  };
  return (presets[user.role_key] || []).includes(module);
}
