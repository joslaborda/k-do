import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * migrateTripMembers — migración ÚNICA, a ejecutar UNA SOLA VEZ.
 *
 * Por qué existe: las 11 entidades del viaje (Expense, Ticket, TripMessage,
 * City, DiaryEntry, PackingItem, Spot, ItineraryDay, TodoItem, UsefulInfo,
 * Restaurant) ahora tienen `rls` que compara `data.trip_members` contra el
 * email del usuario — porque base44 no permite comprobar la pertenencia a un
 * Trip desde otra entidad directamente en las reglas de seguridad. El código
 * ya rellena `trip_members` en cada registro NUEVO a partir de ahora, pero los
 * registros que ya existían de antes NO tienen ese campo. Si el `rls` entra en
 * vigor sin backfillear primero esos registros, hasta el propio dueño del
 * viaje se queda sin poder leer sus gastos, chat, documentos o diario
 * antiguos — porque `trip_members` estaría vacío y no cuadra con nadie.
 *
 * Qué hace: recorre todos los Trips existentes y, para cada uno, escribe
 * `trip_members: trip.members` en todos sus registros de esas 11 entidades.
 *
 * Cuándo ejecutarla: UNA VEZ, en cuanto despliegues este archivo junto con
 * los `rls` nuevos de las 11 entidades — antes de que un usuario real entre a
 * la app. Ejecutarla más de una vez no hace daño (es idempotente: vuelve a
 * escribir el mismo trip.members actual), pero no hace falta repetirla salvo
 * que restaures datos desde un backup antiguo.
 *
 * Cómo ejecutarla (elige una):
 *   1. Vía CLI/HTTP:
 *      curl -X POST https://<tu-dominio>.base44.app/functions/migrateTripMembers
 *   2. Desde la consola del navegador, con sesión iniciada como
 *      jlabord@gmail.com, en cualquier pantalla de la app:
 *      await base44.functions.invoke('migrateTripMembers')
 *
 * La respuesta incluye un informe por viaje y por entidad para que puedas
 * confirmar que no ha fallado nada antes de dar el proceso por bueno.
 */

const OWNER_EMAIL = "jlabord@gmail.com";

const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo", "Restaurant",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Si se llama con sesión de usuario (vía base44.functions.invoke desde el
    // frontend), solo se permite al dueño de la app. Si se llama por HTTP
    // directo (curl/webhook) no hay usuario — se permite igualmente porque
    // solo tú conoces la URL; borra esta función cuando termines de usarla.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.email !== OWNER_EMAIL) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }

    const service = base44.asServiceRole;
    const trips = await service.entities.Trip.list();
    const report = [];

    for (const trip of trips) {
      const members = trip.members || [];
      const tripReport = {
        tripId: trip.id,
        tripName: trip.name || "(sin nombre)",
        members,
        entities: {},
      };

      for (const entityName of SYNCED_ENTITIES) {
        try {
          const records = await service.entities[entityName].filter({ trip_id: trip.id });
          let updated = 0;
          for (const record of records) {
            await service.entities[entityName].update(record.id, { trip_members: members });
            updated++;
          }
          tripReport.entities[entityName] = updated;
        } catch (e) {
          tripReport.entities[entityName] = `error: ${e.message}`;
        }
      }

      report.push(tripReport);
    }

    return Response.json({
      ok: true,
      tripsProcessed: trips.length,
      report,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
