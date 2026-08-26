import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface OrgInfo {
  id: number;
  name: string;
  short_name: string;
  tagline: string;
  logo: string | null;
  favicon: string | null;
  hero_image: string | null;
  address?: string;
  village?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  established_year?: number;
  about?: string;
  mission?: string;
  vision?: string;
  footer_text?: string;
  social?: Record<string, string> | null;
  theme?: { primary: string; secondary: string; accent: string; radius: number; darkDefault: boolean } | null;
  stats_overrides?: Record<string, number> | null;
}

interface BrandCtx {
  org: OrgInfo | null;
  languages: { enabled: string[]; default: string; olchiki_enabled: boolean };
  stats: { schools: number; students: number; teachers: number; staff: number; years: number };
  refresh: () => void;
}

const BrandContext = createContext<BrandCtx>({
  org: null,
  languages: { enabled: ['en'], default: 'en', olchiki_enabled: true },
  stats: { schools: 0, students: 0, teachers: 0, staff: 0, years: 0 },
  refresh: () => {},
});
export function useBrand() { return useContext(BrandContext); }

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [languages, setLanguages] = useState({ enabled: ['en'], default: 'en', olchiki_enabled: true });
  const [stats, setStats] = useState({ schools: 0, students: 0, teachers: 0, staff: 0, years: 0 });

  const refresh = useCallback(() => {
    api('/api/public/bootstrap')
      .then((res: any) => {
        setOrg(res.data.org);
        setLanguages(res.data.languages || { enabled: ['en'], default: 'en', olchiki_enabled: true });
        setStats(res.data.stats || { schools: 0, students: 0, teachers: 0, staff: 0, years: 0 });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Apply brand colours as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (org?.theme?.primary) root.style.setProperty('--brand-primary', org.theme.primary);
    if (org?.theme?.secondary) root.style.setProperty('--brand-secondary', org.theme.secondary);
    if (org?.theme?.accent) root.style.setProperty('--brand-accent', org.theme.accent);
    if (org?.theme?.radius) root.style.setProperty('--brand-radius', `${org.theme.radius}px`);
  }, [org]);

  return <BrandContext.Provider value={{ org, languages, stats, refresh }}>{children}</BrandContext.Provider>;
}
