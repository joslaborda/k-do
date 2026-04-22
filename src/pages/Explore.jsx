import { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import TemplateCard from '@/components/explore/TemplateCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const itemsPerPage = 12;

  // Una sola llamada a auth.me() para toda la página
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Obtener SOLO templates públicos
  const { data: allTemplates = [], isLoading } = useQuery({
    queryKey: ['templatesPublic'],
    queryFn: async () => {
      const results = await base44.entities.ItineraryTemplate.filter(
        { visibility: 'public' },
        '-created_date'
      );
      return results || [];
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Extraer países únicos para filtro
  const countries = useMemo(() => {
    const countrySet = new Set();
    allTemplates.forEach((template) => {
      if (template.countries && Array.isArray(template.countries)) {
        template.countries.forEach((c) => countrySet.add(c));
      }
    });
    return Array.from(countrySet).sort();
  }, [allTemplates]);

  // Filtrar y buscar
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((template) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (template.title && template.title.toLowerCase().includes(searchLower)) ||
        (template.summary && template.summary.toLowerCase().includes(searchLower)) ||
        (template.tags &&
          template.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
        (template.creator_username && template.creator_username.toLowerCase().includes(searchLower));

      const matchesCountry =
        filterCountry === 'all' ||
        (template.countries && template.countries.includes(filterCountry));

      let matchesDuration = true;
      if (filterDuration !== 'all') {
        const duration = template.duration_days || 0;
        if (filterDuration === '1-3') matchesDuration = duration >= 1 && duration <= 3;
        else if (filterDuration === '4-7') matchesDuration = duration >= 4 && duration <= 7;
        else if (filterDuration === '8-14') matchesDuration = duration >= 8 && duration <= 14;
        else if (filterDuration === '15+') matchesDuration = duration >= 15;
      }

      return matchesSearch && matchesCountry && matchesDuration;
    });
  }, [allTemplates, searchQuery, filterCountry, filterDuration]);

  // Paginación
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold mb-2">Explorar Itinerarios 🗺️</h1>
          <p className="text-white/90">Descubre y guarda viajes inspiradores</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-8 shadow-sm">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Título, descripción, tags, @usuario..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">País</label>
                <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setCurrentPage(0); }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos los países</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Duración</label>
                <Select value={filterDuration} onValueChange={(v) => { setFilterDuration(v); setCurrentPage(0); }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Cualquier duración</SelectItem>
                    <SelectItem value="1-3">1-3 días</SelectItem>
                    <SelectItem value="4-7">4-7 días</SelectItem>
                    <SelectItem value="8-14">8-14 días</SelectItem>
                    <SelectItem value="15+">15+ días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
                <Select defaultValue="all" onValueChange={() => setCurrentPage(0)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="free">Gratuitos</SelectItem>
                    <SelectItem value="premium">Premium ✦</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : paginatedTemplates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {filteredTemplates.length === 0 && allTemplates.length > 0
                ? 'No encontramos itinerarios con esos filtros'
                : 'Sin itinerarios públicos todavía'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filteredTemplates.length === 0 && allTemplates.length > 0
                ? 'Intenta con otros criterios'
                : 'Sé el primero en publicar tu viaje'}
            </p>
            <Link to={createPageUrl('TripsList')}>
              <Button className="bg-orange-700 hover:bg-orange-800">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Volver a mis viajes
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredTemplates.length} itinerario{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedTemplates.map((template) => (
                // currentUser se pasa una sola vez desde aquí — no hay llamadas individuales por card
                <TemplateCard key={template.id} template={template} currentUser={currentUser} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(i)}
                    className={currentPage === i ? 'bg-orange-700' : ''}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
