import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Calendar } from 'lucide-react';
import AccommodationInput from './AccommodationInput';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const cityImages = {
  Osaka: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
  Hiroshima: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800',
  Hakone: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800',
  Kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
};

export default function CityCard({ city, daysCount, tripId }) {
  const formatDateRange = () => {
    if (!city.start_date) return null;
    const start = new Date(city.start_date);
    const end = city.end_date ? new Date(city.end_date) : null;

    if (end && start.getTime() === end.getTime()) {
      return format(start, 'd MMM', { locale: es });
    }
    if (end) {
      return `${format(start, 'd', { locale: es })}-${format(end, 'd MMM', { locale: es })}`;
    }
    return format(start, 'd MMM', { locale: es });
  };

  const countryLabel = city.country ? city.country : '';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link
        to={createPageUrl(`CityDetail?id=${city.id}&trip_id=${tripId}`)}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={city.image_url || cityImages[city.name] || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800'}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-white text-xl font-bold leading-tight">{city.name}</div>

            {countryLabel && (
              <div className="text-white/80 text-sm mt-1">{countryLabel}</div>
            )}

            {city.start_date && (
              <div className="flex items-center gap-1.5 text-white/85 text-sm mt-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <h4 className="text-lg font-semibold text-foreground mb-2">{city.name}</h4>

          {daysCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {daysCount} {daysCount === 1 ? 'día' : 'días'} planificados
            </div>
          )}

          <div className="mt-4">
            <AccommodationInput city={city} tripId={tripId} />
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center transition-all duration-200 hover:bg-white text-white hover:text-orange-700 border border-orange-700"
        aria-label="Abrir ciudad"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}