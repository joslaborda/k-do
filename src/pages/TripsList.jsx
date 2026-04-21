import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import TripTemplates from '@/components/trip/TripTemplates';
import { toast } from '@/components/ui/use-toast';
import TripCard from '@/components/trip/TripCard';

function normalizeText(str = '') {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function splitDestination(str = '') {
  const s = normalizeText(str);
  if (!s) return [];
  return s
    .replace(/[()]/g, ' ')
    .replace(/&/g, ' y ')
    .replace(/\+/g, ' y ')
    .replace(/->/g, ' ')
    .replace(/→/g, ' ')
    .replace(/\//g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

const COUNTRY_PRESETS = [
  { keys: ['japan', 'japon', 'japón', 'jp'], display: 'Japón', currency: 'JPY', symbol: '¥', language: 'Japanese', languageCode: 'ja-JP' },
  { keys: ['italy', 'italia', 'it'], display: 'Italia', currency: 'EUR', symbol: '€', language: 'Italian', languageCode: 'it-IT' },
  { keys: ['france', 'francia', 'fr'], display: 'Francia', currency: 'EUR', symbol: '€', language: 'French', languageCode: 'fr-FR' },
  { keys: ['spain', 'espana', 'españa', 'es'], display: 'España', currency: 'EUR', symbol: '€', language: 'Spanish', languageCode: 'es-ES' },
  { keys: ['portugal', 'pt'], display: 'Portugal', currency: 'EUR', symbol: '€', language: 'Portuguese', languageCode: 'pt-PT' },
  { keys: ['germany', 'alemania', 'de'], display: 'Alemania', currency: 'EUR', symbol: '€', language: 'German', languageCode: 'de-DE' },
  { keys: ['united kingdom', 'uk', 'reino unido', 'england', 'britain'], display: 'Reino Unido', currency: 'GBP', symbol: '£', language: 'English', languageCode: 'en-GB' },
  { keys: ['united states', 'usa', 'estados unidos', 'eeuu'], display: 'Estados Unidos', currency: 'USD', symbol: '$', language: 'English', languageCode: 'en-US' },
  { keys: ['mexico', 'méxico', 'mx'], display: 'México', currency: 'MXN', symbol: '$', language: 'Spanish', languageCode: 'es-MX' },
  { keys: ['argentina', 'ar'], display: 'Argentina', currency: 'ARS', symbol: '$', language: 'Spanish', languageCode: 'es-AR' },
  { keys: ['brazil', 'brasil', 'br'], display: 'Brasil', currency: 'BRL', symbol: 'R$', language: 'Portuguese', languageCode: 'pt-BR' },
  { keys: ['thailand', 'tailandia', 'th'], display: 'Tailandia', currency: 'THB', symbol: '฿', language: 'Thai', languageCode: 'th-TH' },
  { keys: ['south korea', 'korea', 'corea', 'corea del sur', 'kr'], display: 'Corea del Sur', currency: 'KRW', symbol: '₩', language: 'Korean', languageCode: 'ko-KR' },
  { keys: ['china', 'cn'], display: 'China', currency: 'CNY', symbol: '¥', language: 'Chinese', languageCode: 'zh-CN' },
  { keys: ['vietnam', 'vn'], display: 'Vietnam', currency: 'VND', symbol: '₫', language: 'Vietnamese', languageCode: 'vi-VN' },
  { keys: ['singapore', 'singapur', 'sg'], display: 'Singapur', currency: 'SGD', symbol: '$', language: 'English', languageCode: 'en-SG' },
  { keys: ['indonesia', 'id'], display: 'Indonesia', currency: 'IDR', symbol: 'Rp', language: 'Indonesian', languageCode: 'id-ID' },
  { keys: ['morocco', 'marruecos', 'ma'], display: 'Marruecos', currency: 'MAD', symbol: 'DH', language: 'Arabic', languageCode: 'ar-MA' },
  { keys: ['turkey', 'turquia', 'turquía', 'tr'], display: 'Turquía', currency: 'TRY', symbol: '₺', language: 'Turkish', languageCode: 'tr-TR' },
  { keys: ['switzerland', 'suiza', 'ch'], display: 'Suiza', currency: 'CHF', symbol: 'Fr', language: 'German', languageCode: 'de-CH' },
  { keys: ['greece', 'grecia', 'gr'], display: 'Grecia', currency: 'EUR', symbol: '€', language: 'Greek', languageCode: 'el-GR' },
];

function getPresetForCountry(countryInput) {
  const n = normalizeText(countryInput);
  if (!n) return null;
  return (
    COUNTRY_PRESETS.find(p => p.keys.includes(n)) ||
    COUNTRY_PRESETS.find(p => p.keys.some(k => n.includes(k) || k.includes(n))) ||
    null
  );
}

const CITY_TO_COUNTRY = [
  { city: ['tokyo', 'tokio'], country: 'Japón' },
  { city: ['kyoto'], country: 'Japón' },
  { city: ['osaka'], country: 'Japón' },
  { city: ['hiroshima'], country: 'Japón' },
  { city: ['nara'], country: 'Japón' },
  { city: ['hakone'], country: 'Japón' },
  { city: ['sapporo'], country: 'Japón' },
  { city: ['fukuoka'], country: 'Japón' },
  { city: ['nikko'], country: 'Japón' },

  { city: ['rome', 'roma'], country: 'Italia' },
  { city: ['milan', 'milano'], country: 'Italia' },
  { city: ['florence', 'firenze'], country: 'Italia' },
  { city: ['venice', 'venezia'], country: 'Italia' },
  { city: ['naples', 'napoli'], country: 'Italia' },
  { city: ['turin', 'torino'], country: 'Italia' },
  { city: ['bologna'], country: 'Italia' },
  { city: ['pisa'], country: 'Italia' },

  { city: ['paris'], country: 'Francia' },
  { city: ['lyon'], country: 'Francia' },
  { city: ['marseille', 'marsella'], country: 'Francia' },
  { city: ['nice', 'niza'], country: 'Francia' },

  { city: ['madrid'], country: 'España' },
  { city: ['barcelona'], country: 'España' },
  { city: ['valencia'], country: 'España' },
  { city: ['sevilla', 'seville'], country: 'España' },
  { city: ['malaga', 'málaga'], country: 'España' },
  { city: ['bilbao'], country: 'España' },

  { city: ['london', 'londres'], country: 'Reino Unido' },
  { city: ['manchester'], country: 'Reino Unido' },
  { city: ['edinburgh', 'edimburgo'], country: 'Reino Unido' },

  { city: ['new york', 'nyc'], country: 'Estados Unidos' },
  { city: ['los angeles', 'la'], country: 'Estados Unidos' },
  { city: ['san francisco'], country: 'Estados Unidos' },
  { city: ['miami'], country: 'Estados Unidos' },
  { city: ['chicago'], country: 'Estados Unidos' },

  { city: ['bangkok'], country: 'Tailandia' },
  { city: ['phuket'], country: 'Tailandia' },
  { city: ['chiang mai'], country: 'Tailandia' },

  { city: ['seoul', 'seul', 'seúl'], country: 'Corea del Sur' },
  { city: ['busan'], country: 'Corea del Sur' },

  { city: ['beijing', 'pekin', 'pekín'], country: 'China' },
  { city: ['shanghai'], country: 'China' },
  { city: ['hong kong'], country: 'China' },

  { city: ['hanoi'], country: 'Vietnam' },
  { city: ['ho chi minh', 'saigon', 'saigón'], country: 'Vietnam' },

  { city: ['singapore', 'singapur'], country: 'Singapur' },

  { city: ['bali'], country: 'Indonesia' },
  { city: ['jakarta'], country: 'Indonesia' },

  { city: ['marrakech', 'marrakech'], country: 'Marruecos' },
  { city: ['casablanca'], country: 'Marruecos' },

  { city: ['istanbul', 'estambul'], country: 'Turquía' },

  { city: ['zurich', 'zúrich', 'zurich'], country: 'Suiza' },
  { city: ['geneva', 'ginebra'], country: 'Suiza' },

  { city: ['athens', 'atenas'], country: 'Grecia' },
  { city: ['santorini'], country: 'Grecia' },
];

function detectCountryFromDestination(destination) {
  const tokens = splitDestination(destination);
  if (!tokens.length) return null;

  const joined = normalizeText(destination);

  for (const row of CITY_TO_COUNTRY) {
    for (const c of row.city) {
      const cn = normalizeText(c);
      if (joined.includes(cn)) return row.country;
    }
  }

  const byCountryName = getPresetForCountry(destination);
  if (byCountryName) return byCountryName.display;

  for (const t of tokens) {
    const p = getPresetForCountry(t);
    if (p) return p.display;
  }

  return null;
}

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CHF', label: 'CHF (Fr)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'ARS', label: 'ARS ($)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'THB', label: 'THB (฿)' },
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'VND', label: 'VND (₫)' },
  { value: 'MAD', label: 'MAD (DH)' },
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'IDR', label: 'IDR (Rp)' },
];

function currencySymbolFromCode(code) {
  return (
    code === 'EUR' ? '€' :
    code === 'USD' ? '$' :
    code === 'GBP' ? '£' :
    code === 'JPY' ? '¥' :
    code === 'CHF' ? 'Fr' :
    code === 'THB' ? '฿' :
    code === 'KRW' ? '₩' :
    code === 'VND' ? '₫' :
    code === 'MAD' ? 'DH' :
    code === 'TRY' ? '₺' :
    code === 'BRL' ? 'R$' :
    code === 'IDR' ? 'Rp' :
    '$'
  );
}

export default function TripsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currencyTouched, setCurrencyTouched] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    country: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_image: '',
    currency: 'EUR',
    currency_symbol: '€',
    language: 'English',
    language_code: 'en-GB',
  });

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
    return trips.map(trip => {
      const tripCities = allCities.filter(c => c.trip_id === trip.id);
      return <TripCard key={trip.id} trip={trip} cities={tripCities} />;
    });
  }, [trips, allCities]);

  function setCountry(value) {
    const preset = getPresetForCountry(value);
    setFormData(prev => {
      const next = { ...prev, country: value };
      if (preset && !currencyTouched) {
        next.currency = preset.currency;
        next.currency_symbol = preset.symbol;
        next.language = preset.language;
        next.language_code = preset.languageCode;
      }
      return next;
    });
  }

  function setDestination(value) {
    const detectedCountry = detectCountryFromDestination(value);
    const preset = getPresetForCountry(detectedCountry || '');

    setFormData(prev => {
      const next = { ...prev, destination: value };

      const prevCountryNorm = normalizeText(prev.country);
      const prevDestNorm = normalizeText(prev.destination);
      const countryEmpty = !prevCountryNorm;
      const countryWasSameAsDestination = prevCountryNorm && prevCountryNorm === prevDestNorm;

      if (detectedCountry && (countryEmpty || countryWasSameAsDestination)) {
        next.country = detectedCountry;

        if (preset && !currencyTouched) {
          next.currency = preset.currency;
          next.currency_symbol = preset.symbol;
          next.language = preset.language;
          next.language_code = preset.languageCode;
        }
      }

      return next;
    });
  }

  function setCurrency(value) {
    setCurrencyTouched(true);
    setFormData(prev => ({
      ...prev,
      currency: value,
      currency_symbol: currencySymbolFromCode(value),
    }));
  }

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const email = user?.email;
      const members = email ? [email] : [];
      const roles = email ? { [email]: 'admin' } : {};

      const trip = await base44.entities.Trip.create({
        ...data,
        members,
        roles,
      });

      if (selectedTemplate?.packingItems?.length) {
        const packingPromises = selectedTemplate.packingItems.map(item =>
          base44.entities.PackingItem.create({
            ...item,
            trip_id: trip.id,
            user_id: user?.id,
            packed: false,
          })
        );
        await Promise.all(packingPromises);
        toast({
          title: '¡Viaje creado! 🎉',
          description: `${selectedTemplate.packingItems.length} artículos añadidos a tu maleta`,
        });
      }

      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setDialogOpen(false);
      setSelectedTemplate(null);
      setCurrencyTouched(false);
      setFormData({
        name: '',
        destination: '',
        country: '',
        start_date: '',
        end_date: '',
        description: '',
        cover_image: '',
        currency: 'EUR',
        currency_symbol: '€',
        language: 'English',
        language_code: 'en-GB',
      });
    },
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

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
            <h1 className="text-white text-4xl font-black tracking-tight">Kōdo</h1>
            <p className="text-white/90 text-base font-medium mt-0.5">Travel your way</p>
            <p className="text-white/60 text-sm mt-1">Tu próximo viaje empieza aquí</p>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-5 shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear viaje
          </Button>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 py-8 max-w-6xl">
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Aún no tienes viajes</h2>
            <p className="text-muted-foreground text-sm mb-6">Crea tu primer viaje y empieza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Crear tu primer viaje
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Tus viajes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tripCards}
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">✈️ Nuevo Viaje</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
              <Input
                placeholder="ej. Italia 2027"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label>
                <Input
                  placeholder="ej. Roma / Tokyo & Kyoto / Italia"
                  value={formData.destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País</label>
                <Input
                  placeholder="Se auto-detecta (puedes cambiarlo)"
                  value={formData.country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda del viaje</label>
                <Select value={formData.currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Idioma detectado</label>
                <div className="bg-white border border-border rounded-md px-3 py-2 text-sm">
                  <div className="font-semibold">{formData.language}</div>
                  <div className="text-xs text-muted-foreground">{formData.language_code}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <Textarea
                placeholder="Describe tu viaje..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              {formData.cover_image && (
                <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted">
                  <img
                    src={formData.cover_image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <TripTemplates onSelect={setSelectedTemplate} />
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary flex items-center gap-2">
                    <span>{selectedTemplate.emoji}</span>
                    <span>Plantilla "{selectedTemplate.name}" seleccionada</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>

              <Button
                onClick={handleSubmit}
                className="bg-orange-700 hover:bg-orange-800"
                disabled={
                  !formData.name ||
                  !formData.destination ||
                  !formData.start_date ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}