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
 *  - El logo va como texto con tipografía web-safe (no el SVG real que se
 *    usa dentro de la app), para que se vea en cualquier cliente.
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
<span class="kodo-text" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#1b1917;">K<span style="color:#c2410c;">&#333;</span>do</span>
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
