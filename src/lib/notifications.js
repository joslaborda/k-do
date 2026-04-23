import { base44 } from '@/api/base44Client';

/**
 * Crea una notificación para el usuario destino.
 * No lanza error si falla (silencioso).
 */
export async function createNotification({ userId, type, actorProfile, refId, refTitle, message }) {
  if (!userId || !type) return;
  try {
    await base44.entities.Notification.create({
      user_id: userId,
      type,
      read: false,
      actor_user_id: actorProfile?.user_id || null,
      actor_display_name: actorProfile?.display_name || null,
      actor_username: actorProfile?.username || null,
      actor_avatar: actorProfile?.avatar_url || null,
      ref_id: refId || null,
      ref_title: refTitle || null,
      message: message || null,
    });
  } catch {
    // silencioso: no bloquear la acción principal
  }
}