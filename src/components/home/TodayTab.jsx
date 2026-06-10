import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, parseISO } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { ArrowRight } from 'lucide-react';
import PDFViewer from '@/components/PDFViewer';
import DayCard from './DayCard';
import MemberAvatarRow from './MemberAvatarRow';

export default function TodayTab({ trip, cities, tripId, profiles, onInvite, currentUserEmail }) {
  const [lightbox, setLightbox] = useState(null);
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr    = format(today, 'yyyy-MM-dd');
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
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }),
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

  const docsForDate  = (dateStr) => allDocs.filter(d => d.date === dateStr || d.valid_from === dateStr || d.start_date === dateStr);
  const spotsForDate = (cityId, dateStr) =>
    allSpots.filter(s => s.city_id === cityId && s.assigned_date === dateStr)
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

  const handleUpdateItemTime = async (item, time) => {
    if (item._kind === 'doc') {
      await base44.entities.Ticket.update(item.id, { time });
      queryClient.invalidateQueries({ queryKey: ['allDocs', tripId] });
    } else if (item._kind === 'spot') {
      await base44.entities.Spot.update(item.id, { assigned_time: time });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    }
  };

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
          dateStr={todayStr}
          tripId={tripId}
          defaultOpen={true}
          onReorderSpots={handleReorder}
          onUpdateItemTime={handleUpdateItemTime}
        />
      )}

      {tomorrowCity && tomorrowCity.id !== todayCity?.id && (
        <DayCard
          label="Mañana"
          city={tomorrowCity}
          docs={docsForDate(tomorrowStr)}
          spots={spotsForDate(tomorrowCity.id, tomorrowStr)}
          itineraryDays={itineraryDays}
          dateStr={tomorrowStr}
          tripId={tripId}
          defaultOpen={false}
          onReorderSpots={handleReorder}
          onUpdateItemTime={handleUpdateItemTime}
        />
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <MemberAvatarRow trip={trip} profiles={profiles} onInvite={onInvite} currentUserEmail={currentUserEmail} />
      </div>

      {lightbox && (
        <PDFViewer fileUrl={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
