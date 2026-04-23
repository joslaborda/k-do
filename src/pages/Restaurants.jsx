import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronDown, ArrowRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { createPageUrl } from '@/utils';

// Fallback food data when LLM is slow/fails
const FALLBACK_CATEGORIES = [
  {
    category: 'Platos típicos',
    icon: '🍽️',
    items: [
      { name: 'Plato local 1', description: 'Cargando información gastronómica...', image: '' },
      { name: 'Plato local 2', description: 'Cargando información gastronómica...', image: '' },
    ],
  },
];

export default function Restaurants() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [searchQuery, setSearchQuery] = useState('');

  // Use active city context (hook always called)
  const { trip, activeCity } = useTripContext(tripId);

  const country = activeCity?.country || trip?.country || '';
  const flag = getCountryMeta(activeCity?.country_code || activeCity?.country || trip?.country || '').flag;

  // Datos gastronómicos estáticos — próximamente
  const foodCategories = [];

  const filteredCategories = [];

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

      <div className="max-w-6xl mx-auto px-6 -mt-12 pb-24">
        <Tabs defaultValue="gastronomia" className="space-y-6">
          <TabsList className="bg-white border border-border p-1">
            <TabsTrigger value="gastronomia" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              🍽️ Gastronomía
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gastronomia">
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

            {/* Próximamente */}
            {country && foodCategories.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl font-semibold text-foreground mb-2">Gastronomía de {country}</p>
                <p className="text-muted-foreground">Los platos típicos estarán disponibles próximamente.</p>
              </div>
            )}

            {/* Sin resultados de búsqueda */}
            {country && filteredCategories.length === 0 && searchQuery && foodCategories.length > 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No se encontraron platos con "{searchQuery}"</p>
              </div>
            )}


          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}