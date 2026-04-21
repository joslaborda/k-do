import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import TripTemplates from '@/components/trip/TripTemplates';
import CountryInput from '@/components/trip/CountryInput';
import CityInput from '@/components/trip/CityInput';
import { toast } from '@/components/ui/use-toast';
import TripCard from '@/components/trip/TripCard';
import { getCountryMeta } from '@/lib/countryConfig';

// Extended currency options
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

function currencySymbolFromCode(code) {
  const found = [
    { v: 'EUR', s: '€' }, { v: 'USD', s: '$' }, { v: 'GBP', s: '£' },
    { v: 'JPY', s: '¥' }, { v: 'CHF', s: 'Fr' }, { v: 'THB', s: '฿' },
    { v: 'KRW', s: '₩' }, { v: 'CNY', s: '¥' }, { v: 'VND', s: '₫' },
    { v: 'MAD', s: 'DH' }, { v: 'TRY', s: '₺' }, { v: 'BRL', s: 'R$' },
    { v: 'IDR', s: 'Rp' }, { v: 'INR', s: '₹' }, { v: 'PHP', s: '₱' },
    { v: 'MYR', s: 'RM' }, { v: 'ZAR', s: 'R' }, { v: 'CLP', s: '$' },
    { v: 'PEN', s: 'S/' }, { v: 'AED', s: 'د.إ' }, { v: 'NOK', s: 'kr' },
    { v: 'SEK', s: 'kr' }, { v: 'DKK', s: 'kr' }, { v: 'PLN', s: 'zł' },
    { v: 'CZK', s: 'Kč' }, { v: 'HUF', s: 'Ft' }, { v: 'RUB', s: '₽' },
  ].find((x) => x.v === code);
  return found?.s || '$';
}

function distributeDates(startDateStr, endDateStr, stopsCount) {
  if (!startDateStr || !endDateStr || !stopsCount || stopsCount <= 0) return [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  if (totalDays <= 0) return [];
  const base = Math.floor(totalDays / stopsCount);
  const extra = totalDays % stopsCount;
  const allocations = [];
  let cursor = new Date(start);
  for (let i = 0; i < stopsCount; i++) {
    const len = Math.max(1, base + (i < extra ? 1 : 0));
    const s = new Date(cursor);
    const e = new Date(cursor);
    e.setDate(e.getDate() + len - 1);
    allocations.push({ start_date: s.toISOString().slice(0, 10), end_date: e.toISOString().slice(0, 10) });
    cursor.setDate(cursor.getDate() + len);
  }
  return allocations;
}

const DEFAULT_FORM = {
  name: '', country: 'España', start_date: '', end_date: '',
  description: '', cover_image: '',
  currency: 'EUR', currency_symbol: '€',
  language: 'Español', language_code: 'es-ES',
};

export default function TripsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [mode, setMode] = useState('multi');
  const [stops, setStops] = useState(['', '']);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 60000,
  });

  const tripCards = useMemo(() => {
    return trips.map((trip) => {
      const tripCities = allCities.filter((c) => c.trip_id === trip.id);
      return <TripCard key={trip.id} trip={trip} cities={tripCities} />;
    });
  }, [trips, allCities]);

  function applyCountry(country) {
    const meta = getCountryMeta(country);
    setFormData((prev) => ({
      ...prev,
      country,
      ...(!currencyTouched ? {
        currency: meta.currency,
        currency_symbol: meta.symbol,
        language: meta.languageLabel,
        language_code: meta.languageCode,
      } : {}),
    }));
    setStops((prev) => prev.map(() => ''));
  }

  function setCurrency(value) {
    setCurrencyTouched(true);
    setFormData((prev) => ({ ...prev, currency: value, currency_symbol: currencySymbolFromCode(value) }));
  }

  function setStop(idx, value) {
    setStops((prev) => prev.map((s, i) => (i === idx ? value : s)));
  }

  function addStop() {
    setStops((prev) => [...prev, '']);
  }

  function removeStop(idx) {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  }

  function setModeValue(value) {
    setMode(value);
    if (value === 'single') setStops((prev) => [prev[0] || '']);
    else setStops((prev) => (prev.length >= 2 ? prev : [...prev, '']));
  }

  function normalizeStops() {
    const clean = stops.map((s) => (s || '').trim()).filter(Boolean);
    return mode === 'single' ? clean.slice(0, 1) : clean;
  }

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const email = user?.email;
      const userId = user?.id;
      const tripCities = normalizeStops();
      const destinationString = tripCities.join(' → ');
      const roles = email ? { [email]: 'admin' } : {};
      const members = email ? [email] : [];

      const trip = await base44.entities.Trip.create({
        ...data,
        destination: destinationString,
        members,
        roles,
      });

      const endForSplit = data.end_date || data.start_date;
      const allocations = distributeDates(data.start_date, endForSplit, tripCities.length);

      for (let i = 0; i < tripCities.length; i++) {
        const dates = allocations[i] || { start_date: data.start_date, end_date: endForSplit };
        await base44.entities.City.create({
          trip_id: trip.id,
          name: tripCities[i],
          country: data.country,
          order: i,
          start_date: dates.start_date,
          end_date: dates.end_date,
        });
      }

      if (selectedTemplate?.packingItems?.length) {
        await Promise.all(
          selectedTemplate.packingItems.map((item) =>
            base44.entities.PackingItem.create({ ...item, trip_id: trip.id, user_id: userId, packed: false })
          )
        );
        toast({ title: 'Viaje creado! 🎉', description: `${selectedTemplate.packingItems.length} articulos añadidos a tu maleta` });
      }

      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allCities'] });
      setDialogOpen(false);
      setSelectedTemplate(null);
      setCurrencyTouched(false);
      setMode('multi');
      setStops(['', '']);
      setFormData({ ...DEFAULT_FORM });
    },
  });

  const canCreate = (() => {
    const tripCities = normalizeStops();
    const datesOk = !formData.end_date || formData.end_date >= formData.start_date;
    return formData.name.trim() && formData.country.trim() && formData.start_date && datesOk && tripCities.length > 0 && !createMutation.isPending;
  })();

  const meta = getCountryMeta(formData.country);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-orange-700 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight">Kodo</h1>
            <p className="text-white/90 text-base font-medium mt-0.5">Travel your way</p>
            <p className="text-white/60 text-sm mt-1">Tu proximo viaje empieza aqui</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-5 shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />Crear viaje
          </Button>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 py-8 max-w-6xl">
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Aun no tienes viajes</h2>
            <p className="text-muted-foreground text-sm mb-6">Crea tu primer viaje y empieza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Plus className="w-4 h-4 mr-1.5" />Crear tu primer viaje
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Tus viajes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{tripCards}</div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">✈️ Nuevo Viaje</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
              <Input placeholder="ej. Italia 2026" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="bg-input border-border text-foreground" />
            </div>

            {/* País + Modo */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País *</label>
                <CountryInput value={formData.country} onChange={applyCountry} />
                {formData.country && (
                  <p className="text-xs text-muted-foreground mt-1">{meta.flag} {meta.currency} · {meta.languageLabel}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Modo</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={mode === 'single' ? 'default' : 'outline'} className={mode === 'single' ? 'bg-orange-700 hover:bg-orange-800' : ''} onClick={() => setModeValue('single')}>1 parada</Button>
                  <Button type="button" variant={mode === 'multi' ? 'default' : 'outline'} className={mode === 'multi' ? 'bg-orange-700 hover:bg-orange-800' : ''} onClick={() => setModeValue('multi')}>Multi-ciudad</Button>
                </div>
              </div>
            </div>

            {/* Destinos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Destino{mode === 'multi' ? 's' : ''} *</label>
                {mode === 'multi' && <Button type="button" variant="outline" onClick={addStop}>+ Añadir ciudad</Button>}
              </div>
              <div className="space-y-2">
                {stops.map((stop, idx) => (
                  <div key={idx} className="bg-white border border-border rounded-xl p-3 flex items-start gap-2">
                    <div className="flex-1">
                      <CityInput
                        country={formData.country}
                        value={stop}
                        onChange={(v) => setStop(idx, v)}
                        placeholder={`Ciudad ${idx + 1}...`}
                      />
                    </div>
                    {mode === 'multi' && stops.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(idx)} className="text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Moneda */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda del viaje</label>
                <Select value={formData.currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
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

            {/* Fechas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripcion</label>
              <Textarea placeholder="Describe tu viaje..." value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="bg-input border-border text-foreground" />
            </div>

            {/* Cover image */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              {formData.cover_image && (
                <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted">
                  <img src={formData.cover_image} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <Input placeholder="https://images.unsplash.com/..." value={formData.cover_image} onChange={(e) => setFormData((p) => ({ ...p, cover_image: e.target.value }))} className="bg-input border-border text-foreground" />
            </div>

            {/* Templates */}
            <div className="pt-4 border-t border-border">
              <TripTemplates onSelect={setSelectedTemplate} />
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary flex items-center gap-2"><span>{selectedTemplate.emoji}</span><span>Plantilla "{selectedTemplate.name}" seleccionada</span></p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={() => createMutation.mutate(formData)} className="bg-orange-700 hover:bg-orange-800" disabled={!canCreate}>
                {createMutation.isPending ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}