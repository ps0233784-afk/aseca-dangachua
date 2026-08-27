import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { Button, Field, Input } from '../components/ui';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@aseca.org');
  const [password, setPassword] = useState('admin@123');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/app');
    } catch (err: any) {
      setErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M0 30 L15 15 L30 30 L45 15 L60 30' fill='none' stroke='%23D97706' stroke-width='2'/%3E%3C/svg%3E")`,
      }} />
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Back to website
        </Link>
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center text-gold-light text-3xl font-bold font-olchiki shadow-lg">ᱚ</div>
            <h1 className="mt-4 text-xl font-bold text-forest-dark">ERP Sign In</h1>
            <p className="font-olchiki text-slate-500 text-sm mt-1">ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ — BRANCH ASECA DANGACHUA</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email Address">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="you@aseca.org" required />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9 pr-10" type={show ? 'text' : 'password'} value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {err && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{err}</div>}
            <Button type="submit" size="lg" className="w-full justify-center" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In to Dashboard'}
            </Button>
          </form>
          <div className="mt-6 bg-forest-50 rounded-xl p-4 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-forest-dark mb-1">Demo credentials</div>
            <div>Central Admin: <code className="bg-white px-1.5 py-0.5 rounded">admin@aseca.org / admin@123</code></div>
            <div>Branch Admin: <code className="bg-white px-1.5 py-0.5 rounded">branch@aseca.org / branch@123</code></div>
            <div>Headmaster: <code className="bg-white px-1.5 py-0.5 rounded">bhagaban@aseca.org / school@123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
