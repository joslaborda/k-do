import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Shuffle, ChevronDown, Loader2 } from 'lucide-react';
import { getCountryMeta, getTopCities, normalizeCountry } from '@/lib/countryConfig';
import { useEffect, useMemo } from 'react';

// ─── Currency options ─────────────────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€)' }, { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' }, { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CHF', label: 'CHF (Fr)' }, { value: 'MXN', label: 'MXN ($)' },
  { value: 'ARS', label: 'ARS ($)' }, { value: 'BRL', label: 'BRL (R$)' },
  { value: 'THB', label: 'THB (฿)' }, { value: 'KRW', label: 'KRW (₩)' },
  { value: 'CNY', label: 'CNY (¥)' }, { value: 'VND', label: 'VND (₫)' },
  { value: 'MAD', label: 'MAD (DH)' }, { value: 'TRY', label: 'TRY (₺)' },
  { value: 'SGD', label: 'SGD ($)' }, { value: 'IDR', label: 'IDR (Rp)' },
  { value: 'CAD', label: 'CAD ($)' }, { value: 'AUD', label: 'AUD ($)' },
  { value: 'NZD', label: 'NZD ($)' }, { value: 'NOK', label: 'NOK (kr)' },
  { value: 'SEK', label: 'SEK (kr)' }, { value: 'DKK', label: 'DKK (kr)' },
  { value: 'PLN', label: 'PLN (zł)' }, { value: 'CZK', label: 'CZK (Kč)' },
  { value: 'HUF', label: 'HUF (Ft)' }, { value: 'INR', label: 'INR (₹)' },
  { value: 'MYR', label: 'MYR (RM)' }, { value: 'PHP', label: 'PHP (₱)' },
  { value: 'ZAR', label: 'ZAR (R)' }, { value: 'CLP', label: 'CLP ($)' },
  { value: 'COP', label: 'COP ($)' }, { value: 'PEN', label: 'PEN (S/)' },
  { value: 'AED', label: 'AED (د.إ)' }, { value: 'SAR', label: 'SAR (﷼)' },
  { value: 'EGP', label: 'EGP (£)' }, { value: 'RUB', label: 'RUB (₽)' },
  { value: 'CRC', label: 'CRC (₡)' }, { value: 'COP', label: 'COP ($)' },
];

function currencySymbol(code) {
  const map = { EUR:'€', USD:'$', GBP:'£', JPY:'¥', CHF:'Fr', THB:'฿', KRW:'₩', CNY:'¥', VND:'₫', MAD:'DH',
    TRY:'₺', BRL:'R$', IDR:'Rp', INR:'₹', PHP:'₱', MYR:'RM', ZAR:'R', CLP:'$', PEN:'S/', AED:'د.إ',
    NOK:'kr', SEK:'kr', DKK:'kr', PLN:'zł', CZK:'Kč', HUF:'Ft', RUB:'₽', CRC:'₡', COP:'$' };
  return map[code] || '$';
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}
function computeNightsDates(startDateStr, nightsArr) {
  if (!startDateStr) return [];
  const result = [];
  let cursor = startDateStr;
  for (const raw of nightsArr) {
    const n = Math.max(1, parseInt(raw) || 0);
    const start = cursor;
    const end = addDays(cursor, n - 1);
    result.push({ start_date: start, end_date: end });
    cursor = addDays(cursor, n);
  }
  return result;
}
function autoDistribute(startDateStr, endDateStr, count) {
  if (!startDateStr || !endDateStr || count <= 0) return [];
  const total = daysBetween(startDateStr, endDateStr) + 1;
  const base = Math.floor(total / count);
  const extra = total % count;
  const result = [];
  let cursor = startDateStr;
  for (let i = 0; i < count; i++) {
    const n = base + (i < extra ? 1 : 0);
    const start = cursor;
    const end = addDays(cursor, n - 1);
    result.push({ start_date: start, end_date: end });
    cursor = addDays(cursor, n);
  }
  return result;
}

const DEFAULT_FORM = {
  name: '', start_date: '', end_date: '',
  description: '',
  currency: 'EUR', currency_symbol: '€',
  language: 'Español', language_code: 'es-ES',
};

function defaultStops(mode) {
  return mode === 'single'
    ? [{ city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } }]
    : [
        { city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } },
        { city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } },
      ];
}

// ─── Inline country autocomplete (free-text + suggestions from catalog) ───────
function CountryField({ value, onChange, hasError, ref: externalRef }) {
  const countries = useMemo(() => {
    // All countries from our curated list — guaranteed to work everywhere
    const list = [
      'Afganistán','Albania','Alemania','Andorra','Angola','Antigua y Barbuda','Arabia Saudí',
      'Argelia','Argentina','Armenia','Aruba','Australia','Austria','Azerbaiyán',
      'Bahamas','Bahréin','Bangladés','Barbados','Bélgica','Belice','Benín','Bielorrusia',
      'Bolivia','Bosnia','Botsuana','Brasil','Brunéi','Bulgaria','Burkina Faso','Burundi',
      'Bután','Cabo Verde','Camboya','Camerún','Canadá','Chad','Chile','China',
      'Chipre','Colombia','Comoras','Congo','Corea del Norte','Corea del Sur',
      'Costa de Marfil','Costa Rica','Croacia','Cuba','Curazao',
      'Dinamarca','Dominica','Ecuador','Egipto','El Salvador','Emiratos Árabes',
      'Eritrea','Eslovaquia','Eslovenia','España','Estados Unidos','Estonia','Etiopía',
      'Filipinas','Finlandia','Fiyi','Francia','Gabón','Gambia','Georgia','Ghana',
      'Gibraltar','Granada','Grecia','Guatemala','Guinea','Guinea Ecuatorial','Guinea-Bisáu',
      'Guyana','Haití','Honduras','Hungría','India','Indonesia','Irak','Irán','Irlanda',
      'Islandia','Israel','Italia','Jamaica','Japón','Jordania','Kazajistán','Kenia',
      'Kirguistán','Kiribati','Kosovo','Kuwait','Laos','Lesoto','Letonia','Líbano',
      'Liberia','Libia','Liechtenstein','Lituania','Luxemburgo','Madagascar','Malaui',
      'Malasia','Maldivas','Malí','Malta','Marruecos','Martinica','Mauritania','Mauricio',
      'México','Micronesia','Moldova','Mónaco','Mongolia','Montenegro','Mozambique',
      'Myanmar','Namibia','Nepal','Nicaragua','Níger','Nigeria','Noruega',
      'Nueva Zelanda','Omán','Pakistán','Palaos','Panamá','Papúa Nueva Guinea',
      'Paraguay','Países Bajos','Perú','Polonia','Portugal','Puerto Rico',
      'Qatar','Reino Unido','República Centroafricana','República Checa',
      'República del Congo','República Democrática del Congo','República Dominicana',
      'Ruanda','Rumanía','Rusia','Sahara Occidental','Saint-Martin','San Cristóbal y Nieves',
      'San Marino','San Vicente','Santa Lucía','Santo Tomé y Príncipe','Senegal','Serbia',
      'Seychelles','Sierra Leona','Singapur','Sint Maarten','Siria','Somalia',
      'Sri Lanka','Sudáfrica','Sudán','Sudán del Sur','Suecia','Suiza','Surinam',
      'Svalbard','Tailandia','Taiwan','Tayikistán','Tanzania','Timor Oriental','Togo',
      'Tonga','Trinidad y Tobago','Túnez','Turkmenistán','Turquía','Tuvalu',
      'Ucrania','Uganda','Uruguay','Uzbekistán','Vanuatu','Venezuela','Vietnam',
      'Yemen','Yibuti','Zambia','Zimbabue',
    ];
    return list.map(l => ({ code: l, label: l }));
  }, []);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => { setQ(value || ''); }, [value]);

  useEffect(() => {
    const handler = e => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!q || q.length < 1) return [];
    const lower = q.toLowerCase();
    return countries.filter(c => c.label.toLowerCase().startsWith(lower)).slice(0, 8);
  }, [q, countries]);

  const handleInput = e => {
    const v = e.target.value;
    setQ(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = c => {
    setQ(c.label);
    onChange(c.label);
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        // try to canonicalize on blur
        if (q.trim()) {
          try {
            const exact = countries.find(c => c.label.toLowerCase() === q.toLowerCase());
            if (exact) { setQ(exact.label); onChange(exact.label); }
          } catch {}
        }
        setOpen(false);
      }
    }, 150);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={externalRef}
        value={q}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="País *"
        autoComplete="off"
        className={`w-full h-9 border rounded-xl px-3 text-sm outline-none transition-colors ${
          hasError ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-border bg-card focus:border-primary'
        }`}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-card border border-border rounded-xl shadow-lg">
          {suggestions.map(c => (
            <li key={c.code} onMouseDown={() => handleSelect(c)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-primary transition-colors flex items-center gap-2">
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Inline city autocomplete ─────────────────────────────────────────────────
function CityField({ country, value, onChange, placeholder = 'Ciudad...' }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => { setQ(value || ''); }, [value]);

  useEffect(() => {
    if (!country) { setCities([]); return; }
    setCities([]);
    setLoading(true);
    getTopCities(country)
      .then(c => setCities(c))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [country]);

  useEffect(() => {
    const handler = e => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = q ? cities.filter(c => c.toLowerCase().includes(q.toLowerCase())) : cities;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? 'Cargando...' : placeholder}
          autoComplete="off"
          className="w-full h-9 border border-border rounded-xl px-3 pr-7 text-sm outline-none focus:border-primary bg-card"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>
      {open && !loading && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-card border border-border rounded-xl shadow-lg">
          {filtered.map(city => (
            <li key={city} onMouseDown={() => { setQ(city); onChange(city); setOpen(false); }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-primary transition-colors">
              {city}
            </li>
          ))}
        </ul>
      )}
      {open && !loading && filtered.length === 0 && q.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg px-3 py-2.5">
          <p className="text-sm text-muted-foreground">Escribe el nombre de la ciudad</p>
          <button onMouseDown={() => { onChange(q); setOpen(false); }}
            className="mt-1.5 text-sm text-primary font-medium">
            Usar &ldquo;{q}&rdquo; →
          </button>
        </div>
      )}
      {open && !loading && cities.length === 0 && q.length === 0 && country && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg px-3 py-2.5">
          <p className="text-sm text-muted-foreground">Escribe el nombre de la ciudad</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function NewTripModal({ open, onOpenChange, onSubmit, isPending }) {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [mode, setMode] = useState('multi');
  const [dateMode, setDateMode] = useState('nights');
  const [stops, setStops] = useState(defaultStops('multi'));
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [attempted, setAttempted] = useState(false); // for validation red highlight

  // Refs for scroll-to-error
  const nameRef = useRef(null);
  const startDateRef = useRef(null);
  const firstCountryRef = useRef(null);

  const validStops = stops.filter(s => s.city.trim());
  const totalNightsEntered = stops.reduce((sum, s) => sum + (parseInt(s.nights) || 0), 0);
  const tripTotalDays = formData.start_date && formData.end_date
    ? daysBetween(formData.start_date, formData.end_date) + 1
    : null;
  const nightsAllocations = formData.start_date
    ? computeNightsDates(formData.start_date, stops.map(s => s.nights || 0))
    : [];

  let nightsError = null;
  if (formData.start_date && formData.end_date && stops.some(s => s.nights)) {
    const diff = totalNightsEntered - tripTotalDays;
    if (diff > 0) nightsError = `Sobran ${diff} noche${diff !== 1 ? 's' : ''} respecto al rango`;
    else if (diff < 0) nightsError = `Faltan ${Math.abs(diff)} noche${Math.abs(diff) !== 1 ? 's' : ''} para completar el viaje`;
  }

  const canCreate =
    formData.name.trim() &&
    stops[0]?.country?.trim() &&
    formData.start_date &&
    (!formData.end_date || formData.end_date >= formData.start_date) &&
    validStops.length > 0 &&
    !isPending;

  // ── helpers ──────────────────────────────────────────────────────────────
  function applyStopCountry(idx, country) {
    updateStop(idx, { city: '', country });
    if (idx === 0 && !currencyTouched) {
      const meta = getCountryMeta(country);
      setFormData(prev => ({
        ...prev,
        currency: meta.currency,
        currency_symbol: meta.symbol,
        language: meta.languageLabel,
        language_code: meta.languageCode,
      }));
    }
  }

  function setMode_(m) { setMode(m); setStops(defaultStops(m)); }
  function updateStop(idx, patch) { setStops(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s)); }
  function updateStopManual(idx, patch) { setStops(prev => prev.map((s, i) => i === idx ? { ...s, manual: { ...s.manual, ...patch } } : s)); }
  function addStop() { setStops(prev => [...prev, { city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } }]); }
  function removeStop(idx) { setStops(prev => prev.filter((_, i) => i !== idx)); }

  function autoDistributeNights() {
    if (!formData.start_date) return;
    const count = stops.length;
    if (formData.end_date) {
      const total = daysBetween(formData.start_date, formData.end_date) + 1;
      const base = Math.floor(total / count);
      const extra = total % count;
      setStops(prev => prev.map((s, i) => ({ ...s, nights: String(base + (i < extra ? 1 : 0)) })));
    } else {
      setStops(prev => prev.map(s => ({ ...s, nights: s.nights || '3' })));
    }
  }

  function autoDistributeManual() {
    if (!formData.start_date || !formData.end_date) return;
    const allocs = autoDistribute(formData.start_date, formData.end_date, stops.length);
    setStops(prev => prev.map((s, i) => ({ ...s, manual: { start_date: allocs[i]?.start_date || '', end_date: allocs[i]?.end_date || '' } })));
  }

  function computedTripEndDate() {
    if (formData.end_date) return formData.end_date;
    if (formData.start_date && totalNightsEntered > 0) return addDays(formData.start_date, totalNightsEntered - 1);
    return '';
  }

  function handleSubmit() {
    setAttempted(true);

    // Scroll to first error
    if (!formData.name.trim()) { nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); nameRef.current?.focus(); return; }
    if (!formData.start_date) { startDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); startDateRef.current?.focus(); return; }
    if (!stops[0]?.country?.trim()) { firstCountryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstCountryRef.current?.focus(); return; }
    if (validStops.length === 0) return;

    const tripCities = validStops;
    let allocations = [];
    if (mode === 'single') {
      const endDate = computedTripEndDate();
      allocations = [{ start_date: formData.start_date, end_date: endDate }];
    } else if (dateMode === 'nights') {
      allocations = computeNightsDates(formData.start_date, tripCities.map(s => s.nights || 1));
    } else {
      allocations = tripCities.map(s => s.manual);
    }

    const finalEndDate = computedTripEndDate();
    const firstCountry = tripCities[0]?.country || '';
    const firstMeta = getCountryMeta(firstCountry);
    onSubmit({
      formData: {
        ...formData,
        end_date: finalEndDate,
        country: normalizeCountry(firstCountry),
        destination: tripCities.map(s => s.city).join(' → '),
        ...(!currencyTouched ? {
          currency: firstMeta.currency,
          currency_symbol: firstMeta.symbol,
          language: firstMeta.languageLabel,
          language_code: firstMeta.languageCode,
        } : {}),
      },
      stops: tripCities.map(s => s.city),
      stopCountries: tripCities.map(s => normalizeCountry(s.country || firstCountry)),
      allocations,
      selectedTemplate: null,
    });
  }

  function handleClose() {
    onOpenChange(false);
    setFormData({ ...DEFAULT_FORM });
    setMode('multi');
    setDateMode('nights');
    setStops(defaultStops('multi'));
    setCurrencyTouched(false);
    setAttempted(false);
  }

  const missingName = attempted && !formData.name.trim();
  const missingStart = attempted && !formData.start_date;
  const missingCountry = attempted && !stops[0]?.country?.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">✈️ Nuevo viaje</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">

          {/* 1. Nombre */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Nombre del viaje <span className="text-primary">*</span>
            </label>
            <input
              ref={nameRef}
              placeholder="ej. Mamma mía 2026"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className={`w-full h-10 border rounded-xl px-3 text-sm outline-none transition-colors ${
                missingName ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-border bg-card focus:border-primary'
              }`}
            />
            {missingName && <p className="text-xs text-red-500 mt-1">El nombre es obligatorio</p>}
          </div>

          {/* 2. Modo */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo de viaje</label>
            <div className="flex rounded-xl border border-border overflow-hidden max-w-xs">
              {[['single','1 destino'],['multi','Multi-ciudad']].map(([v,l]) => (
                <button key={v} type="button" onClick={() => setMode_(v)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === v ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Fechas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Fecha inicio <span className="text-primary">*</span>
              </label>
              <input
                ref={startDateRef}
                type="date"
                value={formData.start_date}
                onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))}
                className={`w-full h-10 border rounded-xl px-3 text-sm outline-none transition-colors ${
                  missingStart ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-border bg-card focus:border-primary'
                }`}
              />
              {missingStart && <p className="text-xs text-red-500 mt-1">La fecha de inicio es obligatoria</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Fecha fin <span className="text-muted-foreground font-normal text-xs">(o se calcula por noches)</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date || undefined}
                onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-card"
              />
            </div>
          </div>

          {/* 4. Paradas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Destino{mode === 'multi' ? 's' : ''} <span className="text-primary">*</span>
              </label>
              <div className="flex items-center gap-2">
                {mode === 'multi' && formData.start_date && (
                  <div className="flex gap-1">
                    {[{v:'nights',l:'Noches'},{v:'manual',l:'Manual'}].map(({v,l}) => (
                      <button key={v} type="button" onClick={() => setDateMode(v)}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                          dateMode === v ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}>{l}</button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {mode === 'multi' && formData.start_date && stops.length > 1 && (
              <button type="button" onClick={dateMode === 'nights' ? autoDistributeNights : autoDistributeManual}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors -mt-1">
                <Shuffle className="w-3.5 h-3.5" />Auto-repartir
              </button>
            )}

            <div className="space-y-2">
              {stops.map((stop, idx) => (
                <div key={idx} className={`bg-white border rounded-xl p-3 space-y-2 ${idx === 0 && missingCountry ? 'border-red-300' : 'border-border'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-40 flex-shrink-0">
                      <CountryField
                        ref={idx === 0 ? firstCountryRef : null}
                        value={stop.country}
                        onChange={v => applyStopCountry(idx, v)}
                        hasError={idx === 0 && missingCountry}
                      />
                    </div>
                    <div className="flex-1">
                      <CityField
                        key={stop.country}
                        country={stop.country}
                        value={stop.city}
                        onChange={v => updateStop(idx, { city: v })}
                        placeholder={`Ciudad ${idx + 1}...`}
                      />
                    </div>
                    {mode === 'multi' && stops.length > 1 && (
                      <button type="button" onClick={() => removeStop(idx)} className="text-muted-foreground hover:text-destructive flex-shrink-0 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {formData.start_date && (
                    <>
                      {mode === 'single' ? (
                        computedTripEndDate() ? (
                          <p className="text-xs text-primary font-medium pl-1">📅 {formData.start_date} → {computedTripEndDate()}</p>
                        ) : null
                      ) : dateMode === 'nights' ? (
                        <div className="flex items-center gap-2 pl-1">
                          <input type="number" min="1" placeholder="noches"
                            value={stop.nights}
                            onChange={e => updateStop(idx, { nights: e.target.value })}
                            className="w-20 h-8 border border-border rounded-lg px-2 text-sm outline-none focus:border-primary bg-secondary"
                          />
                          <span className="text-xs text-muted-foreground">noches</span>
                          {stop.nights && nightsAllocations[idx] && (
                            <span className="text-xs text-primary font-medium">
                              {nightsAllocations[idx].start_date} → {nightsAllocations[idx].end_date}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pl-1 flex-wrap">
                          <input type="date" value={stop.manual.start_date}
                            min={formData.start_date || undefined} max={formData.end_date || undefined}
                            onChange={e => updateStopManual(idx, { start_date: e.target.value })}
                            className="w-36 h-8 border border-border rounded-lg px-2 text-xs outline-none focus:border-primary bg-secondary"
                          />
                          <span className="text-xs text-muted-foreground">→</span>
                          <input type="date" value={stop.manual.end_date}
                            min={stop.manual.start_date || formData.start_date || undefined} max={formData.end_date || undefined}
                            onChange={e => updateStopManual(idx, { end_date: e.target.value })}
                            className="w-36 h-8 border border-border rounded-lg px-2 text-xs outline-none focus:border-primary bg-secondary"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {mode === 'multi' && (
              <button type="button" onClick={addStop}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-primary font-medium border border-dashed border-primary/40 rounded-xl py-2.5 hover:bg-orange-50 transition-colors">
                <Plus className="w-4 h-4" />Añadir parada
              </button>
            )}

            {missingCountry && <p className="text-xs text-red-500">El país de la primera parada es obligatorio</p>}

            {mode === 'multi' && dateMode === 'nights' && formData.start_date && (
              <div className="pl-1 space-y-1">
                {nightsError ? (
                  <p className="text-xs text-destructive font-medium">⚠️ {nightsError}</p>
                ) : totalNightsEntered > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{totalNightsEntered} noches</span>
                    {' '}· Fin: <span className="font-medium text-primary">{addDays(formData.start_date, totalNightsEntered - 1)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={isPending}
            >
              {isPending ? 'Creando...' : 'Crear viaje'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}