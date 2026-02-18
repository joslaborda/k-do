import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const sections = [
    { name: 'Ruta', page: 'Cities', icon: '🗾' },
    { name: 'Docs', page: 'Tickets', icon: '✈️' },
    { name: 'Yummy', page: 'Restaurants', icon: '🍜' },
    { name: 'Gastos', page: 'Expenses', icon: '💴' },
    { name: 'Diario', page: 'Diary', icon: '📔' },
    { name: 'Maleta', page: 'Packing', icon: '🧳' },
    { name: 'Útil', page: 'Utilities', icon: '🔧' }
  ];

  const formatDateRange = (city) => {
    if (!city.start_date) return '';
    const start = new Date(city.start_date);
    const end = city.end_date ? new Date(city.end_date) : null;
    if (end && start.getTime() !== end.getTime()) {
      return `${format(start, 'd', { locale: es })}—${format(end, 'd MMM', { locale: es })}`;
    }
    return format(start, 'd MMM', { locale: es });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/20 to-white">
      {/* Hero - Inspirado en diseño japonés */}
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full border-2 border-red-200/30" />
        <div className="absolute top-40 left-10 w-20 h-20 rounded-full border border-stone-200/50" />
        <div className="absolute bottom-20 right-1/4 text-8xl opacity-5">🌸</div>
        
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-red-50 rounded-full">
                <span className="text-sm text-red-600 font-light tracking-widest uppercase">Aventura 2026</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-stone-900 leading-tight">
                Japón
                <span className="block text-red-600 text-5xl md:text-6xl mt-2">日本</span>
              </h1>
              
              <p className="text-xl text-stone-600 font-light leading-relaxed">
                Una experiencia única a través de la cultura, gastronomía y tradición japonesa
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-500">Fechas</p>
                    <p className="font-medium text-stone-900">4 marzo — 19 marzo</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-stone-200" />
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                    🏯
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-500">Ciudades</p>
                    <p className="font-medium text-stone-900">{cities.length} destinos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative">
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-red-100 via-red-50 to-white border border-red-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 text-6xl">🗻</div>
                  <div className="absolute bottom-10 right-10 text-6xl">⛩️</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🌸</div>
                </div>
                <div className="relative text-9xl filter drop-shadow-lg">
                  🍜
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-6 font-light">Explora</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {sections.map((section) => (
            <Link
              key={section.page}
              to={createPageUrl(section.page)}
              className="group relative aspect-square border-2 border-stone-200 hover:border-red-400 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/0 group-hover:from-red-50/50 group-hover:to-transparent transition-all duration-300" />
              <span className="text-5xl md:text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">{section.icon}</span>
              <span className="text-sm text-stone-700 group-hover:text-red-600 font-medium tracking-wide uppercase relative z-10">
                {section.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Cities Timeline */}
      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
        <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-8 font-light">Itinerario</h2>
        
        {cities.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
            <div className="text-6xl mb-6 opacity-30">⛩️</div>
            <p className="text-stone-400 font-light tracking-wide">Sin ciudades aún</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-red-200 via-red-300 to-red-200 hidden md:block" />
            
            <div className="space-y-6">
              {cities.map((city, idx) => (
                <Link
                  key={city.id}
                  to={createPageUrl('CityDetail') + `?id=${city.id}`}
                  className="group block relative"
                >
                  <div className="flex items-start gap-6">
                    {/* Number badge */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-red-400 flex items-center justify-center text-red-600 font-bold group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                    
                    {/* Content card */}
                    <div className="flex-1 bg-white border-2 border-stone-200 rounded-2xl p-6 group-hover:border-red-400 group-hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-stone-900 mb-1">
                            {city.name}
                          </h3>
                          {city.start_date && (
                            <p className="text-sm text-stone-500 font-light tracking-wide">
                              {formatDateRange(city)}
                            </p>
                          )}
                        </div>
                        <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}