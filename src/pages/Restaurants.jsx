import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { notify, resolveUserIds } from '@/lib/notifications';
import { getSeedSpotsForCity } from '@/lib/spotsDB';
import { normalizeCountry } from '@/lib/countryConfig';
import { Input } from '@/components/ui/input';
import { Search, Plus, X, Navigation, MapPin, ArrowRight, Compass, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OTabBar from '@/components/trip/OTabBar';
import SpotCard from '@/components/spots/SpotCard';
import CreateSpotSheet from '@/components/spots/CreateSpotSheet';
import PlaceResultCard from '@/components/spots/PlaceResultCard';
import CommunitySpotCard from '@/components/spots/CommunitySpotCard';
import MySpotRow from '@/components/spots/MySpotRow';
import SpotDetailSheet from '@/components/spots/SpotDetailSheet';
import AssignDateModal from '@/components/spots/AssignDateModal';
import SpotToast from '@/components/spots/SpotToast';
import { searchPlaces, nearbyPlaces, getRecentSearches, addRecentSearch, clearRecentSearches, buildHashtags, TYPE_CONFIG, COUNTRY_SPECIAL_TAGS } from '@/components/spots/spotsHelpers';

export default function Restaurants() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trip, activeCity } = useTripContext(tripId);
  const { user: currentUser } = useAuth();
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles_rest', tripId],
    queryFn: async () => {
      const members = trip?.members || [];
      if (!members.length) return [];
      const all = await base44.entities.UserProfile.list();
      return all.filter(p => members.includes(p.email) || members.includes(p.user_email));
    },
    enabled: !!trip?.members?.length,
    staleTime: 60000,
  });

  const notifyMembers = (type, _unused, refTitle, refExtra) => {
    const others = (trip?.members || []).filter(e => e !== currentUser?.email);
    if (!others.length) return;
    resolveUserIds(others).then(resolved => {
      resolved.forEach(({ userId }) => notify({
        userId, type, actor: myProfile, tripId, tripName: trip?.name, refId: refExtra?.spotId, refTitle, refExtra,
      }));
    });
  };
  const city = activeCity?.name || trip?.destination || '';
  const country = activeCity?.country || trip?.country || '';
  const cityId = activeCity?.id || null;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [tab, setTab] = useState('buscar'); // 'buscar' | 'mis'
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [osmResults, setOsmResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [nearbyFilter, setNearbyFilter] = useState([]);  // empty = all
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [stateFilter, setStateFilter] = useState('all');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [assignDateSpot, setAssignDateSpot] = useState(null); // spot to assign date after saving
  const [selectedCity, setSelectedCity] = useState('');
  const [toast, setToast] = useState({ visible: false, spot: null });
  const [lastSavedId, setLastSavedId] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mySpotSearch, setMySpotSearch] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const searchTimer = useRef(null);
  const searchAbortRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (activeCity?.name && !selectedCity) setSelectedCity(activeCity.name);
  }, [activeCity?.name]);

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
    queryKey: ['publicSpots'],
    queryFn: () => base44.entities.Spot.filter({ visibility: 'public' }),
    staleTime: 5*60*1000,
  });

  const { data: tripCities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: d => base44.entities.Spot.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Spot.update(id, data),
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
      if (searchAbortRef.current) searchAbortRef.current.abort();
      searchAbortRef.current = new AbortController();
      const signal = searchAbortRef.current.signal;
      setSearching(true);
      addRecentSearch(searchQuery.trim());
      setRecentSearches(getRecentSearches());
      try { setOsmResults(await searchPlaces(searchQuery, selectedCity || city, country, signal)); }
      catch (e) { if (e?.name !== 'AbortError') setOsmResults([]); }
      finally { setSearching(false); }
    }, 700);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, selectedCity, city, country]);

  const handleNearby = async (cats = nearbyFilter) => {
    if (!navigator.geolocation) {
      setNearbyResults([{ id:'err', name:'Geolocalización no disponible', address:'Tu navegador no soporta geolocalización', type:'custom' }]);
      return;
    }
    setLoadingNearby(true); setNearbyResults([]);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await nearbyPlaces(pos.coords.latitude, pos.coords.longitude, cats.length ? cats : null);
          setNearbyResults(res);
        } catch(e) {
          setNearbyResults([{ id:'err', name:'Sin resultados cerca', address: e.message || 'Intenta buscar por nombre', type:'custom' }]);
        } finally { setLoadingNearby(false); }
      },
      (err) => {
        setLoadingNearby(false);
        const msg = err.code === 1 ? 'Permite el acceso a tu ubicación en el navegador'
          : err.code === 2 ? 'Ubicación no disponible en este momento'
          : 'Tiempo de espera agotado. Intenta de nuevo.';
        setNearbyResults([{ id:'err', name:'No se pudo obtener tu ubicación', address: msg, type:'custom' }]);
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };

  const baseData = extra => ({
    trip_id: tripId || undefined, city_id: cityId||undefined, city_name: city, country: normalizeCountry(country),
    visibility: 'trip_members', visited: false,
    created_by: user?.email, created_by_user_id: user?.id,
    creator_username: myProfile?.username||'',
    ...extra,
  });

  const showToastFor = (spot, cityName) => {
    setToast({ visible: true, spot, city: cityName || city });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ visible: false, spot: null }), 3000);
  };

  const saveOsmPlace = async place => {
    if (!tripId) { alert('No hay viaje seleccionado'); return; }
    const dup = spots.find(s => s.title?.toLowerCase().trim() === place.name?.toLowerCase().trim());
    if (dup) { showToastFor({ title: `"${place.name}" ya está en tu lista` }, city); return; }
    setSavingId(place.id);
    try {
      const created = await createMutation.mutateAsync({
        trip_id: tripId || undefined, city_id: cityId||undefined,
        city_name: selectedCity || city, country: normalizeCountry(country),
        title: place.name, type: place.type || 'sight',
        address: place.address || '', lat: place.lat, lng: place.lng,
        osm_id: place.id || null, source: 'osm',
        visibility: 'trip_members', visited: false,
        created_by: null, created_by_user_id: null,
        saved_by: [user?.email].filter(Boolean),
      });
      setLastSavedId(created?.id);
      setOsmResults([]); setNearbyResults([]); setSearchQuery(''); setNearbyFilter([]);
      showToastFor({ title: place.name }, city);
      if (created?.id) setAssignDateSpot(created);
      notifyMembers('spot_added', '', place.name, { spotId: created?.id, spotDate: created?.assigned_date });
    } catch(e) {
      alert('Error al guardar: ' + e.message);
    } finally { setSavingId(null); }
  };

  const saveManualSpot = async form => {
    if (!tripId) { alert('No hay viaje seleccionado'); return; }
    setSavingId('manual');
    try {
      const created = await createMutation.mutateAsync(baseData({
        title: form.title, type: form.type, notes: form.notes,
        address: form.address, lat: form.lat, lng: form.lng,
        visibility: form.visibility, source: 'manual',
      }));
      setLastSavedId(created?.id);
      setShowCreate(false);
      showToastFor({ title: form.title }, city);
      if (created?.id) setAssignDateSpot(created);
      notifyMembers('spot_added', '', form.title, { spotId: created?.id, spotDate: created?.assigned_date });
    } finally { setSavingId(null); }
  };

  const saveCommunitySpot = async spot => {
    if (!tripId) return;
    const dup = spots.find(s => s.title?.toLowerCase().trim() === spot.title?.toLowerCase().trim());
    if (dup) return;
    const savingKey = spot.id || spot.title;
    setSavingId(savingKey);
    try {
      // Save community spot WITHOUT overriding created_by — preserve original author
      const created = await createMutation.mutateAsync({
        trip_id: tripId || undefined, city_id: cityId || undefined,
        city_name: selectedCity || city, country: normalizeCountry(country),
        title: spot.title, type: spot.type, address: spot.address || '',
        lat: spot.lat, lng: spot.lng, notes: spot.notes || '',
        visibility: 'trip_members', visited: false,
        // Keep original authorship — this spot was created by someone else
        created_by: spot.created_by || null,
        created_by_user_id: spot.created_by_user_id || user?.id,
        creator_username: spot.creator_username || myProfile?.username || '',
        // Tag as saved (not created) by current user
        saved_by: [user?.email].filter(Boolean),
      });
      setLastSavedId(created?.id);
      showToastFor({ title: spot.title }, selectedCity || city);
      if (created?.id) setAssignDateSpot(created);
    } finally { setSavingId(null); }
  };

  const undoSave = async () => {
    if (lastSavedId) { await deleteMutation.mutateAsync(lastSavedId); setLastSavedId(null); }
    setToast({ visible: false, spot: null });
  };

  // Seed spots
  const seedSpots = useMemo(() => {
    if (!country || !city) return [];
    return getSeedSpotsForCity(country, selectedCity || city);
  }, [country, selectedCity, city]);

  // Seed spots that match the search query (shown alongside OSM results)
  const seedSearchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().replace('#', '');
    return seedSpots.filter(s => {
      const inTitle = s.title?.toLowerCase().includes(q);
      const inNotes = s.notes?.toLowerCase().includes(q);
      const inTags = s.tags?.some(t => t.toLowerCase().includes(q));
      return inTitle || inNotes || inTags;
    }).slice(0, 6);
  }, [searchQuery, seedSpots]);

  // Community spots — include own public spots too (so their likes show)
  const communitySpots = useMemo(() => {
    const myIds = new Set(spots.map(s => s.title?.toLowerCase()));
    const targetCity = (selectedCity || city).toLowerCase();
    const normStr = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const fromUsers = publicSpots.filter(s =>
      !targetCity || normStr(s.city_name) === normStr(targetCity)
    );
    // Seed spots are already filtered by city via getSeedSpotsForCity (which uses selectedCity or city)
    const fromSeed = seedSpots.filter(s => !myIds.has(s.title?.toLowerCase()));
    const all = [
      ...fromUsers.map(s => ({ ...s, _source: 'user' })),
      ...fromSeed.map(s => ({ ...s, _source: 'seed', id: `seed_${s.title}` })),
    ];
    // Category filter
    const COMMUNITY_FILTER_TYPES = {
      restaurant: ['food'],
      bar: ['food'],
      sight: ['sight'],
      shopping: ['shopping'],
      activity: ['activity'],
      custom: ['custom'],
    };
    const COMMUNITY_FILTER_KEYWORDS = {
      restaurant: ['restaurant', 'ramen', 'sushi', 'pizza', 'tapas', 'comida', 'comer', 'food'],
      bar: ['bar', 'pub', 'nightlife', 'club', 'cocktail', 'cerveza', 'noche', 'fiesta'],
      nightlife: ['nightlife', 'club', 'disco', 'karaoke', 'bar', 'noche', 'fiesta'],
      vistas: ['vistas', 'mirador', 'viewpoint', 'panorama', 'torre', 'sky', 'view'],
      museos: ['museo', 'museum', 'galeria', 'arte', 'history', 'history', 'cultura'],
      lgtbq: ['lgtbq', 'gay', 'pride', 'queer', 'lgbtq'],
      naturaleza: ['naturaleza', 'parque', 'park', 'jardín', 'garden', 'bosque', 'playa', 'beach'],
      templos: ['templo', 'temple', 'shrine', 'iglesia', 'church', 'mezquita', 'catedral'],
    };

    const filtered = communityFilter === 'all' ? all : all.filter(s => {
      const kws = COMMUNITY_FILTER_KEYWORDS[communityFilter] || [];
      const types = COMMUNITY_FILTER_TYPES[communityFilter] || [];
      const titleLower = (s.title || '').toLowerCase();
      const notesLower = (s.notes || '').toLowerCase();
      return types.includes(s.type) || kws.some(k => titleLower.includes(k) || notesLower.includes(k));
    });

    return filtered.sort((a, b) => (b.visits||0) - (a.visits||0));
  }, [publicSpots, seedSpots, spots, communityFilter, selectedCity, city]);

  // Hashtags
  const hashtags = useMemo(() => buildHashtags(spots, tripCities), [spots, tripCities]);

  // Filtered spots (by state + local search)
  const myCreatedSpots = useMemo(() =>
    spots.filter(s => s.created_by === user?.email || s.created_by_user_id === user?.id),
    [spots, user]
  );
  const mySavedSpots = useMemo(() =>
    spots.filter(s => Array.isArray(s.saved_by) && s.saved_by.includes(user?.email) && s.created_by !== user?.email),
    [spots, user]
  );

  const filteredSpots = useMemo(() => {
    let result = spots.filter(s => {
      if (stateFilter === 'assigned') return !!s.assigned_date;
      if (stateFilter === 'unassigned') return !s.assigned_date;
      if (stateFilter === 'created') return s.created_by === user?.email || s.created_by_user_id === user?.id;
      if (stateFilter === 'saved') return Array.isArray(s.saved_by) && s.saved_by.includes(user?.email) && s.created_by !== user?.email;
      return true;
    });
    if (mySpotSearch.trim().length >= 1) {
      const q = mySpotSearch.toLowerCase();
      result = result.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.city_name?.toLowerCase().includes(q)
      );
    }
    if (nearbyFilter.length > 0) {
      const TYPE_MAP = {
        food:      ['food'],
        cultural:  ['sight'],
        interest:  ['activity', 'custom'],
        shop:      ['hotel', 'transport', 'shopping'],
        nightlife: ['nightlife', 'bar'],
      };
      const allowed = new Set(nearbyFilter.flatMap(k => TYPE_MAP[k] || []));
      result = result.filter(s => allowed.has(s.type));
    }
    return result;
  }, [spots, stateFilter, mySpotSearch, nearbyFilter]);

  const isSearchActive = searchQuery.length >= 2;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Crear spot
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />Spots
          </h1>
          <OTabBar
            tabs={[{key:'buscar',label:'Buscar'},{key:'mis',label:'Mis spots'}]}
            activeKey={tab}
            onChange={setTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">

        {/* ── BUSCAR TAB ── */}
        {tab === 'buscar' && (
          <div className="space-y-4">

            {/* Search + Cerca */}
            <div className="flex items-center gap-2">
              <div className={`flex-1 flex items-center gap-2 bg-card border rounded-2xl px-3 py-2.5 transition-colors ${searchQuery ? 'border-primary' : 'border-border'}`}>
                <Search className={`w-4 h-4 flex-shrink-0 ${searchQuery ? 'text-primary' : 'text-muted-foreground'}`} />
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setNearbyResults([]); }}
                  placeholder="Buscar lugares..."
                  className="flex-1 text-sm outline-none bg-transparent text-foreground min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setOsmResults([]); setNearbyResults([]); }} className="text-muted-foreground flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleNearby(nearbyFilter)}
                className="flex items-center gap-1.5 bg-accent text-primary px-3 py-2.5 rounded-full text-sm font-semibold flex-shrink-0 border border-orange-200"
              >
                <Navigation className="w-3.5 h-3.5" />Cerca
              </button>
            </div>

            {/* Chips de ciudad — solo si hay más de una */}
            {!searchQuery && tripCities.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {tripCities.map(c => (
                  <button key={c.id} onClick={() => setSelectedCity(selectedCity === c.name ? '' : c.name)}
                    className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors flex-shrink-0 ${
                      selectedCity === c.name
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card border-border text-foreground hover:border-primary/40'
                    }`}>
                    {c.name}
                  </button>
                ))}
                {!showCityInput ? (
                  <button onClick={() => setShowCityInput(true)}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-dashed border-primary/40 text-primary bg-accent font-medium">
                    <Plus className="w-3.5 h-3.5" />Ciudad
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={customCity}
                      onChange={e => setCustomCity(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && customCity.trim()) { setSelectedCity(customCity.trim()); setShowCityInput(false); setCustomCity(''); }
                        if (e.key === 'Escape') { setShowCityInput(false); setCustomCity(''); }
                      }}
                      placeholder="Ej: Rivas..."
                      className="text-sm px-3 py-1.5 rounded-full border border-primary outline-none bg-card text-foreground w-28"
                    />
                    <button onClick={() => { setShowCityInput(false); setCustomCity(''); }} className="text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Chips de categoría */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'food',      Icon: Utensils,    label: 'Comer' },
                  { key: 'cultural',  Icon: Landmark,    label: 'Cultural' },
                  { key: 'interest',  Icon: Ticket,      label: 'Interés' },
                  { key: 'shop',      Icon: ShoppingBag, label: 'Compras' },
                  { key: 'nightlife', Icon: Moon,        label: 'Noche' },
                ].map(({ key: k, Icon, label }) => (
                  <button key={k} type="button"
                    onClick={() => {
                      const next = nearbyFilter.includes(k) ? nearbyFilter.filter(x => x !== k) : [...nearbyFilter, k];
                      setNearbyFilter(next);
                    }}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      nearbyFilter.includes(k)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                    }`}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
            )}

            {/* Estado vacío */}
            {!searchQuery && osmResults.length === 0 && nearbyResults.length === 0 && !searching && !loadingNearby && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Compass className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Busca un lugar o usa Cerca<br />para descubrir alrededor</p>
              </div>
            )}

            {/* Resultados con búsqueda */}
            {searchQuery.length >= 2 && (
              <div className="space-y-4">

                {/* Tus spots que coinciden — primero */}
                {(() => {
                  const q = searchQuery.toLowerCase();
                  const matched = spots.filter(s =>
                    s.title?.toLowerCase().includes(q) ||
                    s.notes?.toLowerCase().includes(q) ||
                    s.address?.toLowerCase().includes(q)
                  );
                  if (!matched.length) return null;
                  return (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tus spots</p>
                      <div className="space-y-2">
                        {matched.map(spot => (
                          <button key={spot.id} onClick={() => setSelectedSpot(spot)}
                            className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-3 text-left hover:border-primary/40 transition-colors">
                            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                              {(() => { const I = {food:Utensils,sight:Landmark,activity:Ticket,shopping:ShoppingBag,nightlife:Moon,bar:Moon}[spot.type] || Compass; return <I size={16} className="text-primary" />; })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{spot.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{spot.city_name || city}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${spot.assigned_date ? 'bg-orange-100 text-primary' : 'bg-green-50 text-green-700'}`}>
                              {spot.assigned_date ? 'Asignado' : 'Guardado'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Resultados OSM */}
                {searching && <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>}
                {!searching && osmResults.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Más resultados</p>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      {osmResults.map((p, i) => {
                        const isDuplicate = spots.some(s => s.title?.toLowerCase().trim() === p.name?.toLowerCase().trim());
                        return (
                          <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 ${i < osmResults.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                              {(() => { const I = {food:Utensils,sight:Landmark,activity:Ticket,shopping:ShoppingBag,nightlife:Moon,bar:Moon}[p.type] || Compass; return <I size={14} className="text-muted-foreground" />; })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              {p.address && <p className="text-xs text-muted-foreground truncate">{p.address}</p>}
                            </div>
                            {isDuplicate
                              ? <span className="text-xs text-muted-foreground flex-shrink-0">Guardado</span>
                              : <button onClick={() => saveOsmPlace(p)} disabled={savingId === p.id} className="flex-shrink-0 text-primary hover:text-primary/70 transition-colors">
                                  <Plus className="w-5 h-5" />
                                </button>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!searching && searchQuery.length >= 2 && osmResults.length === 0 && (
                  <div className="text-center py-8 bg-card border border-border rounded-2xl">
                    <p className="text-sm text-muted-foreground">Sin resultados para "{searchQuery}"</p>
                    <button onClick={() => setShowCreate(true)}
                      className="mt-3 flex items-center gap-1.5 mx-auto text-sm text-primary font-medium">
                      <Plus className="w-4 h-4" />Crear manualmente
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resultados Cerca */}
            {loadingNearby && <p className="text-sm text-muted-foreground text-center py-4">Obteniendo tu ubicación...</p>}
            {nearbyResults.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{nearbyResults.length} lugares cerca</p>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {nearbyResults.map((p, i) => {
                    const isDuplicate = spots.some(s => s.title?.toLowerCase().trim() === p.name?.toLowerCase().trim());
                    return (
                      <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 ${i < nearbyResults.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          {(() => { const I = {food:Utensils,sight:Landmark,activity:Ticket,shopping:ShoppingBag,nightlife:Moon,bar:Moon}[p.type] || Compass; return <I size={14} className="text-muted-foreground" />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.address || ''}{p.dist ? ` · ${p.dist < 1000 ? p.dist + 'm' : (p.dist/1000).toFixed(1) + 'km'}` : ''}</p>
                        </div>
                        {isDuplicate
                          ? <span className="text-xs text-muted-foreground flex-shrink-0">Guardado</span>
                          : <button onClick={() => saveOsmPlace(p)} disabled={savingId === p.id} className="flex-shrink-0 text-primary hover:text-primary/70 transition-colors">
                              <Plus className="w-5 h-5" />
                            </button>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

                {/* ── MIS SPOTS TAB ── */}
        {tab === 'mis' && (
          <div>
            {/* Search bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={mySpotSearch}
                onChange={e => setMySpotSearch(e.target.value)}
                placeholder="Buscar en mis spots..."
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl text-sm outline-none bg-card border border-border focus:border-primary text-foreground"
              />
              {mySpotSearch && (
                <button onClick={() => setMySpotSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              {[['all','Todos'],['created','Creados'],['saved','Guardados'],['assigned','Asignados']].map(([v,l]) => (
                <button key={v} onClick={() => setStateFilter(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    stateFilter===v ? 'bg-primary text-white border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                  }`}>
                  {l}
                </button>
              ))}
            </div>

            {spots.length === 0 ? (
              <div className="text-center py-16">
                
                <p className="text-muted-foreground mb-4">Aún no tienes spots en este viaje</p>
                <button onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-full font-medium">
                  <Plus className="w-4 h-4" />Crear primer spot
                </button>
              </div>
            ) : filteredSpots.length === 0 && mySpotSearch.trim().length >= 1 ? (
              /* No local match — show message + seed/OSM suggestions */
              <div className="space-y-4">
                <div className="text-center py-6 bg-card rounded-2xl border border-border">
                  <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">No tienes ese spot todavía</p>
                  <p className="text-xs text-muted-foreground">Resultados de búsqueda para <strong>"{mySpotSearch}"</strong></p>
                </div>
                {/* Show seed matches as suggestions */}
                {seedSpots.filter(s => s.title?.toLowerCase().includes(mySpotSearch.toLowerCase())).slice(0, 5).map((p, i) => {
                  const isDuplicate = spots.some(s => s.title?.toLowerCase().trim() === p.title?.toLowerCase().trim());
                  return <PlaceResultCard key={`ms-seed-${i}`} place={{ id: `ms-seed-${i}`, name: p.title, type: p.type, address: p.address || '' }} onSave={saveOsmPlace} saving={savingId===`ms-seed-${i}`} isDuplicate={isDuplicate} />;
                })}
                <button onClick={() => { setTab('buscar'); setSearchQuery(mySpotSearch); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-dashed border-border rounded-2xl text-sm text-primary font-medium hover:bg-orange-50 transition-colors">
                  <Search className="w-4 h-4" />Buscar "{mySpotSearch}" en el mapa
                </button>
              </div>
            ) : filteredSpots.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">Sin spots con ese filtro</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {filteredSpots.map(spot => (
                  <MySpotRow
                    key={spot.id}
                    spot={spot}
                    onTap={setSelectedSpot}
                    userId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create sheet */}
      <CreateSpotSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={saveManualSpot}
        saving={savingId === 'manual'}
        spots={spots}
        city={city}
        country={country}
      />

      {/* Spot detail sheet */}
      {selectedSpot && (
        <SpotDetailSheet
          spot={selectedSpot}
          open={!!selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onNotify={notifyMembers}
          onSave={(id, data) => updateMutation.mutateAsync({ id, data })}
          onDelete={id => deleteMutation.mutate(id)}
          tripId={tripId}
          tripCities={tripCities}
          userId={user?.id}
        />
      )}

      {/* Assign date modal */}
      {assignDateSpot && (
        <AssignDateModal
          spot={assignDateSpot}
          tripCities={tripCities}
          onAssign={async (date) => {
            await updateMutation.mutateAsync({ id: assignDateSpot.id, data: { assigned_date: date } });
            setAssignDateSpot(null);
          }}
          onSkip={() => setAssignDateSpot(null)}
          onUndo={async () => {
            if (assignDateSpot?.id) await deleteMutation.mutateAsync(assignDateSpot.id);
            setAssignDateSpot(null);
          }}
        />
      )}

      {/* Toast */}
      <SpotToast spot={toast.spot} city={toast.city} visible={toast.visible} onUndo={undoSave} />
    </div>
  );
}