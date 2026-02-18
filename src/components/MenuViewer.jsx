import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const menuCategories = [
  {
    name: '🍜 Platos principales',
    dishes: ['Ramen', 'Shoyu ramen', 'Miso ramen', 'Tonkotsu ramen', 'Udon', 'Soba', 'Yakisoba']
  },
  {
    name: '🍛 Curry y occidentales',
    dishes: ['Japanese curry', 'Katsu curry', 'Beef curry', 'Doria', 'Napolitan pasta', 'Gratin', 'Cream stew']
  },
  {
    name: '🍱 Arroces y bowls',
    dishes: ['Gyudon', 'Oyakodon', 'Katsudon', 'Tendon', 'Curry rice', 'Omurice', 'Donburi']
  },
  {
    name: '🍣 Sushi y pescado',
    dishes: ['Sushi', 'Sashimi', 'Nigiri', 'Maki', 'Chirashi', 'Tekka don', 'Unagi don']
  },
  {
    name: '🍖 Carne y fritos',
    dishes: ['Karaage', 'Tonkatsu', 'Chicken katsu', 'Yakiniku', 'Sukiyaki', 'Shabu shabu']
  },
  {
    name: '🍢 Callejera e izakaya',
    dishes: ['Yakitori', 'Okonomiyaki', 'Takoyaki', 'Kushikatsu', 'Taiyaki']
  },
  {
    name: '🍡 Dulces y postres',
    dishes: ['Mochi', 'Daifuku', 'Dango', 'Dorayaki', 'Matcha cake', 'Matcha ice cream']
  }
];

export default function MenuViewer({ foodItems = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({ '🍜 Platos principales': true });
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
        // Buscar en Google
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Dame una descripción breve y apetitosa del plato japonés "${dish}" en español. Sé conciso (máximo 2-3 líneas).`,
          add_context_from_internet: true
        });
        
        setSearchResults({
          dish,
          source: 'google',
          result: result,
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          placeholder="Busca un plato..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400"
        />
      </div>

      {/* Menú por categorías */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            No se encontraron platos con esa búsqueda
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Collapsible
              key={category.name}
              open={expandedCategories[category.name]}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <div className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-stone-700/50 transition-colors">
                  <span className="text-lg font-semibold text-stone-100">{category.name}</span>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-stone-700 bg-stone-800/50">
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
                                : 'bg-stone-700 text-stone-200 border border-stone-600 hover:border-stone-500 hover:bg-stone-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{dish}</span>
                              {localDish && <span className="text-xs">✓</span>}
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
        <div className="bg-stone-800 border-2 border-stone-700 rounded-xl p-6 mt-8">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-stone-100">{selectedDish}</h3>
            {isSearching && <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />}
          </div>

          {searchResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                <span className={`px-2 py-1 rounded ${searchResults.source === 'app' ? 'bg-green-900/30 text-green-300' : 'bg-blue-900/30 text-blue-300'}`}>
                  {searchResults.source === 'app' ? '📱 En la app' : '🌐 Google'}
                </span>
              </div>
              
              {searchResults.image && (
                <img 
                  src={searchResults.image} 
                  alt={selectedDish}
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              )}
              
              <p className="text-stone-200">{searchResults.result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}