import React, { useEffect, useState } from 'react';
import { Megaphone, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fmtDate } from '../../lib/format';
import { PageHero } from './Schools';

export default function Notices() {
  const { t } = useI18n();
  const [notices, setNotices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  useEffect(() => { api('/api/public/notices').then((r: any) => setNotices(r.data)).catch(() => {}); }, []);

  return (
    <div>
      <PageHero title={t('notices_title')} sub="Official notices from the organisation" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-3">
          {notices.map((n) => (
            <button key={n.id} onClick={() => setSelected(n)} className="w-full text-left card p-5 card-hover">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-2">{n.category}</span>
                  <h3 className="font-bold text-lg leading-snug">{n.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.body}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{fmtDate(n.publish_at || n.created_at)}</span>
              </div>
            </button>
          ))}
          {notices.length === 0 && <p className="text-center text-slate-400 py-16">No notices published yet.</p>}
        </div>

        {selected && (
          <div className="card p-6 sticky top-24">
            <Megaphone className="h-8 w-8 mb-3" style={{ color: 'var(--brand-primary)' }} />
            <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-2">{selected.category}</span>
            <h2 className="font-bold text-xl leading-snug">{selected.title}</h2>
            <p className="text-xs text-slate-400 mt-2">{fmtDate(selected.publish_at || selected.created_at)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed whitespace-pre-line">{selected.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}
