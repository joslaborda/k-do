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
    { name: 'Comida', page: 'Restaurants', icon: '🍜' },
    { name: 'Gastos', page: 'Expenses', icon: '💴' },
    { name: 'Idioma', page: 'Translator', icon: '🗣️' }
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
    <div className="min-h-screen bg-white">
      {/* Hero - Ultra Minimal */}
      <div className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <div className="w-24 h-24 rounded-full border-2 border-stone-300 flex items-center justify-center text-5xl">
                🌸
              </div>
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-extralight text-stone-900 tracking-tight mb-3">
                Japón
              </h1>
              <p className="text-stone-500 text-lg md:text-xl font-light tracking-wide">
                11 abril — 1 mayo 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid - Clean Boxes */}
      <div className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {sections.map((section) => (
              <Link
                key={section.page}
                to={createPageUrl(section.page)}
                className="group aspect-square border border-stone-200 hover:border-stone-900 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-white"
              >
                <span className="text-4xl md:text-5xl">{section.icon}</span>
                <span className="text-xs md:text-sm text-stone-600 group-hover:text-stone-900 font-light tracking-wide uppercase">
                  {section.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Cities - Typography Focus */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-8 font-light">Itinerario</h2>
        
        {cities.length === 0 ? (
          <div className="text-center py-24 border border-stone-200">
            <div className="text-6xl mb-6 opacity-30">⛩️</div>
            <p className="text-stone-400 font-light tracking-wide">Sin ciudades aún</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cities.map((city, idx) => (
              <Link
                key={city.id}
                to={createPageUrl('CityDetail') + `?id=${city.id}`}
                className="group block border-b border-stone-200 py-6 hover:bg-stone-50 transition-colors -mx-6 px-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-6">
                    <span className="text-sm text-stone-400 font-light w-8">{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="text-2xl md:text-3xl font-light text-stone-900 tracking-tight">
                      {city.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {city.start_date && (
                      <span className="text-sm text-stone-500 font-light tracking-wide hidden md:block">
                        {formatDateRange(city)}
                      </span>
                    )}
                    <span className="text-stone-300 group-hover:text-stone-900 transition-colors text-xl">
                      →
                    </span>
                  </div>
                </div>
                {city.start_date && (
                  <span className="text-xs text-stone-400 font-light tracking-wide md:hidden block mt-2 ml-14">
                    {formatDateRange(city)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}