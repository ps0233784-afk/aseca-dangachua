import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { fmtDate } from '../../lib/format';
import { PageHero } from './Schools';

export default function Events() {
  const { t } = useI18n();
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { api('/api/public/events').then((r: any) => setEvents(r.data)).catch(() => {}); }, []);

  return (
    <div>
      <PageHero title="Events" sub="Cultural programs, sports, meetings and community events" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-5">
          {events.map((e) => (
            <div key={e.id} className="card card-hover overflow-hidden">
              <div className="flex items-stretch">
                <div className="w-24 shrink-0 text-white flex flex-col items-center justify-center py-6" style={{ background: 'linear-gradient(160deg, var(--brand-primary), var(--brand-secondary))' }}>
                  <span className="text-3xl font-extrabold">{fmtDate(e.event_date).split(' ')[0]}</span>
                  <span className="text-xs uppercase opacity-80">{fmtDate(e.event_date).split(' ')[1]}</span>
                </div>
                <div className="p-5">
                  <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-2">{e.category}</span>
                  <h3 className="font-bold leading-snug">{e.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{e.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.venue}</span>
                    {e.start_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.start_time}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-center text-slate-400 py-16 col-span-2">No upcoming events.</p>}
        </div>
      </div>
    </div>
  );
}
