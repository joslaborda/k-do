import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { TYPE_CONFIG } from './spotsHelpers';
import useLikeSimple from './useLikeSimple';
import InlineCommentsPopup from './InlineCommentsPopup';
import { useTranslation } from 'react-i18next';

export default
function SpotDetailSheet({ spot, open, onClose, onSave, onDelete, tripId, tripCities, userId, onNotify }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(spot?.notes || '');
  const [assignedDate, setAssignedDate] = useState(spot?.assigned_date || '');
  const [assignedTime, setAssignedTime] = useState(spot?.assigned_time || '');
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot?.id, userId);
  const isReal = spot?.id && !String(spot?.id || '').startsWith('seed_');
  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot?.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot?.id && isReal,
    staleTime: 30000,
  });

  // Build trip day options from cities — must be before early return
  const tripDayOptions = useMemo(() => {
    const days = [];
    const sorted = [...(tripCities || [])].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
    sorted.forEach(c => {
      if (c.start_date && c.end_date) {
        let d = new Date(c.start_date);
        const end = new Date(c.end_date);
        while (d <= end) {
          days.push({ date: d.toISOString().slice(0, 10), city: c.name });
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return days;
  }, [tripCities]);

  const hasTripDays = tripDayOptions.length > 0;

  useEffect(() => {
    if (spot) {
      setNotes(spot.notes || '');
      setAssignedDate(spot.assigned_date || '');
      setAssignedTime(spot.assigned_time || '');
    }
  }, [spot?.id]);

  if (!open || !spot) return null;

  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;

  const handleSave = async () => {
    setSaving(true);
    const timeChanged = assignedTime !== (spot?.assigned_time || '');
    try {
      await base44.entities.Spot.update(spot.id, {
        notes,
        assigned_date: assignedDate || null,
        assigned_time: assignedTime || null,
      });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
      if (timeChanged && assignedTime) onNotify?.('spot_time', `${spot.title}: hora cambiada a ${assignedTime}`, spot.title);
      onClose();
    } catch (e) {
      toast({ title: 'Error al guardar', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col" style={{ maxHeight: 'calc(85vh - 80px)' }} onClick={e => e.stopPropagation()}>
        {/* Handle + Header — fixed */}
        <div className="flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-4 mb-3" />
          <div className="flex items-start justify-between px-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${tc.color}`}>
                {tc.Icon && <tc.Icon size={14} />}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{spot.title}</p>
                <p className="text-xs text-muted-foreground">{t(tc.tk)}{spot.city_name ? ' · ' + spot.city_name : ''}</p>
              </div>
            </div>
            <button aria-label={t('common.close')} onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('spots.sheet.myNote')}</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('spots.sheet.notePlaceholder')}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"
            />
          </div>

          {/* Day + Hour assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('spots.sheet.day')}</p>
              {hasTripDays ? (
                <select
                  value={assignedDate}
                  onChange={e => setAssignedDate(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
                >
                  <option value="">{t('spots.sheet.unassigned')}</option>
                  {tripDayOptions.map(d => (
                    <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={assignedDate}
                  onChange={e => setAssignedDate(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
                />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('spots.sheet.time')}</p>
              <select
                value={assignedTime || ''}
                onChange={e => setAssignedTime(e.target.value)}
                className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary appearance-none"
              >
                <option value="">{t('spots.sheet.noTime')}</option>
                {Array.from({ length: 24 * 4 }, (_, i) => {
                  const h = Math.floor(i / 4).toString().padStart(2, '0');
                  const m = ((i % 4) * 15).toString().padStart(2, '0');
                  const val = `${h}:${m}`;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Delete */}
          <button onClick={() => { onDelete(spot.id); onClose(); }}
            className="w-full text-xs text-red-500 hover:text-red-700 transition-colors py-2 text-center">
            {t('spots.sheet.deleteSpot')}
          </button>
        </div>

        {/* Like / Comentar row */}
        <div className="flex-shrink-0 flex border-t border-border">
          <button
            onClick={e => { e.stopPropagation(); toggleLike(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors text-sm"
          >
            {isLiked
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
            <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>{t('spots.sheet.like')}{likeCount > 0 ? ` · ${likeCount}` : ''}</span>
          </button>
          <div className="w-px bg-border" />
          {isReal && (
            <button
              onClick={e => { e.stopPropagation(); setShowComments(true); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors text-sm text-muted-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {t('spots.sheet.comment')}{comments.length > 0 ? ` · ${comments.length}` : ''}
            </button>
          )}
        </div>

        {/* Sticky footer buttons */}
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
            {saving ? t('spots.section.saving') : t('spots.sheet.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
    {showComments && isReal && <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />}
    </>
  );
}

