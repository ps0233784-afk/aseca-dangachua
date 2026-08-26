import React, { useEffect, useState } from 'react';
import { User as UserIcon, KeyRound, MonitorSmartphone, Save, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/toast';
import { Avatar, Field, PageLoader } from '../../components/ui/primitives';
import { fmtDateTime } from '../../lib/format';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [tab, setTab] = useState<'profile' | 'password' | 'sessions'>('profile');
  const [form, setForm] = useState({ name: '', phone: '', language: 'en', theme: 'system' });
  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setForm({ name: user?.name || '', phone: user?.phone || '', language: user?.language || 'en', theme: user?.theme || 'system' }); }, [user]);
  useEffect(() => { if (tab === 'sessions') api('/api/auth/sessions').then((r: any) => setSessions(r.data)).finally(() => setLoading(false)); }, [tab]);

  const saveProfile = async () => {
    await api('/api/auth/profile', { method: 'PUT', body: form });
    toast('success', 'Profile updated');
    refresh();
  };

  const changePassword = async () => {
    try {
      await api('/api/auth/change-password', { method: 'POST', body: pw });
      toast('success', 'Password changed successfully');
      setPw({ current_password: '', new_password: '' });
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="card p-6 flex items-center gap-5">
        <Avatar name={user?.name} src={user?.avatar} size={72} />
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-sm text-slate-500">{user?.email} • {user?.role_name}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {([['profile', 'Profile', UserIcon], ['password', 'Password', KeyRound], ['sessions', 'Sessions', MonitorSmartphone]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}><I className="h-4 w-4" /> {l}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 space-y-4">
          <Field label="Full Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Language"><select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>{[['en', 'English'], ['od', 'Odia'], ['hi', 'Hindi'], ['sat', 'Santali']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Theme"><select className="input" value={form.theme} onChange={(e) => { setForm({ ...form, theme: e.target.value }); setTheme(e.target.value as any); }}>{[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <button className="btn-primary" onClick={saveProfile}><Save className="h-4 w-4" /> Save Profile</button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card p-6 space-y-4">
          <Field label="Current Password"><input type="password" className="input" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} /></Field>
          <Field label="New Password (min 6 chars)"><input type="password" className="input" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} /></Field>
          <button className="btn-primary" onClick={changePassword}><KeyRound className="h-4 w-4" /> Change Password</button>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="card overflow-hidden">
          {loading ? <PageLoader /> : (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Device / Browser</th><th className="th">IP</th><th className="th">Last Active</th><th className="th">Status</th><th className="th"></th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="td text-xs max-w-[220px] truncate">{s.user_agent || 'Unknown device'}</td>
                    <td className="td text-xs">{s.ip || '—'}</td>
                    <td className="td text-xs">{fmtDateTime(s.last_active)}</td>
                    <td className="td">{s.is_current ? <span className="badge bg-emerald-100 text-emerald-700">Current</span> : <span className="badge bg-slate-100 text-slate-500">Active</span>}</td>
                    <td className="td">{!s.is_current && <button className="text-rose-500" onClick={() => api(`/api/auth/sessions/${s.id}`, { method: 'DELETE' }).then(() => api('/api/auth/sessions').then((r: any) => setSessions(r.data)))}><X className="h-4 w-4" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
