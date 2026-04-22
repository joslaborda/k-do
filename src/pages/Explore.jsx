import { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, ArrowRight, Users } from 'lucide-react';
import TemplateCard from '@/components/explore/TemplateCard';
import CommunitySearch from '@/components/social/CommunitySearch';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Explore() {
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemsPerPage = 12;

  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: allTemplates = [], isLoading } = useQuery({
    queryKey: ['templatesPublic'],
    queryFn: async () => {
      const results = await base44.entities.ItineraryTemplate.filter(
        { visibility: 'public' },
        '-created_date'
      );
      return results || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const countries = useMemo(() => {
    const countrySet = new Set();
    allTemplates.forEach((t) => t.countries?.forEach((c) => countrySet.add(c)));
    return Array.from(countrySet).sort();
  }, [allTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesCountry = filterCountry === 'all' || t.countries?.includes(filterCountry);

      let matchesDuration = true;
      if (filterDuration !== 'all') {
        const d = t.duration_days || 0;
        if (filterDuration === '1-3') matchesDuration = d >= 1 && d <= 3;
        else if (filterDuration === '4-7') matchesDuration = d >= 4 && d <= 7;
        else if (filterDuration === '8-14') matchesDuration = d >= 8 && d <= 14;
        else if (filterDuration === '15+') matchesDuration = d >= 15;
      }

      const matchesType =
        filterType === 'all' ||
        (filterType === 'free' && !t.is_premium) ||
        (filterType === 'premium' && t.is_premium);

      return matchesCountry && matchesDuration && matchesType;
    });
  }, [allTemplates, filterCountry, filterDuration, filterType]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const resetFilters = () => {
    setFilterCountry('all');
    setFilterDuration('all');
    setFilterType('all');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-white text-4xl font-bold">Explorar 🗺️</h1>
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-2">
                <Users className="w-4 h-4" />
                Mi perfil
              </Button>
            </Link>
          </div>
          <p className="text-white/90 mb-5">Descubre viajes, spots y viajeros</p>

          {/* Buscador prominente */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-3 text-white/80 text-sm border border-white/20"
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            <span>Busca destinos, itinerarios, @usuarios, spots...</span>
            <kbd className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded font-mono hidden sm:block">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-sm">Filtrar itinerarios</h2>
            {(filterCountry !== 'all' || filterDuration !== 'all' || filterType !== 'all') && (
              <button onClick={resetFilters} className="text-xs text-orange-700 hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">País</label>
              <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setCurrentPage(0); }}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />{country}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duración</label>
              <Select value={filterDuration} onValueChange={(v) => { setFilterDuration(v); setCurrentPage(0); }}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Cualquier duración</SelectItem>
                  <SelectItem value="1-3">1–3 días</SelectItem>
                  <SelectItem value="4-7">4–7 días</SelectItem>
                  <SelectItem value="8-14">8–14 días</SelectItem>
                  <SelectItem value="15+">15+ días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo</label>
              <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(0); }}>
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

        {/* Grid de resultados */}
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
                ? 'No hay itinerarios con esos filtros'
                : 'Sin itinerarios públicos todavía'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filteredTemplates.length === 0 && allTemplates.length > 0
                ? 'Prueba limpiando los filtros'
                : 'Sé el primero en publicar tu viaje'}
            </p>
            {filteredTemplates.length === 0 && allTemplates.length > 0 ? (
              <Button className="bg-orange-700 hover:bg-orange-800" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Link to={createPageUrl('TripsList')}>
                <Button className="bg-orange-700 hover:bg-orange-800">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Mis viajes
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              {filteredTemplates.length} itinerario{filteredTemplates.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} currentUser={currentUser} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
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
                <Button variant="outline" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Buscador social — se abre con el botón del header */}
      <CommunitySearch open={searchOpen} onOpenChange={setSearchOpen} initialQuery={initialQuery} />
    </div>
  );
}
