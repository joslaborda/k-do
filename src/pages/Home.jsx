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
  ArrowRight, Search, Languages, BookOpen, Users, Settings } from
'lucide-react';
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
    }
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
    expenses.forEach((exp) => {
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
    return Math.round(packingItems.filter((i) => i.packed).length / packingItems.length * 100);
  }, [packingItems]);

  const sections = [
  { name: 'Ruta', page: 'Cities', icon: MapPin, color: 'from-red-500 to-pink-500', emoji: '🗾' },
  { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed, color: 'from-orange-500 to-red-500', emoji: '🍜' },
  { name: 'Gastos', page: 'Expenses', icon: Receipt, color: 'from-green-500 to-emerald-500', emoji: '💴' },
  { name: 'Maleta', page: 'Packing', icon: Package, color: 'from-blue-500 to-cyan-500', emoji: '🧳' },
  { name: 'Docs', page: 'Calendar', icon: Plane, color: 'from-slate-500 to-gray-500', emoji: '✈️' },
  { name: 'Diario', page: 'Diary', icon: BookOpen, color: 'from-purple-500 to-pink-500', emoji: '📔' },
  { name: 'Traductor', page: 'Translator', icon: Languages, color: 'from-indigo-500 to-purple-500', emoji: '🈯' },
  { name: 'Útil', page: 'Utilities', icon: Info, color: 'from-teal-500 to-green-500', emoji: '🔧' }];


  if (tripLoading || !tripId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <p className="text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <Link to={createPageUrl('TripsList')}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Volver a viajes
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-white text-4xl font-bold">{trip?.name || 'Japón 2026'}</h1>
            <p className="text-white/90 mt-2">Planifica tu viaje</p>
          </div>
        </div>
      </div>

      {/* Hero Section with Background Image */}
      <div
        className="relative"
        style={{
          backgroundImage: 'url(https://images.travelandleisureasia.com/wp-content/uploads/sites/5/2024/01/11144526/feature-2024-01-11t102331-123.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        {/* Content */}
        <div className="relative z-10">

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />

          {/* Stats Cards - 2 columns */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} className="bg-orange-50 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">


                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-700 p-2 rounded-lg">
                    <Calendar className="text-zinc-50 lucide lucide-calendar w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duración</p>
                    <p className="text-xl font-bold text-foreground">{tripDuration} días</p>
                  </div>
                </div>
              </motion.div>

              {daysUntilTrip > 0 &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} className="bg-orange-50 p-4 rounded-xl backdrop-blur-md border border-primary/30 shadow-lg">


                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-700 p-2 rounded-lg">
                      <Clock className="text-zinc-50 lucide lucide-clock w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comienza en</p>
                      <p className="text-xl font-bold text-primary">{daysUntilTrip} días</p>
                    </div>
                  </div>
                </motion.div>
              }

              <Link to={createPageUrl(`Expenses?trip_id=${tripId}`)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }} className="bg-orange-50 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">


                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-700 text-orange-700 p-2 rounded-lg">
                      <Receipt className="text-zinc-50 lucide lucide-receipt w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gastado</p>
                      <p className="text-xl font-bold text-foreground">€{totalExpenses.eur.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">¥{totalExpenses.jpy.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link to={createPageUrl(`Diary?trip_id=${tripId}`)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }} className="bg-orange-50 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">


                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-700 p-2 rounded-lg">
                      <BookOpen className="text-zinc-50 lucide lucide-book-open w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recuerdos</p>
                      <p className="text-xl font-bold text-foreground">{diaryEntries.length}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Quick Progress Bar */}
            <div className="pb-8">
              <div className="bg-orange-50 p-4 rounded-xl backdrop-blur-md shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Progreso de maleta</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{packedPercentage}%</span>
                </div>
                <div className="bg-green-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500"
                    style={{ width: `${packedPercentage}%` }} />

                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {packingItems.filter((i) => i.packed).length} de {packingItems.length} artículos empacados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section - Outside of background image */}
      <div className="bg-orange-50 mx-auto pb-24 px-6 py-12 max-w-6xl">
        <h2 className="text-slate-800 mb-6 text-lg font-medium uppercase tracking-widest">NAVEGA TU VIAJE</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map((section, idx) =>
          <motion.div
            key={section.page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}>

              <Link
              to={createPageUrl(`${section.page}?trip_id=${tripId}`)}
              className="group relative overflow-hidden glass rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block">

                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="bg-[#ffffff] p-6 relative flex flex-col items-center gap-3">
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
          )}
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
                className="bg-input border-border text-foreground" />

            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label>
                <Input
                  placeholder="ej. Tokio"
                  value={formData.destination || ''}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País</label>
                <Input
                  placeholder="ej. Japón"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Viajeros (emails separados por coma)</label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={formData.members?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, members: e.target.value.split(',').map((m) => m.trim()).filter(Boolean) })}
                className="bg-input border-border text-foreground" />

            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <Textarea
                placeholder="Describe tu viaje..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-input border-border text-foreground" />

            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              <Input
                placeholder="https://..."
                value={formData.cover_image || ''}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="bg-input border-border text-foreground" />

            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => updateTripMutation.mutate(formData)}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.name || !formData.destination || updateTripMutation.isPending}>

                {updateTripMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}