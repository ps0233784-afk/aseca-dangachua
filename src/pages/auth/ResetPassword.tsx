import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api } from '../../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, new_password: pw } });
      navigate('/login');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen hero-gradient relative flex items-center justify-center p-6">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl animate-fade-up">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl text-white items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}><Lock className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
        </div>
        {err && <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-sm">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Reset Token</label>
            <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste reset token" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
          </div>
          <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Resetting…' : 'Reset Password'}</button>
        </form>
        <Link to="/login" className="block text-center text-sm text-blue-600 mt-4 hover:underline">Back to login</Link>
      </div>
    </div>
  );
}
