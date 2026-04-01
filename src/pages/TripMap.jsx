import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';



export default function TripMap() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId,
  });

  // Sort cities chronologically, fallback to order field
  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [cities]);

  // Build Google Maps directions URL
  const googleMapsUrl = useMemo(() => {
    if (sortedCities.length === 0) return null;
    const waypoints = sortedCities.map(c => encodeURIComponent(`${c.name}, ${c.country || 'Japan'}`));
    return `https://www.google.com/maps/dir/${waypoints.join('/')}`;
  }, [sortedCities]);

  const getDayCount = (city) => {
    if (!city.start_date || !city.end_date) return null;
    return differenceInDays(new Date(city.end_date), new Date(city.start_date)) + 1;
  };

  const formatDate = (d) => d ? format(new Date(d), 'dd MMM', { locale: es }) : null;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Mapa 🗺️</h1>
          <p className="text-white/90 mt-2">Ruta visual del itinerario</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-10">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-border h-96 animate-pulse" />
        ) : sortedCities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Sin ruta definida</h3>
            <p className="text-muted-foreground">
              Añade ciudades a tu ruta para ver el mapa del viaje.
            </p>
            <Link
              to={createPageUrl(`Cities?trip_id=${tripId}`)}
              className="inline-block mt-6 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Ir a Ruta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Route summary pills */}
            <div className="bg-white rounded-2xl border border-border px-5 py-4 flex flex-wrap items-center gap-2 text-sm">
              {sortedCities.map((city, i) => (
                <span key={city.id} className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-800">
                    <span className="w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {city.name}
                  </span>
                  {i < sortedCities.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </span>
              ))}
            </div>

            {/* Map iframe */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ height: '520px' }}>
              <iframe
                src={googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa del viaje"
              />
            </div>

            {/* City detail cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedCities.map((city, i) => {
                const days = getDayCount(city);
                return (
                  <Link
                    key={city.id}
                    to={createPageUrl(`CityDetail?city_id=${city.id}&trip_id=${tripId}`)}
                    className="bg-white rounded-xl border border-border p-4 hover:border-orange-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-orange-700 transition-colors truncate">
                        {city.name}
                      </h4>
                    </div>
                    {(city.start_date || city.end_date) && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(city.start_date)}
                        {city.end_date && ` – ${formatDate(city.end_date)}`}
                      </p>
                    )}
                    {days && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {days} día{days > 1 ? 's' : ''}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}