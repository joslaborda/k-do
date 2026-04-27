import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, CloudLightning, CloudDrizzle } from 'lucide-react';

const WMO_CONDITIONS = {
  0:  { label: 'Despejado',    icon: 'sun' },
  1:  { label: 'Casi despejado', icon: 'sun' },
  2:  { label: 'Parcialmente nublado', icon: 'cloud' },
  3:  { label: 'Nublado',      icon: 'cloud' },
  45: { label: 'Niebla',       icon: 'cloud' },
  48: { label: 'Niebla helada', icon: 'cloud' },
  51: { label: 'Llovizna',     icon: 'drizzle' },
  53: { label: 'Llovizna',     icon: 'drizzle' },
  55: { label: 'Llovizna intensa', icon: 'drizzle' },
  61: { label: 'Lluvia',       icon: 'rain' },
  63: { label: 'Lluvia',       icon: 'rain' },
  65: { label: 'Lluvia intensa', icon: 'rain' },
  71: { label: 'Nieve',        icon: 'snow' },
  73: { label: 'Nieve',        icon: 'snow' },
  75: { label: 'Nevada intensa', icon: 'snow' },
  80: { label: 'Chubascos',    icon: 'rain' },
  81: { label: 'Chubascos',    icon: 'rain' },
  82: { label: 'Chubascos fuertes', icon: 'rain' },
  95: { label: 'Tormenta',     icon: 'thunder' },
  96: { label: 'Tormenta con granizo', icon: 'thunder' },
  99: { label: 'Tormenta con granizo', icon: 'thunder' },
};

const ICONS = { sun: Sun, cloud: Cloud, rain: CloudRain, snow: CloudSnow, drizzle: CloudDrizzle, thunder: CloudLightning };
const GRADIENTS = {
  sun: 'from-amber-400/20 to-orange-400/20',
  cloud: 'from-slate-400/20 to-gray-400/20',
  rain: 'from-blue-400/20 to-indigo-400/20',
  snow: 'from-cyan-400/20 to-blue-400/20',
  drizzle: 'from-blue-300/20 to-slate-400/20',
  thunder: 'from-purple-400/20 to-gray-500/20',
};

async function geocode(cityName, country) {
  const q = encodeURIComponent([cityName, country].filter(Boolean).join(', '));
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=es&format=json`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error('geocode failed');
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) throw new Error('city not found');
  return { lat: r.latitude, lon: r.longitude, timezone: r.timezone || 'auto' };
}

async function fetchWeather(lat, lon, timezone) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone, forecast_days: 1,
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error('weather failed');
  return res.json();
}

export default function WeatherCard({ city, tripCountry }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const country = city.country || tripCountry || '';
  const cacheKey = `weather_v3:${city.name}:${country}`;

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { try { setWeather(JSON.parse(cached)); setLoading(false); return; } catch {} }
    setLoading(true); setError(false);
    const processWeather = (data) => {
      const code = data.current.weathercode;
      const cond = WMO_CONDITIONS[code] || { label: 'Variable', icon: 'cloud' };
      return {
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.apparent_temperature),
        condition: cond.label, icon: cond.icon,
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.windspeed_10m),
        temp_max: Math.round(data.daily.temperature_2m_max[0]),
        temp_min: Math.round(data.daily.temperature_2m_min[0]),
      };
    };

    // Try city name first, fallback to country name
    geocode(city.name, country)
      .catch(() => country ? geocode(country, '') : Promise.reject())
      .then(({ lat, lon, timezone }) => fetchWeather(lat, lon, timezone))
      .then(data => {
        const w = processWeather(data);
        setWeather(w);
        sessionStorage.setItem(cacheKey, JSON.stringify(w));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cacheKey]);

  if (loading) return (
    <div className="bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-border rounded-3xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-28 bg-white/30 rounded-lg" />
        <div className="h-16 w-16 bg-white/20 rounded-2xl" />
        <div className="h-10 w-20 bg-white/20 rounded" />
        <div className="grid grid-cols-2 gap-3"><div className="h-14 bg-white/20 rounded-xl" /><div className="h-14 bg-white/20 rounded-xl" /></div>
      </div>
    </div>
  );

  if (error || !weather) return (
    <div className="bg-gradient-to-br from-slate-400/10 to-gray-400/10 border border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-2 min-h-[180px]">
      <Cloud className="w-10 h-10 text-muted-foreground opacity-40" />
      <p className="text-sm text-muted-foreground text-center">{city.name}<br/>Clima no disponible</p>
    </div>
  );

  const WeatherIcon = ICONS[weather.icon] || Cloud;
  const gradient = GRADIENTS[weather.icon] || GRADIENTS.cloud;

  return (
    <div className={`bg-gradient-to-br ${gradient} border border-border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{city.name}</h3>
          {country && <p className="text-xs text-muted-foreground mt-0.5">{country}</p>}
        </div>
        <div className="px-3 py-1 bg-secondary/80 rounded-full border border-border">
          <span className="text-xs font-medium text-foreground capitalize">{weather.condition}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 bg-secondary/80 rounded-2xl flex items-center justify-center shadow-lg border border-border">
          <WeatherIcon className="w-12 h-12 text-primary" strokeWidth={2} />
        </div>
        <div>
          <div className="text-5xl font-bold text-foreground">{weather.temp}°</div>
          <div className="text-sm text-muted-foreground">Sensación {weather.feels_like}°</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">Mínima</div>
          <div className="text-xl font-bold text-blue-600">{weather.temp_min}°</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">Máxima</div>
          <div className="text-xl font-bold text-primary">{weather.temp_max}°</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3 border border-border">
          <Droplets className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Humedad</div><div className="font-semibold text-foreground">{weather.humidity}%</div></div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3 border border-border">
          <Wind className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Viento</div><div className="font-semibold text-foreground">{weather.wind} km/h</div></div>
        </div>
      </div>
    </div>
  );
}
