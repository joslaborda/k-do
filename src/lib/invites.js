import { base44 } from '@/api/base44Client';
import { notify } from '@/lib/notifications';

export function generateInviteToken() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export async function sendTripInvite({ tripId, email, role, tripName, inviterEmail, inviterName }) {
  const inviteToken = generateInviteToken();
  const normalizedEmail = email.trim().toLowerCase();

  // Crear o reusar invitación pending
  const existing = await base44.entities.TripInvite.filter({
    trip_id: tripId,
    email: normalizedEmail,
    status: 'pending'
  });

  let invite;
  if (existing.length > 0) {
    invite = await base44.entities.TripInvite.update(existing[0].id, {
      invite_token: inviteToken,
      invited_by: inviterEmail
    });
  } else {
    invite = await base44.entities.TripInvite.create({
      trip_id: tripId,
      email: normalizedEmail,
      role: role || 'editor',
      status: 'pending',
      invite_token: inviteToken,
      invited_by: inviterEmail
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

  await base44.entities.TripInvite.update(inviteId, {
    status: 'accepted',
    responded_date: new Date().toISOString()
  });

  const trip = await base44.entities.Trip.get(tripId);
  const normalizedUserEmail = userEmail.toLowerCase();
  const members = trip.members || [];
  const newMembers = members.includes(normalizedUserEmail) ? members : [...members, normalizedUserEmail];
  const roles = trip.roles || {};
  const newRoles = { ...roles, [normalizedUserEmail]: invite.role || 'editor' };

  await base44.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });

  return trip;
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
