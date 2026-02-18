import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Info, Cloud, DollarSign, Trash2, ExternalLink, Phone, Package } from 'lucide-react';
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

export default function Utilities() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [jpyAmount, setJpyAmount] = useState('');
  const [eurAmount, setEurAmount] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200 dark:bg-stone-900/80">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Utilidades 🔧</h1>
          <p className="text-stone-600">Información útil para tu viaje</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
        <Tabs defaultValue="weather" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weather">
              <Cloud className="w-4 h-4 mr-2" />
              Clima
            </TabsTrigger>
            <TabsTrigger value="currency">
              <DollarSign className="w-4 h-4 mr-2" />
              Moneda
            </TabsTrigger>
            <TabsTrigger value="packing">
              <Package className="w-4 h-4 mr-2" />
              Maleta
            </TabsTrigger>
          </TabsList>

          {/* Clima */}
          <TabsContent value="weather" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Clima actual</h2>
              <p className="text-stone-500">Pronóstico del tiempo en tiempo real</p>
            </div>
            {cities.length === 0 ? (
              <div className="text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-stone-200 rounded-3xl">
                <Cloud className="w-16 h-16 text-stone-300 mx-auto mb-4" />
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
            <div className="bg-white border-2 border-stone-200 rounded-2xl p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Conversión de Moneda</h2>
                  {loadingRate ? (
                    <p className="text-stone-500">Cargando tasa de cambio...</p>
                  ) : (
                    <p className="text-stone-600">
                      1 EUR = <span className="font-bold text-stone-900">{exchangeRate?.toFixed(2)} JPY</span>
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Yenes (JPY)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">¥</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={jpyAmount}
                        onChange={(e) => handleJpyChange(e.target.value)}
                        className="pl-8 text-lg"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-block p-3 bg-stone-100 rounded-full">
                      <div className="text-2xl">⇅</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Euros (EUR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={eurAmount}
                        onChange={(e) => handleEurChange(e.target.value)}
                        className="pl-8 text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-900">
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
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Checklist de equipaje 🧳</h2>
                <p className="text-stone-500">
                  {packedCount} de {totalPackingItems} artículos listos
                </p>
              </div>
              <Button
                onClick={() => setPackingDialogOpen(true)}
                className="bg-stone-900 hover:bg-stone-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </div>

            {/* Progress Bar */}
            {totalPackingItems > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white mb-6">
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
              <div className="text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-stone-200 rounded-3xl">
                <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
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
                      className="bg-white/70 backdrop-blur-xl border-2 border-stone-200/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all"
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
                                  ? 'bg-green-50/50'
                                  : 'bg-stone-50/50 hover:bg-stone-100/50'
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
                                    ? 'text-stone-500 line-through' 
                                    : 'text-stone-900'
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
                                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity"
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
                          className="w-full border-dashed"
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
        </Tabs>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir información</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Título</label>
              <Input
                placeholder="ej. Policía Japón"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Categoría</label>
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
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Icono</label>
              <Input
                placeholder="Emoji"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Contenido</label>
              <Textarea
                placeholder="Descripción o detalles..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Enlace (opcional)</label>
              <Input
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-stone-900 hover:bg-stone-800"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={packingFormData.name}
                onChange={(e) => setPackingFormData({ ...packingFormData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Categoría</label>
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
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={packingFormData.quantity}
                onChange={(e) => setPackingFormData({ ...packingFormData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPackingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createPackingMutation.mutate(packingFormData)}
                className="bg-stone-900 hover:bg-stone-800"
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