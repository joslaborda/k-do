import { useState } from 'react';
import { X, Clock, ArrowRight, CirclePlus, Trash2 } from 'lucide-react';
import { DOC_ICONS, SPOT_ICONS, SPOT_COLORS } from './constants';
import { useTranslation } from 'react-i18next';

export default function ItemDetailSheet({ item, onClose, onSaveTime, onOpenPdf, onDelete }) {
  const { t } = useTranslation();
  const [editingTime, setEditingTime] = useState(false);
  const [time, setTime] = useState(item?.time || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!item) return null;

  const isDoc  = item._kind === 'doc';
  const isNote = item._kind === 'note';
  const EmojiIcon = isDoc ? (DOC_ICONS[item.type] || DOC_ICONS.other) : null;
  const SpotIcon  = !isDoc ? (SPOT_ICONS[item.type] || CirclePlus) : null;
  const spotColor = !isDoc ? (SPOT_COLORS[item.type] || SPOT_COLORS.custom) : '';
  const title = item.title || item.name || t('itemDetail.untitled');
  // Las notas de itinerario traen el texto en `content`, no en `notes` — antes
  // este sheet solo miraba `item.notes`, así que el cuerpo de la nota nunca
  // se veía aquí (aunque sí en el editor de Ruta).
  const noteText = isNote ? item.content : item.notes;

  const handleSave = async () => {
    setSaving(true);
    await onSaveTime(item, time);
    setSaving(false);
    setEditingTime(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(item); } finally { setDeleting(false); }
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
              {isDoc ? (item.type || t('itemDetail.document')) : (item.type || t('itemDetail.spot'))}
              {item.time && <span className="text-primary font-medium"> · {item.time}</span>}
            </p>
          </div>
          <button aria-label={t('common.close')} onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('itemDetail.time')}</p>
            {editingTime ? (
              <div className="flex items-center gap-2">
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary" />
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-1.5 bg-primary text-white text-sm rounded-full font-medium disabled:opacity-50">
                  {saving ? '...' : t('common.save')}
                </button>
                <button onClick={() => { setEditingTime(false); setTime(item?.time || ''); }}
                  className="text-sm text-muted-foreground">{t('common.cancel')}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.time
                    ? <span className="text-primary font-medium">{item.time}</span>
                    : <span className="text-muted-foreground">{t('itemDetail.noTimeAssigned')}</span>}
                </div>
                <button onClick={() => setEditingTime(true)} className="text-xs text-primary font-medium underline underline-offset-2">
                  {item.time ? t('itemDetail.edit') : t('itemDetail.addTime')}
                </button>
              </div>
            )}
          </div>

          {!isDoc && noteText && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('itemDetail.note')}</p>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-sm text-foreground leading-relaxed">{noteText}</p>
              </div>
            </div>
          )}

          {isDoc && item.type && (
            <div className="flex gap-2">
              <div className="bg-secondary rounded-xl p-3 flex-1">
                <p className="text-xs text-muted-foreground mb-1">{t('itemDetail.type')}</p>
                <p className="text-sm font-medium text-foreground capitalize">{item.type}</p>
              </div>
              {!item.file_url && (
                <div className="bg-secondary rounded-xl p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{t('itemDetail.file')}</p>
                  <p className="text-sm text-muted-foreground">{t('itemDetail.noFile')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {onDelete && confirmDelete && (
          <div className="mx-5 mb-3 flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-2.5">
            <span className="text-xs text-red-600">{t('itemDetail.deleteConfirm')}</span>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground">{t('common.cancel')}</button>
              <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-red-600 disabled:opacity-50">
                {deleting ? '...' : t('common.delete')}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-5 pb-8 pt-0">
          {onDelete && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />{t('common.delete')}
            </button>
          )}
          {isDoc && item.file_url && (
            <button onClick={() => { onClose(); setTimeout(() => onOpenPdf(item.file_url), 50); }}
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium">
              {t('itemDetail.viewDocument')}
            </button>
          )}
          {!isDoc && item.lat && item.lng && (
            <a href={`https://maps.google.com/?q=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium text-center">
              {t('itemDetail.viewOnMap')}
            </a>
          )}
          <button onClick={onClose}
            className="flex-1 py-3 bg-secondary border border-border rounded-full text-sm text-muted-foreground">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
