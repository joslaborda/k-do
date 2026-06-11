import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripContext } from '@/hooks/useTripContext';
import { notify, resolveUserIds } from '@/lib/notifications';
import { Download, X, ArrowRight, Camera, Upload, ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function groupByDate(photos) {
  const groups = {};
  photos.forEach(p => {
    const key = (p.taken_at || p.created_date || '').slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, items }));
}

export default function Photos() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip, myProfile } = useTripContext(tripId);

  const [lbIdx, setLbIdx] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }, 'created_date', 500),
    enabled: !!tripId,
    staleTime: 0,
  });

  const photos = messages
    .filter(m => m.file_type === 'image' && m.file_url)
    .sort((a, b) => {
      const da = a.taken_at || a.created_date || '';
      const db = b.taken_at || b.created_date || '';
      return da.localeCompare(db);
    });

  const groups = groupByDate(photos);

  const notifyMembers = async (count) => {
    try {
      const members = trip?.members || [];
      const others = members.filter(e => e !== user.email);
      if (!others.length) return;
      const allProfiles = await base44.entities.UserProfile.list();
      const myProf = allProfiles.find(p => p.user_id === user?.id);
      const resolved = await resolveUserIds(others);
      resolved.forEach(({ userId }) => notify({
        userId,
        type: 'photo_added',
        actor: myProf,
        tripId: trip?.id,
        tripName: trip?.name,
        refTitle: count > 1 ? `${count} fotos` : '1 foto',
      }));
    } catch {}
  };

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const results = [];
      setUploadProgress({ current: 0, total: files.length });
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const takenAt = await getExifDate(file);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.TripMessage.create({
          trip_id: tripId,
          user_id: user.id,
          user_email: user.email,
          display_name: myProfile?.display_name || user.email,
          avatar_url: myProfile?.avatar_url || null,
          content: '',
          file_url,
          file_type: 'image',
          file_name: file.name,
          taken_at: takenAt || new Date().toISOString(),
        });
        results.push(file_url);
        setUploadProgress({ current: i + 1, total: files.length });
      }
      return results;
    },
    onSuccess: async (_, files) => {
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
      await notifyMembers(files.length);
    },
    onSettled: () => {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    },
  });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    if (!files.length) return;
    e.target.value = '';
    setUploading(true);
    uploadMutation.mutate(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 10);
    if (!files.length) return;
    setUploading(true);
    uploadMutation.mutate(files);
  };

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lbIdx === null) return;
    const h = (e) => {
      if (e.key === 'Escape') setLbIdx(null);
      if (e.key === 'ArrowLeft') setLbIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setLbIdx(i => Math.min(photos.length - 1, i + 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lbIdx, photos.length]);

  const currentPhoto = lbIdx !== null ? photos[lbIdx] : null;

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header */}
      <div className="bg-background sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {uploading
                ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <Plus className="w-4 h-4" />}
              Fotos
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Fotos</h1>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <div className="max-w-3xl mx-auto">
        {/* Empty state */}
        {/* Barra de progreso de subida */}
      {uploading && uploadProgress.total > 0 && (
        <div className="max-w-3xl mx-auto px-5 py-3">
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">
                Subiendo fotos...
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadProgress.current} de {uploadProgress.total}
              </p>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && !uploading && (
          <div
            className="mx-4 mt-8 border border-border rounded-2xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:bg-secondary/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sin fotos aún</p>
            <p className="text-xs text-muted-foreground text-center">Sube fotos del viaje o envíalas por el chat del grupo</p>
          </div>
        )}



        {/* Grouped grid */}
        {groups.map(({ date, items }) => (
          <div key={date} className="mt-4">
            <div className="px-4 mb-2 flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                {date ? format(parseISO(date), "d 'de' MMMM", { locale: es }) : 'Sin fecha'}
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-px">
              {items.map((photo, i) => {
                const globalIdx = photos.indexOf(photo);
                return (
                  <div
                    key={photo.id}
                    className="aspect-square bg-secondary cursor-pointer relative group overflow-hidden"
                    onClick={() => setLbIdx(globalIdx)}
                  >
                    <img
                      src={photo.file_url}
                      alt=""
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
                      <p className="text-micro text-white/90 truncate">{photo.display_name || photo.user_email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {currentPhoto && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLbIdx(null)}
        >
          {/* Top actions */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            <a
              href={currentPhoto.file_url}
              download={currentPhoto.file_name || 'foto.jpg'}
              onClick={e => e.stopPropagation()}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}
            >
              <Download size={18} />
            </a>
            <button
              onClick={() => setLbIdx(null)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Prev */}
          {lbIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLbIdx(i => i - 1); }}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}

          {/* Image */}
          <img
            src={currentPhoto.file_url}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8, width: '100%' }}
          />

          {/* Next */}
          {lbIdx < photos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLbIdx(i => i + 1); }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowRight size={18} />
            </button>
          )}

          {/* Bottom info */}
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
              {currentPhoto.display_name || currentPhoto.user_email}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              {currentPhoto.taken_at || currentPhoto.created_date
                ? format(parseISO(currentPhoto.taken_at || currentPhoto.created_date), "d MMM yyyy · HH:mm", { locale: es })
                : ''}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>
              {lbIdx + 1} / {photos.length}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

async function getExifDate(file) {
  try {
    const buf = await file.arrayBuffer();
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xFFD8) return null;
    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset);
      const len = view.getUint16(offset + 2);
      if (marker === 0xFFE1) {
        const str = String.fromCharCode(...new Uint8Array(buf, offset + 4, 6));
        if (str.startsWith('Exif')) {
          const tiffStart = offset + 10;
          const le = view.getUint16(tiffStart) === 0x4949;
          const readUint16 = o => le ? view.getUint16(tiffStart + o, true) : view.getUint16(tiffStart + o);
          const readUint32 = o => le ? view.getUint32(tiffStart + o, true) : view.getUint32(tiffStart + o);
          const ifdOffset = readUint32(4);
          const entries = readUint16(ifdOffset);
          for (let i = 0; i < entries; i++) {
            const e = ifdOffset + 2 + i * 12;
            const tag = readUint16(e);
            if (tag === 0x9003 || tag === 0x0132) {
              const valOffset = readUint32(e + 8);
              const dateStr = String.fromCharCode(...new Uint8Array(buf, tiffStart + valOffset, 19));
              const iso = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
              return new Date(iso).toISOString();
            }
          }
        }
      }
      offset += 2 + len;
    }
  } catch {}
  return null;
}

async function downloadAll(photos) {
  for (const photo of photos) {
    const a = document.createElement('a');
    a.href = photo.file_url;
    a.download = photo.file_name || 'foto.jpg';
    a.target = '_blank';
    a.click();
    await new Promise(r => setTimeout(r, 300));
  }
}
