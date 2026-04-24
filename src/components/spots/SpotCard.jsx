import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import {
  ExternalLink, MapPin, Calendar, Copy, CheckCircle, Trash2,
  Heart, Star
} from 'lucide-react';
import { useLike } from '@/hooks/useLike';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TYPE_CONFIG = {
  food:      { label: 'Comida',     emoji: '🍜', color: 'bg-orange-100 text-orange-700' },
  sight:     { label: 'Atracción',  emoji: '🏛️', color: 'bg-blue-100 text-blue-700' },
  activity:  { label: 'Actividad',  emoji: '⚡', color: 'bg-green-100 text-green-700' },
  shopping:  { label: 'Compras',    emoji: '🛍️', color: 'bg-purple-100 text-purple-700' },
  transport: { label: 'Transporte', emoji: '🚆', color: 'bg-slate-100 text-slate-700' },
  custom:    { label: 'Otro',       emoji: '⭐', color: 'bg-yellow-100 text-yellow-700' },
};

const VISIBILITY_LABEL = {
  personal:       '🔒 Solo yo',
  trip_members:   '👥 Grupo',
  selected_users: '👤 Seleccionados',
};

function getMapsUrl(spot) {
  const query = encodeURIComponent(spot.address || spot.title);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS
    ? `https://maps.apple.com/?q=${query}`
    : `https://www.openstreetmap.org/search?query=${query}`;
}


function SpotStars({ spotId, userId }) {
  const queryClient = useQueryClient();
  const [hovering, setHovering] = useState(null);
  const [useState_] = [useState];

  const { data: ratings = [] } = useQuery({
    queryKey: ['spotRatings', spotId],
    queryFn: () => base44.entities.SpotRating.filter({ spot_id: spotId }),
    enabled: !!spotId,
    staleTime: 30000,
  });

  const myRating = ratings.find(r => r.user_id === userId);
  const avg = ratings.length > 1
    ? Math.round(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length * 10) / 10
    : null;

  const mut = useMutation({
    mutationFn: async stars => {
      if (myRating) await base44.entities.SpotRating.update(myRating.id, { rating: stars });
      else await base44.entities.SpotRating.create({ spot_id: spotId, user_id: userId, rating: stars });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spotRatings', spotId] }),
  });

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(star => (
          <button key={star}
            onMouseEnter={() => setHovering(star)}
            onMouseLeave={() => setHovering(null)}
            onClick={() => mut.mutate(star)}
            className="p-0.5 hover:scale-110 transition-transform">
            <Star className={"w-4 h-4 " + ((hovering || myRating?.rating || 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}/>
          </button>
        ))}
      </div>
      {avg && <span className="text-xs text-muted-foreground">{avg} ({ratings.length})</span>}
      {!myRating && <span className="text-xs text-muted-foreground">¿Cómo fue?</span>}
    </div>
  );
}

export default function SpotCard({ spot, days = [], currentUserEmail, cityId, tripId }) {
  const [copied, setCopied] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;

  const { isLiked, count: likeCount, toggle: toggleLike } = useLike({
    targetId: spot.id,
    targetType: 'spot',
    userId: user?.id,
    targetOwnerId: spot.created_by_user_id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Spot.update(spot.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', cityId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Spot.delete(spot.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', cityId] }),
  });

  const toggleVisited = () => updateMutation.mutate({ visited: !spot.visited });

  const assignDay = (dayId) => {
    updateMutation.mutate({ itinerary_day_id: dayId || null });
    setAssignOpen(false);
    toast({ title: dayId ? 'Spot asignado al día ✅' : 'Asignación eliminada' });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/CityDetail?id=${cityId}&trip_id=${tripId}#spot-${spot.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({
        title: 'Enlace copiado 🔗',
        description: 'Solo miembros del viaje con acceso podrán verlo.',
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canDelete = spot.created_by === currentUserEmail;

  const assignedDay = days.find((d) => d.id === spot.itinerary_day_id);

  return (
    <div
      id={`spot-${spot.id}`}
      className={`bg-white rounded-xl border border-border p-4 space-y-3 transition-all ${
        spot.visited ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl mt-0.5">{tc.emoji}</span>
          <div className="min-w-0">
            <p className={`font-semibold text-foreground leading-tight ${spot.visited ? 'line-through text-muted-foreground' : ''}`}>
              {spot.title}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.color}`}>{tc.label}</span>
              <span className="text-xs text-muted-foreground">{VISIBILITY_LABEL[spot.visibility]}</span>
              {assignedDay && (
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                  📅 {assignedDay.title}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleVisited}
            className={`p-1.5 rounded-lg transition-colors ${
              spot.visited
                ? 'text-green-600 bg-green-50'
                : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
            }`}
            title={spot.visited ? 'Marcar como no visitado' : 'Marcar como visitado'}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              onClick={() => deleteMutation.mutate()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Eliminar spot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      {/* Atribución */}
      {(spot.source_username || spot.source_display_name) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Heart className="w-3 h-3 text-orange-400"/>
          Recomendado por <span className="font-medium text-orange-700">@{spot.source_username || spot.source_display_name}</span>
        </p>
      )}

      {spot.notes && (
        <p className="text-sm text-muted-foreground">{spot.notes}</p>
      )}

      {/* Tags */}
      {spot.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {spot.tags.map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">#{t}</span>)}
        </div>
      )}

      {/* Address */}
      {spot.address && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {spot.address}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {/* Like */}
        <button
          onClick={toggleLike}
          className={'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors border ' +
            (isLiked
              ? 'bg-red-50 text-red-500 border-red-200'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-400 hover:border-red-200')}
        >
          <Heart className={'w-3 h-3 ' + (isLiked ? 'fill-current' : '')} />
          {likeCount > 0 ? likeCount : 'Me gusta'}
        </button>
        {spot.link && (
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <ExternalLink className="w-3 h-3" />
            Ver enlace
          </a>
        )}

        {/* Maps */}
        <a
          href={getMapsUrl(spot)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
        >
          <MapPin className="w-3 h-3" />
          Abrir en mapa
        </a>

        {/* Assign day */}
        {days.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setAssignOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors border border-orange-200"
            >
              <Calendar className="w-3 h-3" />
              {assignedDay ? 'Cambiar día' : 'Asignar a día'}
            </button>
            {assignOpen && (
              <div className="absolute z-50 left-0 top-8 bg-white border border-border rounded-xl shadow-lg min-w-[200px] max-h-52 overflow-y-auto">
                {assignedDay && (
                  <button
                    onClick={() => assignDay(null)}
                    className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    Quitar asignación
                  </button>
                )}
                {days.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => assignDay(d.id)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 transition-colors ${
                      d.id === spot.itinerary_day_id ? 'font-semibold text-orange-700 bg-orange-50' : 'text-foreground'
                    }`}
                  >
                    {d.date ? `${d.date} · ` : ''}{d.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Copy link */}
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
        >
          <Copy className="w-3 h-3" />
          {copied ? '¡Copiado!' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  );
}