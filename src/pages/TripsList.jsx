import { useEffect, useMemo, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { toast } from '@/components/ui/use-toast';
import TripCard, { HeroTripCard, getTripStatus } from '@/components/trip/TripCard';
import NewTripModal from '@/components/trip/NewTripModal';
import { Link } from 'react-router-dom';
import CreateProfileModal from '@/components/social/CreateProfileModal';
import { createPageUrl } from '@/utils';
import { getSeedSpotsForCountry } from '@/lib/spotsDB';
import { normalizeCountry } from '@/lib/countryConfig';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onCreateTrip }) {
  return (
    <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-card">
      <p className="text-4xl mb-3">✈️</p>
      <p className="text-sm font-medium text-foreground mb-1">¿A dónde viajamos?</p>
      <p className="text-xs text-muted-foreground mb-5">Crea un viaje para empezar a planificar</p>
      <button onClick={onCreateTrip}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm rounded-xl font-medium hover:bg-primary/90 transition-colors">
        <Plus className="w-4 h-4" />Nuevo viaje
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
// ── Trip summary share sheet ──────────────────────────────────────────────────
function TripSummarySheet({ trip, cities, onClose }) {
  if (!trip) return null;
  const startDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const endDate   = trip.end_date   ? new Date(trip.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const days = trip.start_date && trip.end_date
    ? Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1
    : null;
  const countryList = [...new Set([trip.country, ...(cities || []).map(c => c.country)].filter(Boolean))];

  const shareText = [
    `✈️ ${trip.name || trip.destination || 'Mi viaje'}`,
    countryList.length ? `🌍 ${countryList.join(' · ')}` : '',
    days ? `📅 ${days} días · ${startDate}` : '',
    trip.destination ? `🗺️ ${trip.destination}` : '',
    '\nOrganizado con Kodo. Planifica tu viaje en kodo.app',
  ].filter(Boolean).join('\n');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: trip.name || 'Mi viaje en Kōdo', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText).then(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-[80px]"
      onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="pt-3 pb-0 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 py-5">
          <p className="text-xl font-semibold text-foreground mb-1">{trip.name || trip.destination || 'Mi viaje'}</p>
          <p className="text-sm text-muted-foreground mb-5">Resumen del viaje</p>

          <div className="space-y-3 mb-6">
            {countryList.length > 0 && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-xl">🌍</span>
                <div>
                  <p className="text-xs text-muted-foreground">Destinos</p>
                  <p className="text-sm font-medium">{countryList.join(' · ')}</p>
                </div>
              </div>
            )}
            {days && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-muted-foreground">Fechas</p>
                  <p className="text-sm font-medium">{days} días · {startDate}</p>
                </div>
              </div>
            )}
            {trip.destination && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="text-xs text-muted-foreground">Ruta</p>
                  <p className="text-sm font-medium">{trip.destination}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 bg-secondary border border-border rounded-xl text-sm text-muted-foreground">
              Cerrar
            </button>
            <button onClick={handleShare}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold">
              Compartir ✈️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripsList() {
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [newTripPopup, setNewTripPopup]       = useState(null); // { trip, spotCount, country }
  const [summaryTrip, setSummaryTrip]         = useState(null); // trip for share summary
  const [showPast, setShowPast] = useState(false);
  const { user, isLoading: userLoading } = useAuth();
  const queryClient = useQueryClient();


  const { data: myProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const r = await base44.entities.UserProfile.filter({ user_id: user.id });
      return r[0] || null;
    },
    enabled: !!user?.id && user?.is_verified === true,
    staleTime: 60000,
  });

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      let myTrips = [];
      try { myTrips = await base44.entities.Trip.filter({ created_by: user.email }); } catch {}
      if (myTrips.length === 0) {
        const all = await base44.entities.Trip.list('-created_date');
        myTrips = all.filter(t => t.created_by === user.email);
      }
      let memberTrips = [];
      try {
        const all = await base44.entities.Trip.list('-created_date');
        memberTrips = all.filter(t =>
          t.created_by !== user.email &&
          Array.isArray(t.members) && t.members.includes(user.email)
        );
      } catch {}
      const seen = new Set(myTrips.map(t => t.id));
      return [...myTrips, ...memberTrips.filter(t => !seen.has(t.id))]
        .sort((a,b) => new Date(b.created_date||0) - new Date(a.created_date||0));
    },
    staleTime: 30000,
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: async ({ formData, stops, stopCountries = [], allocations }) => {
      const email = user?.email;

      // Auto-detect best base currency from creator's home_currency
      let baseCurrency = formData.currency || 'EUR';
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        const myProfile = profiles[0];
        if (myProfile?.home_currency && !formData.currencyTouched) {
          baseCurrency = myProfile.home_currency;
        }
      } catch {}

      const trip = await base44.entities.Trip.create({
        ...formData,
        currency: baseCurrency,
        base_currency: baseCurrency,
        members: email ? [email] : [],
        roles: email ? { [email]: 'admin' } : {},
      });
      for (let i = 0; i < stops.length; i++) {
        const dates = allocations[i] || { start_date: formData.start_date, end_date: formData.end_date };
        await base44.entities.City.create({
          trip_id: trip.id, name: stops[i],
          country: stopCountries[i] || formData.country || '',
          order: i,
          start_date: dates.start_date, end_date: dates.end_date,
        });
      }
      return trip;
    },
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allCities'] });
      setDialogOpen(false);
      // Show spot discovery popup if we have seed spots for this destination
      const country = normalizeCountry(trip.country || '');
      if (country) {
        const seeds = getSeedSpotsForCountry(country);
        const spotCount = Object.values(seeds).flat().length;
        if (spotCount > 0) {
          setNewTripPopup({ trip, spotCount, country });
        }
      }
    },
  });

  // Classify trips
  const { heroTrip, heroCities, upcomingTrips, pastTrips } = useMemo(() => {
    const withStatus = trips.map(t => ({
      t,
      cities: allCities.filter(c => c.trip_id === t.id),
      status: getTripStatus(t),
    }));

    const active   = withStatus.filter(x => x.status?.type === 'active');
    const upcoming = withStatus.filter(x => x.status?.type === 'upcoming')
      .sort((a,b) => a.status.days - b.status.days);
    const past     = withStatus.filter(x => x.status?.type === 'past' || !x.status);

    // Hero priority: active → soonest upcoming → most recent past
    let hero = null;
    if (active.length > 0) hero = active[0];
    else if (upcoming.length > 0) hero = upcoming[0];
    else if (past.length > 0) hero = past[0];

    // Remove hero from upcoming list
    const heroId = hero?.t?.id;
    const upcomingRest = upcoming.filter(x => x.t.id !== heroId);

    return {
      heroTrip:     hero?.t || null,
      heroCities:   hero?.cities || [],
      upcomingTrips: upcomingRest,
      pastTrips:    past,
    };
  }, [trips, allCities]);

  const needsOnboarding = user?.is_verified === true && !profileLoading && myProfile === null;
  const firstName = myProfile?.display_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || '';

  // Loading
  if (isLoading || userLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="text-sm text-muted-foreground">Cargando viajes...</p>
      </div>
    </div>
  );

  // Email verification
  if (user && user.is_verified === false) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center">
        <p className="text-5xl mb-4">📧</p>
        <p className="text-lg font-medium mb-2">Verifica tu email</p>
        <p className="text-sm text-muted-foreground mb-6">Revisa tu bandeja de entrada para continuar.</p>
        <button className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium"
          onClick={() => window.location.reload()}>
          Ya verifiqué ✓
        </button>
        <button onClick={() => base44.auth.logout()}
          className="mt-3 text-xs text-muted-foreground hover:underline block mx-auto">
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  const pastCount = pastTrips.length;

  return (
    <div className="min-h-screen bg-background">
      {needsOnboarding && <CreateProfileModal user={user} open={true} />}

      {/* ── Header ── */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-foreground leading-none tracking-tight">Kōdo</h1>
              <p className="text-xs text-muted-foreground mt-1">Travel your way</p>
              {firstName && (
                <p className="text-sm text-muted-foreground mt-2">{getGreeting()}, {firstName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {user?.id && <NotificationBell userId={user.id} />}
              {/* Avatar → directo a perfil */}
              <Link to={createPageUrl('Profile')}>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-border flex items-center justify-center bg-primary text-white text-sm font-medium flex-shrink-0">
                  {myProfile?.avatar_url
                    ? <img src={myProfile.avatar_url} alt="avatar" className="w-full h-full object-cover"/>
                    : (firstName?.[0]?.toUpperCase() || '?')
                  }
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-4">

        {trips.length === 0 ? (
          <EmptyState onCreateTrip={() => setDialogOpen(true)} />
        ) : (
          <>
            {/* Hero — always shown */}
            {heroTrip && <HeroTripCard trip={heroTrip} cities={heroCities} />}

            {/* Upcoming (excluding hero) */}
            {upcomingTrips.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Próximos</p>
                {upcomingTrips.map(({ t, cities }) => (
                  <TripCard key={t.id} trip={t} cities={cities} />
                ))}
              </div>
            )}

            {/* New trip button */}
            <button onClick={() => setDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-2xl text-sm text-primary font-medium bg-card hover:bg-orange-50 transition-colors">
              <Plus className="w-4 h-4" />Nuevo viaje
            </button>

            {/* Past trips — collapsible */}
            {pastCount > 0 && (
              <div>
                <button
                  onClick={() => setShowPast(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-2xl text-sm text-muted-foreground hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🗂️</span>
                    <span>{pastCount} viaje{pastCount !== 1 ? 's' : ''} finalizado{pastCount !== 1 ? 's' : ''}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${showPast ? 'rotate-90' : ''}`}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
                {showPast && (
                  <div className="mt-3 space-y-3">
                    {pastTrips.map(({ t, cities }) => (
                      <div key={t.id}>
                        <TripCard trip={t} cities={cities} />
                        <button
                          onClick={() => setSummaryTrip({ trip: t, cities })}
                          className="w-full mt-1 mb-2 py-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                          Ver resumen y compartir →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <NewTripModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={data => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
      {/* ── Trip summary sheet ───────────────────────────────────────── */}
      {summaryTrip && (
        <TripSummarySheet
          trip={summaryTrip.trip}
          cities={summaryTrip.cities}
          onClose={() => setSummaryTrip(null)}
        />
      )}

      {/* ── Post-creation spot discovery popup ─────────────────────── */}
      {newTripPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-[80px]"
          onClick={() => setNewTripPopup(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="pt-3 pb-0 flex justify-center">
              <div className="w-9 h-1 rounded-full bg-border" />
            </div>
            <div className="px-5 py-5">
              <p className="text-2xl mb-2">🗺️</p>
              <p className="text-base font-medium text-foreground mb-1">
                ¡Hay {newTripPopup.spotCount} spots en {newTripPopup.country}!
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Tenemos spots recomendados para este destino. ¿Los exploramos ahora en Kōdo?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewTripPopup(null)}
                  className="flex-1 py-3 bg-secondary border border-border rounded-xl text-sm text-muted-foreground"
                >
                  Ahora no
                </button>
                <Link
                  to={createPageUrl('Restaurants') + '?trip_id=' + newTripPopup.trip.id}
                  onClick={() => setNewTripPopup(null)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold text-center"
                >
                  Ver spots →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}