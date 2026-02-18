import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Eye } from 'lucide-react';

const weatherIcons = {
  soleado: Sun,
  sol: Sun,
  despejado: Sun,
  nublado: Cloud,
  nubes: Cloud,
  lluvia: CloudRain,
  lluvioso: CloudRain,
  nieve: CloudSnow,
  nevado: CloudSnow,
};

export default function WeatherCard({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Dame el clima actual y pronóstico de HOY en ${city.name}, Japón. Devuelve SOLO estos datos:
- Temperatura actual en °C (solo el número)
- Condición: una palabra simple (soleado, nublado, lluvia, etc)
- Sensación térmica en °C
- Temperatura máxima de HOY en °C
- Temperatura mínima de HOY en °C
- Humedad en %
- Viento en km/h`,
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
              wind: { type: 'number' }
            }
          }
        });
        setWeather(response);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city.name]);

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-400/20 to-cyan-400/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-24 bg-white/20 rounded-lg" />
          <div className="h-16 w-16 bg-white/20 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-3/4" />
            <div className="h-4 bg-white/20 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  // Find matching icon
  const WeatherIcon = Object.entries(weatherIcons).find(([key]) => 
    weather.condition?.toLowerCase().includes(key)
  )?.[1] || Cloud;

  const getWeatherGradient = () => {
    const condition = weather.condition?.toLowerCase() || '';
    if (condition.includes('sol') || condition.includes('despej')) {
      return 'from-amber-400/20 to-orange-400/20';
    }
    if (condition.includes('lluv')) {
      return 'from-blue-400/20 to-indigo-400/20';
    }
    if (condition.includes('niev')) {
      return 'from-cyan-400/20 to-blue-400/20';
    }
    return 'from-slate-400/20 to-gray-400/20';
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getWeatherGradient()} backdrop-blur-xl border border-border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      {/* City name */}
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">{city.name}</h3>
        <div className="px-3 py-1 bg-secondary/80 backdrop-blur rounded-full border border-border">
          <span className="text-xs font-medium text-foreground capitalize">
            {weather.condition}
          </span>
        </div>
      </div>

      {/* Main temp */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 bg-secondary/80 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg border border-border">
          <WeatherIcon className="w-12 h-12 text-primary" strokeWidth={2} />
        </div>
        <div>
          <div className="text-5xl font-bold text-foreground">
            {Math.round(weather.temp)}°
          </div>
          <div className="text-sm text-muted-foreground">
            Sensación {Math.round(weather.feels_like)}°
          </div>
        </div>
      </div>

      {/* Max/Min */}
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

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-secondary/60 backdrop-blur rounded-xl p-3 border border-border">
          <Droplets className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Humedad</div>
            <div className="font-semibold text-foreground">{weather.humidity}%</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary/60 backdrop-blur rounded-xl p-3 border border-border">
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