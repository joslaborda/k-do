import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Info, Cloud, DollarSign, Trash2, ExternalLink, Phone, Package, Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, BookOpen } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';

const infoCategories = [
{ value: 'emergencia', label: 'Emergencia', icon: '🚨' },
{ value: 'salud', label: 'Salud y Seguridad', icon: '⚕️' },
{ value: 'embajada', label: 'Embajada/Consulado', icon: '🏛️' },
{ value: 'apps', label: 'Apps útiles', icon: '📱' },
{ value: 'transporte', label: 'Transporte', icon: '🚇' },
{ value: 'contactos', label: 'Contactos', icon: '📞' },
{ value: 'otros', label: 'Otros', icon: '💡' }];


const packingCategories = [
{ value: 'personal', label: 'Personal', icon: '👤', color: 'from-blue-500 to-cyan-500' },
{ value: 'neceser', label: 'Neceser', icon: '🧴', color: 'from-pink-500 to-rose-500' },
{ value: 'tecnologia', label: 'Tecnología', icon: '📱', color: 'from-purple-500 to-indigo-500' },
{ value: 'ropa', label: 'Ropa', icon: '👕', color: 'from-amber-500 to-orange-500' },
{ value: 'medicinas', label: 'Medicinas', icon: '💊', color: 'from-green-500 to-emerald-500' }];


const phraseCategories = [
{
  name: 'Básicas',
  icon: '👋',
  phrases: [
  { spanish: 'Hola', japanese: 'こんにちは', romaji: 'Konnichiwa' },
  { spanish: 'Gracias', japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu' },
  { spanish: 'Por favor', japanese: 'お願いします', romaji: 'Onegaishimasu' },
  { spanish: 'Disculpe', japanese: 'すみません', romaji: 'Sumimasen' }]

},
{
  name: 'Restaurante',
  icon: '🍜',
  phrases: [
  { spanish: '¿Puedo tener agua?', japanese: 'お水をください', romaji: 'Omizu wo kudasai' },
  { spanish: 'La cuenta, por favor', japanese: 'お会計お願いします', romaji: 'Okaikei onegaishimasu' },
  { spanish: 'Esto está delicioso', japanese: 'おいしいです', romaji: 'Oishii desu' }]

},
{
  name: 'Direcciones',
  icon: '🗺️',
  phrases: [
  { spanish: '¿Dónde está el baño?', japanese: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?' },
  { spanish: '¿Dónde está la estación?', japanese: '駅はどこですか？', romaji: 'Eki wa doko desu ka?' },
  { spanish: 'Estoy perdido', japanese: '道に迷いました', romaji: 'Michi ni mayoimashita' }]

}];


export default function Utilities() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (activeTab === 'diary') {
      const urlParams = new URLSearchParams(window.location.search);
      const tripId = urlParams.get('trip_id');
      navigate(createPageUrl(`Diary?trip_id=${tripId}`));
    }
  }, [activeTab, navigate]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [jpyAmount, setJpyAmount] = useState('');
  const [eurAmount, setEurAmount] = useState('');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [direction, setDirection] = useState('es-jp');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true });
  const [formData, setFormData] = useState({
    title: '',
    category: 'emergencia',
    content: '',
    link: '',
    icon: '📌'
  });
  const [packingFormData, setPackingFormData] = useState({
    name: '',
    category: 'personal',
    quantity: 1
  });

  const [tripId, setTripId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    setTripId(id);
  }, []);

  const { data: infos = [] } = useQuery({
    queryKey: ['usefulInfo', tripId],
    queryFn: () => base44.entities.UsefulInfo.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  // Crear datos de ejemplo si está vacío
  useEffect(() => {
    if (infos.length === 0 && tripId) {
      const sampleData = [
         { title: 'Emergencias Generales', category: 'emergencia', content: '110 - Policía\n119 - Ambulancia/Bomberos\n#9110 - Emergencias no urgentes (Policía)', icon: '🚨' },
         { title: 'Línea de Urgencias Médicas', category: 'salud', content: 'Centro Médico Internacional de Tokio\nTeléfono: +81-3-5285-8185\nIntérprete disponible 24 horas\n\nKyoto Hospital (Kyoto)\nTeléfono: +81-75-751-3111\n\nOsaka Medical Center (Osaka)\nTeléfono: +81-6-6942-1331', icon: '⚕️' },
         { title: 'Farmacias 24 horas', category: 'salud', content: 'Tokio: Matsumotokiyoshi\nKyoto: Tsuruha\nOsaka: Daikoku Drug\nDisponen de antídoto para alergias y medicinas básicas', icon: '💊' },
         { title: 'Información de Seguros', category: 'salud', content: 'Verifica tu póliza de viaje antes de partir. Algunos hospitales requieren pago directo.\nGuarda tus recibos para reembolsos.', icon: '📋' },
         { title: 'Embajada de España en Japón', category: 'embajada', content: 'Dirección: 1-3-29 Roppongi, Minato-ku, Tokio 106-0032\nTeléfono: +81-3-5798-8000\nHorario: Lunes a viernes 9:00-13:00 y 14:00-17:30', link: 'https://www.exteriores.gob.es', icon: '🏛️' },
         { title: 'Centro de Llamadas de Turismo', category: 'contactos', content: 'Teléfono: +81-50-3816-2787\nDisponible 24/7 en múltiples idiomas\nAyuda con transporte, hoteles y emergencias', icon: '☎️' },
         { title: 'Google Maps', category: 'apps', content: 'La app imprescindible para navegar. Funciona perfectamente con transporte público. Descarga mapas offline.', link: 'https://maps.google.com', icon: '📱' },
         { title: 'Suica/Pasmo', category: 'transporte', content: 'Tarjeta recargable para transporte público en Tokio, Osaka y Kyoto.\nCómprala en cualquier estación o aeropuerto.\nValor típico: ¥2000-3000', link: 'https://www.pasmo.co.jp/', icon: '🚇' },
         { title: 'Japan Rail Pass', category: 'transporte', content: 'Para viajes entre ciudades (Tokio → Kyoto → Osaka → Hiroshima).\nValor: ~¥29,650 (7 días)\nRequiere compra previa a llegada a Japón', icon: '🚄' },
         { title: 'Normas de Seguridad', category: 'salud', content: 'Japón es muy seguro. Algunas normas:\n- Cuida tus pertenencias en estaciones concurridas\n- No comas caminando\n- Respeta los espacios en transporte público\n- Apaga la música en tren/autobús', icon: '🛡️' }
       ];
      sampleData.forEach(data => {
        base44.entities.UsefulInfo.create({ ...data, trip_id: tripId });
      });
    }
  }, [infos.length, tripId]);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UsefulInfo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usefulInfo'] });
      setDialogOpen(false);
      setFormData({ title: '', category: 'emergencia', content: '', link: '', icon: '📌' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UsefulInfo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usefulInfo'] })
  });

  const createPackingMutation = useMutation({
    mutationFn: (data) => base44.entities.PackingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems'] });
      setPackingDialogOpen(false);
      setPackingFormData({ name: '', category: 'personal', quantity: 1 });
    }
  });

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] })
  });

  const deletePackingMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] })
  });

  // Obtener tasa de cambio
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoadingRate(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: 'Dame la tasa de cambio actual de 1 EUR a JPY. Solo responde con el número, sin texto adicional.',
          response_json_schema: {
            type: 'object',
            properties: {
              rate: { type: 'number' }
            }
          }
        });
        setExchangeRate(response.rate);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setExchangeRate(160); // fallback
      } finally {
        setLoadingRate(false);
      }
    };
    fetchExchangeRate();
  }, []);

  const handleJpyChange = (value) => {
    setJpyAmount(value);
    if (exchangeRate && value) {
      setEurAmount((parseFloat(value) / exchangeRate).toFixed(2));
    } else {
      setEurAmount('');
    }
  };

  const handleEurChange = (value) => {
    setEurAmount(value);
    if (exchangeRate && value) {
      setJpyAmount((parseFloat(value) * exchangeRate).toFixed(0));
    } else {
      setJpyAmount('');
    }
  };

  const groupedInfos = infos.reduce((acc, info) => {
    if (!acc[info.category]) acc[info.category] = [];
    acc[info.category].push(info);
    return acc;
  }, {});

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  const groupedPackingItems = packingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalPackingItems = packingItems.length;
  const packedCount = packingItems.filter((i) => i.packed).length;
  const packingProgress = totalPackingItems > 0 ? Math.round(packedCount / totalPackingItems * 100) : 0;

  return (
    <div className="min-h-screen bg-orange-50">
       {/* Header con caja naranja */}
       <div className="bg-orange-700 pt-12 pb-20">
         <div className="max-w-5xl mx-auto px-6">
           <h1 className="text-white text-4xl font-bold">Utilidades 🔧</h1>
           <p className="text-white/90 mt-2">Información útil para tu viaje</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 bg-transparent border-0 p-0 h-auto">
              <TabsTrigger value="currency" className="bg-white border border-border data-[state=active]:bg-orange-700 data-[state=active]:text-white data-[state=active]:border-orange-700">
                💱 Moneda
              </TabsTrigger>
              <TabsTrigger value="weather" className="bg-white border border-border data-[state=active]:bg-orange-700 data-[state=active]:text-white data-[state=active]:border-orange-700">
                ☁️ Clima
              </TabsTrigger>
              <TabsTrigger value="diary" className="bg-white border border-border data-[state=active]:bg-orange-700 data-[state=active]:text-white data-[state=active]:border-orange-700">
                📔 Diario
              </TabsTrigger>
              <TabsTrigger value="packing" className="bg-white border border-border data-[state=active]:bg-orange-700 data-[state=active]:text-white data-[state=active]:border-orange-700">
                🧳 Maleta
              </TabsTrigger>
              <TabsTrigger value="info" className="bg-white border border-border data-[state=active]:bg-orange-700 data-[state=active]:text-white data-[state=active]:border-orange-700">
                🚨 Emergencias
              </TabsTrigger>
            </TabsList>

          {/* Información Útil */}
          <TabsContent value="info" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Información de Utilidad</h2>
                <p className="text-muted-foreground">Teléfonos, embajadas, contactos de emergencia y más</p>
              </div>
              <Button
               onClick={() => setDialogOpen(true)}
               className="bg-green-600 hover:bg-green-700">
               <Plus className="w-4 h-4 mr-2" />
               Añadir
              </Button>
            </div>

            {infos.length === 0 ?
            <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
                <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Añade información útil como números de emergencia o embajadas</p>
              </div> :

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
                                  <ExternalLink className="w-3 h-3" />
                                  Enlace
                                </a>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(info.id)}
                              className="text-destructive hover:bg-red-50 hover:text-destructive flex-shrink-0 h-7 w-7">
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
            }
          </TabsContent>

          {/* Clima */}
          <TabsContent value="weather" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Clima actual</h2>
              <p className="text-muted-foreground">Pronóstico del tiempo en tiempo real</p>
            </div>
            {cities.length === 0 ?
            <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
                <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Añade ciudades primero en la sección Ruta</p>
              </div> :

            <div className="grid md:grid-cols-2 gap-6">
                {cities.map((city) =>
              <WeatherCard key={city.id} city={city} />
              )}
              </div>
            }
          </TabsContent>

          {/* Conversión moneda */}
          <TabsContent value="currency" className="space-y-6">
            <div className="bg-[#ffffff] p-8 rounded-2xl glass border-2 border-border">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Conversión de Moneda</h2>
                  {loadingRate ?
                  <p className="text-muted-foreground">Cargando tasa de cambio...</p> :

                  <p className="text-muted-foreground">
                      1 EUR = <span className="font-bold text-foreground">{exchangeRate?.toFixed(2)} JPY</span>
                    </p>
                  }
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Yenes (JPY)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={jpyAmount}
                        onChange={(e) => handleJpyChange(e.target.value)}
                        className="pl-8 text-lg bg-input border-border text-foreground placeholder:text-muted-foreground" />

                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-block p-3 bg-secondary rounded-full">
                      <div className="text-2xl">⇅</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Euros (EUR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={eurAmount}
                        onChange={(e) => handleEurChange(e.target.value)}
                        className="pl-8 text-lg bg-input border-border text-foreground placeholder:text-muted-foreground" />

                    </div>
                  </div>
                </div>

                <div className="bg-green-50 mt-8 p-4 opacity-100 rounded-xl border border-green-700">
                  <p className="text-green-600 text-sm opacity-100">💡 La tasa de cambio se actualiza automáticamente al cargar esta página

                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Maleta */}
          <TabsContent value="packing" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Checklist de equipaje 🧳</h2>
                <p className="text-muted-foreground">
                  {packedCount} de {totalPackingItems} artículos listos
                </p>
              </div>
              <Button
                onClick={() => setPackingDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700">

                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </div>

            {/* Progress Bar */}
            {totalPackingItems > 0 &&
            <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-primary-foreground mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">Progreso total</span>
                  <span className="text-4xl font-bold">{packingProgress}%</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                  <div
                  className="h-full bg-white transition-all duration-500 rounded-full"
                  style={{ width: `${packingProgress}%` }} />

                </div>
              </div>
            }

            {totalPackingItems === 0 ?
            <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Empieza añadiendo artículos a tu maleta</p>
              </div> :

            <div className="grid md:grid-cols-2 gap-6">
                {packingCategories.map((cat) => {
                const categoryItems = groupedPackingItems[cat.value] || [];
                const packedCategoryCount = categoryItems.filter((i) => i.packed).length;
                const categoryProgress = categoryItems.length > 0 ?
                Math.round(packedCategoryCount / categoryItems.length * 100) :
                0;

                return (
                  <div
                    key={cat.value}
                    className="glass border-2 border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all">

                      {/* Category Header */}
                      <div className={`bg-gradient-to-r ${cat.color} p-6 text-white`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">{cat.icon}</span>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{cat.label}</h3>
                            <p className="text-sm opacity-90">
                              {packedCategoryCount}/{categoryItems.length} completo
                            </p>
                          </div>
                          <div className="text-3xl font-bold">{categoryProgress}%</div>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                          className="h-full bg-white transition-all duration-500 rounded-full"
                          style={{ width: `${categoryProgress}%` }} />

                        </div>
                      </div>

                      {/* Items List */}
                      <div className="bg-[#ffffff] p-4 space-y-2">
                        {categoryItems.length === 0 ?
                      <p className="text-center text-muted-foreground py-8 text-sm">
                              Sin artículos
                            </p> :

                      categoryItems.map((item) =>
                      <div
                        key={item.id} className="bg-slate-100 p-3 rounded-xl group flex items-center gap-3 transition-all hover:bg-secondary">






                              <Checkbox
                          checked={item.packed}
                          onCheckedChange={(checked) =>
                          togglePackedMutation.mutate({ id: item.id, packed: checked })
                          }
                          className="h-5 w-5" />

                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                          item.packed ?
                          'text-muted-foreground line-through' :
                          'text-foreground'}`
                          }>
                                  {item.name}
                                  {item.quantity > 1 &&
                            <span className="ml-2 text-sm text-muted-foreground">×{item.quantity}</span>
                            }
                                </p>
                              </div>
                              <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePackingMutation.mutate(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-secondary transition-opacity">

                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                      )
                      }
                      </div>

                      {/* Add button in category */}
                      <div className="p-4 pt-0">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPackingFormData({ ...packingFormData, category: cat.value });
                          setPackingDialogOpen(true);
                        }}
                        className="w-full border-dashed border-border text-foreground hover:bg-secondary/50">

                          <Plus className="w-4 h-4 mr-2" />
                          Añadir a {cat.label}
                        </Button>
                      </div>
                    </div>);

              })}
              </div>
            }
          </TabsContent>

          {/* Diario */}
          <TabsContent value="diary" className="space-y-6">
            <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
              <div className="text-6xl mb-4">📔</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Diario de Viaje</h2>
              <p className="text-muted-foreground mb-6">Accede al diario completo desde el menú principal</p>
              <Button
                onClick={() => window.location.href = createPageUrl('Diary')}
                className="bg-primary hover:bg-primary/90">

                Ir al Diario
              </Button>
            </div>
          </TabsContent>
          </Tabs>
          </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir información</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="ej. Policía Japón"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {infoCategories.map((cat) =>
                  <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Icono</label>
              <Input
                placeholder="Emoji"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contenido</label>
              <Textarea
                placeholder="Descripción o detalles..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Enlace (opcional)</label>
              <Input
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.title.trim() || !formData.content.trim() || createMutation.isPending}>

                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Packing Dialog */}
      <Dialog open={packingDialogOpen} onOpenChange={setPackingDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={packingFormData.name}
                onChange={(e) => setPackingFormData({ ...packingFormData, name: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select value={packingFormData.category} onValueChange={(v) => setPackingFormData({ ...packingFormData, category: v })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packingCategories.map((cat) =>
                  <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={packingFormData.quantity}
                onChange={(e) => setPackingFormData({ ...packingFormData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-input border-border text-foreground" />

            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPackingDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button
                onClick={() => createPackingMutation.mutate(packingFormData)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!packingFormData.name.trim() || createPackingMutation.isPending}>

                {createPackingMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}