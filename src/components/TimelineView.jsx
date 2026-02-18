import { useMemo } from 'react';
import { format, isValid, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Receipt, BookOpen, Plane, Train, Hotel, Ticket as TicketIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TimelineView({ cities, expenses, diaryEntries, itineraryDays, tickets }) {
  const timelineEvents = useMemo(() => {
    const events = [];

    // Add cities arrivals and departures
    cities.forEach(city => {
      if (city.start_date) {
        const date = startOfDay(new Date(city.start_date));
        events.push({
          date,
          sortKey: `${date.getTime()}-1-${city.name}`,
          type: 'city_arrival',
          icon: MapPin,
          title: city.name,
          subtitle: 'Llegada',
          link: createPageUrl('CityDetail') + `?id=${city.id}`,
          color: 'bg-gradient-to-br from-red-500 to-pink-500',
          data: city
        });
      }
      if (city.end_date && city.end_date !== city.start_date) {
        const date = startOfDay(new Date(city.end_date));
        events.push({
          date,
          sortKey: `${date.getTime()}-6-${city.name}`,
          type: 'city_departure',
          icon: MapPin,
          title: city.name,
          subtitle: 'Salida',
          link: createPageUrl('CityDetail') + `?id=${city.id}`,
          color: 'bg-gradient-to-br from-orange-500 to-red-500',
          data: city
        });
      }
    });

    // Add tickets (flights, trains, hotels)
    if (tickets) {
      tickets.forEach(ticket => {
        if (ticket.date) {
          const date = startOfDay(new Date(ticket.date));
          const iconMap = {
            flight: Plane,
            train: Train,
            hotel: Hotel,
            freetour: TicketIcon,
            insurance: TicketIcon
          };
          const categoryLabels = {
            flight: 'Vuelo',
            train: 'Tren',
            hotel: 'Hotel',
            freetour: 'Free Tour',
            insurance: 'Seguro'
          };
          
          events.push({
            date,
            sortKey: `${date.getTime()}-2-${ticket.name}`,
            type: 'ticket',
            icon: iconMap[ticket.category] || TicketIcon,
            title: ticket.name,
            subtitle: categoryLabels[ticket.category] || ticket.category,
            link: createPageUrl('Tickets'),
            color: 'bg-gradient-to-br from-blue-500 to-indigo-500',
            data: ticket
          });
        }
      });
    }

    // Add itinerary days
    itineraryDays.forEach(day => {
      if (day.date) {
        const date = startOfDay(new Date(day.date));
        const city = cities.find(c => c.id === day.city_id);
        events.push({
          date,
          sortKey: `${date.getTime()}-3-${day.title}`,
          type: 'itinerary',
          icon: Calendar,
          title: day.title,
          subtitle: city?.name,
          link: createPageUrl('CityDetail') + `?id=${day.city_id}`,
          color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
          data: day
        });
      }
    });

    // Add diary entries
    diaryEntries.forEach(entry => {
      if (entry.date) {
        const date = startOfDay(new Date(entry.date));
        events.push({
          date,
          sortKey: `${date.getTime()}-4-${entry.title || 'Diario'}`,
          type: 'diary',
          icon: BookOpen,
          title: entry.title || 'Entrada del diario',
          subtitle: entry.location,
          link: createPageUrl('Diary'),
          color: 'bg-gradient-to-br from-amber-500 to-orange-500',
          data: entry
        });
      }
    });

    // Add expenses grouped by day
    const expensesByDate = expenses.reduce((acc, exp) => {
      if (exp.date) {
        const date = startOfDay(new Date(exp.date));
        const dateKey = date.getTime();
        if (!acc[dateKey]) acc[dateKey] = { date, expenses: [] };
        acc[dateKey].expenses.push(exp);
      }
      return acc;
    }, {});

    Object.values(expensesByDate).forEach(({ date, expenses: dayExpenses }) => {
      const total = dayExpenses.reduce((sum, exp) => {
        const amount = exp.currency === 'EUR' ? exp.amount * 160 : exp.amount;
        return sum + amount;
      }, 0);

      events.push({
        date,
        sortKey: `${date.getTime()}-5-gastos`,
        type: 'expenses',
        icon: Receipt,
        title: `${dayExpenses.length} gasto${dayExpenses.length > 1 ? 's' : ''}`,
        subtitle: `¥${Math.round(total).toLocaleString()}`,
        link: createPageUrl('Expenses'),
        color: 'bg-gradient-to-br from-green-500 to-emerald-500',
        data: dayExpenses
      });
    });

    // Sort by sortKey (date + priority + name)
    return events
      .filter(e => isValid(e.date))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [cities, expenses, diaryEntries, itineraryDays, tickets]);

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-stone-200 rounded-3xl">
        <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-400">Todavía no hay eventos en tu timeline</p>
      </div>
    );
  }

  let currentDate = null;

  return (
    <div className="space-y-6">
      {timelineEvents.map((event, idx) => {
        const Icon = event.icon;
        const eventDateStr = format(event.date, 'yyyy-MM-dd');
        const showDateHeader = eventDateStr !== currentDate;
        currentDate = eventDateStr;

        return (
          <div key={`${event.sortKey}-${idx}`}>
            {/* Date Header */}
            {showDateHeader && (
              <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
                <div className="px-6 py-2 bg-gradient-to-r from-stone-100 to-stone-50 rounded-full border border-stone-200">
                  <span className="font-semibold text-stone-700">
                    {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-stone-300 via-transparent to-transparent" />
              </div>
            )}

            {/* Event Card */}
            <Link
              to={event.link}
              className="group flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-stone-200/50 rounded-2xl p-4 hover:bg-white hover:shadow-xl hover:border-stone-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-14 h-14 ${event.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900 text-lg mb-0.5 truncate group-hover:text-red-600 transition-colors">
                  {event.title}
                </h3>
                {event.subtitle && (
                  <p className="text-sm text-stone-500 truncate">{event.subtitle}</p>
                )}
              </div>

              {/* Time badge */}
              <div className="flex-shrink-0 px-3 py-1 bg-stone-100 rounded-full">
                <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
                  {format(event.date, 'HH:mm') === '00:00' ? 'Todo el día' : format(event.date, 'HH:mm')}
                </span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}