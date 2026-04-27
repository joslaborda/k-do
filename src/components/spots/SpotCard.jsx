import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { MapPin, Trash2, Heart, Globe, CheckCircle, X, Camera, MessageCircle, ThumbsUp, ThumbsDown, Navigation } from 'lucide-react';

const TYPE_CONFIG = {
  food:      { label: 'Restaurante', emoji: '🍽️', color: 'bg-orange-100 text-orange-800' },
  sight:     { label: 'Atracción',   emoji: '🏛️', color: 'bg-blue-100 text-blue-800' },
  activity:  { label: 'Actividad',   emoji: '⚡',  color: 'bg-green-100 text-green-800' },
  shopping:  { label: 'Compras',     emoji: '🛍️', color: 'bg-purple-100 text-purple-800' },
  transport: { label: 'Transporte',  emoji: '🚆',  color: 'bg-slate-100 text-slate-800' },
  custom:    { label: 'Otro',        emoji: '⭐',  color: 'bg-yellow-100 text-yellow-800' },
};

function getMapsUrl(spot) {
  if (spot.lat && spot.lng) return `https://www.google.com/maps?q=${spot.lat},${spot.lng}`;
  const q = encodeURIComponent(spot.address || spot.title);
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    ? `https://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// ── Popup de valoración ───────────────────────────────────────────────────────
function RatingPopup({ spot, userId, userProfile, onClose }) {
  const queryClient = useQueryClient();
  const [thumb, setThumb] = useState(null);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);

  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id,
      user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      user_avatar: userProfile?.avatar_url || '',
      thumb,
      text: text.trim() || null,
      image_url: imageUrl.trim() || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground text-sm">¿Qué te pareció?</p>
            <p className="text-xs text-muted-foreground mt-0.5">{spot.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setThumb('up')}
            className={"flex items-center justify-center gap-2 py-3 rounded-xl border transition-all " +
              (thumb === 'up' ? 'bg-green-50 border-green-300' : 'bg-secondary border-border hover:border-green-200')}>
            <span className="text-xl">👍</span>
            <span className={"text-sm font-medium " + (thumb === 'up' ? 'text-green-700' : 'text-muted-foreground')}>Me gustó</span>
          </button>
          <button onClick={() => setThumb('down')}
            className={"flex items-center justify-center gap-2 py-3 rounded-xl border transition-all " +
              (thumb === 'down' ? 'bg-red-50 border-red-300' : 'bg-secondary border-border hover:border-red-200')}>
            <span className="text-xl">👎</span>
            <span className={"text-sm font-medium " + (thumb === 'down' ? 'text-red-700' : 'text-muted-foreground')}>No tanto</span>
          </button>
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Cuéntanos qué tal... (opcional)"
          className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-orange-400 bg-secondary mb-3" />

        {showImageField ? (
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="URL de la foto..."
            className="w-full text-sm border border-border rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 bg-secondary mb-3" />
        ) : (
          <button onClick={() => setShowImageField(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-orange-300 hover:text-orange-600 transition-colors mb-3">
            <Camera className="w-4 h-4" />Añadir una foto
          </button>
        )}

        <button onClick={() => mutation.mutate()} disabled={!thumb || mutation.isPending}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors">
          {mutation.isPending ? 'Guardando...' : 'Guardar valoración'}
        </button>
      </div>
    </div>
  );
}

// ── Popup de comentarios ──────────────────────────────────────────────────────
function CommentsPopup({ spot, userId, userProfile, onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [thumb, setThumb] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 30000,
  });

  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id, user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      user_avatar: userProfile?.avatar_url || '',
      thumb, text: text.trim() || null,
      image_url: imageUrl.trim() || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] });
      setText(''); setThumb(null); setImageUrl(''); setShowImageField(false);
    },
  });

  const ups = comments.filter(c => c.thumb === 'up').length;
  const downs = comments.filter(c => c.thumb === 'down').length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">Comentarios</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">👍 {ups}</span>
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">👎 {downs}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Sin comentarios todavía. ¡Sé el primero!</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                {c.user_display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-secondary rounded-2xl rounded-tl-none px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">@{c.username || c.user_display_name}</span>
                    <span className="text-sm">{c.thumb === 'up' ? '👍' : '👎'}</span>
                  </div>
                  {c.text && <p className="text-sm text-foreground">{c.text}</p>}
                  {c.image_url && <img src={c.image_url} alt="foto" className="w-full rounded-xl mt-2 object-cover max-h-40" onError={e => e.currentTarget.style.display='none'} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <button onClick={() => setThumb(thumb === 'up' ? null : 'up')}
              className={"px-3 py-1.5 rounded-lg text-sm border transition-colors " + (thumb === 'up' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-secondary border-border text-muted-foreground')}>
              👍
            </button>
            <button onClick={() => setThumb(thumb === 'down' ? null : 'down')}
              className={"px-3 py-1.5 rounded-lg text-sm border transition-colors " + (thumb === 'down' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-secondary border-border text-muted-foreground')}>
              👎
            </button>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Añade un comentario..."
              className="flex-1 text-sm border border-border rounded-xl px-3 py-1.5 resize-none outline-none focus:border-orange-400 bg-secondary h-9" />
          </div>
          <div className="flex gap-2">
            {showImageField ? (
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="URL de la foto..." className="flex-1 text-sm border border-border rounded-xl px-3 py-1.5 outline-none focus:border-orange-400 bg-secondary" />
            ) : (
              <button onClick={() => setShowImageField(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-orange-600 px-2 py-1.5 border border-dashed border-border rounded-xl flex-1 justify-center">
                <Camera className="w-3.5 h-3.5" />Foto
              </button>
            )}
            <button onClick={() => mutation.mutate()} disabled={!thumb || mutation.isPending}
              className="px-4 py-1.5 rounded-xl bg-orange-700 text-white text-sm font-medium disabled:opacity-50 hover:bg-orange-800 transition-colors">
              {mutation.isPending ? '...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Popup de confirmación de eliminar ─────────────────────────────────────────
function DeleteConfirmPopup({ spot, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
        <p className="font-semibold text-foreground text-sm mb-1">¿Eliminar este spot?</p>
        <p className="text-xs text-muted-foreground mb-5">Se eliminará <strong>{spot.title}</strong> de tu lista. Esta acción no se puede deshacer.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground hover:bg-border transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Popup de valoración tras visitar ────────────────────────────────────────
function VisitedRatingPopup({ spot, userId, userProfile, onClose }) {
  return <RatingPopup spot={spot} userId={userId} userProfile={userProfile} onClose={onClose} />;
}

// ── SpotCard principal ────────────────────────────────────────────────────────
export default function SpotCard({ spot, days = [], currentUserEmail, cityId, tripId }) {
  const [showRating, setShowRating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0] || null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 30000,
  });

  const ups = comments.filter(c => c.thumb === 'up').length;
  const downs = comments.filter(c => c.thumb === 'down').length;

  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const canDelete = spot.created_by === currentUserEmail;

  const updateMutation = useMutation({
    mutationFn: data => base44.entities.Spot.update(spot.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Spot.delete(spot.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    },
  });

  const handleMarkVisited = () => {
    if (!spot.visited) {
      updateMutation.mutate({ visited: true });
      setShowRating(true);
    } else {
      updateMutation.mutate({ visited: false });
    }
  };

  const handleShare = () => {
    updateMutation.mutate({ visibility: spot.visibility === 'public' ? 'trip_members' : 'public' });
  };

  return (
    <>
      <div className={"rounded-2xl border transition-all " + (spot.visited ? 'bg-green-50 border-green-200' : 'bg-white border-border')}>
        <div className="p-4">
          {/* Atribución */}
          {(spot.source_username || spot.source_display_name) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Heart className="w-3 h-3 text-orange-400" />
              Recomendado por <span className="font-medium text-orange-700">@{spot.source_username || spot.source_display_name}</span>
            </p>
          )}

          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">{tc.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-sm leading-tight">{spot.title}</p>
                {spot.visited && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">✅ Visitado</span>}
              </div>
              <span className={"inline-block text-xs px-2 py-0.5 rounded-full mt-1 " + tc.color}>{tc.label}</span>
              {spot.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{spot.address}
                </p>
              )}
              {spot.notes && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{spot.notes}</p>}
              {spot.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spot.tags.map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">#{t}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Stats si tiene comentarios */}
          {(ups + downs) > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {ups > 0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">👍 {ups}</span>}
              {downs > 0 && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">👎 {downs}</span>}
              <button onClick={() => setShowComments(true)} className="text-xs text-muted-foreground hover:text-orange-700 ml-1">
                💬 {comments.length} comentario{comments.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="border-t border-inherit px-4 py-3 flex gap-2">
          <button onClick={handleMarkVisited}
            className={"flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all " +
              (spot.visited ? 'bg-green-100 border-green-300' : 'bg-secondary border-border hover:bg-green-50 hover:border-green-200')}>
            <span className="text-base">✅</span>
            <span className={"text-xs font-medium " + (spot.visited ? 'text-green-700' : 'text-muted-foreground')}>
              {spot.visited ? 'Hecho' : 'Marcar hecho'}
            </span>
          </button>
          <button onClick={() => setShowComments(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-border bg-secondary hover:bg-blue-50 hover:border-blue-200 transition-all">
            <span className="text-base">💬</span>
            <span className="text-xs font-medium text-muted-foreground">
              {comments.length > 0 ? `${comments.length} comentarios` : 'Comentar'}
            </span>
          </button>
          <button onClick={handleShare}
            className={"flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all " +
              (spot.visibility === 'public' ? 'bg-blue-50 border-blue-200' : 'bg-secondary border-border hover:bg-blue-50 hover:border-blue-200')}>
            <span className="text-base">🌍</span>
            <span className={"text-xs font-medium " + (spot.visibility === 'public' ? 'text-blue-700' : 'text-muted-foreground')}>
              {spot.visibility === 'public' ? 'Publicado' : 'Compartir'}
            </span>
          </button>
          {canDelete && (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl border border-border bg-secondary hover:bg-red-50 hover:border-red-200 transition-all">
              <span className="text-base">🗑️</span>
              <span className="text-xs font-medium text-muted-foreground">Borrar</span>
            </button>
          )}
        </div>

        {/* Link Maps + desmarcar */}
        <div className="px-4 pb-3 flex items-center gap-3">
          <a href={getMapsUrl(spot)} target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-700 hover:underline flex items-center gap-1">
            <Navigation className="w-3 h-3" />Abrir en Maps
          </a>
          {spot.visited && (
            <button onClick={() => updateMutation.mutate({ visited: false })}
              className="text-xs text-muted-foreground hover:text-foreground ml-auto underline underline-offset-2">
              Desmarcar como visitado
            </button>
          )}
        </div>
      </div>

      {showRating && (
        <RatingPopup spot={spot} userId={user?.id} userProfile={userProfile} onClose={() => setShowRating(false)} />
      )}
      {showComments && (
        <CommentsPopup spot={spot} userId={user?.id} userProfile={userProfile} onClose={() => setShowComments(false)} />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmPopup spot={spot}
          onConfirm={() => { deleteMutation.mutate(); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)} />
      )}
    </>
  );
}
