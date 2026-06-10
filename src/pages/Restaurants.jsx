import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useMemo, useCallback} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { notify, resolveUserIds } from '@/lib/notifications';
import { getSeedSpotsForCity } from '@/lib/spotsDB';
import { normalizeCountry } from '@/lib/countryConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Navigation, MapPin, ArrowRight, Pencil, Utensils, Landmark, Ticket, ShoppingBag, CirclePlus, Compass, Moon, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpotCard from '@/components/spots/SpotCard';

function OTabBar({ tabs, activeKey, onChange }) {
  const containerRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const updateLine = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.findIndex(t => t.key === activeKey);
    const buttons = containerRef.current.querySelectorAll('button');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const labelEl = btn.querySelector('.tab-label');
    const labelRect = labelEl ? labelEl.getBoundingClientRect() : btnRect;
    setLineStyle({
      left: labelRect.left - containerRect.left,
      width: labelRect.width,
    });
  }, [activeKey, tabs]);

  useEffect(() => {
    updateLine();
    if (!mounted) setTimeout(() => setMounted(true), 50);
  }, [updateLine, mounted]);

  return (
    <div
      ref={containerRef}
      className="relative flex"
      style={{ position: 'relative' }}
    >
      {/* Animated sliding line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: lineStyle.left,
          width: lineStyle.width,
          height: 3,
          background: 'hsl(var(--primary))',
          borderRadius: 2,
          transition: mounted ? 'left 0.25s cubic-bezier(.4,0,.2,1), width 0.25s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      />
      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? 'var(--kodo-text-active)' : 'var(--kodo-nav-inactive)',
                transition: 'color 0.2s',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// ── OSM helpers ───────────────────────────────────────────────────────────────
const OSM_MAP = {
  restaurant:'food', cafe:'food', bar:'food', fast_food:'food', pub:'food', bakery:'food',
  museum:'sight', monument:'sight', attraction:'sight', viewpoint:'sight', temple:'sight',
  church:'sight', shrine:'sight', castle:'sight', gallery:'sight', park:'sight',
  shop:'shopping', mall:'shopping', market:'shopping',
  bus_station:'transport', train_station:'transport', subway_entrance:'transport',
  sports_centre:'activity', cinema:'activity', theatre:'activity',
};
function osmToType(type, cls) { return OSM_MAP[type] || OSM_MAP[cls] || 'sight'; }

async function searchPlaces(query, city, country, signal) {
  const q = [query, city, country].filter(Boolean).join(', ');
  const params = new URLSearchParams({ q, format:'json', limit:8, addressdetails:1, namedetails:1 });
  const res = await fetch('https://nominatim.openstreetmap.org/search?' + params, {
    headers: { 'Accept-Language':'es,en', 'User-Agent':'KodoTravelApp/1.0' },
    signal: signal || (() => { const c = new AbortController(); setTimeout(() => c.abort(), 8000); return c.signal; })(),
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

async function nearbyPlaces(lat, lng, filterCats = null) {
  const RADIUS = 1000;
  const AMENITY_MAP = {
    food:      ['restaurant', 'cafe', 'fast_food', 'bar', 'food_court', 'ice_cream'],
    cultural:  ['museum', 'theatre', 'cinema', 'arts_centre', 'library'],
    interest:  ['attraction', 'place_of_worship'],
    shop:      ['hotel', 'hostel', 'guest_house', 'supermarket', 'marketplace'],
    nightlife: ['bar', 'pub', 'nightclub', 'biergarten'],
  };
  const TOURISM_MAP = {
    cultural:  ['museum', 'gallery', 'artwork', 'monument', 'memorial'],
    interest:  ['attraction', 'viewpoint', 'theme_park', 'zoo', 'aquarium'],
    shop:      ['hotel', 'hostel', 'guest_house', 'apartment'],
  };
  const amenities = filterCats?.length
    ? filterCats.flatMap(k => AMENITY_MAP[k] || [])
    : ['restaurant', 'cafe', 'bar', 'museum', 'hotel', 'fast_food', 'pub', 'theatre'];
  const tourisms = filterCats?.length
    ? filterCats.flatMap(k => TOURISM_MAP[k] || [])
    : ['museum', 'hotel', 'attraction', 'viewpoint', 'gallery'];

  const amenityList = [...new Set(amenities)].join('|');
  const tourismList = [...new Set(tourisms)].join('|');
  const amenityFilter = amenityList ? `node["amenity"~"${amenityList}"](around:${RADIUS},${lat},${lng});` : '';
  const tourismFilter = tourismList ? `node["tourism"~"${tourismList}"](around:${RADIUS},${lat},${lng});` : '';
  const query = `[out:json][timeout:10];(${amenityFilter}${tourismFilter});out body 30;`;

  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 12000);
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: query, signal: ctrl.signal,
  });
  if (!res.ok) throw new Error('overpass error');
  const data = await res.json();

  const seen = new Set();
  const results = [];
  (data.elements || []).forEach(el => {
    const name = el.tags?.name || el.tags?.['name:es'] || el.tags?.['name:en'];
    if (!name || seen.has(el.id)) return;
    seen.add(el.id);
    const amenity = el.tags?.amenity || el.tags?.tourism || '';
    const dist = Math.round(Math.sqrt(
      Math.pow((el.lat - lat) * 111000, 2) +
      Math.pow((el.lon - lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
    ));
    results.push({
      id: el.id?.toString(), name,
      address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || '',
      lat: el.lat, lng: el.lon, dist,
      type: osmToType(amenity, amenity),
    });
  });
  results.sort((a, b) => a.dist - b.dist);
  if (results.length === 0) throw new Error('no results nearby');
  return results.slice(0, 20);
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'es,en', 'User-Agent': 'KodoTravelApp/1.0' }, signal: AbortSignal.timeout(6000) }
    );
    const d = await res.json();
    const a = d.address || {};
    const road = a.road || a.pedestrian || a.footway || '';
    const city = a.city || a.town || a.village || a.municipality || '';
    return [road, city].filter(Boolean).join(', ') || d.display_name?.split(',').slice(0,2).join(',') || '';
  } catch { return ''; }
}

async function loadLeaflet() {
  if (window.L) return window.L;
  await new Promise((res, rej) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = res; script.onerror = rej;
    document.head.appendChild(script);
  });
  return window.L;
}

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  food:      { label:'Comer',      Icon: Utensils,    color:'bg-orange-100 text-primary' },
  sight:     { label:'Cultura',    Icon: Landmark,    color:'bg-violet-100 text-violet-600' },
  activity:  { label:'Actividad',  Icon: Ticket,      color:'bg-green-100 text-green-600' },
  shopping:  { label:'Compras',    Icon: ShoppingBag, color:'bg-blue-100 text-blue-600' },
  transport: { label:'Transporte', Icon: Compass,     color:'bg-secondary0 text-muted-foreground' },
  custom:    { label:'Otro',       Icon: CirclePlus,  color:'bg-secondary text-muted-foreground' },
};

// ── Country-specific special tags ─────────────────────────────────────────────
const COUNTRY_SPECIAL_TAGS = {
  'Japón': ['#templos', '#onsen', '#ramen', '#anime', '#sakura', '#naturaleza', '#museos', '#nightlife'],
  'Italia': ['#pizza', '#coliseo', '#arte', '#pasta', '#vino', '#museos', '#arquitectura', '#gelato'],
  'Francia': ['#croissant', '#louvre', '#baguette', '#vino', '#museos', '#moda', '#arte'],
  'Tailandia': ['#mango', '#templos', '#tukTuk', '#playa', '#naturaleza', '#streetfood', '#nightlife'],
  'México': ['#tacos', '#cenotes', '#mariachi', '#mezcal', '#arqueología', '#playa', '#mercados'],
  'Marruecos': ['#medina', '#hammam', '#té', '#zoco', '#desierto', '#arquitectura', '#especias'],
  'Turquía': ['#baño', '#bazar', '#kebab', '#mezquita', '#arqueología', '#mar', '#historia'],
  'Corea del Sur': ['#kpop', '#bbq', '#hanok', '#kimchi', '#palacio', '#skincare', '#streetfood'],
  'Vietnam': ['#pho', '#banh-mi', '#moto', '#bahia', '#arrozales', '#historia', '#streetfood'],
  'India': ['#curry', '#taj-mahal', '#rickshaw', '#yoga', '#templos', '#especias', '#mercados'],
  'España': ['#tapas', '#flamenco', '#catedral', '#playa', '#vino', '#museos', '#nightlife'],
  'Portugal': ['#pastelde-nata', '#fado', '#azulejos', '#surf', '#vino', '#historia'],
  'Grecia': ['#acropolis', '#islas', '#souvlaki', '#mar', '#historia', '#vino', '#arqueología'],
  'Alemania': ['#cerveza', '#castillos', '#mercadillos', '#museos', '#historia', '#selva-negra'],
  'Países Bajos': ['#bicicleta', '#tulipanes', '#museos', '#canales', '#queso', '#arte'],
  'Reino Unido': ['#pubs', '#museos', '#historia', '#teatros', '#highlands', '#castillos'],
  'Estados Unidos': ['#parques', '#jazz', '#hamburguesas', '#museos', '#naturaleza', '#roadtrip'],
  'Perú': ['#machupichu', '#ceviche', '#inca', '#naturaleza', '#titicaca', '#aventura'],
  'Argentina': ['#asado', '#tango', '#patagonia', '#vino', '#glaciares', '#fútbol'],
  'Colombia': ['#café', '#cartajena', '#naturaleza', '#salsa', '#flores', '#aventura'],
  'Chile': ['#atacama', '#patagonia', '#vino', '#mar', '#naturaleza', '#aventura'],
  'Brasil': ['#samba', '#playa', '#amazonia', '#carnaval', '#naturaleza', '#caipirinha'],
  'Indonesia': ['#bali', '#templos', '#surf', '#arrozales', '#naturaleza', '#buceo'],
  'Filipinas': ['#islas', '#mar', '#buceo', '#playa', '#naturaleza', '#streetfood'],
  'Singapur': ['#hawker', '#jardines', '#rascacielos', '#museos', '#streetfood', '#marina'],
  'Camboya': ['#angkorwat', '#templos', '#historia', '#naturaleza', '#streetfood'],
  'Nepal': ['#himalaya', '#trekking', '#budismo', '#naturaleza', '#aventura'],
  'Egipto': ['#piramides', '#faraonico', '#desierto', '#nilo', '#historia', '#arqueología'],
  'Sudáfrica': ['#safari', '#naturaleza', '#vinos', '#playas', '#aventura', '#wildlife'],
  'Kenia': ['#safari', '#masai-mara', '#wildlife', '#naturaleza', '#aventura'],
  'Australia': ['#koalas', '#surf', '#outback', '#barrera-coral', '#naturaleza', '#bbq'],
  'Nueva Zelanda': ['#hobbit', '#aventura', '#naturaleza', '#fiordos', '#senderismo'],
  'Canadá': ['#aurora', '#naturaleza', '#lagos', '#montañas', '#maple', '#cascadas'],
  'Cuba': ['#son', '#habana', '#coches-clásicos', '#mojito', '#historia', '#playa'],
  'Costa Rica': ['#naturaleza', '#surf', '#biodiversidad', '#aventura', '#volcanes'],
  'Islandia': ['#aurora', '#cascadas', '#glaciares', '#géiseres', '#naturaleza', '#yoga'],
  'Noruega': ['#fiordos', '#aurora', '#naturaleza', '#senderismo', '#vikingos'],
  'Suecia': ['#diseño', '#naturaleza', '#aurora', '#museos', '#midsommar'],
};

// ── Dynamic hashtags from existing spots ──────────────────────────────────────
function buildHashtags(spots, tripCities) {
  const typeTags = {
    food: '#comida',
    sight: '#museos',
    activity: '#aventura',
    shopping: '#compras',
    custom: '#especial',
  };
  const typeSet = new Set(spots.map(s => typeTags[s.type]).filter(Boolean));
  // Always add a few generic travel tags
  const genericTags = ['#naturaleza', '#nightlife', '#streetfood', '#vistas', '#barato'];
  const countryTags = [];
  const countries = [...new Set(tripCities.map(c => c.country).filter(Boolean))];
  countries.forEach(c => {
    const tags = COUNTRY_SPECIAL_TAGS[c] || [];
    tags.forEach(t => countryTags.push(t));
  });
  // Combine: type tags + country-specific + generic, deduplicated
  const all = [...typeSet, ...countryTags, ...genericTags];
  return [...new Set(all)].slice(0, 12);
}

// ── Recent searches (localStorage) ───────────────────────────────────────────
const RECENT_SEARCHES_KEY = 'kodo_recent_searches';
function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); } catch { return []; }
}
function addRecentSearch(query) {
  const searches = getRecentSearches().filter(s => s.query !== query);
  searches.unshift({ query, date: new Date().toISOString() });
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 8)));
}
function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ── Leaflet map ───────────────────────────────────────────────────────────────
function LeafletMap({ lat, lng, onMove }) {
  const leafletRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current || leafletRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const icon = L.divIcon({
        html: '<div style="width:28px;height:28px;background:hsl(var(--primary));border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
        iconSize: [28, 28], iconAnchor: [14, 28], className: ''
      });
      const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
      marker.on('dragend', async e => {
        const { lat: la, lng: ln } = e.target.getLatLng();
        const addr = await reverseGeocode(la, ln);
        onMove(la, ln, addr);
      });
      map.on('click', async e => {
        const { lat: la, lng: ln } = e.latlng;
        marker.setLatLng([la, ln]);
        const addr = await reverseGeocode(la, ln);
        onMove(la, ln, addr);
      });
      leafletRef.current = map;
      markerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 100);
    }).catch(() => {});
    return () => { cancelled = true; if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  useEffect(() => {
    if (markerRef.current && leafletRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return <div ref={containerRef} style={{ height: '180px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }}/>;
}

// ── Create spot bottom sheet ──────────────────────────────────────────────────
function CreateSpotSheet({ open, onClose, onSave, saving, spots, city, country }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('food');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [pinLat, setPinLat] = useState(null);
  const [pinLng, setPinLng] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [duplicate, setDuplicate] = useState(null); // spot that matches

  // A: real-time duplicate check
  useEffect(() => {
    if (!title.trim() || title.length < 3) { setDuplicate(null); return; }
    const match = spots.find(s =>
      s.title?.toLowerCase().trim() === title.toLowerCase().trim() &&
      (s.city_name?.toLowerCase() === city?.toLowerCase() || !s.city_name)
    );
    setDuplicate(match || null);
  }, [title, spots, city]);

  const handleGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = pos.coords.latitude, ln = pos.coords.longitude;
        setPinLat(la); setPinLng(ln);
        const addr = await reverseGeocode(la, ln);
        if (addr) setAddress(addr);
        setShowMap(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    // B: block if exact duplicate
    if (duplicate) return;
    if (!title.trim()) return;
    onSave({ title, type, notes, address, lat: pinLat, lng: pinLng, visibility: isPublic ? 'public' : 'trip_members' });
    // reset
    setTitle(''); setType('food'); setNotes(''); setAddress('');
    setPinLat(null); setPinLng(null); setShowMap(false); setIsPublic(true);
  };

  if (!open) return null;

  const defaultLat = pinLat || 35.6762;
  const defaultLng = pinLng || 139.6503;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
        {/* Handle + header — fixed */}
        <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-base">Crear spot</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Location FIRST (map at top) */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ubicación</p>
            {/* Map placeholder / real map */}
            <div className="rounded-xl overflow-hidden border border-border mb-2" style={{ height: '180px', background: '#f0f4f8', position: 'relative' }}>
              {showMap
                ? <LeafletMap lat={defaultLat} lng={defaultLng} onMove={(la, ln, addr) => { setPinLat(la); setPinLng(ln); if (addr) setAddress(addr); }} />
                : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs">Toca para añadir ubicación</p>
                  </div>
                )
              }
            </div>
            <button onClick={() => { if (!pinLat) handleGPS(); setShowMap(true); }}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-border rounded-2xl text-sm text-primary font-medium hover:bg-orange-50 transition-colors mb-2">
              <span className="flex items-center gap-2"><Navigation className="w-4 h-4"/>{locating ? 'Localizando...' : 'Usar mi ubicación actual'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="o escribe la dirección..." className="h-9 text-sm" />
          </div>

          {/* Name + duplicate check */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nombre *</p>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Ichiran Ramen Shinjuku"
              className="h-10 text-sm"
              autoFocus
            />
            {duplicate && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Ya existe este spot en {city}</p>
                  <p className="text-xs text-amber-700 mt-0.5">"{duplicate.title}" ya está en tu lista.</p>
                </div>
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'transport').map(([val, tc]) => (
                <button key={val} onClick={() => setType(val)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                    type === val ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}>
                  {tc.Icon && <tc.Icon size={13} />} {tc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nota</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="¿Algo que recordar sobre este lugar?"
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"
            />
          </div>

          {/* Visibility toggle */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibilidad</p>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setIsPublic(true)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isPublic ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'}`}>
                Kōdo Community
              </button>
              <button onClick={() => setIsPublic(false)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isPublic ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'}`}>
                Solo mi viaje
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              {isPublic ? 'Otros viajeros podrán descubrirlo y guardarlo' : 'Solo tú y tu grupo lo verán'}
            </p>
          </div>
        </div>

        {/* Sticky footer buttons */}
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving || !!duplicate}
            className="flex-1 bg-primary hover:bg-primary/90 text-white">
            {saving ? 'Guardando...' : 'Guardar spot'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── OSM result card ───────────────────────────────────────────────────────────
function PlaceResultCard({ place, onSave, saving, isDuplicate }) {
  const tc = TYPE_CONFIG[place.type] || TYPE_CONFIG.custom;
  return (
    <div className={`bg-card rounded-2xl border flex overflow-hidden transition-all ${isDuplicate ? 'border-amber-200 opacity-60' : 'border-border hover:shadow-sm'}`}>
      <div className="w-12 bg-orange-50 flex items-center justify-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.color}`}>{tc.Icon && <tc.Icon size={16} />}</div>
      </div>
      <div className="flex-1 min-w-0 p-3">
        <p className="font-semibold text-sm text-foreground leading-tight">{place.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tc.label}{place.address ? ' · ' + place.address : ''}</p>
        {isDuplicate ? (
          <p className="text-xs text-amber-600 mt-1.5 font-medium">Ya en tu lista</p>
        ) : (
          <Button size="sm" onClick={() => onSave(place)} disabled={saving}
            className="mt-2 h-7 text-xs bg-primary hover:bg-primary/90 text-white px-3">
            <Plus className="w-3 h-3 mr-1"/>{saving ? 'Guardando...' : 'Añadir'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Community spot detail sheet ───────────────────────────────────────────────
function CommunitySpotDetailSheet({ spot, onClose, onSave, saving, alreadySaved, userId }) {
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot.id, userId);
  const [showComments, setShowComments] = useState(false);
  const isReal = spot.id && !String(spot.id).startsWith('seed_');

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot.id && isReal,
    staleTime: 30000,
  });

  const mapsUrl = spot.lat && spot.lng
    ? `https://www.google.com/maps?q=${spot.lat},${spot.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
        <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col" style={{ maxHeight: 'calc(85vh - 80px)' }} onClick={e => e.stopPropagation()}>
          <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${tc.color}`}>
                  {tc.Icon && <tc.Icon size={14} />}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{spot.title}</p>
                  <p className="text-xs text-muted-foreground">{tc.label}{spot.city_name ? ' · ' + spot.city_name : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {spot.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{spot.address}</span>
              </div>
            )}
            {spot.notes && (
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-foreground leading-relaxed">{spot.notes}</p>
              </div>
            )}
            {spot.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {spot.tags.map(t => (
                  <span key={t} className="text-xs bg-accent text-primary px-2.5 py-1 rounded-full border border-orange-200">#{t}</span>
                ))}
              </div>
            )}
            {spot.creator_username && (
              <p className="text-xs text-muted-foreground">Añadido por <span className="font-medium text-foreground">@{spot.creator_username}</span></p>
            )}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors">
              <Navigation className="w-4 h-4" />Ver en Google Maps
            </a>
          </div>

          <div className="flex-shrink-0 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={toggleLike} className="flex items-center gap-1.5 text-sm transition-colors p-1 -m-1 rounded-full">
                {isLiked
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                }
                <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>{likeCount > 0 ? likeCount : 'Me gusta'}</span>
              </button>
              {isReal && (
                <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {comments.length > 0 ? comments.length : 'Comentar'}
                </button>
              )}
            </div>
            {alreadySaved ? (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Ya guardado en tu viaje
              </div>
            ) : (
              <button onClick={() => { onSave(spot); onClose(); }} disabled={saving}
                className="w-full py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {saving ? 'Guardando...' : 'Guardar en mi viaje'}
              </button>
            )}
          </div>
        </div>
      </div>
      {showComments && <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />}
    </>
  );
}

// ── Community spot card (matches UI from screenshots) ─────────────────────────
function CommunitySpotCard({ spot, onSave, saving, alreadySaved, userId }) {
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const [showDetail, setShowDetail] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot.id, userId);

  const isReal = spot.id && !String(spot.id).startsWith('seed_');
  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot.id && isReal,
    staleTime: 60000,
  });

  const displayVisits = spot.visits || likeCount || 0;

  const mapsUrl = spot.lat && spot.lng
    ? (/iPad|iPhone|iPod/.test(navigator.userAgent)
        ? `https://maps.apple.com/?q=${spot.lat},${spot.lng}`
        : `https://www.google.com/maps?q=${spot.lat},${spot.lng}`)
    : (/iPad|iPhone|iPod/.test(navigator.userAgent)
        ? `https://maps.apple.com/?q=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title + (spot.city_name ? ' ' + spot.city_name : ''))}`);

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Clickable top area */}
        <div className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setShowDetail(true)}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${tc.color}`}>
              {tc.Icon && <tc.Icon size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight">{spot.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tc.label}{spot.city_name ? ' · ' + spot.city_name : ''}
              </p>
              {spot.notes
                ? <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{spot.notes}</p>
                : spot.address
                  ? <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{spot.address}</p>
                  : null
              }
              {spot.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spot.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-xs bg-orange-50 text-primary px-2.5 py-0.5 rounded-full border border-orange-100">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: like · comentar · guardar */}
        <div className="flex items-stretch border-t border-border">
          {/* Like */}
          <button
            onClick={e => { e.stopPropagation(); toggleLike(); }}
            className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 hover:bg-secondary/30 transition-colors"
          >
            {isLiked
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
            <span className={`text-sm ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}>
              {displayVisits > 0 ? displayVisits : ''}
            </span>
          </button>

          <div className="w-px bg-border" />

          {/* Comentar */}
          <button
            onClick={e => { e.stopPropagation(); setShowComments(true); }}
            className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>{comments.length > 0 ? comments.length : ''}</span>
          </button>

          <div className="w-px bg-border" />

          {/* Guardar */}
          {alreadySaved ? (
            <div className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 text-green-600 font-semibold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Guardado
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onSave(spot); }}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 text-sm flex-1 py-2.5 font-semibold text-primary hover:text-primary/80 hover:bg-secondary/30 transition-colors disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {saving ? '...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <CommunitySpotDetailSheet
          spot={spot}
          onClose={() => setShowDetail(false)}
          onSave={onSave}
          saving={saving}
          alreadySaved={alreadySaved}
          userId={userId}
        />
      )}
      {showComments && isReal && (
        <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}

// ── Minimal like hook for community cards (spots may be seeds without real ID) ─
function useLikeSimple(spotId, userId) {
  const queryClient = useQueryClient();
  const isReal = spotId && !String(spotId).startsWith('seed_');

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', 'spot', spotId],
    queryFn: () => base44.entities.Like.filter({ target_id: spotId, target_type: 'spot' }),
    enabled: !!spotId && !!userId && isReal,
    staleTime: 30000,
  });

  const likeRecord = likes.find(l => l.user_id === userId);
  const isLiked = !!likeRecord;
  const count = isReal ? likes.length : 0;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isLiked && likeRecord) {
        await base44.entities.Like.delete(likeRecord.id);
      } else {
        await base44.entities.Like.create({ user_id: userId, target_id: spotId, target_type: 'spot' });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['likes', 'spot', spotId] }),
  });

  return { isLiked, count, toggle: () => { if (isReal && userId) mutation.mutate(); } };
}

// ── Simple comments popup ─────────────────────────────────────────────────────
function InlineCommentsPopup({ spot, userId, onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: userProfile } = useQuery({
    queryKey: ['myProfile', userId],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: userId }); return r[0] || null; },
    enabled: !!userId, staleTime: 60000,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 15000,
  });

  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id, user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      user_avatar: userProfile?.avatar_url || '',
      thumb: 'up',
      text: text.trim() || null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] }); setText(''); },
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl flex flex-col" style={{ maxHeight: 'calc(75vh - 80px)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-sm">{spot.title}</p>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Sin comentarios. ¡Sé el primero!</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              {(c.user_avatar || c.avatar_url)
                ? <img src={c.user_avatar || c.avatar_url} alt={c.user_display_name||''} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">{(c.user_display_name||'?')[0].toUpperCase()}</div>
              }
              <div className="flex-1 bg-secondary rounded-2xl rounded-tl-none px-3 py-2">
                <span className="text-xs font-semibold text-foreground">@{c.username || c.user_display_name}</span>
                {c.text && <p className="text-sm text-foreground mt-0.5">{c.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Escribe un comentario..."
              className="flex-1 text-sm border border-border rounded-2xl px-3 py-2.5 resize-none outline-none focus:border-primary bg-secondary min-h-[40px] max-h-24"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || mutation.isPending}
              className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-opacity"
            >
              {mutation.isPending
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My spot row (Mis spots tab) ───────────────────────────────────────────────
function MySpotRow({ spot, onTap, userId }) {
  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot.id, userId);
  const [showComments, setShowComments] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 60000,
  });

  const hasDate = !!spot.assigned_date;

  return (
    <div className="bg-card border-b border-border last:border-0">
      {/* Main row — clickable to open sheet */}
      <button onClick={() => onTap(spot)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/20 transition-colors">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.color}`}>{tc.Icon && <tc.Icon size={16} />}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${spot.visited ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {spot.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tc.label}
            {spot.city_name ? ' · ' + spot.city_name : ''}
          </p>
          {hasDate && (
            <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {spot.assigned_date}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {spot.visited ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Visitado</span>
          ) : hasDate ? (
            <span className="text-xs bg-orange-100 text-primary px-2 py-0.5 rounded-full font-medium">Asignado</span>
          ) : (
            <span className="text-xs text-muted-foreground/60">Sin día</span>
          )}
          <Pencil className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
      </button>

      {/* Like + comment row */}
      <div className="flex items-center gap-4 px-4 pb-3">
        <button onClick={e => { e.stopPropagation(); toggleLike(); }} className="flex items-center gap-1.5 text-xs transition-colors p-1 -m-1 rounded-lg">
          {isLiked
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
          <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>{likeCount > 0 ? likeCount : 'Like'}</span>
        </button>
        <button onClick={e => { e.stopPropagation(); setShowComments(true); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 rounded-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {comments.length > 0 ? comments.length : 'Comentar'}
        </button>
      </div>

      {showComments && <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />}
    </div>
  );
}

// ── Spot detail bottom sheet ──────────────────────────────────────────────────
function SpotDetailSheet({ spot, open, onClose, onSave, onDelete, tripId, tripCities, userId, onNotify }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(spot?.notes || '');
  const [assignedDate, setAssignedDate] = useState(spot?.assigned_date || '');
  const [assignedTime, setAssignedTime] = useState(spot?.assigned_time || '');
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isLiked, count: likeCount, toggle: toggleLike } = useLikeSimple(spot?.id, userId);
  const isReal = spot?.id && !String(spot?.id || '').startsWith('seed_');
  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot?.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    enabled: !!spot?.id && isReal,
    staleTime: 30000,
  });

  // Build trip day options from cities — must be before early return
  const tripDayOptions = useMemo(() => {
    const days = [];
    const sorted = [...(tripCities || [])].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
    sorted.forEach(c => {
      if (c.start_date && c.end_date) {
        let d = new Date(c.start_date);
        const end = new Date(c.end_date);
        while (d <= end) {
          days.push({ date: d.toISOString().slice(0, 10), city: c.name });
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return days;
  }, [tripCities]);

  const hasTripDays = tripDayOptions.length > 0;

  useEffect(() => {
    if (spot) {
      setNotes(spot.notes || '');
      setAssignedDate(spot.assigned_date || '');
      setAssignedTime(spot.assigned_time || '');
    }
  }, [spot?.id]);

  if (!open || !spot) return null;

  const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;

  const handleSave = async () => {
    setSaving(true);
    const timeChanged = assignedTime !== (spot?.assigned_time || '');
    try {
      await base44.entities.Spot.update(spot.id, {
        notes,
        assigned_date: assignedDate || null,
        assigned_time: assignedTime || null,
      });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
      if (timeChanged && assignedTime) onNotify?.('spot_time', `${spot.title}: hora cambiada a ${assignedTime}`, spot.title);
      onClose();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col" style={{ maxHeight: 'calc(85vh - 80px)' }} onClick={e => e.stopPropagation()}>
        {/* Handle + Header — fixed */}
        <div className="flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-4 mb-3" />
          <div className="flex items-start justify-between px-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${tc.color}`}>
                {tc.Icon && <tc.Icon size={14} />}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{spot.title}</p>
                <p className="text-xs text-muted-foreground">{tc.label}{spot.city_name ? ' · ' + spot.city_name : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Mi nota</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Cabinas individuales. Reservar para las 20h..."
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"
            />
          </div>

          {/* Day + Hour assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Día</p>
              {hasTripDays ? (
                <select
                  value={assignedDate}
                  onChange={e => setAssignedDate(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
                >
                  <option value="">Sin asignar</option>
                  {tripDayOptions.map(d => (
                    <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={assignedDate}
                  onChange={e => setAssignedDate(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
                />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Hora</p>
              <select
                value={assignedTime || ''}
                onChange={e => setAssignedTime(e.target.value)}
                className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary appearance-none"
              >
                <option value="">-- Sin hora --</option>
                {Array.from({ length: 24 * 4 }, (_, i) => {
                  const h = Math.floor(i / 4).toString().padStart(2, '0');
                  const m = ((i % 4) * 15).toString().padStart(2, '0');
                  const val = `${h}:${m}`;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Delete */}
          <button onClick={() => { onDelete(spot.id); onClose(); }}
            className="w-full text-xs text-red-500 hover:text-red-700 transition-colors py-2 text-center">
            Eliminar spot
          </button>
        </div>

        {/* Like / Comentar row */}
        <div className="flex-shrink-0 flex border-t border-border">
          <button
            onClick={e => { e.stopPropagation(); toggleLike(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors text-sm"
          >
            {isLiked
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
            <span className={isLiked ? 'text-primary' : 'text-muted-foreground'}>Like{likeCount > 0 ? ` · ${likeCount}` : ''}</span>
          </button>
          <div className="w-px bg-border" />
          {isReal && (
            <button
              onClick={e => { e.stopPropagation(); setShowComments(true); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors text-sm text-muted-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Comentar{comments.length > 0 ? ` · ${comments.length}` : ''}
            </button>
          )}
        </div>

        {/* Sticky footer buttons */}
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
    {showComments && isReal && <InlineCommentsPopup spot={spot} userId={userId} onClose={() => setShowComments(false)} />}
    </>
  );
}

// ── Assign date modal (shown after saving a spot) ─────────────────────────────
function AssignDateModal({ spot, tripCities = [], onAssign, onSkip, onUndo }) {
  const [selectedDate, setSelectedDate] = useState('');

  const tripDates = useMemo(() => {
    const dates = new Set();
    tripCities.forEach(c => {
      if (c.start_date && c.end_date) {
        let d = new Date(c.start_date);
        const end = new Date(c.end_date);
        while (d <= end) {
          dates.add(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return dates;
  }, [tripCities]);

  const minDate = tripCities.map(c => c.start_date).filter(Boolean).sort()[0] || '';
  const maxDate = tripCities.map(c => c.end_date).filter(Boolean).sort().reverse()[0] || '';
  const isAllowed = (date) => tripDates.size === 0 || tripDates.has(date);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]">
      <div className="bg-card w-full max-w-md rounded-t-3xl flex flex-col relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div className="p-5">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />

          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Saved confirmation */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">¡Guardado!</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{spot.title}</p>
            </div>
          </div>

          {/* Date picker — trip days only */}
          <p className="text-sm font-semibold text-foreground mb-2">¿Cuándo quieres visitar este spot?</p>
          {tripDates.size > 0 ? (
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
            >
              <option value="">Sin asignar</option>
              {(() => {
                const days = [];
                const sorted = [...tripCities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
                sorted.forEach(c => {
                  if (c.start_date && c.end_date) {
                    let d = new Date(c.start_date);
                    const end = new Date(c.end_date);
                    while (d <= end) {
                      days.push({ date: d.toISOString().slice(0, 10), city: c.name });
                      d.setDate(d.getDate() + 1);
                    }
                  }
                });
                return days.map(d => (
                  <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                ));
              })()}
            </select>
          ) : (
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
            />
          )}
        </div>

        {/* Buttons — always visible */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onUndo}
            className="flex-1 py-3 border border-border rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Deshacer
          </button>
          <button
            onClick={() => {
              if (selectedDate && isAllowed(selectedDate)) {
                onAssign(selectedDate);
              } else {
                onSkip();
              }
            }}
            className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-semibold transition-colors"
          >
            {selectedDate && isAllowed(selectedDate) ? 'Confirmar' : 'Ahora no'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ spot, city, onUndo, visible }) {
  if (!visible || !spot) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-foreground rounded-xl px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">Guardado{city ? ' en ' + city : ''}</p>
          <p className="text-white/60 text-xs truncate">{spot.title}</p>
        </div>
        <button onClick={onUndo} className="text-amber-400 text-xs font-medium flex-shrink-0">Deshacer</button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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
      <Toast spot={toast.spot} city={toast.city} visible={toast.visible} onUndo={undoSave} />
    </div>
  );
}