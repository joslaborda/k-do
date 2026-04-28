import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Shuffle } from 'lucide-react';
import CountryInput from '@/components/trip/CountryInput';
import CityInput from '@/components/trip/CityInput';
import TripTemplates from '@/components/trip/TripTemplates';
import { getCountryMeta } from '@/lib/countryConfig';

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
];

function currencySymbol(code) {
  const map = { EUR:'€', USD:'$', GBP:'£', JPY:'¥', CHF:'Fr', THB:'฿', KRW:'₩', CNY:'¥', VND:'₫', MAD:'DH',
    TRY:'₺', BRL:'R$', IDR:'Rp', INR:'₹', PHP:'₱', MYR:'RM', ZAR:'R', CLP:'$', PEN:'S/', AED:'د.إ',
    NOK:'kr', SEK:'kr', DKK:'kr', PLN:'zł', CZK:'Kč', HUF:'Ft', RUB:'₽' };
  return map[code] || '$';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// Given an array of nights and a start date, compute sequential date ranges
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

// Equitable distribution of total days across N stops
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

// ─── Default state ────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  name: '', start_date: '', end_date: '',
  description: '', cover_image: '',
  currency: 'EUR', currency_symbol: '€',
  language: 'Español', language_code: 'es-ES',
};

function defaultStops(mode) {
  return mode === 'single' ? [{ city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } }]
    : [{ city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } },
       { city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } }];
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function NewTripModal({ open, onOpenChange, onSubmit, isPending }) {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [mode, setMode] = useState('multi'); // 'single' | 'multi'
  const [dateMode, setDateMode] = useState('nights'); // 'nights' | 'manual'
  const [stops, setStops] = useState(defaultStops('multi'));
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const validStops = stops.filter((s) => s.city.trim());

  // Nights mode: total nights entered
  const totalNightsEntered = stops.reduce((sum, s) => sum + (parseInt(s.nights) || 0), 0);

  // Trip total days (from dates)
  const tripTotalDays = formData.start_date && formData.end_date
    ? daysBetween(formData.start_date, formData.end_date) + 1
    : null;

  // Computed date allocations for preview
  const nightsAllocations = formData.start_date
    ? computeNightsDates(formData.start_date, stops.map((s) => s.nights || 0))
    : [];

  // Nights overflow/underflow
  let nightsError = null;
  if (formData.start_date && formData.end_date && stops.some((s) => s.nights)) {
    const diff = totalNightsEntered - tripTotalDays;
    if (diff > 0) nightsError = `Sobran ${diff} noche${diff !== 1 ? 's' : ''} respecto al rango del viaje`;
    else if (diff < 0) nightsError = `Faltan ${Math.abs(diff)} noche${Math.abs(diff) !== 1 ? 's' : ''} para completar el viaje`;
  }

  // Manual date validation
  const manualErrors = [];
  if (dateMode === 'manual') {
    for (let i = 0; i < stops.length; i++) {
      const { start_date, end_date } = stops[i].manual;
      if (!start_date || !end_date) continue;
      if (end_date < start_date) manualErrors.push(`Parada ${i + 1}: fin < inicio`);
      if (formData.start_date && start_date < formData.start_date)
        manualErrors.push(`Parada ${i + 1}: inicio antes del viaje (${formData.start_date})`);
      if (formData.end_date && end_date > formData.end_date)
        manualErrors.push(`Parada ${i + 1}: fin después del viaje (${formData.end_date})`);
      if (i > 0) {
        const prevEnd = stops[i - 1].manual.end_date;
        if (prevEnd && start_date < prevEnd)
          manualErrors.push(`Parada ${i + 1}: solape con parada anterior`);
      }
    }
  }

  const canCreate =
    formData.name.trim() &&
    stops[0]?.country?.trim() &&
    formData.start_date &&
    (!formData.end_date || formData.end_date >= formData.start_date) &&
    validStops.length > 0 &&
    (dateMode !== 'manual' || manualErrors.length === 0) &&
    !isPending;

  // ── event handlers ────────────────────────────────────────────────────────
  // When first stop's country changes, update trip-level currency/language
  function applyStopCountry(idx, country) {
    updateStop(idx, { city: '', country });
    if (idx === 0 && !currencyTouched) {
      const meta = getCountryMeta(country);
      setFormData((prev) => ({
        ...prev,
        currency: meta.currency,
        currency_symbol: meta.symbol,
        language: meta.languageLabel,
        language_code: meta.languageCode,
      }));
    }
  }

  function setMode_(m) {
    setMode(m);
    setStops(defaultStops(m));
  }

  function updateStop(idx, patch) {
    setStops((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }

  function updateStopManual(idx, patch) {
    setStops((prev) => prev.map((s, i) => i === idx ? { ...s, manual: { ...s.manual, ...patch } } : s));
  }

  function addStop() {
    setStops((prev) => [...prev, { city: '', country: '', nights: '', manual: { start_date: '', end_date: '' } }]);
  }

  function removeStop(idx) {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  }

  // Auto-distribute
  function autoDistributeNights() {
    if (!formData.start_date) return;
    const count = stops.length;
    if (formData.end_date) {
      const total = daysBetween(formData.start_date, formData.end_date) + 1;
      const base = Math.floor(total / count);
      const extra = total % count;
      setStops((prev) => prev.map((s, i) => ({ ...s, nights: String(base + (i < extra ? 1 : 0)) })));
    } else {
      // Default to 3 nights each if no end date
      setStops((prev) => prev.map((s) => ({ ...s, nights: s.nights || '3' })));
    }
  }

  function autoDistributeManual() {
    if (!formData.start_date || !formData.end_date) return;
    const allocs = autoDistribute(formData.start_date, formData.end_date, stops.length);
    setStops((prev) => prev.map((s, i) => ({
      ...s,
      manual: { start_date: allocs[i]?.start_date || '', end_date: allocs[i]?.end_date || '' },
    })));
  }

  // Compute final end date for trip (when no end_date set, use nights total)
  function computedTripEndDate() {
    if (formData.end_date) return formData.end_date;
    if (formData.start_date && totalNightsEntered > 0) {
      return addDays(formData.start_date, totalNightsEntered - 1);
    }
    return '';
  }

  function handleSubmit() {
    const tripCities = validStops;
    let allocations = [];

    if (mode === 'single') {
      const endDate = computedTripEndDate();
      allocations = [{ start_date: formData.start_date, end_date: endDate }];
    } else if (dateMode === 'nights') {
      allocations = computeNightsDates(formData.start_date, tripCities.map((s) => s.nights || 1));
    } else {
      allocations = tripCities.map((s) => s.manual);
    }

    const finalEndDate = computedTripEndDate();
    // Country of first stop is the trip's main country
    const firstCountry = tripCities[0]?.country || '';
    const firstMeta = getCountryMeta(firstCountry);
    onSubmit({
      formData: {
        ...formData,
        end_date: finalEndDate,
        country: firstCountry,
        destination: tripCities.map((s) => s.city).join(' → '),
        ...(!currencyTouched ? {
          currency: firstMeta.currency,
          currency_symbol: firstMeta.symbol,
          language: firstMeta.languageLabel,
          language_code: firstMeta.languageCode,
        } : {}),
      },
      stops: tripCities.map((s) => s.city),
      stopCountries: tripCities.map((s) => s.country || firstCountry),
      allocations,
      selectedTemplate,
    });
  }

  function handleClose() {
    onOpenChange(false);
    // Reset
    setFormData({ ...DEFAULT_FORM });
    setMode('multi');
    setDateMode('nights');
    setStops(defaultStops('multi'));
    setCurrencyTouched(false);
    setSelectedTemplate(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">✈️ Nuevo Viaje</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">

          {/* ── 1. Nombre ── */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
            <Input
              placeholder="ej. Mamma mía 2026"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* ── 2. Modo ── */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Modo</label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <Button type="button" variant={mode === 'single' ? 'default' : 'outline'}
                className={mode === 'single' ? 'bg-orange-700 hover:bg-orange-800' : ''}
                onClick={() => setMode_('single')}>1 parada</Button>
              <Button type="button" variant={mode === 'multi' ? 'default' : 'outline'}
                className={mode === 'multi' ? 'bg-orange-700 hover:bg-orange-800' : ''}
                onClick={() => setMode_('multi')}>Multi-ciudad</Button>
            </div>
          </div>

          {/* ── 3. Fechas del viaje ── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
              <Input type="date" value={formData.start_date}
                onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Fecha fin <span className="text-muted-foreground font-normal">(o se calcula por noches)</span>
              </label>
              <Input type="date" value={formData.end_date}
                min={formData.start_date || undefined}
                onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))} />
            </div>
          </div>

          {/* ── 4. Paradas ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Destino{mode === 'multi' ? 's' : ''} *
              </label>
              <div className="flex items-center gap-2">
                {/* Date mode toggle (only multi) */}
                {mode === 'multi' && formData.start_date && (
                  <div className="flex gap-1">
                    {[{ v: 'nights', l: 'Noches' }, { v: 'manual', l: 'Manual' }].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => setDateMode(v)}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                          dateMode === v ? 'bg-orange-700 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}>{l}</button>
                    ))}
                  </div>
                )}
                {mode === 'multi' && (
                  <Button type="button" variant="outline" size="sm" onClick={addStop}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Añadir ciudad
                  </Button>
                )}
              </div>
            </div>

            {/* Auto-repartir */}
            {mode === 'multi' && formData.start_date && stops.length > 1 && (
              <Button type="button" variant="ghost" size="sm"
                className="text-orange-700 hover:text-orange-800 hover:bg-orange-50 -mt-1"
                onClick={dateMode === 'nights' ? autoDistributeNights : autoDistributeManual}>
                <Shuffle className="w-3.5 h-3.5 mr-1.5" />Auto-repartir noches
              </Button>
            )}

            {/* Stop rows */}
            <div className="space-y-2">
              {stops.map((stop, idx) => (
                <div key={idx} className="bg-white border border-border rounded-xl p-3 space-y-2">
                  {/* Country + City + remove */}
                  <div className="flex items-center gap-2">
                    <div className="w-40 flex-shrink-0">
                      <CountryInput
                        value={stop.country}
                        onChange={(v) => applyStopCountry(idx, v)}
                        placeholder="País..."
                      />
                    </div>
                    <div className="flex-1">
                      <CityInput
                        key={stop.country}
                        country={stop.country}
                        value={stop.city}
                        onChange={(v) => updateStop(idx, { city: v })}
                        placeholder={`Ciudad ${idx + 1}...`}
                      />
                    </div>
                    {mode === 'multi' && stops.length > 1 && (
                      <Button type="button" variant="ghost" size="icon"
                        onClick={() => removeStop(idx)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Date assignment inline (only if start_date set and multi, or single) */}
                  {formData.start_date && (mode === 'multi' || mode === 'single') && (
                    <>
                      {/* SINGLE mode: just show computed dates, no input needed */}
                      {mode === 'single' ? (
                        computedTripEndDate() ? (
                          <p className="text-xs text-orange-600 font-medium pl-1">
                            📅 {formData.start_date} → {computedTripEndDate()}
                          </p>
                        ) : null
                      ) : dateMode === 'nights' ? (
                        /* MULTI + nights */
                        <div className="flex items-center gap-2 pl-1">
                          <Input
                            type="number" min="1" placeholder="noches"
                            value={stop.nights}
                            onChange={(e) => updateStop(idx, { nights: e.target.value })}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">noches</span>
                          {stop.nights && nightsAllocations[idx] && (
                            <span className="text-xs text-orange-600 font-medium">
                              {nightsAllocations[idx].start_date} → {nightsAllocations[idx].end_date}
                            </span>
                          )}
                        </div>
                      ) : (
                        /* MULTI + manual */
                        <div className="flex items-center gap-2 pl-1 flex-wrap">
                          <Input
                            type="date"
                            value={stop.manual.start_date}
                            min={formData.start_date || undefined}
                            max={formData.end_date || undefined}
                            onChange={(e) => updateStopManual(idx, { start_date: e.target.value })}
                            className="w-36 h-8 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">→</span>
                          <Input
                            type="date"
                            value={stop.manual.end_date}
                            min={stop.manual.start_date || formData.start_date || undefined}
                            max={formData.end_date || undefined}
                            onChange={(e) => updateStopManual(idx, { end_date: e.target.value })}
                            className="w-36 h-8 text-xs"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Nights summary / errors */}
            {mode === 'multi' && dateMode === 'nights' && formData.start_date && (
              <div className="pl-1 space-y-1">
                {nightsError ? (
                  <p className="text-xs text-destructive font-medium">⚠️ {nightsError}</p>
                ) : totalNightsEntered > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">{totalNightsEntered} noches</span>
                    {' '}· Fin calculado:{' '}
                    <span className="font-semibold text-orange-600">
                      {addDays(formData.start_date, totalNightsEntered - 1)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Manual errors */}
            {mode === 'multi' && dateMode === 'manual' && manualErrors.length > 0 && (
              <div className="space-y-0.5 pl-1">
                {manualErrors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">⚠️ {err}</p>
                ))}
              </div>
            )}
          </div>

          {/* ── 5. Moneda + idioma ── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda</label>
              <Select value={formData.currency} onValueChange={(v) => {
                setCurrencyTouched(true);
                setFormData((p) => ({ ...p, currency: v, currency_symbol: currencySymbol(v) }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Idioma destino</label>
              <div className="bg-white border border-border rounded-md px-3 py-2 text-sm">
                <div className="font-semibold">{formData.language}</div>
                <div className="text-xs text-muted-foreground">{formData.language_code}</div>
              </div>
            </div>
          </div>

          {/* ── 6. Descripción + imagen ── */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
            <Textarea placeholder="Describe tu viaje..." value={formData.description} rows={2}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
            {formData.cover_image && (
              <div className="mb-2 rounded-lg overflow-hidden h-24 bg-muted">
                <img src={formData.cover_image} alt="preview" className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            <Input placeholder="https://images.unsplash.com/..." value={formData.cover_image}
              onChange={(e) => setFormData((p) => ({ ...p, cover_image: e.target.value }))} />
          </div>

          {/* ── 7. Plantillas ── */}
          <div className="pt-2 border-t border-border">
            <TripTemplates onSelect={setSelectedTemplate} />
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-primary">{selectedTemplate.emoji} Plantilla "{selectedTemplate.name}" seleccionada</p>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="button" onClick={handleSubmit}
              className="bg-orange-700 hover:bg-orange-800 text-white"
              disabled={!canCreate}>
              {isPending ? 'Creando...' : 'Crear Viaje'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}