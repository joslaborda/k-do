import { base44 } from '@/api/base44Client';
import { createNotification } from '@/lib/notifications';

/**
 * Generar token único para invitación
 */
export function generateInviteToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Crear o actualizar invitación y enviar email
 */
export async function sendTripInvite({
  tripId,
  email,
  role,
  tripName,
  inviterEmail,
  inviterName
}) {
  // Generar token
  const inviteToken = generateInviteToken();
  
  // Verificar si ya existe invitación pending
  const existingInvites = await base44.entities.TripInvite.filter({
    trip_id: tripId,
    email: email.toLowerCase(),
    status: 'pending'
  });

  let invite;
  if (existingInvites.length > 0) {
    // Actualizar token y resend
    invite = await base44.entities.TripInvite.update(existingInvites[0].id, {
      invite_token: inviteToken,
      invited_by: inviterEmail
    });
  } else {
    // Crear nueva invitación
    invite = await base44.entities.TripInvite.create({
      trip_id: tripId,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invite_token: inviteToken,
      invited_by: inviterEmail
    });
  }

  // Construir link de aceptación
  const inviteUrl = `${window.location.origin}/${window.location.pathname.split('/')[1]}/Invites?token=${inviteToken}`;

  // Enviar email
  await base44.integrations.Core.SendEmail({
    to: email,
    subject: `Te invitan a ${tripName} 🧳`,
    body: `Hola,

${inviterName || inviterEmail} te ha invitado a colaborar en el viaje "${tripName}" con rol de ${role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Lector'}.

Para aceptar la invitación, haz clic en el siguiente enlace:
${inviteUrl}

O cópialo en tu navegador si el enlace no funciona.

¿Preguntas? Contáctanos en soporte@kodo.travel

¡Que disfrutes planificando tu viaje! ✈️`
  });

  return invite;
}

/**
 * Aceptar invitación: actualizar TripInvite y agregar a Trip
 */
export async function acceptTripInvite(inviteId, inviteToken, tripId, userEmail) {
  // Obtener invitación y verificar token
  const invite = await base44.entities.TripInvite.get(inviteId);
  
  if (!invite || invite.invite_token !== inviteToken || invite.status !== 'pending') {
    throw new Error('Invitación inválida o expirada');
  }

  // Actualizar invitación
  await base44.entities.TripInvite.update(inviteId, {
    status: 'accepted',
    responded_date: new Date().toISOString()
  });

  // Obtener trip actual
  const trip = await base44.entities.Trip.get(tripId);
  
  // Agregar a members (si no está ya)
  const members = trip.members || [];
  const newMembers = members.includes(userEmail) ? members : [...members, userEmail];

  // Asignar rol
  const roles = trip.roles || {};
  const newRoles = { ...roles, [userEmail]: invite.role };

  // Actualizar trip
  await base44.entities.Trip.update(tripId, {
    members: newMembers,
    roles: newRoles
  });

  // Notificar al creador del viaje que alguien aceptó
  try {
    const creatorEmail = trip.created_by;
    if (creatorEmail && creatorEmail !== userEmail) {
      const creatorProfiles = await base44.entities.UserProfile.filter({ email: creatorEmail });
      const creatorProfile = creatorProfiles[0];
      if (creatorProfile?.user_id) {
        createNotification({
          userId: creatorProfile.user_id,
          type: 'trip_invite',
          refId: tripId,
          refTitle: trip.name || 'tu viaje',
          message: `${userEmail} se ha unido al viaje`,
        });
      }
    }
  } catch {
    // silencioso
  }

  return trip;
}

/**
 * Rechazar invitación
 */
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