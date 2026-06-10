import { useState } from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';
import { CirclePlus } from '@/lib/icons';
import { DOC_ICONS, SPOT_ICONS, SPOT_COLORS } from './constants';

export default function ItemDetailSheet({ item, onClose, onSaveTime, onOpenPdf }) {
  const [editingTime, setEditingTime] = useState(false);
  const [time, setTime] = useState(item?.time || '');
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  const isDoc  = item._kind === 'doc';
  const EmojiIcon = isDoc ? (DOC_ICONS[item.type] || DOC_ICONS.other) : null;
  const SpotIcon  = !isDoc ? (SPOT_ICONS[item.type] || CirclePlus) : null;
  const spotColor = !isDoc ? (SPOT_COLORS[item.type] || SPOT_COLORS.custom) : '';
  const title = item.title || item.name || 'Sin título';

  const handleSave = async () => {
    setSaving(true);
    await onSaveTime(item, time);
    setSaving(false);
    setEditingTime(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDoc ? 'bg-orange-50' : spotColor || 'bg-secondary'}`}>
            {isDoc ? <EmojiIcon size={20} className="text-primary" /> : SpotIcon ? <SpotIcon size={20} /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-foreground leading-snug">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {isDoc ? (item.type || 'documento') : (item.type || 'spot')}
              {item.time && <span className="text-primary font-medium"> · {item.time}</span>}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Hora</p>
            {editingTime ? (
              <div className="flex items-center gap-2">
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary" />
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-1.5 bg-primary text-white text-sm rounded-full font-medium disabled:opacity-50">
                  {saving ? '...' : 'Guardar'}
                </button>
                <button onClick={() => { setEditingTime(false); setTime(item?.time || ''); }}
                  className="text-sm text-muted-foreground">Cancelar</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.time
                    ? <span className="text-primary font-medium">{item.time}</span>
                    : <span className="text-muted-foreground">Sin hora asignada</span>}
                </div>
                <button onClick={() => setEditingTime(true)} className="text-xs text-primary font-medium underline underline-offset-2">
                  {item.time ? 'Editar' : 'Añadir hora'}
                </button>
              </div>
            )}
          </div>

          {!isDoc && item.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Nota</p>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-sm text-foreground leading-relaxed">{item.notes}</p>
              </div>
            </div>
          )}

          {isDoc && item.type && (
            <div className="flex gap-2">
              <div className="bg-secondary rounded-xl p-3 flex-1">
                <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                <p className="text-sm font-medium text-foreground capitalize">{item.type}</p>
              </div>
              {!item.file_url && (
                <div className="bg-secondary rounded-xl p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Archivo</p>
                  <p className="text-sm text-muted-foreground">Sin archivo</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-8 pt-0">
          {isDoc && item.file_url && (
            <button onClick={() => { onClose(); setTimeout(() => onOpenPdf(item.file_url), 50); }}
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium">
              Ver documento
            </button>
          )}
          {!isDoc && item.lat && item.lng && (
            <a href={`https://maps.google.com/?q=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium text-center">
              Ver en mapa
            </a>
          )}
          <button onClick={onClose}
            className="flex-1 py-3 bg-secondary border border-border rounded-xl text-sm text-muted-foreground">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
