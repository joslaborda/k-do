import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * sendInviteEmail — manda el email de invitación a un viaje con HTML real
 * (fondo cremita de la app + tarjeta blanca, botón naranja clicable de
 * verdad), usando Resend en vez del SendEmail nativo de base44.
 *
 * Por qué: base44.integrations.Core.SendEmail solo admite body de texto
 * plano — no hay forma de mandar un <a href>, y confirmamos que ni siquiera
 * la URL en texto plano se convierte sola en enlace clicable en Outlook.
 *
 * Compatibilidad de email — importante: esto NO es una página web. Muchos
 * clientes (sobre todo Outlook de escritorio, que ya nos dio problemas)
 * usan un motor de render muy limitado: no soportan flexbox/grid, no
 * cargan fuentes de iconos externas, y el soporte de SVG inline es
 * irregular. Por eso aquí, a diferencia del resto de la app:
 *  - El logo va como imagen PNG incrustada (data URI), generada a partir
 *    del SVG real de marca — no como SVG inline ni como texto estilizado
 *    (ver comentario junto a LOGO_DATA_URI más abajo).
 *  - El layout usa <table> en vez de <div> con flex.
 *  - No hay iconos de fuente, solo texto.
 *
 * Idioma: se manda en el idioma que tenga activo quien invita en ese
 * momento (parámetro `lang`, 'es' o 'en') — el destinatario a menudo no
 * tiene cuenta todavía, así que no hay otro idioma que consultar.
 *
 * La API key de Resend vive en los secretos del proyecto (RESEND_API_KEY) y
 * nunca llega al navegador. Requiere sesión iniciada (igual que
 * acceptTripInvite) para que no se pueda usar este endpoint para mandar
 * correo arbitrario sin autenticar.
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Por defecto usa el remitente de pruebas de Resend — solo entrega al email
// con el que se creó la cuenta de Resend. Para invitar a cualquier persona
// real hace falta un dominio propio verificado en Resend y fijar
// RESEND_FROM_ADDRESS (p. ej. "Kōdo <invites@mail.kodotravel.app>") en
// Secretos.
const FROM_ADDRESS = Deno.env.get("RESEND_FROM_ADDRESS") || "Kōdo <onboarding@resend.dev>";

// Logo real (el SVG de marca que dio José) convertido a PNG e incrustado
// como data URI — así no depende de subir el archivo a ningún sitio. Se usa
// una imagen y no el SVG inline ni el texto estilizado que había antes:
//  - SVG inline: Outlook de escritorio no lo soporta, se vería roto.
//  - Texto estilizado: Outlook.com (web) reescribe el color de cualquier
//    texto en su "modo oscuro" (aunque el email pida explícitamente modo
//    claro), así que salía con la tipografía cambiada. Una imagen no se ve
//    afectada por esa reescritura de color de texto.
const LOGO_DATA_URI = "data:image/png;base64,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";

const STRINGS: Record<string, Record<string, string>> = {
  es: {
    invitedBy: "te invita a un viaje",
    button: "Ver invitación",
    linkHint: "¿El botón no funciona? Copia este enlace:",
    noAccount: "¿Aún no tienes cuenta en Kōdo? El mismo enlace te lleva a crearla — la invitación aparecerá automáticamente en cuanto entres.",
    destinationLabel: "Destino",
    datesLabel: "Fechas",
    subjectVerb: "te invita a",
    inKodo: "en Kōdo",
  },
  en: {
    invitedBy: "invited you on a trip",
    button: "View invitation",
    linkHint: "Button not working? Copy this link:",
    noAccount: "No account on Kōdo yet? The same link takes you to create one — the invitation will show up as soon as you sign in.",
    destinationLabel: "Destination",
    datesLabel: "Dates",
    subjectVerb: "invited you to",
    inKodo: "on Kōdo",
  },
};

function escapeHtml(str: unknown) {
  return String(str ?? "").replace(/[&<>"']/g, (c) =>
    ((
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>
    )[c])
  );
}

function formatDate(iso: string, lang: string) {
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-ES", {
      day: "numeric",
      month: lang === "en" ? "short" : "long",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!RESEND_API_KEY) {
      return Response.json({ error: "RESEND_API_KEY no configurada en Secretos" }, { status: 500 });
    }

    const {
      to,
      tripName,
      inviterName,
      inviterEmail,
      inviteUrl,
      destination,
      country,
      startDate,
      endDate,
      lang: rawLang,
    } = await req.json();

    if (!to || !inviteUrl) {
      return Response.json({ error: "Faltan datos del email (to / inviteUrl)" }, { status: 400 });
    }

    const lang = rawLang === "en" ? "en" : "es";
    const s = STRINGS[lang];

    const safeInviter = escapeHtml(inviterName || inviterEmail || (lang === "en" ? "Someone" : "Alguien"));
    const safeTrip = escapeHtml(tripName || "");
    const safeTo = escapeHtml(to);

    let datesLine = "";
    if (startDate) {
      const startFmt = formatDate(startDate, lang);
      datesLine = endDate ? `${startFmt} – ${formatDate(endDate, lang)}` : startFmt;
    }
    const destLine = destination ? `${escapeHtml(destination)}${country ? `, ${escapeHtml(country)}` : ""}` : "";

    const infoRows = [
      destLine ? `<strong>${s.destinationLabel}:</strong> ${destLine}` : "",
      datesLine ? `<strong>${s.datesLabel}:</strong> ${escapeHtml(datesLine)}` : "",
    ].filter(Boolean).join("<br>");

    const infoBox = infoRows
      ? `<tr><td style="padding:0 32px 22px;">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fdfbf9" style="background-color:#fdfbf9;border:1px solid #e2ddd7;border-radius:10px;">
             <tr><td class="kodo-muted" style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#78716c;">${infoRows}</td></tr>
           </table>
         </td></tr>`
      : "";

    // Nota sobre modo oscuro: sin estas etiquetas, clientes como Outlook.com
    // invierten automáticamente los colores del email (fondo claro → negro,
    // texto oscuro → blanco), rompiendo el diseño por completo — es lo que
    // se vio en la primera prueba real. El meta "color-scheme" le dice a los
    // clientes que lo respetan que este email es solo para modo claro, y las
    // reglas [data-ogsc]/[data-ogsb] son el hook específico que usa
    // Outlook.com cuando ignora ese meta y fuerza su propio modo oscuro. El
    // atributo bgcolor (además del style) es redundancia a propósito: cada
    // motor de email respeta uno u otro de forma inconsistente.
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  [data-ogsc] .kodo-bg, [data-ogsb] .kodo-bg { background-color:#f8f6f3 !important; }
  [data-ogsc] .kodo-card, [data-ogsb] .kodo-card { background-color:#ffffff !important; }
  [data-ogsc] .kodo-text, [data-ogsb] .kodo-text { color:#1b1917 !important; }
  [data-ogsc] .kodo-muted, [data-ogsb] .kodo-muted { color:#78716c !important; }
</style>
</head>
<body class="kodo-bg" style="margin:0;padding:0;background-color:#f8f6f3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8f6f3" class="kodo-bg" style="background-color:#f8f6f3;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="kodo-card" style="max-width:480px;width:100%;background-color:#ffffff;border:1px solid #e8e3dc;border-radius:12px;">

<tr><td style="padding:26px 32px;text-align:center;border-bottom:1px solid #f0ede8;">
<img src="${LOGO_DATA_URI}" width="120" alt="Kōdo" style="display:inline-block;height:auto;max-width:120px;border:0;outline:none;" />
</td></tr>

<tr><td style="padding:28px 32px 8px;text-align:center;">
<p class="kodo-muted" style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#78716c;">${safeInviter} ${s.invitedBy}</p>
<h1 class="kodo-text" style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#1b1917;">${safeTrip}</h1>
</td></tr>

${infoBox}

<tr><td style="padding:0 32px 8px;text-align:center;">
<a href="${inviteUrl}" style="display:inline-block;background-color:#c2410c;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;padding:13px 40px;border-radius:24px;">${s.button}</a>
</td></tr>

<tr><td style="padding:16px 32px 0;text-align:center;">
<p class="kodo-muted" style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a9490;">${s.linkHint}</p>
<p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#c2410c;word-break:break-all;">${inviteUrl}</p>
</td></tr>

<tr><td style="padding:16px 32px 26px;border-top:1px solid #f0ede8;">
<p class="kodo-muted" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a9490;line-height:1.6;">${s.noAccount}</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const subject = lang === "en"
      ? `${inviterName || inviterEmail || "Someone"} ${s.subjectVerb} "${tripName || ""}" ${s.inKodo} ✈️`
      : `${inviterName || inviterEmail} ${s.subjectVerb} "${tripName}" ${s.inKodo} ✈️`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      return Response.json({ error: `Resend: ${errText || resendRes.status}` }, { status: 502 });
    }

    const data = await resendRes.json().catch(() => ({}));
    return Response.json({ ok: true, id: data?.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
