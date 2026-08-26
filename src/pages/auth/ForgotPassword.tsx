import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { api } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      const res: any = await api('/api/auth/forgot-password', { method: 'POST', body: { email } });
      setMsg(res.message || 'Reset link sent');
      if (res.demoResetToken) setToken(res.demoResetToken);
    } catch (err: any) { setMsg(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen hero-gradient relative flex items-center justify-center p-6">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl animate-fade-up">
        <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl text-white items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}><KeyRound className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="email" className="input !pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
        </form>
        {msg && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{msg}</p>}
        {token && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-xs text-amber-700 dark:text-amber-300">
            Demo mode: your reset token is <code className="font-bold">{token}</code> —{' '}
            <Link className="underline" to={`/reset-password?token=${token}`}>continue to reset</Link>
          </div>
        )}
      </div>
    </div>
  );
}
