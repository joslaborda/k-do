import { base44 } from '@/api/base44Client';

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
    const users = await base44.entities.User.filter({ email: { $in: emails } });
    return emails
      .map(email => ({ email, userId: users.find(u => u.email === email)?.id }))
      .filter(x => x.userId);
  } catch { return []; }
}
