import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * manageTripMember — cambia el rol de un miembro o lo expulsa del viaje.
 *
 * Por qué en el backend: el rls de Trip.update solo puede cerrarse a "eres
 * miembro actual del viaje" (ver base44/entities/Trip.jsonc) — el rls de
 * base44 se evalúa a nivel de documento, no de campo, así que no puede
 * exigir "solo si eres admin" para tocar members/roles sin también bloquear
 * a cualquier miembro normal que solo quiere renombrar el viaje o salir de
 * él (operaciones que sí deben seguir abiertas a cualquier miembro). Con el
 * rls tal cual estaba, cualquier miembro —viewer incluido— podía llamar
 * directamente a Trip.update y auto-promocionarse a admin o expulsar a
 * otros, sin que el rls lo impidiera. Aquí se valida server-side que quien
 * llama sea admin del viaje antes de tocar la membresía de otra persona.
 *
 * Limitación conocida (no resuelta en esta ronda): esto cierra el camino
 * normal de la app — UI y esta función son ahora el único sitio donde se
 * gestiona a otros miembros con verificación real de permisos — pero
 * Trip.update en sí sigue abierto a cualquier miembro actual por rls, porque
 * lo necesitan el flujo de "salir del viaje" (uno mismo) y el de
 * renombrar/reprogramar el viaje. Alguien con acceso a herramientas de
 * desarrollador podría seguir llamando a Trip.update directamente para
 * tocar members/roles. Cerrar eso del todo requeriría mover también esos dos
 * flujos al backend (y el de publicar plantilla, que es de "Kōdo social"
 * MVP2 y no se toca) — no se ha hecho aquí.
 */

const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo", "Restaurant",
];

const VALID_ROLES = ["admin", "editor", "viewer"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const actingEmail = user.email.toLowerCase();

    const { tripId, targetEmail: rawTargetEmail, action, role } = await req.json();
    const targetEmail = (rawTargetEmail || "").toLowerCase();

    if (!tripId || !targetEmail || !action) {
      return Response.json({ error: "Faltan datos" }, { status: 400 });
    }
    if (action !== "remove" && action !== "setRole") {
      return Response.json({ error: "Acción no reconocida" }, { status: 400 });
    }
    if (action === "setRole" && !VALID_ROLES.includes(role)) {
      return Response.json({ error: "Rol no válido" }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const trip = await service.entities.Trip.get(tripId);
    if (!trip) {
      return Response.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    const members: string[] = trip.members || [];
    const roles: Record<string, string> = trip.roles || {};

    // Solo un admin del viaje (o su creador) puede gestionar a otros miembros.
    const actingIsAdmin = roles[actingEmail] === "admin" || trip.created_by === actingEmail;
    if (!actingIsAdmin) {
      return Response.json(
        { error: "No tienes permiso para gestionar miembros de este viaje.", code: "not_admin" },
        { status: 403 }
      );
    }

    if (!members.includes(targetEmail)) {
      return Response.json({ error: "Esa persona no es miembro del viaje." }, { status: 400 });
    }

    // Gestionar la propia membresía (salir, etc.) no pasa por aquí — es el
    // flujo de "salir del viaje" ya existente en Settings.jsx.
    if (targetEmail === actingEmail) {
      return Response.json(
        { error: "No puedes gestionarte a ti mismo desde aquí.", code: "self_target" },
        { status: 400 }
      );
    }

    // El creador del viaje no se puede expulsar ni degradar.
    if (trip.created_by === targetEmail) {
      return Response.json(
        { error: "No se puede modificar al creador del viaje.", code: "target_is_creator" },
        { status: 400 }
      );
    }

    let newMembers = members;
    let newRoles = roles;

    if (action === "remove") {
      newMembers = members.filter((e) => e !== targetEmail);
      newRoles = { ...roles };
      delete newRoles[targetEmail];
    } else {
      // No se puede dejar el viaje sin ningún admin.
      const adminCount = Object.values(roles).filter((r) => r === "admin").length;
      if (roles[targetEmail] === "admin" && adminCount <= 1 && role !== "admin") {
        return Response.json(
          { error: "El viaje necesita al menos un admin.", code: "last_admin" },
          { status: 400 }
        );
      }
      newRoles = { ...roles, [targetEmail]: role };
    }

    const updatedTrip = await service.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });

    // Si se expulsó a alguien, revocar su acceso a los datos ya existentes
    // del viaje — si no, su email queda congelado en el trip_members de cada
    // registro desde antes de la expulsión y conservaría acceso para siempre.
    const syncFailed: { entity: string; error: string }[] = [];
    if (action === "remove") {
      for (const entityName of SYNCED_ENTITIES) {
        try {
          const records = await service.entities[entityName].filter({ trip_id: tripId });
          for (const record of records) {
            await service.entities[entityName].update(record.id, { trip_members: newMembers });
          }
        } catch (e) {
          syncFailed.push({ entity: entityName, error: e.message });
        }
      }
    }

    return Response.json({ ok: true, trip: updatedTrip, syncFailed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
