import { PlaneIcon } from '@/lib/icons';
import { useEffect, useMemo, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, Calendar, Check, Mail, Map, Plus, X as XIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import TripCard, { HeroTripCard, getTripStatus } from '@/components/trip/TripCard';
import NewTripModal from '@/components/trip/NewTripModal';
import { Link, useNavigate } from 'react-router-dom';
import CreateProfileModal from '@/components/social/CreateProfileModal';
import { createPageUrl } from '@/utils';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
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
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3"><PlaneIcon className="w-7 h-7 text-muted-foreground/50" /></div>
      <p className="text-sm font-medium text-foreground mb-1">¿A dónde viajamos?</p>
      <p className="text-xs text-muted-foreground mb-5">Crea un viaje para empezar a planificar</p>
      <button onClick={onCreateTrip}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm rounded-full font-medium hover:bg-primary/90 transition-colors">
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
    `${trip.name || trip.destination || 'Mi viaje'}`,
    countryList.length ? `🌍 ${countryList.join(' · ')}` : '',
    days ? `${days} días · ${startDate}` : '',
    trip.destination ? `${trip.destination}` : '',
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
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fechas</p>
                  <p className="text-sm font-medium">{days} días · {startDate}</p>
                </div>
              </div>
            )}
            {trip.destination && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <Map className="w-5 h-5 text-muted-foreground" />
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
              className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-semibold">
              Compartir
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
  const [showInvites, setShowInvites] = useState(false);
  const inviteBtnRef = useRef();
  const { user, isLoading: userLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Invitaciones pendientes
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['myPendingInvites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TripInvite.filter({ email: user.email, status: 'pending' });
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

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
      // Fetch trips created by user
      let myTrips = [];
      try { myTrips = await base44.entities.Trip.filter({ created_by: user.email }); } catch {}
      // Fetch trips where user is a member — filtrado server-side con $elemMatch
      let memberTrips = [];
      try {
        const all = await base44.entities.Trip.filter(
          { members: { $elemMatch: { $eq: user.email } } },
          '-created_date'
        );
        memberTrips = all.filter(t => t.created_by !== user.email);
      } catch {}
      const seen = new Set(myTrips.map(t => t.id));
      return [...myTrips, ...memberTrips.filter(t => !seen.has(t.id))]
        .sort((a,b) => new Date(b.created_date||0) - new Date(a.created_date||0));
    },
    staleTime: 30000,
  });

  // Only fetch cities for the user's own trips, not all cities globally
  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities', trips.map(t => t.id).join(',')],
    queryFn: async () => {
      if (!trips.length) return [];
      const tripIds = trips.map(t => t.id);
      const results = await Promise.all(
        tripIds.map(id => base44.entities.City.filter({ trip_id: id }).catch(() => []))
      );
      return results.flat();
    },
    enabled: trips.length > 0,
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
          country: normalizeCountry(stopCountries[i] || formData.country || ''),
          order: i,
          start_date: dates.start_date, end_date: dates.end_date,
        });
      }
      return trip;
    },
    onSuccess: async (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['allCities'] });
      setDialogOpen(false);
      // Buscar en la wishlist personal del usuario si tiene spots guardados para este destino
      try {
        const countries = [
          normalizeCountry(trip.country || ''),
          normalizeCountry(trip.destination || ''),
        ].filter(Boolean);
        if (!countries.length || !user?.id) return;
        const mySaved = await base44.entities.SavedSpot.filter({ user_id: user.id });
        const matching = mySaved.filter(s => s.country && countries.includes(normalizeCountry(s.country)));
        if (matching.length > 0) {
          setNewTripPopup({ trip, spotCount: matching.length, country: countries[0] });
        }
      } catch {
        // silencioso — el popup es una mejora, no crítico
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
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Cargando viajes...</p>
      </div>
    </div>
  );



  const pastCount = pastTrips.length;

  return (
    <div className="min-h-screen bg-background">
      {needsOnboarding && <CreateProfileModal user={user} open={true} />}

      {/* ── Header ── */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-foreground leading-none tracking-tight">K<span style={{color:'hsl(var(--primary))'}}>ō</span>do</h1>
              <p className="text-xs text-muted-foreground mt-1">Travel your way</p>
              {firstName && (
                <p className="text-sm text-muted-foreground mt-2">{getGreeting()}, {firstName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <NotificationBell userId={user?.id} userEmail={user?.email} />
              {/* Icono de invitaciones con badge */}
              <div className="relative">
                <button
                  ref={inviteBtnRef}
                  onClick={() => setShowInvites(v => !v)}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-secondary/60 transition-colors"
                  aria-label="Invitaciones"
                >
                  <Mail className="w-5 h-5 text-foreground" />
                  {pendingInvites.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-label font-bold flex items-center justify-center px-1 border-2 border-background">
                      {pendingInvites.length > 9 ? '9+' : pendingInvites.length}
                    </span>
                  )}
                </button>

                {showInvites && (
                  <div style={{position:"fixed", top: inviteBtnRef.current ? inviteBtnRef.current.getBoundingClientRect().bottom + 8 : 64, right: 12}} className="w-80 max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-2xl shadow-xl z-[200] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="font-semibold text-sm text-foreground">Invitaciones</span>
                      <button onClick={() => setShowInvites(false)} className="text-muted-foreground hover:text-foreground"><XIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {pendingInvites.length === 0 ? (
                        <div className="py-12 text-center">
                          <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">Sin invitaciones pendientes</p>
                        </div>
                      ) : pendingInvites.map(inv => (
                        <div key={inv.id} className="px-4 py-3 border-b border-border last:border-0">
                          <p className="text-sm font-medium text-foreground">{inv.trip_name || 'Viaje'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Invitado por {inv.invited_by || 'un compañero'}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={async () => {
                                try {
                                  await acceptTripInvite(inv.id, inv.invite_token, inv.trip_id, user?.email);
                                  queryClient.invalidateQueries({ queryKey: ['myPendingInvites'] });
                                  queryClient.invalidateQueries({ queryKey: ['trips', user?.email] });
                                  setShowInvites(false);
                                  navigate(createPageUrl('Home') + '?trip_id=' + inv.trip_id);
                                } catch(e) { console.error(e); }
                              }}
                              className="flex-1 py-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Aceptar
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await declineTripInvite(inv.id);
                                  queryClient.invalidateQueries({ queryKey: ['myPendingInvites'] });
                                } catch(e) { console.error(e); }
                              }}
                              className="flex-1 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1"
                            >
                              <XIcon className="w-3 h-3" /> Declinar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
      <div className="max-w-3xl mx-auto px-4 py-5 pb-24 space-y-4">
        {trips.length === 0 ? (
          <EmptyState onCreateTrip={() => setDialogOpen(true)} />
        ) : (
          <>
            {/* Hero — always shown */}
            {heroTrip && <HeroTripCard trip={heroTrip} cities={heroCities} />}

            {/* Upcoming (excluding hero) */}
            {upcomingTrips.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Próximos</p>
                {upcomingTrips.map(({ t, cities }) => (
                  <TripCard key={t.id} trip={t} cities={cities} />
                ))}
              </div>
            )}

            {/* New trip button */}
            <button onClick={() => setDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-2xl text-sm text-primary font-medium bg-card hover:bg-orange-50 dark:hover:bg-primary/10 transition-colors">
              <Plus className="w-4 h-4" />Nuevo viaje
            </button>

            {/* Past trips — collapsible */}
            {pastCount > 0 && (
              <div>
                <button
                  onClick={() => setShowPast(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-2xl text-sm text-muted-foreground hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <span>{pastCount} viaje{pastCount !== 1 ? 's' : ''} finalizado{pastCount !== 1 ? 's' : ''}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${showPast ? 'rotate-90' : ''}`}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
                {showPast && (
                  <div className="mt-4 flex flex-col gap-2">
                    {pastTrips.map(({ t, cities }) => (
                      <div key={t.id}>
                        <TripCard trip={t} cities={cities} />

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
              <Map className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-base font-medium text-foreground mb-1">
                Tienes {newTripPopup.spotCount} spot{newTripPopup.spotCount !== 1 ? 's' : ''} guardado{newTripPopup.spotCount !== 1 ? 's' : ''} en {newTripPopup.country}
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Los tienes en tu perfil. ¿Los importamos a este viaje?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewTripPopup(null)}
                  className="flex-1 py-3 bg-secondary border border-border rounded-xl text-sm text-muted-foreground"
                >
                  Ahora no
                </button>
                <Link
                  to={createPageUrl('Restaurants') + '?trip_id=' + newTripPopup.trip.id + '&import_saved=1'}
                  onClick={() => setNewTripPopup(null)}
                  className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-semibold text-center"
                >
                  Importar →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}