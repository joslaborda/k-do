import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Info, Cloud, DollarSign, Trash2, ExternalLink, Phone, Package, Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const infoCategories = [
  { value: 'emergencia', label: 'Emergencia', icon: '🚨' },
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

const phraseCategories = [
  {
    name: 'Básicas',
    icon: '👋',
    phrases: [
      { spanish: 'Hola', japanese: 'こんにちは', romaji: 'Konnichiwa' },
      { spanish: 'Gracias', japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu' },
      { spanish: 'Por favor', japanese: 'お願いします', romaji: 'Onegaishimasu' },
      { spanish: 'Disculpe', japanese: 'すみません', romaji: 'Sumimasen' },
    ]
  },
  {
    name: 'Restaurante',
    icon: '🍜',
    phrases: [
      { spanish: '¿Puedo tener agua?', japanese: 'お水をください', romaji: 'Omizu wo kudasai' },
      { spanish: 'La cuenta, por favor', japanese: 'お会計お願いします', romaji: 'Okaikei onegaishimasu' },
      { spanish: 'Esto está delicioso', japanese: 'おいしいです', romaji: 'Oishii desu' },
    ]
  },
  {
    name: 'Direcciones',
    icon: '🗺️',
    phrases: [
      { spanish: '¿Dónde está el baño?', japanese: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?' },
      { spanish: '¿Dónde está la estación?', japanese: '駅はどこですか？', romaji: 'Eki wa doko desu ka?' },
      { spanish: 'Estoy perdido', japanese: '道に迷いました', romaji: 'Michi ni mayoimashita' },
    ]
  },
];

export default function Utilities() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
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
    icon: '📌',
  });
  const [packingFormData, setPackingFormData] = useState({
    name: '',
    category: 'personal',
    quantity: 1,
  });

  const queryClient = useQueryClient();

  const { data: infos = [] } = useQuery({
    queryKey: ['usefulInfo'],
    queryFn: () => base44.entities.UsefulInfo.list(),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UsefulInfo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usefulInfo'] });
      setDialogOpen(false);
      setFormData({ title: '', category: 'emergencia', content: '', link: '', icon: '📌' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UsefulInfo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usefulInfo'] }),
  });

  const createPackingMutation = useMutation({
    mutationFn: (data) => base44.entities.PackingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems'] });
      setPackingDialogOpen(false);
      setPackingFormData({ name: '', category: 'personal', quantity: 1 });
    },
  });

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] }),
  });

  const deletePackingMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] }),
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
  const packedCount = packingItems.filter(i => i.packed).length;
  const packingProgress = totalPackingItems > 0 ? Math.round((packedCount / totalPackingItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-stone-800/80 backdrop-blur-xl border-b border-stone-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-stone-100 mb-2">Utilidades 🔧</h1>
          <p className="text-stone-400">Información útil para tu viaje</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
        <Tabs defaultValue="weather" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-stone-800 border border-stone-700">
              <TabsTrigger value="weather" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
                <Cloud className="w-4 h-4 mr-2" />
                Clima
              </TabsTrigger>
              <TabsTrigger value="currency" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Moneda
              </TabsTrigger>
              <TabsTrigger value="packing" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
                <Package className="w-4 h-4 mr-2" />
                Maleta
              </TabsTrigger>
              <TabsTrigger value="translate" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
                <Info className="w-4 h-4 mr-2" />
                Translate
              </TabsTrigger>
            </TabsList>

          {/* Clima */}
          <TabsContent value="weather" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-stone-100 mb-2">Clima actual</h2>
              <p className="text-stone-400">Pronóstico del tiempo en tiempo real</p>
            </div>
            {cities.length === 0 ? (
              <div className="text-center py-24 bg-stone-800/50 backdrop-blur-sm border-2 border-dashed border-stone-700 rounded-3xl">
                <Cloud className="w-16 h-16 text-stone-600 mx-auto mb-4" />
                <p className="text-stone-400">Añade ciudades primero en la sección Ruta</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {cities.map((city) => (
                  <WeatherCard key={city.id} city={city} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Conversión moneda */}
          <TabsContent value="currency" className="space-y-6">
            <div className="bg-stone-800 border-2 border-stone-700 rounded-2xl p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-stone-100 mb-2">Conversión de Moneda</h2>
                  {loadingRate ? (
                    <p className="text-stone-400">Cargando tasa de cambio...</p>
                  ) : (
                    <p className="text-stone-300">
                      1 EUR = <span className="font-bold text-stone-100">{exchangeRate?.toFixed(2)} JPY</span>
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-stone-300 mb-2 block">Yenes (JPY)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">¥</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={jpyAmount}
                        onChange={(e) => handleJpyChange(e.target.value)}
                        className="pl-8 text-lg bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-500"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-block p-3 bg-stone-700 rounded-full">
                      <div className="text-2xl">⇅</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-300 mb-2 block">Euros (EUR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={eurAmount}
                        onChange={(e) => handleEurChange(e.target.value)}
                        className="pl-8 text-lg bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                  <p className="text-sm text-green-300">
                    💡 La tasa de cambio se actualiza automáticamente al cargar esta página
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Maleta */}
          <TabsContent value="packing" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Checklist de equipaje 🧳</h2>
                <p className="text-stone-400">
                  {packedCount} de {totalPackingItems} artículos listos
                </p>
              </div>
              <Button
                onClick={() => setPackingDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </div>

            {/* Progress Bar */}
            {totalPackingItems > 0 && (
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">Progreso total</span>
                  <span className="text-4xl font-bold">{packingProgress}%</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                  <div 
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${packingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {totalPackingItems === 0 ? (
              <div className="text-center py-24 bg-stone-800/50 backdrop-blur-sm border-2 border-dashed border-stone-700 rounded-3xl">
                <Package className="w-16 h-16 text-stone-600 mx-auto mb-4" />
                <p className="text-stone-400">Empieza añadiendo artículos a tu maleta</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {packingCategories.map((cat) => {
                  const categoryItems = groupedPackingItems[cat.value] || [];
                  const packedCategoryCount = categoryItems.filter(i => i.packed).length;
                  const categoryProgress = categoryItems.length > 0 
                    ? Math.round((packedCategoryCount / categoryItems.length) * 100) 
                    : 0;

                  return (
                    <div 
                      key={cat.value} 
                      className="bg-stone-800 backdrop-blur-xl border-2 border-stone-700 rounded-3xl overflow-hidden hover:shadow-xl transition-all"
                    >
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
                            style={{ width: `${categoryProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-4 space-y-2">
                        {categoryItems.length === 0 ? (
                          <p className="text-center text-stone-400 py-8 text-sm">
                            Sin artículos
                          </p>
                        ) : (
                          categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${
                                item.packed
                                  ? 'bg-green-900/20'
                                  : 'bg-stone-700/50 hover:bg-stone-700'
                              }`}
                            >
                              <Checkbox
                                checked={item.packed}
                                onCheckedChange={(checked) =>
                                  togglePackedMutation.mutate({ id: item.id, packed: checked })
                                }
                                className="h-5 w-5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                  item.packed 
                                    ? 'text-stone-400 line-through' 
                                    : 'text-stone-100'
                                }`}>
                                  {item.name}
                                  {item.quantity > 1 && (
                                    <span className="ml-2 text-sm text-stone-400">×{item.quantity}</span>
                                  )}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePackingMutation.mutate(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 hover:bg-stone-700 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
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
                          className="w-full border-dashed border-stone-700 text-stone-300 hover:bg-stone-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir a {cat.label}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Translate */}
          <TabsContent value="translate" className="space-y-6">
            <div className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-stone-100 mb-2">Traductor 🌐</h2>
                <p className="text-stone-400">Traduce entre español y japonés</p>
              </div>

              {/* Translator Tool */}
              <div className="bg-stone-800 backdrop-blur-xl border-2 border-stone-700 rounded-3xl p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${direction === 'es-jp' ? 'bg-indigo-600 text-white' : 'bg-stone-700 text-stone-400'}`}>
                    🇪🇸 Español
                  </div>
                  <button 
                    onClick={() => setDirection(direction === 'es-jp' ? 'jp-es' : 'es-jp')}
                    className="p-2 rounded-full hover:bg-stone-700 transition-colors"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-stone-400" />
                  </button>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${direction === 'jp-es' ? 'bg-indigo-600 text-white' : 'bg-stone-700 text-stone-400'}`}>
                    🇯🇵 Japonés
                  </div>
                </div>

                <Textarea
                  placeholder={direction === 'es-jp' ? 'Escribe en español...' : '日本語で書いてください...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="mb-4 bg-stone-700/50 border border-stone-600 text-stone-100 placeholder:text-stone-400"
                />

                <Button 
                  onClick={async () => {
                    if (!inputText.trim()) return;
                    setIsTranslating(true);
                    const prompt = direction === 'es-jp' 
                      ? `Traduce al japonés: "${inputText}". Proporciona kanji/hiragana y romanización.`
                      : `Traduce al español: "${inputText}"`;
                    const result = await base44.integrations.Core.InvokeLLM({ prompt });
                    setTranslatedText(result);
                    setIsTranslating(false);
                  }}
                  disabled={!inputText.trim() || isTranslating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traduciendo...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" />
                      Traducir
                    </>
                  )}
                </Button>

                {translatedText && (
                  <div className="mt-6 p-4 bg-stone-700/50 border border-stone-600 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-stone-100">{translatedText}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(translatedText);
                          setCopiedId('translation');
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="ml-2 flex-shrink-0"
                      >
                        {copiedId === 'translation' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-stone-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Phrases */}
              <div>
                <h3 className="text-xl font-bold text-stone-100 mb-4">Frases útiles</h3>
                <div className="space-y-3">
                  {phraseCategories.map((category) => (
                    <Collapsible
                      key={category.name}
                      open={expandedCategories[category.name]}
                      onOpenChange={() => setExpandedCategories(prev => ({ ...prev, [category.name]: !prev[category.name] }))}
                    >
                      <div className="bg-stone-800 backdrop-blur-xl border-2 border-stone-700 rounded-2xl overflow-hidden">
                        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-stone-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="font-semibold text-stone-100">{category.name}</span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t border-stone-700 divide-y divide-stone-700">
                            {category.phrases.map((phrase, idx) => (
                              <div key={idx} className="p-4 hover:bg-stone-700/50 transition-colors">
                                <p className="text-stone-100 font-medium">{phrase.spanish}</p>
                                <p className="text-lg mt-1 text-stone-200">{phrase.japanese}</p>
                                <p className="text-sm text-stone-400 mt-0.5 italic">{phrase.romaji}</p>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          </Tabs>
          </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Añadir información</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Título</label>
              <Input
                placeholder="ej. Policía Japón"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Categoría</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {infoCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Icono</label>
              <Input
                placeholder="Emoji"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Contenido</label>
              <Textarea
                placeholder="Descripción o detalles..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Enlace (opcional)</label>
              <Input
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-600 text-stone-300 hover:bg-stone-700">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.title.trim() || !formData.content.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Packing Dialog */}
      <Dialog open={packingDialogOpen} onOpenChange={setPackingDialogOpen}>
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-100 mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={packingFormData.name}
                onChange={(e) => setPackingFormData({ ...packingFormData, name: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-100 mb-1.5 block">Categoría</label>
              <Select value={packingFormData.category} onValueChange={(v) => setPackingFormData({ ...packingFormData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packingCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={packingFormData.quantity}
                onChange={(e) => setPackingFormData({ ...packingFormData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-stone-700 border-stone-600 text-stone-100"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPackingDialogOpen(false)} className="border-stone-600 text-stone-300 hover:bg-stone-700">
                Cancelar
              </Button>
              <Button
                onClick={() => createPackingMutation.mutate(packingFormData)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!packingFormData.name.trim() || createPackingMutation.isPending}
              >
                {createPackingMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}