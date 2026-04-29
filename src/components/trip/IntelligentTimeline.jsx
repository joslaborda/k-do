import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isToday, isTomorrow, isValid, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plane, Train, Hotel, Calendar, MapPin, Receipt, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ticketIcon = (category) => {
  switch (category) {
    case 'flight': return <Plane className="w-4 h-4 text-blue-600" />;
    case 'train': return <Train className="w-4 h-4 text-green-600" />;
    case 'hotel': return <Hotel className="w-4 h-4 text-purple-600" />;
    default: return <Calendar className="w-4 h-4 text-gray-500" />;
  }
};

const ticketBg = (category) => {
  switch (category) {
    case 'flight': return 'bg-blue-50 border-blue-200';
    case 'train': return 'bg-green-50 border-green-200';
    case 'hotel': return 'bg-purple-50 border-purple-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

function DayCard({ date, label, isOpen, onToggle, itineraryDay, tickets, spots, dayExpenses, tripId, isHighlighted }) {
  const hasContent = itineraryDay || tickets.length > 0 || spots.length > 0;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isHighlighted ? 'border-orange-400 shadow-md' : 'border-border bg-white'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          isHighlighted ? 'bg-orange-600 text-white' : 'bg-white hover:bg-secondary'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`text-center ${isHighlighted ? 'text-white' : 'text-foreground'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isHighlighted ? 'text-orange-100' : 'text-muted-foreground'}`}>
              {label}
            </p>
            <p className="text-base font-bold leading-tight">
              {format(date, 'dd MMM', { locale: es })}
            </p>
          </div>
          {itineraryDay?.title && (
            <span className={`text-sm font-medium truncate max-w-[160px] ${isHighlighted ? 'text-white/90' : 'text-muted-foreground'}`}>
              {itineraryDay.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && tickets.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isHighlighted ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'}`}>
              {tickets.length} doc{tickets.length > 1 ? 's' : ''}
            </span>
          )}
          {!isOpen && spots.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isHighlighted ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'}`}>
              {spots.length} spot{spots.length > 1 ? 's' : ''}
            </span>
          )}
          {isOpen
            ? <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isHighlighted ? 'text-white' : 'text-muted-foreground'}`} />
            : <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isHighlighted ? 'text-white' : 'text-muted-foreground'}`} />
          }
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 py-3 space-y-3 bg-white">

          {/* Gastos resumen (solo hoy) */}
          {dayExpenses.length > 0 && (
            <Link to={createPageUrl(`Expenses?trip_id=${tripId}`)}>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 hover:bg-amber-100 transition-colors">
                <Receipt className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm font-medium text-amber-800">
                  {dayExpenses.length} gasto{dayExpenses.length > 1 ? 's' : ''} hoy
                  {' · '}
                  {dayExpenses.reduce((s, e) => s + (e.amount || 0), 0).toFixed(2)} {dayExpenses[0]?.currency || 'EUR'}
                </span>
              </div>
            </Link>
          )}

          {/* Plan del itinerario */}
          {itineraryDay?.content && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Plan del día</p>
              <p className="text-sm text-foreground leading-relaxed line-clamp-4">{itineraryDay.content}</p>
            </div>
          )}

          {/* Tickets del día */}
          {tickets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documentos</p>
              {tickets.map(ticket => (
                <Link key={ticket.id} to={createPageUrl(`Documents?trip_id=${tripId}`)}>
                  <div className={`flex items-center gap-3 border rounded-xl px-3 py-2 hover:opacity-80 transition-opacity ${ticketBg(ticket.category)}`}>
                    {ticketIcon(ticket.category)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ticket.name}</p>
                      {(ticket.origin || ticket.destination) && (
                        <p className="text-xs text-muted-foreground">{ticket.origin}{ticket.origin && ticket.destination ? ' → ' : ''}{ticket.destination}</p>
                      )}
                      {ticket.city && !ticket.origin && (
                        <p className="text-xs text-muted-foreground">{ticket.city}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Spots del día */}
          {spots.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Spots</p>
              {spots.map(spot => (
                <Link key={spot.id} to={createPageUrl(`Restaurants?trip_id=${tripId}`)}>
                  <div className="flex items-center gap-3 border border-border rounded-xl px-3 py-2 hover:bg-secondary transition-colors">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
                      {spot.address && <p className="text-xs text-muted-foreground truncate">{spot.address}</p>}
                    </div>
                    {spot.visited && <span className="text-xs text-green-600 font-medium">✓</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!itineraryDay && tickets.length === 0 && spots.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">Sin contenido para este día</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntelligentTimeline({ tripId, cities, expenses, trip }) {
  const [openDays, setOpenDays] = useState(new Set(['today']));

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }, 'date'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, 'date'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build set of dates that have content
  const daysWithContent = useMemo(() => {
    const map = new Map();

    itineraryDays.forEach(d => {
      if (d.date) map.set(d.date, { ...map.get(d.date), itineraryDay: d });
    });

    tickets.forEach(t => {
      if (t.date) {
        const cur = map.get(t.date) || {};
        map.set(t.date, { ...cur, tickets: [...(cur.tickets || []), t] });
      }
    });

    spots.forEach(s => {
      // spots linked to an itinerary day get shown on that day
      const day = itineraryDays.find(d => d.id === s.itinerary_day_id);
      if (day?.date) {
        const cur = map.get(day.date) || {};
        map.set(day.date, { ...cur, spots: [...(cur.spots || []), s] });
      }
    });

    return map;
  }, [itineraryDays, tickets, spots]);

  const days = useMemo(() => {
    const result = [];
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');

    const allDates = new Set([...daysWithContent.keys(), todayStr, tomorrowStr]);

    // Filter dates that are within trip range or have content
    const tripStart = trip?.start_date ? parseISO(trip.start_date) : null;
    const tripEnd = trip?.end_date ? parseISO(trip.end_date) : null;

    [...allDates].sort().forEach(dateStr => {
      const date = parseISO(dateStr);
      if (!isValid(date)) return;

      const isT = isToday(date);
      const isTom = isTomorrow(date);
      const hasContent = daysWithContent.has(dateStr);

      // Skip days with no content unless today or tomorrow
      if (!hasContent && !isT && !isTom) return;

      // Skip days far outside trip range (more than 1 day before/after)
      if (tripStart && differenceInCalendarDays(date, tripStart) < -1) return;
      if (tripEnd && differenceInCalendarDays(date, tripEnd) > 1) return;

      const data = daysWithContent.get(dateStr) || {};
      const dayExpenses = isT
        ? expenses.filter(e => e.date === dateStr)
        : [];

      let label;
      if (isT) label = 'Hoy';
      else if (isTom) label = 'Mañana';
      else label = format(date, 'EEEE', { locale: es }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: es }).slice(1);

      result.push({
        dateStr,
        date,
        label,
        isToday: isT,
        isTomorrow: isTom,
        itineraryDay: data.itineraryDay || null,
        tickets: data.tickets || [],
        spots: data.spots || [],
        dayExpenses,
      });
    });

    return result;
  }, [daysWithContent, expenses, trip, today]);

  const toggle = (dateStr) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  // Auto-open today
  const todayStr = format(today, 'yyyy-MM-dd');

  if (days.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm">
        Sin itinerario planificado aún
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {days.map(day => (
        <DayCard
          key={day.dateStr}
          date={day.date}
          label={day.label}
          isOpen={openDays.has(day.dateStr) || day.isToday}
          onToggle={() => toggle(day.dateStr)}
          itineraryDay={day.itineraryDay}
          tickets={day.tickets}
          spots={day.spots}
          dayExpenses={day.dayExpenses}
          tripId={tripId}
          isHighlighted={day.isToday}
        />
      ))}
    </div>
  );
}