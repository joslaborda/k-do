import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * acceptTripInvite — mueve la aceptación de invitaciones al backend.
 *
 * Por qué: para poder cerrar Trip.update a "solo miembros actuales" (ver
 * base44/entities/Trip.jsonc), la única operación que necesita saltarse esa
 * regla es esta: un invitado se añade a sí mismo a `members` justo antes de
 * ser miembro — algo que un rls declarativo no puede expresar. Antes esto lo
 * hacía el propio cliente con permisos normales, lo que obligaba a dejar
 * Trip.update abierto a cualquiera. Ahora corre aquí, con asServiceRole, y el
 * rls de Trip puede cerrarse del todo.
 *
 * De paso resuelve otro problema: al añadir al nuevo miembro a Trip.members,
 * sus registros de contenido antiguos (gastos, chat, documentos...) SEGUÍAN
 * sin incluir su email en trip_members — y como esa sincronización también la
 * hacía el propio cliente con sus permisos normales, fallaba: el recién
 * llegado no puede pasar el rls de "ya estás en trip_members" de un registro
 * en el que, por definición, todavía no está. Aquí, con permisos de servicio,
 * la sincronización no depende de eso.
 *
 * El email del usuario se toma de la sesión autenticada (base44.auth.me()),
 * nunca de un parámetro que mande el cliente — así no se puede aceptar una
 * invitación ajena mandando otro email en el body.
 */

const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo", "Restaurant",
];

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, editor: 2, viewer: 1 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const normalizedUserEmail = user.email.toLowerCase();

    const { inviteId, inviteToken } = await req.json();
    if (!inviteId || !inviteToken) {
      return Response.json({ error: "Faltan datos de la invitación" }, { status: 400 });
    }

    const service = base44.asServiceRole;

    const invite = await service.entities.TripInvite.get(inviteId);
    if (!invite || invite.invite_token !== inviteToken || invite.status !== "pending") {
      return Response.json({ error: "Invitación inválida o expirada" }, { status: 400 });
    }

    // El enlace de invitación está atado al email invitado — evita que un
    // enlace reenviado deje entrar a una cuenta distinta.
    if (invite.email && invite.email.toLowerCase() !== normalizedUserEmail) {
      return Response.json(
        {
          error: `Esta invitación es para ${invite.email}. Inicia sesión con esa cuenta para unirte al viaje.`,
          code: "email_mismatch",
        },
        { status: 403 }
      );
    }

    const tripId = invite.trip_id;

    await service.entities.TripInvite.update(inviteId, {
      status: "accepted",
      responded_date: new Date().toISOString(),
    });

    // Añadirse a `members` es leer→modificar→escribir sobre un array completo.
    // Si dos invitados aceptan a la vez, el segundo puede pisar la escritura
    // del primero. Se relee tras escribir y se reintenta hasta confirmar.
    let finalTrip: any = null;

    for (let intento = 0; intento < 4 && !finalTrip; intento++) {
      const trip = await service.entities.Trip.get(tripId);
      const members: string[] = trip.members || [];
      const roles: Record<string, string> = trip.roles || {};

      const inviteRole = invite.role || "editor";
      const existingRole = roles[normalizedUserEmail];
      const finalRole =
        existingRole && (ROLE_HIERARCHY[existingRole] || 0) >= (ROLE_HIERARCHY[inviteRole] || 0)
          ? existingRole
          : inviteRole;

      if (members.includes(normalizedUserEmail) && roles[normalizedUserEmail] === finalRole) {
        finalTrip = trip;
        break;
      }

      const newMembers = members.includes(normalizedUserEmail) ? members : [...members, normalizedUserEmail];
      const newRoles = { ...roles, [normalizedUserEmail]: finalRole };

      await service.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });

      const check = await service.entities.Trip.get(tripId);
      if ((check.members || []).includes(normalizedUserEmail)) {
        finalTrip = check;
        break;
      }

      await new Promise((r) => setTimeout(r, 120 * (intento + 1)));
    }

    if (!finalTrip) {
      return Response.json(
        { error: "No se pudo unir al viaje. Vuelve a intentarlo en unos segundos." },
        { status: 409 }
      );
    }

    // Sincronizar trip_members en las entidades de contenido para que el
    // nuevo miembro vea el historial del viaje desde ya, no solo lo que se
    // cree a partir de ahora. Con permisos de servicio, así que no falla por
    // el propio problema que se está resolviendo.
    const syncFailed: { entity: string; error: string }[] = [];
    for (const entityName of SYNCED_ENTITIES) {
      try {
        const records = await service.entities[entityName].filter({ trip_id: tripId });
        for (const record of records) {
          await service.entities[entityName].update(record.id, { trip_members: finalTrip.members });
        }
      } catch (e) {
        syncFailed.push({ entity: entityName, error: e.message });
      }
    }

    return Response.json({ ok: true, trip: finalTrip, syncFailed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
