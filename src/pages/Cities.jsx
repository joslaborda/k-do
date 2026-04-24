import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, ArrowUpDown, Plus } from 'lucide-react';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { base44 } from '@/api/base44Client';
import CityCard from '@/components/cities/CityCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
  const navigate = useNavigate();

  const [addCityOpen, setAddCityOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('');
  const [redirected, setRedirected] = useState(false);

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
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
    staleTime: 60000,
  });

  // Si solo hay 1 ciudad, ir directo a su detalle
  useEffect(() => {
    if (!redirected && !isLoading && cities.length === 1) {
      setRedirected(true);
      navigate(createPageUrl(`CityDetail?id=${cities[0].id}&trip_id=${tripId}`), { replace: true });
    }
  }, [cities, isLoading, redirected, navigate, tripId]);

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

  const addCityMutation = useMutation({
    mutationFn: () => base44.entities.City.create({
      trip_id: tripId,
      name: newCityName.trim(),
      country: newCityCountry.trim() || (trip?.country || ''),
      order: cities.length,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      setAddCityOpen(false);
      setNewCityName('');
      setNewCityCountry('');
      toast({ title: `Ciudad "${newCityName.trim()}" añadida ✓` });
    },
  });

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
                onClick={() => setAddCityOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir ciudad
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-6 max-w-6xl -mt-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-border">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-light text-foreground mb-2">Sin ciudades todavía</h3>
            <p className="text-muted-foreground font-light mb-6">Añade las ciudades de tu ruta</p>
            <Button onClick={() => setAddCityOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Añadir primera ciudad
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

      {/* Dialog añadir ciudad */}
      <Dialog open={addCityOpen} onOpenChange={setAddCityOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Añadir ciudad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nombre de la ciudad *</label>
              <Input
                placeholder="ej. Tokyo"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newCityName.trim() && addCityMutation.mutate()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">País (opcional)</label>
              <Input
                placeholder={`ej. ${trip?.country || 'Japón'}`}
                value={newCityCountry}
                onChange={(e) => setNewCityCountry(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setAddCityOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => addCityMutation.mutate()}
                disabled={!newCityName.trim() || addCityMutation.isPending}
                className="bg-orange-700 hover:bg-orange-800"
              >
                {addCityMutation.isPending ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}