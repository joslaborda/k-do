import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import GlobalSearch from '@/components/GlobalSearch';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MapPin, Calendar, Plane, UtensilsCrossed, Receipt, 
  BookOpen, Package, Info, CheckCircle2, Clock, TrendingUp,
  ArrowRight, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';
import { motion } from 'framer-motion';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list()
  });

  const { data: packingItems = [], isLoading: packingLoading } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.list()
  });

  const { data: diaryEntries = [], isLoading: diaryLoading } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: () => base44.entities.DiaryEntry.list()
  });

  // Stats calculadas con memoization
  const tripStart = new Date('2026-03-04');
  const tripEnd = new Date('2026-03-19');
  const today = new Date();
  const daysUntilTrip = differenceInDays(tripStart, today);
  const tripDuration = differenceInDays(tripEnd, tripStart) + 1;
  
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => {
      if (exp.currency === 'JPY') return sum + exp.amount;
      return sum + (exp.amount * 160);
    }, 0);
  }, [expenses]);

  const packedPercentage = useMemo(() => {
    if (packingItems.length === 0) return 0;
    return Math.round((packingItems.filter(i => i.packed).length / packingItems.length) * 100);
  }, [packingItems]);

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
            <button
              onClick={() => setSearchOpen(true)}
              className="relative w-full max-w-md"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <div className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 text-white/60 placeholder:text-white/60 backdrop-blur-sm rounded-lg text-left hover:bg-white/30 transition-colors">
                Buscar en tu viaje...
              </div>
            </button>
          </div>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

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
            {citiesLoading || expensesLoading || packingLoading || diaryLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 animate-pulse">
                    <div className="h-10 w-10 bg-white/20 rounded-lg mb-2" />
                    <div className="h-8 w-16 bg-white/20 rounded mb-1" />
                    <div className="h-4 w-20 bg-white/20 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30"
                >
                  <div className="text-4xl mb-2">🏯</div>
                  <div className="text-3xl font-bold text-white mb-1">{cities.length}</div>
                  <div className="text-sm text-white/80">Ciudades</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30"
                >
                  <div className="text-4xl mb-2">📅</div>
                  <div className="text-3xl font-bold text-white mb-1">{tripDuration}</div>
                  <div className="text-sm text-white/80">Días de viaje</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30"
                >
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ¥{totalExpenses.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/80">Gastado</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30"
                >
                  <div className="text-4xl mb-2">📔</div>
                  <div className="text-3xl font-bold text-white mb-1">{diaryEntries.length}</div>
                  <div className="text-sm text-white/80">Recuerdos</div>
                </motion.div>
              </div>
            )}
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
          {sections.map((section, idx) => (
            <motion.div
              key={section.page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={createPageUrl(section.page)}
                className="group relative overflow-hidden bg-white rounded-2xl border-2 border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
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
            </motion.div>
          ))}
        </div>
      </div>


    </div>
  );
}