import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Invites() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Caso 1: Con token (link de invitación)
  const { data: invite, isLoading: inviteLoading, error: inviteError } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      if (!token) return null;
      const invites = await base44.entities.TripInvite.filter({
        invite_token: token,
        status: 'pending'
      });
      return invites[0] || null;
    },
    enabled: !!token
  });

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', invite?.trip_id],
    queryFn: async () => {
      if (!invite?.trip_id) return null;
      return base44.entities.Trip.get(invite.trip_id);
    },
    enabled: !!invite?.trip_id
  });

  // Caso 2: Sin token (listar invitaciones del usuario)
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['myPendingInvites', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.TripInvite.filter({
        email: currentUser.email,
        status: 'pending'
      });
    },
    enabled: !!currentUser?.email && !token
  });

  const { data: pendingTrips = [] } = useQuery({
    queryKey: ['pendingTrips', pendingInvites],
    queryFn: async () => {
      if (pendingInvites.length === 0) return [];
      const trips = await Promise.all(
        pendingInvites.map((inv) => base44.entities.Trip.get(inv.trip_id))
      );
      return trips.filter(Boolean);
    },
    enabled: pendingInvites.length > 0
  });

  const handleAccept = async () => {
    if (!invite || !currentUser?.email) return;
    setProcessing(true);
    try {
      await acceptTripInvite(invite.id, token, invite.trip_id, currentUser.email);
      toast({
        title: '✓ ¡Invitación aceptada!',
        description: `Te has unido a ${trip?.name || 'el viaje'}`
      });
      setTimeout(() => {
        navigate(createPageUrl(`Home?trip_id=${invite.trip_id}`));
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aceptar la invitación'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    setProcessing(true);
    try {
      await declineTripInvite(invite.id, token);
      toast({
        title: 'Invitación rechazada',
        description: 'Se ha rechazado la invitación'
      });
      navigate(createPageUrl('TripsList'));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo rechazar la invitación'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptFromList = async (inviteId, tripId, inviteEmail) => {
    setProcessing(true);
    try {
      const inviteToAccept = pendingInvites.find((i) => i.id === inviteId);
      await acceptTripInvite(inviteId, inviteToAccept.invite_token, tripId, inviteEmail);
      toast({
        title: '✓ ¡Invitación aceptada!',
        description: 'Te has unido al viaje'
      });
      navigate(createPageUrl(`Home?trip_id=${tripId}`));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aceptar la invitación'
      });
      setProcessing(false);
    }
  };

  const handleDeclineFromList = async (inviteId) => {
    setProcessing(true);
    try {
      const inviteToDecline = pendingInvites.find((i) => i.id === inviteId);
      await declineTripInvite(inviteId, inviteToDecline.invite_token);
      toast({
        title: 'Invitación rechazada',
        description: 'Se ha rechazado la invitación'
      });
      // Refetch
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo rechazar la invitación'
      });
      setProcessing(false);
    }
  };

  // Con token (detail view)
  if (token) {
    if (inviteLoading || tripLoading) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-700" />
        </div>
      );
    }

    if (inviteError || !invite || !trip) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Invitación inválida</h2>
              <p className="text-muted-foreground mb-6">
                La invitación ha expirado o no es válida. Solicita una nueva invitación.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('TripsList'))}
                className="w-full bg-orange-700 hover:bg-orange-800"
              >
                Ir a mis viajes
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 py-12">
        <Card className="max-w-md w-full border-orange-200 bg-white shadow-lg">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Te han invitado</h1>
              <p className="text-muted-foreground">¿Quieres unirte a este viaje?</p>
            </div>

            {/* Trip Info */}
            <div className="bg-orange-50 rounded-xl p-4 mb-6 space-y-3 border border-orange-200">
              <h2 className="font-bold text-lg text-foreground">{trip.name}</h2>

              {trip.destination && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {trip.destination}, {trip.country}
                </div>
              )}

              {trip.start_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(trip.start_date), 'dd MMM yyyy', { locale: es })}
                </div>
              )}

              {/* Rol */}
              <div className="flex items-center gap-2 pt-2 border-t border-orange-200">
                <span className="text-sm text-muted-foreground">Rol asignado:</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                  {invite.role === 'admin'
                    ? '👑 Admin'
                    : invite.role === 'editor'
                    ? '✏️ Editor'
                    : '👀 Lector'}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-10"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aceptando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar invitación
                  </>
                )}
              </Button>

              <Button
                onClick={handleDecline}
                disabled={processing}
                variant="outline"
                className="w-full border-gray-300 text-foreground hover:bg-gray-50 font-bold h-10"
              >
                {processing ? 'Rechazando...' : 'Rechazar'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Sin token (list view)
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold mb-2">Invitaciones 📬</h1>
          <p className="text-white/90">
            {pendingInvites.length === 0
              ? 'No tienes invitaciones pendientes'
              : `Tienes ${pendingInvites.length} invitación${pendingInvites.length !== 1 ? 'es' : ''} pendiente${pendingInvites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-12">
        {pendingInvites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Sin invitaciones</h2>
            <p className="text-muted-foreground mb-6">
              Pide a tus amigos que te inviten a colaborar en sus viajes
            </p>
            <Button
              onClick={() => navigate(createPageUrl('TripsList'))}
              className="bg-orange-700 hover:bg-orange-800"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Mis viajes
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingInvites.map((invite) => {
              const tripData = pendingTrips.find((t) => t.id === invite.trip_id);
              return (
                <Card
                  key={invite.id}
                  className="border-orange-200 bg-white hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {tripData?.name || 'Viaje desconocido'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Invitado por: {invite.invited_by || 'alguien'}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 border shrink-0">
                        {invite.role === 'admin'
                          ? '👑 Admin'
                          : invite.role === 'editor'
                          ? '✏️ Editor'
                          : '👀 Lector'}
                      </Badge>
                    </div>

                    {tripData && (
                      <div className="text-sm text-muted-foreground space-y-1 mb-4">
                        {tripData.destination && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {tripData.destination}, {tripData.country}
                          </div>
                        )}
                        {tripData.start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(tripData.start_date), 'dd MMM yyyy', { locale: es })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleAcceptFromList(invite.id, invite.trip_id, currentUser?.email)
                        }
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleDeclineFromList(invite.id)}
                        disabled={processing}
                        variant="outline"
                        className="flex-1 border-gray-300 text-foreground hover:bg-gray-50 font-bold"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}