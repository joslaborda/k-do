import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Plane, UtensilsCrossed, Receipt, ChevronRight, Sparkles } from 'lucide-react';
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
      name: 'Tickets', 
      page: 'Tickets', 
      icon: Plane, 
      color: 'from-sky-500 to-blue-600',
      description: 'Flights, trains, hotels'
    },
    { 
      name: 'Restaurants', 
      page: 'Restaurants', 
      icon: UtensilsCrossed, 
      color: 'from-orange-500 to-red-500',
      description: 'Places to eat'
    },
    { 
      name: 'Expenses', 
      page: 'Expenses', 
      icon: Receipt, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Split costs with Carlos'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600" 
            alt="Japan"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span>Japan 2025</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Japan Adventure
          </h1>
          <p className="text-xl text-white/70 max-w-xl">
            Your complete travel companion for exploring the Land of the Rising Sun with Carlos
          </p>
          
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-sm font-medium">
                Y
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center text-sm font-medium">
                C
              </div>
            </div>
            <span className="text-white/60 text-sm">You & Carlos</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {sections.map((section) => (
            <Link
              key={section.page}
              to={createPageUrl(section.page)}
              className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-slate-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${section.color} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">{section.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{section.description}</p>
            </Link>
          ))}
        </div>

        {/* Cities */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cities</h2>
            <p className="text-slate-500 mt-1">Your journey through Japan</p>
          </div>
          <Link
            to={createPageUrl('Cities')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.slice(0, 6).map((city) => (
            <CityCard 
              key={city.id} 
              city={city} 
              daysCount={getDaysCount(city.id)}
            />
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No cities yet</h3>
            <p className="text-slate-500 mb-4">Start planning your Japan adventure</p>
            <Link
              to={createPageUrl('Cities')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Add cities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}