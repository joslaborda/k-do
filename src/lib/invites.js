import { base44 } from '@/api/base44Client';
import { notify } from '@/lib/notifications';

export function generateInviteToken() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export async function sendTripInvite({ tripId, email, role, tripName, inviterEmail, inviterName }) {
  const inviteToken = generateInviteToken();
  const normalizedEmail = email.trim().toLowerCase();
  // invited_by se compara contra currentUser.email en las reglas de seguridad
  // (rls) de TripInvite — si queda con mayúsculas mezcladas, esa comparación
  // deja de coincidir y el invitador pierde acceso a su propia invitación.
  const normalizedInviter = (inviterEmail || '').trim().toLowerCase();

  // Verificar que el usuario no sea ya miembro del viaje
  const trip = await base44.entities.Trip.get(tripId);
  if (trip?.members?.includes(normalizedEmail)) {
    throw new Error('Este usuario ya es miembro del viaje');
  }

  // Crear o reusar invitación pending
  const existing = await base44.entities.TripInvite.filter({
    trip_id: tripId,
    email: normalizedEmail,
    status: 'pending'
  });

  let invite;
  if (existing.length > 0) {
    // Reinvitar con un rol distinto (p. ej. de viewer a editor) debe actualizar
    // el rol de la invitación pendiente, no solo el token — si no, quien acepte
    // se queda con el rol de la primera invitación aunque se le haya reinvitado
    // explícitamente con otro.
    invite = await base44.entities.TripInvite.update(existing[0].id, {
      invite_token: inviteToken,
      invited_by: normalizedInviter,
      role: role || 'editor'
    });
  } else {
    invite = await base44.entities.TripInvite.create({
      trip_id: tripId,
      email: normalizedEmail,
      role: role || 'editor',
      status: 'pending',
      invite_token: inviteToken,
      invited_by: normalizedInviter
    });
  }

  // URL de aceptación
  const inviteUrl = `${window.location.origin}/Invites?token=${inviteToken}`;

  // Enviar email — capturar error si base44 no permite externos
  let emailSent = false;
  try {
    await base44.integrations.Core.SendEmail({
      to: normalizedEmail,
      subject: `${inviterName || inviterEmail} te invita a "${tripName}" en Kōdo ✈️`,
      body: `Hola,

${inviterName || inviterEmail} te ha invitado a unirte al viaje "${tripName}" en Kōdo.

Haz clic aquí para aceptar la invitación:
${inviteUrl}

Si aún no tienes cuenta en Kōdo, regístrate con este email (${normalizedEmail}) y la invitación aparecerá automáticamente.

¡Buen viaje! 🧳`
    });
    emailSent = true;
  } catch (e) {
    console.warn('[sendTripInvite] Email no enviado:', e?.message);
  }

  // Si el usuario ya existe en Kōdo, crear notificación in-app
  // Usamos UserProfile.filter por email para no necesitar User.list() (que puede estar restringido)
  try {
    const profiles = await base44.entities.UserProfile.filter({ email: normalizedEmail });
    if (profiles.length > 0 && profiles[0].user_id) {
      await notify({
        userId: profiles[0].user_id,
        type: 'trip_invite',
        actor: { display_name: inviterName || inviterEmail, email: inviterEmail },
        tripId,
        tripName,
        refId: invite.id,
        refExtra: { token: inviteToken }
      });
    }
  } catch (e) {
    // Silencioso — la notificación in-app es opcional
    console.warn('[sendTripInvite] Notificación in-app no creada:', e?.message);
  }

  return { invite, emailSent, inviteUrl };
}

export async function acceptTripInvite(inviteId, inviteToken, tripId, userEmail) {
  const invite = await base44.entities.TripInvite.get(inviteId);

  if (!invite || invite.invite_token !== inviteToken || invite.status !== 'pending') {
    throw new Error('Invitación inválida o expirada');
  }

  // Seguridad: el enlace de invitación está atado al email invitado.
  // Evita que un enlace reenviado deje entrar a una cuenta distinta.
  const normalizedUserEmail = (userEmail || '').toLowerCase();
  if (invite.email && invite.email.toLowerCase() !== normalizedUserEmail) {
    const err = new Error(`Esta invitación es para ${invite.email}. Inicia sesión con esa cuenta para unirte al viaje.`);
    err.code = 'email_mismatch';
    throw err;
  }

  await base44.entities.TripInvite.update(inviteId, {
    status: 'accepted',
    responded_date: new Date().toISOString()
  });

  // Añadirse a `members` es leer→modificar→escribir sobre un array completo. Si dos
  // invitados aceptan a la vez, el segundo escribe su copia (que no incluye al
  // primero) y lo borra del viaje: el primero aceptó, su invitación quedó marcada
  // como usada, y se queda fuera sin enterarse y sin poder reintentar.
  // Se relee tras escribir y se reintenta hasta confirmar que está dentro.
  const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };

  for (let intento = 0; intento < 4; intento++) {
    const trip = await base44.entities.Trip.get(tripId);
    const members = trip.members || [];
    const roles = trip.roles || {};

    const inviteRole = invite.role || 'editor';
    const existingRole = roles[normalizedUserEmail];
    // Solo asignar rol si no tiene uno más alto ya
    const finalRole = existingRole && (roleHierarchy[existingRole] || 0) >= (roleHierarchy[inviteRole] || 0)
      ? existingRole
      : inviteRole;

    // Ya está dentro con el rol correcto: nada que hacer.
    if (members.includes(normalizedUserEmail) && roles[normalizedUserEmail] === finalRole) return trip;

    const newMembers = members.includes(normalizedUserEmail) ? members : [...members, normalizedUserEmail];
    const newRoles = { ...roles, [normalizedUserEmail]: finalRole };

    await base44.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });

    // Releer: si otro aceptó a la vez, su escritura pudo pisar la nuestra.
    const check = await base44.entities.Trip.get(tripId);
    if ((check.members || []).includes(normalizedUserEmail)) return check;

    // Espera creciente para no volver a chocar con el mismo.
    await new Promise(r => setTimeout(r, 120 * (intento + 1)));
  }

  // Cuatro intentos y sigue sin aparecer: mejor fallar que dejarle creer que entró.
  throw new Error('No se pudo unir al viaje. Vuelve a intentarlo en unos segundos.');
}

export async function declineTripInvite(inviteId, inviteToken) {
  const invite = await base44.entities.TripInvite.get(inviteId);

  if (!invite || invite.invite_token !== inviteToken || invite.status !== 'pending') {
    throw new Error('Invitación inválida o expirada');
  }

  await base44.entities.TripInvite.update(inviteId, {
    status: 'declined',
    responded_date: new Date().toISOString()
  });

  return invite;
}
