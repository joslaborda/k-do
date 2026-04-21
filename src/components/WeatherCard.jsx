import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from 'lucide-react';

const weatherIcons = {
  soleado: Sun, sol: Sun, despejado: Sun, sunny: Sun, clear: Sun,
  nublado: Cloud, nubes: Cloud, cloudy: Cloud, overcast: Cloud,
  lluvia: CloudRain, lluvioso: CloudRain, rain: CloudRain, rainy: CloudRain,
  nieve: CloudSnow, nevado: CloudSnow, snow: CloudSnow,
};

export default function WeatherCard({ city, tripCountry }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const country = city.country || tripCountry || '';
  const location = [city.name, country].filter(Boolean).join(', ');
  const cacheKey = `weather:${city.name}:${country}`;

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setWeather(JSON.parse(cached)); setLoading(false); return; } catch {}
    }

    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Dame el clima actual y pronóstico de HOY en ${location}. Devuelve SOLO estos datos en JSON:
- temp: temperatura actual en °C (número)
- condition: una palabra simple en español (soleado, nublado, lluvia, nieve, etc)
- feels_like: sensación térmica en °C
- temp_max: temperatura máxima de HOY en °C
- temp_min: temperatura mínima de HOY en °C
- humidity: humedad en %
- wind: viento en km/h`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          temp: { type: 'number' },
          condition: { type: 'string' },
          feels_like: { type: 'number' },
          temp_max: { type: 'number' },
          temp_min: { type: 'number' },
          humidity: { type: 'number' },
          wind: { type: 'number' },
        },
      },
    }).then((r) => {
      setWeather(r);
      sessionStorage.setItem(cacheKey, JSON.stringify(r));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [cacheKey]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-border rounded-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-28 bg-white/30 rounded-lg" />
          <div className="h-16 w-16 bg-white/20 rounded-2xl" />
          <div className="h-10 w-20 bg-white/20 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-white/20 rounded-xl" />
            <div className="h-14 bg-white/20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = Object.entries(weatherIcons).find(([key]) =>
    weather.condition?.toLowerCase().includes(key)
  )?.[1] || Cloud;

  const gradient = (() => {
    const c = weather.condition?.toLowerCase() || '';
    if (c.includes('sol') || c.includes('despej') || c.includes('clear')) return 'from-amber-400/20 to-orange-400/20';
    if (c.includes('lluv') || c.includes('rain')) return 'from-blue-400/20 to-indigo-400/20';
    if (c.includes('niev') || c.includes('snow')) return 'from-cyan-400/20 to-blue-400/20';
    return 'from-slate-400/20 to-gray-400/20';
  })();

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
          <div className="text-5xl font-bold text-foreground">{Math.round(weather.temp)}°</div>
          <div className="text-sm text-muted-foreground">Sensación {Math.round(weather.feels_like)}°</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">Mínima</div>
          <div className="text-xl font-bold text-blue-600">{Math.round(weather.temp_min)}°</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">Máxima</div>
          <div className="text-xl font-bold text-primary">{Math.round(weather.temp_max)}°</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3 border border-border">
          <Droplets className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Humedad</div>
            <div className="font-semibold text-foreground">{weather.humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3 border border-border">
          <Wind className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Viento</div>
            <div className="font-semibold text-foreground">{weather.wind} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}