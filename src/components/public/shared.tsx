import React, { useEffect, useRef, useState } from 'react';
import { useInView } from './useInView';

export function CountUp({ to, duration = 1800, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

export function SectionHeading({ kicker, title, sub, center = true, light = false }: {
  kicker?: string; title: React.ReactNode; sub?: string; center?: boolean; light?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''} mb-10 sm:mb-14`}>
      {kicker && <p className="kicker mb-3">{kicker}</p>}
      <h2 className={`section-title ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h2>
      {sub && <p className={`mt-3 text-base sm:text-lg ${light ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

export function PatternBand() {
  return (
    <div className="h-6 w-full pattern-overlay" style={{ background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' }} />
  );
}

// Fallback image while a photo loads/fails
export function Img({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
        <svg className="h-1/3 w-1/3 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5-9 9" /></svg>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErr(true)} />;
}
