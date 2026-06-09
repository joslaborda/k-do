import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const menuCategories = [
  {
    name: 'Platos principales',
    dishes: ['Ramen', 'Shoyu ramen', 'Miso ramen', 'Tonkotsu ramen', 'Udon', 'Soba', 'Yakisoba']
  },
  {
    name: 'Curry y occidentales',
    dishes: ['Japanese curry', 'Katsu curry', 'Beef curry', 'Doria', 'Napolitan pasta', 'Gratin', 'Cream stew']
  },
  {
    name: 'Arroces y bowls',
    dishes: ['Gyudon', 'Oyakodon', 'Katsudon', 'Tendon', 'Curry rice', 'Omurice', 'Donburi']
  },
  {
    name: 'Sushi y pescado',
    dishes: ['Sushi', 'Sashimi', 'Nigiri', 'Maki', 'Chirashi', 'Tekka don', 'Unagi don']
  },
  {
    name: 'Carne y fritos',
    dishes: ['Karaage', 'Tonkatsu', 'Chicken katsu', 'Yakiniku', 'Sukiyaki', 'Shabu shabu']
  },
  {
    name: 'Callejera e izakaya',
    dishes: ['Yakitori', 'Okonomiyaki', 'Takoyaki', 'Kushikatsu', 'Taiyaki']
  },
  {
    name: 'Dulces y postres',
    dishes: ['Mochi', 'Daifuku', 'Dango', 'Dorayaki', 'Matcha cake', 'Matcha ice cream']
  }
];

export default function MenuViewer({ foodItems = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({ 'Platos principales': true });
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const findDishLocally = (dish) => {
    return foodItems.find(item => 
      item.name.toLowerCase() === dish.toLowerCase() ||
      item.name.toLowerCase().includes(dish.toLowerCase())
    );
  };

  const searchDish = async (dish) => {
    setSelectedDish(dish);
    setIsSearching(true);
    
    try {
      const localResult = findDishLocally(dish);
      
      if (localResult) {
        setSearchResults({
          dish,
          source: 'app',
          result: localResult.description,
          image: localResult.image_url || localResult.default_image
        });
      } else {
        setSearchResults({
          dish,
          source: 'local',
          result: 'Información no disponible para este plato.',
          image: null
        });
      }
    } catch (error) {
      setSearchResults({
        dish,
        source: 'error',
        result: 'No se pudo obtener información',
        image: null
      });
    } finally {
      setIsSearching(false);
    }
  };

  const filteredCategories = menuCategories.map(cat => ({
    ...cat,
    dishes: cat.dishes.filter(dish =>
      dish.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.dishes.length > 0);

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Busca un plato..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-border text-muted-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Menú por categorías */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron platos con esa búsqueda
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Collapsible
              key={category.name}
              open={expandedCategories[category.name]}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <div className="bg-muted border border-border rounded-xl overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="text-lg font-semibold text-muted-foreground">{category.name}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border bg-muted/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                      {category.dishes.map((dish) => {
                        const localDish = findDishLocally(dish);
                        return (
                          <button
                            key={dish}
                            onClick={() => searchDish(dish)}
                            className={`p-3 rounded-lg text-left text-sm font-medium transition-all ${
                              localDish
                                ? 'bg-green-900/30 text-green-100 border border-green-700/50 hover:bg-green-900/50'
                                : 'bg-muted text-muted-foreground border border-border hover:border-border0 hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{dish}</span>
                              {localDish && <Check size={12} className="text-green-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}
      </div>

      {/* Resultado de búsqueda */}
      {selectedDish && (
        <div className="bg-muted border-2 border-border rounded-xl p-6 mt-8">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-muted-foreground">{selectedDish}</h3>
            {isSearching && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
          </div>

          {searchResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className={`px-2 py-1 rounded ${searchResults.source === 'app' ? 'bg-green-900/30 text-green-300' : 'bg-blue-900/30 text-blue-300'}`}>
                  {searchResults.source === 'app' ? 'En la app' : 'Online'}
                </span>
              </div>
              
              {searchResults.image && (
                <img 
                  src={searchResults.image} 
                  alt={selectedDish}
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              )}
              
              <p className="text-muted-foreground">{searchResults.result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}