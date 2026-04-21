import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Loader2, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
function getCountryConfig(country) {
  const COUNTRY_CONFIGS = {
    'Japón': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
    'Japan': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
    'Tailandia': { currency: 'THB', symbol: '฿', locale: 'th-TH', lang: 'Thai', langNative: 'ภาษาไทย', flag: '🇹🇭' },
    'Corea del Sur': { currency: 'KRW', symbol: '₩', locale: 'ko-KR', lang: 'Korean', langNative: '한국어', flag: '🇰🇷' },
    'China': { currency: 'CNY', symbol: '¥', locale: 'zh-CN', lang: 'Chinese', langNative: '中文', flag: '🇨🇳' },
    'Vietnam': { currency: 'VND', symbol: '₫', locale: 'vi-VN', lang: 'Vietnamese', langNative: 'Tiếng Việt', flag: '🇻🇳' },
    'India': { currency: 'INR', symbol: '₹', locale: 'hi-IN', lang: 'Hindi', langNative: 'हिन्दी', flag: '🇮🇳' },
    'Francia': { currency: 'EUR', symbol: '€', locale: 'fr-FR', lang: 'French', langNative: 'Français', flag: '🇫🇷' },
    'Italia': { currency: 'EUR', symbol: '€', locale: 'it-IT', lang: 'Italian', langNative: 'Italiano', flag: '🇮🇹' },
    'Alemania': { currency: 'EUR', symbol: '€', locale: 'de-DE', lang: 'German', langNative: 'Deutsch', flag: '🇩🇪' },
    'Portugal': { currency: 'EUR', symbol: '€', locale: 'pt-PT', lang: 'Portuguese', langNative: 'Português', flag: '🇵🇹' },
    'Grecia': { currency: 'EUR', symbol: '€', locale: 'el-GR', lang: 'Greek', langNative: 'Ελληνικά', flag: '🇬🇷' },
    'Reino Unido': { currency: 'GBP', symbol: '£', locale: 'en-GB', lang: 'English', langNative: 'English', flag: '🇬🇧' },
    'Suiza': { currency: 'CHF', symbol: 'Fr', locale: 'de-CH', lang: 'German', langNative: 'Deutsch', flag: '🇨🇭' },
    'México': { currency: 'MXN', symbol: '$', locale: 'es-MX', lang: 'Spanish', langNative: 'Español', flag: '🇲🇽' },
    'Estados Unidos': { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🇺🇸' },
    'Brasil': { currency: 'BRL', symbol: 'R$', locale: 'pt-BR', lang: 'Portuguese', langNative: 'Português', flag: '🇧🇷' },
    'Argentina': { currency: 'ARS', symbol: '$', locale: 'es-AR', lang: 'Spanish', langNative: 'Español', flag: '🇦🇷' },
    'Marruecos': { currency: 'MAD', symbol: 'DH', locale: 'ar-MA', lang: 'Arabic', langNative: 'العربية', flag: '🇲🇦' },
    'Turquía': { currency: 'TRY', symbol: '₺', locale: 'tr-TR', lang: 'Turkish', langNative: 'Türkçe', flag: '🇹🇷' },
    'Australia': { currency: 'AUD', symbol: '$', locale: 'en-AU', lang: 'English', langNative: 'English', flag: '🇦🇺' },
  };
  if (!country) return { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🌍' };
  return COUNTRY_CONFIGS[country] || Object.entries(COUNTRY_CONFIGS).find(([k]) => k.toLowerCase() === country.toLowerCase())?.[1] || { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🌍' };
}

export default function Restaurants() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [foodCategories, setFoodCategories] = useState([]);
  const [loadingFood, setLoadingFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  const country = trip?.country || '';
  const countryConfig = getCountryConfig(country);
  const flag = countryConfig.flag;

  useEffect(() => {
    if (!country) return;
    const cacheKey = `food_${country}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFoodCategories(parsed);
        // Expand first category by default
        if (parsed.length > 0) setExpandedCategories({ [parsed[0].category]: true });
        return;
      } catch {}
    }

    setLoadingFood(true);
    const prompt = `
Eres un experto en gastronomía de ${country}. 
Genera una guía gastronómica completa para un viajero hispanohablante que visita ${country}.

Crea entre 6 y 10 categorías gastronómicas representativas del país (platos principales, sopas, snacks, postres, bebidas, etc.).
Para cada categoría incluye entre 8 y 15 platos/bebidas representativos.

Para cada plato incluye:
- name: nombre en el idioma local (o nombre más conocido internacionalmente)
- description: descripción en español de 1-2 frases, qué es y de qué sabe
- image: URL de una imagen real de alta calidad del plato (usa URLs de dominios conocidos como justonecookbook.com, foodnetwork.com, bonappetit.com, seriouseats.com, etc.)

Responde SOLO con JSON válido:
{
  "categories": [
    {
      "category": "Nombre de la categoría",
      "icon": "emoji representativo",
      "items": [
        {
          "name": "Nombre del plato",
          "description": "Descripción breve en español",
          "image": "https://..."
        }
      ]
    }
  ]
}
`;

    base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                icon: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      image: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }).then((result) => {
      const cats = result.categories || [];
      setFoodCategories(cats);
      sessionStorage.setItem(cacheKey, JSON.stringify(cats));
      if (cats.length > 0) setExpandedCategories({ [cats[0].category]: true });
    }).catch(() => {}).finally(() => setLoadingFood(false));
  }, [country]);

  const toggleCategory = (name) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredCategories = foodCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

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

            {/* Loading */}
            {loadingFood && (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
                <p className="text-lg font-medium text-foreground">Cargando gastronomía de {country}...</p>
                <p className="text-sm text-muted-foreground mt-1">La IA está preparando los platos más representativos</p>
              </div>
            )}

            {/* Sin país */}
            {!loadingFood && !country && (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Abre desde un viaje para ver la gastronomía del país</p>
              </div>
            )}

            {/* Sin resultados de búsqueda */}
            {!loadingFood && country && filteredCategories.length === 0 && searchQuery && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No se encontraron platos con "{searchQuery}"</p>
              </div>
            )}

            {/* Categorías */}
            {!loadingFood && filteredCategories.length > 0 && (
              <div className="grid gap-4">
                {filteredCategories.map((cat) => (
                  <Collapsible
                    key={cat.category}
                    open={!!expandedCategories[cat.category]}
                    onOpenChange={() => toggleCategory(cat.category)}
                  >
                    <div className="border border-border rounded-2xl overflow-hidden shadow-lg hover:border-primary/50 transition-colors">
                      <CollapsibleTrigger className="bg-orange-200 px-6 py-5 text-left w-full flex items-center justify-between hover:bg-orange-300/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{cat.icon}</span>
                          <div>
                            <span className="text-orange-700 text-lg font-bold">{cat.category}</span>
                            <span className="text-orange-700 ml-2 text-xs">({cat.items.length} platos)</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedCategories[cat.category] ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 divide-border bg-white">
                          {cat.items.map((item, idx) => (
                            <div key={idx} className="p-4 hover:bg-orange-50 transition-colors border-b border-border/30">
                              <div className="flex gap-3 items-start">
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-orange-100">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl">${cat.icon}</div>`;
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-foreground text-sm leading-tight">{item.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
