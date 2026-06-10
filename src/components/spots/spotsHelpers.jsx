import { CirclePlus, Compass, Landmark, ShoppingBag, Ticket, Utensils } from 'lucide-react';
// ── OSM helpers ───────────────────────────────────────────────────────────────
export const OSM_MAP = {
  restaurant:'food', cafe:'food', bar:'food', fast_food:'food', pub:'food', bakery:'food',
  museum:'sight', monument:'sight', attraction:'sight', viewpoint:'sight', temple:'sight',
  church:'sight', shrine:'sight', castle:'sight', gallery:'sight', park:'sight',
  shop:'shopping', mall:'shopping', market:'shopping',
  bus_station:'transport', train_station:'transport', subway_entrance:'transport',
  sports_centre:'activity', cinema:'activity', theatre:'activity',
};
export function osmToType(type, cls) { return OSM_MAP[type] || OSM_MAP[cls] || 'sight'; }

export async function searchPlaces(query, city, country, signal) {
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

export async function nearbyPlaces(lat, lng, filterCats = null) {
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
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, signal: ctrl.signal });
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
    results.push({ id: el.id?.toString(), name, address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || '', lat: el.lat, lng: el.lon, dist, type: osmToType(amenity, amenity) });
  });
  results.sort((a, b) => a.dist - b.dist);
  if (results.length === 0) throw new Error('no results nearby');
  return results.slice(0, 20);
}

export async function reverseGeocode(lat, lng) {
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

export async function loadLeaflet() {
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

export const TYPE_CONFIG = {
  food:      { label:'Comer',      Icon: Utensils,    color:'bg-orange-100 text-primary' },
  sight:     { label:'Cultura',    Icon: Landmark,    color:'bg-violet-100 text-violet-600' },
  activity:  { label:'Actividad',  Icon: Ticket,      color:'bg-green-100 text-green-600' },
  shopping:  { label:'Compras',    Icon: ShoppingBag, color:'bg-blue-100 text-blue-600' },
  transport: { label:'Transporte', Icon: Compass,     color:'bg-secondary0 text-muted-foreground' },
  custom:    { label:'Otro',       Icon: CirclePlus,  color:'bg-secondary text-muted-foreground' },
};

// ── Recent searches (localStorage) ───────────────────────────────────────────
const RECENT_SEARCHES_KEY = 'kodo_recent_searches';
export function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); } catch { return []; }
}
export function addRecentSearch(query) {
  const searches = getRecentSearches().filter(s => s.query !== query);
  searches.unshift({ query, date: new Date().toISOString() });
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 8)));
}
export function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ── Country-specific special tags ─────────────────────────────────────────────
export const COUNTRY_SPECIAL_TAGS = {
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
  'Colombia': ['#café', '#cartajena', '#naturaleza', '#salsa', '#flores', '#aventura'],
};

// ── Dynamic hashtags from existing spots ──────────────────────────────────────
export function buildHashtags(spots, tripCities) {
  const typeTags = {
    food: '#gastronomía', sight: '#cultura', activity: '#actividades',
    shopping: '#compras', custom: '#otros',
  };
  const tags = new Set();
  const countries = [...new Set(tripCities.map(c => c.country).filter(Boolean))];
  countries.forEach(country => {
    (COUNTRY_SPECIAL_TAGS[country] || []).forEach(t => tags.add(t));
  });
  spots.forEach(s => { if (typeTags[s.type]) tags.add(typeTags[s.type]); });
  return [...tags].slice(0, 12);
}
