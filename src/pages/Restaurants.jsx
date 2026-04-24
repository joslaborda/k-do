import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Plus, X, ExternalLink, CheckCircle, Trash2, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta } from '@/lib/countryConfig';
import { createPageUrl } from '@/utils';

// ── Búsqueda con OpenStreetMap Nominatim (sin CORS, sin API key) ────────────
const OSM_CATEGORY_MAP = {
  restaurant: 'food', cafe: 'food', bar: 'food', fast_food: 'food',
  pub: 'food', bakery: 'food', ice_cream: 'food', food_court: 'food',
  museum: 'sight', monument: 'sight', attraction: 'sight', artwork: 'sight',
  viewpoint: 'sight', historic: 'sight', temple: 'sight', church: 'sight',
  shrine: 'sight', castle: 'sight', ruins: 'sight', gallery: 'sight',
  park: 'sight', nature_reserve: 'sight', beach: 'sight',
  shop: 'shopping', mall: 'shopping', market: 'shopping', supermarket: 'shopping',
  department_store: 'shopping', boutique: 'shopping',
  bus_station: 'transport', train_station: 'transport', subway: 'transport',
  airport: 'transport', ferry_terminal: 'transport',
  sports_centre: 'activity', gym: 'activity', swimming_pool: 'activity',
  cinema: 'activity', theatre: 'activity', nightclub: 'activity',
};

function osmTypeToSpotType(osmType, osmClass) {
  const key = osmType || osmClass || '';
  return OSM_CATEGORY_MAP[key] || 'sight';
}

async function searchPlaces(query, city, country) {
  const q = [query, city, country].filter(Boolean).join(', ');
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
    q,
    format: 'json',
    limit: 10,
    addressdetails: 1,
    extratags: 1,
    namedetails: 1,
  });
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'es,en', 'User-Agent': 'Kodo Travel App' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error('Nominatim error');
  const data = await res.json();
  return data.map(item => ({
    id: item.place_id?.toString(),
    name: item.namedetails?.name || item.display_name?.split(',')[0] || query,
    display_name: item.display_name,
    address: [item.address?.road, item.address?.city || item.address?.town || item.address?.village, item.address?.country].filter(Boolean).join(', '),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: osmTypeToSpotType(item.type, item.class),
    category: item.type || item.class || '',
    osm_id: item.osm_id,
  }));
}

const SPOT_TYPES = [
  { value: 'all',       label: 'Todos',       emoji: '📍' },
  { value: 'food',      label: 'Restaurantes', emoji: '🍜' },
  { value: 'sight',     label: 'Atracciones',  emoji: '🏛️' },
  { value: 'activity',  label: 'Actividades',  emoji: '⚡' },
  { value: 'shopping',  label: 'Compras',      emoji: '🛍️' },
  { value: 'transport', label: 'Transporte',   emoji: '🚆' },
  { value: 'custom',    label: 'Otro',         emoji: '⭐' },
];

const TYPE_COLORS = {
  food:      'bg-orange-100 text-orange-700 border-orange-200',
  sight:     'bg-blue-100 text-blue-700 border-blue-200',
  activity:  'bg-green-100 text-green-700 border-green-200',
  shopping:  'bg-purple-100 text-purple-700 border-purple-200',
  transport: 'bg-slate-100 text-slate-700 border-slate-200',
  custom:    'bg-yellow-100 text-yellow-700 border-yellow-200',
};

// Foursquare category → spot type mapping
function fsqCategoryToType(cats = []) {
  const names = cats.map(c => c.name?.toLowerCase()).join(' ');
  if (names.includes('restaurant') || names.includes('food') || names.includes('bar') || names.includes('café') || names.includes('cafe') || names.includes('bakery') || names.includes('coffee')) return 'food';
  if (names.includes('museum') || names.includes('monument') || names.includes('gallery') || names.includes('historic') || names.includes('church') || names.includes('temple') || names.includes('park')) return 'sight';
  if (names.includes('shop') || names.includes('store') || names.includes('market') || names.includes('mall')) return 'shopping';
  if (names.includes('transport') || names.includes('station') || names.includes('airport') || names.includes('bus')) return 'transport';
  if (names.includes('sport') || names.includes('gym') || names.includes('outdoor') || names.includes('activity')) return 'activity';
  return 'sight';
}

function PlaceResultCard({ place, onSave, saving }) {
  const typeConf = SPOT_TYPES.find(t => t.value === place.type) || SPOT_TYPES[6];

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-orange-50 flex-shrink-0 flex items-center justify-center self-stretch">
        <span className="text-2xl">{typeConf.emoji}</span>
      </div>

      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">{place.name}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${TYPE_COLORS[place.type] || TYPE_COLORS.custom}`}>
              {typeConf.emoji} {typeConf.label}
            </span>
          </div>
        </div>

        {place.address && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{place.address}</span>
          </p>
        )}

        <Button
          size="sm"
          onClick={() => onSave(place)}
          disabled={saving}
          className="mt-2 h-7 text-xs bg-orange-700 hover:bg-orange-800 text-white px-3"
        >
          <Plus className="w-3 h-3 mr-1" />
          {saving ? 'Guardando...' : 'Guardar spot'}
        </Button>
      </div>
    </div>
  );
}

function SavedSpotCard({ spot, currentUserEmail, onDelete, onToggleVisited, onTogglePublic }) {
  const type = spot.type || 'custom';
  const typeConf = SPOT_TYPES.find(t => t.value === type) || SPOT_TYPES[6];
  const canDelete = spot.created_by === currentUserEmail;

  return (
    <div className={`bg-white rounded-2xl border border-border p-4 transition-all ${spot.visited ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl mt-0.5 flex-shrink-0">{typeConf.emoji}</span>
          <div className="min-w-0">
            <p className={`font-semibold text-sm leading-tight ${spot.visited ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {spot.title}
            </p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${TYPE_COLORS[type]}`}>
              {typeConf.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Público/privado */}
          <button
            onClick={() => onTogglePublic(spot)}
            title={spot.visibility === 'public' ? 'Público — click para hacer privado' : 'Privado — click para publicar en perfil'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              spot.visibility === 'public'
                ? 'text-orange-600 bg-orange-50'
                : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            🌍
          </button>

          {/* Visitado */}
          <button
            onClick={() => onToggleVisited(spot)}
            title={spot.visited ? 'Marcar como pendiente' : 'Marcar como visitado'}
            className={`p-1.5 rounded-lg transition-colors ${
              spot.visited
                ? 'text-green-600 bg-green-50'
                : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </button>

          {/* Eliminar */}
          {canDelete && (
            <button
              onClick={() => onDelete(spot.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {spot.notes && (
        <p className="text-xs text-muted-foreground mt-2">{spot.notes}</p>
      )}

      {spot.address && (
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {spot.address}
        </p>
      )}

      <div className="flex items-center gap-2 mt-2">
        {spot.link && (
          <a href={spot.link} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Web
          </a>
        )}
        {spot.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-600 hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" /> Maps
          </a>
        )}
        {spot.visibility === 'public' && (
          <span className="text-xs text-orange-600 ml-auto">🌍 En tu perfil</span>
        )}
      </div>
    </div>
  );
}

export default function Restaurants() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { trip, activeCity } = useTripContext(tripId);
  const city = activeCity?.name || trip?.destination || '';
  const country = activeCity?.country || trip?.country || '';
  const flag = getCountryMeta(activeCity?.country_code || country || '').flag;
  const cityId = activeCity?.id || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [fsqResults, setFsqResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const searchTimer = useRef(null);

  // Spots guardados en este viaje/ciudad
  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId, cityId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Spot.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId, cityId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Spot.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId, cityId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Spot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId, cityId] }),
  });

  // Búsqueda Foursquare con debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setFsqResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(searchQuery, city, country);
        setFsqResults(results);
      } catch { setFsqResults([]); }
      finally { setSearching(false); }
    }, 600);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, city, country]);

  const handleSave = async (place) => {
    const id = place.id;
    setSavingId(id);
    try {
      await createMutation.mutateAsync({
        trip_id: tripId,
        city_id: cityId || undefined,
        title: place.name,
        type: place.type || 'sight',
        address: place.address || '',
        lat: place.lat,
        lng: place.lng,
        link: place.osm_id ? `https://www.openstreetmap.org/node/${place.osm_id}` : '',
        notes: '',
        city_name: city,
        country,
        visibility: 'trip_members',
        visited: false,
        created_by: user?.email,
        created_by_user_id: user?.id,
      });
      setSearchQuery('');
      setFsqResults([]);
      setShowSearch(false);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleVisited = (spot) => {
    updateMutation.mutate({ id: spot.id, data: { visited: !spot.visited } });
  };

  const handleTogglePublic = (spot) => {
    const next = spot.visibility === 'public' ? 'trip_members' : 'public';
    updateMutation.mutate({ id: spot.id, data: { visibility: next } });
  };

  const foodSpots = spots.filter(s => s.type === 'food');
  const filteredSpots = activeFilter === 'all' ? spots : spots.filter(s => s.type === activeFilter);
  const pendingCount = spots.filter(s => !s.visited).length;

  if (!tripId) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col">
        <div className="bg-orange-700 pt-12 pb-20 px-6">
          <h1 className="text-white text-4xl font-bold">Spots 📍</h1>
          <p className="text-white/80 mt-2">Lugares que quieres visitar</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <Compass className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-xl font-bold mb-2">Selecciona un viaje</h2>
            <p className="text-muted-foreground mb-6 text-sm">Abre Spots desde un viaje para guardar los lugares que quieres visitar.</p>
            <Button onClick={() => navigate(createPageUrl('TripsList'))} className="bg-orange-700 hover:bg-orange-800 text-white w-full">
              Ir a Mis viajes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20 px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-1">{trip?.name || 'Tu viaje'}</p>
            <h1 className="text-white text-4xl font-bold">Spots {flag}</h1>
            <p className="text-white/80 mt-1 text-sm">
              {pendingCount > 0 ? `${pendingCount} lugar${pendingCount > 1 ? 'es' : ''} pendiente${pendingCount > 1 ? 's' : ''}` : 'Todos visitados 🎉'}
            </p>
          </div>
          <button
            onClick={() => setShowSearch(s => !s)}
            className="flex-shrink-0 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-colors border border-white/30 mt-1"
          >
            {showSearch ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        {/* Buscador Foursquare */}
        {showSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder={`Busca en ${city || 'tu destino'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-0 h-11 text-sm"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setFsqResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searching && (
              <p className="text-white/70 text-xs mt-2 text-center">Buscando en Foursquare...</p>
            )}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12">

        {/* Resultados Foursquare */}
        {fsqResults.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              {fsqResults.length} resultados — toca para guardar
            </p>
            {fsqResults.map(place => (
              <PlaceResultCard
                key={place.id}
                place={place}
                onSave={handleSave}
                saving={savingId === place.id}
              />
            ))}
          </div>
        )}

        {/* Filtros de tipo */}
        {spots.length > 0 && !fsqResults.length && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {SPOT_TYPES.filter(t => t.value === 'all' || spots.some(s => s.type === t.value)).map(t => (
              <button
                key={t.value}
                onClick={() => setActiveFilter(t.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeFilter === t.value
                    ? 'bg-orange-700 text-white border-orange-700'
                    : 'bg-white text-muted-foreground border-border hover:border-orange-300'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
                {t.value !== 'all' && (
                  <span className={`text-xs ${activeFilter === t.value ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {spots.filter(s => s.type === t.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Lista de spots guardados */}
        {filteredSpots.length > 0 ? (
          <div className="space-y-3">
            {/* Pendientes */}
            {filteredSpots.filter(s => !s.visited).length > 0 && (
              <>
                {filteredSpots.filter(s => !s.visited).map(spot => (
                  <SavedSpotCard
                    key={spot.id}
                    spot={spot}
                    currentUserEmail={user?.email}
                    onDelete={id => deleteMutation.mutate(id)}
                    onToggleVisited={handleToggleVisited}
                    onTogglePublic={handleTogglePublic}
                  />
                ))}
              </>
            )}

            {/* Visitados */}
            {filteredSpots.filter(s => s.visited).length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">
                  ✅ Visitados
                </p>
                {filteredSpots.filter(s => s.visited).map(spot => (
                  <SavedSpotCard
                    key={spot.id}
                    spot={spot}
                    currentUserEmail={user?.email}
                    onDelete={id => deleteMutation.mutate(id)}
                    onToggleVisited={handleToggleVisited}
                    onTogglePublic={handleTogglePublic}
                  />
                ))}
              </>
            )}
          </div>
        ) : !fsqResults.length && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Sin spots todavía</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Pulsa <strong>+</strong> para buscar restaurantes, museos, miradores y cualquier lugar que quieras visitar en {city || 'tu destino'}.
            </p>
            <Button
              onClick={() => setShowSearch(true)}
              className="bg-orange-700 hover:bg-orange-800 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar lugares
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
