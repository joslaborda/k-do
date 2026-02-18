import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Route, GripVertical } from 'lucide-react';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
  const [showRoute, setShowRoute] = useState(false);
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
    staleTime: 30000, // Cache por 30 segundos
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list(),
  });



  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.City.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['itineraryDays'] });
    },
  });

  const handleDelete = async (city) => {
    const cityData = { ...city };
    await performDelete(
      () => deleteMutation.mutateAsync(city.id),
      () => base44.entities.City.create(cityData),
      city.name
    );
  };

  const reorderMutation = useMutation({
    mutationFn: async (reorderedCities) => {
      await Promise.all(
        reorderedCities.map((city, index) => 
          base44.entities.City.update(city.id, { order: index })
        )
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cities'] }),
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(cities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderMutation.mutate(items);
  };

  const getDaysCount = (cityId) => {
    return itineraryDays.filter(day => day.city_id === cityId).length;
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

  const routePositions = cities
    .map(city => getCityPosition(city.name))
    .filter(pos => pos);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-900 transition-colors">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-stone-900">Ruta</h1>
            <p className="text-stone-500 mt-1 font-light">Explora tu itinerario por Japón</p>
          </div>
        </div>



        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <MapPin className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-light text-stone-700 mb-2">Sin ciudades todavía</h3>
            <p className="text-stone-500 font-light">Tu ruta aparecerá aquí</p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-6 font-light flex items-center gap-2">
              Ciudades
              <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded-full">Arrastra para reordenar</span>
            </h2>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cities">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {cities.map((city, index) => (
                      <Draggable key={city.id} draggableId={city.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <div className="relative group">
                              <div
                                {...provided.dragHandleProps}
                                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5 text-stone-400" />
                              </div>
                              <CityCard 
                                city={city} 
                                daysCount={getDaysCount(city.id)}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  );
}