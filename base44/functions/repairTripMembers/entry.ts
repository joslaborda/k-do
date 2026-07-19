import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * repairTripMembers — herramienta de reparación, de un solo uso manual (no
 * la llama la app sola desde ningún sitio).
 *
 * Por qué existe: durante un tiempo, crear un gasto/día de itinerario/spot/
 * etc. justo cuando la pantalla todavía no había terminado de cargar los
 * datos del viaje (típico con mala conexión, viajando) guardaba ese registro
 * con trip_members: [] — el rls lo compara contra ese campo, así que el
 * registro quedaba invisible para siempre, incluso para quien lo creó.
 * Parecía "borrado" sin estarlo: seguía en la base de datos, solo que nadie
 * podía volver a leerlo. Esto ya está arreglado en el código de creación,
 * pero no arregla lo que ya se guardó mal antes del arreglo.
 *
 * Qué hace: para cada viaje (o solo uno, si se pasa tripId), relee su lista
 * de miembros actual y reescribe trip_members en TODOS sus registros de las
 * entidades protegidas por ese campo, tengan o no ya el valor correcto — es
 * idempotente, así que se puede volver a correr sin miedo si algo falla a
 * mitad y hay que reintentar.
 *
 * Con permisos de servicio (asServiceRole), así no depende de que quien lo
 * ejecute ya tuviera acceso a los registros rotos (por definición, no lo
 * tenía — ese es justo el problema que arregla).
 */

const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo", "Restaurant",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    let tripId: string | undefined;
    try {
      const body = await req.json();
      tripId = body?.tripId || undefined;
    } catch {
      // sin body — repara todos los viajes
    }

    const service = base44.asServiceRole;

    const trips = tripId
      ? [await service.entities.Trip.get(tripId)].filter(Boolean)
      : await service.entities.Trip.filter({});

    const report: any[] = [];

    for (const trip of trips) {
      const members: string[] = trip.members || [];
      const tripReport: any = { tripId: trip.id, tripName: trip.name, members, entities: {} };

      for (const entityName of SYNCED_ENTITIES) {
        try {
          const records = await service.entities[entityName].filter({ trip_id: trip.id });
          let fixed = 0;
          for (const record of records) {
            const current = JSON.stringify((record.trip_members || []).slice().sort());
            const target = JSON.stringify(members.slice().sort());
            if (current !== target) {
              await service.entities[entityName].update(record.id, { trip_members: members });
              fixed++;
            }
          }
          tripReport.entities[entityName] = { total: records.length, fixed };
        } catch (e) {
          tripReport.entities[entityName] = { error: e.message };
        }
      }

      report.push(tripReport);
    }

    return Response.json({ ok: true, tripsProcessed: trips.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
