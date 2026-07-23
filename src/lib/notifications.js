import { base44 } from '@/api/base44Client';
import { normalizeEmail } from '@/lib/utils';

/**
 * Crea una notificación. Silencioso si falla.
 */
export async function notify({ userId, type, actor, tripId, tripName, refId, refTitle, refExtra }) {
  if (!userId || !type) return;
  try {
    await base44.entities.Notification.create({
      user_id:            userId,
      type,
      read:               false,
      actor_display_name: actor?.display_name || actor?.username || null,
      actor_username:     actor?.username || null,
      actor_avatar:       (actor?.avatar_url && actor.avatar_url.startsWith('http')) ? actor.avatar_url : null,
      trip_id:            tripId || null,
      trip_name:          tripName || null,
      ref_id:             refId || null,
      ref_title:          refTitle || null,
      ref_extra:          refExtra ? JSON.stringify(refExtra) : null,
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
