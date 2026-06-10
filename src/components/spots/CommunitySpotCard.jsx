import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TYPE_CONFIG } from './spotsHelpers';
import useLikeSimple from './useLikeSimple';
import InlineCommentsPopup from './InlineCommentsPopup';
import CommunitySpotDetailSheet from './CommunitySpotDetailSheet';

export default
function CommunitySpotCard({ spot, onSave, saving, alreadySaved, userId }) {
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const [showDetail, setShowDetail] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot.id, userId);

  const isReal = spot.id && !String(spot.id).startsWith('seed_');
  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot.id && isReal,
    staleTime: 60000,
  });

  const displayVisits = spot.visits || likeCount || 0;

  const mapsUrl = spot.lat && spot.lng
    ? (/iPad|iPhone|iPod/.test(navigator.userAgent)
        ? `https://maps.apple.com/?q=${spot.lat},${spot.lng}`
        : `https://www.google.com/maps?q=${spot.lat},${spot.lng}`)
    : (/iPad|iPhone|iPod/.test(navigator.userAgent)
        ? `https://maps.apple.com/?q=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`);

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Clickable top area */}
        <div className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setShowDetail(true)}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${tc.color}`}>
              {tc.Icon && <tc.Icon size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight">{spot.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tc.label}{spot.city_name ? ' · ' + spot.city_name : ''}
              </p>
              {spot.notes
                ? <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{spot.notes}</p>
                : spot.address
                  ? <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{spot.address}</p>
                  : null
              }
              {spot.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spot.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-xs bg-orange-50 text-primary px-2.5 py-0.5 rounded-full border border-orange-100">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: like · comentar · guardar */}
        <div className="flex items-stretch border-t border-border">
          {/* Like */}
          <button
            onClick={e => { e.stopPropagation(); toggleLike(); }}
            className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 hover:bg-secondary/30 transition-colors"
          >
            {isLiked
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
            <span className={`text-sm ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}>
              {displayVisits > 0 ? displayVisits : ''}
            </span>
          </button>

          <div className="w-px bg-border" />

          {/* Comentar */}
          <button
            onClick={e => { e.stopPropagation(); setShowComments(true); }}
            className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>{comments.length > 0 ? comments.length : ''}</span>
          </button>

          <div className="w-px bg-border" />

          {/* Guardar */}
          {alreadySaved ? (
            <div className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 text-green-600 font-semibold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Guardado
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onSave(spot); }}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 font-semibold text-primary hover:text-primary/80 hover:bg-secondary/30 transition-colors disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {saving ? '...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <CommunitySpotDetailSheet
          spot={spot}
          onClose={() => setShowDetail(false)}
          onSave={onSave}
          saving={saving}
          alreadySaved={alreadySaved}
          userId={userId}
        />
      )}
      {showComments && isReal && (
        <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}

