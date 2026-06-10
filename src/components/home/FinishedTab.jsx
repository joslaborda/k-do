import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, Calendar, Compass, DollarSign, MapPin, Users } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';
import { base44 } from '@/api/base44Client';

export default function FinishedTab({ trip, cities, expenses, spots, tripId, currentUserEmail }) {
  const { data: allTripSpots = spots } = useQuery({
    queryKey: ['allTripSpots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 0,
  });

  const totalDays = (trip?.start_date && trip?.end_date)
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : null;
  const totalSpent  = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const avgPerDay   = totalDays ? totalSpent / totalDays : 0;
  const visitedSpots = allTripSpots.filter(s => !!s.assigned_date).length;
  const currency    = trip?.currency || 'EUR';
  const members     = trip?.members?.length || 1;

  const allCountries = useMemo(() => {
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
    const countries = [...allCountries];
    if (countries.length === 0) return trip?.destination || '';
    if (countries.length === 1) return countries[0];
    if (countries.length === 2) return countries.join(' y ');
    return countries.slice(0, -1).join(', ') + ' y ' + countries[countries.length - 1];
  })();

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl border border-orange-200 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <PlaneIcon className="w-7 h-7 text-muted-foreground/50" />
        </div>
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
          { label: 'Spots visitados', value: visitedSpots, Icon: Compass },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <s.Icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
        <div className="bg-card rounded-2xl border border-border p-4 col-span-2">
          <DollarSign className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground mb-0.5">Tu parte</p>
          {(() => {
            const myShare = expenses.reduce((s, e) => {
              if (!e.split_with?.includes(currentUserEmail) && e.paid_by !== currentUserEmail) return s;
              if (e.split_type === 'custom') return s + parseFloat(e.amounts_by_user?.[currentUserEmail] || 0);
              const n = (e.split_with?.length || 1);
              return s + (e.amount || 0) / n;
            }, 0);
            return (
              <>
                <p className="text-xl font-semibold text-foreground">{myShare.toFixed(0)} {currency}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total grupo: <span className="font-medium text-foreground">{totalSpent.toFixed(0)} {currency}</span>
                  {' · '}{avgPerDay.toFixed(0)} {currency}/día
                </p>
              </>
            );
          })()}
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
