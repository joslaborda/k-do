import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripContext } from '@/hooks/useTripContext';
import { createNotification } from '@/lib/notifications';
import { Download, X, ArrowRight, Camera, Upload } from 'lucide-react';
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
      others.forEach(email => {
        const profile = allProfiles.find(p =>
          p.email === email || p.user_email === email || p.contact_email === email
        );
        if (profile?.user_id) {
          createNotification({
            userId: profile.user_id,
            type: 'photo_upload',
            actorProfile: myProfile,
            refId: tripId,
            refTitle: trip?.name || 'el viaje',
            message: `ha subido ${count} foto${count > 1 ? 's' : ''}`,
          });
        }
      });
    } catch {}
  };

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const results = [];
      for (const file of files) {
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
      }
      return results;
    },
    onSuccess: async (_, files) => {
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
      await notifyMembers(files.length);
    },
    onSettled: () => setUploading(false),
  });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    setUploading(true);
    uploadMutation.mutate(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
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
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Fotos</h1>
            {photos.length > 0 && (
              <p className="text-xs text-muted-foreground">{photos.length} foto{photos.length !== 1 ? 's' : ''} · {trip?.name || ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <a
                href={photos[0]?.file_url}
                className="h-9 px-3 rounded-xl border border-border bg-secondary flex items-center gap-1.5 text-sm text-muted-foreground hover:bg-border/40 transition-colors"
                onClick={e => { e.preventDefault(); downloadAll(photos); }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Descargar todo</span>
              </a>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-9 px-3 rounded-xl bg-primary text-white flex items-center gap-1.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Upload className="w-4 h-4" />}
              <span>Subir</span>
            </button>
          </div>
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
        {photos.length === 0 && !uploading && (
          <div
            className="mx-4 mt-8 border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sin fotos aún</p>
            <p className="text-xs text-muted-foreground text-center">Sube fotos del viaje o envíalas por el chat del grupo</p>
          </div>
        )}

        {/* Drop zone when has photos */}
        {photos.length > 0 && (
          <div
            className="mx-4 mt-4 mb-2 border border-dashed border-border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Arrastra fotos aquí o toca para seleccionar</span>
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
                      <p className="text-[9px] text-white/90 truncate">{photo.display_name || photo.user_email}</p>
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
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
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
