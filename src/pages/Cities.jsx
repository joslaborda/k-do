import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Sparkles, ArrowUpDown } from 'lucide-react';
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

function normalizeText(str = '') {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const COUNTRY_ALIASES = [
  { keys: ['japan', 'japon', 'japón', 'jp'], value: 'Japón' },
  { keys: ['italy', 'italia', 'it'], value: 'Italia' },
  { keys: ['france', 'francia', 'fr'], value: 'Francia' },
  { keys: ['spain', 'espana', 'españa', 'es'], value: 'España' },
  { keys: ['portugal', 'pt'], value: 'Portugal' },
  { keys: ['germany', 'alemania', 'de'], value: 'Alemania' },
  { keys: ['united kingdom', 'uk', 'reino unido', 'england', 'britain'], value: 'Reino Unido' },
  { keys: ['united states', 'usa', 'estados unidos', 'eeuu'], value: 'Estados Unidos' },
  { keys: ['mexico', 'méxico', 'mx'], value: 'México' },
  { keys: ['argentina', 'ar'], value: 'Argentina' },
  { keys: ['brazil', 'brasil', 'br'], value: 'Brasil' },
  { keys: ['thailand', 'tailandia', 'th'], value: 'Tailandia' },
  { keys: ['south korea', 'korea', 'corea', 'corea del sur', 'kr'], value: 'Corea del Sur' },
  { keys: ['china', 'cn'], value: 'China' },
  { keys: ['vietnam', 'vn'], value: 'Vietnam' },
  { keys: ['singapore', 'singapur', 'sg'], value: 'Singapur' },
  { keys: ['indonesia', 'id'], value: 'Indonesia' },
  { keys: ['morocco', 'marruecos', 'ma'], value: 'Marruecos' },
  { keys: ['turkey', 'turquia', 'turquía', 'tr'], value: 'Turquía' },
  { keys: ['switzerland', 'suiza', 'ch'], value: 'Suiza' },
  { keys: ['greece', 'grecia', 'gr'], value: 'Grecia' },
];

function detectCountryFromText(text) {
  const n = normalizeText(text);
  if (!n) return '';
  for (const row of COUNTRY_ALIASES) {
    for (const k of row.keys) {
      const kn = normalizeText(k);
      if (n === kn) return row.value;
    }
  }
  for (const row of COUNTRY_ALIASES) {
    for (const k of row.keys) {
      const kn = normalizeText(k);
      if (n.includes(kn) || kn.includes(n)) return row.value;
    }
  }
  return '';
}

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
    queryFn: () =>
      tripId
        ? base44.entities.City.filter({ trip_id: tripId }, 'order')
        : base44.entities.City.list('order'),
    staleTime: 30000,
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () =>
      tripId
        ? base44.entities.ItineraryDay.filter({ trip_id: tripId })
        : base44.entities.ItineraryDay.list(),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  // Sort cities: start_date first, then order
  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
      if (a.start_date) return -1;
      if (b.start_date) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [cities]);

  const reorderByDatesMutation = useMutation({
    mutationFn: async () => {
      const withDates = sortedCities.filter((c) => c.start_date);
      const withoutDates = sortedCities.filter((c) => !c.start_date);
      const ordered = [...withDates, ...withoutDates];
      await Promise.all(ordered.map((city, idx) =>
        base44.entities.City.update(city.id, { order: idx })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      toast({ title: 'Ciudades reordenadas por fechas ✓' });
    },
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

  const getDaysCount = (cityId) => {
    return itineraryDays.filter((day) => day.city_id === cityId).length;
  };

  const handleGenerateItinerary = async (preferences) => {
    if (!trip) return;

    setAiPanelOpen(false);
    setIsGenerating(true);
    setGeneratingStep(0);

    await savePreferences(tripId, preferences);

    let citiesToProcess = cities;

    const inferredTripCountry =
      (trip.country && trip.country.trim()) ||
      detectCountryFromText(trip.destination) ||
      '';

    if (cities.length === 0) {
      setGeneratingCity('Definiendo ruta...');
      setGeneratingStep(1);

      const suggestedCities = await suggestCitiesForTrip({ trip, preferences });

      for (let i = 0; i < suggestedCities.length; i++) {
        await base44.entities.City.create({
          ...suggestedCities[i],
          trip_id: tripId,
          country: inferredTripCountry,
        });
      }

      citiesToProcess = await base44.entities.City.filter({ trip_id: tripId }, 'order');
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
    }

    const allExistingDays = await base44.entities.ItineraryDay.filter({ trip_id: tripId });

    for (let i = 0; i < citiesToProcess.length; i++) {
      const city = citiesToProcess[i];
      if (!city.start_date || !city.end_date) continue;

      setGeneratingCity(city.name);
      setGeneratingStep(Math.min(2 + i, 5));

      const existingCityDays = allExistingDays.filter((d) => d.city_id === city.id);
      for (const day of existingCityDays) {
        await base44.entities.ItineraryDay.delete(day.id);
      }

      const newDays = await generateDaysForCity({
        city,
        trip,
        existingDays: allExistingDays.filter((d) => d.city_id !== city.id),
        preferences,
        allCities: citiesToProcess.filter((c) => c.id !== city.id),
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

      const latestTrip = await base44.entities.Trip.get(tripId);
      await updateVisitedPlaces(latestTrip, newDays);

      allExistingDays.push(...newDays.map((d) => ({ ...d, city_id: city.id })));
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

      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-4xl font-bold">Ruta 🗺️</h1>
              <p className="text-white/90 mt-2">Explora tu itinerario</p>
            </div>

            <div className="flex gap-2 mt-1">
              {cities.some((c) => c.start_date) && (
                <Button
                  onClick={() => reorderByDatesMutation.mutate()}
                  disabled={reorderByDatesMutation.isPending}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                  title="Actualiza el campo 'order' de las ciudades según sus fechas"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Ordenar por fechas
                </Button>
              )}
              <Button
                onClick={() => setAiPanelOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar con IA
              </Button>
            </div>
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
            <Button onClick={() => setAiPanelOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Generar itinerario con IA
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCities.map((city) => (
              <CityCard key={city.id} city={city} daysCount={getDaysCount(city.id)} tripId={tripId} />
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