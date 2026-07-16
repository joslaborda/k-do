import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Códigos WMO → clave i18n + icono Lucide. El campo `icon` ya existía en el
// código pero no se usaba: ahora es la fuente del icono (antes se pintaba emoji).
import { Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

// nombre corto → componente Lucide
const WMO_ICON = {
  sun: Sun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle,
  rain: CloudRain, snow: CloudSnow, thunder: CloudLightning,
};

const WMO_CONDITIONS = {
  0:  { tk:'weather.wmo.clear',        icon:'sun'     },
  1:  { tk:'weather.wmo.mostlyClear',  icon:'sun'     },
  2:  { tk:'weather.wmo.partlyCloudy', icon:'cloud'   },
  3:  { tk:'weather.wmo.cloudy',       icon:'cloud'   },
  45: { tk:'weather.wmo.fog',          icon:'fog'     },
  48: { tk:'weather.wmo.freezingFog',  icon:'fog'     },
  51: { tk:'weather.wmo.drizzle',      icon:'drizzle' },
  53: { tk:'weather.wmo.drizzle',      icon:'drizzle' },
  55: { tk:'weather.wmo.heavyDrizzle', icon:'rain'    },
  61: { tk:'weather.wmo.rain',         icon:'rain'    },
  63: { tk:'weather.wmo.rain',         icon:'rain'    },
  65: { tk:'weather.wmo.heavyRain',    icon:'rain'    },
  71: { tk:'weather.wmo.snow',         icon:'snow'    },
  73: { tk:'weather.wmo.snow',         icon:'snow'    },
  75: { tk:'weather.wmo.heavySnow',    icon:'snow'    },
  80: { tk:'weather.wmo.showers',      icon:'rain'    },
  81: { tk:'weather.wmo.showers',      icon:'rain'    },
  82: { tk:'weather.wmo.heavyShowers', icon:'thunder' },
  95: { tk:'weather.wmo.storm',        icon:'thunder' },
  96: { tk:'weather.wmo.hail',         icon:'thunder' },
  99: { tk:'weather.wmo.stormHail',    icon:'thunder' },
};

// Días y meses vienen de Intl según el idioma activo (antes eran tablas en español)
function fmtDate(dateStr, lang = 'es') {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
}
function fmtDay(dateStr, lang = 'es') {
  const d = new Date(dateStr + 'T12:00:00');
  const s = d.toLocaleDateString(lang, { weekday: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
}
function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

async function geocode(cityName, country) {
  const q = encodeURIComponent([cityName, country].filter(Boolean).join(', '));
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=es&format=json`,
    { signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) throw new Error('geocode failed');
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) throw new Error('city not found');
  return { lat: r.latitude, lon: r.longitude, timezone: r.timezone || 'auto' };
}

async function fetchWeather(lat, lon, timezone) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m,uv_index',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max',
    hourly: 'temperature_2m,weathercode',
    timezone,
    forecast_days: 6,
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error('weather failed');
  return res.json();
}

function processWeather(data) {
  const code = data.current.weathercode;
  const cond = WMO_CONDITIONS[code] || { tk:'weather.wmo.variable', icon:'cloud' };

  // Daily forecast (5 days)
  const daily = (data.daily.time || []).slice(0, 5).map((date, i) => {
    const dc = data.daily.weathercode[i];
    const dcond = WMO_CONDITIONS[dc] || { tk:'weather.wmo.variable', icon:'cloud' };
    return {
      date,
      icon: dcond.icon,
      tk: dcond.tk,
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      rain: data.daily.precipitation_probability_max?.[i] ?? 0,
    };
  });

  // Hourly for today (6h, 9h, 12h, 15h, 18h, 21h)
  const todayStr = new Date().toISOString().slice(0, 10);
  const hourlyTimes = data.hourly.time || [];
  const wantedHours = [6, 9, 12, 15, 18, 21];
  const hourly = wantedHours.map(h => {
    const idx = hourlyTimes.findIndex(t => t === `${todayStr}T${String(h).padStart(2,'0')}:00`);
    const hc = idx >= 0 ? data.hourly.weathercode[idx] : code;
    const hcond = WMO_CONDITIONS[hc] || cond;
    return {
      hour: h,
      temp: idx >= 0 ? Math.round(data.hourly.temperature_2m[idx]) : Math.round(data.current.temperature_2m),
      icon: hcond.icon,
    };
  });

  return {
    temp: Math.round(data.current.temperature_2m),
    feels_like: Math.round(data.current.apparent_temperature),
    conditionTk: cond.tk,
    icon: cond.icon,
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.windspeed_10m),
    uv: data.current.uv_index ? Math.round(data.current.uv_index) : null,
    daily,
    hourly,
  };
}

export default function WeatherCard({ city, tripCountry, showCityName = false }) {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // index into daily

  const country = city.country || tripCountry || '';
  const cacheKey = `weather_v5:${city.name}:${country}`;

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setWeather(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    setLoading(true); setError(false);
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
    <div className="bg-card rounded-2xl border border-border p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-24 bg-secondary rounded-lg" />
        <div className="h-9 w-12 bg-secondary rounded-lg" />
      </div>
      <div className="h-3 w-32 bg-secondary rounded" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <div key={i} className="flex-1 h-16 bg-secondary rounded-lg" />)}
      </div>
    </div>
  );

  if (error || !weather) return (
    <div className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
      <Cloud className="w-8 h-8 text-border" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground text-center">{city.name}<br/>{t('weather.unavailable')}</p>
    </div>
  );

  const sel = weather.daily[selectedDay];
  const selIsToday = sel && isToday(sel.date);

  // UV label
  const uvLabel = weather.uv != null
    ? weather.uv <= 2 ? 'Bajo' : weather.uv <= 5 ? 'Moderado' : weather.uv <= 7 ? 'Alto' : 'Muy alto'
    : null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 py-3.5 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className={showCityName ? "text-base font-semibold text-foreground" : "text-sm font-medium text-foreground"}>{city.name || city}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t(weather.conditionTk)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-medium text-foreground leading-none">{weather.temp}°</span>
              {(() => { const I = WMO_ICON[weather.icon] || Cloud; return <I className="w-6 h-6 text-primary" strokeWidth={1.5} />; })()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('weather.feelsLike', { temp: weather.feels_like })}</p>
          </div>
        </div>
      </div>

      {/* ── 5-day strip ── */}
      <div className="flex gap-2 px-3 py-2.5 border-b border-border">
        {weather.daily.map((day, i) => {
          const todayDay = isToday(day.date);
          const isSelected = selectedDay === i;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-colors ${
                isSelected
                  ? 'bg-orange-50 border-primary'
                  : 'bg-secondary/40 border-transparent hover:border-border'
              }`}
            >
              <span className={`text-xs font-medium leading-none ${isSelected ? 'text-primary' : todayDay ? 'text-primary' : 'text-muted-foreground'}`}>
                {todayDay ? t('cities.day.today') : fmtDay(day.date, i18n.language)}
              </span>
              <span className={`text-xs leading-none ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                {fmtDate(day.date, i18n.language)}
              </span>
              {(() => { const I = WMO_ICON[day.icon] || Cloud; return <I className="w-4 h-4 my-0.5 text-muted-foreground" strokeWidth={1.5} />; })()}
              <span className={`text-xs font-medium leading-none ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {day.max}°
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Day detail — expands on tap ── */}
      {sel && (
        <div className="px-3 py-3 border-b border-border bg-secondary/20">
          <p className="text-xs font-medium text-foreground mb-2.5">
            {selIsToday ? 'Hoy' : fmtDay(sel.date)}, {fmtDate(sel.date)}
            {sel.label ? ` · ${sel.label}` : ''}
          </p>

          {/* Max / Min / Rain */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('weather.max')}</p>
              <p className="text-base font-medium text-primary">{sel.max}°</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('weather.min')}</p>
              <p className="text-base font-medium text-foreground">{sel.min}°</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('weather.rain')}</p>
              <p className="text-base font-medium text-foreground">{sel.rain}%</p>
            </div>
          </div>

          {/* Humidity / Wind / UV */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">{t('weather.humidity')}</p>
              <p className="text-sm font-medium text-foreground">{weather.humidity}%</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">{t('weather.wind')}</p>
              <p className="text-sm font-medium text-foreground">{weather.wind} km/h</p>
            </div>
            {uvLabel && (
              <div className="bg-card border border-border rounded-xl p-2 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">UV</p>
                <p className="text-sm font-medium text-foreground">{weather.uv} <span className="text-xs font-normal text-muted-foreground">{uvLabel}</span></p>
              </div>
            )}
          </div>

          {/* Hourly — only for today */}
          {selIsToday && weather.hourly.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Por hora</p>
              <div className="flex gap-1.5">
                {weather.hourly.map(h => (
                  <div key={h.hour} className="flex-1 text-center bg-card border border-border rounded-lg py-1.5">
                    <p className="text-xs text-muted-foreground mb-1">{h.hour}h</p>
                    {(() => { const I = WMO_ICON[h.icon] || Cloud; return <I className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />; })()}
                    <p className="text-xs font-medium text-foreground">{h.temp}°</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
