import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Sparkles, Plus } from 'lucide-react';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { base44 } from '@/api/base44Client';
import CityCard from '@/components/cities/CityCard';

import { Button } from '@/components/ui/button';
import AIGeneratorPanel from '@/components/itinerary/AIGeneratorPanel';
import AIGeneratingStatus from '@/components/itinerary/AIGeneratingStatus';
import { generateDaysForCity, suggestCitiesForTrip, savePreferences, updateVisitedPlaces } from '@/lib/itineraryAI';
import { useToast } from '@/components/ui/use-toast';

export default function Cities() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generatingCity, setGeneratingCity] = useState('');

  const queryClient = useQueryClient();
  const { performDelete } = useUndo();
  const { toast } = useToast();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cities'] });
    await queryClient.invalidateQueries({ queryKey: ['itineraryDays'] });
  };

  const { isPulling, pullDistance } = usePullToRefresh(handleRefresh);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => tripId
      ? base44.entities.City.filter({ trip_id: tripId }, 'order')
      : base44.entities.City.list('order'),
    staleTime: 30000
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => tripId
      ? base44.entities.ItineraryDay.filter({ trip_id: tripId })
      : base44.entities.ItineraryDay.list()
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId
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

  const handleGenerateItinerary = async (preferences) => {
    if (!trip) return;
    setAiPanelOpen(false);
    setIsGenerating(true);
    setGeneratingStep(0);

    // Save preferences persistently (Trip entity + localStorage)
    await savePreferences(tripId, preferences);

    let citiesToProcess = cities;

    // If no route, create cities first
    if (cities.length === 0) {
      setGeneratingCity('Definiendo ruta...');
      setGeneratingStep(1);
      const suggestedCities = await suggestCitiesForTrip({ trip, preferences });
      
      for (let i = 0; i < suggestedCities.length; i++) {
        await base44.entities.City.create({
          ...suggestedCities[i],
          trip_id: tripId,
          country: trip.country || 'Japan',
        });
      }

      citiesToProcess = await base44.entities.City.filter({ trip_id: tripId }, 'order');
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
    }

    // Generate days for each city
    const allExistingDays = await base44.entities.ItineraryDay.filter({ trip_id: tripId });

    for (let i = 0; i < citiesToProcess.length; i++) {
      const city = citiesToProcess[i];
      if (!city.start_date || !city.end_date) continue;

      setGeneratingCity(city.name);
      setGeneratingStep(Math.min(2 + i, 5));

      // Delete existing days for this city to regenerate
      const existingCityDays = allExistingDays.filter(d => d.city_id === city.id);
      for (const day of existingCityDays) {
        await base44.entities.ItineraryDay.delete(day.id);
      }

      const newDays = await generateDaysForCity({
        city,
        trip,
        existingDays: allExistingDays.filter(d => d.city_id !== city.id),
        preferences,
        allCities: citiesToProcess.filter(c => c.id !== city.id),
        onStatus: (msg) => setGeneratingCity(`${city.name}: ${msg}`),
      });

      for (let j = 0; j < newDays.length; j++) {
        await base44.entities.ItineraryDay.create({
          ...newDays[j],
          trip_id: tripId,
          city_id: city.id,
          order: j,
        });
      }

      // Update visited_places after each city so next city respects them
      const latestTrip = await base44.entities.Trip.get(tripId);
      await updateVisitedPlaces(latestTrip, newDays);
      // Refresh allExistingDays for the next iteration
      allExistingDays.push(...newDays.map(d => ({ ...d, city_id: city.id })));
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['itineraryDays', tripId] });
    queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });

    toast({
      title: '¡Itinerario generado! 🎌',
      description: 'Tu viaje inteligente está listo. Entra en cada ciudad para ver el detalle.',
    });
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} />

      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-4xl font-bold">Ruta 🗾</h1>
              <p className="text-white/90 mt-2">Explora tu itinerario</p>
            </div>
            <Button
              onClick={() => setAiPanelOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mt-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generar con IA
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-6 max-w-6xl -mt-12">
        {isGenerating ? (
          <div className="bg-white rounded-2xl border border-border p-8">
            <AIGeneratingStatus step={generatingStep} cityName={generatingCity} />
          </div>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-border">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-light text-foreground mb-2">Sin ciudades todavía</h3>
            <p className="text-muted-foreground font-light mb-6">Tu ruta aparecerá aquí</p>
            <Button
              onClick={() => setAiPanelOpen(true)}
              className="bg-orange-700 hover:bg-orange-800 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generar itinerario con IA
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                daysCount={getDaysCount(city.id)}
                tripId={tripId}
              />
            ))}
          </div>
        )}
      </div>

      <AIGeneratorPanel
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
        onGenerate={handleGenerateItinerary}
        isGenerating={isGenerating}
        trip={trip}
        cities={cities}
      />
    </div>
  );
}