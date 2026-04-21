import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Settings, MapPin, Calendar, DollarSign, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTripContext } from '@/hooks/useTripContext';
import ActiveCitySelector from '@/components/trip/ActiveCitySelector';

export default function TripDetail() {
  const [tripId, setTripId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTripId(urlParams.get('id'));
    base44.auth.me().then(setUser);
  }, []);

  const { cities: tripCities, activeCity, overrideCityId, setOverrideCityId, clearOverride } = useTripContext(tripId);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      // Si el tripId es "default", no existe trip real, ir a TripsList
      if (tripId === 'default') {
        window.location.href = createPageUrl('TripsList');
        return null;
      }
      const trips = await base44.entities.Trip.list();
      const foundTrip = trips.find(t => t.id === tripId);
      if (!foundTrip) {
        // Si no se encuentra el trip, redirigir a TripsList
        window.location.href = createPageUrl('TripsList');
        return null;
      }
      return foundTrip;
    },
    enabled: !!tripId,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }),
    enabled: !!tripId,
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId, user_id: user?.id }),
    enabled: !!tripId && !!user,
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['diaryEntries', tripId],
    queryFn: () => base44.entities.DiaryEntry.filter({ trip_id: tripId }),
    enabled: !!tripId,
  });

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  const daysUntilTrip = trip.start_date ? differenceInDays(new Date(trip.start_date), new Date()) : 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const packedCount = packingItems.filter(i => i.packed).length;
  const packingProgress = packingItems.length > 0 ? Math.round((packedCount / packingItems.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link to={createPageUrl('TripsList')}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a viajes
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{trip.name}</h1>
              {tripCities.length > 0 && (
                <div className="mb-3">
                  <ActiveCitySelector
                    cities={tripCities}
                    overrideCityId={overrideCityId}
                    setOverrideCityId={setOverrideCityId}
                    clearOverride={clearOverride}
                    activeCity={activeCity}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {trip.destination}, {trip.country}
                </div>
                {trip.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(trip.start_date), 'dd MMM', { locale: es })}
                    {trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {trip.members?.length || 1} viajero{(trip.members?.length || 1) > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
        {/* Countdown */}
        {daysUntilTrip > 0 && (
          <div className="glass border-2 border-primary rounded-3xl p-8 mb-8 text-center bg-gradient-to-br from-primary/5 to-orange-600/5">
            <p className="text-sm text-muted-foreground mb-2">Tu aventura comienza en</p>
            <p className="text-6xl font-bold text-primary mb-2">{daysUntilTrip}</p>
            <p className="text-lg text-foreground">día{daysUntilTrip !== 1 ? 's' : ''}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass border-2 border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipaje</p>
                <p className="text-2xl font-bold text-foreground">{packingProgress}%</p>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${packingProgress}%` }} />
            </div>
          </div>

          <div className="glass border-2 border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastos</p>
                <p className="text-2xl font-bold text-foreground">{totalExpenses.toFixed(0)} {trip.currency}</p>
              </div>
            </div>
          </div>

          <div className="glass border-2 border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destinos</p>
                <p className="text-2xl font-bold text-foreground">{cities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={createPageUrl(`Cities?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗺️</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ruta</h3>
              <p className="text-sm text-muted-foreground">Ciudades e itinerario</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Calendar?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Docs</h3>
              <p className="text-sm text-muted-foreground">Documentos y checklist</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Restaurants?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🍜</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Yummy</h3>
              <p className="text-sm text-muted-foreground">Restaurantes</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Expenses?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Gastos</h3>
              <p className="text-sm text-muted-foreground">Gestión de gastos</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Utilities?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔧</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Útil</h3>
              <p className="text-sm text-muted-foreground">Info útil y clima</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Diary?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📔</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Diario</h3>
              <p className="text-sm text-muted-foreground">{diaryEntries.length} entradas</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}