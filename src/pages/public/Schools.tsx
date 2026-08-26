import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Search, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Img } from '../../components/public/shared';
import { useI18n } from '../../lib/i18n';
import { useBrand } from '../../contexts/BrandContext';

export default function Schools() {
  const { t } = useI18n();
  const { org } = useBrand();
  const [schools, setSchools] = useState<any[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api('/api/public/schools').then((r: any) => setSchools(r.data)).catch(() => {});
  }, []);

  const filtered = schools.filter((s) =>
    !q || `${s.name} ${s.village} ${s.block} ${s.medium} ${s.school_type}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHero title={t('schools_title')} sub={`${schools.length} schools serving the community of ${org?.block}, ${org?.district}`} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="max-w-xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input !pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('schools_search')} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className="card card-hover overflow-hidden flex flex-col">
              <div className="h-44 relative">
                <Img src={s.photo || '/uploads/gallery-school.jpg'} alt={s.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge bg-white/90 text-slate-700">{s.school_type}</span>
              </div>
              <div className="p-5 flex flex-col grow">
                <h3 className="font-bold text-lg leading-snug">{s.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{s.code} • Est. {s.established_year}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-2"><MapPin className="h-3.5 w-3.5 text-emerald-600" /> {s.address}, {s.village}, {s.district}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-3 grow">{s.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 py-2"><p className="font-bold text-lg">{s.student_count}</p><p className="text-[10px] text-slate-400">Students</p></div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 py-2"><p className="font-bold text-lg">{s.teacher_count}</p><p className="text-[10px] text-slate-400">Teachers</p></div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                  <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{s.medium}</span>
                  <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Principal: {s.principal_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-slate-400 py-16">No schools match your search.</p>}
      </div>
    </div>
  );
}

export function PageHero({ title, sub, image }: { title: string; sub?: string; image?: string | null }) {
  return (
    <section className="relative py-24 text-white hero-gradient overflow-hidden">
      {image && <div className="absolute inset-0"><Img src={image} alt="" className="w-full h-full object-cover opacity-20" /></div>}
      <div className="absolute inset-0 pattern-overlay" />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold">{title}</h1>
        {sub && <p className="mt-4 text-lg text-emerald-100/90">{sub}</p>}
      </div>
    </section>
  );
}
