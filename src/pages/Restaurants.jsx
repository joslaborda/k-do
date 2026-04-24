import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronDown, ArrowRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { createPageUrl } from '@/utils';
import { getGastronomyData } from '@/lib/gastronomyDB';

export default function Restaurants() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [searchQuery, setSearchQuery] = useState('');

  // Use active city context (hook always called)
  const { trip, activeCity } = useTripContext(tripId);

  const country = activeCity?.country || trip?.country || '';
  const flag = getCountryMeta(activeCity?.country_code || activeCity?.country || trip?.country || '').flag;

  // Datos gastronómicos hardcodeados por país
  const gastronomyData = getGastronomyData(country);
  const foodCategories = gastronomyData?.categories || [];

  const filteredCategories = searchQuery.trim()
    ? foodCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter(cat => cat.items.length > 0)
    : foodCategories;

  // No tripId: show empty state
  if (!tripId) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col">
        <div className="bg-orange-700 pt-12 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-white text-4xl font-bold">Gastronomía 🍽️</h1>
            <p className="text-white/90 mt-2">Descubre la gastronomía de tu destino</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <BookOpen className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Selecciona un viaje</h2>
            <p className="text-muted-foreground mb-8">Abre Gastronomía desde un viaje para descubrir los platos típicos del país de destino.</p>
            <Button
              onClick={() => navigate(createPageUrl('TripsList'))}
              className="bg-orange-700 hover:bg-orange-800 text-white w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Ir a Mis viajes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">
            Gastronomía {flag}
          </h1>
          <p className="text-white/90 mt-2">
            {country
              ? `Descubre la gastronomía de ${country} antes de ir a un restaurante`
              : 'Abre desde un viaje para ver la gastronomía del país de destino'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-24 space-y-6">
            {/* Buscador */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Busca un plato o ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border border-border shadow-sm"
              />
            </div>

            {/* Sin país */}
            {!country && (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Abre desde un viaje para ver la gastronomía del país</p>
              </div>
            )}

            {/* País sin datos */}
            {country && foodCategories.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl font-semibold text-foreground mb-2">Gastronomía de {country}</p>
                <p className="text-muted-foreground">Los platos típicos de este destino estarán disponibles próximamente.</p>
              </div>
            )}

            {/* Sin resultados de búsqueda */}
            {country && filteredCategories.length === 0 && searchQuery && foodCategories.length > 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No se encontraron platos con "{searchQuery}"</p>
              </div>
            )}

            {/* Lista de categorías con platos */}
            {country && filteredCategories.length > 0 && (
              <div className="space-y-4">
                {filteredCategories.map((cat, catIdx) => (
                  <Collapsible key={catIdx} defaultOpen={catIdx === 0}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="font-semibold text-foreground">{cat.category}</span>
                          <span className="text-xs text-muted-foreground bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{cat.items.length} platos</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid md:grid-cols-2 gap-3 mt-3 px-1">
                        {cat.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-foreground leading-tight">{item.name}</h4>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 flex-shrink-0">
                                  {item.tags.slice(0, 2).map((tag, ti) => (
                                    <span key={ti} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}


      </div>
    </div>
  );
}