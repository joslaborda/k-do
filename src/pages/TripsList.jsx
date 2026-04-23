import { useEffect, useMemo, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, User, LogOut, Settings, Compass } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { toast } from '@/components/ui/use-toast';
import TripCard from '@/components/trip/TripCard';
import NewTripModal from '@/components/trip/NewTripModal';
import { Link } from 'react-router-dom';
import CreateProfileModal from '@/components/social/CreateProfileModal';
import TemplatesFeedTabs from '@/components/social/TemplatesFeedTabs';
import { createPageUrl } from '@/utils';

function UserMenu({ user, profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = profile?.display_name?.[0]?.toUpperCase()
    || user?.full_name?.[0]?.toUpperCase()
    || <User className="w-4 h-4" />;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 hover:border-white/70 transition-colors flex items-center justify-center bg-white/20 text-white font-bold text-sm"
      >
        {profile?.avatar_url
          ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
          : initials}
      </button>
      {open && (
        <div className="absolute right-0 top-12 bg-white border border-border rounded-xl shadow-xl w-48 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold truncate">{profile?.display_name || user?.full_name || 'Usuario'}</p>
            {profile?.username && <p className="text-xs text-muted-foreground font-mono">@{profile.username}</p>}
          </div>
          <Link to={createPageUrl('Profile')} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors">
            <User className="w-4 h-4 text-muted-foreground" /> Perfil
          </Link>
          <Link to={createPageUrl('Settings')} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" /> Ajustes
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors w-full text-left border-t border-border"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ── Onboarding empty state ──────────────────────────────────────────────────
function EmptyState({ userName, onCreateTrip }) {
  const steps = [
    {
      emoji: '🗺️',
      title: 'Planifica tu viaje',
      description: 'Crea itinerarios día a día, gestiona documentos, gastos y maleta en un solo lugar.',
    },
    {
      emoji: '👥',
      title: 'Viaja en equipo',
      description: 'Invita a tus compañeros de viaje. Cada uno puede ver y editar según su rol.',
    },
    {
      emoji: '✨',
      title: 'Descubre y comparte',
      description: 'Inspírate con itinerarios de la comunidad y publica los tuyos para que otros los disfruten.',
    },
  ];

  return (
    <div className="py-12">
      {/* Bienvenida */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {userName ? `¡Bienvenido a Kōdo, ${userName.split(' ')[0]}!` : '¡Bienvenido a Kōdo!'}
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Tu espacio para planificar viajes increíbles. Empieza creando tu primer viaje.
        </p>
      </div>

      {/* Pasos */}
      <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{step.emoji}</div>
            <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={onCreateTrip}
          className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear mi primer viaje
        </Button>
        <Link to={createPageUrl('Explore')}>
          <Button
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-6 text-base font-semibold rounded-xl"
          >
            <Compass className="w-5 h-5 mr-2" />
            Ver itinerarios de la comunidad
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function TripsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setUserLoading(false); }).catch(() => setUserLoading(false));
  }, []);

  const { data: myProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled: !!user?.id && user?.is_verified === true,
    staleTime: 60000,
  });

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 60000,
  });

  const tripCards = useMemo(() => {
    return trips.map((trip) => {
      const tripCities = allCities.filter((c) => c.trip_id === trip.id);
      return <TripCard key={trip.id} trip={trip} cities={tripCities} />;
    });
  }, [trips, allCities]);

  const createMutation = useMutation({
    mutationFn: async ({ formData, stops, stopCountries = [], allocations, selectedTemplate }) => {
      const email = user?.email;
      const userId = user?.id;
      const roles = email ? { [email]: 'admin' } : {};
      const members = email ? [email] : [];

      const trip = await base44.entities.Trip.create({
        ...formData,
        members,
        roles,
      });

      for (let i = 0; i < stops.length; i++) {
        const dates = allocations[i] || { start_date: formData.start_date, end_date: formData.end_date };
        await base44.entities.City.create({
          trip_id: trip.id,
          name: stops[i],
          country: stopCountries[i] || formData.country || '',
          order: i,
          start_date: dates.start_date,
          end_date: dates.end_date,
        });
      }

      if (selectedTemplate?.packingItems?.length) {
        await Promise.all(
          selectedTemplate.packingItems.map((item) =>
            base44.entities.PackingItem.create({ ...item, trip_id: trip.id, user_id: userId, packed: false })
          )
        );
        toast({
          title: 'Viaje creado! 🎉',
          description: `${selectedTemplate.packingItems.length} artículos añadidos a tu maleta`,
        });
      }

      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allCities'] });
      setDialogOpen(false);
    },
  });

  const needsOnboarding = user?.is_verified === true && !profileLoading && myProfile === null;
  const displayName = myProfile?.display_name || user?.full_name || '';

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  if (user && user.is_verified === false) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2">Verifica tu email</h2>
          <p className="text-sm text-muted-foreground mb-6">Revisa tu bandeja de entrada y confirma tu email para continuar.</p>
          <Button
            className="w-full bg-orange-700 hover:bg-orange-800 text-white"
            onClick={() => base44.auth.me().then(u => setUser(u)).catch(() => {})}
          >
            Ya verifiqué ✓
          </Button>
          <button onClick={() => base44.auth.logout()} className="mt-3 text-xs text-muted-foreground hover:underline block mx-auto">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {needsOnboarding && <CreateProfileModal user={user} open={true} />}

      {/* Header */}
      <div className="bg-orange-700 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight">Kōdo</h1>
            <p className="text-white/90 text-base font-medium mt-0.5">Travel your way</p>
            {myProfile && (
              <p className="text-white/70 text-sm mt-1 font-mono">@{myProfile.username}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-5 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />Crear viaje
            </Button>
            {user?.id && <NotificationBell userId={user.id} />}
            <UserMenu user={user} profile={myProfile} />
          </div>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 py-8 max-w-6xl">
        {trips.length === 0 ? (
          <EmptyState
            userName={displayName}
            onCreateTrip={() => setDialogOpen(true)}
          />
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Mis viajes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{tripCards}</div>
          </>
        )}

        {user?.is_verified && myProfile && (
          <TemplatesFeedTabs
            currentUserId={user.id}
            currentUserEmail={user.email}
            myProfile={myProfile}
          />
        )}
      </div>

      <NewTripModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    </div>
  );
}