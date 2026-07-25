import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * manageTripMember — expulsa a un miembro del viaje o le cambia el rol,
 * validando en el backend que quien llama sea admin.
 *
 * Por qué existe: el rls de Trip.update es a nivel de documento entero, no
 * de campo — no puede exigir "solo se puede tocar members/roles si eres
 * admin" sin también bloquear a cualquier miembro normal (viewer incluido)
 * que solo quiere renombrar el viaje, añadir una parada o salir él mismo.
 * Con Trip.update() directo desde el cliente, cualquier miembro podía
 * mandar un `roles` a mano y auto-promocionarse a admin, o borrarse a otro
 * de `members` sin serlo. src/lib/tripMembers.js ya estaba escrito para
 * llamar a esta función — faltaba crearla, así que expulsar/cambiar rol
 * llevaba dando 404 desde que se escribió ese cliente.
 *
 * Invariantes que se validan aquí (no en el cliente, que solo las repite
 * como ayuda visual):
 * - Quien llama debe ser miembro del viaje con rol 'admin'.
 * - No se puede expulsar ni cambiar el rol de uno mismo por aquí (para eso
 *   hace falta un flujo de "salir del viaje" aparte, que ya pasaría por
 *   quitarse a uno mismo con permisos normales de update sobre members).
 * - El viaje debe conservar al menos un admin tras la operación.
 */

type Action = "remove" | "setRole";
const VALID_ROLES = new Set(["admin", "editor", "viewer"]);

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const callerEmail = norm(user.email);

    const { tripId, targetEmail, action, role } = await req.json();

    if (!tripId || typeof tripId !== "string") {
      return Response.json({ error: "Falta el viaje" }, { status: 400 });
    }
    if (!targetEmail || typeof targetEmail !== "string") {
      return Response.json({ error: "Falta el miembro a modificar" }, { status: 400 });
    }
    if (action !== "remove" && action !== "setRole") {
      return Response.json({ error: "Acción inválida" }, { status: 400 });
    }
    if (action === "setRole" && !VALID_ROLES.has(role)) {
      return Response.json({ error: "Rol inválido" }, { status: 400 });
    }
    const targetNorm = norm(targetEmail);

    const service = base44.asServiceRole;
    const trip = await service.entities.Trip.get(tripId);
    if (!trip) {
      return Response.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    const members: string[] = Array.isArray(trip.members) ? trip.members : [];
    const roles: Record<string, string> = trip.roles && typeof trip.roles === "object" ? { ...trip.roles } : {};

    const memberIndex = members.findIndex((m) => norm(m) === targetNorm);
    if (memberIndex === -1) {
      return Response.json({ error: "Esa persona no es miembro de este viaje" }, { status: 404 });
    }
    // Buscamos la key real (con el casing guardado) para leer/escribir roles.
    const targetKey = Object.keys(roles).find((k) => norm(k) === targetNorm) || targetEmail;

    const callerRole = roles[Object.keys(roles).find((k) => norm(k) === callerEmail) || callerEmail];
    if (callerRole !== "admin") {
      return Response.json({ error: "Solo un admin puede gestionar a los miembros del viaje" }, { status: 403 });
    }
    if (targetNorm === callerEmail) {
      return Response.json({ error: "No puedes expulsarte ni cambiar tu propio rol desde aquí" }, { status: 400 });
    }

    const adminCount = Object.values(roles).filter((r) => r === "admin").length;
    const targetIsAdmin = roles[targetKey] === "admin";

    if (action === "remove") {
      if (targetIsAdmin && adminCount <= 1) {
        return Response.json(
          { error: "El viaje debe tener al menos un admin", code: "last_admin" },
          { status: 409 }
        );
      }
      const newMembers = members.filter((m) => norm(m) !== targetNorm);
      const newRoles = { ...roles };
      delete newRoles[targetKey];
      const updated = await service.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });
      return Response.json({ trip: updated });
    }

    // action === 'setRole'
    if (targetIsAdmin && role !== "admin" && adminCount <= 1) {
      return Response.json(
        { error: "El viaje debe tener al menos un admin", code: "last_admin" },
        { status: 409 }
      );
    }
    const newRoles = { ...roles, [targetKey]: role };
    const updated = await service.entities.Trip.update(tripId, { roles: newRoles });
    return Response.json({ trip: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
