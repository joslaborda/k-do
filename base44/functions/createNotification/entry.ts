import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * createNotification — crea una notificación validando quién puede notificar
 * a quién, en vez de dejar que el cliente escriba Notification.create() con
 * cualquier user_id/actor/tipo.
 *
 * Por qué: Notification.create estaba en `true` sin ninguna restricción,
 * documentado como "riesgo aceptado" — a diferencia de Like/SpotComment/
 * TripMessage, una notificación se crea SIEMPRE con el user_id del
 * DESTINATARIO, no de quien la genera, así que el rls no tenía ningún campo
 * útil contra el que comparar {{user.id}}/{{user.email}} de quien llama.
 * Cualquier usuario autenticado podía crear una notificación falsa (actor,
 * tipo y texto arbitrarios) dirigida a cualquier otro usuario de la app.
 *
 * Regla que sí se puede validar en backend, revisando los 11 sitios de la
 * app que generan notificaciones (doc_time, doc_added, expense_added,
 * expense_settled, photo_added, member_joined, spot_time, spot_added,
 * trip_invite): en todos los casos salvo uno, tanto quien notifica como a
 * quien se notifica son miembros ACTUALES del mismo viaje. El caso especial
 * es trip_invite: ahí el destinatario todavía NO es miembro (se le está
 * invitando), así que se valida en su lugar que exista una TripInvite
 * pendiente real para ese viaje dirigida a su email.
 *
 * El "actor" (nombre/usuario/avatar que se muestra en la notificación) ya no
 * lo manda el cliente — se deriva aquí del propio perfil de quien llama, así
 * nadie puede hacerse pasar por otra persona en el remitente de una
 * notificación.
 *
 * Push (OneSignal): este es el único sitio donde se crean las 9
 * notificaciones de la app (ver arriba), así que es también el sitio
 * correcto para disparar el push — no hace falta un segundo mecanismo de
 * triggers en ningún otro lado. Se manda por external_id (ver
 * src/lib/pushNotifications.js — OneSignal.login(user.id) en el cliente),
 * nunca guardamos token de dispositivo en nuestras propias entidades. Un
 * fallo mandando el push NUNCA debe tumbar la request: la notificación
 * in-app (Notification.create, arriba) es la fuente de verdad y ya se creó
 * correctamente cuando se intenta el push.
 */

const ALLOWED_TYPES = new Set([
  "doc_time",
  "doc_added",
  "expense_added",
  "expense_settled",
  "photo_added",
  "trip_invite",
  "member_joined",
  "spot_time",
  "spot_added",
    "chat_message",
    "trip_updated",
]);

// Mismo texto que src/i18n/es.json (notifications.*) — duplicado aquí a
// propósito: este function corre en el backend (Deno), sin acceso a
// i18next ni al bundle del frontend. Si cambia la redacción en es.json,
// hay que replicarla aquí a mano. Sin i18n de verdad en el push todavía
// (la app solo tiene es/en) — placeholder aceptado hasta que haga falta.
const PUSH_TEXT: Record<string, string> = {
  doc_time: "cambió la hora de un documento",
  doc_added: "subió un documento",
  expense_added: "añadió un gasto",
  expense_settled: "liquidó tu deuda",
  photo_added: "subió fotos",
  trip_invite: "te invitó a un viaje",
  member_joined: "se unió al viaje",
  spot_time: "cambió la hora de un spot",
  spot_added: "añadió un spot",
    chat_message: "envió un mensaje al chat",
    trip_updated: "actualizó las fechas o el destino del viaje",
};

// Mismos secretos que RESEND_API_KEY (ver sendInviteEmail/entry.ts) — se
// configuran en Base44 > Secretos del proyecto, nunca en el código.
const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

/**
 * Envía el push. Silencioso ante cualquier fallo (secretos sin configurar,
 * OneSignal caído, destinatario sin la app instalada — todo son casos
 * normales, no errores que deban propagarse).
 */
async function sendPush(recipientUserId: string, title: string, body: string, data: Record<string, unknown>) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return;
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        include_aliases: { external_id: [recipientUserId] },
        headings: { es: title, en: title },
        contents: { es: body, en: body },
        data,
      }),
    });
  } catch {
    // best-effort — ver comentario de la función.
  }
}

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const callerEmail = norm(user.email);

    const { userId, type, tripId, tripName, refId, refTitle, refExtra } = await req.json();

    if (!userId || typeof userId !== "string") {
      return Response.json({ error: "Falta el destinatario" }, { status: 400 });
    }
    if (typeof type !== "string" || !ALLOWED_TYPES.has(type)) {
      return Response.json({ error: "Tipo de notificación inválido" }, { status: 400 });
    }
    if (!tripId || typeof tripId !== "string") {
      return Response.json({ error: "Falta el viaje" }, { status: 400 });
    }

    const service = base44.asServiceRole;

    const trip = await service.entities.Trip.get(tripId);
    if (!trip) {
      return Response.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    const members: string[] = (trip.members || []).map(norm);
    if (!members.includes(callerEmail)) {
      return Response.json({ error: "No eres miembro de este viaje" }, { status: 403 });
    }

    // Un userId con formato inválido hace que el propio SDK lance una
    // excepción al consultar (en vez de devolver una lista vacía) — se
    // captura aparte para devolver un 404 limpio en vez de un 500 con el
    // mensaje interno del SDK.
    let recipientUser: any = null;
    try {
      const recipients = await service.entities.User.filter({ id: userId });
      recipientUser = recipients[0] || null;
    } catch {
      recipientUser = null;
    }
    if (!recipientUser?.email) {
      return Response.json({ error: "Destinatario no encontrado" }, { status: 404 });
    }
    const recipientEmail = norm(recipientUser.email);

    if (type === "trip_invite") {
      const invites = await service.entities.TripInvite.filter({
        trip_id: tripId,
        email: recipientEmail,
        status: "pending",
      });
      if (invites.length === 0) {
        return Response.json(
          { error: "No hay una invitación pendiente para ese destinatario en este viaje" },
          { status: 403 }
        );
      }
    } else if (!members.includes(recipientEmail)) {
      return Response.json({ error: "El destinatario no es miembro de este viaje" }, { status: 403 });
    }

    // No tiene sentido notificarse a uno mismo — y evita que una llamada mal
    // formada desde el cliente cree ruido en la propia bandeja del actor.
    if (recipientEmail === callerEmail) {
      return Response.json({ ok: true, skipped: true });
    }

    // Actor derivado del perfil de quien llama, nunca de lo que mande el
    // cliente — evita suplantar a otra persona como remitente.
    let actorProfile: any = null;
    try {
      const profiles = await service.entities.UserProfile.filter({ user_id: user.id });
      actorProfile = profiles[0] || null;
    } catch {
      actorProfile = null;
    }

    const actor_display_name = actorProfile?.display_name || actorProfile?.username || user.email;
    const actor_username = actorProfile?.username || null;
    const actor_avatar =
      actorProfile?.avatar_url && String(actorProfile.avatar_url).startsWith("http")
        ? actorProfile.avatar_url
        : null;

    const safeRefExtra =
      refExtra && typeof refExtra === "object" ? JSON.stringify(refExtra).slice(0, 2000) : null;

    await service.entities.Notification.create({
      user_id: recipientUser.id,
      type,
      read: false,
      actor_display_name,
      actor_username,
      actor_avatar,
      trip_id: tripId,
      trip_name: typeof tripName === "string" ? tripName.slice(0, 200) : trip.name || null,
      ref_id: typeof refId === "string" ? refId.slice(0, 200) : null,
      ref_title: typeof refTitle === "string" ? refTitle.slice(0, 300) : null,
      ref_extra: safeRefExtra,
    });

      // Respeta el interruptor único de Settings.jsx (notif_enabled).
    // Antes había toggles separados por tipo (notif_invites / notif_expenses);
    // ahora un solo campo gatea el push de los 9 tipos de notificación.
    // Las notificaciones in-app se siguen creando siempre; esto solo afecta al push.
    let recipientProfile: any = null;
    try {
        const recipientProfiles = await service.entities.UserProfile.filter({ user_id: recipientUser.id });
        recipientProfile = recipientProfiles[0] || null;
    } catch {
        recipientProfile = null;
    }
    const pushAllowed = recipientProfile?.notif_enabled !== false;

    if (pushAllowed) {
      const pushBody = `${actor_display_name} ${PUSH_TEXT[type] || "tiene novedades para ti"}`;
      await sendPush(recipientUser.id, trip.name || "Kaikōdo", pushBody, { tripId, type, refId: refId || null });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
