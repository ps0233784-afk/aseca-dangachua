import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import { Img } from '../../components/public/shared';
import { PageHero } from './Schools';

export default function Gallery() {
  const { t } = useI18n();
  const [data, setData] = useState<{ albums: any[]; photos: any[] }>({ albums: [], photos: [] });
  const [album, setAlbum] = useState<string>('all');
  useEffect(() => { api('/api/public/gallery').then((r: any) => setData(r.data)).catch(() => {}); }, []);

  const photos = album === 'all' ? data.photos : data.photos.filter((p: any) => String(p.album_id) === album);
  const [lightbox, setLightbox] = useState<any>(null);

  return (
    <div>
      <PageHero title={t('gallery_title')} sub="Schools, students, cultural events, sports and community programs" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setAlbum('all')} className={`px-4 py-2 rounded-xl text-sm font-medium ${album === 'all' ? 'text-white' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} style={album === 'all' ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
            All ({data.photos.length})
          </button>
          {data.albums.map((a) => (
            <button key={a.id} onClick={() => setAlbum(String(a.id))} className={`px-4 py-2 rounded-xl text-sm font-medium ${String(album) === String(a.id) ? 'text-white' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} style={String(album) === String(a.id) ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>
              {a.name} ({a.photo_count})
            </button>
          ))}
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((p: any) => (
            <button key={p.id} onClick={() => setLightbox(p)} className="block w-full break-inside-avoid rounded-2xl overflow-hidden group relative">
              <Img src={p.image} alt={p.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="text-white text-sm font-medium">{p.title}</span>
              </div>
            </button>
          ))}
        </div>
        {photos.length === 0 && <p className="text-center text-slate-400 py-16">No photos yet.</p>}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Img src={lightbox.image} alt={lightbox.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <p className="text-white text-center mt-4 font-medium">{lightbox.title}</p>
            {lightbox.caption && <p className="text-slate-300 text-center text-sm mt-1">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
