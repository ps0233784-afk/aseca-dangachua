import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrand } from '../../contexts/BrandContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo, Spinner } from '../../components/ui/primitives';

export default function Login() {
  const { login } = useAuth();
  const { org } = useBrand();
  const { resolved, setTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(username.trim(), password);
      navigate(user.role_key === 'student' || user.role_key === 'parent' ? '/app/portal' : '/app');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden hero-gradient">
      <div className="absolute inset-0 pattern-overlay" />
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-3">
          <Logo name={org?.name} src={org?.logo} size={48} />
          <div>
            <p className="font-extrabold text-lg leading-tight">{org?.name}</p>
            <p className="text-sm text-emerald-200">{org?.tagline}</p>
          </div>
        </Link>
        <div className="max-w-lg">
          <GraduationCap className="h-12 w-12 text-amber-300 mb-4" />
          <h1 className="text-4xl font-extrabold leading-tight mb-4">Education • Culture • Community</h1>
          <p className="text-emerald-100/90 text-lg">A modern multi-school ERP for the ASECA network — managing schools, students, exams, fees and community, powered by technology rooted in Santali heritage.</p>
          <div className="flex gap-6 mt-8">
            {['10+ Schools', '1000+ Students', '100+ Teachers'].map((s) => (
              <div key={s} className="glass rounded-2xl px-4 py-3 text-sm font-semibold">{s}</div>
            ))}
          </div>
        </div>
        <p className="text-emerald-200/70 text-sm">© {new Date().getFullYear()} {org?.name}. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <button onClick={() => navigate('/')} className="absolute top-5 left-5 flex items-center gap-2 text-white/90 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </button>
        <button onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')} className="absolute top-5 right-5 text-white/90 text-sm hover:text-white">
          {resolved === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl animate-fade-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl text-white mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">ERP Login</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to the secure admin portal</p>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-sm">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email / Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input className="input !pl-10" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="superadmin" autoComplete="username" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type={show ? 'text' : 'password'} className="input !pl-10 !pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="h-4 w-4" />{!show && <span className="absolute inset-0 flex items-center justify-center"><EyeOff className="h-4 w-4" /></span>}</button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full !py-3" disabled={busy}>
              {busy ? <Spinner /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
            <Link to="/" className="text-slate-500 hover:text-slate-700">Student/Parent?</Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[11px] text-slate-400 text-center">Demo accounts — password <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Admin@123</code></p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
              {[['superadmin', 'Super Admin'], ['schooladmin', 'School Admin'], ['teacher', 'Teacher']].map(([u, r]) => (
                <button key={u} onClick={() => setUsername(u)} className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-left">
                  <span className="block font-semibold truncate">{u}</span><span className="text-slate-400">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
