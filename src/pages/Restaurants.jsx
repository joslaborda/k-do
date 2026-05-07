import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta } from '@/lib/countryConfig';
import { getSeedSpotsForCity } from '@/lib/spotsDB';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Navigation, MapPin, Camera, ChevronDown, ChevronRight, Mic } from 'lucide-react';
import SpotCard from '@/components/spots/SpotCard';

// ── OSM helpers ───────────────────────────────────────────────────────────────
const OSM_MAP = {
  restaurant:'food',cafe:'food',bar:'food',fast_food:'food',pub:'food',bakery:'food',
  museum:'sight',monument:'sight',attraction:'sight',viewpoint:'sight',temple:'sight',
  church:'sight',shrine:'sight',castle:'sight',gallery:'sight',park:'sight',
  shop:'shopping',mall:'shopping',market:'shopping',
  bus_station:'transport',train_station:'transport',subway_entrance:'transport',
  sports_centre:'activity',cinema:'activity',theatre:'activity',
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
    name: item.namedetails?.name || item.display_name?.split(',')[0] || query,
    address: [item.address?.road, item.address?.city || item.address?.town].filter(Boolean).join(', '),
    lat: parseFloat(item.lat), lng: parseFloat(item.lon),
    type: osmToType(item.type, item.class),
  }));
}

async function nearbyPlaces(lat, lng) {
  const d = 0.012;
  const query = `[out:json][timeout:10];(node["amenity"](${lat-d},${lng-d},${lat+d},${lng+d});node["tourism"](${lat-d},${lng-d},${lat+d},${lng+d}););out 15;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:query, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error('overpass failed');
  const data = await res.json();
  return (data.elements||[]).filter(el => el.tags?.name).map(el => ({
    id: el.id?.toString(), name: el.tags.name,
    address: [el.tags['addr:street'], el.tags['addr:housenumber']].filter(Boolean).join(' '),
    lat: el.lat, lng: el.lon,
    type: osmToType(el.tags.amenity||el.tags.tourism||'', ''),
  })).slice(0, 12);
}

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  food:      { label:'Comer',      emoji:'🍜', color:'bg-orange-100 text-orange-800' },
  sight:     { label:'Cultura',    emoji:'🏛️', color:'bg-blue-100 text-blue-800' },
  activity:  { label:'Actividad',  emoji:'⚡',  color:'bg-green-100 text-green-800' },
  shopping:  { label:'Compras',    emoji:'🛍️', color:'bg-purple-100 text-purple-800' },
  transport: { label:'Transporte', emoji:'🚆', color:'bg-slate-100 text-slate-800' },
  custom:    { label:'Otro',       emoji:'📍', color:'bg-yellow-100 text-yellow-800' },
};

// ── OSM result card ───────────────────────────────────────────────────────────
function PlaceResultCard({ place, onSave, saving }) {
  const tc = TYPE_CONFIG[place.type] || TYPE_CONFIG.custom;
  return (
    <div className="bg-white rounded-xl border border-border flex overflow-hidden hover:shadow-sm transition-shadow">
      <div className="w-12 bg-orange-50 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">{tc.emoji}</span>
      </div>
      <div className="flex-1 min-w-0 p-2.5">
        <p className="font-semibold text-sm text-foreground leading-tight">{place.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tc.label}{place.address ? ' · ' + place.address : ''}</p>
        <Button size="sm" onClick={() => onSave(place)} disabled={saving}
          className="mt-1.5 h-6 text-xs bg-orange-700 hover:bg-orange-800 text-white px-2.5">
          <Plus className="w-3 h-3 mr-1"/>{saving ? 'Guardando...' : 'Añadir'}
        </Button>
      </div>
    </div>
  );
}

// ── Manual form ───────────────────────────────────────────────────────────────
function ManualForm({ onSave, saving, onClose, city, country }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('custom');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const addTag = v => { const t=v.trim().toLowerCase(); if(t&&!tags.includes(t)) setTags(p=>[...p,t]); setTagInput(''); };

  const SUGGESTED_TAGS = {
    food: ['ramen','sushi','tapas','barato','reservar','sin-gluten','vistas','terraza'],
    sight: ['amanecer','sunset','gratuito','fotográfico','histórico','mirador'],
    activity: ['adrenalina','naturaleza','familiar','exterior'],
    shopping: ['mercadillo','vintage','souvenirs','artesanía'],
  };
  const suggested = (SUGGESTED_TAGS[type] || []).filter(t => !tags.includes(t));

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Crear spot</p>
        <button onClick={onClose} className="text-muted-foreground"><X className="w-4 h-4"/></button>
      </div>

      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del lugar *" className="h-9 text-sm"/>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Tipo</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TYPE_CONFIG).map(([val, tc]) => (
            <button key={val} onClick={() => setType(val)}
              className={"text-xs px-2.5 py-1 rounded-full border transition-colors " +
                (type===val ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border hover:border-orange-300')}>
              {tc.emoji} {tc.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Tags sugeridos</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggested.slice(0,6).map(t => (
            <button key={t} onClick={() => setTags(p=>[...p,t])}
              className="text-xs px-2 py-0.5 rounded-full border border-dashed border-orange-300 text-orange-600 hover:bg-orange-50">
              + #{t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
              #{t}<button onClick={() => setTags(p=>p.filter(x=>x!==t))}><X className="w-2.5 h-2.5"/></button>
            </span>
          ))}
        </div>
        <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(tagInput);} }}
          onBlur={() => tagInput && addTag(tagInput)}
          placeholder="Añade tus propios tags (Enter)" className="h-8 text-xs"/>
      </div>

      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección (opcional)" className="h-8 text-xs"/>

      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Notas: mejor hora, qué pedir, por qué mola..."
        className="w-full text-sm border border-border rounded-xl px-3 py-2 h-20 resize-none outline-none focus:border-orange-400"/>

      <Button onClick={() => onSave({ title, type, notes, address, tags })} disabled={!title.trim()||saving}
        className="w-full bg-orange-700 hover:bg-orange-800 text-white h-9">
        {saving ? 'Guardando...' : 'Guardar spot'}
      </Button>
    </div>
  );
}

// ── Seed spot card (community) ────────────────────────────────────────────────
function SeedSpotCard({ spot, onSave, saving, showToast }) {
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const priceLabel = { low:'💚 Económico', mid:'🟡 Precio medio', high:'🔴 Caro' }[spot.price] || '';
  const timeLabel = { mañana:'Mejor por la mañana', tarde:'Mejor al atardecer', noche:'Mejor de noche', mediodía:'Mejor al mediodía', 'cualquier hora':'Cualquier hora', comida:'Mejor a mediodía' }[spot.best_time] || '';

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{tc.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{spot.title}</p>
            <span className={"text-xs px-2 py-0.5 rounded-full inline-block mt-1 " + tc.color}>{tc.label}</span>
            {spot.address && <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0"/>{spot.address}</p>}
            {spot.notes && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{spot.notes}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {spot.tags?.slice(0,4).map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">#{t}</span>)}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {priceLabel && <span className="text-xs text-muted-foreground">{priceLabel}</span>}
              {timeLabel && <span className="text-xs text-muted-foreground">🕐 {timeLabel}</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">👍 {spot.visits || 0}</span>
              <span className="text-xs text-muted-foreground">{spot.visits || 0} visitas</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-3">
        <Button onClick={() => { onSave(spot); showToast(spot); }} disabled={saving}
          className="w-full bg-orange-700 hover:bg-orange-800 text-white h-8 text-sm">
          <Plus className="w-3.5 h-3.5 mr-1.5"/>Guardar en mi viaje
        </Button>
      </div>
    </div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ spot, city, onUndo, visible }) {
  if (!visible || !spot) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <span className="text-lg">✅</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">Guardado en {city}</p>
          <p className="text-white/60 text-xs truncate">{spot.title}</p>
        </div>
        <button onClick={onUndo} className="text-amber-400 text-xs font-medium flex-shrink-0">Deshacer</button>
      </div>
    </div>
  );
}

// ── City group (spots agrupados) ──────────────────────────────────────────────
function CityGroup({ cityName, spots, currentUserEmail, userId, userProfile, tripId, onUpdate, onDelete }) {
  const [open, setOpen] = useState(true);
  const visited = spots.filter(s => s.visited).length;
  return (
    <div className="rounded-2xl border border-border overflow-hidden mb-3">
      <button onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-border/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{cityName}</span>
          <span className="text-xs text-muted-foreground">{spots.length} spot{spots.length!==1?'s':''} · {visited} visitado{visited!==1?'s':''}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
      </button>
      {open && (
        <div className="divide-y divide-border">
          {spots.map(spot => (
            <div key={spot.id} className="p-1">
              <SpotCard
                spot={spot}
                currentUserEmail={currentUserEmail}
                cityId={spot.city_id}
                tripId={tripId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Restaurants() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trip, activeCity } = useTripContext(tripId);
  const city = activeCity?.name || trip?.destination || '';
  const country = activeCity?.country || trip?.country || '';
  const cityId = activeCity?.id || null;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // State
  const [mode, setMode] = useState('list'); // 'list' | 'discover' | 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [osmResults, setOsmResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [stateFilter, setStateFilter] = useState('all'); // all | pending | visited
  const [typeFilter, setTypeFilter] = useState('all');
  const [communitySort, setCommunitySort] = useState('visits'); // visits | likes | recent
  // Ciudad activa inteligente: usa activeCity (ya calcula por fecha en useTripContext)
  const [selectedCity, setSelectedCity] = useState('');
  // Sync selectedCity with activeCity whenever it resolves
  useEffect(() => {
    if (activeCity?.name && !selectedCity) {
      setSelectedCity(activeCity.name);
    }
  }, [activeCity?.name]);
  const [toast, setToast] = useState({ visible: false, spot: null });
  const [lastSavedId, setLastSavedId] = useState(null);
  const searchTimer = useRef(null);
  const toastTimer = useRef(null);

  // Queries
  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0]||null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  const { data: publicSpots = [] } = useQuery({
    queryKey: ['publicSpots', country, city],
    queryFn: () => base44.entities.Spot.filter({ visibility: 'public', country }),
    enabled: !!country, staleTime: 5*60*1000,
  });

  const { data: spotComments = [] } = useQuery({
    queryKey: ['allComments', tripId],
    queryFn: () => base44.entities.SpotComment.list(),
    staleTime: 5*60*1000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: d => base44.entities.Spot.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });
  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Spot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });

  // OSM search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setOsmResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try { setOsmResults(await searchPlaces(searchQuery, city, country)); }
      catch { setOsmResults([]); }
      finally { setSearching(false); }
    }, 700);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, city, country]);

  const handleNearby = async () => {
    setLoadingNearby(true); setNearbyResults([]);
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
    trip_id: tripId, city_id: cityId||undefined, city_name: city, country,
    visibility: 'trip_members', visited: false,
    created_by: user?.email, created_by_user_id: user?.id,
    creator_username: myProfile?.username||'',
    creator_display_name: myProfile?.display_name||user?.full_name||'',
    ...extra,
  });

  const saveOsmPlace = async place => {
    setSavingId(place.id);
    try {
      const created = await createMutation.mutateAsync(baseData({ title:place.name, type:place.type||'sight', address:place.address||'', lat:place.lat, lng:place.lng, tags:[] }));
      setOsmResults([]); setNearbyResults([]); setSearchQuery('');
      showToastFor({ title: place.name, id: place.id }, place.address);
    } finally { setSavingId(null); }
  };

  const saveManual = async form => {
    setSavingId('manual');
    try {
      await createMutation.mutateAsync(baseData({ title:form.title, type:form.type, notes:form.notes, address:form.address, tags:form.tags||[] }));
      setShowManual(false);
      showToastFor({ title: form.title, id: 'manual' }, city);
    } finally { setSavingId(null); }
  };

  const saveSeedSpot = async spot => {
    setSavingId(spot.title);
    try {
      const created = await createMutation.mutateAsync(baseData({
        title: spot.title, type: spot.type, address: spot.address||'',
        lat: spot.lat, lng: spot.lng, notes: spot.notes||'',
        tags: spot.tags||[], visits_count: spot.visits||0,
      }));
      setLastSavedId(created?.id);
    } finally { setSavingId(null); }
  };

  const showToastFor = (spot, cityName) => {
    setToast({ visible: true, spot, city: cityName || city });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ visible: false, spot: null }), 3000);
  };

  const undoSave = async () => {
    if (lastSavedId) {
      await deleteMutation.mutateAsync(lastSavedId);
      setLastSavedId(null);
    }
    setToast({ visible: false, spot: null });
  };

  // Seed spots for community section
  const seedSpots = useMemo(() => {
    if (!country || !city) return [];
    return getSeedSpotsForCity(country, selectedCity || city);
  }, [country, selectedCity, city]);

  // Community spots (public from other users + seed)
  const communitySpots = useMemo(() => {
    const myIds = new Set(spots.map(s => s.title?.toLowerCase()));
    const fromUsers = publicSpots.filter(s =>
      s.created_by !== user?.email &&
      (s.city_name?.toLowerCase() === (selectedCity||city).toLowerCase() || !s.city_name)
    );
    const fromSeed = seedSpots.filter(s => !myIds.has(s.title?.toLowerCase()));
    const all = [
      ...fromUsers.map(s => ({ ...s, _source: 'user' })),
      ...fromSeed.map(s => ({ ...s, _source: 'seed', id: `seed_${s.title}` })),
    ];
    const upsMap = new Map();
    spotComments.forEach(c => {
      if (c.thumb === 'up') upsMap.set(c.spot_id, (upsMap.get(c.spot_id)||0)+1);
    });
    return all.sort((a, b) => {
      if (communitySort === 'likes') return (upsMap.get(b.id)||b.visits||0) - (upsMap.get(a.id)||a.visits||0);
      if (communitySort === 'recent') return new Date(b.created_date||0) - new Date(a.created_date||0);
      return (b.visits||0) - (a.visits||0);
    });
  }, [publicSpots, seedSpots, spots, communitySort, selectedCity, city, user?.email, spotComments]);

  // My spots filtered + grouped by city
  const filteredSpots = useMemo(() => {
    return spots.filter(s => {
      if (stateFilter === 'pending' && s.visited) return false;
      if (stateFilter === 'visited' && !s.visited) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      return true;
    });
  }, [spots, stateFilter, typeFilter]);

  const spotsByCity = useMemo(() => {
    const groups = {};
    filteredSpots.forEach(s => {
      const k = s.city_name || city || 'Sin ciudad';
      if (!groups[k]) groups[k] = [];
      groups[k].push(s);
    });
    return groups;
  }, [filteredSpots, city]);

  // Trip cities for discover chips
  const { data: tripCities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const isSearching = searchQuery.length >= 2;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-5 px-4">
        <a href={createPageUrl('TripsList')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-3"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg> Mis viajes</a>
        <h1 className="text-white text-3xl font-bold mb-4">Spots</h1>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if(e.target.value.length >= 2) setMode('search'); else if(!e.target.value) setMode('list'); }}
            onFocus={() => !searchQuery && setMode('discover')}
            placeholder="Busca spots, tags, usuarios..."
            className="w-full pl-9 pr-24 py-2.5 rounded-xl text-sm outline-none bg-white text-foreground"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {searchQuery ? (
              <button onClick={() => { setSearchQuery(''); setOsmResults([]); setMode('list'); }} className="text-gray-400 p-1"><X className="w-4 h-4"/></button>
            ) : (
              <button onClick={handleNearby} className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">
                <Navigation className="w-3 h-3"/>Cerca
              </button>
            )}
          </div>
        </div>

        {/* City chips for discover */}
        {mode === 'discover' && tripCities.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {tripCities.map(c => (
              <button key={c.id} onClick={() => setSelectedCity(c.name)}
                className={"text-xs px-3 py-1.5 rounded-full border font-medium flex-shrink-0 transition-colors " +
                  (selectedCity === c.name ? 'bg-white text-orange-700 border-white' : 'bg-white/15 text-white border-white/30')}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* MODE: SEARCH — OSM results */}
        {mode === 'search' && (
          <div className="space-y-3">
            {searching && <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>}
            {!searching && osmResults.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{osmResults.length} resultados</p>
                {osmResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
              </>
            )}
            {!searching && searchQuery.length >= 2 && osmResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Sin resultados — prueba en inglés o simplifica el nombre</p>
            )}
          </div>
        )}

        {/* Nearby results */}
        {nearbyResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{nearbyResults.length} lugares cerca</p>
            {nearbyResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
          </div>
        )}
        {loadingNearby && <p className="text-sm text-muted-foreground text-center py-4">Obteniendo tu ubicación...</p>}

        {/* Manual form */}
        {showManual && (
          <ManualForm onSave={saveManual} saving={savingId==='manual'} onClose={() => setShowManual(false)} city={city} country={country}/>
        )}

        {/* MODE: LIST — Mis spots */}
        {(mode === 'list' || mode === 'discover') && (
          <>
            {/* Mis spots section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Mis spots</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowManual(!showManual)}
                    className={"flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors " +
                      (showManual ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border text-muted-foreground hover:border-orange-300')}>
                    <Plus className="w-3.5 h-3.5"/>Crear
                  </button>
                </div>
              </div>

              {/* State filters */}
              <div className="flex gap-2 mb-2">
                {[['all','Todos'],['pending','Pendientes'],['visited','Visitados']].map(([v,l]) => (
                  <button key={v} onClick={() => setStateFilter(v)}
                    className={"text-xs px-3 py-1.5 rounded-full border transition-colors " +
                      (stateFilter===v ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border text-muted-foreground hover:border-orange-300')}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Type filters */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {[['all','Todo'],['food','🍜 Comer'],['sight','🏛️ Cultura'],['activity','⚡ Activ.'],['shopping','🛍️ Compras'],['custom','📍 Otro']].map(([v,l]) => (
                  <button key={v} onClick={() => setTypeFilter(v)}
                    className={"text-xs px-2.5 py-1 rounded-full border transition-colors " +
                      (typeFilter===v ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-white border-border text-muted-foreground hover:border-orange-200')}>
                    {l}
                  </button>
                ))}
              </div>

              {spots.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-white">
                  <p className="text-2xl mb-2">📍</p>
                  <p className="text-sm text-muted-foreground mb-1">Aún no tienes spots en este viaje</p>
                  <p className="text-xs text-muted-foreground">Busca lugares arriba o explora la comunidad abajo</p>
                </div>
              ) : filteredSpots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Sin spots con ese filtro</p>
              ) : Object.keys(spotsByCity).length === 1 ? (
                <div className="space-y-3">
                  {filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} currentUserEmail={user?.email} cityId={cityId} tripId={tripId}/>)}
                </div>
              ) : (
                Object.entries(spotsByCity).map(([cityName, citySpots]) => (
                  <CityGroup key={cityName} cityName={cityName} spots={citySpots}
                    currentUserEmail={user?.email} userId={user?.id} userProfile={myProfile}
                    tripId={tripId}/>
                ))
              )}
            </div>

            {/* Comunidad section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Kōdo Community</h2>
              </div>

              {/* City chips — smart active city by trip dates */}
              {tripCities.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {tripCities.map(c => {
                    const isActive = (selectedCity || activeCity?.name) === c.name;
                    const today = new Date().toISOString().slice(0,10);
                    const isCurrent = c.start_date && c.end_date && today >= c.start_date && today <= c.end_date;
                    return (
                      <button key={c.id} onClick={() => setSelectedCity(c.name)}
                        className={"text-xs px-3 py-1.5 rounded-full border font-medium flex-shrink-0 transition-colors flex items-center gap-1 " +
                          (isActive ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border text-muted-foreground hover:border-orange-300')}>
                        {c.name}
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sort tabs */}
              <div className="flex gap-2 mb-3">
                {[['visits','Más visitados'],['likes','Más gustados'],['recent','Recientes']].map(([v,l]) => (
                  <button key={v} onClick={() => setCommunitySort(v)}
                    className={"text-xs px-3 py-1.5 rounded-full border transition-colors " +
                      (communitySort===v ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border text-muted-foreground hover:border-orange-300')}>
                    {l}
                  </button>
                ))}
              </div>

              {communitySpots.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-white">
                  <p className="text-2xl mb-2">🌍</p>
                  <p className="text-sm text-muted-foreground">Sin spots de la comunidad para {selectedCity || city} todavía</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communitySpots.slice(0, 10).map((spot, idx) => {
                    const alreadySaved = spots.some(s => s.title?.toLowerCase() === spot.title?.toLowerCase());
                    if (alreadySaved) return null;
                    return (
                      <SeedSpotCard key={spot.id || idx} spot={spot}
                        onSave={s => saveSeedSpot(s)}
                        saving={savingId === spot.title}
                        showToast={s => showToastFor(s, selectedCity || city)}/>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      <Toast spot={toast.spot} city={toast.city} visible={toast.visible} onUndo={undoSave}/>
    </div>
  );
}
