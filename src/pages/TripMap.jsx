import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { differenceInDays } from 'date-fns';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Known city coordinates (expandable for future use)
const CITY_COORDS = {
  'osaka': [34.6937, 135.5023],
  'kyoto': [35.0116, 135.7681],
  'tokyo': [35.6762, 139.6503],
  'hiroshima': [34.3853, 132.4553],
  'hakone': [35.2323, 139.1070],
  'nara': [34.6851, 135.8048],
  'kobe': [34.6901, 135.1956],
  'sapporo': [43.0618, 141.3545],
  'fukuoka': [33.5904, 130.4017],
  'nikko': [36.7199, 139.6983],
  'kanazawa': [36.5613, 136.6562],
  'nagoya': [35.1815, 136.9066],
  'nagasaki': [32.7503, 129.8777],
  'sendai': [38.2688, 140.8721],
  'yokohama': [35.4437, 139.6380],
  // Europe
  'paris': [48.8566, 2.3522],
  'rome': [41.9028, 12.4964],
  'barcelona': [41.3851, 2.1734],
  'madrid': [40.4168, -3.7038],
  'amsterdam': [52.3676, 4.9041],
  'berlin': [52.5200, 13.4050],
  'london': [51.5074, -0.1278],
  'prague': [50.0755, 14.4378],
  'vienna': [48.2082, 16.3738],
  'lisbon': [38.7169, -9.1399],
  // Asia
  'bangkok': [13.7563, 100.5018],
  'seoul': [37.5665, 126.9780],
  'singapore': [1.3521, 103.8198],
  'hong kong': [22.3193, 114.1694],
  'beijing': [39.9042, 116.4074],
  'shanghai': [31.2304, 121.4737],
  'bali': [-8.3405, 115.0920],
  'hanoi': [21.0285, 105.8542],
  'ho chi minh': [10.8231, 106.6297],
  'dubai': [25.2048, 55.2708],
  'istanbul': [41.0082, 28.9784],
  // Americas
  'new york': [40.7128, -74.0060],
  'los angeles': [34.0522, -118.2437],
  'miami': [25.7617, -80.1918],
  'cancun': [21.1619, -86.8515],
  'rio de janeiro': [-22.9068, -43.1729],
  'buenos aires': [-34.6037, -58.3816],
  'mexico city': [19.4326, -99.1332],
  // Others
  'sydney': [-33.8688, 151.2093],
  'cairo': [30.0444, 31.2357],
  'marrakech': [31.6295, -7.9811],
};

function getCityCoords(cityName) {
  if (!cityName) return null;
  const key = cityName.toLowerCase().trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// Custom numbered marker
function createNumberedIcon(number) {
  return L.divIcon({
    html: `<div style="
      background: #c2410c;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "><span style="transform: rotate(45deg)">${number}</span></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

// Component to auto-fit bounds
function FitBounds({ positions }) {
  const map = useMap();
  useMemo(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [positions.join(',')]);
  return null;
}

export default function TripMap() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId,
  });

  // Sort cities chronologically, fallback to order field
  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [cities]);

  // Cities with known coords
  const mappedCities = useMemo(() => {
    return sortedCities
      .map(c => ({ ...c, coords: getCityCoords(c.name) }))
      .filter(c => c.coords !== null);
  }, [sortedCities]);

  const positions = mappedCities.map(c => c.coords);

  const getDayCount = (city) => {
    if (!city.start_date || !city.end_date) return null;
    return differenceInDays(new Date(city.end_date), new Date(city.start_date)) + 1;
  };

  const formatDate = (d) => d ? format(new Date(d), 'dd MMM', { locale: es }) : null;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Mapa 🗺️</h1>
          <p className="text-white/90 mt-2">Ruta visual del itinerario</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-10">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-border h-96 animate-pulse" />
        ) : sortedCities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Sin ruta definida</h3>
            <p className="text-muted-foreground">
              Añade ciudades a tu ruta para ver el mapa del viaje.
            </p>
            <Link
              to={createPageUrl(`Cities?trip_id=${tripId}`)}
              className="inline-block mt-6 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Ir a Ruta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Route summary pills */}
            <div className="bg-white rounded-2xl border border-border px-5 py-4 flex flex-wrap items-center gap-2 text-sm">
              {sortedCities.map((city, i) => (
                <span key={city.id} className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                    getCityCoords(city.name)
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {city.name}
                  </span>
                  {i < sortedCities.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </span>
              ))}
              {mappedCities.length < sortedCities.length && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({sortedCities.length - mappedCities.length} ciudad(es) sin coordenadas conocidas)
                </span>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ height: '520px' }}>
              {mappedCities.length > 0 ? (
                <MapContainer
                  center={positions[0] || [35.6762, 139.6503]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <FitBounds positions={positions} />

                  {/* Route line */}
                  {positions.length > 1 && (
                    <Polyline
                      positions={positions}
                      pathOptions={{ color: '#c2410c', weight: 3, opacity: 0.8, dashArray: '8 6' }}
                    />
                  )}

                  {/* City markers */}
                  {mappedCities.map((city, i) => (
                    <Marker
                      key={city.id}
                      position={city.coords}
                      icon={createNumberedIcon(i + 1)}
                    >
                      <Popup className="trip-map-popup">
                        <div className="p-1 min-w-[160px]">
                          <h3 className="font-bold text-base text-gray-900 mb-1">
                            {i + 1}. {city.name}
                          </h3>
                          {(city.start_date || city.end_date) && (
                            <p className="text-sm text-gray-600">
                              📅 {formatDate(city.start_date)}
                              {city.end_date && ` – ${formatDate(city.end_date)}`}
                            </p>
                          )}
                          {getDayCount(city) && (
                            <p className="text-sm text-orange-700 font-medium mt-1">
                              {getDayCount(city)} día{getDayCount(city) > 1 ? 's' : ''}
                            </p>
                          )}
                          <Link
                            to={createPageUrl(`CityDetail?city_id=${city.id}&trip_id=${tripId}`)}
                            className="block mt-2 text-xs text-orange-600 hover:text-orange-800 font-medium underline"
                          >
                            Ver itinerario →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">No se encontraron coordenadas para las ciudades</p>
                  </div>
                </div>
              )}
            </div>

            {/* City detail cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedCities.map((city, i) => {
                const days = getDayCount(city);
                return (
                  <Link
                    key={city.id}
                    to={createPageUrl(`CityDetail?city_id=${city.id}&trip_id=${tripId}`)}
                    className="bg-white rounded-xl border border-border p-4 hover:border-orange-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-orange-700 transition-colors truncate">
                        {city.name}
                      </h4>
                    </div>
                    {(city.start_date || city.end_date) && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(city.start_date)}
                        {city.end_date && ` – ${formatDate(city.end_date)}`}
                      </p>
                    )}
                    {days && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {days} día{days > 1 ? 's' : ''}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}