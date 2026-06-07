import { base44 } from '@/api/base44Client';
import { notify, resolveUserIds } from '@/lib/notifications';

export function generateInviteToken() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Crear invitación y enviar email.
 * Si el email falla, la invitación se guarda igualmente y se devuelve
 * { invite, emailSent: false, emailError } para que la UI pueda avisar.
 */
export async function sendTripInvite({
  tripId,
  email,
  role,
  tripName,
  inviterEmail,
  inviterName
}) {
  const inviteToken = generateInviteToken();
  const normalizedEmail = email.trim().toLowerCase();

  // Reutilizar invitación pending existente o crear nueva
  let invite;
  try {
    const existing = await base44.entities.TripInvite.filter({
      trip_id: tripId,
      email: normalizedEmail,
      status: 'pending'
    });

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
  } catch (dbErr) {
    console.error('[sendTripInvite] DB error:', dbErr);
    throw new Error('No se pudo guardar la invitación. Inténtalo de nuevo.');
  }

  // Construir URL de aceptación
  const base = window.location.origin;
  const appPath = window.location.pathname.split('/')[1];
  const inviteUrl = `${base}/${appPath}/Invites?token=${inviteToken}`;

  const roleLabel = role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Miembro';
  const senderName = inviterName || inviterEmail?.split('@')[0] || 'Un compañero';

  // Intentar enviar email — si falla, la invitación ya está guardada
  let emailSent = true;
  let emailError = null;
  try {
    await base44.integrations.Core.SendEmail({
      to: normalizedEmail,
      subject: `${senderName} te invita a "${tripName}" en Kōdo ✈️`,
      body: `Hola,

${senderName} te ha invitado a colaborar en el viaje "${tripName}" como ${roleLabel}.

Haz clic aquí para unirte:
${inviteUrl}

Si el enlace no funciona, cópialo en tu navegador.

Si no tienes cuenta en Kōdo, créala con este mismo email (${normalizedEmail}) y la invitación aparecerá automáticamente.

¡Buen viaje! 🧳`
    });
  } catch (emailErr) {
    emailSent = false;
    emailError = emailErr?.message || String(emailErr);
    console.error('[sendTripInvite] Email error:', emailErr);
  }

  return { invite, emailSent, emailError };
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
  const members = trip.members || [];
  const newMembers = members.includes(userEmail) ? members : [...members, userEmail];
  const roles = trip.roles || {};
  const newRoles = { ...roles, [userEmail]: invite.role || 'editor' };

  await base44.entities.Trip.update(tripId, {
    members: newMembers,
    roles: newRoles
  });

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
