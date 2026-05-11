import { createPageUrl } from '@/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Info, Cloud, Trash2, ExternalLink, Package, Loader2, ChevronDown } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getCountryMeta, computeAvailableCurrencies } from '@/lib/countryConfig';
import { getHardcodedEmergencyInfo } from '@/lib/emergencyDB';
import { getFxRate } from '@/lib/fxRates';
import { useTripContext } from '@/hooks/useTripContext';
import { TranslatorPanel } from './Translator';

function getCountryConfig(country) { const m = getCountryMeta(country); return { currency: m.currency, symbol: m.symbol, locale: m.languageCode, flag: m.flag, iso: m.iso }; }

const infoCategories = [
  { value: 'emergencia', label: 'Emergencia', icon: '🚨' },
  { value: 'salud', label: 'Salud y Seguridad', icon: '⚕️' },
  { value: 'embajada', label: 'Embajada/Consulado', icon: '🏛️' },
  { value: 'apps', label: 'Apps útiles', icon: '📱' },
  { value: 'transporte', label: 'Transporte', icon: '🚇' },
  { value: 'contactos', label: 'Contactos', icon: '📞' },
  { value: 'otros', label: 'Otros', icon: '💡' },
];

const packingCategories = [
  { value: 'personal', label: 'Personal', icon: '👤', color: 'from-blue-500 to-cyan-500' },
  { value: 'neceser', label: 'Neceser', icon: '🧴', color: 'from-pink-500 to-rose-500' },
  { value: 'tecnologia', label: 'Tecnología', icon: '📱', color: 'from-purple-500 to-indigo-500' },
  { value: 'ropa', label: 'Ropa', icon: '👕', color: 'from-amber-500 to-orange-500' },
  { value: 'medicinas', label: 'Medicinas', icon: '💊', color: 'from-green-500 to-emerald-500' },
];

export default function Utilities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('weather');
  const [tripId, setTripId] = useState(null);
  const queryClient = useQueryClient();

  // Currency state
  const [exchangeRate, setExchangeRate] = useState(null);
  const [exchangeRateSource, setExchangeRateSource] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [quoteCurrency, setQuoteCurrency] = useState('EUR');
  const [baseAmount, setBaseAmount] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');

  // Emergency AI state
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [aiEmergencyData, setAiEmergencyData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ title: '', category: 'emergencia', content: '', link: '', icon: '📌' });
  const [packingFormData, setPackingFormData] = useState({ name: '', category: 'personal', quantity: 1 });

  useEffect(() => {
    window.scrollTo(0, 0);
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    if (!id) {
      navigate('/TripsList', { replace: true });
      return;
    }
    setTripId(id);
  }, [navigate]);

  // Trip context — cities y ciudad activa filtradas por este viaje
  const { trip, cities, activeCity } = useTripContext(tripId);

  // Perfil del usuario para obtener su país de origen
  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const homeCountry = myProfile?.home_country || 'España';

  const country = activeCity?.country || trip?.country || '';
  const countryConfig = getCountryConfig(country);

  // Set base currency from trip
  useEffect(() => {
    if (trip?.currency) setBaseCurrency(trip.currency);
  }, [trip?.currency]);

  // Set quote currency from destination country
  // If same as base (e.g. EUR trip to Italy), pick a useful alternative
  useEffect(() => {
    if (!countryConfig.currency) return;
    if (countryConfig.currency !== baseCurrency) {
      setQuoteCurrency(countryConfig.currency);
    } else {
      // Same currency — no conversion needed, leave quote same so section shows "mismo"
      setQuoteCurrency(countryConfig.currency);
    }
  }, [countryConfig.currency, baseCurrency]);

  const { data: infos = [] } = useQuery({
    queryKey: ['usefulInfo', tripId],
    queryFn: () => base44.entities.UsefulInfo.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  // Cargar tasa de cambio dinámica (base → quote)
  useEffect(() => {
    if (!baseCurrency || !quoteCurrency || baseCurrency === quoteCurrency) {
      setExchangeRate(1);
      setExchangeRateSource('same');
      return;
    }
    setLoadingRate(true);
    getFxRate(baseCurrency, quoteCurrency)
      .then((result) => {
        setExchangeRate(result.rate);
        setExchangeRateSource(result.source);
      })
      .catch(() => {
        setExchangeRate(1);
        setExchangeRateSource('unavailable');
      })
      .finally(() => setLoadingRate(false));
  }, [baseCurrency, quoteCurrency]);

  // Cargar info de emergencias según país activo — datos hardcodeados, sin IA
  useEffect(() => {
    if (!country) { setAiEmergencyData(null); return; }
    setLoadingEmergency(true);
    const data = getHardcodedEmergencyInfo(country, homeCountry);
    if (data) {
      setAiEmergencyData({
        emergency_numbers: [
          data.emergency_general && { name: 'Emergencias', number: data.emergency_general, icon: '🆘' },
          data.police && data.police !== data.emergency_general && { name: 'Policía', number: data.police, icon: '🚔' },
          data.ambulance && data.ambulance !== data.emergency_general && { name: 'Ambulancia', number: data.ambulance, icon: '🚑' },
          data.fire && data.fire !== data.emergency_general && { name: 'Bomberos', number: data.fire, icon: '🚒' },
        ].filter(Boolean),
        embassy: data.embassy || null,
        useful_apps: data.useful_apps || [],
        safety_tips: data.safety_tips || [],
      });
    } else {
      setAiEmergencyData(null);
    }
    setLoadingEmergency(false);
  }, [country, homeCountry]);

  const handleBaseChange = (value) => {
    setBaseAmount(value);
    if (exchangeRate && value) {
      const converted = (parseFloat(value) * exchangeRate).toFixed(2);
      setQuoteAmount(converted);
    } else {
      setQuoteAmount('');
    }
  };

  const handleQuoteChange = (value) => {
    setQuoteAmount(value);
    if (exchangeRate && value) {
      const converted = (parseFloat(value) / exchangeRate).toFixed(2);
      setBaseAmount(converted);
    } else {
      setBaseAmount('');
    }
  };

  const groupedInfos = infos.reduce((acc, info) => {
    if (!acc[info.category]) acc[info.category] = [];
    acc[info.category].push(info);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UsefulInfo.create({ ...data, trip_id: tripId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usefulInfo', tripId] }); setDialogOpen(false); setFormData({ title: '', category: 'emergencia', content: '', link: '', icon: '📌' }); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UsefulInfo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usefulInfo', tripId] })
  });

  const createPackingMutation = useMutation({
    mutationFn: (data) => base44.entities.PackingItem.create({ ...data, trip_id: tripId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }); setPackingDialogOpen(false); setPackingFormData({ name: '', category: 'personal', quantity: 1 }); }
  });

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] })
  });

  const deletePackingMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] })
  });

  const groupedPackingItems = packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalPackingItems = packingItems.length;
  const packedCount = packingItems.filter((i) => i.packed).length;
  const packingProgress = totalPackingItems > 0 ? Math.round(packedCount / totalPackingItems * 100) : 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <a href={createPageUrl('Home') + (tripId ? `?trip_id=${tripId}` : '')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Inicio
            </a>
            <button onClick={() => setDialogOpen(true)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Añadir
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Utilidades</h1>
          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              ['weather', 'Clima', '☁️'],
              ['packing', 'Maleta', '🧳'],
              ['info', 'Emergencias', '🚨'],
            ].map(([k, l, em]) => (
              <button key={k} onClick={() => setActiveTab(k)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex flex-col items-center gap-0.5 ${
                  activeTab === k ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}>
                <span className="text-lg">{em}</span>
                <span className="text-xs">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden" />

          {/* CLIMA */}
          <TabsContent value="weather" className="space-y-4 mt-5">
            {cities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <p className="text-4xl mb-3">☁️</p>
                <p className="text-sm font-semibold text-foreground mb-1">Sin ciudades</p>
                <p className="text-xs text-muted-foreground">Añade ciudades en la sección Ruta para ver el clima</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {cities.map((city) => <WeatherCard key={city.id} city={city} tripCountry={trip?.country} />)}
              </div>
            )}
          </TabsContent>

          {/* MALETA */}
          <TabsContent value="packing" className="space-y-4 mt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{packedCount} de {totalPackingItems} artículos listos</p>
              </div>
              <button onClick={() => setPackingDialogOpen(true)}
                className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
                <Plus className="w-4 h-4" />Añadir
              </button>
            </div>

            {totalPackingItems > 0 && (
              <div className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progreso total</span>
                  <span className="text-lg font-bold text-primary">{packingProgress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${packingProgress}%` }} />
                </div>
              </div>
            )}

            {totalPackingItems === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">Maleta vacía</p>
                <p className="text-xs text-muted-foreground mb-4">Empieza añadiendo artículos a tu equipaje</p>
                <button onClick={() => setPackingDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />Añadir artículo
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {packingCategories.map((cat) => {
                  const categoryItems = groupedPackingItems[cat.value] || [];
                  const packedCategoryCount = categoryItems.filter((i) => i.packed).length;
                  const categoryProgress = categoryItems.length > 0 ? Math.round(packedCategoryCount / categoryItems.length * 100) : 0;
                  return (
                    <div key={cat.value} className="bg-white rounded-2xl border border-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{packedCategoryCount}/{categoryItems.length}</span>
                      </div>
                      <div className="p-3 space-y-1.5">
                        {categoryItems.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4 text-xs">Sin artículos</p>
                        ) : categoryItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/50 group transition-colors">
                            <Checkbox checked={item.packed} onCheckedChange={(checked) => togglePackedMutation.mutate({ id: item.id, packed: checked })} className="h-4 w-4" />
                            <p className={`flex-1 text-sm truncate ${item.packed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item.name}{item.quantity > 1 && <span className="ml-1 text-xs text-muted-foreground">×{item.quantity}</span>}
                            </p>
                            <button onClick={() => deletePackingMutation.mutate(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => { setPackingFormData({ ...packingFormData, category: cat.value }); setPackingDialogOpen(true); }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl mt-1 transition-colors">
                          <Plus className="w-3.5 h-3.5" />Añadir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* EMERGENCIAS */}
          <TabsContent value="info" className="space-y-4 mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {country ? `${country} ${countryConfig.flag}` : 'Abre desde un viaje para ver info'}
              </p>
              <button onClick={() => setDialogOpen(true)}
                className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
                <Plus className="w-4 h-4" />Añadir nota
              </button>
            </div>

            {/* Info generada por IA */}
            {loadingEmergency && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-orange-500" />
                <p className="font-medium">Cargando información de {country}...</p>
                <p className="text-sm text-muted-foreground mt-1">La IA está buscando datos actualizados</p>
              </div>
            )}

            {!loadingEmergency && aiEmergencyData && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Números de emergencia */}
                {aiEmergencyData.emergency_numbers?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="font-bold text-red-700 text-lg mb-3 flex items-center gap-2">🚨 Números de emergencia</h3>
                    <div className="space-y-2">
                      {aiEmergencyData.emergency_numbers.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border border-red-100">
                          <span className="text-sm font-medium text-foreground">{item.icon} {item.name}</span>
                          <span className="text-xl font-bold text-red-600">{item.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embajada española */}
                {aiEmergencyData.embassy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <h3 className="font-bold text-yellow-700 text-lg mb-3">🏛️ Embajada de {homeCountry}</h3>
                    <div className="space-y-2 text-sm">
                      {aiEmergencyData.embassy.address && <p className="text-foreground">📍 {aiEmergencyData.embassy.address}</p>}
                      {aiEmergencyData.embassy.phone && <p className="text-foreground">📞 <span className="font-bold">{aiEmergencyData.embassy.phone}</span></p>}
                      {aiEmergencyData.embassy.hours && <p className="text-muted-foreground">🕐 {aiEmergencyData.embassy.hours}</p>}
                      {aiEmergencyData.embassy.web && (
                        <a href={aiEmergencyData.embassy.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium mt-2">
                          <ExternalLink className="w-3 h-3" />Web oficial
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Apps útiles */}
                {aiEmergencyData.useful_apps?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-700 text-lg mb-3">📱 Apps útiles en {country}</h3>
                    <div className="space-y-2">
                      {aiEmergencyData.useful_apps.map((app, i) => (
                        <div key={i} className="bg-white rounded-xl px-4 py-2 border border-blue-100">
                          <p className="font-medium text-sm text-foreground">{app.icon} {app.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consejos de seguridad */}
                {aiEmergencyData.safety_tips?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <h3 className="font-bold text-green-700 text-lg mb-3">🛡️ Consejos de seguridad</h3>
                    <div className="space-y-2">
                      {aiEmergencyData.safety_tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 bg-white rounded-xl px-4 py-2 border border-green-100">
                          <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
                          <p className="text-sm text-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info manual añadida por el usuario */}
            {infos.length > 0 && (
              <div>
                <h3 className="font-bold text-foreground text-lg mb-3">📌 Tus notas personales</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {infoCategories.map((category) => {
                    const categoryInfos = groupedInfos[category.value] || [];
                    if (categoryInfos.length === 0) return null;
                    return (
                      <div key={category.value} className="bg-white p-4 rounded-2xl border border-border hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{category.icon}</span>
                          <h3 className="text-lg font-bold text-foreground">{category.label}</h3>
                        </div>
                        <div className="space-y-2">
                          {categoryInfos.map((info) => (
                            <div key={info.id} className="border border-border rounded-lg p-2 hover:bg-secondary/30 transition-colors">
                              <div className="flex items-start gap-2">
                                <span className="text-lg flex-shrink-0 mt-0.5">{info.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground">{info.title}</p>
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{info.content}</p>
                                  {info.link && (
                                    <a href={info.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium mt-2">
                                      <ExternalLink className="w-3 h-3" />Enlace
                                    </a>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(info.id)} className="text-destructive hover:bg-red-50 flex-shrink-0 h-7 w-7">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loadingEmergency && !aiEmergencyData && infos.length === 0 && (
              <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl">
                <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {country ? `Sin información específica para ${country} todavía` : 'Abre desde un viaje para ver información'}
                </p>
                <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />Añadir información manual
                </Button>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Dialog añadir info */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Añadir información</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input placeholder="ej. Policía local" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{infoCategories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Icono</label>
              <Input placeholder="Emoji" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} maxLength={2} className="border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contenido</label>
              <Textarea placeholder="Descripción o detalles..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={3} className="border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Enlace (opcional)</label>
              <Input placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="border-border" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => createMutation.mutate(formData)} className="bg-green-600 hover:bg-green-700" disabled={!formData.title.trim() || !formData.content.trim() || createMutation.isPending}>
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog añadir maleta */}
      <Dialog open={packingDialogOpen} onOpenChange={setPackingDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Añadir artículo</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Artículo</label>
              <Input placeholder="ej. Camisetas" value={packingFormData.name} onChange={(e) => setPackingFormData({ ...packingFormData, name: e.target.value })} className="border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select value={packingFormData.category} onValueChange={(v) => setPackingFormData({ ...packingFormData, category: v })}>
                <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{packingCategories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cantidad</label>
              <Input type="number" min="1" value={packingFormData.quantity} onChange={(e) => setPackingFormData({ ...packingFormData, quantity: parseInt(e.target.value) || 1 })} className="border-border" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPackingDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => createPackingMutation.mutate(packingFormData)} className="bg-green-600 hover:bg-green-700" disabled={!packingFormData.name.trim() || createPackingMutation.isPending}>
                {createPackingMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}