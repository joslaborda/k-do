import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, X } from 'lucide-react';
import { TYPE_CONFIG } from './spotsHelpers';
import useLikeSimple from './useLikeSimple';
import InlineCommentsPopup from './InlineCommentsPopup';
import { useTranslation } from 'react-i18next';

export default
function CommunitySpotDetailSheet({ spot, onClose, onSave, saving, alreadySaved, userId }) {
  const { t } = useTranslation();
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot.id, userId);
  const [showComments, setShowComments] = useState(false);
  const isReal = spot.id && !String(spot.id).startsWith('seed_');

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot.id && isReal,
    staleTime: 30000,
  });

  const mapsUrl = spot.lat && spot.lng
    ? `https://www.google.com/maps?q=${spot.lat},${spot.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
        <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col" style={{ maxHeight: 'calc(85vh - 80px)' }} onClick={e => e.stopPropagation()}>
          <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${tc.color}`}>
                  {tc.Icon && <tc.Icon size={14} />}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{spot.title}</p>
                  <p className="text-xs text-muted-foreground">{t(tc.tk)}{spot.city_name ? ' · ' + spot.city_name : ''}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {spot.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{spot.address}</span>
              </div>
            )}
            {spot.notes && (
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('common.description')}</p>
                <p className="text-sm text-foreground leading-relaxed">{spot.notes}</p>
              </div>
            )}
            {spot.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {spot.tags.map(t => (
                  <span key={t} className="text-xs bg-accent text-primary px-2.5 py-1 rounded-full border border-orange-200">#{t}</span>
                ))}
              </div>
            )}
            {spot.creator_username && (
              <p className="text-xs text-muted-foreground">{t('spots.addedBy')} <span className="font-medium text-foreground">@{spot.creator_username}</span></p>
            )}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors">
              <Navigation className="w-4 h-4" />{t('spots.viewOnMaps')}
            </a>
          </div>

          <div className="flex-shrink-0 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={toggleLike} className="flex items-center gap-1.5 text-sm transition-colors p-1 -m-1 rounded-full">
                {isLiked
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                }
                <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>{likeCount > 0 ? likeCount : t('spots.sheet.like')}</span>
              </button>
              {isReal && (
                <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {comments.length > 0 ? comments.length : t('spots.sheet.comment')}
                </button>
              )}
            </div>
            {alreadySaved ? (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t('spots.alreadySavedInTrip')}
              </div>
            ) : (
              <button onClick={() => { onSave(spot); onClose(); }} disabled={saving}
                className="w-full py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {saving ? t('spots.saving') : t('spots.saveToTrip')}
              </button>
            )}
          </div>
        </div>
      </div>
      {showComments && <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />}
    </>
  );
}

