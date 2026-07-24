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

// 'Restaurant' se quitó: la entidad no tiene ninguna pantalla que cree
// registros (Restaurants.jsx trabaja sobre Spot), así que sincronizarla aquí
// era una llamada que siempre iba a 0 resultados sobre una entidad eliminada.
const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo",
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

    // trip.members puede traer entradas de antes de normalizar el email a
    // minúsculas al crear/aceptar un viaje (ver TripsList.jsx/acceptTripInvite)
    // — sin normalizar aquí también, "gestionar miembro" fallaba con "no es
    // miembro" para cualquier entrada vieja con mayúsculas distintas, aunque
    // esa persona sí apareciera en la lista.
    const members: string[] = (trip.members || []).map((e: string) => (e || "").toLowerCase());
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
      // Deuda huérfana: si a quien se expulsa le deben dinero o debe dinero
      // (balance neto != 0), Expense.jsonc solo permite editar/borrar gastos
      // a miembros actuales del viaje — al quitarlo de trip.members pierde
      // acceso a esos gastos (RLS) y su saldo queda congelado para siempre:
      // nadie puede saldarlo ni corregirlo, y calculateBalances() lo seguiría
      // arrastrando en el resto del grupo sin que él lo vea. Se replica aquí
      // el mismo cálculo de balances que expenseBalances.js (algoritmo
      // idéntico) solo para este miembro, y se bloquea la expulsión si su
      // saldo no está saldado — igual que hacen apps de gastos compartidos
      // (p. ej. Splitwise) al intentar salir de un grupo con balance abierto.
      let targetBalance = 0;
      try {
        const expenses = await service.entities.Expense.filter({ trip_id: tripId });
        for (const expense of expenses) {
          const amount = parseFloat(expense.amount_base || expense.amount) || 0;
          const paidBy = (expense.paid_by || "").toLowerCase();
          if (!paidBy || !amount) continue;
          if (paidBy === targetEmail) targetBalance += amount;

          const splitType = expense.split_type;
          if (splitType === "solo") {
            if (paidBy === targetEmail) targetBalance -= amount;
          } else if (splitType === "custom" && expense.amounts_by_user) {
            const safeAmounts = Object.fromEntries(
              Object.entries(expense.amounts_by_user).map(([e, v]: [string, any]) => [
                e.toLowerCase(),
                Math.max(0, parseFloat(v) || 0),
              ])
            );
            const totalCustom = Object.values(safeAmounts).reduce((s: number, v: any) => s + v, 0);
            if (totalCustom > 0 && safeAmounts[targetEmail] != null) {
              targetBalance -= amount * (safeAmounts[targetEmail] / totalCustom);
            } else if (totalCustom === 0 && Object.keys(safeAmounts).includes(targetEmail)) {
              targetBalance -= amount / Object.keys(safeAmounts).length;
            }
          } else {
            const splitWith = (expense.split_with || []).map((e: string) => (e || "").toLowerCase());
            const participants = [...new Set(splitWith.length > 0 ? splitWith : [paidBy])];
            if (participants.includes(targetEmail)) {
              targetBalance -= amount / participants.length;
            }
          }
        }
      } catch (e) {
        // Si falla la lectura de gastos, no bloqueamos la expulsión por un
        // error de infraestructura — solo cuando SÍ pudimos calcular un saldo
        // real y no está saldado.
        targetBalance = 0;
      }

      if (Math.abs(targetBalance) > 0.01) {
        return Response.json(
          {
            error:
              "Esta persona tiene un saldo pendiente en los gastos del viaje. Salda su balance antes de expulsarla.",
            code: "target_has_balance",
            balance: parseFloat(targetBalance.toFixed(2)),
          },
          { status: 400 }
        );
      }

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
