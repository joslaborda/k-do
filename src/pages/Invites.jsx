import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { notify, resolveUserIds } from '@/lib/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Calendar, Mail, Check, X, ChevronLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from '@/components/ui/use-toast';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function Invites() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { user: currentUser } = useAuth();
  const [processing, setProcessing] = useState(false);

  // ── Con token: aceptar desde email ─────────────────────────────────────────
  const { data: invite, isLoading: inviteLoading } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      if (!token) return null;
      // Buscar pendiente primero
      const pending = await base44.entities.TripInvite.filter({ invite_token: token, status: 'pending' });
      if (pending[0]) return { ...pending[0], _status: 'pending' };
      // Si no hay pendiente, puede estar ya aceptada — buscar sin filtro de status
      const accepted = await base44.entities.TripInvite.filter({ invite_token: token });
      if (accepted[0]) return { ...accepted[0], _status: accepted[0].status };
      return null;
    },
    enabled: !!token,
  });

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', invite?.trip_id],
    queryFn: () => base44.entities.Trip.get(invite.trip_id),
    enabled: !!invite?.trip_id,
  });

  // ── Sin token: listar invitaciones del usuario ──────────────────────────────
  const { data: pendingInvites = [], refetch: refetchInvites } = useQuery({
    queryKey: ['myPendingInvites', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.TripInvite.filter({ email: currentUser.email, status: 'pending' });
    },
    enabled: !!currentUser?.email && !token,
  });

  const { data: pendingTrips = [] } = useQuery({
    queryKey: ['pendingTrips', pendingInvites.map(i => i.id).join(',')],
    queryFn: async () => {
      if (!pendingInvites.length) return [];
      return Promise.all(pendingInvites.map(inv => base44.entities.Trip.get(inv.trip_id)));
    },
    enabled: pendingInvites.length > 0,
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const notifyMembers = async (tripId, tripName, acceptingEmail, acceptingUserId) => {
    try {
      const myProfArr = await base44.entities.UserProfile.filter({ email: acceptingEmail });
      const myProf = myProfArr[0] || null;
      const tripData = await base44.entities.Trip.get(tripId);
      const others = (tripData?.members || []).filter(e => e !== acceptingEmail);
      const resolved = await resolveUserIds(others);
      resolved.forEach(({ userId }) =>
        notify({ userId, type: 'member_joined', actor: myProf, tripId, tripName: tripData?.name })
      );
    } catch {}
  };

  // ── Aceptar desde token ──────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!invite || !currentUser?.email || invite._status !== 'pending') return;
    setProcessing(true);
    try {
      await acceptTripInvite(invite.id, token, invite.trip_id, currentUser.email);
      await notifyMembers(invite.trip_id, trip?.name, currentUser.email, currentUser.id);
      qc.invalidateQueries({ queryKey: ['myPendingInvites'] });
      navigate(createPageUrl(`Home?trip_id=${invite.trip_id}`));
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'No se pudo aceptar la invitación', variant: 'destructive' });
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    setProcessing(true);
    try {
      await declineTripInvite(invite.id, token);
      navigate(createPageUrl('TripsList'));
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'No se pudo rechazar', variant: 'destructive' });
      setProcessing(false);
    }
  };

  // ── Aceptar desde lista ──────────────────────────────────────────────────────
  const handleAcceptFromList = async (inv) => {
    if (!currentUser?.email) return;
    setProcessing(true);
    try {
      await acceptTripInvite(inv.id, inv.invite_token, inv.trip_id, currentUser.email);
      await notifyMembers(inv.trip_id, null, currentUser.email, currentUser.id);
      qc.invalidateQueries({ queryKey: ['myPendingInvites'] });
      navigate(createPageUrl(`Home?trip_id=${inv.trip_id}`));
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Error al aceptar', variant: 'destructive' });
      setProcessing(false);
    }
  };

  const handleDeclineFromList = async (inv) => {
    setProcessing(true);
    try {
      await declineTripInvite(inv.id, inv.invite_token);
      await refetchInvites();
    } catch {}
    setProcessing(false);
  };

  // ── Render: con token ────────────────────────────────────────────────────────
  if (token) {
    if (inviteLoading || tripLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!invite || !trip) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Invitación inválida</h2>
          <p className="text-sm text-muted-foreground text-center">
            Esta invitación ha expirado o ya fue usada.
          </p>
          <button onClick={() => navigate(createPageUrl('TripsList'))}
            className="h-11 px-8 rounded-full bg-primary text-white text-sm font-medium mt-2">
            Ir a mis viajes
          </button>
        </div>
      );
    }

    // Invitación ya aceptada — detectar si el usuario ya es miembro
    const alreadyMember = invite._status !== 'pending' ||
      (currentUser?.email && trip?.members?.includes(currentUser.email.toLowerCase()));

    if (alreadyMember && trip) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Ya eres miembro</h2>
          <p className="text-sm text-muted-foreground text-center">
            Ya formas parte de <span className="font-medium text-foreground">{trip.name}</span>.
          </p>
          <button onClick={() => navigate(createPageUrl('Home') + `?trip_id=${trip.id}`)}
            className="h-11 px-8 rounded-full bg-primary text-white text-sm font-medium mt-2">
            Ir al viaje →
          </button>
        </div>
      );
    }

    // El enlace está atado al email invitado: si la sesión es de otra cuenta, avisar.
    const emailMismatch = currentUser?.email && invite.email &&
      currentUser.email.toLowerCase() !== invite.email.toLowerCase();

    if (emailMismatch) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <Mail className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Esta invitación es para otra cuenta</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            La invitación se envió a <span className="font-medium text-foreground">{invite.email}</span>, pero has iniciado sesión como <span className="font-medium text-foreground">{currentUser.email}</span>. Entra con la cuenta invitada para unirte al viaje.
          </p>
          <button onClick={() => navigate(createPageUrl('TripsList'))}
            className="h-11 px-8 rounded-full bg-primary text-white text-sm font-medium mt-2">
            Ir a mis viajes
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header Kōdo */}
        <div className="px-5 pt-14 pb-6 border-b border-border bg-background">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Tienes una invitación</p>
          </div>
          <h1 className="text-xl font-semibold text-foreground">¿Te unes al viaje?</h1>
        </div>

        <div className="flex-1 px-5 py-6 space-y-4">
          {/* Trip card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <p className="text-lg font-semibold text-foreground">{trip.name}</p>

            {trip.destination && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                {trip.destination}{trip.country ? `, ${trip.country}` : ''}
              </div>
            )}

            {trip.start_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                {format(new Date(trip.start_date), "d 'de' MMMM yyyy", { locale: es })}
                {trip.end_date && ` — ${format(new Date(trip.end_date), "d 'de' MMMM yyyy", { locale: es })}`}
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Invitado por <span className="font-medium text-foreground">{invite.invited_by || 'un compañero'}</span>
                {' · '}Rol: <span className="font-medium text-foreground capitalize">{invite.role || 'editor'}</span>
              </p>
            </div>
          </div>

          {!currentUser && (
            <div className="bg-orange-50 border border-primary/20 rounded-2xl px-4 py-3">
              <p className="text-xs text-primary font-medium">Crea una cuenta con el email al que te enviaron la invitación para unirte al viaje.</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="px-5 pb-10 flex gap-3">
          <button onClick={handleDecline} disabled={processing}
            className="flex-1 h-12 rounded-full border border-border text-sm font-medium text-muted-foreground bg-card">
            Rechazar
          </button>
          <button onClick={handleAccept} disabled={processing || !currentUser}
            className="flex-1 h-12 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-50">
            {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Unirme al viaje'}
          </button>
        </div>
      </div>
    );
  }

  // ── Render: lista sin token ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 bg-background border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('TripsList'))} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-foreground">Invitaciones</h1>
            <p className="text-xs text-muted-foreground">
              {pendingInvites.length === 0 ? 'Sin invitaciones pendientes'
                : `${pendingInvites.length} pendiente${pendingInvites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        {pendingInvites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6" style={{minHeight: 'calc(100vh - 120px)'}}>
            {/* Icono con acento naranja */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                <Mail className="w-9 h-9 text-primary" />
              </div>
            </div>

            <p className="text-base font-semibold text-foreground mb-2">Sin invitaciones pendientes</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-7">
              Cuando alguien te invite a un viaje aparecerá aquí.
            </p>

            {/* Pasos — qué esperar */}
            <div className="w-full space-y-2 text-left">
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-xs text-muted-foreground">Un compañero te invita desde su viaje</p>
              </div>
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-xs text-muted-foreground">Recibes una notificación en el bell</p>
              </div>
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-xs text-muted-foreground">Aceptas y tienes acceso completo al viaje</p>
              </div>
            </div>
          </div>
        ) : (
          pendingInvites.map(inv => {
            const tripData = pendingTrips.find(tripItem => tripItem?.id === inv.trip_id);
            return (
              <div key={inv.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {tripData?.name || 'Cargando...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Invitado por {inv.invited_by || 'alguien'}
                    </p>
                  </div>
                </div>

                {tripData && (
                  <div className="space-y-1.5 pl-12">
                    {tripData.destination && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {tripData.destination}{tripData.country ? `, ${tripData.country}` : ''}
                      </p>
                    )}
                    {tripData.start_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {format(new Date(tripData.start_date), "d MMM yyyy", { locale: es })}
                        {tripData.end_date && ` — ${format(new Date(tripData.end_date), "d MMM yyyy", { locale: es })}`}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleDeclineFromList(inv)} disabled={processing}
                    className="flex-1 h-9 rounded-full border border-border text-xs font-medium text-muted-foreground">
                    Rechazar
                  </button>
                  <button onClick={() => handleAcceptFromList(inv)} disabled={processing}
                    className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-semibold disabled:opacity-50">
                    {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Aceptar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
