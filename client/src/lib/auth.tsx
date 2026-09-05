import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
  phone?: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isSchoolAdmin: boolean;
  isPrincipal: boolean;
  isTeacher: boolean;
  canWrite: boolean;
  canAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aseca_token');
    if (token) {
      api.get<User>('/auth/me')
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem('aseca_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('aseca_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('aseca_token');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isOrgAdmin = user?.role === 'org_admin';
  const isSchoolAdmin = user?.role === 'school_admin';
  const isPrincipal = user?.role === 'principal';
  const isTeacher = user?.role === 'teacher';
  const canWrite = ['super_admin', 'org_admin', 'school_admin', 'principal', 'teacher'].includes(user?.role || '');
  const canAdmin = ['super_admin', 'org_admin', 'school_admin'].includes(user?.role || '');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isSuperAdmin,
      isOrgAdmin,
      isSchoolAdmin,
      isPrincipal,
      isTeacher,
      canWrite,
      canAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
