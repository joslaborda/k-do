import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Info, Cloud, DollarSign, Trash2, ExternalLink, Phone } from 'lucide-react';
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

export default function Utilities() {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const queryClient = useQueryClient();

  const { data: infos = [] } = useQuery({
    queryKey: ['usefulInfo'],
    queryFn: () => base44.entities.UsefulInfo.list(),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
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
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <Info className="w-4 h-4 mr-2" />
              Info Útil
            </TabsTrigger>
            <TabsTrigger value="weather">
              <Cloud className="w-4 h-4 mr-2" />
              Clima
            </TabsTrigger>
            <TabsTrigger value="currency">
              <DollarSign className="w-4 h-4 mr-2" />
              Moneda
            </TabsTrigger>
          </TabsList>

          {/* Info útil */}
          <TabsContent value="info" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-stone-900 hover:bg-stone-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Info
              </Button>
            </div>

            {infos.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
                <Info className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-400">Añade información útil para tu viaje</p>
              </div>
            ) : (
              <div className="space-y-8">
                {infoCategories.map((cat) => {
                  const categoryInfos = groupedInfos[cat.value] || [];
                  if (categoryInfos.length === 0) return null;

                  return (
                    <div key={cat.value} className="bg-white border-2 border-stone-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{cat.icon}</span>
                        <h2 className="text-xl font-bold text-stone-900">{cat.label}</h2>
                      </div>

                      <div className="space-y-3">
                        {categoryInfos.map((info) => (
                          <div
                            key={info.id}
                            className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200"
                          >
                            <span className="text-2xl">{info.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-stone-900 mb-1">{info.title}</h3>
                              <p className="text-sm text-stone-600 mb-2">{info.content}</p>
                              {info.link && (
                                <a
                                  href={info.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  Ver más <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(info.id)}
                              className="text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

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
    </div>
  );
}