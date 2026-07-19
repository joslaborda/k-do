import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * getTripPreview — devuelve un subconjunto seguro de un viaje a alguien que
 * TODAVÍA no es miembro, pero tiene una invitación válida (el enlace del
 * email, o la notificación in-app de esa invitación).
 *
 * Por qué existe: Trip.read estaba abierto a "true" (cualquier usuario
 * logueado en Kōdo podía leer CUALQUIER viaje — nombre, destino, fechas y la
 * lista completa de emails de sus miembros) porque las pantallas de
 * invitación (Invites.jsx y el modal de NotificationBell) necesitan mostrar
 * el viaje ANTES de que quien invita se una — cuando su email todavía no
 * está en trip.members, así que Trip.read restringido a "solo miembros" les
 * bloqueaba a ellos también.
 *
 * Con Trip.read ya cerrado a solo miembros (ver base44/entities/Trip.jsonc),
 * esta función tapa ese hueco solo para el caso legítimo: quien pide la
 * vista previa debe demostrar que tiene el token de una invitación real
 * dirigida a su propio email en ESE viaje. Nadie más puede ya listar u
 * hojear viajes ajenos.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const normalizedUserEmail = user.email.toLowerCase();

    const { tripId, token } = await req.json();
    if (!tripId || !token) {
      return Response.json({ error: "Faltan datos de la invitación" }, { status: 400 });
    }

    const service = base44.asServiceRole;

    const invites = await service.entities.TripInvite.filter({ trip_id: tripId, invite_token: token });
    const invite = invites[0];
    if (!invite) {
      return Response.json({ error: "Invitación inválida o expirada" }, { status: 404 });
    }

    // Igual que en acceptTripInvite: el enlace está atado al email invitado,
    // así que un token válido reenviado a otra persona no le sirve para
    // fisgonear el viaje. Se exige SIEMPRE, incluso si invite.email viniera
    // vacío (antes se saltaba la comprobación en ese caso).
    if (!invite.email || invite.email.toLowerCase() !== normalizedUserEmail) {
      return Response.json({ error: "Esta invitación no es para tu cuenta" }, { status: 403 });
    }

    const trip = await service.entities.Trip.get(tripId);
    if (!trip) {
      return Response.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    // Subconjunto mínimo — justo lo que pintan Invites.jsx y el modal de
    // invitación de NotificationBell. Nada de ai_preferences, roles,
    // visited_places, etc.
    return Response.json({
      trip: {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        country: trip.country,
        start_date: trip.start_date,
        end_date: trip.end_date,
        members: trip.members || [],
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
