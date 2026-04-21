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
  Package, Info, Clock,
  ArrowRight, Search, Languages, BookOpen, Users, Settings, Trash2 } from
'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import ActiveCitySelector from '@/components/trip/ActiveCitySelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatsSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';
import { getTripCoverImage } from '@/lib/tripImage';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TripMembersPanel from '@/components/trip/TripMembersPanel';
import TodayTomorrowPanel from '@/components/trip/TodayTomorrowPanel';
import DeleteTripModal from '@/components/trip/DeleteTripModal';
import PublishSection from '@/components/trip/PublishSection';
import TripCountdownBanner from '@/components/trip/TripCountdownBanner';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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
    window.scrollTo(0, 0);
    base44.auth.me().then(setCurrentUser).catch(() => {});
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

  const deleteTripMutation = useMutation({
    mutationFn: () => base44.entities.Trip.delete(tripId),
    onSuccess: () => {
      setDeleteOpen(false);
      navigate(createPageUrl('TripsList'), { replace: true });
    }
  });

  const currentUserEmail = currentUser?.email;
  const roles = trip?.roles || {};
  const isAdmin = !trip || roles[currentUserEmail] === 'admin' || trip?.created_by === currentUserEmail || Object.keys(roles).length === 0;

  // Active country context
  const { activeCity, activeMeta, countryRoute, setOverrideCityId } = useTripContext(tripId);

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

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const results = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return results[0] || null;
    },
    enabled: !!currentUser?.id,
    staleTime: 60000
  });

  const tripStart = trip?.start_date ? new Date(trip.start_date) : new Date();
  const tripEnd = trip?.end_date ? new Date(trip.end_date) : new Date();
  const today = new Date();
  const daysUntilTrip = differenceInDays(tripStart, today);
  const tripDuration = differenceInDays(tripEnd, tripStart) + 1;

  const totalExpenses = useMemo(() => {
   const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return { total };
  }, [expenses]);

  const packedPercentage = useMemo(() => {
    if (packingItems.length === 0) return 0;
    return Math.round(packingItems.filter((i) => i.packed).length / packingItems.length * 100);
  }, [packingItems]);

  const sharedSections = [
    { name: 'Ruta', page: 'Cities', icon: MapPin, color: 'from-red-500 to-pink-500', emoji: '🗾' },
    { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed, color: 'from-orange-500 to-red-500', emoji: '🍜' },
    { name: 'Gastos', page: 'Expenses', icon: Receipt, color: 'from-green-500 to-emerald-500', emoji: '💴' },
    { name: 'Diario', page: 'Diary', icon: BookOpen, color: 'from-purple-500 to-pink-500', emoji: '📔' },
    { name: 'Traductor', page: 'Translator', icon: Languages, color: 'from-indigo-500 to-purple-500', emoji: '🈯' },
    { name: 'Útil', page: 'Utilities', icon: Info, color: 'from-teal-500 to-green-500', emoji: '🔧' }
  ];

  const personalSections = [
    { name: 'Maleta', page: 'Packing', icon: Package, color: 'from-blue-500 to-cyan-500', emoji: '🧳' },
    { name: 'Docs', page: 'Documents', icon: Plane, color: 'from-slate-500 to-gray-500', emoji: '✈️' }
  ];


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
    <div className="bg-orange-50 min-h-screen">
      {/* Hero Section with Background Image */}
      <div
        className="relative"
        style={{
          backgroundImage: `url(${getTripCoverImage(trip, cities)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%'
        }}>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="border-b border-white/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <Link to={createPageUrl('TripsList')}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Volver a viajes
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{trip?.name || 'Japón 2026'}</h1>
                  <div className="flex flex-wrap gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {trip?.destination}, {trip?.country}
                    </div>
                    {trip?.start_date &&
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(trip.start_date), 'dd MMM', { locale: es })}
                        {trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
                      </div>
                    }
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {trip?.members?.length || 1} viajero{(trip?.members?.length || 1) > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Ahora + Ruta multi-país */}
                  {activeCity && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                        <span>{activeMeta.flag}</span>
                        <span>Ahora: {activeCity.name}, {activeCity.country}</span>
                        <span className="text-white/70">· {activeMeta.currency}</span>
                      </div>
                      {countryRoute.length > 1 && (
                        <div className="text-white/70 text-xs flex items-center gap-1">
                          <span>Ruta:</span>
                          {countryRoute.map((c, i) => (
                            <span key={c} className="flex items-center gap-1">
                              {i > 0 && <ArrowRight className="w-3 h-3" />}
                              <span>{c}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="ml-auto">
                        <ActiveCitySelector
                          cities={cities}
                          activeCity={activeCity}
                          onSelect={setOverrideCityId}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSearchOpen(true)} className="bg-zinc-50 ml-4 px-4 py-2 rounded-lg hover:bg-white backdrop-blur-sm transition-colors flex items-center gap-2 shadow-md">


                  <Search className="w-4 h-4" />
                  <span className="text-sm">Buscar</span>
                </button>
              </div>
            </div>
          </div>

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
                      <p className="text-xl font-bold text-foreground">{totalExpenses.total.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link to={createPageUrl(`Diary?trip_id=${tripId}`)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }} className="md:col-span-2 bg-orange-50 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">


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


          </div>
        </div>
      </div>

      {/* Navigation Section - Outside of background image */}
      <div className="bg-orange-50 mx-auto pb-24 px-6 py-12 max-w-6xl space-y-10">

        {/* Countdown Banner */}
        <TripCountdownBanner
          daysUntilTrip={daysUntilTrip}
          tripId={tripId}
          cities={cities}
          packingItems={packingItems}
          trip={trip}
          expenses={expenses}
        />

        {/* Hoy / Mañana */}
        <div>
          <h2 className="text-slate-800 text-sm font-semibold uppercase tracking-widest mb-3">📅 Hoy / Mañana</h2>
          <TodayTomorrowPanel tripId={tripId} cities={cities} />
        </div>

        {/* Shared sections */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-slate-800 text-lg font-medium uppercase tracking-widest">Compartido</h2>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 border text-xs font-medium">👥 Todo el grupo</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sharedSections.map((section, idx) =>
              <motion.div key={section.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link to={createPageUrl(`${section.page}?trip_id=${tripId}`)} className="group relative overflow-hidden glass rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="bg-white p-6 relative flex flex-col items-center gap-3">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">{section.emoji}</div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">{section.name}</div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Personal sections */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-slate-800 text-lg font-medium uppercase tracking-widest">Personal</h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 border text-xs font-medium">🔒 Solo visible para ti</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {personalSections.map((section, idx) =>
              <motion.div key={section.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link to={createPageUrl(`${section.page}?trip_id=${tripId}`)} className="group relative overflow-hidden glass rounded-2xl border border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="bg-white p-6 relative flex flex-col items-center gap-3">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">{section.emoji}</div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">{section.name}</div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Members Panel */}
        <div className="glass rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Viajeros
          </h2>
          <TripMembersPanel trip={trip} currentUserEmail={currentUserEmail} />
        </div>

        {/* Publish Section (only admins) */}
        {isAdmin && (
          <PublishSection
            trip={trip}
            cities={cities}
            user={currentUser}
            profile={myProfile}
            isAdmin={isAdmin}
            onPublish={() => {
              queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
            }}
          />
        )}
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
              {formData.cover_image && (
                <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted">
                  <img src={formData.cover_image} alt="preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                </div>
              )}
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_image || ''}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="bg-input border-border text-foreground" />
            </div>

            <div className="flex items-center justify-between pt-4">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSettingsOpen(false); setDeleteOpen(true); }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar viaje
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateTripMutation.mutate(formData)}
                  className="bg-orange-700 hover:bg-orange-800"
                  disabled={!formData.name || !formData.destination || updateTripMutation.isPending}>
                  {updateTripMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteTripModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tripName={trip?.name || ''}
        onConfirm={() => deleteTripMutation.mutate()}
        isPending={deleteTripMutation.isPending}
      />
    </div>);

}