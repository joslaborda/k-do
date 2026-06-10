import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Receipt, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function GlobalSearch({ open, onOpenChange, tripId }) {
  const [query, setQuery] = useState('');

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => tripId ? base44.entities.City.filter({ trip_id: tripId }) : [],
    enabled: !!tripId && open,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => tripId ? base44.entities.Expense.filter({ trip_id: tripId }) : [],
    enabled: !!tripId && open,
  });

  const { data: packingItems = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => tripId ? base44.entities.PackingItem.filter({ trip_id: tripId }) : [],
    enabled: !!tripId && open,
  });

  const filteredResults = {
    cities: cities.filter(c => c.name?.toLowerCase().includes(query.toLowerCase())),
    expenses: expenses.filter(e => e.description?.toLowerCase().includes(query.toLowerCase())),
    packing: packingItems.filter(p => p.name?.toLowerCase().includes(query.toLowerCase())),
  };

  const hasResults = query.length > 0 && (
    filteredResults.cities.length > 0 ||
    filteredResults.expenses.length > 0 ||
    filteredResults.packing.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
               placeholder="Buscar ciudades, gastos, maleta..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="pl-10"
               autoFocus
             />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {!query && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Escribe para buscar en tu viaje</p>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron resultados para &quot;{query}&quot;</p>
            </div>
          )}

          {hasResults && (
            <div className="space-y-6">
              {filteredResults.cities.length > 0 && (
                <ResultSection
                  title="Ciudades"
                  icon={MapPin}
                  items={filteredResults.cities.slice(0, 3)}
                  renderItem={(city) => (
                    <Link
                      key={city.id}
                      to={createPageUrl(`CityDetail?id=${city.id}&trip_id=${tripId}`)}
                      onClick={() => onOpenChange(false)}
                      className="block p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="font-medium text-foreground">{city.name}</div>
                      <div className="text-sm text-muted-foreground">{city.country}</div>
                    </Link>
                  )}
                />
              )}

              {filteredResults.expenses.length > 0 && (
                <ResultSection
                  title="Gastos"
                  icon={Receipt}
                  items={filteredResults.expenses.slice(0, 3)}
                  renderItem={(expense) => (
                    <Link
                      key={expense.id}
                      to={createPageUrl(`Expenses?trip_id=${tripId}`)}
                      onClick={() => onOpenChange(false)}
                      className="block p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="font-medium text-foreground">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.amount} {expense.currency}
                      </div>
                    </Link>
                  )}
                />
              )}

              {filteredResults.packing.length > 0 && (
                <ResultSection
                  title="Maleta"
                  icon={Package}
                  items={filteredResults.packing.slice(0, 3)}
                  renderItem={(item) => (
                    <Link
                      key={item.id}
                      to={createPageUrl(`Utilities?trip_id=${tripId}`)}
                      onClick={() => onOpenChange(false)}
                      className="block p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
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

function ResultSection({ title, icon: Icon, items, renderItem }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{title}</span>
        <span className="ml-auto text-xs">{items.length}</span>
      </div>
      <div className="space-y-1">
        {items.map(renderItem)}
      </div>
    </div>
  );
}
