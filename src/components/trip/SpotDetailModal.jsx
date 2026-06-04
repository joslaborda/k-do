import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, X, Navigation, Clock, Trash2, Utensils, Landmark, Ticket, ShoppingBag, CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  food: 'bg-orange-50 text-orange-600', sight: 'bg-violet-50 text-violet-600',
  activity: 'bg-green-50 text-green-600', shopping: 'bg-blue-50 text-blue-600',
  custom: 'bg-secondary text-muted-foreground', restaurant: 'bg-orange-50 text-orange-600',
  museum: 'bg-violet-50 text-violet-600',
};
const TYPE_LABELS = { food:'Comida', sight:'Atracción', activity:'Actividad', shopping:'Shopping', custom:'Personalizado', restaurant:'Restaurante', museum:'Museo' };

function getMapsUrl(spot) {
  if (spot.lat && spot.lng) return `https://www.google.com/maps?q=${spot.lat},${spot.lng}`;
  const q = encodeURIComponent(spot.address || spot.title);
  return /iP(hone|ad|od)/.test(navigator.userAgent)
    ? `https://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function SpotDetailModal({ spot, open, onClose, onSave, onRemove, queryClient, tripId }) {
  const [notes, setNotes]     = useState(spot?.notes || '');
  const [time, setTime]       = useState(spot?.assigned_time || '');
  const [editingTime, setEditingTime] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (spot) {
      setNotes(spot.notes || '');
      setTime(spot.assigned_time || '');
      setEditingTime(false);
      setEditingNotes(false);
    }
  }, [spot?.id]);

  if (!open || !spot) return null;

  const emoji = SPOT_ICONS[spot.type] || '📍';
  const typeLabel = TYPE_LABELS[spot.type] || spot.type || 'Spot';

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Spot.update(spot.id, {
        notes: notes.trim() || null,
        assigned_time: time || null,
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
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-foreground leading-snug">{spot.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
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

          {/* Hora */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Hora</p>
            {editingTime ? (
              <div className="flex items-center gap-2">
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary w-[120px]" />
                <button onClick={() => setTime('')} className="text-xs text-muted-foreground">Quitar</button>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setEditingTime(false)} className="text-xs text-muted-foreground">Cancelar</button>
                  <button onClick={handleSave} disabled={saving}
                    className="text-xs text-white bg-primary px-3 py-1.5 rounded-full disabled:opacity-40">
                    {saving ? '...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {time
                  ? <span className="text-sm text-primary font-medium">{time}</span>
                  : <span className="text-sm text-muted-foreground">Sin hora</span>}
                <button onClick={() => setEditingTime(true)} className="text-xs text-primary font-medium underline underline-offset-2 ml-1">
                  {time ? 'Editar' : 'Añadir hora'}
                </button>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Nota personal</p>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="text-sm bg-secondary border-border resize-none" rows={3} autoFocus />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingNotes(false); setNotes(spot.notes || ''); }}
                    className="text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-border">Cancelar</button>
                  <button onClick={handleSave} disabled={saving}
                    className="text-xs text-white bg-primary px-3 py-1.5 rounded-full disabled:opacity-40">
                    {saving ? '...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingNotes(true)} className="w-full text-left">
                {notes
                  ? <div className="bg-secondary rounded-xl p-3 text-sm text-foreground leading-relaxed">{notes}</div>
                  : <div className="bg-secondary/50 rounded-xl p-3 text-sm text-muted-foreground border border-dashed border-border">Añadir nota...</div>}
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
