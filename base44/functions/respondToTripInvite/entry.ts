import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * respondToTripInvite — mueve a decline/cancel de una invitación al backend,
 * igual que ya se hizo con acceptTripInvite.
 *
 * Por qué: TripInvite.jsonc tenía "update" abierto a cualquiera cuyo email
 * coincidiera con `data.email` O `data.invited_by` de la invitación — pero el
 * motor de reglas de Base44 solo puede comprobar QUÉ FILA se está tocando, no
 * QUÉ CAMPOS se están cambiando dentro del update. Con esa regla abierta,
 * cualquier usuario con una invitación propia (aunque fuera trivial, a un
 * viaje cualquiera) podía llamar al SDK directamente y reescribir `trip_id` y
 * `role` de ESA MISMA invitación para apuntar a un viaje ajeno y a "admin" —
 * y como acceptTripInvite confía en esos dos campos para decidir a qué viaje
 * y con qué rol se une, eso permitía autoasignarse admin de cualquier viaje
 * solo conociendo (o adivinando) su id.
 *
 * Con esto, TripInvite.update pasa a "false" en el rls (igual que create y
 * delete) y las dos únicas transiciones de estado legítimas desde el cliente
 * (el invitado rechaza, o quien invitó cancela) se hacen aquí, con
 * asServiceRole, tocando SOLO status/responded_date — nunca trip_id ni role.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const normalizedUserEmail = user.email.toLowerCase();

    const { inviteId, inviteToken, action } = await req.json();
    if (!inviteId || !action || !["decline", "cancel"].includes(action)) {
      return Response.json({ error: "Faltan datos de la invitación" }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const invite = await service.entities.TripInvite.get(inviteId);
    if (!invite || invite.status !== "pending") {
      return Response.json({ error: "Invitación inválida o expirada" }, { status: 400 });
    }

    if (action === "decline") {
      // Rechazar: solo la persona invitada, y solo con el token del enlace
      // (mismo criterio que acceptTripInvite) — evita que alguien más
      // rechace una invitación ajena solo por conocer su id.
      if (!inviteToken || invite.invite_token !== inviteToken) {
        return Response.json({ error: "Invitación inválida o expirada" }, { status: 400 });
      }
      if (!invite.email || invite.email.toLowerCase() !== normalizedUserEmail) {
        return Response.json({ error: "Esta invitación no es para tu cuenta." }, { status: 403 });
      }
      await service.entities.TripInvite.update(inviteId, {
        status: "declined",
        responded_date: new Date().toISOString(),
      });
      return Response.json({ ok: true });
    }

    // action === "cancel": solo quien la envió puede retirarla.
    if (!invite.invited_by || invite.invited_by.toLowerCase() !== normalizedUserEmail) {
      return Response.json({ error: "No puedes cancelar esta invitación." }, { status: 403 });
    }
    await service.entities.TripInvite.update(inviteId, {
      status: "cancelled",
      responded_date: new Date().toISOString(),
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
