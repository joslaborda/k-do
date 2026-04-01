import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTripCoverImage } from '@/lib/tripImage';

export default function TripCard({ trip, cities = [] }) {
  const coverImage = getTripCoverImage(trip, cities);

  return (
    <Link to={createPageUrl(`Home?trip_id=${trip.id}`)}>
      <div className="glass border-2 border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-primary to-orange-600 relative overflow-hidden">
          <img
            src={coverImage}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* City pills if route exists */}
          {cities.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[90%]">
              {cities.slice(0, 3).map(c => (
                <span key={c.id} className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                  📍 {c.name}
                </span>
              ))}
              {cities.length > 3 && (
                <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                  +{cities.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow">{trip.name}</h3>
            <p className="text-white/90 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}{trip.country && trip.country !== trip.destination ? `, ${trip.country}` : ''}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-neutral-50 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            {trip.start_date && format(new Date(trip.start_date), 'dd MMM', { locale: es })}
            {trip.end_date && ` – ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
          </div>

          {trip.description && (
            <p className="text-sm text-foreground line-clamp-2 mb-3">{trip.description}</p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {trip.members?.length || 1} viajero{(trip.members?.length || 1) > 1 ? 's' : ''}
            </div>
            <span className="text-xs px-2 py-1 bg-secondary rounded-full text-foreground">
              {trip.currency}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}