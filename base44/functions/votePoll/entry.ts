import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * votePoll — aplica el voto de quien llama sobre una encuesta (TripMessage
 * con file_type: 'poll'), sin exigir que sea el autor de la encuesta.
 *
 * Por qué en el backend: el fix de ronda 2 cerró TripMessage.update a
 * "solo el autor" (data.user_id === {{user.id}}) para impedir que alguien
 * editara/borrara el mensaje de otro — correcto para editar texto, pero
 * votePoll() en ChatTab.jsx también usa TripMessage.update para escribir los
 * votos, y esa escritura la necesita hacer CUALQUIER miembro del viaje, no
 * solo quien creó la encuesta. Con el rls tal cual quedó, solo el autor de
 * cada encuesta podía seguir votando en ella — el resto del grupo recibía un
 * rechazo silencioso de rls. Aquí se valida que quien llama sea miembro del
 * viaje (via trip_members del propio mensaje) y solo se le permite tocar SU
 * propia entrada en cada array de votos, nunca el resto.
 *
 * De paso resuelve del todo la condición de carrera que ya mitigaba
 * parcialmente el código de ChatTab.jsx (releer antes de escribir, pero sin
 * proteger la ventana entre el get() y el update()): aquí se relee y
 * reintenta hasta 4 veces, igual que el patrón ya usado en
 * migrateTripMembers/acceptTripInvite.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }
    const voterEmail = user.email.trim().toLowerCase();

    const { messageId, optionIdx } = await req.json();
    if (!messageId || !Number.isInteger(optionIdx) || optionIdx < 0) {
      return Response.json({ error: "Faltan datos" }, { status: 400 });
    }

    const service = base44.asServiceRole;

    let updated: any = null;
    let finalPollData: any = null;

    for (let intento = 0; intento < 4 && !updated; intento++) {
      const msg = await service.entities.TripMessage.get(messageId);
      if (!msg) {
        return Response.json({ error: "Mensaje no encontrado" }, { status: 404 });
      }
      if (msg.file_type !== "poll") {
        return Response.json({ error: "Ese mensaje no es una encuesta" }, { status: 400 });
      }

      const tripMembers: string[] = (msg.trip_members || []).map((e: string) => (e || "").trim().toLowerCase());
      if (!tripMembers.includes(voterEmail)) {
        return Response.json(
          { error: "No eres miembro del viaje de esta encuesta.", code: "not_member" },
          { status: 403 }
        );
      }

      let pollData: any;
      try {
        pollData = JSON.parse(msg.file_name || "{}");
      } catch {
        return Response.json({ error: "Encuesta corrupta" }, { status: 500 });
      }
      if (!Array.isArray(pollData.options) || optionIdx >= pollData.options.length) {
        return Response.json({ error: "Opción inválida" }, { status: 400 });
      }

      pollData.options = pollData.options.map((opt: any, i: number) => ({
        ...opt,
        votes:
          i === optionIdx
            ? [...new Set([...(opt.votes || []), voterEmail])]
            : (opt.votes || []).filter((v: string) => (v || "").toLowerCase() !== voterEmail),
      }));

      const newFileName = JSON.stringify(pollData);
      await service.entities.TripMessage.update(messageId, { file_name: newFileName });

      const check = await service.entities.TripMessage.get(messageId);
      if (check.file_name === newFileName) {
        updated = check;
        finalPollData = pollData;
        break;
      }

      await new Promise((r) => setTimeout(r, 120 * (intento + 1)));
    }

    if (!updated) {
      return Response.json(
        { error: "No se pudo registrar el voto. Vuelve a intentarlo.", code: "conflict" },
        { status: 409 }
      );
    }

    return Response.json({ ok: true, poll: finalPollData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
