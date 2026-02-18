import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, ChevronRight } from 'lucide-react';

const cityImages = {
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
  'Hiroshima': 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800',
  'Hakone': 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
};

export default function CityCard({ city, daysCount }) {
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Japan</span>
              </div>
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {city.name}
              </h3>
              {daysCount > 0 && (
                <p className="text-white/70 text-sm mt-1">
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