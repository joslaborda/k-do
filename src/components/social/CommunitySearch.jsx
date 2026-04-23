import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, User, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// ── Helpers ─────────────────────────────────────────────────────────────────
const SPOT_TYPE_EMOJI = {
  food: '🍽️', sight: '🏛️', activity: '🎯',
  shopping: '🛍️', transport: '🚇', custom: '📍',
};

function Avatar({ profile, size = 8 }) {
  const initials = profile?.display_name?.[0]?.toUpperCase() || '?';
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} alt={initials} />;
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, count }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-border">
      <Icon className="w-4 h-4 text-orange-700" />
      <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function CommunitySearch({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  // ── Datos base (se cargan una sola vez al abrir) ──────────────────────────
  const { data: allTemplates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['templatesPublic'],
    queryFn: () => base44.entities.ItineraryTemplate.filter({ visibility: 'public' }, '-created_date'),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const { data: allSpots = [], isLoading: loadingSpots } = useQuery({
    queryKey: ['spotsPublic'],
    queryFn: () => base44.entities.Spot.filter({ visibility: 'public' }),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const { data: allProfiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = loadingTemplates || loadingSpots || loadingProfiles;

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const isUserSearch = q.startsWith('@');
  const searchTerm = isUserSearch ? q.slice(1) : q;

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return null;

    // Usuarios
    const users = allProfiles.filter(p =>
      p.user_id !== currentUser?.id && (
        p.username?.toLowerCase().includes(searchTerm) ||
        p.display_name?.toLowerCase().includes(searchTerm)
      )
    ).slice(0, 4);

    // Itinerarios
    const templates = isUserSearch ? [] : allTemplates.filter(t =>
      t.title?.toLowerCase().includes(searchTerm) ||
      t.summary?.toLowerCase().includes(searchTerm) ||
      t.countries?.some(c => c.toLowerCase().includes(searchTerm)) ||
      t.cities?.some(c => c.toLowerCase().includes(searchTerm)) ||
      t.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      t.creator_username?.toLowerCase().includes(searchTerm)
    ).slice(0, 4);

    // Spots públicos
    const spots = isUserSearch ? [] : allSpots.filter(s =>
      s.title?.toLowerCase().includes(searchTerm) ||
      s.city_name?.toLowerCase().includes(searchTerm) ||
      s.country?.toLowerCase().includes(searchTerm) ||
      s.notes?.toLowerCase().includes(searchTerm)
    ).slice(0, 4);

    // Destinos únicos (ciudades y países de templates)
    const destSet = new Set();
    allTemplates.forEach(t => {
      t.countries?.forEach(c => { if (c.toLowerCase().includes(searchTerm)) destSet.add({ type: 'country', name: c }); });
      t.cities?.forEach(c => { if (c.toLowerCase().includes(searchTerm)) destSet.add({ type: 'city', name: c }); });
    });
    const destinations = Array.from(destSet).slice(0, 3);

    return { users, templates, spots, destinations };
  }, [searchTerm, isUserSearch, allTemplates, allSpots, allProfiles, currentUser]);

  const hasResults = results && (
    results.users.length > 0 ||
    results.templates.length > 0 ||
    results.spots.length > 0 ||
    results.destinations.length > 0
  );

  // ── Navegación al hacer clic ──────────────────────────────────────────────
  const goTo = (url) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Busca destinos, itinerarios, @usuarios, spots..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
              autoFocus
            />
          </div>
          {query.length > 0 && query.length < 2 && (
            <p className="text-xs text-muted-foreground mt-1 pl-10">Escribe al menos 2 caracteres</p>
          )}
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto flex-1">
          {/* Estado vacío */}
          {!query && (
            <div className="text-center py-12 text-muted-foreground px-6">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Busca en la comunidad</p>
              <p className="text-sm mt-1 opacity-70">Destinos, itinerarios, @usuarios o spots</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Japón', 'Lisboa', '@viajero', 'ramen'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full text-sm transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {query.length >= 2 && isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Sin resultados */}
          {query.length >= 2 && !isLoading && results && !hasResults && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Sin resultados para "{query}"</p>
              <p className="text-sm mt-1">Prueba con otro término</p>
            </div>
          )}

          {/* Resultados */}
          {!isLoading && hasResults && (
            <div>
              {/* Usuarios */}
              {results.users.length > 0 && (
                <div>
                  <SectionHeader icon={User} label="Usuarios" count={results.users.length} />
                  {results.users.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => goTo(`${createPageUrl('Profile')}?user_id=${profile.user_id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <Avatar profile={profile} size={10} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{profile.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{profile.username}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Destinos */}
              {results.destinations.length > 0 && (
                <div>
                  <SectionHeader icon={MapPin} label="Destinos" count={results.destinations.length} />
                  {results.destinations.map((dest, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(`${createPageUrl('Explore')}?q=${encodeURIComponent(dest.name)}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{dest.name}</p>
                        <p className="text-xs text-muted-foreground">{dest.type === 'country' ? 'País' : 'Ciudad'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Itinerarios */}
              {results.templates.length > 0 && (
                <div>
                  <SectionHeader icon={BookOpen} label="Itinerarios" count={results.templates.length} />
                  {results.templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => goTo(`${createPageUrl('TemplateDetail')}?id=${t.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {t.cover_image
                          ? <img src={t.cover_image} className="w-full h-full object-cover" alt={t.title} />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🗺️</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.duration_days && `${t.duration_days}d · `}
                          {t.countries?.[0]}
                          {t.is_premium && <span className="ml-1 text-amber-600 font-medium">✦ Premium</span>}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Spots */}
              {results.spots.length > 0 && (
                <div>
                  <SectionHeader icon={MapPin} label="Spots recomendados" count={results.spots.length} />
                  {results.spots.map(s => (
                    <button
                      key={s.id}
                      onClick={() => s.creator_username && goTo(`${createPageUrl('Profile')}?user_id=${s.created_by_user_id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                        {SPOT_TYPE_EMOJI[s.type] || '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.city_name && `${s.city_name} · `}
                          {s.creator_username && `@${s.creator_username}`}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}