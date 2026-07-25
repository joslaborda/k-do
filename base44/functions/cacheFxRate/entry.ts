import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * cacheFxRate — escribe (crea o actualiza) una fila de la caché compartida
 * de tipos de cambio (ExchangeRateCache), en vez de dejar que el cliente
 * escriba directo en la entidad.
 *
 * Por qué: el panel de seguridad de Base44 marcó como CRÍTICO que
 * ExchangeRateCache tuviera create/update abiertos sin restricción — con el
 * motor de rls de Base44 no hay forma de expresar "cualquier usuario
 * AUTENTICADO, pero no público" como predicado (solo se puede comparar un
 * campo contra la identidad del usuario actual, o dejarlo en true/false a
 * secas), así que la única forma real de cerrar esto es mover la escritura
 * aquí, exigir sesión iniciada, y cerrar create/update a false en el rls de
 * la entidad.
 *
 * De paso, valida la forma de los datos (rate positivo y finito, base/quote
 * con pinta de código de moneda) — antes cualquiera podía escribir
 * literalmente cualquier valor. Y limpia duplicados: si por una condición de
 * carrera (dos pestañas pidiendo el mismo par a la vez) ya hay más de una
 * fila para el mismo (base, quote), se queda con la más reciente y borra el
 * resto en vez de sumar una fila más.
 */

function isPlausibleCurrencyCode(v: unknown): v is string {
  return typeof v === "string" && /^[A-Z]{3}$/.test(v);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const { base: baseCcy, quote, rate, source } = await req.json();

    if (!isPlausibleCurrencyCode(baseCcy) || !isPlausibleCurrencyCode(quote)) {
      return Response.json({ error: "Código de moneda inválido" }, { status: 400 });
    }
    const numRate = Number(rate);
    if (!Number.isFinite(numRate) || numRate <= 0 || numRate > 1_000_000_000) {
      return Response.json({ error: "Tasa de cambio inválida" }, { status: 400 });
    }
    const safeSource = typeof source === "string" ? source.slice(0, 100) : "unknown";

    const service = base44.asServiceRole;
    const now = new Date().toISOString();
    const valid_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const rows = await service.entities.ExchangeRateCache.filter({ base: baseCcy, quote });
    if (rows.length > 0) {
      const sorted = [...rows].sort(
        (a, b) => new Date(b.fetched_at || 0).getTime() - new Date(a.fetched_at || 0).getTime()
      );
      const keep = sorted[0];
      await service.entities.ExchangeRateCache.update(keep.id, {
        rate: numRate,
        source: safeSource,
        fetched_at: now,
        valid_until,
      });
      for (const dupe of sorted.slice(1)) {
        try {
          await service.entities.ExchangeRateCache.delete(dupe.id);
        } catch {
          // No bloquear la respuesta por un duplicado que no se pudo borrar.
        }
      }
    } else {
      await service.entities.ExchangeRateCache.create({
        base: baseCcy,
        quote,
        rate: numRate,
        source: safeSource,
        fetched_at: now,
        valid_until,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
