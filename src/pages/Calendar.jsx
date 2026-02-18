import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TimelineView from '@/components/TimelineView';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-03-01'));

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list()
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list()
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: () => base44.entities.DiaryEntry.list()
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getCityForDate = (date) => {
    return cities.find(city => {
      if (!city.start_date) return false;
      const start = new Date(city.start_date);
      const end = city.end_date ? new Date(city.end_date) : start;
      return isWithinInterval(date, { start, end });
    });
  };

  const getEventsForDate = (date) => {
    const events = [];
    
    const dayEntry = itineraryDays.find(day => 
      day.date && isSameDay(new Date(day.date), date)
    );
    if (dayEntry) events.push({ type: 'itinerary', data: dayEntry });

    const dayExpenses = expenses.filter(exp =>
      exp.date && isSameDay(new Date(exp.date), date)
    );
    if (dayExpenses.length > 0) events.push({ type: 'expense', count: dayExpenses.length });

    const diary = diaryEntries.find(entry =>
      entry.date && isSameDay(new Date(entry.date), date)
    );
    if (diary) events.push({ type: 'diary', data: diary });

    return events;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const tripStart = new Date('2026-03-04');
  const tripEnd = new Date('2026-03-19');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Calendario 📅</h1>
              <p className="text-stone-600">Vista completa de tu viaje a Japón</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Vista Calendario
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <List className="w-4 h-4" />
              Vista Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-bold text-stone-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px bg-stone-200">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="bg-stone-50 p-3 text-center">
                <span className="text-xs font-semibold text-stone-600 uppercase">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-stone-200">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-stone-50 min-h-[120px]" />
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const city = getCityForDate(day);
              const events = getEventsForDate(day);
              const isInTrip = isWithinInterval(day, { start: tripStart, end: tripEnd });
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 relative ${
                    isInTrip ? 'bg-red-50' : 'bg-white'
                  } hover:bg-stone-50 transition-colors`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday 
                      ? 'w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center'
                      : isInTrip
                      ? 'text-red-600 font-bold'
                      : 'text-stone-600'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  {city && (
                    <Link
                      to={createPageUrl('CityDetail') + `?id=${city.id}`}
                      className="block mb-1"
                    >
                      <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-200 cursor-pointer">
                        <MapPin className="w-3 h-3 mr-1" />
                        {city.name}
                      </Badge>
                    </Link>
                  )}

                  <div className="space-y-1">
                    {events.map((event, idx) => (
                      <div key={idx}>
                        {event.type === 'itinerary' && (
                          <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded truncate">
                            📝 {event.data.title}
                          </div>
                        )}
                        {event.type === 'expense' && (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            💰 {event.count} gastos
                          </div>
                        )}
                        {event.type === 'diary' && (
                          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded truncate">
                            📔 {event.data.title || 'Entrada'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView
              cities={cities}
              expenses={expenses}
              diaryEntries={diaryEntries}
              itineraryDays={itineraryDays}
            />
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
            <span className="text-sm text-stone-600">Días de viaje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full" />
            <span className="text-sm text-stone-600">Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Ciudad
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">📝 Plan</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">💰 Gasto</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded">📔 Diario</div>
          </div>
        </div>
      </div>
    </div>
  );
}