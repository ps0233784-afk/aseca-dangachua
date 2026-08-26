import React from 'react';
import { BookOpen, HeartHandshake, Landmark, Target, Eye } from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useI18n } from '../../lib/i18n';
import { SectionHeading } from '../../components/public/shared';
import { PageHero } from './Schools';

export default function About() {
  const { org } = useBrand();
  const { t } = useI18n();
  return (
    <div>
      <PageHero title={t('about_title')} sub={org?.tagline} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{org?.about}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="card p-5">
                <Target className="h-6 w-6 mb-3" style={{ color: 'var(--brand-primary)' }} />
                <h3 className="font-semibold mb-1">Our Mission</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{org?.mission}</p>
              </div>
              <div className="card p-5">
                <Eye className="h-6 w-6 mb-3" style={{ color: 'var(--brand-secondary)' }} />
                <h3 className="font-semibold mb-1">Our Vision</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{org?.vision}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: BookOpen, title: t('about_quality'), text: 'We provide quality education through trained teachers, structured academics, regular assessment and modern learning tools.' },
              { icon: Landmark, title: t('about_heritage'), text: 'Santali language and Ol Chiki script are taught alongside the state curriculum, keeping the community\'s identity alive.' },
              { icon: HeartHandshake, title: t('about_community'), text: 'Parents, elders and self-help groups actively participate in the development and governance of our schools.' },
            ].map((c, i) => (
              <div key={i} className="card card-hover p-6 flex gap-5">
                <div className="h-12 w-12 rounded-xl text-white flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}><c.icon className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
