import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Receipt, BookOpen, UtensilsCrossed, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order')
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: () => base44.entities.DiaryEntry.list('-date')
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list()
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.list()
  });

  const searchResults = query.length > 1 ? {
    cities: cities.filter(c => c.name?.toLowerCase().includes(query.toLowerCase())),
    expenses: expenses.filter(e => e.description?.toLowerCase().includes(query.toLowerCase())),
    diary: diaryEntries.filter(d => 
      d.title?.toLowerCase().includes(query.toLowerCase()) || 
      d.content?.toLowerCase().includes(query.toLowerCase())
    ),
    restaurants: restaurants.filter(r => r.name?.toLowerCase().includes(query.toLowerCase())),
    packing: packingItems.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()))
  } : { cities: [], expenses: [], diary: [], restaurants: [], packing: [] };

  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white/95 backdrop-blur-xl">
        <div className="p-6 pb-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              placeholder="Buscar ciudades, gastos, diario, restaurantes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-lg h-14 border-2"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-6 pt-4">
          {query.length <= 1 ? (
            <p className="text-center text-stone-400 py-8">Escribe al menos 2 caracteres para buscar</p>
          ) : totalResults === 0 ? (
            <p className="text-center text-stone-400 py-8">No se encontraron resultados</p>
          ) : (
            <div className="space-y-6">
              {searchResults.cities.length > 0 && (
                <ResultSection
                  title="Ciudades"
                  icon={MapPin}
                  color="text-red-600"
                  results={searchResults.cities}
                  renderItem={(city) => (
                    <Link
                      to={createPageUrl('CityDetail') + `?id=${city.id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-3 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{city.name}</span>
                    </Link>
                  )}
                />
              )}

              {searchResults.expenses.length > 0 && (
                <ResultSection
                  title="Gastos"
                  icon={Receipt}
                  color="text-green-600"
                  results={searchResults.expenses}
                  renderItem={(expense) => (
                    <Link
                      to={createPageUrl('Expenses')}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center justify-between p-3 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{expense.description}</span>
                      </div>
                      <span className="text-sm text-stone-500">
                        {expense.currency === 'EUR' ? '€' : '¥'}{expense.amount}
                      </span>
                    </Link>
                  )}
                />
              )}

              {searchResults.diary.length > 0 && (
                <ResultSection
                  title="Diario"
                  icon={BookOpen}
                  color="text-amber-600"
                  results={searchResults.diary}
                  renderItem={(entry) => (
                    <Link
                      to={createPageUrl('Diary')}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-3 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="font-medium">{entry.title || 'Entrada del diario'}</div>
                        {entry.content && (
                          <div className="text-sm text-stone-500 truncate">
                            {entry.content.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                />
              )}

              {searchResults.restaurants.length > 0 && (
                <ResultSection
                  title="Restaurantes"
                  icon={UtensilsCrossed}
                  color="text-orange-600"
                  results={searchResults.restaurants}
                  renderItem={(restaurant) => (
                    <Link
                      to={createPageUrl('Restaurants')}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-3 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        {restaurant.city && (
                          <div className="text-sm text-stone-500">{restaurant.city}</div>
                        )}
                      </div>
                    </Link>
                  )}
                />
              )}

              {searchResults.packing.length > 0 && (
                <ResultSection
                  title="Maleta"
                  icon={Package}
                  color="text-blue-600"
                  results={searchResults.packing}
                  renderItem={(item) => (
                    <Link
                      to={createPageUrl('Packing')}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 p-3 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultSection({ title, icon: Icon, color, results, renderItem }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-semibold text-stone-700">{title}</span>
        <span className="text-xs text-stone-400">({results.length})</span>
      </div>
      <div className="space-y-1">
        {results.slice(0, 3).map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}