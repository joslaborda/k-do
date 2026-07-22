import { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { Hotel, Train, Car, Ticket, Shield, CirclePlus, Trash2, Search, X, MapPin, Loader2 } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';
import { useTranslation } from 'react-i18next';
import { format, parseISO, addDays } from 'date-fns';
import { getTripDays, tripDayOptionValue, parseTripDayOptionValue } from '@/lib/tripDays';

// ── Exported config (used by DocumentCard, Calendar) ─────────────────────────
export const CATEGORY_CONFIG = {
  flight:   { icon: PlaneIcon, label: 'Vuelo',    labelKey: 'documents.types.flight',    color: 'bg-blue-50 dark:bg-blue-950/30'   },
  train:    { icon: Train,     label: 'Tren',     labelKey: 'documents.types.train',     color: 'bg-green-50 dark:bg-green-950/30'  },
  hotel:    { icon: Hotel,     label: 'Hotel',    labelKey: 'documents.types.hotel',     color: 'bg-purple-50 dark:bg-purple-950/30' },
  event:    { icon: Ticket,    label: 'Evento',   labelKey: 'documents.types.ticket',    color: 'bg-orange-50 dark:bg-orange-950/30' },
  personal: { icon: Shield,    label: 'Seguro',   labelKey: 'documents.types.insurance', color: 'bg-amber-50 dark:bg-amber-950/30'  },
  other:    { icon: CirclePlus, label: 'Otro',    labelKey: 'documents.types.other',     color: 'bg-secondary' },
};

const CATEGORIES = [
  { key: 'flight',   Icon: PlaneIcon,  labelKey: 'documents.types.flight'   },
  { key: 'hotel',    Icon: Hotel,      labelKey: 'documents.types.hotel'    },
  { key: 'train',    Icon: Train,      labelKey: 'documents.types.train'    },
  { key: 'event',    Icon: Ticket,     labelKey: 'documents.types.ticket'   },
  { key: 'personal', Icon: Shield,     labelKey: 'documents.types.insurance' },
  { key: 'other',    Icon: CirclePlus, labelKey: 'documents.types.other'    },
];

const VISIBILITY_OPTS = [
  { key: 'personal',       tk: 'documents.form.vis.onlyMe', dk: 'documents.form.vis.onlyMeDesc' },
  { key: 'shared',         tk: 'documents.form.vis.group',  dk: 'documents.form.vis.groupDesc'  },
  { key: 'selected_users', tk: 'documents.form.vis.choose', dk: 'documents.form.vis.chooseDesc' },
];

const SHOW_FIELDS = {
  flight:   ['name','origin','destination','location','airline','date','time','end_time','notes','note_time'],
  hotel:    ['name','city','date','time','end_date','notes','note_time'],
  train:    ['name','origin','destination','location','date','time','end_time','notes','note_time'],
  event:    ['name','city','date','time','notes','note_time'],
  personal: ['name','date','end_date','notes','note_time'],
  other:    ['name','city','date','time','notes','note_time'],
};

// Buscador de ubicación (aeropuerto/estación) para vuelos y trenes — mismo
// endpoint de geocoding (Nominatim) que ya usa el buscador de spots en
// Restaurants.jsx, adaptado aquí sin depender de ese archivo. El resultado
// elegido guarda lat/lng reales, que es justo lo que le faltaba a un
// documento para poder aparecer en el mini-mapa del día (TodayRouteMap).
async function searchLocation(query, signal) {
  const params = new URLSearchParams({ q: query, format: 'json', limit: 6, addressdetails: 1, namedetails: 1 });
  const res = await fetch('https://nominatim.openstreetmap.org/search?' + params, {
    headers: { 'Accept-Language': 'es,en', 'User-Agent': 'KodoTravelApp/1.0' },
    signal,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(item => ({
    id: item.place_id?.toString(),
    name: item.namedetails?.name || item.display_name?.split(',')[0] || query,
    address: item.display_name,
    lat: parseFloat(item.lat), lng: parseFloat(item.lon),
  }));
}

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
    location_name: initialData?.location_name || '',
    location_lat:  initialData?.location_lat  || '',
    location_lng:  initialData?.location_lng  || '',
  });

  // Buscador de aeropuerto/estación (solo vuelo/tren, ver SHOW_FIELDS). El
  // texto de búsqueda es local hasta que se elige un resultado; lo elegido
  // vive en fields.location_* (lo que de verdad se guarda).
  const [locationQuery, setLocationQuery] = useState(initialData?.location_name || '');
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const locationTimer = useRef(null);
  const locationAbortRef = useRef(null);

  useEffect(() => {
    if (fields.location_lat) { setLocationResults([]); return; }
    if (!locationQuery.trim() || locationQuery.trim().length < 2) { setLocationResults([]); return; }
    clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(async () => {
      if (locationAbortRef.current) locationAbortRef.current.abort();
      locationAbortRef.current = new AbortController();
      setLocationSearching(true);
      try {
        setLocationResults(await searchLocation(locationQuery.trim(), locationAbortRef.current.signal));
      } catch (e) {
        if (e?.name !== 'AbortError') setLocationResults([]);
      } finally {
        setLocationSearching(false);
      }
    }, 700);
    return () => clearTimeout(locationTimer.current);
  }, [locationQuery, fields.location_lat]);

  // Build trip day options from tripCities prop
  const tripDayOptions = useMemo(() => {
    return getTripDays(tripCities || []);
  }, [tripCities]);

  const isPersonalCategory = PERSONAL_CATEGORIES.includes(category);
  const useTripDays = !isPersonalCategory && tripDayOptions.length > 0;

  // Documentos guardados antes de este fix no tienen city_id para su día — en
  // ese caso, para que el <select> siga mostrando algo seleccionado, cae al
  // primer option cuya fecha coincida (comportamiento anterior).
  const selectedDayOption = useMemo(() => {
    if (!fields.date) return null;
    if (fields.city_id) {
      const exact = tripDayOptions.find(d => d.date === fields.date && d.cityId === fields.city_id);
      if (exact) return exact;
    }
    return tripDayOptions.find(d => d.date === fields.date) || null;
  }, [tripDayOptions, fields.date, fields.city_id]);

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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('documents.form.type')}</p>
        <div className="flex border-b border-border">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`flex-1 flex flex-col items-center py-2 pb-2.5 gap-0.5 border-b-2 transition-colors ${category === cat.key ? 'border-primary' : 'border-transparent'}`}>
              <cat.Icon size={16} className="flex-shrink-0" />
              <span className={`text-xs font-medium leading-none ${category === cat.key ? 'text-primary' : 'text-muted-foreground'}`}>{t(cat.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.name')}</p>
        <Input value={fields.name} onChange={e => setField('name', e.target.value)}
          placeholder={t('documents.form.ph.name')} className="h-10 text-sm" />
      </div>

      {/* Origin / Destination */}
      {(hasField('origin') || hasField('destination')) && (
        <div className="grid grid-cols-2 gap-3">
          {hasField('origin') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.origin')}</p>
              <Input value={fields.origin} onChange={e => setField('origin', e.target.value)}
                placeholder={FIELD_PLACEHOLDERS.origin} className="h-10 text-sm" />
            </div>
          )}
          {hasField('destination') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.destination')}</p>
              <Input value={fields.destination} onChange={e => setField('destination', e.target.value)}
                placeholder={FIELD_PLACEHOLDERS.destination} className="h-10 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* Ubicación (aeropuerto/estación) — solo vuelo/tren. Da lat/lng reales
          al documento, que antes no tenía ninguna, para que pueda aparecer
          en el mini-mapa del día junto al hotel y los spots. */}
      {hasField('location') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            {t('documents.form.fields.location')} <span className="font-normal normal-case tracking-normal text-muted-foreground">{t('documents.form.optional')}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mb-1.5">{t('documents.form.locationHint')}</p>
          {fields.location_lat && fields.location_lng ? (
            <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-3 py-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 text-sm text-foreground truncate">{fields.location_name}</span>
              <button type="button" onClick={() => { setFields(prev => ({ ...prev, location_name: '', location_lat: '', location_lng: '' })); setLocationQuery(''); }}
                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input value={locationQuery} onChange={e => setLocationQuery(e.target.value)}
                  placeholder={t('documents.form.ph.location')} className="flex-1 text-sm outline-none bg-transparent text-foreground min-w-0" />
                {locationSearching && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />}
              </div>
              {locationResults.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                  {locationResults.map(r => (
                    <button key={r.id} type="button" onClick={() => {
                      setFields(prev => ({ ...prev, location_name: r.name, location_lat: r.lat, location_lng: r.lng }));
                      setLocationQuery(r.name);
                      setLocationResults([]);
                    }}
                      className="w-full flex flex-col items-start px-3 py-2.5 text-left hover:bg-secondary/30 transition-colors border-b border-border last:border-0">
                      <span className="text-sm font-medium text-foreground truncate w-full">{r.name}</span>
                      {r.address && <span className="text-xs text-muted-foreground truncate w-full">{r.address}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Airline */}
      {hasField('airline') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.airline')}</p>
          <Input value={fields.airline} onChange={e => setField('airline', e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.airline} className="h-10 text-sm" />
        </div>
      )}

      {/* City */}
      {hasField('city') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.city')}</p>
          <Input value={fields.city} onChange={e => setField('city', e.target.value)}
            placeholder={FIELD_PLACEHOLDERS.city} className="h-10 text-sm" />
        </div>
      )}

      {/* Date + Time in same row */}
      {(hasField('date') || hasField('time')) && (
        <div className={`grid gap-3 ${hasField('date') && hasField('time') ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasField('date') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.date')}</p>
              {useTripDays ? (
                <select
                  value={selectedDayOption ? tripDayOptionValue(selectedDayOption) : ''}
                  onChange={e => {
                    const { date, cityId } = parseTripDayOptionValue(e.target.value);
                    setFields(prev => ({ ...prev, date, city_id: cityId || '' }));
                  }}
                  className="w-full h-10 border border-border rounded-md px-3 text-sm outline-none focus:border-primary bg-input"
                >
                  <option value="">{t('documents.form.selectDay')}</option>
                  {tripDayOptions.map(d => (
                    <option key={tripDayOptionValue(d)} value={tripDayOptionValue(d)}>{d.date} · {d.city}</option>
                  ))}
                </select>
              ) : (
                <Input type="date" value={fields.date} onChange={e => setField('date', e.target.value)} className="h-10 text-sm" min={minDate || undefined} max={maxDate || undefined} />
              )}
            </div>
          )}
          {hasField('time') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.time')}</p>
              <Input type="time" value={fields.time} onChange={e => setField('time', e.target.value)} className="h-10 text-sm" />
            </div>
          )}
        </div>
      )}

      {/* End time — hora de llegada para vuelos y trenes */}
      {hasField('end_time') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            {t('documents.form.fields.endTime')} <span className="font-normal normal-case tracking-normal text-muted-foreground">{t('documents.form.optional')}</span>
          </p>
          <Input type="time" value={fields.end_time} onChange={e => setField('end_time', e.target.value)} className="h-10 text-sm" placeholder={FIELD_PLACEHOLDERS.end_time} />
        </div>
      )}

      {/* End date */}
      {hasField('end_date') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.endDate')}</p>
          <Input type="date" value={fields.end_date} onChange={e => setField('end_date', e.target.value)} className="h-10 text-sm" min={minDate || undefined} max={maxDate || undefined} />
        </div>
      )}

      {/* Notes */}
      {hasField('notes') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{t('documents.form.fields.notes')}</p>
          <Textarea value={fields.notes} onChange={e => setField('notes', e.target.value)}
            placeholder={t('documents.form.ph.notes')} className="text-sm resize-none" rows={2} />
        </div>
      )}

      {/* Note time — hora opcional para notas */}
      {hasField('note_time') && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            {t('documents.form.fields.noteTime')} <span className="font-normal normal-case tracking-normal text-muted-foreground">{t('documents.form.optional')}</span>
          </p>
          <Input type="time" value={fields.note_time} onChange={e => setField('note_time', e.target.value)} className="h-10 text-sm" />
        </div>
      )}

      {/* Visibility — stacked with description */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('documents.form.visibility')}</p>
        <div className="flex flex-col gap-2">
          {VISIBILITY_OPTS.map(opt => (
            <button key={opt.key} onClick={() => setVisibility(opt.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                visibility === opt.key ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:bg-secondary/30'
              }`}>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${visibility === opt.key ? 'text-primary' : 'text-foreground'}`}>{t(opt.tk)}</p>
                <p className={`text-xs mt-0.5 ${visibility === opt.key ? 'text-primary/70' : 'text-muted-foreground'}`}>{t(opt.dk)}</p>
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
                    {isYou && <p className="text-xs text-muted-foreground">{t('documents.form.alwaysIncluded')}</p>}
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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('documents.form.file')}</p>
        {fields.file_url ? (
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Preview row */}
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/40 border-b border-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <button onClick={() => onView && onView(fields.file_url)}
                className="text-sm text-foreground flex-1 truncate text-left hover:text-primary transition-colors">
                {t('documents.form.fileAttached')}
              </button>
              <button onClick={() => setField('file_url', '')}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors ml-2">
                {t('documents.form.removeFile')}
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
                <p className="text-xs text-primary">{t('documents.form.pdfHint')}</p>
              </button>
            )}
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-all ${fileUploading ? 'opacity-50' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm font-medium text-muted-foreground">{fileUploading ? t('documents.form.uploading') : t('documents.form.tapToAttach')}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{t('documents.form.fileTypes')}</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" onChange={handleFileUpload} className="hidden" disabled={fileUploading} />
          </label>
        )}
      </div>

      {/* Actions */}
      {onDelete && (
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full border border-red-200 transition-colors">
          <Trash2 className="w-4 h-4" />{t('documents.form.deleteDoc')}
        </button>
      )}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleSave} disabled={!fields.name.trim() || saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
          {saving ? t('documents.form.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  );
}