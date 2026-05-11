import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

// ── Exported config (used by DocumentCard, Calendar) ─────────────────────────
export const CATEGORY_CONFIG = {
  flight:   { icon: '✈️', label: 'Vuelo',   color: 'bg-blue-50'   },
  train:    { icon: '🚆', label: 'Tren',    color: 'bg-green-50'  },
  hotel:    { icon: '🏨', label: 'Hotel',   color: 'bg-purple-50' },
  event:    { icon: '🎟️', label: 'Evento',  color: 'bg-orange-50' },
  personal: { icon: '🛡️', label: 'Seguro',  color: 'bg-amber-50'  },
  other:    { icon: '📄', label: 'Otro',    color: 'bg-secondary' },
};


const CATEGORIES = [
  { key: 'flight',   icon: '✈️', label: 'Vuelo'   },
  { key: 'hotel',    icon: '🏨', label: 'Hotel'   },
  { key: 'train',    icon: '🚆', label: 'Tren'    },
  { key: 'event',    icon: '🎟️', label: 'Evento'  },
  { key: 'personal', icon: '🛡️', label: 'Seguro'  },
  { key: 'other',    icon: '📄', label: 'Otro'    },
];

const VISIBILITY_OPTS = [
  { key: 'personal',       icon: '🔒', label: 'Solo yo',       desc: 'Nadie más puede verlo'     },
  { key: 'shared',         icon: '👥', label: 'Todo el grupo', desc: 'Visible para todos'        },
  { key: 'selected_users', icon: '👤', label: 'Elegir',        desc: 'Selecciona quién lo ve'   },
];

const SHOW_FIELDS = {
  flight:   ['name','origin','destination','airline','date','time','end_date','notes'],
  hotel:    ['name','city','date','time','end_date','notes'],
  train:    ['name','origin','destination','date','time','notes'],
  event:    ['name','city','date','time','notes'],
  personal: ['name','date','end_date','notes'],
  other:    ['name','city','date','time','notes'],
};

const FIELD_LABELS = {
  name: 'Nombre', origin: 'Origen', destination: 'Destino',
  airline: 'Compañía / Nº vuelo', city: 'Ciudad',
  date: 'Fecha', end_date: 'Fecha fin', time: 'Hora',
  notes: 'Notas',
};

const FIELD_PLACEHOLDERS = {
  name: 'Ej. Vuelo Madrid-Tokyo', origin: 'MAD', destination: 'NRT',
  airline: 'IB-6832', city: 'Tokyo',
  date: 'yyyy-mm-dd', end_date: 'yyyy-mm-dd', time: '08:45',
  notes: 'Notas adicionales...',
};

// Personal categories that should NOT restrict to trip dates
const PERSONAL_CATEGORIES = ['personal'];

export default function DocumentForm({ initialData, cities, itineraryDays, members, profiles, tripCities, onSave, onCancel, saving }) {
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
      console.error('Upload error:', err);
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
              <span className="text-base leading-none">{cat.icon}</span>
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
                <Input type="date" value={fields.date} onChange={e => setField('date', e.target.value)} className="h-10 text-sm" />
              )}
            </div>
          )}
          {hasField('time') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Hora</p>
              <Input type="time" value={fields.time} onChange={e => setField('time', e.target.value)} className="h-10 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* End date */}
      {hasField('end_date') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha de salida / fin</p>
          <Input type="date" value={fields.end_date} onChange={e => setField('end_date', e.target.value)} className="h-10 text-sm" />
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

      {/* Visibility — stacked with description */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibilidad</p>
        <div className="flex flex-col gap-2">
          {VISIBILITY_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setVisibility(opt.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                visibility === opt.key ? 'bg-orange-50 border-orange-200' : 'bg-white border-border hover:bg-secondary/30'
              }`}>
              <span className="text-lg shrink-0">{opt.icon}</span>
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
              const profile = profiles?.find(p => p.user_email === email || p.created_by === email);
              const name = profile?.display_name || email.split('@')[0];
              const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              const colors = ['bg-orange-100 text-orange-700','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];
              const selected = sharedWith.includes(email) || i === 0;
              const isYou = i === 0;

              return (
                <button key={email}
                  onClick={() => !isYou && toggleSharedWith(email)}
                  disabled={isYou}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    selected ? 'bg-orange-50 border-orange-200' : 'bg-white border-border hover:bg-secondary/20'
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

      {/* File upload */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Archivo adjunto</p>
        {fields.file_url ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary/40 rounded-xl border border-border">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="text-sm text-foreground flex-1 truncate">Archivo adjuntado</span>
            <button onClick={() => setField('file_url', '')} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Quitar</button>
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
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={handleSave} disabled={!fields.name.trim() || saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}