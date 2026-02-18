import { useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Receipt, BookOpen, Package, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TimelineView({ cities, expenses, diaryEntries, itineraryDays, tickets }) {
  const timelineEvents = useMemo(() => {
    const events = [];

    // Add cities with their date ranges
    cities.forEach(city => {
      if (city.start_date) {
        events.push({
          date: new Date(city.start_date),
          type: 'city',
          icon: MapPin,
          title: `Llegada a ${city.name}`,
          link: createPageUrl('CityDetail') + `?id=${city.id}`,
          color: 'text-red-600 bg-red-50',
          data: city
        });
      }
      if (city.end_date) {
        events.push({
          date: new Date(city.end_date),
          type: 'city_end',
          icon: MapPin,
          title: `Salida de ${city.name}`,
          link: createPageUrl('CityDetail') + `?id=${city.id}`,
          color: 'text-orange-600 bg-orange-50',
          data: city
        });
      }
    });

    // Add itinerary days
    itineraryDays.forEach(day => {
      if (day.date) {
        const city = cities.find(c => c.id === day.city_id);
        events.push({
          date: new Date(day.date),
          type: 'itinerary',
          icon: Calendar,
          title: day.title,
          subtitle: city?.name,
          link: createPageUrl('CityDetail') + `?id=${day.city_id}`,
          color: 'text-purple-600 bg-purple-50',
          data: day
        });
      }
    });

    // Add diary entries
    diaryEntries.forEach(entry => {
      if (entry.date) {
        events.push({
          date: new Date(entry.date),
          type: 'diary',
          icon: BookOpen,
          title: entry.title || 'Entrada del diario',
          subtitle: entry.location,
          link: createPageUrl('Diary'),
          color: 'text-amber-600 bg-amber-50',
          data: entry
        });
      }
    });

    // Add expenses (only significant ones or group by day)
    const expensesByDate = expenses.reduce((acc, exp) => {
      if (exp.date) {
        const dateKey = format(new Date(exp.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(exp);
      }
      return acc;
    }, {});

    Object.entries(expensesByDate).forEach(([dateStr, dayExpenses]) => {
      const total = dayExpenses.reduce((sum, exp) => {
        const amount = exp.currency === 'EUR' ? exp.amount * 160 : exp.amount;
        return sum + amount;
      }, 0);

      events.push({
        date: new Date(dateStr),
        type: 'expenses',
        icon: Receipt,
        title: `${dayExpenses.length} gastos`,
        subtitle: `¥${Math.round(total).toLocaleString()}`,
        link: createPageUrl('Expenses'),
        color: 'text-green-600 bg-green-50',
        data: dayExpenses
      });
    });

    // Add tickets (flights, trains, hotels, etc.)
    if (tickets) {
      tickets.forEach(ticket => {
        if (ticket.date) {
          const categoryLabels = {
            flight: 'Vuelo',
            train: 'Tren',
            hotel: 'Hotel',
            freetour: 'Free Tour',
            insurance: 'Seguro'
          };

          events.push({
            date: new Date(ticket.date),
            type: 'ticket',
            icon: Plane,
            title: ticket.name,
            subtitle: categoryLabels[ticket.category] || ticket.category,
            link: createPageUrl('Tickets'),
            color: 'text-blue-600 bg-blue-50',
            data: ticket
          });
        }
      });
    }

    // Sort by date
    return events.sort((a, b) => a.date - b.date).filter(e => isValid(e.date));
  }, [cities, expenses, diaryEntries, itineraryDays, tickets]);

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
        <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-400">Todavía no hay eventos en tu timeline</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-200 via-purple-200 to-blue-200" />

      <div className="space-y-8">
        {timelineEvents.map((event, idx) => {
          const Icon = event.icon;
          return (
            <div key={idx} className="relative flex gap-6 group">
              {/* Timeline dot */}
              <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full ${event.color} flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <Link
                to={event.link}
                className="flex-1 bg-white border-2 border-stone-200 rounded-xl p-5 hover:border-stone-300 hover:shadow-lg transition-all -mt-2"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">{event.title}</h3>
                    {event.subtitle && (
                      <p className="text-sm text-stone-500 mt-0.5">{event.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider">
                    {event.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-stone-600 font-medium">
                  {format(event.date, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}