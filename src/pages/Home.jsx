import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Plane, UtensilsCrossed, Receipt, ChevronRight, Sparkles, Languages } from 'lucide-react';
import CityCard from '@/components/cities/CityCard';

export default function Home() {
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list(),
  });

  const getDaysCount = (cityId) => {
    return itineraryDays.filter(day => day.city_id === cityId).length;
  };

  const sections = [
    { 
      name: 'Documentación', 
      page: 'Tickets', 
      icon: Plane, 
      emoji: '📋',
      description: 'Documentos y checklist'
    },
    { 
      name: 'Restaurantes', 
      page: 'Restaurants', 
      icon: UtensilsCrossed, 
      emoji: '🍜',
      description: 'Dónde comer'
    },
    { 
      name: 'Gastos', 
      page: 'Expenses', 
      icon: Receipt, 
      emoji: '💴',
      description: 'Dividir con Carlos'
    },
    { 
      name: 'Traductor', 
      page: 'Translator', 
      icon: Languages, 
      emoji: '🗣️',
      description: 'Frases útiles'
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative bg-white text-stone-900 border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="text-7xl md:text-8xl mb-6">🗾</div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-3">
              Japón 2026
            </h1>
            <p className="text-stone-500 text-lg max-w-md">
              1 marzo — 18 marzo
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {sections.map((section) => (
            <Link
              key={section.page}
              to={createPageUrl(section.page)}
              className="group relative bg-white border border-stone-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-sm transition-all"
            >
              <div className="text-4xl mb-3">{section.emoji}</div>
              <h3 className="font-medium text-stone-900 text-sm">{section.name}</h3>
              <p className="text-xs text-stone-400 mt-1">{section.description}</p>
            </Link>
          ))}
        </div>

        {/* Cities */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-stone-900 mb-1">Ruta</h2>
          <p className="text-stone-400 text-sm">5 ciudades · 17 días</p>
        </div>

        <div className="space-y-3">
          {cities.map((city, index) => (
            <Link 
              key={city.id}
              to={createPageUrl('CityDetail') + `?id=${city.id}`}
              className="block group"
            >
              <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-red-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{['🏯', '⛩️', '🗻', '♨️', '🗼'][index] || '📍'}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-900">{city.name}</h3>
                    <p className="text-sm text-stone-400 mt-0.5">
                      {city.start_date && new Date(city.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      {city.end_date && city.start_date !== city.end_date && ` — ${new Date(city.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-red-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <div className="text-5xl mb-4">🗾</div>
            <h3 className="text-lg font-medium text-stone-700 mb-2">Sin ciudades todavía</h3>
            <p className="text-stone-400 mb-6">Empieza a planificar tu ruta</p>
            <Link
              to={createPageUrl('Cities')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors text-sm"
            >
              Añadir ciudades
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}