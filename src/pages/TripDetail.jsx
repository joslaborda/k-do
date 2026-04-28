import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTripCoverImage } from '@/lib/tripImage';
import ActiveCitySelector from '@/components/trip/ActiveCitySelector';
import { useTripContext } from '@/hooks/useTripContext';

export default function TripDetail() {
  const [tripId, setTripId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTripId(urlParams.get('id'));
    window.scrollTo(0, 0);
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
      {/* Hero con foto de portada */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={getTripCoverImage(trip, tripCities)}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 pt-12">
          <div className="flex items-center justify-end">
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{trip.name}</h1>
            <div className="flex flex-wrap gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}, {trip.country}</span>
              {trip.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(trip.start_date), 'dd MMM', { locale: es })}
                  {trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
                </span>
              )}
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{trip.members?.length || 1} viajero{(trip.members?.length || 1) > 1 ? 's' : ''}</span>
            </div>
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



        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-hidden">
          <Link to={createPageUrl(`Cities?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🗺️</div>
              <h3 className="text-base font-bold text-foreground mb-1">Ruta</h3>
              <p className="text-xs text-muted-foreground">Ciudades e itinerario</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Documents?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="text-base font-bold text-foreground mb-1">Docs</h3>
              <p className="text-xs text-muted-foreground">Documentos y checklist</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Restaurants?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📍</div>
              <h3 className="text-base font-bold text-foreground mb-1">Spots</h3>
              <p className="text-xs text-muted-foreground">Lugares que visitar</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Expenses?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-base font-bold text-foreground mb-1">Gastos</h3>
              <p className="text-xs text-muted-foreground">Gestión de gastos</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Utilities?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔧</div>
              <h3 className="text-base font-bold text-foreground mb-1">Útil</h3>
              <p className="text-xs text-muted-foreground">Info útil y clima</p>
            </div>
          </Link>

          <Link to={createPageUrl(`Diary?trip_id=${tripId}`)}>
            <div className="glass border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📔</div>
              <h3 className="text-base font-bold text-foreground mb-1">Diario</h3>
              <p className="text-xs text-muted-foreground">{diaryEntries.length} entradas</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}