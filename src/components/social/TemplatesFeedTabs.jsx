import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Heart } from 'lucide-react';
import TemplateCard from '@/components/explore/TemplateCard';
import UserSearchPanel from '@/components/social/UserSearchPanel';

const DURATION_RANGES = [
  { label: '1–3 días', min: 1, max: 3 },
  { label: '4–7 días', min: 4, max: 7 },
  { label: '8–14 días', min: 8, max: 14 },
  { label: '15+ días', min: 15, max: Infinity }
];

export default function TemplatesFeedTabs({ currentUserId, currentUserEmail, myProfile }) {
  const [activeTab, setActiveTab] = useState('explorar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [explorarPage, setExplorarPage] = useState(1);
  const [siguiendoPage, setSiguiendoPage] = useState(1);

  // Query: templates públicos
  const { data: publicTemplates, isLoading: publicLoading } = useQuery({
    queryKey: ['templatesPublic'],
    queryFn: () => base44.entities.ItineraryTemplate.filter({ visibility: 'public' }, '-created_date'),
    staleTime: 1000 * 60 * 10, // 10 min
  });

  // Query: usuarios seguidos
  const { data: followingData = [] } = useQuery({
    queryKey: ['following', currentUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUserId }),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 10,
  });

  const followedUserIds = followingData.map((f) => f.followed_user_id);

  // Query: templates de usuarios seguidos
  const { data: siguiendoTemplates, isLoading: siguiendoLoading } = useQuery({
    queryKey: ['templatesFollowing', followedUserIds],
    queryFn: async () => {
      if (followedUserIds.length === 0) return [];
      const templates = await base44.entities.ItineraryTemplate.list('-created_date');
      return templates.filter(
        (t) => t.visibility === 'public' && followedUserIds.includes(t.created_by_user_id)
      );
    },
    enabled: !!currentUserId && followedUserIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  // Query: colección guardados
  const { data: myCollection } = useQuery({
    queryKey: ['guardados', currentUserId],
    queryFn: async () => {
      const results = await base44.entities.Collection.filter({
        owner_user_id: currentUserId,
        name: 'Guardados'
      });
      return results[0] || null;
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 10,
  });

  // Query: cargar templates guardados
  const { data: guardadosTemplates, isLoading: guardadosLoading } = useQuery({
    queryKey: ['guardadosDetails', myCollection?.template_ids],
    queryFn: async () => {
      if (!myCollection?.template_ids || myCollection.template_ids.length === 0) return [];
      const allTemplates = await base44.entities.ItineraryTemplate.list();
      return allTemplates.filter((t) => myCollection.template_ids.includes(t.id));
    },
    enabled: !!myCollection?.template_ids,
    staleTime: 1000 * 60 * 10,
  });

  // Obtener países únicos
  const allCountries = useMemo(() => {
    const templates = activeTab === 'explorar' ? publicTemplates : activeTab === 'siguiendo' ? siguiendoTemplates : guardadosTemplates;
    if (!templates) return [];
    const countries = new Set();
    templates.forEach((t) => {
      if (t.countries && Array.isArray(t.countries)) {
        t.countries.forEach((c) => countries.add(c));
      }
    });
    return Array.from(countries).sort();
  }, [activeTab, publicTemplates, siguiendoTemplates, guardadosTemplates]);

  // Filtrar templates
  const filterTemplates = (templates) => {
    if (!templates) return [];
    let filtered = templates;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        (t.cities && t.cities.some((c) => c.toLowerCase().includes(query))) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter((t) =>
        t.countries && t.countries.includes(selectedCountry)
      );
    }

    // Duration
    if (selectedDuration !== 'all') {
      const range = DURATION_RANGES.find((r) => r.label === selectedDuration);
      if (range) {
        filtered = filtered.filter((t) =>
          t.duration_days >= range.min && t.duration_days <= range.max
        );
      }
    }

    return filtered;
  };

  const explorarFiltered = useMemo(
    () => filterTemplates(publicTemplates),
    [publicTemplates, searchQuery, selectedCountry, selectedDuration]
  );

  const siguiendoFiltered = useMemo(
    () => filterTemplates(siguiendoTemplates),
    [siguiendoTemplates, searchQuery, selectedCountry, selectedDuration]
  );

  const guardadosFiltered = useMemo(
    () => filterTemplates(guardadosTemplates),
    [guardadosTemplates, searchQuery, selectedCountry, selectedDuration]
  );

  // Paginación: 12 por página
  const ITEMS_PER_PAGE = 12;

  const paginatedExplorar = useMemo(() => {
    const start = (explorarPage - 1) * ITEMS_PER_PAGE;
    return explorarFiltered.slice(start, start + ITEMS_PER_PAGE);
  }, [explorarFiltered, explorarPage]);

  const paginatedSiguiendo = useMemo(() => {
    const start = (siguiendoPage - 1) * ITEMS_PER_PAGE;
    return siguiendoFiltered.slice(start, start + ITEMS_PER_PAGE);
  }, [siguiendoFiltered, siguiendoPage]);

  const totalExplorarPages = Math.ceil(explorarFiltered.length / ITEMS_PER_PAGE);
  const totalSiguiendoPages = Math.ceil(siguiendoFiltered.length / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setSelectedDuration('all');
    setExplorarPage(1);
    setSiguiendoPage(1);
  };

  return (
    <div className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-1">🌍 Comunidad</h2>
      <p className="text-muted-foreground text-sm mb-6">Descubre itinerarios de viajeros del mundo</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-border p-1 h-auto">
          <TabsTrigger
            value="explorar"
            className="data-[state=active]:bg-orange-700 data-[state=active]:text-white"
          >
            🌐 Explorar
          </TabsTrigger>
          <TabsTrigger
            value="siguiendo"
            className="data-[state=active]:bg-orange-700 data-[state=active]:text-white"
          >
            👥 Siguiendo ({followedUserIds.length})
          </TabsTrigger>
          <TabsTrigger
            value="guardados"
            className="data-[state=active]:bg-orange-700 data-[state=active]:text-white"
          >
            <Heart className="w-4 h-4 mr-1 fill-current" />
            Guardados ({myCollection?.template_ids?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* EXPLORAR TAB */}
        <TabsContent value="explorar" className="space-y-4">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-xl border border-border space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar itinerarios, ciudades..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setExplorarPage(1);
                }}
                className="flex-1 bg-orange-50 border-border"
              />
              {(searchQuery || selectedCountry !== 'all' || selectedDuration !== 'all') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setExplorarPage(1); }}>
                <SelectTrigger className="w-40 bg-orange-50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {allCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDuration} onValueChange={(v) => { setSelectedDuration(v); setExplorarPage(1); }}>
                <SelectTrigger className="w-40 bg-orange-50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier duración</SelectItem>
                  {DURATION_RANGES.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates */}
          {publicLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
            </div>
          ) : explorarFiltered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-border">
              <p className="text-muted-foreground">No se encontraron itinerarios con esos filtros</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedExplorar.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
              {totalExplorarPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={explorarPage === 1}
                    onClick={() => setExplorarPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground py-2">
                    Página {explorarPage} de {totalExplorarPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={explorarPage === totalExplorarPages}
                    onClick={() => setExplorarPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}

          {/* User search */}
          <div className="mt-8 pt-8 border-t border-border">
            <UserSearchPanel currentUserId={currentUserId} />
          </div>
        </TabsContent>

        {/* SIGUIENDO TAB */}
        <TabsContent value="siguiendo" className="space-y-4">
          {followedUserIds.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-border">
              <p className="text-muted-foreground mb-4">No sigues a nadie todavía</p>
              <p className="text-sm text-muted-foreground mb-6">Busca usuarios para seguir su contenido</p>
              <Button
                onClick={() => setActiveTab('explorar')}
                className="bg-orange-700 hover:bg-orange-800"
              >
                Buscar usuarios
              </Button>
            </div>
          ) : siguiendoLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
            </div>
          ) : siguiendoFiltered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-border">
              <p className="text-muted-foreground">Los usuarios que sigues no tienen itinerarios públicos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedSiguiendo.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
              {totalSiguiendoPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={siguiendoPage === 1}
                    onClick={() => setSiguiendoPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground py-2">
                    Página {siguiendoPage} de {totalSiguiendoPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={siguiendoPage === totalSiguiendoPages}
                    onClick={() => setSiguiendoPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* GUARDADOS TAB */}
        <TabsContent value="guardados" className="space-y-4">
          {guardadosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
            </div>
          ) : guardadosFiltered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-border">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aún no has guardado itinerarios</p>
              <p className="text-sm text-muted-foreground mt-1">Guarda tus itinerarios favoritos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guardadosFiltered.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}