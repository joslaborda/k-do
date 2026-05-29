import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CountryInput from '@/components/trip/CountryInput';
import PDFViewer from '@/components/PDFViewer';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlobalSearch from '@/components/GlobalSearch';
import { format, differenceInDays, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MapPin, Calendar, Users, Settings, Trash2,
  ArrowRight, Bell, ChevronDown, ChevronUp,
  Send, UserPlus, Check, X, GripVertical, Clock
, MessageCircle , Download } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DeleteTripModal from '@/components/trip/DeleteTripModal';
import TripAlerts from '@/components/trip/TripAlerts';
import { COUNTRY_REQUIREMENTS } from '@/lib/packingDB';
import { getHolidaysForDate, getHolidaysInRange } from '@/lib/holidaysDB';
import { PlaneIcon, BusFront, TrainFront, Car, Hotel, Shield, Ticket, FileText, Image, Cross, Camera, Wifi, DollarSign, AlertTriangle, Star } from '@/lib/icons';
import { getVisaInfo } from '@/lib/visaMatrix';
import { getCountryMeta, normalizeCountry } from '@/lib/countryConfig';

function OTabBar({ tabs, activeKey, onChange, urgentCount = 0 }) {
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

      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-2.5 pb-2.5 gap-0"
          >
            {/* Ō line — sits tight above the label */}
            <div style={{
              height: 3, borderRadius: 2,
              background: isOn ? '#c2410c' : 'transparent',
              width: isOn ? lineStyle.width : 0,
              marginBottom: 6,
              transition: mounted ? 'width 0.2s cubic-bezier(.4,0,.2,1)' : 'none',
            }} />
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? 'var(--kodo-nav-active-text)' : 'var(--kodo-nav-inactive)',
                transition: 'color 0.2s',
                lineHeight: 1,
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: '#c2410c', color: 'white',
                  fontSize: 10, fontWeight: 500, borderRadius: 10,
                  padding: '1px 5px',
                }}>{tab.badge}</span>
              )}
              {tab.key === 'hoy' && urgentCount > 0 && !isOn && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#c2410c', display: 'inline-block', flexShrink: 0,
                }} />
              )}

            </span>
          </button>
        );
      })}
    </div>
  );
}


// ── Constants ─────────────────────────────────────────────────────────────────
// PreTripTab requirement group icons — Lucide components
const REQ_ICON_MAP = {
  visa:    (p) => <Shield size={14} {...p} />,
  vaccine: (p) => <Cross size={14} {...p} />,
  tech:    (p) => <Wifi size={14} {...p} />,
  money:   (p) => <DollarSign size={14} {...p} />,
  safety:  (p) => <AlertTriangle size={14} {...p} />,
  health:  (p) => <Cross size={14} {...p} />,
};
const DOC_ICONS = {
  flight: (p) => <PlaneIcon size={13} {...p} />,
  hotel: (p) => <Hotel size={13} {...p} />,
  train: (p) => <TrainFront size={13} {...p} />,
  bus: (p) => <BusFront size={13} {...p} />,
  car: (p) => <Car size={13} {...p} />,
  ticket: (p) => <Ticket size={13} {...p} />,
  insurance: (p) => <Shield size={13} {...p} />,
  other: (p) => <FileText size={13} {...p} />,
};
const SPOT_ICONS = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', custom:'📍' };

// ── Mini weather ──────────────────────────────────────────────────────────────
const WMO_EMOJI = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'🌨️',75:'❄️',80:'🌧️',81:'🌧️',82:'⛈️',95:'⛈️',99:'⛈️'};
// weather fetched inline in DayCard

// ── Requirements builder ──────────────────────────────────────────────────────
function buildRequirements(countries, originCountry, secondNationality = null) {
  const reqs = [];
  const originMeta = getCountryMeta(originCountry || 'España');
  const originISO = originMeta?.iso || 'ES';
  const secondISO = secondNationality ? (getCountryMeta(secondNationality)?.iso || null) : null;

  countries.forEach(country => {
    const data = COUNTRY_REQUIREMENTS[country];
    const dMeta = getCountryMeta(country);
    const destISO = dMeta?.iso;

    // Visa — real per-passport data from visaMatrix
    const visaInfo = destISO ? getVisaInfo(destISO, originISO, secondISO) : null;
    if (visaInfo && visaInfo.needed !== null) {
      reqs.push({
        id: `${country}-visa`, type: 'visa', country,
        title: visaInfo.needed
          ? (visaInfo.eVisa ? 'E-visa necesaria' : 'Visado necesario')
          : 'Sin visado necesario',
        description: visaInfo.info
          + (visaInfo.cost ? ` Coste: ${visaInfo.cost}.` : '')
          + (visaInfo.url ? ` Tramitar en: ${visaInfo.url}` : ''),
        level: visaInfo.needed ? 'required' : 'ok',
      });
    } else if (data?.visa) {
      reqs.push({
        id: `${country}-visa`, type: 'visa', country,
        title: data.visa.needed ? 'Visado requerido' : 'Sin visado necesario',
        description: data.visa.info,
        level: data.visa.needed ? 'required' : 'ok',
      });
    }
    // Adapter: only show if user's home plug type is incompatible with destination
    if (data?.adapter?.needed) {
      const homePacking = COUNTRY_REQUIREMENTS[originCountry] || COUNTRY_REQUIREMENTS['España'] || {};
      const homeNeedsAdapter = homePacking?.adapter?.needed === true;
      // home.needed=false → EU standard (C/F). dest.needed=true → different standard → user needs adapter
      // home.needed=true → non-EU user, may have different plug. Compare types if available.
      const homeType = homePacking?.adapter?.type || '';
      const destType = data.adapter.type || '';
      // Skip if same type (e.g. both Type A, or both EU C/F)
      const sameType = homeType && destType && homeType.split('/')[0] === destType.split('/')[0];
      if (!sameType) {
        reqs.push({
          id: `${country}-adapter`, type: 'tech', country,
          title: `Adaptador ${destType}`,
          description: data.adapter.info,
          level: 'required'
        });
      }
    }
    if (data?.currency?.info) reqs.push({
      id: `${country}-currency`, type: 'money', country,
      title: 'Moneda y pagos',
      description: data.currency.info,
      level: 'info'
    });
    (data?.vaccines || []).forEach((v, i) => {
      const isRequired = v.priority?.includes('requer');
      reqs.push({
        id: `${country}-vax-${i}`, type: 'vaccine', country,
        title: `${v.name}`,
        description: v.priority,
        level: isRequired ? 'required' : 'info', // recommended = info only, not checkable
      });
    });
    (data?.tips || []).forEach((tip, i) => reqs.push({
      id: `${country}-tip-${i}`, type: 'safety', country,
      title: tip, description: '', level: 'info'
    }));
  });
  return reqs.sort((a, b) => {
    const o = { required: 0, recommended: 1, info: 2, ok: 3 };
    return (o[a.level] ?? 4) - (o[b.level] ?? 4);
  });
}

// ── Draggable spot list ───────────────────────────────────────────────────────
function DraggableSpotList({ spots, onReorder }) {
  const [items, setItems] = useState(spots);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const touchDragging = useRef(null);

  useEffect(() => { setItems(spots); }, [spots]);

  // Mouse/desktop drag
  const onDragStart = (e, idx) => { setDragging(idx); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    setDragging(null);
    setDragOver(null);
    onReorder(next);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  // Touch drag
  const onTouchStart = (e, idx) => {
    touchDragging.current = idx;
    setDragging(idx);
  };
  const onTouchMove = (e) => {
    if (touchDragging.current === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    document.querySelectorAll('[data-spot-idx]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) setDragOver(parseInt(el.dataset.spotIdx));
    });
  };
  const onTouchEnd = () => {
    if (touchDragging.current !== null && dragOver !== null && touchDragging.current !== dragOver) {
      const next = [...items];
      const [moved] = next.splice(touchDragging.current, 1);
      next.splice(dragOver, 0, moved);
      setItems(next);
      onReorder(next);
    }
    touchDragging.current = null;
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {items.map((spot, idx) => (
        <div key={spot.id}
          data-spot-idx={idx}
          draggable
          onDragStart={e => onDragStart(e, idx)}
          onDragOver={e => onDragOver(e, idx)}
          onDrop={e => onDrop(e, idx)}
          onDragEnd={onDragEnd}
          onTouchStart={e => onTouchStart(e, idx)}
          className={`flex items-center gap-3 px-4 py-3 border-t border-border transition-all select-none
            ${dragging === idx ? 'opacity-40 bg-secondary/50' : ''}
            ${dragOver === idx && dragging !== idx ? 'bg-accent/50 border-t-primary border-t-2' : ''}
          `}>
          <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing touch-none" />
          <span className="text-base shrink-0">{SPOT_ICONS[spot.type] || '📍'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{spot.title}</p>
            {spot.notes && <p className="text-xs text-muted-foreground truncate">{spot.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}


// ── Item detail sheet ─────────────────────────────────────────────────────────
function ItemDetailSheet({ item, onClose, onSaveTime, onOpenPdf }) {
  const [editingTime, setEditingTime] = useState(false);
  const [time, setTime] = useState(item?.time || '');
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  const isDoc  = item._kind === 'doc';
  const EmojiIcon = isDoc ? (DOC_ICONS[item.type] || DOC_ICONS.other) : null;
  const spotEmoji = !isDoc ? (SPOT_ICONS[item.type] || '📍') : null;
  const title  = item.title || item.name || 'Sin título';

  const handleSave = async () => {
    setSaving(true);
    await onSaveTime(item, time);
    setSaving(false);
    setEditingTime(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isDoc ? 'bg-orange-50' : 'bg-secondary'}`}>
            {isDoc ? <EmojiIcon size={20} className="text-primary" /> : <span className="text-xl">{spotEmoji}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-foreground leading-snug">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {isDoc ? (item.type || 'documento') : (item.type || 'spot')}
              {item.time && <span className="text-primary font-medium"> · {item.time}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Time editor */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Hora</p>
            {editingTime ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="h-9 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 bg-primary text-white text-sm rounded-full font-medium disabled:opacity-50"
                >
                  {saving ? '...' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditingTime(false); setTime(item?.time || ''); }}
                  className="text-sm text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.time ? (
                    <span className="text-primary font-medium">{item.time}</span>
                  ) : (
                    <span className="text-muted-foreground">Sin hora asignada</span>
                  )}
                </div>
                <button
                  onClick={() => setEditingTime(true)}
                  className="text-xs text-primary font-medium underline underline-offset-2"
                >
                  {item.time ? 'Editar' : 'Añadir hora'}
                </button>
              </div>
            )}
          </div>

          {/* Notes (spots) */}
          {!isDoc && item.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Nota</p>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-sm text-foreground leading-relaxed">{item.notes}</p>
              </div>
            </div>
          )}

          {/* Doc extra info */}
          {isDoc && item.type && (
            <div className="flex gap-2">
              {item.type && (
                <div className="bg-secondary rounded-xl p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm font-medium text-foreground capitalize">{item.type}</p>
                </div>
              )}
              {!item.file_url && (
                <div className="bg-secondary rounded-xl p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Archivo</p>
                  <p className="text-sm text-muted-foreground">Sin archivo</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-8 pt-0">
          {isDoc && item.file_url && (
            <button
              onClick={() => { onClose(); setTimeout(() => onOpenPdf(item.file_url), 50); }}
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium"
            >
              Ver documento
            </button>
          )}
          {!isDoc && item.lat && item.lng && (
            <a
              href={`https://maps.google.com/?q=${item.lat},${item.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium text-center"
            >
              Ver en mapa
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-secondary border border-border rounded-xl text-sm text-muted-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Day card ──────────────────────────────────────────────────────────────────
function DayCard({ label, city, docs, spots, itineraryDays, tripId, defaultOpen, onReorderSpots, dateStr, onUpdateItemTime }) {
  const [open, setOpen]           = useState(defaultOpen);
  const [viewFile, setViewFile]   = useState(null);
  const [selected, setSelected]   = useState(null);
  const hasItinerary = itineraryDays?.some(d => d.city_id === city?.id);
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

  // Merge docs + spots into one timeline sorted by time
  const timeline = useMemo(() => {
    const docItems  = docs.map(d  => ({ ...d,  _kind: 'doc'  }));
    const spotItems = spots.map(s => ({ ...s,  _kind: 'spot' }));
    const all = [...docItems, ...spotItems];
    const withTime    = all.filter(i => i.time).sort((a, b) => a.time.localeCompare(b.time));
    const withoutTime = all.filter(i => !i.time);
    return [...withTime, ...withoutTime];
  }, [docs, spots]);

  const hasContent = timeline.length > 0;

  const handleSaveTime = async (item, time) => {
    if (onUpdateItemTime) await onUpdateItemTime(item, time);
    setSelected(prev => prev ? { ...prev, time } : null);
  };

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${isToday_ ? 'border-orange-200' : 'border-border'}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isToday_ ? 'bg-orange-50 hover:bg-orange-100/50' : 'bg-secondary/30 hover:bg-secondary/50'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-medium uppercase tracking-wider shrink-0 ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`}>
            {label}
          </span>
          <span className="text-sm font-medium text-foreground truncate">{city?.name}</span>
          {dateStr && (
            <span className="text-xs text-muted-foreground shrink-0">
              {format(parseISO(dateStr), 'dd MMM', { locale: es })}
            </span>
          )}
          {hasContent && (
            <span className="text-xs text-muted-foreground shrink-0">· {timeline.length}</span>
          )}
        </div>
        {isToday_ && weather && (
          <span className="text-sm shrink-0 mr-1">{WMO_EMOJI[weather.code] || '🌡️'} <span className="text-xs font-medium text-foreground">{weather.temp}°</span></span>
        )}
        {open
          ? <ChevronUp   className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Holiday banner — shown even when collapsed */}
      {(() => {
        if (!city?.country || !dateStr) return null;
        const holidays = getHolidaysForDate(city.country, dateStr, city.name);
        if (!holidays.length) return null;
        return (
          <div className="border-t border-amber-100 dark:border-amber-900/30">
            {holidays.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20">
                <span className="text-sm flex-shrink-0 mt-0.5">🎉</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                    {h.name} <span className="font-normal opacity-70">· Festivo</span>
                  </p>
                  {h.note && <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {open && (
        <div>
          {hasContent ? (
            timeline.map((item, idx) => {
              const isDoc   = item._kind === 'doc';
              const DocIcon = isDoc ? (DOC_ICONS[item.type] || DOC_ICONS.other) : null;
              const spotEmoji = !isDoc ? (SPOT_ICONS[item.type] || '📍') : null;
              const isLast  = idx === timeline.length - 1;
              const hasTime = !!item.time;

              return (
                <button
                  key={item.id || idx}
                  onClick={() => setSelected(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-t border-border transition-colors text-left ${
                    isDoc && item.time && ['flight','train','bus'].includes(item.type) && (() => {
                      const now = new Date();
                      const [h, m] = item.time.split(':').map(Number);
                      const dep = new Date(now); dep.setHours(h, m, 0, 0);
                      const diffMin = Math.round((dep - now) / 60000);
                      if (diffMin <= 0 || diffMin > 240) return false;
                      return diffMin <= 60 ? 'bg-red-50 hover:bg-red-50' : 'bg-orange-50/60 hover:bg-orange-50/80';
                    })() || 'hover:bg-secondary/20'
                  }`}
                >
                  {/* Time column */}
                  <div className="w-11 shrink-0 flex flex-col items-center self-stretch justify-start pt-0.5">
                    {hasTime ? (
                      <span className="text-[11px] font-medium text-primary leading-none whitespace-nowrap">{item.time}</span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-border mt-1" />
                    )}
                    {!isLast && (
                      <div className="w-px flex-1 bg-border/60 mt-1.5" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDoc ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-secondary'}`}>
                    {isDoc && DocIcon
                      ? <DocIcon size={16} stroke="currentColor" className="text-primary" />
                      : <span className="text-base">{spotEmoji}</span>
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title || item.name || 'Sin título'}
                    </p>
                    {!isDoc && item.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.notes}</p>
                    )}
                    {isDoc && !hasTime && (
                      <p className="text-xs text-muted-foreground mt-0.5">Sin hora · toca para añadir</p>
                    )}
                    {/* Countdown for transport items */}
                    {isDoc && item.time && ['flight','train','bus'].includes(item.type) && (() => {
                      const now = new Date();
                      const [h, m] = item.time.split(':').map(Number);
                      const dep = new Date(now); dep.setHours(h, m, 0, 0);
                      const diffMin = Math.round((dep - now) / 60000);
                      if (diffMin <= 0 || diffMin > 240) return null;
                      const hrs = Math.floor(diffMin / 60);
                      const mins = diffMin % 60;
                      const label = hrs > 0 ? `Sale en ${hrs}h${mins > 0 ? ` ${mins}min` : ''}` : `Sale en ${diffMin} min`;
                      const urgent = diffMin <= 60;
                      return (
                        <p className="text-xs font-semibold mt-0.5" style={{color: urgent ? '#dc2626' : '#c2410c'}}>
                          {urgent ? '⚠ ' : ''}{label}
                        </p>
                      );
                    })()}
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              );
            })
          ) : (
            <Link
              to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
              className="flex items-center gap-3 px-4 py-4 border-t border-border hover:bg-secondary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-lg">📍</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Explorar spots en {city?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Añade lugares a tu día</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          )}

          <Link
            to={createPageUrl('CityDetail') + '?city_id=' + city?.id + '&trip_id=' + tripId}
            className="flex items-center justify-between px-4 py-3 border-t border-border hover:bg-secondary/20 transition-colors"
          >
            <span className="text-xs font-medium text-primary">
              {hasItinerary ? `Ver itinerario de ${city?.name}` : `Abrir ${city?.name}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      )}

      {/* PDF viewer */}
      {viewFile && <PDFViewer fileUrl={viewFile} onClose={() => setViewFile(null)} />}

      {/* Item detail sheet */}
      {selected && (
        <ItemDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onSaveTime={handleSaveTime}
          onOpenPdf={(url) => setViewFile(url)}
        />
      )}
    </div>
  );
}


// ── Tomorrow tab ──────────────────────────────────────────────────────────────
function TomorrowTab({ trip, cities, tripId }) {
  const queryClient = useQueryClient();
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const tomorrowCity = useMemo(() =>
    sortedCities.find(c => c.start_date && c.end_date && tomorrowStr >= c.start_date && tomorrowStr <= c.end_date) ||
    sortedCities.find(c => c.start_date === tomorrowStr),
    [sortedCities, tomorrowStr]
  );

  const { data: allDocs = [] } = useQuery({
    queryKey: ['allDocs', tripId],
    queryFn: () => base44.entities.Document.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: allSpots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const tomorrowDocs  = allDocs.filter(d => d.date === tomorrowStr || d.valid_from === tomorrowStr || d.start_date === tomorrowStr);
  const tomorrowSpots = tomorrowCity
    ? allSpots.filter(s => s.city_id === tomorrowCity.id && s.assigned_date === tomorrowStr)
        .sort((a, b) => (a.day_order ?? 999) - (b.day_order ?? 999))
    : [];

  if (!tomorrowCity) return (
    <div className="bg-card rounded-2xl border border-border text-center py-12 px-4">
      <p className="text-3xl mb-2">📅</p>
      <p className="text-sm font-medium text-foreground mb-1">Nada planificado para mañana</p>
      <p className="text-xs text-muted-foreground">Añade spots o documentos para el día de mañana</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <DayCard
        label="Mañana"
        city={tomorrowCity}
        docs={tomorrowDocs}
        spots={tomorrowSpots}
        itineraryDays={[]}
        tripId={tripId}
        defaultOpen={true}
        dateStr={tomorrowStr}
        onReorderSpots={async (newOrder) => {
          await Promise.all(newOrder.map((spot, idx) =>
            base44.entities.Spot.update(spot.id, { day_order: idx })
          ));
          queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
        }}
      />
    </div>
  );
}


// ── Inicio tab — D-1 and departure day ────────────────────────────────────────
function InicioTab({ trip, cities, documents, packingItems, profiles, tripId, onInvite }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tripStart = trip?.start_date || '';
  const daysLeft = tripStart ? differenceInDays(parseISO(tripStart), new Date()) : null;
  const isDeparture = daysLeft === 0;

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  // First document of departure day (flight/train/bus priority)
  const TRANSPORT_TYPES = ['flight', 'train', 'bus', 'car'];
  const todayDocs = documents.filter(d => {
    const docDate = d.date || d.valid_from || d.start_date;
    return docDate === todayStr;
  }).sort((a, b) => {
    const aT = TRANSPORT_TYPES.indexOf(a.type);
    const bT = TRANSPORT_TYPES.indexOf(b.type);
    if (aT !== bT) return (aT === -1 ? 99 : aT) - (bT === -1 ? 99 : bT);
    return (a.time || '').localeCompare(b.time || '');
  });

  const firstDoc = todayDocs[0] || null;

  // Countdown alert for first transport doc
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  let countdown = null;
  if (firstDoc?.time) {
    const [h, m] = firstDoc.time.split(':').map(Number);
    const diff = (h * 60 + m) - nowMinutes;
    if (diff > 0 && diff <= 480) {
      countdown = diff <= 60 ? `en ${diff} min` : `en ${Math.round(diff / 60)}h ${diff % 60 > 0 ? (diff % 60) + 'min' : ''}`.trim();
    }
  }

  const DOC_ICON = {
    flight: (props) => <PlaneIcon size={20} {...props} />,
    train:  (props) => <TrainFront size={20} {...props} />,
    bus:    (props) => <BusFront size={20} {...props} />,
    hotel:  (props) => <Hotel size={20} {...props} />,
    car:    (props) => <Car size={20} {...props} />,
    other:  (props) => <FileText size={20} {...props} />,
  };
  const packedCount = packingItems.filter(i => i.packed).length;
  const packedPct = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;

  const destName = sortedCities.length > 0
    ? sortedCities.map(c => c.name).join(' · ')
    : trip?.destination || '';
  const firstCity = sortedCities[0];
  const countryMeta = getCountryMeta(firstCity?.country || trip?.country || '');

  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: 160, background: '#1a1714' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.15) 100%)'
        }} />
        {countryMeta?.flag && (
          <div style={{ position: 'absolute', top: 14, right: 16, fontSize: 32, zIndex: 1 }}>
            {countryMeta.flag}
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 18px' }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#f8a07a', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {isDeparture ? '¡Hoy empieza!' : '¡Mañana empieza!'}
          </p>
          <p style={{ fontSize: 22, fontWeight: 500, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>
            {firstCity?.country || trip?.destination || trip?.name}<br/>te espera
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>{destName}</p>
        </div>
      </div>

      {/* First transport doc */}
      {firstDoc && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {TRANSPORT_TYPES.includes(firstDoc.type) ? 'Tu primer ' + (firstDoc.type === 'flight' ? 'vuelo' : firstDoc.type === 'train' ? 'tren' : 'transporte') : 'Primer documento'}
            </p>
            {countdown && (
              <span className="text-xs font-medium text-primary">Sale {countdown}</span>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
              {(() => { const I = DOC_ICON[firstDoc.type] || DOC_ICON.other; return <I className="text-primary" />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{firstDoc.title || firstDoc.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{firstDoc.time ? `Salida ${firstDoc.time}` : 'Sin hora'}</p>
            </div>
            {firstDoc.time && (
              <p className="text-base font-semibold text-foreground flex-shrink-0">{firstDoc.time}</p>
            )}
          </div>
          {firstDoc.file_url && (
            <div className="px-4 pb-3">
              <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}
                className="block w-full py-2.5 bg-primary text-white text-sm font-medium text-center rounded-full">
                Ver billete
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Packing quick check */}
      {packingItems.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Maleta</p>
            <p className="text-sm font-medium text-primary">{packedPct}%</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: packedPct + '%' }} />
          </div>
          <p className="text-xs text-muted-foreground">{packedCount} de {packingItems.length} listos</p>
        </div>
      )}

      {/* Días festivos en el viaje */}
      {(() => {
        if (!trip?.start_date || !trip?.end_date) return null;
        const allCountries = [...new Set(sortedCities.map(c => c.country).filter(Boolean))];
        const tripHolidays = getHolidaysInRange(allCountries, trip.start_date, trip.end_date, sortedCities);
        if (!tripHolidays.length) return null;
        return (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Días festivos en tu viaje</p>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                {tripHolidays.length} día{tripHolidays.length > 1 ? 's' : ''}
              </span>
            </div>
            {tripHolidays.map((h, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-sm flex-shrink-0">🎉</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(h.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {h.city ? ` · ${h.city}` : h.country ? ` · ${h.country}` : ''}
                  </p>
                  {h.note && <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Viajeros */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />Viajeros
          </p>
          <button onClick={onInvite} className="flex items-center gap-1 text-xs text-primary font-medium">
            <UserPlus className="w-3.5 h-3.5" />Invitar
          </button>
        </div>
        <MemberAvatarRow trip={trip} profiles={profiles} onInvite={onInvite} />
      </div>
    </div>
  );
}


// ── Pre-trip tab ──────────────────────────────────────────────────────────────
function PreTripTab({ trip, cities, packingItems, documents, myProfile, profiles, onInvite }) {
  const tripId = trip?.id;
  const originCountry = myProfile?.home_country || 'España';
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kodo_checklist_${tripId}`) || '{}'); } catch { return {}; }
  });

  const allCountries = useMemo(() => {
    const norm = (c) => (c || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const seen = {};
    // Use ONLY city countries - never trip.country which may be in a different language
    const all = cities.length > 0
      ? cities.map(c => c.country).filter(Boolean)
      : [trip?.country].filter(Boolean);
    all.forEach(c => { const key = norm(c); if (!seen[key]) seen[key] = c; });
    return Object.values(seen);
  }, [trip, cities]);

  const requirements = useMemo(() =>
    buildRequirements([...allCountries], originCountry, myProfile?.second_nationality || null),
    [allCountries, originCountry]
  );

  const toggleCheck = (id) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    try { localStorage.setItem(`kodo_checklist_${tripId}`, JSON.stringify(next)); } catch {}
  };

  const actionableReqs = requirements.filter(r => r.level !== 'ok');
  const doneCount = actionableReqs.filter(r => checkedItems[r.id]).length;
  const packedCount = packingItems.filter(i => i.packed).length;
  const packedPct = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;
  const docsCount = documents?.length || 0;

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const tripStart = trip?.start_date ? parseISO(trip.start_date) : null;
  const daysLeft = tripStart ? differenceInDays(tripStart, new Date()) : null;

  return (
    <div className="space-y-3">
      {/* Countdown */}
      {daysLeft !== null && daysLeft >= 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-5xl font-semibold text-primary leading-none">{daysLeft}</p>
          <p className="text-sm text-muted-foreground mt-1">días para el viaje</p>
          {sortedCities.length > 0 && (
            <p className="text-xs text-primary mt-2">
              Primera parada: {sortedCities[0].name}
              {trip?.start_date && ` · ${format(parseISO(trip.start_date), 'dd MMM yyyy', { locale: es })}`}
            </p>
          )}
        </div>
      )}

      {/* Quick status */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Utilities') + '?trip_id=' + tripId + '&tab=maleta'}>
          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Maleta</p>
            <p className="text-2xl font-semibold text-foreground">{packedPct}%</p>
            <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: packedPct + '%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{packedCount}/{packingItems.length} items</p>
          </div>
        </Link>
        <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}>
          <div className="bg-card rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Documentos</p>
            <p className="text-2xl font-semibold text-foreground">{docsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {docsCount === 0 ? 'Ninguno subido' : `${docsCount} subido${docsCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </Link>
      </div>

      {/* Checklist */}
      {actionableReqs.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Por hacer antes del viaje</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doneCount}/{actionableReqs.length} completados · pasaporte de {originCountry}
              </p>
            </div>
            {doneCount === actionableReqs.length && actionableReqs.length > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Todo listo ✓</span>
            ) : (actionableReqs.length - doneCount) > 0 ? (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                {actionableReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length > 0
                  ? `${actionableReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length} pendiente${actionableReqs.filter(r => r.level === 'required' && !checkedItems[r.id]).length > 1 ? 's' : ''}`
                  : null}
              </span>
            ) : null}
          </div>
          {(() => {
            const GROUPS = [
              { key: 'visa',    label: 'Visados',      types: ['visa'] },
              { key: 'vaccine', label: 'Salud',        types: ['vaccine'] },
              { key: 'tech',    label: 'Equipamiento', types: ['tech'] },
              { key: 'money',   label: 'Dinero',       types: ['money'] },
              { key: 'safety',  label: 'Consejos',     types: ['safety', 'info'] },
            ];
            return GROUPS.map(group => {
              const items = actionableReqs.filter(r => group.types.includes(r.type));
              if (!items.length) return null;
              const doneCount = items.filter(r => checkedItems[r.id]).length;
              const allDone = doneCount === items.length;
              const isCollapsed = collapsedGroups[group.key] ?? allDone;
              return (
                <div key={group.key}>
                  {/* Ō category header — clickable to collapse */}
                  <button onClick={() => setCollapsedGroups(p => ({ ...p, [group.key]: !isCollapsed }))}
                    className="w-full flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div style={{height:2.5,width:24,background:'#c2410c',borderRadius:2}} />
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{group.label}</p>
                      {allDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{doneCount}/{items.length}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={"text-muted-foreground transition-transform " + (isCollapsed ? '' : 'rotate-180')}>
                        <polyline points="18 15 12 9 6 15"/>
                      </svg>
                    </div>
                  </button>
                  {!isCollapsed && <>
                  {items.map(req => {
                    const isInfo = req.level === 'info';
                    const isCheckable = !isInfo;
                    return isCheckable ? (
                      <button key={req.id} onClick={() => toggleCheck(req.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors text-left">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          checkedItems[req.id] ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {checkedItems[req.id] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-base shrink-0">{(REQ_ICON_MAP[req.type] ? REQ_ICON_MAP[req.type]({className:'text-primary'}) : null)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight ${checkedItems[req.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {req.title}{allCountries.size > 1 && <span className="text-xs text-muted-foreground ml-1 font-normal">· {req.country}</span>}
                          </p>
                          {req.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>}
                        </div>
                        {req.level === 'required' && !checkedItems[req.id] && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">!</span>
                        )}
                      </button>
                    ) : (
                      <div key={req.id} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
                        <span className="text-base shrink-0 mt-0.5">{REQ_ICON_MAP[req.type] ? REQ_ICON_MAP[req.type]({className:'text-muted-foreground'}) : 'ℹ️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">{req.title}
                            {allCountries.size > 1 && <span className="text-xs text-muted-foreground ml-1 font-normal">· {req.country}</span>}
                          </p>
                          {req.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>}
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium shrink-0 border border-amber-100">recomendado</span>
                      </div>
                    );
                  })}
                </>}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Días festivos en el viaje */}
      {(() => {
        if (!trip?.start_date || !trip?.end_date) return null;
        const allCountries = [...new Set(sortedCities.map(c => c.country).filter(Boolean))];
        const tripHolidays = getHolidaysInRange(allCountries, trip.start_date, trip.end_date, sortedCities);
        if (!tripHolidays.length) return null;
        return (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Días festivos en tu viaje</p>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                {tripHolidays.length} día{tripHolidays.length > 1 ? 's' : ''}
              </span>
            </div>
            {tripHolidays.map((h, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-sm flex-shrink-0">🎉</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(h.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {h.city ? ` · ${h.city}` : h.country ? ` · ${h.country}` : ''}
                  </p>
                  {h.note && <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Viajeros */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />Viajeros
          </p>
          <button onClick={onInvite}
            className="flex items-center gap-1 text-xs text-primary font-medium">
            <UserPlus className="w-3.5 h-3.5" />Invitar
          </button>
        </div>
        <MemberAvatarRow trip={trip} profiles={profiles} onInvite={onInvite} />
      </div>
    </div>
  );
}

// ── Today tab ─────────────────────────────────────────────────────────────────
function TodayTab({ trip, cities, tripId, profiles, onInvite }) {
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd');

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const todayCity = useMemo(() =>
    sortedCities.find(c => c.start_date && c.end_date && todayStr >= c.start_date && todayStr <= c.end_date) || sortedCities[0],
    [sortedCities, todayStr]
  );

  const tomorrowCity = useMemo(() =>
    sortedCities.find(c => c.start_date === tomorrowStr) ||
    sortedCities.find(c => c.start_date && c.end_date && tomorrowStr >= c.start_date && tomorrowStr <= c.end_date),
    [sortedCities, tomorrowStr]
  );

  const { data: allDocs = [] } = useQuery({
    queryKey: ['allDocs', tripId],
    queryFn: () => base44.entities.Document.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: allSpots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const docsForDate = (dateStr) =>
    allDocs.filter(d => d.date === dateStr || d.valid_from === dateStr || d.start_date === dateStr);

  const spotsForDate = (cityId, dateStr) =>
    allSpots
      .filter(s => s.city_id === cityId && s.assigned_date === dateStr)
      .sort((a, b) => (a.day_order ?? 999) - (b.day_order ?? 999));

  const handleReorder = async (newOrder) => {
    await Promise.all(newOrder.map((spot, idx) =>
      base44.entities.Spot.update(spot.id, { day_order: idx })
    ));
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
  };

  const dayNumber = trip?.start_date ? differenceInDays(today, parseISO(trip.start_date)) + 1 : null;
  const totalDays = (trip?.start_date && trip?.end_date)
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : null;

  return (
    <div className="space-y-3">
      {dayNumber && totalDays && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-medium">Día {dayNumber} de {totalDays}</span>
          <Link to={createPageUrl('Cities') + '?trip_id=' + tripId} className="text-xs text-primary font-medium">
            Ver ruta completa →
          </Link>
        </div>
      )}

      {todayCity && (
        <DayCard
          label="Hoy"
          city={todayCity}
          docs={docsForDate(todayStr)}
          spots={spotsForDate(todayCity.id, todayStr)}
          itineraryDays={itineraryDays}
          tripId={tripId}
          defaultOpen={true}
          dateStr={todayStr}
          onReorderSpots={handleReorder}
          onUpdateItemTime={async (item, time) => {
            try {
              if (item._kind === 'doc') {
                await base44.entities.Document.update(item.id, { time });
                queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
              } else {
                await base44.entities.Spot.update(item.id, { time });
                queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
              }
            } catch {}
          }}
        />
      )}

      {tomorrowCity && tomorrowCity.id !== todayCity?.id && (
        <DayCard
          label="Mañana"
          city={tomorrowCity}
          docs={docsForDate(tomorrowStr)}
          spots={spotsForDate(tomorrowCity.id, tomorrowStr)}
          itineraryDays={itineraryDays}
          tripId={tripId}
          defaultOpen={false}
          dateStr={tomorrowStr}
          onReorderSpots={handleReorder}
        />
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />Viajeros
          </p>
          <button onClick={onInvite}
            className="flex items-center gap-1 text-xs text-primary font-medium">
            <UserPlus className="w-3.5 h-3.5" />Invitar
          </button>
        </div>
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {(trip?.members || [trip?.created_by]).filter(Boolean).map((email, i) => {
            const initials = (email || '').split('@')[0].slice(0,2).toUpperCase();
            const colors = ['bg-orange-100 text-orange-700','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];
            return (
              <div key={email} className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>
                  {initials}
                </div>
                <span className="text-xs text-muted-foreground">{i === 0 ? 'Tú' : email.split('@')[0]}</span>
              </div>
            );
          })}
          <button onClick={onInvite} className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary/40 transition-colors">
              <UserPlus className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <span className="text-xs text-muted-foreground">Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Finished tab ──────────────────────────────────────────────────────────────

function FotosTab({ tripId }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }, 'created_date', 200),
    enabled: !!tripId,
    staleTime: 60000,
  });
  const photos = messages.filter(m => m.file_type === 'image' && m.file_url);

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground px-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <Camera className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Sin fotos aún</p>
        <p className="text-xs mt-1">Las fotos enviadas en el chat aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {photos.map((msg, i) => (
          <div key={i}
            className="aspect-square rounded-xl overflow-hidden bg-secondary cursor-pointer"
            onClick={() => window.open(msg.file_url, '_blank')}>
            <img src={msg.file_url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        {photos.length} foto{photos.length > 1 ? 's' : ''} del viaje
      </p>
    </div>
  );
}

function FinishedTab({ trip, cities, expenses, spots }) {
  const totalDays = (trip?.start_date && trip?.end_date)
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : null;
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const avgPerDay = totalDays ? totalSpent / totalDays : 0;
  const visitedSpots = spots.filter(s => s.visited).length;
  const currency = trip?.currency || 'EUR';
  const members = trip?.members?.length || 1;

  const allCountries = useMemo(() => {
    // Prefer city countries over trip.country to avoid duplicates like "Japón y Japan"
    const sources = cities.length > 0
      ? cities.map(c => c.country).filter(Boolean)
      : [trip?.country].filter(Boolean);
    const norm = (s) => (s || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const seen = {};
    sources.forEach(s => { const k = norm(s); if (!seen[k]) seen[k] = s; });
    return Object.values(seen);
  }, [trip, cities]);

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const countriesLabel = (() => {
    if (cities.length === 0) return trip?.destination || '';
    if (cities.length === 1) return sortedCities[0]?.name || trip?.destination || '';
    // Multiple cities: show unique countries joined with ' y '
    const countries = [...allCountries];
    if (countries.length === 0) return trip?.destination || '';
    if (countries.length === 1) return countries[0];
    if (countries.length === 2) return countries.join(' y ');
    return countries.slice(0, -1).join(', ') + ' y ' + countries[countries.length - 1];
  })();

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl border border-orange-200 p-6 text-center">
        <p className="text-4xl mb-3">🌸</p>
        <p className="text-sm text-muted-foreground mb-1">Gracias por visitar</p>
        <p className="text-2xl font-semibold text-foreground">{countriesLabel}</p>
        {trip?.start_date && trip?.end_date && (
          <p className="text-xs text-muted-foreground mt-2">
            {format(parseISO(trip.start_date), 'dd MMM', { locale: es })} – {format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Días de viaje', value: totalDays || '—', Icon: Calendar },
          { label: members === 1 ? 'Viajero' : 'Viajeros', value: members, Icon: Users },
          { label: 'Ciudades', value: cities.length, Icon: MapPin },
          { label: 'Spots visitados', value: visitedSpots, Icon: Star },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <s.Icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
        <div className="bg-card rounded-2xl border border-border p-4 col-span-2">
          <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xl font-semibold text-foreground">{totalSpent.toFixed(0)} {currency}</p>
          <p className="text-xs text-muted-foreground">Total · {avgPerDay.toFixed(0)} {currency}/día</p>
        </div>
      </div>

      {sortedCities.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Ruta del viaje</p>
          <div className="flex items-center gap-2 flex-wrap">
            {sortedCities.map((city, i) => (
              <span key={city.id} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{city.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────
function ChatTab({ tripId, currentUserEmail, currentUserId, myProfile }) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputType = useRef('all');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }, 'created_date', 100),
    enabled: !!tripId,
    staleTime: 0,
    refetchInterval: 8000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (payload) => base44.entities.TripMessage.create({
      trip_id: tripId,
      user_id: currentUserId,
      user_email: currentUserEmail,
      display_name: myProfile?.display_name || currentUserEmail,
      avatar_url: myProfile?.avatar_url || null,
      ...payload,
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
    },
  });

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert('Máximo 20MB'); return; }
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    setUploading(true);
    setAttachOpen(false);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMutation.mutate({
        content: isImage || isAudio ? '' : file.name,
        file_url,
        file_type: isImage ? 'image' : isAudio ? 'audio' : 'file',
        file_name: file.name,
      });
    } catch (err) { alert('Error: ' + err.message); }
    finally { setUploading(false); }
  };

  const openPicker = (type) => {
    setAttachOpen(false);
    if (type === 'camera') {
      // Use dedicated camera input with capture attribute for mobile
      const camInput = document.getElementById('chat-camera-input');
      if (camInput) camInput.click();
    } else {
      fileInputRef.current.accept = type === 'photo'
        ? 'image/*'
        : type === 'doc'
        ? '.pdf,.doc,.docx,.txt,.xls,.xlsx'
        : 'image/*,application/pdf,.doc,.docx,.txt';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        const mimeType = mr.mimeType || 'audio/webm';
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([blob], `audio_${Date.now()}.${ext}`, { type: mimeType });
        stream.getTracks().forEach(t => t.stop());
        await handleUpload(file);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      // Auto-stop after 60s
      setTimeout(() => { if (mr.state === 'recording') stopRecording(); }, 60000);
    } catch { alert('Activa el micrófono en la configuración del navegador'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ content: message.trim() });
  };

  const isMe = (msg) => msg.user_id === currentUserId || msg.user_email === currentUserEmail;
  const isImage = (msg) => (msg.file_type === 'image' || msg.file_type?.startsWith?.('image/')) && msg.file_url;
  const isAudio = (msg) => msg.file_url && (msg.file_type === 'audio' || (msg.file_type && msg.file_type.startsWith('audio/')));
  const isFile  = (msg) => msg.file_url && !isImage(msg) && !isAudio(msg);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          <a href={lightbox} download className="absolute top-5 right-16 text-white/70 hover:text-white"
            onClick={e => e.stopPropagation()}>
            <Download className="w-6 h-6" />
          </a>
          <img src={lightbox} className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Attach menu */}
      {attachOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setAttachOpen(false)}>
          <div className="absolute bottom-36 left-4 bg-card border border-border rounded-2xl shadow-xl p-3 flex gap-3"
            onClick={e => e.stopPropagation()}>
            {[
              { label: 'Foto', icon: <Image className="w-5 h-5" />, action: () => openPicker('photo') },
              { label: 'Cámara', icon: <Camera className="w-5 h-5" />, action: () => openPicker('camera') },
              { label: 'Archivo', icon: <FileText className="w-5 h-5" />, action: () => openPicker('doc') },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-secondary transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {btn.icon}
                </div>
                <span className="text-[10px] font-medium text-foreground">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col mx-4 mb-4" style={{minHeight:'360px',maxHeight:'500px'}}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-25" />
              <p className="text-sm">Sin mensajes aún</p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const msgDate = msg.created_date ? new Date(msg.created_date) : null;
            const prevDate = idx > 0 && messages[idx-1].created_date ? new Date(messages[idx-1].created_date) : null;
            const showDate = msgDate && (!prevDate || msgDate.toDateString() !== prevDate.toDateString());
            const me = isMe(msg);
            return (
              <div key={msg.id}>
                {showDate && msgDate && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-medium px-2">
                      {msgDate.getDate()} {msgDate.toLocaleString('es',{month:'short'})}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className={`flex items-end gap-1.5 ${me ? 'flex-row-reverse' : ''}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {msg.avatar_url
                      ? <img src={msg.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                      : (msg.display_name||'?')[0].toUpperCase()}
                  </div>
                  <div className={`max-w-[70%] flex flex-col gap-0.5 ${me ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-muted-foreground px-1">{me ? 'Tú' : (msg.display_name||msg.user_email)}</span>
                    {isImage(msg) && (
                      <div className="rounded-2xl overflow-hidden cursor-pointer" style={{maxWidth:180}}
                        onClick={() => setLightbox(msg.file_url)}>
                        <img src={msg.file_url} className="w-full object-cover" style={{maxHeight:160}} />
                      </div>
                    )}
                    {isAudio(msg) && (
                      <div className="flex flex-col gap-1.5" style={{minWidth: 220}}>
                        <audio
                          src={msg.file_url}
                          controls
                          preload="none"
                          style={{
                            width: '220px',
                            height: '40px',
                            borderRadius: '20px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    )}
                    {isFile(msg) && (
                      <a href={msg.file_url} download={msg.file_name} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm ${me ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-[110px] text-xs">{msg.file_name||'Archivo'}</span>
                        <Download className="w-3 h-3" />
                      </a>
                    )}
                    {!isImage(msg) && !isAudio(msg) && !isFile(msg) && (
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${me ? 'bg-primary text-white rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm'}`}>
                        {msg.content || (msg.file_url ? '📎 Archivo adjunto' : '')}
                      </div>
                    )}
                    <span className="text-[9px] text-muted-foreground px-1">
                      {msgDate ? `${msgDate.getHours()}:${String(msgDate.getMinutes()).padStart(2,'0')}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-2.5 flex gap-2 items-center">
          {/* File picker */}
          <input ref={fileInputRef} type="file" className="hidden"
            onChange={e => { handleUpload(e.target.files?.[0]); e.target.value=''; }} />
          {/* Camera - capture="environment" opens camera directly on mobile */}
          <input
            ref={el => { if (el) el._isCameraInput = true; }}
            id="chat-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { handleUpload(e.target.files?.[0]); e.target.value=''; }}
          />

          {/* + button */}
          <button onClick={() => setAttachOpen(o => !o)}
            disabled={uploading || recording}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors font-bold text-lg ${attachOpen ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
            {uploading
              ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : '+'}
          </button>

          <Input value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            placeholder="Escribe un mensaje..."
            className="flex-1 text-sm bg-background border-border rounded-full px-4"
            disabled={sendMutation.isPending || recording} />

          {/* Mic button - toggle record */}
          {!message.trim() && (
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading || sendMutation.isPending}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${recording ? 'bg-red-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
              {recording
                ? <div className="w-3 h-3 rounded-sm bg-white" />
                : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm7 10a1 1 0 0 1 2 0c0 5-3.6 9.3-8.5 9.9V23h-1v-2.1C6.6 20.3 3 16 3 11a1 1 0 0 1 2 0c0 4.4 3.6 8 7 8s7-3.6 7-8z"/></svg>
              }
            </button>
          )}

          {message.trim() && (
            <Button onClick={sendMessage} disabled={sendMutation.isPending}
              className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 text-white shrink-0 rounded-full">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}


function MemberAvatarRow({ trip, profiles, onInvite, isToday }) {
  const members = (trip?.members || [trip?.created_by]).filter(Boolean);
  const colors = ['bg-orange-100 text-orange-700','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];

  return (
    <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
      {members.map((email, i) => {
        const profile = profiles?.find(p => p.user_email === email || p.created_by === email);
        const initials = (profile?.display_name || email || '').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || (email||'').split('@')[0].slice(0,2).toUpperCase();
        const name = profile?.display_name || (email||'').split('@')[0];
        return (
          <div key={email} className="flex flex-col items-center gap-1">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={name} className="w-9 h-9 rounded-full object-cover" />
              : <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>{initials}</div>
            }
            <span className="text-xs text-muted-foreground max-w-[48px] truncate text-center">{i === 0 ? (isToday ? 'Tú' : 'Admin') : name}</span>
          </div>
        );
      })}
      <button onClick={onInvite} className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary/40 transition-colors">
          <UserPlus className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <span className="text-xs text-muted-foreground">Añadir</span>
      </button>
    </div>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ open, onClose, trip, tripId, queryClient }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Introduce un email válido'); return; }
    setSending(true); setError('');
    try {
      const currentMembers = trip?.members || [];
      if (currentMembers.includes(email.trim())) { setError('Este usuario ya es miembro'); setSending(false); return; }
      await base44.entities.Trip.update(tripId, { members: [...currentMembers, email.trim()] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setDone(true); setEmail('');
      setTimeout(() => { setDone(false); onClose(); }, 2000);
    } catch { setError('Error al añadir el usuario. Inténtalo de nuevo.'); }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />Invitar al viaje
          </DialogTitle>
        </DialogHeader>
        <div className="px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground">¡Invitación enviada!</p>
              <p className="text-xs text-muted-foreground text-center">{email} ha sido añadido al viaje</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">Introduce el email de la persona que quieres añadir al viaje.</p>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Email *</label>
              <Input
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
                placeholder="nombre@email.com"
                type="email"
                className="h-10 text-sm"
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              <p className="text-xs text-muted-foreground mt-3">El usuario recibirá acceso al viaje con su cuenta de Kōdo.</p>
            </>
          )}
        </div>
        {!done && (
          <div className="flex gap-2 px-5 py-3 border-t border-border justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleInvite} disabled={!email.trim() || sending}>
              {sending ? 'Añadiendo...' : 'Añadir al viaje'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Settings Dialog ───────────────────────────────────────────────────────────
function SettingsDialog({ open, onClose, trip, cities, tripId, isAdmin, onDelete, onSaved, onInvite }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingCity, setEditingCity] = useState(null); // city id or 'new'
  const [cityDraft, setCityDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [cityLoading, setCityLoading] = useState(null);

  // Init form from trip data
  useEffect(() => {
    if (open && trip) {
      setName(trip.name || '');
      setStartDate(trip.start_date || '');
      setEndDate(trip.end_date || '');
      setEditingCity(null);
    }
  }, [open, trip]);

  const totalDays = startDate && endDate
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    : null;

  const handleSaveTrip = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Trip.update(tripId, {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
      });
      onSaved();
      onClose();
    } catch {}
    setSaving(false);
  };

  const openCityEdit = (city) => {
    setEditingCity(city.id);
    setCityDraft({
      name: city.name || '',
      country: city.country || '',
      start_date: city.start_date || '',
      end_date: city.end_date || '',
    });
  };

  const closeCityEdit = () => {
    setEditingCity(null);
    setCityDraft({});
  };

  const saveCityEdit = async (cityId) => {
    if (!cityDraft.name?.trim()) return;
    setCityLoading(cityId);
    try {
      await base44.entities.City.update(cityId, {
        name: cityDraft.name.trim(),
        country: normalizeCountry(cityDraft.country || ''),
        start_date: cityDraft.start_date || '',
        end_date: cityDraft.end_date || '',
      });
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  const deleteCity = async (cityId) => {
    if (cities.length <= 1) return;
    setCityLoading(cityId);
    try {
      await base44.entities.City.delete(cityId);
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  const addCity = async () => {
    setEditingCity('new');
    setCityDraft({ name: '', country: '', start_date: endDate || '', end_date: '' });
  };

  const saveNewCity = async () => {
    if (!cityDraft.name?.trim()) return;
    setCityLoading('new');
    try {
      await base44.entities.City.create({
        trip_id: tripId,
        name: cityDraft.name.trim(),
        country: cityDraft.country || '',
        start_date: cityDraft.start_date || '',
        end_date: cityDraft.end_date || '',
      });
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border p-0 max-w-md max-h-[90vh] overflow-y-auto gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-foreground text-base font-semibold">Ajustes del viaje</DialogTitle>
        </DialogHeader>

        {/* Nombre */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Nombre del viaje</p>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-8 text-sm font-medium border-0 p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Nombre del viaje"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1.5">Fechas del viaje</p>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-8 text-sm flex-1"
              />
              {totalDays && (
                <span className="text-xs bg-accent text-primary px-2 py-1 rounded-full font-medium shrink-0">
                  {totalDays}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Paradas */}
        <div className="bg-secondary/50 px-5 py-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Paradas · {cities.length} ciudad{cities.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {cities.map((city, idx) => (
          <div key={city.id}>
            {/* City row */}
            <button
              onClick={() => editingCity === city.id ? closeCityEdit() : openCityEdit(city)}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-border hover:bg-secondary/30 transition-colors text-left">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                editingCity === city.id ? 'bg-primary text-white' : 'bg-accent text-primary border border-orange-200'
              }`}>{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{city.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {city.country}
                  {city.start_date && city.end_date && ` · ${format(parseISO(city.start_date), 'dd MMM', { locale: es })} – ${format(parseISO(city.end_date), 'dd MMM', { locale: es })}`}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${editingCity === city.id ? 'rotate-180' : ''}`} />
            </button>

            {/* Inline edit panel */}
            {editingCity === city.id && (
              <div className="bg-secondary/40 border-b border-border px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                    <Input value={cityDraft.name || ''} onChange={e => setCityDraft(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" placeholder="Ciudad" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">País</p>
                    <CountryInput value={cityDraft.country || ''} onChange={v => setCityDraft(p => ({ ...p, country: v }))} placeholder="País" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
                    <Input type="date" value={cityDraft.start_date || ''} onChange={e => setCityDraft(p => ({ ...p, start_date: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
                    <Input type="date" value={cityDraft.end_date || ''} onChange={e => setCityDraft(p => ({ ...p, end_date: e.target.value }))} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {cities.length > 1 ? (
                    <button
                      onClick={() => deleteCity(city.id)}
                      disabled={cityLoading === city.id}
                      className="text-xs text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                      {cityLoading === city.id ? 'Eliminando...' : 'Eliminar parada'}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Mínimo una parada</span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={closeCityEdit}>
                      Cancelar
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                      onClick={() => saveCityEdit(city.id)}
                      disabled={!cityDraft.name?.trim() || cityLoading === city.id}>
                      {cityLoading === city.id ? 'Guardando...' : 'Listo'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Nueva parada */}
        {editingCity === 'new' ? (
          <div className="bg-secondary/40 border-b border-border px-5 py-4 space-y-3">
            <p className="text-xs font-medium text-primary">Nueva parada</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                <Input value={cityDraft.name || ''} onChange={e => setCityDraft(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" placeholder="Ciudad" autoFocus />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">País</p>
                <CountryInput value={cityDraft.country || ''} onChange={v => setCityDraft(p => ({ ...p, country: v }))} placeholder="País" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
                <Input type="date" value={cityDraft.start_date || ''} onChange={e => setCityDraft(p => ({ ...p, start_date: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
                <Input type="date" value={cityDraft.end_date || ''} onChange={e => setCityDraft(p => ({ ...p, end_date: e.target.value }))} className="h-8 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={closeCityEdit}>
                Cancelar
              </Button>
              <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                onClick={saveNewCity}
                disabled={!cityDraft.name?.trim() || cityLoading === 'new'}>
                {cityLoading === 'new' ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </div>
          </div>
        ) : (
          <button onClick={addCity}
            className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-border hover:bg-secondary/30 transition-colors text-left">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <span className="text-muted-foreground text-xs">+</span>
            </div>
            <span className="text-sm text-muted-foreground">Añadir parada</span>
          </button>
        )}

        {/* Viajeros */}
        <div className="bg-secondary/50 px-5 py-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Viajeros · {trip?.members?.length || 1}
          </p>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex gap-2">
            {(trip?.members || [trip?.created_by]).filter(Boolean).map((email, i) => {
              const initials = (email || '').split('@')[0].slice(0, 2).toUpperCase();
              const colors = ['bg-accent text-primary', 'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
              return (
                <div key={email} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>
                  {initials}
                </div>
              );
            })}
          </div>
          <button onClick={() => { onClose(); setTimeout(() => onInvite?.(), 100); }}
            className="text-xs text-primary flex items-center gap-1 font-medium">
            <UserPlus className="w-3.5 h-3.5" />Invitar
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5">
          {isAdmin && (
            <button onClick={onDelete}
              className="text-sm text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />Eliminar viaje
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleSaveTrip}
              disabled={!name.trim() || saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [formData, setFormData] = useState({});
  const [tab, setTab] = useState(() => 'hoy');
  const [urgentCount, setUrgentCount] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteDone, setInviteDone] = useState(false);
  const [chatLastRead, setChatLastRead] = useState(new Date());

  const handleTabChange = (key) => {
    setTab(key);
    if (key === 'chat') setChatLastRead(new Date());
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('trip_id');
    if (!id || id === 'null' || id === 'default') {
      navigate(createPageUrl('TripsList'), { replace: true });
      return;
    }
    setTripId(id);
    window.scrollTo(0, 0);
  }, [navigate]);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripId ? base44.entities.Trip.get(tripId) : null,
    enabled: !!tripId,
    onSuccess: (d) => {
      if (d) setFormData({
        name: d.name || '', destination: d.destination || '', country: d.country || '',
        start_date: d.start_date || '', end_date: d.end_date || '',
        description: d.description || '', cover_image: d.cover_image || '',
        currency: d.currency || 'EUR', members: d.members || []
      });
    }
  });

  useEffect(() => {
    if (trip && !formData.name) setFormData({
      name: trip.name || '', destination: trip.destination || '', country: trip.country || '',
      start_date: trip.start_date || '', end_date: trip.end_date || '',
      description: trip.description || '', cover_image: trip.cover_image || '',
      currency: trip.currency || 'EUR', members: trip.members || []
    });
  }, [trip]);

  const updateMutation = useMutation({
    mutationFn: (d) => base44.entities.Trip.update(tripId, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setSettingsOpen(false); }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Trip.delete(tripId),
    onSuccess: () => { setDeleteOpen(false); navigate(createPageUrl('TripsList'), { replace: true }); }
  });

  const currentUserEmail = currentUser?.email;
  const currentUserId = currentUser?.id;
  const roles = trip?.roles || {};
  const isAdmin = !trip || roles[currentUserEmail] === 'admin' || trip?.created_by === currentUserEmail || Object.keys(roles).length === 0;

  const { activeCity, activeMeta, countryRoute } = useTripContext(tripId);

  const { data: cities = [] } = useQuery({ queryKey: ['cities', tripId], queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'), enabled: !!tripId, staleTime: 30000 });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses', tripId], queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: packingItems = [] } = useQuery({ queryKey: ['packingItems', tripId], queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: documents = [] } = useQuery({ queryKey: ['documents', tripId], queryFn: () => base44.entities.Document.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: allSpots = [] } = useQuery({ queryKey: ['spots', tripId], queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: tripMessages = [] } = useQuery({ queryKey: ['tripMessages', tripId], queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 10000, refetchInterval: 30000 });
  const { data: profiles = [] } = useQuery({ queryKey: ['allProfilesHome'], queryFn: () => base44.entities.UserProfile.list(), staleTime: 5 * 60 * 1000 });
  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const r = await base44.entities.UserProfile.filter({ user_id: currentUserId });
      return r[0] || null;
    },
    enabled: !!currentUserId, staleTime: 60000
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tripStart = trip?.start_date || '';
  const tripEnd = trip?.end_date || '';
  const tripNotStarted = tripStart && todayStr < tripStart;
  const tripFinished = tripEnd && todayStr > tripEnd;
  const tripInProgress = tripStart && tripEnd && todayStr >= tripStart && todayStr <= tripEnd;

  // Notifications
  const notifications = useMemo(() => {
    const notifs = [];
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const todayStr_ = format(new Date(), 'yyyy-MM-dd');
    const nowHour = new Date().getHours() * 60 + new Date().getMinutes();

    // Doc time alerts — docs today with a time field
    documents
      .filter(d => {
        const docDate = d.date || d.valid_from || d.start_date;
        return docDate === todayStr_ && d.time;
      })
      .forEach(d => {
        const [h, m] = (d.time || '').split(':').map(Number);
        const docMinutes = (h || 0) * 60 + (m || 0);
        const diff = docMinutes - nowHour;
        if (diff > 0 && diff <= 240) {
          const icon = d.type === 'flight' ? '✈️' : d.type === 'train' ? '🚆' : d.type === 'bus' ? '🚌' : '📄';
          const label = diff <= 60 ? `en ${diff} min` : `en ${Math.round(diff/60)}h`;
          notifs.push({
            id: `doctime-${d.id}`, icon,
            message: `${d.title || d.name} · ${d.time} (${label})`,
            time: new Date().toISOString(),
            urgent: diff <= 120,
          });
        }
      });

    expenses
      .filter(e => e.split_with?.includes(currentUserEmail) && e.created_by !== currentUserEmail && new Date(e.created_date) > cutoff)
      .forEach(e => notifs.push({
        id: `exp-${e.id}`, icon: '💰',
        message: `${(e.created_by || '').split('@')[0]} añadió un gasto: ${e.description || 'Gasto'} ${e.amount}${trip?.currency || '€'}`,
        time: e.created_date || ''
      }));
    documents
      .filter(d => d.shared_with?.includes(currentUserEmail) && d.created_by !== currentUserEmail && new Date(d.created_date) > cutoff)
      .forEach(d => notifs.push({
        id: `doc-${d.id}`, icon: '📄',
        message: `Nuevo documento: ${d.title || d.name}`,
        time: d.created_date || ''
      }));
    allSpots
      .filter(s => s.assigned_date && s.created_by !== currentUserEmail && new Date(s.created_date) > cutoff)
      .forEach(s => notifs.push({
        id: `spot-${s.id}`, icon: '📍',
        message: `${s.creator_username || 'Alguien'} asignó un spot: ${s.title}`,
        time: s.created_date || ''
      }));
    return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [expenses, documents, allSpots, currentUserEmail, trip]);

  const unreadMessages = useMemo(() => {
    return tripMessages.filter(m =>
      m.user_id !== currentUserId &&
      m.user_email !== currentUserEmail &&
      new Date(m.created_date) > chatLastRead
    ).length;
  }, [tripMessages, currentUserId, currentUserEmail, chatLastRead]);

  // Auto-correct tab when trip status changes
  useEffect(() => {
    if (!trip) return;
    const validKeys = homeTabs.map(t => t.key);
    if (!validKeys.includes(tab)) {
      setTab(validKeys[0]);
    }
  }, [trip?.start_date, trip?.end_date]);

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  // Smart tab logic
  const daysToStart = tripStart ? differenceInDays(parseISO(tripStart), new Date()) : null;
  const isDeparture = daysToStart === 0;       // today IS the start date
  const isDMinus1   = daysToStart === 1;       // tomorrow is start
  const isPreTrip   = tripNotStarted && !isDeparture;

  const homeTabs = useMemo(() => {
    const tabs = [];
    if (tripFinished) {
      return [{ key: 'resumen', label: 'Resumen' }, { key: 'chat', label: 'Chat', badge: unreadMessages }];
    }
    if (isDeparture || tripInProgress) {
      tabs.push({ key: 'hoy', label: 'Hoy', urgent: true });
      tabs.push({ key: 'manana', label: 'Mañana' });
      if (isDeparture) tabs.unshift({ key: 'inicio', label: 'Inicio' });
      tabs.push({ key: 'fotos', label: 'Fotos' }); tabs.push({ key: 'chat', label: 'Chat', badge: unreadMessages });
      return tabs;
    }
    if (isDMinus1) {
      return [
        { key: 'previaje', label: 'Pre-viaje' },
        { key: 'inicio', label: 'Inicio' },
        { key: 'chat', label: 'Chat', badge: unreadMessages },
      ];
    }
    // Normal pre-trip
    return [
      { key: 'previaje', label: 'Pre-viaje' },
      { key: 'chat', label: 'Chat', badge: unreadMessages },
    ];
  }, [tripFinished, isDeparture, tripInProgress, isDMinus1, unreadMessages]);

  if (isLoading || !tripId) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌸</div>
        <p className="text-muted-foreground">Cargando viaje...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header — light option D */}
      <div className="bg-background sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">

          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('TripsList')}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />Mis viajes
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setNotifOpen(o => !o)}
                  className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-border/40 transition-colors relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute top-11 right-0 w-72 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Notificaciones</p>
                      <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sin notificaciones recientes</p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-border">
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 flex items-start gap-3 ${n.urgent ? 'bg-red-50' : ''}`}>
                            <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                            <p className={`text-xs leading-relaxed ${n.urgent ? 'text-red-700 font-medium' : 'text-foreground'}`}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setSettingsOpen(true)}
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-border/40 transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Trip info */}
          <h1 className="text-2xl font-semibold text-foreground mb-2">{trip?.name}</h1>
          <div className="flex flex-wrap gap-3 text-muted-foreground text-sm mb-4">
            {sortedCities.length > 0 ? (
              <span className="flex items-center gap-1 flex-wrap">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                {sortedCities.map((city, i) => (
                  <span key={city.id} className="flex items-center gap-1">
                    {i > 0 && <ArrowRight className="w-3 h-3 opacity-40" />}
                    {city.name}
                  </span>
                ))}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />{trip?.destination}
              </span>
            )}
            {trip?.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(parseISO(trip.start_date), 'dd MMM', { locale: es })}
                {trip.end_date && ` – ${format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
              </span>
            )}
          </div>

          {/* Tabs — Ō system */}
          <OTabBar
            tabs={homeTabs}
            activeKey={tab}
            onChange={handleTabChange}
            urgentCount={urgentCount}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 pt-5 pb-2 space-y-3">
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />
        <TripAlerts tripId={tripId} cities={cities} trip={trip} onUrgentCount={setUrgentCount} />

        {tab === 'previaje' && (
          <PreTripTab
            trip={trip} cities={sortedCities}
            packingItems={packingItems} documents={documents}
            myProfile={myProfile} profiles={profiles}
            onInvite={() => setInviteOpen(true)}
          />
        )}
        {tab === 'inicio' && (
          <InicioTab
            trip={trip} cities={sortedCities}
            documents={documents} packingItems={packingItems}
            profiles={profiles} tripId={tripId}
            onInvite={() => setInviteOpen(true)}
          />
        )}
        {tab === 'hoy' && (
          <TodayTab trip={trip} cities={sortedCities} tripId={tripId} profiles={profiles} onInvite={() => setInviteOpen(true)} />
        )}
        {tab === 'manana' && (
          <TomorrowTab trip={trip} cities={sortedCities} tripId={tripId} />
        )}
        {tab === 'fotos' && tripId && (
          <FotosTab tripId={tripId} />
        )}
        {tab === 'resumen' && (
          <FinishedTab trip={trip} cities={sortedCities} expenses={expenses} spots={allSpots} />
        )}
        {tab === 'chat' && (
          <ChatTab
            tripId={tripId}
            currentUserEmail={currentUserEmail}
            currentUserId={currentUserId}
            myProfile={myProfile}
          />
        )}
      </div>

      {/* Settings dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        trip={trip}
        cities={sortedCities}
        tripId={tripId}
        isAdmin={isAdmin}
        onDelete={() => { setSettingsOpen(false); setDeleteOpen(true); }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
        }}
        onInvite={() => setInviteOpen(true)}
      />

            <DeleteTripModal
        open={deleteOpen} onOpenChange={setDeleteOpen}
        tripName={trip?.name || ''}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        trip={trip}
        tripId={tripId}
        queryClient={queryClient}
      />
    </div>
  );
}