import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTripCoverImage } from '@/lib/tripImage';

function getTripStatus(trip) {
  if (!trip.start_date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(trip.start_date);
  const end = trip.end_date ? new Date(trip.end_date) : null;

  if (today < start) {
    const days = differenceInDays(start, today);
    return { label: `En ${days} día${days !== 1 ? 's' : ''}`, type: 'upcoming' };
  }
  if (end && today > end) {
    return { label: 'Finalizado', type: 'past' };
  }
  return { label: 'En curso', type: 'active' };
}

function getTripDuration(trip) {
  if (!trip.start_date || !trip.end_date) return null;
  const days = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  return days;
}

function formatDateRange(trip) {
  if (!trip.start_date) return null;
  const start = format(new Date(trip.start_date), 'd MMM', { locale: es });
  if (!trip.end_date) return start;
  const end = format(new Date(trip.end_date), 'd MMM', { locale: es });
  return `${start} – ${end}`;
}

function getRouteSubtitle(trip, cities) {
  if (cities.length > 0) {
    const sorted = [...cities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return sorted.map(c => c.name).join(' → ');
  }
  return trip.country || trip.destination || '';
}

const statusStyles = {
  upcoming: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  past: 'bg-gray-100 text-gray-500',
};

export default function TripCard({ trip, cities = [] }) {
  const coverImage = getTripCoverImage(trip, cities);
  const status = getTripStatus(trip);
  const duration = getTripDuration(trip);
  const dateRange = formatDateRange(trip);
  const subtitle = getRouteSubtitle(trip, cities);

  return (
    <Link to={createPageUrl(`Home?trip_id=${trip.id}`)}>
      <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        {/* Cover Image */}
        <div className="h-44 relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-700">
          <img
            src={coverImage}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Status badge */}
          {status && (
            <div className="absolute top-3 right-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status.type]}`}>
                {status.label}
              </span>
            </div>
          )}

          {/* Title + subtitle over image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white drop-shadow leading-tight mb-0.5">{trip.name}</h3>
            {subtitle && (
              <p className="text-white/80 text-xs font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Info row */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Dates + duration */}
          <div className="min-w-0">
            {dateRange ? (
              <p className="text-sm font-medium text-foreground truncate">
                {dateRange}{duration ? <span className="text-muted-foreground font-normal"> · {duration} días</span> : ''}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin fechas</p>
            )}
          </div>

          {/* Travelers + currency */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {trip.members?.length || 1}
            </span>
            {trip.currency && (
              <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full font-medium">
                {trip.currency}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}