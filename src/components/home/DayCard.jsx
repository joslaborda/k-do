import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ChevronDown, ChevronUp, FileText, MapPin , CirclePlus, Thermometer } from 'lucide-react';
import PDFViewer from '@/components/PDFViewer';
import SpotDetailModal from '@/components/trip/SpotDetailModal';
import ItemDetailSheet from './ItemDetailSheet';
import { DOC_ICONS, SPOT_ICONS, SPOT_COLORS, WMO_ICON } from './constants';
import { useTranslation } from 'react-i18next';

export default function DayCard({ label, city, docs, spots, itineraryDays, tripId, defaultOpen, onReorderSpots, dateStr, onUpdateItemTime }) {
  const { t } = useTranslation();
  // holidaysDB son ~120 KB: se cargan solo si hay ciudad y fecha.
  const [holidays, setHolidays] = useState([]);
  useEffect(() => {
    let cancelled = false;
    if (!city?.country || !dateStr) { setHolidays([]); return; }
    import('@/lib/holidaysDB')
      .then(({ getHolidaysForDate }) => {
        if (!cancelled) setHolidays(getHolidaysForDate(city.country, dateStr, city.name) || []);
      })
      .catch(() => { if (!cancelled) setHolidays([]); });
    return () => { cancelled = true; };
  }, [city?.country, dateStr, city?.name]);
  const [open, setOpen]         = useState(defaultOpen);
  const [viewFile, setViewFile] = useState(null);
  const [selected, setSelected] = useState(null);
  const [, setTick] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const isToday_ = defaultOpen;
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!isToday_ || !city?.name) return;
    const key = 'mini_wx:' + city.name;
    const hit = sessionStorage.getItem(key);
    if (hit) { try { setWeather(JSON.parse(hit)); return; } catch {} }
    (async () => {
      try {
        const geo = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city.name) + '&count=1&language=es&format=json').then(r => r.json());
        const loc = geo.results?.[0];
        if (!loc) return;
        const wx = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude + '&current=temperature_2m,weathercode&timezone=' + encodeURIComponent(loc.timezone || 'auto') + '&forecast_days=1').then(r => r.json());
        const result = { temp: Math.round(wx.current.temperature_2m), code: wx.current.weathercode };
        setWeather(result);
        sessionStorage.setItem(key, JSON.stringify(result));
      } catch {}
    })();
  }, [isToday_, city?.name]);

  const hasItinerary = itineraryDays?.some(d => d.city_id === city?.id);

  const timeline = useMemo(() => {
    const docItems  = docs.map(d  => ({ ...d, _kind: 'doc',  time: d.time || null, type: d.category || d.type || 'other' }));
    const spotItems = spots.map(s => ({ ...s, _kind: 'spot', time: s.assigned_time || s.time || null }));
    const parseNotes = (raw) => {
      if (!raw) return [];
      try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
      return raw.trim() ? [{ text: raw, time: '' }] : [];
    };
    const dayNotes = (itineraryDays || [])
      .filter(d => d.city_id === city?.id && d.date === dateStr && d.content?.trim())
      .flatMap(d => parseNotes(d.content).filter(n => n.text?.trim()).map((n, i) => ({
        id: d.id + '-' + i, _kind: 'note',
        title: n.text.length > 50 ? n.text.slice(0, 50) + '…' : n.text,
        content: n.text, time: n.time || null, type: 'note',
      })));
    const all = [...docItems, ...spotItems, ...dayNotes];
    const withTime    = all.filter(i => i.time).sort((a, b) => a.time.localeCompare(b.time));
    const withoutTime = all.filter(i => !i.time);
    return [...withTime, ...withoutTime];
  }, [docs, spots, itineraryDays, city?.id, dateStr]);

  const hasContent = timeline.length > 0;

  const handleSaveTime = async (item, time) => {
    if (onUpdateItemTime) await onUpdateItemTime(item, time);
    setSelected(prev => prev ? { ...prev, time } : null);
  };

  return (
    <div className={`bg-card rounded-2xl border overflow-hidden ${isToday_ ? 'border-orange-200' : 'border-border'}`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isToday_ ? 'bg-orange-50 hover:bg-orange-100/50' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-medium uppercase tracking-wider shrink-0 ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          <span className="text-sm font-medium text-foreground truncate">{city?.name}</span>
          {dateStr && <span className="text-xs text-muted-foreground shrink-0">{format(parseISO(dateStr), 'dd MMM', { locale: es })}</span>}
          {hasContent && <span className="text-xs text-muted-foreground shrink-0">· {timeline.length}</span>}
        </div>
        {isToday_ && weather && (
          <span className="inline-flex items-center gap-1 shrink-0 mr-1">{(() => { const I = WMO_ICON[weather.code] || Thermometer; return <I className="w-3.5 h-3.5 text-muted-foreground" />; })()}<span className="text-xs font-medium text-foreground">{weather.temp}°</span></span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {(() => {
        if (!holidays.length) return null;
        return (
          <div className="border-t border-amber-200/60 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-2 flex flex-col gap-1">
            {holidays.map((h, i) => (
              <p key={i} className="text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="font-medium">{h.name}</span>
                {h.note && <span className="text-amber-600 dark:text-amber-500 opacity-80">· {h.note}</span>}
              </p>
            ))}
          </div>
        );
      })()}

      {open && (
        <div>
          {hasContent ? (
            timeline.map((item, idx) => {
              const isDoc   = item._kind === 'doc';
              const isNote  = item._kind === 'note';
              const DocIcon = isDoc ? (DOC_ICONS[item.category] || DOC_ICONS[item.type] || DOC_ICONS.other) : null;
              const SpotIcon = (!isDoc && !isNote) ? (SPOT_ICONS[item.type] || CirclePlus) : null;
              const spotColor = (!isDoc && !isNote) ? (SPOT_COLORS[item.type] || SPOT_COLORS.custom) : '';
              const isLast  = idx === timeline.length - 1;
              const hasTime = !!item.time;

              return (
                <button key={item.id || idx} onClick={() => setSelected(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-t border-border transition-colors text-left ${
                    isDoc && item.time && ['flight','train','bus'].includes(item.category || item.type) && (() => {
                      const now = new Date();
                      const [h, m] = item.time.split(':').map(Number);
                      const dep = new Date(now); dep.setHours(h, m, 0, 0);
                      const diffMin = Math.round((dep - now) / 60000);
                      if (diffMin <= 0 || diffMin > 240) return false;
                      return diffMin <= 60 ? 'bg-red-50 hover:bg-red-50' : 'bg-orange-50/60 hover:bg-orange-50/80';
                    })() || 'hover:bg-secondary/20'
                  }`}>
                  <div className="w-11 shrink-0 flex flex-col items-center self-stretch justify-start pt-0.5">
                    {hasTime
                      ? <span className="text-label2 font-medium text-primary leading-none whitespace-nowrap">{item.time}</span>
                      : <div className="w-2 h-2 rounded-full bg-border mt-1" />}
                    {!isLast && <div className="w-px flex-1 bg-border/60 mt-1.5" />}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDoc ? 'bg-orange-50 dark:bg-orange-950/30' : isNote ? 'bg-secondary' : spotColor || 'bg-secondary'}`}>
                    {isDoc && DocIcon ? <DocIcon size={16} stroke="currentColor" className="text-primary" />
                      : isNote ? <FileText size={16} className="text-muted-foreground" />
                      : SpotIcon ? <SpotIcon size={16} /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title || item.name || 'Sin título'}</p>
                    {!isDoc && !isNote && item.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.notes}</p>}
                    {isNote && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.content}</p>}
                    {isDoc && !hasTime && <p className="text-xs text-muted-foreground mt-0.5">{t('home.dayCard.noTime')}</p>}
                    {isDoc && item.time && ['flight','train','bus'].includes(item.category || item.type) && (() => {
                      const now = new Date();
                      const [h, m] = item.time.split(':').map(Number);
                      const dep = new Date(now); dep.setHours(h, m, 0, 0);
                      const diffMin = Math.round((dep - now) / 60000);
                      if (diffMin <= 0 || diffMin > 240) return null;
                      const hrs = Math.floor(diffMin / 60);
                      const mins = diffMin % 60;
                      const lbl = hrs > 0 ? `Sale en ${hrs}h${mins > 0 ? ` ${mins}min` : ''}` : `Sale en ${diffMin} min`;
                      return <p className="text-xs font-semibold mt-0.5" style={{color: diffMin <= 60 ? '#dc2626' : 'hsl(var(--primary))'}}>{lbl}</p>;
                    })()}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              );
            })
          ) : (
            <Link to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
              className="flex items-center gap-3 px-4 py-4 border-t border-border hover:bg-secondary/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0"><MapPin size={16} className="text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Explorar spots en {city?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('home.dayCard.addPlaces')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          )}
          <Link to={createPageUrl('CityDetail') + '?id=' + city?.id + '&trip_id=' + tripId}
            className="flex items-center justify-between px-4 py-3 border-t border-border hover:bg-secondary/20 transition-colors">
            <span className="text-xs font-medium text-primary">{hasItinerary ? `Ver itinerario de ${city?.name}` : `Abrir ${city?.name}`}</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      )}

      {viewFile && <PDFViewer fileUrl={viewFile} onClose={() => setViewFile(null)} />}
      {selected && selected._kind !== 'spot' && (
        <ItemDetailSheet item={selected} onClose={() => setSelected(null)} onSaveTime={handleSaveTime} onOpenPdf={(url) => setViewFile(url)} />
      )}
      {selected && selected._kind === 'spot' && (
        <SpotDetailModal spot={selected} open={true} onClose={() => setSelected(null)} queryClient={queryClient} tripId={tripId} />
      )}
    </div>
  );
}
