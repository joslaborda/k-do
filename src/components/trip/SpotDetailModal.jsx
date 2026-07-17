import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, X, Navigation, Clock, Trash2, Utensils, Landmark, Ticket, ShoppingBag, CirclePlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getMapsUrl } from '@/components/spots/spotsHelpers';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const SPOT_ICONS = {
  food:     Utensils,
  sight:    Landmark,
  activity: Ticket,
  shopping: ShoppingBag,
  custom:   CirclePlus,
  restaurant: Utensils,
  museum:   Landmark,
};
const SPOT_COLORS = {
  food: 'bg-orange-50 text-primary', sight: 'bg-violet-50 text-violet-600',
  activity: 'bg-green-50 text-green-600', shopping: 'bg-blue-50 text-blue-600',
  custom: 'bg-secondary text-muted-foreground', restaurant: 'bg-orange-50 text-primary',
  museum: 'bg-violet-50 text-violet-600',
};
const TYPE_LABELS = { food:'Comida', sight:'Atracción', activity:'Actividad', shopping:'Shopping', custom:'Personalizado', restaurant:'Restaurante', museum:'Museo' };


export default function SpotDetailModal({ spot, open, onClose, onSave, onRemove, queryClient, tripId }) {
  const { t } = useTranslation();
  const [notes, setNotes]         = useState(spot?.notes || '');
  const [time, setTime]           = useState(spot?.assigned_time || '');
  const [assignedDate, setAssignedDate] = useState(spot?.assigned_date || '');
  const [editingTime, setEditingTime]   = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [saving, setSaving]       = useState(false);

  const { data: tripCities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const tripDayOptions = useMemo(() => {
    const days = [];
    const sorted = [...tripCities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
    sorted.forEach(c => {
      if (c.start_date && c.end_date) {
        let d = new Date(c.start_date + 'T00:00:00');
        const end = new Date(c.end_date + 'T00:00:00');
        while (d <= end) {
          days.push({ date: format(d, 'yyyy-MM-dd'), city: c.name });
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return days;
  }, [tripCities]);

  useEffect(() => {
    if (spot) {
      setNotes(spot.notes || '');
      setTime(spot.assigned_time || '');
      setAssignedDate(spot.assigned_date || '');
      setEditingTime(false);
      setEditingNotes(false);
    }
  }, [spot?.id]);

  if (!open || !spot) return null;

  const IconComp = SPOT_ICONS[spot.type] || null;
  const typeLabel = TYPE_LABELS[spot.type] || spot.type || 'Spot';

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Spot.update(spot.id, {
        notes: notes.trim() || null,
        assigned_time: time || null,
        assigned_date: assignedDate || null,
      });
      if (queryClient && tripId) {
        queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
      }
      if (onSave) onSave(spot, notes, time);
      setEditingTime(false);
      setEditingNotes(false);
    } finally { setSaving(false); }
  };

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border">
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            {IconComp ? <IconComp size={20} className="text-muted-foreground" /> : <MapPin size={20} className='text-muted-foreground' />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-foreground leading-snug">{spot.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Address */}
          {spot.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              <span>{spot.address}</span>
            </div>
          )}

          {/* Tags */}
          {spot.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {spot.tags.map(t => (
                <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">#{t}</span>
              ))}
            </div>
          )}

          {/* Día */}
          {tripDayOptions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('spots.sheet.day')}</p>
              <select
                value={assignedDate}
                onChange={e => setAssignedDate(e.target.value)}
                className="w-full h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
              >
                <option value="">{t('spots.sheet.unassigned')}</option>
                {tripDayOptions.map(d => (
                  <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                ))}
              </select>
            </div>
          )}

          {/* Hora */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('spots.sheet.time')}</p>
            {editingTime ? (
              <div className="flex items-center gap-2">
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary w-[120px]" />
                <button onClick={() => setTime('')} className="text-xs text-muted-foreground">{t('cities.day.remove')}</button>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setEditingTime(false)} className="text-xs text-muted-foreground">{t('common.cancel')}</button>
                  <button onClick={handleSave} disabled={saving}
                    className="text-xs text-white bg-primary px-3 py-1.5 rounded-full disabled:opacity-40">
                    {saving ? '...' : t('common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {time
                  ? <span className="text-sm text-primary font-medium">{time}</span>
                  : <span className="text-sm text-muted-foreground">{t('spots.modal.noTime')}</span>}
                <button onClick={() => setEditingTime(true)} className="text-xs text-primary font-medium underline underline-offset-2 ml-1">
                  {time ? t('common.edit') : t('spots.modal.addTime')}
                </button>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('cities.day.personalNote')}</p>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="text-sm bg-secondary border-border resize-none" rows={3} autoFocus />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingNotes(false); setNotes(spot.notes || ''); }}
                    className="text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-border">{t('common.cancel')}</button>
                  <button onClick={handleSave} disabled={saving}
                    className="text-xs text-white bg-primary px-3 py-1.5 rounded-full disabled:opacity-40">
                    {saving ? '...' : t('common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingNotes(true)} className="w-full text-left">
                {notes
                  ? <div className="bg-secondary rounded-xl p-3 text-sm text-foreground leading-relaxed">{notes}</div>
                  : <div className="bg-secondary/50 rounded-xl p-3 text-sm text-muted-foreground border border-dashed border-border">{t('spots.modal.addNote')}</div>}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-8 pt-3 border-t border-border">
          {onRemove && (
            <button onClick={() => onRemove(spot)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Quitar del día
            </button>
          )}
          <div className="flex-1" />
          <a href={getMapsUrl(spot)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors">
            <Navigation className="w-4 h-4" />Abrir en Maps
          </a>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
