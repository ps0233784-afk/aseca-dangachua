import React, { useEffect, useState } from 'react';
import { Languages, ScrollText, BookMarked, PartyPopper, TreePine, FolderOpen, History } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, Img } from '../../components/public/shared';
import { useI18n } from '../../lib/i18n';
import { PageHero } from './Schools';

const ITEMS = [
  { key: 'language', icon: Languages },
  { key: 'olchiki', icon: ScrollText },
  { key: 'literature', icon: BookMarked },
  { key: 'festivals', icon: PartyPopper },
  { key: 'knowledge', icon: TreePine },
  { key: 'resources', icon: FolderOpen },
  { key: 'history', icon: History },
];

export default function Culture() {
  const { t } = useI18n();
  const [culture, setCulture] = useState<Record<string, any>>({});
  useEffect(() => { api('/api/public/culture').then((r: any) => setCulture(r.data)).catch(() => {}); }, []);
  return (
    <div>
      <PageHero title={t('culture_title')} sub="Language, script, literature, festivals and living knowledge of the Santal community" image="/uploads/culture-festival.jpg" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="space-y-8">
          {ITEMS.map((item, i) => {
            const c = culture[item.key];
            return (
              <div key={item.key} className={`card overflow-hidden grid md:grid-cols-2 gap-0 ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
                <div className="relative min-h-[240px]" style={{ direction: 'ltr' }}>
                  <Img src={c?.image || '/uploads/culture-pattern.jpg'} alt={c?.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center" style={{ direction: 'ltr' }}>
                  <div className="h-12 w-12 rounded-xl text-white flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{c?.title || item.key}</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{c?.body || 'Content is being prepared by our cultural committee.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
