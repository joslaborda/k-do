import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import GlobalSearch from '@/components/GlobalSearch';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MapPin, Calendar, Plane, UtensilsCrossed, Receipt, 
  Package, Info, CheckCircle2, Clock, TrendingUp,
  ArrowRight, Search, Languages, BookOpen, Users, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatsSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    
    if (!id || id === 'null' || id === 'default') {
      navigate(createPageUrl('TripsList'), { replace: true });
      return;
    }
    
    setTripId(id);
  }, [navigate]);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      return base44.entities.Trip.get(tripId);
    },
    enabled: !!tripId,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name || '',
          destination: data.destination || '',
          country: data.country || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          description: data.description || '',
          cover_image: data.cover_image || '',
          currency: data.currency || 'EUR',
          members: data.members || []
        });
      }
    }
  });

  useEffect(() => {
    if (trip && !formData.name) {
      setFormData({
        name: trip.name || '',
        destination: trip.destination || '',
        country: trip.country || '',
        start_date: trip.start_date || '',
        end_date: trip.end_date || '',
        description: trip.description || '',
        cover_image: trip.cover_image || '',
        currency: trip.currency || 'EUR',
        members: trip.members || []
      });
    }
  }, [trip]);

  const updateTripMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setSettingsOpen(false);
    },
  });

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const { data: packingItems = [], isLoading: packingLoading } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const { data: diaryEntries = [], isLoading: diaryLoading } = useQuery({
    queryKey: ['diaryEntries', tripId],
    queryFn: () => base44.entities.DiaryEntry.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const tripStart = trip?.start_date ? new Date(trip.start_date) : new Date();
  const tripEnd = trip?.end_date ? new Date(trip.end_date) : new Date();
  const today = new Date();
  const daysUntilTrip = differenceInDays(tripStart, today);
  const tripDuration = differenceInDays(tripEnd, tripStart) + 1;
  
  const totalExpenses = useMemo(() => {
    let totalJPY = 0;
    expenses.forEach(exp => {
      if (exp.currency === 'JPY') {
        totalJPY += exp.amount;
      } else {
        totalJPY += exp.amount * 160;
      }
    });
    return {
      jpy: totalJPY,
      eur: Math.round(totalJPY / 160)
    };
  }, [expenses]);

  const packedPercentage = useMemo(() => {
    if (packingItems.length === 0) return 0;
    return Math.round((packingItems.filter(i => i.packed).length / packingItems.length) * 100);
  }, [packingItems]);

  const sections = [
    { name: 'Ruta', page: 'Cities', icon: MapPin, color: 'from-red-500 to-pink-500', emoji: '🗾' },
    { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed, color: 'from-orange-500 to-red-500', emoji: '🍜' },
    { name: 'Gastos', page: 'Expenses', icon: Receipt, color: 'from-green-500 to-emerald-500', emoji: '💴' },
    { name: 'Maleta', page: 'Packing', icon: Package, color: 'from-blue-500 to-cyan-500', emoji: '🧳' },
    { name: 'Docs', page: 'Calendar', icon: Plane, color: 'from-slate-500 to-gray-500', emoji: '✈️' },
    { name: 'Diario', page: 'Diary', icon: BookOpen, color: 'from-purple-500 to-pink-500', emoji: '📔' },
    { name: 'Traductor', page: 'Translator', icon: Languages, color: 'from-indigo-500 to-purple-500', emoji: '🈯' },
    { name: 'Útil', page: 'Utilities', icon: Info, color: 'from-teal-500 to-green-500', emoji: '🔧' },
  ];

  if (tripLoading || !tripId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('TripsList')}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Volver a viajes
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{trip?.name || 'Japón 2026'}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {trip?.destination}, {trip?.country}
                </div>
                {trip?.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(trip.start_date), 'dd MMM', { locale: es })}
                    {trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {trip?.members?.length || 1} viajero{(trip?.members?.length || 1) > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-4 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Buscar</span>
            </button>
          </div>
        </div>
      </div>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-2 border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duración</p>
                <p className="text-2xl font-bold text-foreground">{tripDuration} días</p>
              </div>
            </div>
          </motion.div>

          {daysUntilTrip > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border-2 border-primary rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-orange-600/5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comienza en</p>
                  <p className="text-2xl font-bold text-primary">{daysUntilTrip} días</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border-2 border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastado</p>
                <p className="text-2xl font-bold text-foreground">€{totalExpenses.eur.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">¥{totalExpenses.jpy.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

      {/* Quick Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 mt-6 pb-6">
        <div className="glass rounded-2xl shadow-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Progreso de maleta</span>
            </div>
            <span className="text-2xl font-bold text-primary">{packedPercentage}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500"
              style={{ width: `${packedPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {packingItems.filter(i => i.packed).length} de {packingItems.length} artículos empacados
          </p>
        </div>
      </div>

      {/* Navigation Cards - Glassmorphism */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-medium">Navega tu viaje</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                 to={createPageUrl(`${section.page}?trip_id=${tripId}`)}
                 className="group relative overflow-hidden glass rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
               >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative p-6 flex flex-col items-center gap-3">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {section.emoji}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {section.name}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                </Link>
             </motion.div>
            ))}
            </div>
            </div>
            </div>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle className="text-foreground text-2xl">⚙️ Configuración del Viaje</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 pt-4">
               <div>
                 <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
                 <Input
                   placeholder="ej. Japón 2025"
                   value={formData.name || ''}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="bg-input border-border text-foreground"
                 />
               </div>

               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label>
                   <Input
                     placeholder="ej. Tokio"
                     value={formData.destination || ''}
                     onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                     className="bg-input border-border text-foreground"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1.5 block">País</label>
                   <Input
                     placeholder="ej. Japón"
                     value={formData.country || ''}
                     onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                     className="bg-input border-border text-foreground"
                   />
                 </div>
               </div>

               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                   <Input
                     type="date"
                     value={formData.start_date || ''}
                     onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                     className="bg-input border-border text-foreground"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                   <Input
                     type="date"
                     value={formData.end_date || ''}
                     onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                     className="bg-input border-border text-foreground"
                   />
                 </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-foreground mb-1.5 block">Viajeros (emails separados por coma)</label>
                 <Input
                   placeholder="email1@example.com, email2@example.com"
                   value={formData.members?.join(', ') || ''}
                   onChange={(e) => setFormData({ ...formData, members: e.target.value.split(',').map(m => m.trim()).filter(Boolean) })}
                   className="bg-input border-border text-foreground"
                 />
               </div>

               <div>
                 <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
                 <Textarea
                   placeholder="Describe tu viaje..."
                   value={formData.description || ''}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   rows={3}
                   className="bg-input border-border text-foreground"
                 />
               </div>

               <div>
                 <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
                 <Input
                   placeholder="https://..."
                   value={formData.cover_image || ''}
                   onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                   className="bg-input border-border text-foreground"
                 />
               </div>

               <div className="flex justify-end gap-3 pt-4">
                 <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                   Cancelar
                 </Button>
                 <Button
                   onClick={() => updateTripMutation.mutate(formData)}
                   className="bg-primary hover:bg-primary/90"
                   disabled={!formData.name || !formData.destination || updateTripMutation.isPending}
                 >
                   {updateTripMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                 </Button>
               </div>
             </div>
            </DialogContent>
            </Dialog>
            </div>
            );
            }