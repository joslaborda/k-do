import { base44 } from '@/api/base44Client';
import { normalizeEmail } from '@/lib/utils';

/**
 * Crea una notificación. Silencioso si falla.
 *
 * Escribe vía la función backend createNotification en vez de
 * Notification.create() directo: Notification.create estaba abierto sin
 * restricción en el rls (no hay forma de expresar en rls "solo si quien
 * llama y el destinatario son miembros del mismo viaje" — eso requiere leer
 * otra entidad, Trip, cosa que el motor de rls de Base44 no puede hacer). La
 * función valida esa relación y deriva el "actor" del perfil real de quien
 * llama en vez de confiar en lo que mande este mismo archivo — el parámetro
 * `actor` de aquí ya no se usa para eso, se mantiene solo por compatibilidad
 * de la firma con los 11 sitios que llaman a notify().
 */
export async function notify({ userId, type, tripId, tripName, refId, refTitle, refExtra }) {
  if (!userId || !type || !tripId) return;
  try {
    await base44.functions.invoke('createNotification', {
      userId,
      type,
      tripId,
      tripName,
      refId,
      refTitle,
      refExtra,
    });
  } catch {}
}

/**
 * Resuelve userIds de una lista de emails via User.filter().
 * NO usa User.list() global — compatible con permisos de producción.
 */
export async function resolveUserIds(emails) {
  if (!emails?.length) return [];
  try {
    // Normalizado en ambos lados: otros llamantes (Photos.jsx, Invites.jsx)
    // no siempre normalizan antes de pasar los emails aquí, y comparar en
    // crudo hacía que la notificación simplemente no se creara — sin
    // ningún error visible — si el casing no coincidía exactamente.
    const normEmails = emails.map(normalizeEmail).filter(Boolean);
    if (!normEmails.length) return [];
    const users = await base44.entities.User.filter({ email: { $in: normEmails } });
    return normEmails
      .map(email => ({ email, userId: users.find(u => normalizeEmail(u.email) === email)?.id }))
      .filter(x => x.userId);
  } catch { return []; }
}
