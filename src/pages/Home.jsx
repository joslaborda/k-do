import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  Send, UserPlus, Check, X, GripVertical
} from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DeleteTripModal from '@/components/trip/DeleteTripModal';
import TripAlerts from '@/components/trip/TripAlerts';
import { COUNTRY_REQUIREMENTS } from '@/lib/packingDB';

// ── Constants ─────────────────────────────────────────────────────────────────
const REQ_ICONS = { visa:'🛂', vaccine:'💉', tech:'🔌', money:'💰', safety:'💡', health:'🏥' };
const DOC_ICONS = { flight:'✈️', hotel:'🏨', train:'🚆', bus:'🚌', car:'🚗', ticket:'🎟️', insurance:'🛡️', other:'📄' };
const SPOT_ICONS = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', custom:'📍' };

// ── Requirements builder ──────────────────────────────────────────────────────
function buildRequirements(countries, originCountry) {
  const reqs = [];
  countries.forEach(country => {
    const data = COUNTRY_REQUIREMENTS[country];
    if (!data) return;
    if (data.visa) reqs.push({
      id: `${country}-visa`, type: 'visa', country,
      title: data.visa.needed ? 'Visado requerido' : 'Sin visado necesario',
      description: data.visa.info,
      level: data.visa.needed ? 'required' : 'ok'
    });
    if (data.adapter?.needed) reqs.push({
      id: `${country}-adapter`, type: 'tech', country,
      title: `Adaptador ${data.adapter.type || ''}`,
      description: data.adapter.info,
      level: 'required'
    });
    if (data.currency?.info) reqs.push({
      id: `${country}-currency`, type: 'money', country,
      title: 'Moneda y pagos',
      description: data.currency.info,
      level: 'info'
    });
    (data.vaccines || []).forEach((v, i) => reqs.push({
      id: `${country}-vax-${i}`, type: 'vaccine', country,
      title: `Vacuna: ${v.name}`,
      description: v.priority,
      level: v.priority?.includes('requer') ? 'required' : 'recommended'
    }));
    (data.tips || []).forEach((tip, i) => reqs.push({
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

// ── Day card ──────────────────────────────────────────────────────────────────
function DayCard({ label, city, docs, spots, itineraryDays, tripId, defaultOpen, onReorderSpots, dateStr }) {
  const [open, setOpen] = useState(defaultOpen);
  const [viewFile, setViewFile] = useState(null);
  const hasItinerary = itineraryDays?.some(d => d.city_id === city?.id);
  const hasContent = docs.length > 0 || spots.length > 0;
  const isToday_ = defaultOpen;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${isToday_ ? 'border-orange-200' : 'border-border'}`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isToday_ ? 'bg-orange-50 hover:bg-orange-100/50' : 'bg-secondary/30 hover:bg-secondary/50'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-bold uppercase tracking-wider shrink-0 ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          <span className="text-sm font-semibold text-foreground truncate">{city?.name}</span>
          {dateStr && (
            <span className="text-xs text-muted-foreground shrink-0">
              {format(parseISO(dateStr), 'dd MMM', { locale: es })}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div>
          {[...docs].sort((a,b) => (a.time||'99:99').localeCompare(b.time||'99:99')).map(doc => (
            <button key={doc.id}
              onClick={() => doc.file_url ? setViewFile(doc.file_url) : null}
              className="w-full flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-secondary/20 transition-colors text-left">
              <span className="text-xl shrink-0">{DOC_ICONS[doc.type] || DOC_ICONS.other}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title || doc.name}</p>
                {doc.time && <p className="text-xs text-primary font-medium mt-0.5">{doc.time}</p>}
              </div>
              {doc.file_url
                ? <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                : <span className="text-xs text-muted-foreground shrink-0">Sin archivo</span>}
            </button>
          ))}

          {spots.length > 0 && (
            <DraggableSpotList spots={spots} onReorder={onReorderSpots} />
          )}

          {!hasContent && (
            <Link to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
              className="flex items-center gap-3 px-4 py-4 border-t border-border hover:bg-accent/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <span className="text-lg">📍</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Explorar spots en {city?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Guarda y asigna lugares para hoy</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          )}

          <Link to={createPageUrl('CityDetail') + '?city_id=' + city?.id + '&trip_id=' + tripId}
            className="flex items-center justify-between px-4 py-3 border-t border-border hover:bg-secondary/20 transition-colors">
            <span className="text-xs font-medium text-primary">
              {hasItinerary ? `Ver itinerario de ${city?.name}` : `Abrir ${city?.name}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      )}
    </div>

      {viewFile && <PDFViewer fileUrl={viewFile} onClose={() => setViewFile(null)} />}
  );
}

// ── Pre-trip tab ──────────────────────────────────────────────────────────────
function PreTripTab({ trip, cities, packingItems, documents, myProfile, profiles, onInvite }) {
  const tripId = trip?.id;
  const originCountry = myProfile?.home_country || 'España';
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kodo_checklist_${tripId}`) || '{}'); } catch { return {}; }
  });

  const allCountries = useMemo(() => {
    const s = new Set();
    if (trip?.country) s.add(trip.country);
    cities.forEach(c => { if (c.country) s.add(c.country); });
    return [...s];
  }, [trip, cities]);

  const requirements = useMemo(() =>
    buildRequirements([...allCountries], originCountry),
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
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
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
        <Link to={createPageUrl('Packing') + '?trip_id=' + tripId}>
          <div className="bg-white rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Maleta</p>
            <p className="text-2xl font-semibold text-foreground">{packedPct}%</p>
            <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: packedPct + '%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{packedCount}/{packingItems.length} items</p>
          </div>
        </Link>
        <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}>
          <div className="bg-white rounded-2xl border border-border p-4 hover:border-primary/40 transition-colors">
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
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
          {actionableReqs.map(req => (
            <button key={req.id} onClick={() => toggleCheck(req.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors text-left">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                checkedItems[req.id] ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {checkedItems[req.id] && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-lg shrink-0">{REQ_ICONS[req.type] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  checkedItems[req.id] ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {req.title}
                  {allCountries.size > 1 && (
                    <span className="text-xs text-muted-foreground ml-1 font-normal">· {req.country}</span>
                  )}
                </p>
                {req.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{req.description}</p>
                )}
              </div>
              {req.level === 'required' && !checkedItems[req.id] && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full shrink-0 font-medium">!</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Viajeros */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
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

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
          <Link to={createPageUrl('TripDetail') + '?trip_id=' + trip?.id}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <span className="text-xs text-muted-foreground">Añadir</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Finished tab ──────────────────────────────────────────────────────────────
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
    const s = new Set();
    if (trip?.country) s.add(trip.country);
    cities.forEach(c => { if (c.country) s.add(c.country); });
    return [...s];
  }, [trip, cities]);

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const countriesLabel = cities.length === 1
    ? (sortedCities[0]?.name || trip?.destination || '')
    : allCountries.size > 1
      ? [...allCountries].join(' y ')
      : ([...allCountries][0] || trip?.destination || '');

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-orange-200 p-6 text-center">
        <p className="text-4xl mb-3">🌸</p>
        <p className="text-sm text-muted-foreground mb-1">Gracias por visitar</p>
        <p className="text-2xl font-semibold text-primary">{countriesLabel}</p>
        {trip?.start_date && trip?.end_date && (
          <p className="text-xs text-muted-foreground mt-2">
            {format(parseISO(trip.start_date), 'dd MMM', { locale: es })} – {format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Días de viaje', value: totalDays || '—', icon: '📅' },
          { label: members === 1 ? 'Viajero' : 'Viajeros', value: members, icon: '👥' },
          { label: 'Ciudades', value: cities.length, icon: '🏙️' },
          { label: 'Spots visitados', value: visitedSpots, icon: '📍' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl border border-border p-4 col-span-2">
          <p className="text-xl mb-1">💰</p>
          <p className="text-xl font-semibold text-foreground">{totalSpent.toFixed(0)} {currency}</p>
          <p className="text-xs text-muted-foreground">Total · {avgPerDay.toFixed(0)} {currency}/día</p>
        </div>
      </div>

      {sortedCities.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
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
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 8000,
    refetchInterval: 12000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 5 * 60 * 1000,
  });

  const profileMap = useMemo(() => {
    const m = {};
    profiles.forEach(p => { if (p.user_id) m[p.user_id] = p; });
    return m;
  }, [profiles]);

  const sorted = useMemo(() =>
    [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sorted.length]);

  const sendMessage = async () => {
    const content = message.trim();
    if (!content || sending) return;
    setSending(true);
    setMessage('');
    try {
      await base44.entities.TripMessage.create({
        trip_id: tripId,
        user_id: currentUserId,
        user_email: currentUserEmail,
        display_name: myProfile?.display_name || currentUserEmail?.split('@')[0] || 'Usuario',
        content,
      });
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
    } catch {
      setMessage(content);
    } finally {
      setSending(false);
    }
  };

  const fmt = (d) => { try { return format(new Date(d), 'HH:mm'); } catch { return ''; } };
  const fmtDate = (d) => { try { const dt = new Date(d); return isToday(dt) ? 'Hoy' : format(dt, 'dd MMM', { locale: es }); } catch { return ''; } };

  const grouped = useMemo(() => {
    const items = [];
    let lastDate = null;
    sorted.forEach(msg => {
      const dl = fmtDate(msg.created_date);
      if (dl !== lastDate) { items.push({ type: 'date', label: dl }); lastDate = dl; }
      items.push({ type: 'msg', msg });
    });
    return items;
  }, [sorted]);

  const isMe = (msg) => msg.user_id === currentUserId || msg.user_email === currentUserEmail;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-border overflow-hidden" style={{ minHeight: '60vh' }}>
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">Empieza la conversación del viaje</p>
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === 'date') return (
            <div key={i} className="flex items-center gap-2 py-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          );
          const { msg } = item;
          const me = isMe(msg);
          const profile = profileMap[msg.user_id];
          const displayName = msg.display_name || profile?.display_name || (msg.user_email || '').split('@')[0] || 'Usuario';
          const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={msg.id || i} className={`flex items-end gap-2 mb-3 ${me ? 'flex-row-reverse' : 'flex-row'}`}>
              {!me && (
                <div className="w-7 h-7 rounded-full bg-accent border border-orange-200 flex items-center justify-center text-xs font-semibold text-primary shrink-0 mb-1">
                  {initials}
                </div>
              )}
              <div className={`flex flex-col max-w-[75%] ${me ? 'items-end' : 'items-start'}`}>
                {!me && <p className="text-xs text-muted-foreground mb-1 px-1">{displayName}</p>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  me
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">{fmt(msg.created_date)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-border bg-secondary/20">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Mensaje..."
          className="flex-1 h-10 text-sm bg-white border-border"
          disabled={sending}
        />
        <Button onClick={sendMessage} disabled={!message.trim() || sending}
          className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-white shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}



// ── Member avatar row ─────────────────────────────────────────────────────────
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
        country: cityDraft.country || '',
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
                    <Input value={cityDraft.country || ''} onChange={e => setCityDraft(p => ({ ...p, country: e.target.value }))} className="h-8 text-sm" placeholder="País" />
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
                <Input value={cityDraft.country || ''} onChange={e => setCityDraft(p => ({ ...p, country: e.target.value }))} className="h-8 text-sm" placeholder="País" />
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
  const [tab, setTab] = useState('main');
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

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const mainTabLabel = tripFinished ? 'Resumen' : tripNotStarted ? 'Preparación' : 'Hoy';

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
      <div className="bg-background border-b border-border">
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
                  <div className="absolute top-11 right-0 w-72 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
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

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => handleTabChange('main')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === 'main' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}>
              {mainTabLabel}
            </button>
            <button onClick={() => handleTabChange('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
                tab === 'chat' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}>
              Chat
              {unreadMessages > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 pt-5 pb-2 space-y-3">
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />
        <TripAlerts tripId={tripId} cities={cities} trip={trip} />

        {tab === 'main' && tripNotStarted && (
          <PreTripTab
            trip={trip} cities={sortedCities}
            packingItems={packingItems} documents={documents}
            myProfile={myProfile} profiles={profiles}
            onInvite={() => setInviteOpen(true)}
          />
        )}
        {tab === 'main' && tripInProgress && (
          <TodayTab trip={trip} cities={sortedCities} tripId={tripId} profiles={profiles} onInvite={() => setInviteOpen(true)} />
        )}
        {tab === 'main' && tripFinished && (
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