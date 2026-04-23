import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Calendar } from 'lucide-react';
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
    if (end && start.getTime() === end.getTime()) return format(start, 'd MMM', { locale: es });
    if (end) return `${format(start, 'd', { locale: es })}-${format(end, 'd MMM', { locale: es })}`;
    return format(start, 'd MMM', { locale: es });
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link to={createPageUrl(`CityDetail?id=${city.id}&trip_id=${tripId}`)}>
          <img
            src={city.image_url || cityImages[city.name] || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800'}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Info sobre la imagen */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <div className="text-white text-xl font-bold leading-tight">{city.name}</div>
              {city.country && <div className="text-white/80 text-sm mt-0.5">{city.country}</div>}
              <div className="flex items-center gap-3 mt-1">
                {city.start_date && (
                  <span className="flex items-center gap-1 text-white/85 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange()}
                  </span>
                )}
                {daysCount > 0 && (
                  <span className="text-white/75 text-xs">{daysCount} {daysCount === 1 ? 'día' : 'días'}</span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-700 flex items-center justify-center text-white border-2 border-white/30 flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>


      </div>
    </div>
  );
}