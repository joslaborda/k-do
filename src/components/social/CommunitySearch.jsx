import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Loader2, ArrowRight, Utensils, Landmark, Zap, ShoppingBag, Train } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from 'react-i18next';

// ── Helpers ─────────────────────────────────────────────────────────────────
const SPOT_TYPE_ICON = {
  food: Utensils, sight: Landmark, activity: Zap,
  shopping: ShoppingBag, transport: Train, custom: MapPin,
};

function SectionHeader({ icon: Icon, label, count }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/20 border-b border-border">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
// José (2026-07-25): el buscador global de Explore solo debe buscar spots.
// Antes también resolvía @usuarios (te llevaba al perfil de alguien),
// itinerarios públicos y destinos derivados de esos itinerarios — todo eso
// es descubrimiento social/de comunidad, que se pospone a Kodo Social igual
// que la pestaña Personas y las plantillas. Reversible: allTemplates/
// allProfiles y las secciones de usuarios/itinerarios/destinos de más abajo
// están comentadas, no borradas.
export default function CommunitySearch({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  // ── Datos base (se cargan una sola vez al abrir) ──────────────────────────
  // const { data: allTemplates = [], isLoading: loadingTemplates } = useQuery({
  //   queryKey: ['templatesPublic'],
  //   queryFn: () => base44.entities.ItineraryTemplate.filter({ visibility: 'public' }, '-created_date'),
  //   enabled: open,
  //   staleTime: 10 * 60 * 1000,
  // });

  const { data: allSpots = [], isLoading: loadingSpots } = useQuery({
    queryKey: ['spotsPublic'],
    queryFn: () => base44.entities.Spot.filter({ visibility: 'public' }),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  // UserProfile.read se cerró en el rls — descubrimiento abierto, se lee sin
  // email/nationality — ver src/lib/userProfiles.js.
  // const { data: allProfiles = [], isLoading: loadingProfiles } = useQuery({
  //   queryKey: ['allProfiles'],
  //   queryFn: () => searchUserProfiles({}),
  //   enabled: open,
  //   staleTime: 10 * 60 * 1000,
  // });

  const isLoading = loadingSpots;

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const searchTerm = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return null;

    // Spots públicos — único tipo de resultado mientras el resto sea social/Kodo Social
    const spots = allSpots.filter(s =>
      s.title?.toLowerCase().includes(searchTerm) ||
      s.city_name?.toLowerCase().includes(searchTerm) ||
      s.country?.toLowerCase().includes(searchTerm) ||
      s.notes?.toLowerCase().includes(searchTerm)
    ).slice(0, 4);

    return { spots };
  }, [searchTerm, allSpots]);

  const hasResults = results && results.spots.length > 0;

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
              placeholder={t('explore.search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
              autoFocus
            />
          </div>
          {query.length > 0 && query.length < 2 && (
            <p className="text-xs text-muted-foreground mt-1 pl-10">{t('explore.search.min2')}</p>
          )}
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto flex-1">
          {/* Estado vacío */}
          {!query && (
            <div className="text-center py-12 text-muted-foreground px-6">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t('explore.search.title')}</p>
              <p className="text-sm mt-1 opacity-70">{t('explore.search.subtitle')}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Japón', 'Lisboa', 'ramen'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 text-primary rounded-full text-sm transition-colors"
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
              <p className="font-medium">{t('explore.search.noResults', { query })}</p>
              <p className="text-sm mt-1">{t('explore.search.tryAnother')}</p>
            </div>
          )}

          {/* Resultados */}
          {!isLoading && hasResults && (
            <div>
              {/* Usuarios, destinos e itinerarios: descubrimiento social/Kodo
                  Social, ocultos por ahora junto con Personas/Seguir y
                  Plantillas (ver comentario junto a las queries de arriba). */}

              {/* Spots */}
              {results.spots.length > 0 && (
                <div>
                  <SectionHeader icon={MapPin} label={t('explore.search.recommendedSpots')} count={results.spots.length} />
                  {results.spots.map(s => (
                    <button
                      key={s.id}
                      onClick={() => s.creator_username && goTo(`${createPageUrl('Profile')}?user_id=${s.created_by_user_id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
                        {(() => { const I = SPOT_TYPE_ICON[s.type] || MapPin; return <I className="w-4 h-4 text-primary" />; })()}
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