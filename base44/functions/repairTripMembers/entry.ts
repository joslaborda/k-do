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
 *
 * Rate limiting: al recorrer muchos viajes con muchos registros seguidos,
 * base44 puede devolver "Rate limit exceeded" a mitad de la pasada (visto en
 * pruebas reales, siempre cerca del final de una ejecución larga). Por eso
 * cada llamada pasa por withRetry (reintenta con espera creciente) y además
 * se deja una pequeña pausa entre entidades para no ir a ráfaga.
 */

// 'Restaurant' se quitó: la entidad no tiene ninguna pantalla que cree
// registros (Restaurants.jsx trabaja sobre Spot), así que sincronizarla aquí
// era una llamada que siempre iba a 0 resultados sobre una entidad eliminada.
const SYNCED_ENTITIES = [
  "City", "Expense", "Ticket", "TripMessage", "DiaryEntry",
  "PackingItem", "Spot", "ItineraryDay", "TodoItem", "UsefulInfo",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const msg = String(e?.message || e || "");
      const isRateLimit = /rate limit/i.test(msg);
      if (!isRateLimit || attempt === retries) throw e;
      await sleep(1000 * Math.pow(2, attempt)); // 1s, 2s, 4s, 8s
    }
  }
  throw lastError;
}

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
          const records = await withRetry(() => service.entities[entityName].filter({ trip_id: trip.id }));
          let fixed = 0;
          for (const record of records) {
            const current = JSON.stringify((record.trip_members || []).slice().sort());
            const target = JSON.stringify(members.slice().sort());
            if (current !== target) {
              await withRetry(() => service.entities[entityName].update(record.id, { trip_members: members }));
              fixed++;
            }
          }
          tripReport.entities[entityName] = { total: records.length, fixed };
        } catch (e) {
          tripReport.entities[entityName] = { error: e.message };
        }
        await sleep(150); // pequeña pausa entre entidades para no ir a ráfaga
      }

      report.push(tripReport);
    }

    return Response.json({ ok: true, tripsProcessed: trips.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
