import React, { useState } from 'react';
import { Search, QrCode, Award, School, User, BookOpen, Printer } from 'lucide-react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fmtDate } from '../../lib/format';
import { PageHero } from './Schools';

export default function Results() {
  const { t } = useI18n();
  const [roll, setRoll] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!roll.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res: any = await api(`/api/public/result-search?roll=${encodeURIComponent(roll.trim())}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Result not found');
    } finally {
      setLoading(false);
    }
  };

  const verifyUrl = result
    ? `${window.location.origin}/api/public/verify-result?student_id=${result.student.student_id}&exam_id=${result.exam.id}`
    : '';

  return (
    <div>
      <PageHero title={t('results_title')} sub="Enter your Roll Number, Student ID or Admission Number" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <form onSubmit={search} className="card p-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input !pl-10 !py-3" value={roll} onChange={(e) => setRoll(e.target.value)} placeholder={t('results_placeholder')} />
          </div>
          <button className="btn-primary !px-6 !py-3" disabled={loading}>{loading ? 'Searching…' : t('results_search')}</button>
        </form>
        {error && <div className="mt-6 card p-6 text-center text-rose-500 text-sm">{error}</div>}

        {result && (
          <div className="mt-6 space-y-6 animate-fade-up">
            {/* Student header */}
            <div className="card overflow-hidden">
              <div className="p-6 text-white" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{result.student.name}</h2>
                    <p className="text-sm opacity-90 mt-1">Roll No: {result.student.roll_no} • ID: {result.student.student_id}</p>
                    <p className="text-sm opacity-90"><School className="h-3.5 w-3.5 inline mr-1" />{result.student.school} — {result.student.class}</p>
                  </div>
                  <div className="text-center bg-white/15 rounded-2xl px-5 py-3 backdrop-blur">
                    <p className="text-4xl font-extrabold">{result.result.percentage}%</p>
                    <p className="text-sm">Grade {result.result.grade}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-sm !px-3 !py-1">
                    {result.result.result_status === 'pass' ? '✅ PASSED' : '❌ NOT PASSED'}
                  </span>
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-sm !px-3 !py-1">{result.exam.name}</span>
                  {result.result.rank && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-sm !px-3 !py-1">Rank #{result.result.rank}</span>}
                </div>
                <button onClick={() => window.print()} className="btn-outline !py-1.5 !px-3 text-xs"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
            </div>

            {/* Subject table */}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr><th className="th">Subject</th><th className="th text-center">Full Marks</th><th className="th text-center">Pass Marks</th><th className="th text-center">Marks</th><th className="th text-center">Grade</th><th className="th text-center">Result</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.subjects.map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="td font-medium">{s.subject_name}</td>
                      <td className="td text-center">{s.full_marks}</td>
                      <td className="td text-center">{s.pass_marks}</td>
                      <td className="td text-center font-semibold">{s.total}</td>
                      <td className="td text-center"><span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{s.grade}</span></td>
                      <td className="td text-center">{s.total >= s.pass_marks ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                    <td className="td">Total</td><td className="td text-center">{result.result.max_marks}</td><td className="td text-center">—</td>
                    <td className="td text-center">{result.result.total_marks}</td><td className="td text-center">{result.result.grade}</td><td className="td text-center">{result.result.result_status.toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QR verification */}
            <div className="card p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0">
                <img src={`/api/qr?text=${encodeURIComponent(verifyUrl)}`} alt="Verification QR" className="h-28 w-28 rounded-xl" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold flex items-center gap-2 justify-center sm:justify-start"><QrCode className="h-5 w-5" /> QR Verification</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Scan this QR code to verify the authenticity of this result. This is a secure, tamper-proof verification link.</p>
                <p className="text-[11px] text-slate-400 mt-2 break-all">{verifyUrl}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
