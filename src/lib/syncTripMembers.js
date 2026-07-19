import { base44 } from '@/api/base44Client';

/**
 * Entidades cuyo acceso está protegido comparando data.trip_members contra el
 * email del usuario (ver rls en base44/entities/*.jsonc). base44 no permite
 * condiciones cross-entity en rls declarativo — no se puede escribir "solo si
 * estás en Trip.members" directamente — así que cada registro lleva su propia
 * copia de esa lista, y hay que mantenerla al día a mano cada vez que cambia
 * quién está en el viaje. Si no se sincroniza: un miembro nuevo no puede leer
 * el historial del viaje (gastos, chat, documentos, itinerario anteriores a su
 * entrada), o alguien expulsado conserva acceso a esos datos para siempre.
 */
const SYNCED_ENTITIES = [
  'City', 'Expense', 'Ticket', 'TripMessage', 'DiaryEntry',
  'PackingItem', 'Spot', 'ItineraryDay', 'TodoItem', 'UsefulInfo', 'Restaurant',
];

/**
 * Reescribe trip_members en TODOS los registros existentes de un viaje para
 * las entidades protegidas por ese campo. Llamar SIEMPRE justo después de
 * cualquier cambio en Trip.members: aceptar invitación, expulsar a alguien, o
 * salir del viaje (incluido el borrado de cuenta).
 *
 * No lanza si falla una entidad concreta — sigue con el resto y devuelve qué
 * falló, para no dejar el cambio de membresía a medias por un fallo de red
 * puntual en una sola entidad. El caller decide si reintentar o solo avisar.
 */
export async function syncTripMembers(tripId, newMembers) {
  if (!tripId || !Array.isArray(newMembers)) return { ok: true, failed: [] };
  const failed = [];
  await Promise.all(SYNCED_ENTITIES.map(async (entityName) => {
    try {
      const records = await base44.entities[entityName].filter({ trip_id: tripId });
      await Promise.all(records.map(r =>
        base44.entities[entityName].update(r.id, { trip_members: newMembers })
      ));
    } catch (e) {
      failed.push({ entity: entityName, error: e?.message || String(e) });
    }
  }));
  return { ok: failed.length === 0, failed };
}
