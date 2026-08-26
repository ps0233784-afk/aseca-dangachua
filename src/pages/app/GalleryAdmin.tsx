import React, { useRef, useState } from 'react';
import { Plus, Trash2, Images, Upload, FolderPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { Modal, ConfirmDialog, PageLoader, Field, EmptyState, Spinner } from '../../components/ui/primitives';
import { useAuth, hasPerm } from '../../contexts/AuthContext';
import { Img } from '../../components/public/shared';

export default function GalleryAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, reload } = useApi('/api/albums');
  const [photos, setPhotos] = useState<any[]>([]);
  const [albumId, setAlbumId] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [del, setDel] = useState<any>(null);
  const [albumModal, setAlbumModal] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const canEdit = hasPerm(user, 'gallery', 'create');

  const loadPhotos = () => api(`/api/gallery${albumId !== 'all' ? `?album_id=${albumId}` : ''}`).then((r: any) => setPhotos(r.data));
  React.useEffect(() => { loadPhotos(); }, [albumId]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', f);
        const up: any = await api('/api/upload', { method: 'POST', formData: fd });
        await api('/api/gallery', { method: 'POST', body: { image: up.url, title: f.name.replace(/\.[^.]+$/, ''), album_id: albumId !== 'all' ? Number(albumId) : null, category: 'school', is_public: 1 } });
      }
      toast('success', `${files.length} photo(s) uploaded`);
      loadPhotos(); reload();
    } catch (e: any) { toast('error', e.message); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Images className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Gallery</h1><p className="text-sm text-slate-500">{data?.length || 0} albums • {photos.length} photos</p></div>
        <div className="flex gap-2">
          {canEdit && <button className="btn-outline" onClick={() => setAlbumModal(true)}><FolderPlus className="h-4 w-4" /> Album</button>}
          {canEdit && <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <Spinner /> : <Upload className="h-4 w-4" />} Upload Photos</button>}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={upload} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setAlbumId('all')} className={`px-4 py-2 rounded-xl text-sm font-medium ${albumId === 'all' ? 'text-white' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} style={albumId === 'all' ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>All</button>
        {data?.map((a: any) => (
          <button key={a.id} onClick={() => setAlbumId(String(a.id))} className={`px-4 py-2 rounded-xl text-sm font-medium ${String(albumId) === String(a.id) ? 'text-white' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} style={String(albumId) === String(a.id) ? { background: 'linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))' } : {}}>{a.name} ({a.photo_count})</button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p: any) => (
            <div key={p.id} className="card overflow-hidden group relative">
              <Img src={p.image} alt={p.title} className="w-full aspect-square object-cover" />
              <div className="p-3">
                <p className="text-sm font-medium truncate">{p.title || 'Untitled'}</p>
                <p className="text-[11px] text-slate-400">{p.category}</p>
              </div>
              {canEdit && <button className="absolute top-2 right-2 bg-white/90 rounded-lg p-1.5 text-rose-500 shadow" onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
          {photos.length === 0 && <div className="col-span-full"><EmptyState title="No photos" sub="Upload photos to build the gallery." /></div>}
        </div>
      )}

      <Modal open={albumModal} onClose={() => setAlbumModal(false)} title="New Album"
        footer={<><button className="btn-outline" onClick={() => setAlbumModal(false)}>Cancel</button><button className="btn-primary" onClick={async () => { await api('/api/albums', { method: 'POST', body: { name: albumName } }); toast('success', 'Album created'); setAlbumModal(false); setAlbumName(''); reload(); }}>Create</button></>}>
        <Field label="Album Name *"><input className="input" value={albumName} onChange={(e) => setAlbumName(e.target.value)} /></Field>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete Photo?" onConfirm={async () => { await api(`/api/gallery/${del.id}`, { method: 'DELETE' }); toast('success', 'Deleted'); setDel(null); loadPhotos(); reload(); }} />
    </div>
  );
}
