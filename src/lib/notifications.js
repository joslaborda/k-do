import { base44 } from '@/api/base44Client';
import { normalizeEmail } from '@/lib/utils';
import { searchUserProfiles } from '@/lib/userProfiles';

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
 * Resuelve userIds de una lista de emails.
 *
 * Antes usaba `base44.entities.User.filter({ email: { $in: normEmails } })`
 * — un `.filter()` directo sobre la entidad `User` (la de auth, no
 * UserProfile). Probando en vivo con una segunda cuenta real (aceptar una
 * invitación y comprobar que le llega el aviso de "se unió" al otro
 * miembro) se descubrió que esa llamada devuelve SIEMPRE 403 desde el
 * propio Base44 para cualquier usuario normal: "Permission denied for list
 * operation on User entity — Only collaborators can view the list of
 * users." No es una restricción que pusiéramos nosotros (no está en
 * ningún .jsonc del proyecto) — es un límite de la plataforma sobre la
 * entidad User en sí. El try/catch de aquí abajo convertía ese 403 en un
 * `[]` silencioso, así que TODAS las notificaciones que dependen de esta
 * función (fotos, gastos, documentos, spots, "se unió al viaje" — 9 de los
 * 11 sitios que llaman a notify(), todo menos trip_invite y
 * expense_settled si ese ya resolvía por otra vía) llevan sin crearse desde
 * siempre, no por nada tocado en esta ronda de arreglos.
 *
 * Fix: en vez de leer la entidad User, se resuelve vía `searchUserProfiles`
 * — la misma función que ya usa correctamente el aviso de invitación
 * (`trip_invite`, el único que sí funcionaba) para pasar de email a
 * user_id sin tocar la entidad User.
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
    const profiles = await searchUserProfiles({ emails: normEmails });
    return normEmails
      .map(email => ({ email, userId: profiles.find(p => normalizeEmail(p.email) === email)?.user_id }))
      .filter(x => x.userId);
  } catch { return []; }
}
