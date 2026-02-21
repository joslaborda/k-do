import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { base44 } from '@/api/base44Client';

import CityCard from '@/components/cities/CityCard';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});



// Coordenadas de ciudades japonesas
const cityCoordinates = {
  'Osaka': [34.6937, 135.5023],
  'Hiroshima': [34.3853, 132.4553],
  'Hakone': [35.2323, 139.1070],
  'Kyoto': [35.0116, 135.7681],
  'Tokyo': [35.6762, 139.6503]
};

export default function Cities() {
  const queryClient = useQueryClient();
  const { performDelete } = useUndo();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cities'] });
    await queryClient.invalidateQueries({ queryKey: ['itineraryDays'] });
  };

  const { isPulling, pullDistance } = usePullToRefresh(handleRefresh);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 30000 // Cache por 30 segundos
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list()
  });



  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.City.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['itineraryDays'] });
    }
  });

  const handleDelete = async (city) => {
    const cityData = { ...city };
    await performDelete(
      () => deleteMutation.mutateAsync(city.id),
      () => base44.entities.City.create(cityData),
      city.name
    );
  };



  const getDaysCount = (cityId) => {
    return itineraryDays.filter((day) => day.city_id === cityId).length;
  };

  const getCityPosition = (cityName) => {
    return cityCoordinates[cityName] || [35.6762, 139.6503]; // Default a Tokyo
  };

  const formatDateRange = (city) => {
    if (!city.start_date) return null;
    const start = new Date(city.start_date);
    const end = city.end_date ? new Date(city.end_date) : null;
    if (end && start.getTime() !== end.getTime()) {
      return `${format(start, 'd', { locale: es })}—${format(end, 'd MMM', { locale: es })}`;
    }
    return format(start, 'd MMM', { locale: es });
  };

  const routePositions = cities.
  map((city) => getCityPosition(city.name)).
  filter((pos) => pos);

  return (
    <div className="min-h-screen bg-background">
       <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} />
       <div className="bg-orange-50 mx-auto px-6 py-12 max-w-6xl">
         <div className="flex items-center justify-between mb-8">
           <div>
             <h1 className="text-slate-800 text-4xl font-bold">Ruta 🗾</h1>
             <p className="text-slate-800 mt-2">Explora tu itinerario por Japón</p>
          </div>
        </div>



        {/* Caja informativa */}
        {!isLoading && cities.length > 0 && (
          <div className="bg-orange-700 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <h3 className="text-xl font-bold mb-2">🗺️ Tu itinerario por Japón</h3>
            <p className="text-white/90">
              Descubre {cities.length} {cities.length === 1 ? 'ciudad' : 'ciudades'} increíbles en tu ruta. 
              Haz clic en cualquier ciudad para ver los detalles de tu itinerario.
            </p>
          </div>
        )}

        {isLoading ?
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) =>
          <div key={i} className="aspect-[16/10] rounded-2xl bg-secondary animate-pulse" />
          )}
           </div> :
        cities.length === 0 ?
        <div className="text-center py-20 glass rounded-2xl border border-border">
             <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-xl font-light text-foreground mb-2">Sin ciudades todavía</h3>
             <p className="text-muted-foreground font-light">Tu ruta aparecerá aquí</p>
           </div> :

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {cities.map((city) =>
          <CityCard
            key={city.id}
            city={city}
            daysCount={getDaysCount(city.id)} />

          )}
           </div>
        }
      </div>
    </div>);

}