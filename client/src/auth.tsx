import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getToken, setToken, post, get } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  school_id: number | null;
  phone?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canWrite: boolean;
  isAdmin: boolean;
  roles: Record<string, string>;
}

const Ctx = createContext<AuthCtx>(null as any);

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Central Administrator',
  admin: 'Branch Administrator',
  principal: 'Headmaster / Principal',
  teacher: 'Teacher',
  staff: 'Staff',
  viewer: 'Viewer',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      get<User>('/auth/me')
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const canWrite = !!user && ['super_admin', 'admin', 'principal'].includes(user.role);
  const isAdmin = !!user && ['super_admin', 'admin'].includes(user.role);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, canWrite, isAdmin, roles: ROLE_LABELS }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
