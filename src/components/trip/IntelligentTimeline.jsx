import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Plane, Train, Hotel, Calendar, MapPin, FileText,
  Shield, Ticket, ChevronDown, ChevronRight, Eye,
  Navigation, Receipt, Clock, AlertCircle
} from 'lucide-react';
import TicketQuickViewer from './TicketQuickViewer';

// ── helpers ──────────────────────────────────────────────────────────────────
function dateStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDay(dateString) {
  const d = new Date(dateString + 'T00:00:00');
  const today = dateStr(0);
  const tomorrow = dateStr(1);
  if (dateString === today) return 'Hoy';
  if (dateString === tomorrow) return 'Mañana';
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });
}

const DOC_ICON = {
  flight: Plane, train: Train, hotel: Hotel, insurance: Shield,
  event: Calendar, personal: FileText, other: FileText, freetour: Ticket,
};
const DOC_COLOR = {
  flight: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  train: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  hotel: 'bg-purple-100 text-purple-700 border-purple-200',
  insurance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  event: 'bg-orange-100 text-orange-700 border-orange-200',
  personal: 'bg-blue-100 text-blue-700 border-blue-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200',
  freetour: 'bg-orange-100 text-orange-700 border-orange-200',
};
const DOC_LABEL = {
  flight: 'Vuelo', train: 'Tren', hotel: 'Hotel', insurance: 'Seguro',
  event: 'Evento', personal: 'Doc personal', other: 'Documento', freetour: 'Free Tour',
};
const SPOT_EMOJI = { food: '🍜', sight: '🏛️', activity: '⚡', shopping: '🛍️', transport: '🚆', custom: '📍' };

// ── TimelineItem ─────────────────────────────────────────────────────────────
function DocItem({ doc, onClick }) {
  const Icon = DOC_ICON[doc.category] || FileText;
  const color = DOC_COLOR[doc.category] || DOC_COLOR.other;
  const label = DOC_LABEL[doc.category] || doc.category;
  return (
    <button onClick={onClick}
      className={"w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left " +
        (doc.file_url ? "hover:bg-orange-50 hover:border-orange-200 cursor-pointer " : "cursor-default opacity-80 ") + color}>
      <div className={"w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border " + color}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          {doc.time && <span className="text-xs font-medium text-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{doc.time}</span>}
          {doc.file_url && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Eye className="w-3 h-3" />Ver</span>}
        </div>
      </div>
    </button>
  );
}

function SpotItem({ spot }) {
  const emoji = SPOT_EMOJI[spot.type] || '📍';
  return (
    <div className={"flex items-center gap-3 p-3 rounded-xl border border-border bg-white " + (spot.visited ? 'opacity-50' : '')}>
      <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-lg">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={"font-semibold text-sm truncate " + (spot.visited ? 'line-through text-muted-foreground' : 'text-foreground')}>{spot.title}</p>
        {spot.address && <p className="text-xs text-muted-foreground truncate">{spot.address}</p>}
      </div>
      {spot.visited && <span className="text-green-600 text-xs flex-shrink-0">✅</span>}
    </div>
  );
}

// ── DaySection ───────────────────────────────────────────────────────────────
function DaySection({ label, date, docs, spots, itDay, cityOfDay, tripId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [viewerTicket, setViewerTicket] = useState(null);
  const hasContent = docs.length > 0 || spots.length > 0 || itDay;
  const isToday = date === dateStr(0);
  const isTomorrow = date === dateStr(1);

  return (
    <div className={"rounded-2xl border overflow-hidden " + (isToday ? "border-orange-300 shadow-sm" : "border-border")}>
      <button onClick={() => setOpen(o => !o)}
        className={"w-full flex items-center justify-between px-4 py-3.5 transition-colors " +
          (isToday ? "bg-orange-700 text-white" : "bg-white text-foreground hover:bg-orange-50")}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{isToday ? '☀️' : isTomorrow ? '🌙' : '📅'}</span>
          <div className="text-left">
            <p className={"font-bold text-sm " + (isToday ? "text-white" : "text-foreground")}>{label}</p>
            {cityOfDay && <p className={"text-xs " + (isToday ? "text-white/70" : "text-muted-foreground")}>{cityOfDay.name}</p>}
          </div>
          {hasContent && (
            <div className="flex gap-1.5">
              {docs.length > 0 && <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (isToday ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700")}>{docs.length} docs</span>}
              {spots.length > 0 && <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (isToday ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700")}>{spots.length} spots</span>}
            </div>
          )}
        </div>
        {open
          ? <ChevronDown className={"w-4 h-4 " + (isToday ? "text-white" : "text-muted-foreground")} />
          : <ChevronRight className={"w-4 h-4 " + (isToday ? "text-white" : "text-muted-foreground")} />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-white">
          {!hasContent && (
            <p className="text-sm text-muted-foreground text-center py-3">Sin actividad planificada para este día</p>
          )}

          {/* Plan del día */}
          {itDay && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
              <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{itDay.title || 'Plan del día'}</p>
                {cityOfDay && (
                  <Link to={createPageUrl(`CityDetail?trip_id=${tripId}&city_id=${cityOfDay.id}`)}
                    className="text-xs text-orange-700 hover:underline">Ver itinerario →</Link>
                )}
              </div>
            </div>
          )}

          {/* Docs */}
          {docs.length > 0 && (
            <div className="space-y-2">
              {docs.map(doc => (
                <DocItem key={doc.id} doc={doc} onClick={() => doc.file_url && setViewerTicket(doc)} />
              ))}
            </div>
          )}

          {/* Spots */}
          {spots.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Spots del día</p>
              {spots.map(spot => <SpotItem key={spot.id} spot={spot} />)}
            </div>
          )}

          {/* Link a ciudad */}
          {cityOfDay && (
            <Link to={createPageUrl(`CityDetail?trip_id=${tripId}&city_id=${cityOfDay.id}`)}
              className="flex items-center justify-center gap-1.5 text-xs text-orange-700 font-medium py-2 hover:underline">
              <Navigation className="w-3 h-3" />Ver todo el día en detalle
            </Link>
          )}
        </div>
      )}

      <TicketQuickViewer ticket={viewerTicket} open={!!viewerTicket} onOpenChange={o => !o && setViewerTicket(null)} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntelligentTimeline({ tripId, cities, expenses, trip }) {
  const today = dateStr(0);
  const tomorrow = dateStr(1);

  const { data: itDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const sortedCities = useMemo(() => [...cities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [cities]);

  function getCityForDate(date) {
    let city = sortedCities.find(c => c.start_date && c.end_date && date >= c.start_date && date <= c.end_date);
    if (!city) city = sortedCities.find(c => c.start_date && date >= c.start_date);
    if (!city && sortedCities.length > 0) city = sortedCities[0];
    return city || null;
  }

  function getDocsForDate(date, cityOfDay) {
    const itDay = itDays.find(d => d.date === date);
    return tickets.filter(t => {
      if (t.date === date) return true;
      if (itDay && t.itinerary_day_id === itDay.id) return true;
      return false;
    }).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  function getSpotsForDate(date, cityOfDay) {
    if (!cityOfDay) return [];
    const itDay = itDays.find(d => d.date === date);
    if (itDay) return spots.filter(s => s.itinerary_day_id === itDay.id && !s.visited);
    return spots.filter(s => s.city_id === cityOfDay.id && !s.visited).slice(0, 3);
  }

  // Build timeline: today + tomorrow + next 5 days with content
  const days = useMemo(() => {
    const result = [];
    // Always show today and tomorrow
    for (let i = 0; i <= 1; i++) {
      const date = dateStr(i);
      const city = getCityForDate(date);
      const itDay = itDays.find(d => d.date === date) || null;
      result.push({ date, city, itDay });
    }
    // Show next 7 days only if they have content
    for (let i = 2; i <= 8; i++) {
      const date = dateStr(i);
      const city = getCityForDate(date);
      const itDay = itDays.find(d => d.date === date) || null;
      const docs = getDocsForDate(date, city);
      const daySpots = getSpotsForDate(date, city);
      if (docs.length > 0 || daySpots.length > 0 || itDay) {
        result.push({ date, city, itDay });
      }
    }
    return result;
  }, [itDays, tickets, spots, sortedCities]);

  // Today's expenses summary
  const todayExpenses = useMemo(() => {
    return expenses.filter(e => e.date === today);
  }, [expenses, today]);

  const todayTotal = todayExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  if (cities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-border p-8 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">Añade paradas a tu viaje para ver la timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Gastos de hoy si hay */}
      {todayExpenses.length > 0 && (
        <Link to={createPageUrl(`Expenses?trip_id=${tripId}`)}>
          <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-orange-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-4 h-4 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">Gastos de hoy</p>
              <p className="text-xs text-muted-foreground">{todayExpenses.length} gasto{todayExpenses.length > 1 ? 's' : ''} · {todayTotal.toFixed(0)} {trip?.currency || ''}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      )}

      {/* Days */}
      {days.map(({ date, city, itDay }, idx) => {
        const docs = getDocsForDate(date, city);
        const daySpots = getSpotsForDate(date, city);
        return (
          <DaySection
            key={date}
            label={formatDay(date)}
            date={date}
            docs={docs}
            spots={daySpots}
            itDay={itDay}
            cityOfDay={city}
            tripId={tripId}
            defaultOpen={idx === 0}
          />
        );
      })}
    </div>
  );
}
