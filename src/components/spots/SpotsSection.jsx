import { useState, useMemo, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Search, Plus, X, Navigation, PenLine, MapPin, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SpotCard from './SpotCard';

const ALL_TYPES = [
  { value: 'all',       label: 'Todos',      emoji: '📍' },
  { value: 'food',      label: 'Comida',     emoji: '🍜' },
  { value: 'sight',     label: 'Atracción',  emoji: '🏛️' },
  { value: 'activity',  label: 'Actividad',  emoji: '⚡' },
  { value: 'shopping',  label: 'Compras',    emoji: '🛍️' },
  { value: 'transport', label: 'Transporte', emoji: '🚆' },
  { value: 'custom',    label: 'Otro',       emoji: '⭐' },
];

const OSM_MAP = {
  restaurant:'food', cafe:'food', bar:'food', fast_food:'food', pub:'food', bakery:'food',
  museum:'sight', monument:'sight', attraction:'sight', viewpoint:'sight', temple:'sight',
  church:'sight', shrine:'sight', castle:'sight', ruins:'sight', gallery:'sight', park:'sight',
  shop:'shopping', mall:'shopping', market:'shopping',
  bus_station:'transport', train_station:'transport', subway_entrance:'transport',
  sports_centre:'activity', cinema:'activity', theatre:'activity',
};

function osmToType(type, cls) { return OSM_MAP[type] || OSM_MAP[cls] || 'sight'; }

async function searchPlaces(query, city, country) {
  const q = [query, city, country].filter(Boolean).join(', ');
  const params = new URLSearchParams({ q, format:'json', limit:8, addressdetails:1, namedetails:1 });
  const res = await fetch('https://nominatim.openstreetmap.org/search?' + params, {
    headers: { 'Accept-Language':'es,en', 'User-Agent':'KodoTravelApp/1.0' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('search failed');
  const data = await res.json();
  return data.map(item => ({
    id: item.place_id?.toString(),
    name: item.namedetails?.name || item.namedetails?.['name:en'] || item.display_name?.split(',')[0] || query,
    address: [item.address?.road, item.address?.suburb, item.address?.city || item.address?.town].filter(Boolean).join(', '),
    lat: parseFloat(item.lat), lng: parseFloat(item.lon),
    type: osmToType(item.type, item.class),
    osm_id: item.osm_id?.toString(),
  }));
}

async function nearbyPlaces(lat, lng) {
  const d = 0.012;
  const query = `[out:json][timeout:10];(node["amenity"](${lat-d},${lng-d},${lat+d},${lng+d});node["tourism"](${lat-d},${lng-d},${lat+d},${lng+d});node["historic"](${lat-d},${lng-d},${lat+d},${lng+d}););out 15;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:query, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error('overpass failed');
  const data = await res.json();
  return (data.elements||[]).filter(el => el.tags?.name).map(el => ({
    id: el.id?.toString(), name: el.tags.name,
    address: [el.tags['addr:street'], el.tags['addr:housenumber']].filter(Boolean).join(' '),
    lat: el.lat, lng: el.lon,
    type: osmToType(el.tags.amenity||el.tags.tourism||el.tags.historic||'', ''),
  })).slice(0, 12);
}

function PlaceResultCard({ place, onSave, saving }) {
  const tc = ALL_TYPES.find(t => t.value === place.type) || ALL_TYPES[6];
  return (
    <div className="bg-white rounded-xl border border-border flex overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-orange-50 flex-shrink-0 flex items-center justify-center self-stretch">
        <span className="text-xl">{tc.emoji}</span>
      </div>
      <div className="flex-1 min-w-0 p-2.5">
        <p className="font-semibold text-sm leading-tight text-foreground">{place.name}</p>
        <span className="text-xs text-muted-foreground">{tc.label}</span>
        {place.address && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5"><MapPin className="w-3 h-3 inline mr-0.5"/>{place.address}</p>}
        <Button size="sm" onClick={() => onSave(place)} disabled={saving}
          className="mt-1.5 h-6 text-xs bg-orange-700 hover:bg-orange-800 text-white px-2.5">
          <Plus className="w-3 h-3 mr-1"/>{saving ? 'Guardando...' : 'Añadir'}
        </Button>
      </div>
    </div>
  );
}

function ManualForm({ onSave, saving, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('custom');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const addTag = v => { const t=v.trim().toLowerCase(); if(t&&!tags.includes(t)) setTags(p=>[...p,t]); setTagInput(''); };
  return (
    <div className="bg-white rounded-xl border border-border p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Crear spot</p>
        <button onClick={onClose} className="text-muted-foreground"><X className="w-4 h-4"/></button>
      </div>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del lugar *" className="h-9 text-sm"/>
      <div className="flex flex-wrap gap-1.5">
        {ALL_TYPES.filter(t => t.value!=='all').map(t => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={"text-xs px-2 py-1 rounded-full border transition-colors " + (type===t.value?'bg-orange-700 text-white border-orange-700':'bg-white text-muted-foreground border-border hover:border-orange-300')}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
            #{t}<button onClick={() => setTags(p=>p.filter(x=>x!==t))}><X className="w-2.5 h-2.5"/></button>
          </span>
        ))}
      </div>
      <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(tagInput);} }}
        onBlur={() => tagInput && addTag(tagInput)}
        placeholder="Tags: sunset, mirador... (Enter)" className="h-8 text-xs"/>
      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección (opcional)" className="h-8 text-xs"/>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..."
        className="w-full text-xs border border-border rounded-lg px-3 py-2 h-16 resize-none outline-none focus:border-orange-400"/>
      <Button onClick={() => onSave({ title, type, notes, address, tags })} disabled={!title.trim()||saving}
        className="w-full bg-orange-700 hover:bg-orange-800 text-white h-9">
        {saving ? 'Guardando...' : 'Guardar spot'}
      </Button>
    </div>
  );
}

export default function SpotsSection({ cityId, tripId, currentUserEmail, trip, days = [], city = '', country = '' }) {
  const [activeType, setActiveType] = useState('all');
  const [panelMode, setPanelMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const searchTimer = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0]||null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ['spots', cityId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId, city_id: cityId }),
    enabled: !!cityId && !!tripId,
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Spot.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', cityId] }),
  });

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try { setSearchResults(await searchPlaces(searchQuery, city, country)); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 700);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, city, country]);

  const handleNearby = () => {
    setPanelMode('nearby'); setLoadingNearby(true); setNearbyResults([]);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try { setNearbyResults(await nearbyPlaces(pos.coords.latitude, pos.coords.longitude)); }
        catch {}
        finally { setLoadingNearby(false); }
      },
      () => setLoadingNearby(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const baseData = extra => ({
    trip_id: tripId, city_id: cityId, city_name: city, country,
    visibility: 'trip_members', visited: false,
    created_by: currentUserEmail, created_by_user_id: user?.id,
    creator_username: myProfile?.username || '',
    creator_display_name: myProfile?.display_name || '',
    ...extra,
  });

  const saveOsmPlace = async place => {
    setSavingId(place.id);
    try {
      await createMutation.mutateAsync(baseData({ title:place.name, type:place.type||'sight', address:place.address||'', lat:place.lat, lng:place.lng, tags:[] }));
      setSearchResults([]); setNearbyResults([]); setSearchQuery(''); setPanelMode(null);
    } finally { setSavingId(null); }
  };

  const saveManual = async form => {
    setSavingId('manual');
    try {
      await createMutation.mutateAsync(baseData({ title:form.title, type:form.type, notes:form.notes, address:form.address, tags:form.tags||[] }));
      setPanelMode(null);
    } finally { setSavingId(null); }
  };

  const filteredSpots = useMemo(() =>
    activeType === 'all' ? spots : spots.filter(s => s.type === activeType),
    [spots, activeType]
  );

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">📍 Spots</h2>
      </div>

      {/* Buscador + botones */}
      <div className="flex gap-2 items-center mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={city ? `Busca en ${city}...` : 'Busca un lugar...'}
            className="pl-9 pr-20 h-10 text-sm bg-white"/>
          {searchQuery ? (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4"/></button>
          ) : (
            <button onClick={handleNearby} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium">
              <Navigation className="w-3 h-3"/>Cerca
            </button>
          )}
        </div>
        <button onClick={() => setPanelMode(panelMode==='manual'?null:'manual')}
          className={"w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all " +
            (panelMode==='manual' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border hover:border-orange-300 text-muted-foreground')}>
          {panelMode==='manual' ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
        </button>
      </div>

      {searching && <p className="text-xs text-muted-foreground text-center mb-2">Buscando...</p>}

      {/* Formulario manual */}
      {panelMode === 'manual' && (
        <div className="mb-3">
          <ManualForm onSave={saveManual} saving={savingId==='manual'} onClose={() => setPanelMode(null)}/>
        </div>
      )}

      {/* Resultados búsqueda */}
      {searchResults.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{searchResults.length} resultados</p>
          {searchResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
        </div>
      )}

      {/* Cerca de mí */}
      {panelMode === 'nearby' && (
        <div className="space-y-2 mb-3">
          {loadingNearby && <p className="text-xs text-muted-foreground text-center">Obteniendo ubicación...</p>}
          {!loadingNearby && nearbyResults.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{nearbyResults.length} lugares cerca</p>
              {nearbyResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
            </>
          )}
        </div>
      )}

      {/* Filtros tipo */}
      {spots.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ALL_TYPES.filter(t => t.value==='all' || spots.some(s => s.type===t.value)).map(t => (
            <button key={t.value} onClick={() => setActiveType(t.value)}
              className={"text-xs px-2.5 py-1 rounded-full border font-medium transition-colors " +
                (activeType===t.value ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border hover:border-orange-300')}>
              {t.emoji} {t.label}
              {t.value!=='all' && <span className="ml-1 opacity-60">{spots.filter(s=>s.type===t.value).length}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse"/>)}</div>
      ) : filteredSpots.length === 0 && !searchResults.length && !nearbyResults.length ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-white">
          <p className="text-2xl mb-2">📍</p>
          <p className="text-sm text-muted-foreground">Busca lugares o crea un spot manualmente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSpots.map(spot => (
            <SpotCard key={spot.id} spot={spot} days={days} currentUserEmail={currentUserEmail} cityId={cityId} tripId={tripId}/>
          ))}
        </div>
      )}
    </div>
  );
}
