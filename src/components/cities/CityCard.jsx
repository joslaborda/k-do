import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const cityImages = {
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
  'Hiroshima': 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800',
  'Hakone': 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
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

  return (
    <Link 
      to={createPageUrl('CityDetail') + `?id=${city.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={city.image_url || cityImages[city.name] || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800'}
            alt={city.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Japan</span>
                </div>
                {city.start_date && (
                  <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDateRange()}</span>
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {city.name}
              </h3>
              {daysCount > 0 && (
                <p className="text-white text-sm mt-2 font-medium">
                  {daysCount} {daysCount === 1 ? 'día' : 'días'} planificados
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-slate-900 text-white">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}