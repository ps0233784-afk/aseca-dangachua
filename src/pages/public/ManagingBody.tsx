import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SectionHeading, Img } from '../../components/public/shared';
import { useI18n } from '../../lib/i18n';
import { PageHero } from './Schools';

export default function ManagingBody() {
  const { t } = useI18n();
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => { api('/api/public/managing-body').then((r: any) => setMembers(r.data)).catch(() => {}); }, []);
  return (
    <div>
      <PageHero title={t('managing_title')} sub="11 dedicated members guiding the organisation" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div key={m.id} className="card card-hover p-6 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
                  <Img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold leading-snug">{m.name}</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>{m.designation}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
