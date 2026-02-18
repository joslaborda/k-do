import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plane, Train, Hotel, MapPin, FileText, Calendar as CalendarIcon } from 'lucide-react';

const categoryIcons = {
  flight: Plane,
  train: Train,
  hotel: Hotel,
};

const categoryColors = {
  flight: 'bg-blue-100 text-blue-700 border-blue-300',
  train: 'bg-green-100 text-green-700 border-green-300',
  hotel: 'bg-purple-100 text-purple-700 border-purple-300',
  freetour: 'bg-orange-100 text-orange-700 border-orange-300',
  insurance: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

export default function CalendarView() {
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list(),
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list(),
  });

  // Generar todos los días del viaje
  const tripStart = new Date('2026-03-04');
  const tripEnd = new Date('2026-03-19');
  
  const allDays = eachDayOfInterval({ start: tripStart, end: tripEnd });

  // Organizar eventos por día
  const eventsByDay = useMemo(() => {
    const events = {};

    allDays.forEach(day => {
      events[format(day, 'yyyy-MM-dd')] = {
        cities: [],
        tickets: [],
        itinerary: [],
      };
    });

    // Añadir ciudades
    cities.forEach(city => {
      if (city.start_date) {
        const dateKey = format(parseISO(city.start_date), 'yyyy-MM-dd');
        if (events[dateKey]) {
          events[dateKey].cities.push(city);
        }
      }
    });

    // Añadir tickets
    tickets.forEach(ticket => {
      if (ticket.date) {
        const dateKey = format(parseISO(ticket.date), 'yyyy-MM-dd');
        if (events[dateKey]) {
          events[dateKey].tickets.push(ticket);
        }
      }
    });

    // Añadir días de itinerario
    itineraryDays.forEach(day => {
      if (day.date) {
        const dateKey = format(parseISO(day.date), 'yyyy-MM-dd');
        if (events[dateKey]) {
          events[dateKey].itinerary.push(day);
        }
      }
    });

    return events;
  }, [cities, tickets, itineraryDays, allDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Calendario del Viaje</h1>
              <p className="text-stone-600">4 - 19 de Marzo 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        <div className="space-y-4">
          {allDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay[dateKey];
            const hasEvents = dayEvents.cities.length > 0 || dayEvents.tickets.length > 0 || dayEvents.itinerary.length > 0;

            return (
              <div
                key={dateKey}
                className={`bg-white rounded-2xl border-2 transition-all ${
                  hasEvents ? 'border-purple-200 shadow-lg' : 'border-stone-200'
                }`}
              >
                <div className="p-6">
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {format(day, 'd')}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-stone-500">
                        {format(day, 'MMM', { locale: es })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-stone-900">
                        {format(day, 'EEEE', { locale: es })}
                      </div>
                      <div className="text-sm text-stone-500">Día {idx + 1} del viaje</div>
                    </div>
                  </div>

                  {/* Events */}
                  {hasEvents ? (
                    <div className="space-y-3 pl-16">
                      {/* Llegada a ciudad */}
                      {dayEvents.cities.map(city => (
                        <div key={city.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="font-semibold text-stone-900">Llegada a {city.name}</div>
                            <div className="text-xs text-stone-500">Nueva ciudad</div>
                          </div>
                        </div>
                      ))}

                      {/* Tickets */}
                      {dayEvents.tickets.map(ticket => {
                        const Icon = categoryIcons[ticket.category] || FileText;
                        const colorClass = categoryColors[ticket.category] || 'bg-gray-100 text-gray-700 border-gray-300';
                        
                        return (
                          <div key={ticket.id} className={`flex items-center gap-3 p-3 border rounded-lg ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                            <div>
                              <div className="font-semibold text-stone-900">{ticket.name}</div>
                              {ticket.notes && (
                                <div className="text-xs text-stone-500 mt-1">{ticket.notes}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Días de itinerario */}
                      {dayEvents.itinerary.map(itinerary => (
                        <div key={itinerary.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="font-semibold text-stone-900 mb-1">{itinerary.title}</div>
                          {itinerary.content && (
                            <div className="text-sm text-stone-600 line-clamp-2">
                              {itinerary.content.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-16 text-sm text-stone-400 italic">
                      Sin eventos programados
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}