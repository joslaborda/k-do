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

// La aceptación en sí corre en el backend (base44/functions/acceptTripInvite),
// no aquí. Motivo: para poder cerrar Trip.update a "solo miembros actuales",
// esta era la única operación que necesitaba saltarse esa regla (el invitado
// se añade a sí mismo justo antes de ser miembro) — y de paso, la sincronización
// de trip_members en los datos ya existentes del viaje necesita permisos de
// servicio para no depender de que el nuevo miembro ya figure en cada registro
// (que es justo lo que está intentando arreglar). El email tampoco lo manda
// el cliente: lo toma la función de la sesión autenticada, así no se puede
// aceptar una invitación ajena falseando el email.
export async function acceptTripInvite(inviteId, inviteToken) {
  let result;
  try {
    result = await base44.functions.invoke('acceptTripInvite', { inviteId, inviteToken });
  } catch (e) {
    // Algunas versiones del SDK lanzan en vez de resolver con el error en el body.
    const serverError = e?.response?.data?.error || e?.data?.error;
    const err = new Error(serverError || e?.message || 'No se pudo unir al viaje.');
    const code = e?.response?.data?.code || e?.data?.code;
    if (code) err.code = code;
    throw err;
  }

  const data = result?.data ?? result;
  if (data?.error) {
    const err = new Error(data.error);
    if (data.code) err.code = data.code;
    throw err;
  }
  return data.trip;
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
