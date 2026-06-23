import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { Hotel, Train, Car, Ticket, Shield, CirclePlus, Trash2 } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';
import { useTranslation } from 'react-i18next';

// ── Exported config (used by DocumentCard, Calendar) ─────────────────────────
export const CATEGORY_CONFIG = {
  flight:   { icon: PlaneIcon, label: t('documents.types.flight'),   color: 'bg-blue-50 dark:bg-blue-950/30'   },
  train:    { icon: Train, label: t('documents.types.train'),    color: 'bg-green-50 dark:bg-green-950/30'  },
  hotel:    { icon: Hotel,      label: t('documents.types.hotel'),   color: 'bg-purple-50 dark:bg-purple-950/30' },
  event:    { icon: Ticket,     label: 'Evento',  color: 'bg-orange-50 dark:bg-orange-950/30' },
  personal: { icon: Shield,     label: t('documents.types.insurance'),  color: 'bg-amber-50 dark:bg-amber-950/30'  },
  other:    { icon: CirclePlus,   label: t('documents.types.other'),    color: 'bg-secondary' },
};


const CATEGORIES = [
  { key: 'flight',   Icon: PlaneIcon, label: t('documents.types.flight')   },
  { key: 'hotel',    Icon: Hotel,      label: t('documents.types.hotel')   },
  { key: 'train',    Icon: Train, label: t('documents.types.train')    },
  { key: 'event',    Icon: Ticket,     label: 'Evento'  },
  { key: 'personal', Icon: Shield,     label: t('documents.types.insurance')  },
  { key: 'other',    Icon: CirclePlus,   label: t('documents.types.other')    },
];

const VISIBILITY_OPTS = [
  { key: 'personal',       label: 'Solo yo',       desc: 'Nadie más puede verlo'   },
  { key: 'shared',         label: 'Todo el grupo', desc: 'Visible para todos'      },
  { key: 'selected_users', label: 'Elegir',        desc: 'Selecciona quién lo ve'  },
];

const SHOW_FIELDS = {
  flight:   ['name','origin','destination','airline','date','time','end_time','notes','note_time'],
  hotel:    ['name','city','date','time','end_date','notes','note_time'],
  train:    ['name','origin','destination','date','time','end_time','notes','note_time'],
  event:    ['name','city','date','time','notes','note_time'],
  personal: ['name','date','end_date','notes','note_time'],
  other:    ['name','city','date','time','notes','note_time'],
};

const FIELD_LABELS = {
  name: 'Nombre', origin: 'Origen', destination: 'Destino',
  airline: 'Compañía / Nº vuelo', city: 'Ciudad',
  date: 'Fecha', end_date: 'Fecha fin', time: 'Hora salida', end_time: 'Hora llegada',
  notes: 'Notas', note_time: 'Hora de la nota',
};

const FIELD_PLACEHOLDERS = {
  name: 'Ej. Vuelo Madrid-Tokyo', origin: 'MAD', destination: 'NRT',
  airline: 'IB-6832', city: 'Tokyo',
  date: 'yyyy-mm-dd', end_date: 'yyyy-mm-dd', time: '08:45', end_time: '13:20',
  notes: 'Notas adicionales...', note_time: '14:00',
};

// Personal categories that should NOT restrict to trip dates
const PERSONAL_CATEGORIES = ['personal'];

export default function DocumentForm({
  initialData, cities, itineraryDays, members, profiles, tripCities, minDate, maxDate, onSave, onCancel, onDelete, saving, onView }) {
  const { t } = useTranslation();
  const [category, setCategory]     = useState(initialData?.category || 'flight');
  const [visibility, setVisibility] = useState(initialData?.visibility || 'shared');
  const [sharedWith, setSharedWith] = useState(initialData?.shared_with || []);
  const [fileUploading, setFileUploading] = useState(false);
  const [fields, setFields]         = useState({
    name:        initialData?.name        || '',
    origin:      initialData?.origin      || '',
    destination: initialData?.destination || '',
    airline:     initialData?.airline     || '',
    city:        initialData?.city        || '',
    date:        initialData?.date        || '',
    end_date:    initialData?.end_date    || '',
    time:        initialData?.time        || '',
    end_time:    initialData?.end_time    || '',
    note_time:   initialData?.note_time   || '',
    notes:       initialData?.notes       || '',
    file_url:    initialData?.file_url    || '',
    city_id:     initialData?.city_id     || '',
  });

  // Build trip day options from tripCities prop
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

  const isPersonalCategory = PERSONAL_CATEGORIES.includes(category);
  const useTripDays = !isPersonalCategory && tripDayOptions.length > 0;

  const showFields = SHOW_FIELDS[category] || SHOW_FIELDS.other;
  const hasField   = (f) => showFields.includes(f);

  const setField = (k, v) => setFields(prev => ({ ...prev, [k]: v }));

  const toggleSharedWith = (email) => {
    setSharedWith(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setField('file_url', file_url);
    } catch (err) {
    }
    setFileUploading(false);
  };

  const handleSave = () => {
    if (!fields.name.trim()) return;
    onSave({
      ...fields,
      category,
      visibility,
      shared_with: visibility === 'selected_users' ? sharedWith : [],
    });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Category tabs */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tipo *</p>
        <div className="flex border-b border-border">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`flex-1 flex flex-col items-center py-2 pb-2.5 gap-0.5 border-b-2 transition-colors ${category === cat.key ? 'border-primary' : 'border-transparent'}`}>
              <cat.Icon size={16} className="flex-shrink-0" />
              <span className={`text-xs font-medium leading-none ${category === cat.key ? 'text-primary' : 'text-muted-foreground'}`}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nombre *</p>
        <Input value={fields.name} onChange={e => setField('name', e.target.value)}
          placeholder={FIELD_PLACEHOLDERS.name} className="h-10 text-sm" />
      </div>

      {/* Origin / Destination */}
      {(hasField('origin') || hasField('destination')) && (
        <div className="grid grid-cols-2 gap-3">
          {hasField('origin') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Origen</p>
              <Input value={fields.origin} onChange={e => setField('origin', e.target.value)}
                placeholder={FIELD_PLACEHOLDERS.origin} className="h-10 text-sm" />
            </div>
          )}
          {hasField('destination') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Destino</p>
              <Input value={fields.destination} onChange={e => setField('destination', e.target.value)}
                placeholder={FIELD_PLACEHOLDERS.destination} className="h-10 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* Airline */}
      {hasField('airline') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Compañía / Nº vuelo</p>
          <Input value={fields.airline} onChange={e => setField('airline', e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.airline} className="h-10 text-sm" />
        </div>
      )}

      {/* City */}
      {hasField('city') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Ciudad</p>
          <Input value={fields.city} onChange={e => setField('city', e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.city} className="h-10 text-sm" />
        </div>
      )}

      {/* Date + Time in same row */}
      {(hasField('date') || hasField('time')) && (
        <div className={`grid gap-3 ${hasField('date') && hasField('time') ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasField('date') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha *</p>
              {useTripDays ? (
                <select
                  value={fields.date}
                  onChange={e => setField('date', e.target.value)}
                  className="w-full h-10 border border-border rounded-md px-3 text-sm outline-none focus:border-primary bg-input"
                >
                  <option value="">Seleccionar día</option>
                  {tripDayOptions.map(d => (
                    <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                  ))}
                </select>
              ) : (
                <Input type="date" value={fields.date} onChange={e => setField('date', e.target.value)} className="h-10 text-sm" min={minDate || undefined} max={maxDate || undefined} />
              )}
            </div>
          )}
          {hasField('time') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{FIELD_LABELS.time}</p>
              <Input type="time" value={fields.time} onChange={e => setField('time', e.target.value)} className="h-10 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* End time — hora de llegada para vuelos y trenes */}
      {hasField('end_time') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            {FIELD_LABELS.end_time} <span className="font-normal normal-case tracking-normal text-muted-foreground">— opcional</span>
          </p>
          <Input type="time" value={fields.end_time} onChange={e => setField('end_time', e.target.value)} className="h-10 text-sm" placeholder={FIELD_PLACEHOLDERS.end_time} />
        </div>
      )}

      {/* End date */}
      {hasField('end_date') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha de salida / fin</p>
          <Input type="date" value={fields.end_date} onChange={e => setField('end_date', e.target.value)} className="h-10 text-sm" min={minDate || undefined} max={maxDate || undefined} />
        </div>
      )}

      {/* Notes */}
      {hasField('notes') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Notas</p>
          <Textarea value={fields.notes} onChange={e => setField('notes', e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.notes} className="text-sm resize-none" rows={2} />
        </div>
      )}

      {/* Note time — hora opcional para notas */}
      {hasField('note_time') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Hora de la nota <span className="font-normal normal-case tracking-normal text-muted-foreground">— opcional</span>
          </p>
          <Input type="time" value={fields.note_time} onChange={e => setField('note_time', e.target.value)} className="h-10 text-sm" />
        </div>
      )}

      {/* Visibility — stacked with description */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibilidad</p>
        <div className="flex flex-col gap-2">
          {VISIBILITY_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setVisibility(opt.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                visibility === opt.key ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:bg-secondary/30'
              }`}>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${visibility === opt.key ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                <p className={`text-xs mt-0.5 ${visibility === opt.key ? 'text-primary/70' : 'text-muted-foreground'}`}>{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                visibility === opt.key ? 'bg-primary border-primary' : 'border-border'
              }`}>
                {visibility === opt.key && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          ))}
        </div>

        {/* User picker when "selected_users" */}
        {visibility === 'selected_users' && members.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {members.map((email, i) => {
              const profile = profiles?.[email] || null;
              const name = profile?.display_name || profile?.username || email;
              const initials = (profile?.display_name?.[0] || profile?.username?.[0] || email?.[0] || '?').toUpperCase();
              const colors = ['bg-orange-100 text-primary','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];
              const selected = sharedWith.includes(email) || i === 0;
              const isYou = i === 0;

              return (
                <button key={email}
                  onClick={() => !isYou && toggleSharedWith(email)}
                  disabled={isYou}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    selected ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:bg-secondary/20'
                  } ${isYou ? 'cursor-default' : ''}`}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colors[i % colors.length]}`}>{initials}</div>
                  }
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium truncate ${selected ? 'text-primary' : 'text-foreground'}`}>{name}</p>
                    {isYou && <p className="text-xs text-muted-foreground">Siempre incluido</p>}
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    selected ? 'bg-primary' : 'bg-secondary border border-border'
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* File upload + preview */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Archivo adjunto</p>
        {fields.file_url ? (
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Preview row */}
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/40 border-b border-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <button onClick={() => onView && onView(fields.file_url)}
                className="text-sm text-foreground flex-1 truncate text-left hover:text-primary transition-colors">
                Archivo adjuntado
              </button>
              <button onClick={() => setField('file_url', '')}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors ml-2">
                Eliminar
              </button>
            </div>
            {/* Inline preview for images — clickable to open viewer */}
            {fields.file_url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) && (
              <button onClick={() => onView && onView(fields.file_url)}
                className="w-full block cursor-pointer">
                <img src={fields.file_url} alt="preview"
                  className="w-full max-h-48 object-contain bg-secondary/20" />
              </button>
            )}
            {/* PDF preview — clickable hint */}
            {fields.file_url.match(/\.pdf(\?|$)/i) && (
              <button onClick={() => onView && onView(fields.file_url)}
                className="w-full px-4 py-3 bg-orange-50 border-t border-orange-100 text-left hover:bg-orange-100 transition-colors">
                <p className="text-xs text-primary">Toca para ver el PDF a pantalla completa</p>
              </button>
            )}
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-all ${fileUploading ? 'opacity-50' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm font-medium text-muted-foreground">{fileUploading ? 'Subiendo...' : 'Toca para adjuntar'}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">PDF, JPG, PNG...</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" onChange={handleFileUpload} className="hidden" disabled={fileUploading} />
          </label>
        )}
      </div>

      {/* Actions */}
      {onDelete && (
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full border border-red-200 transition-colors">
          <Trash2 className="w-4 h-4" />Eliminar documento
        </button>
      )}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={handleSave} disabled={!fields.name.trim() || saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}