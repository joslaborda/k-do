import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MapPin, Calendar, Plane, UtensilsCrossed, Receipt, 
  BookOpen, Package, Info, CheckCircle2, Clock, TrendingUp,
  ArrowRight, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list()
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.list()
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: () => base44.entities.DiaryEntry.list()
  });

  // Stats calculadas
  const tripStart = new Date('2026-03-04');
  const tripEnd = new Date('2026-03-19');
  const today = new Date();
  const daysUntilTrip = differenceInDays(tripStart, today);
  const tripDuration = differenceInDays(tripEnd, tripStart) + 1;
  
  const totalExpenses = expenses.reduce((sum, exp) => {
    if (exp.currency === 'JPY') return sum + exp.amount;
    return sum + (exp.amount * 160); // Conversión aproximada
  }, 0);

  const packedPercentage = packingItems.length > 0 
    ? Math.round((packingItems.filter(i => i.packed).length / packingItems.length) * 100) 
    : 0;

  const sections = [
    { name: 'Ruta', page: 'Cities', icon: MapPin, color: 'from-red-500 to-pink-500', emoji: '🗾' },
    { name: 'Calendario', page: 'Calendar', icon: Calendar, color: 'from-purple-500 to-indigo-500', emoji: '📅' },
    { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed, color: 'from-orange-500 to-red-500', emoji: '🍜' },
    { name: 'Gastos', page: 'Expenses', icon: Receipt, color: 'from-green-500 to-emerald-500', emoji: '💴' },
    { name: 'Diario', page: 'Diary', icon: BookOpen, color: 'from-amber-500 to-yellow-500', emoji: '📔' },
    { name: 'Maleta', page: 'Packing', icon: Package, color: 'from-blue-500 to-cyan-500', emoji: '🧳' },
    { name: 'Docs', page: 'Tickets', icon: Plane, color: 'from-slate-500 to-gray-500', emoji: '✈️' },
    { name: 'Útil', page: 'Utilities', icon: Info, color: 'from-teal-500 to-green-500', emoji: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20">
      {/* Hero moderno con imagen */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-pink-500 to-orange-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/50" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                placeholder="Buscar en tu viaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Aventura 2026</span>
              </div>
              
              <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-3">
                  Japón
                </h1>
                <p className="text-3xl font-light opacity-90">日本への旅</p>
              </div>
              
              <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                Una aventura única de 16 días explorando la cultura, tradición y gastronomía japonesa
              </p>

              {/* Countdown */}
              {daysUntilTrip > 0 && (
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30">
                  <Clock className="w-8 h-8" />
                  <div>
                    <div className="text-4xl font-bold">{daysUntilTrip}</div>
                    <div className="text-sm opacity-90">días para el viaje</div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="text-4xl mb-2">🏯</div>
                <div className="text-3xl font-bold text-white mb-1">{cities.length}</div>
                <div className="text-sm text-white/80">Ciudades</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-3xl font-bold text-white mb-1">{tripDuration}</div>
                <div className="text-sm text-white/80">Días de viaje</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-2xl font-bold text-white mb-1">
                  ¥{totalExpenses.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">Gastado</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="text-4xl mb-2">📔</div>
                <div className="text-3xl font-bold text-white mb-1">{diaryEntries.length}</div>
                <div className="text-sm text-white/80">Recuerdos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-stone-900">Progreso de maleta</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{packedPercentage}%</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${packedPercentage}%` }}
            />
          </div>
          <p className="text-sm text-stone-500 mt-2">
            {packingItems.filter(i => i.packed).length} de {packingItems.length} artículos empacados
          </p>
        </div>
      </div>

      {/* Navigation Cards - Glassmorphism */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-6 font-medium">Navega tu viaje</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Link
              key={section.page}
              to={createPageUrl(section.page)}
              className="group relative overflow-hidden bg-white rounded-2xl border-2 border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative p-6 flex flex-col items-center gap-3">
                <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                  {section.emoji}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-stone-900 group-hover:text-red-600 transition-colors">
                    {section.name}
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-stone-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Timeline Preview */}
      {cities.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-12 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest text-stone-400 font-medium">Tu itinerario</h2>
            <Link to={createPageUrl('Cities')}>
              <Button variant="ghost" size="sm" className="text-stone-600">
                Ver todo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {cities.slice(0, 3).map((city, idx) => (
              <Link
                key={city.id}
                to={createPageUrl('CityDetail') + `?id=${city.id}`}
                className="group bg-white rounded-xl border-2 border-stone-200 overflow-hidden hover:border-red-400 hover:shadow-lg transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 relative overflow-hidden">
                  {city.image_url ? (
                    <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                      {['🏯', '⛩️', '🗻'][idx % 3]}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-red-600">
                    {idx + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-stone-900 group-hover:text-red-600 transition-colors">
                    {city.name}
                  </h3>
                  {city.start_date && (
                    <p className="text-sm text-stone-500 mt-1">
                      {format(new Date(city.start_date), 'd MMM', { locale: es })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}