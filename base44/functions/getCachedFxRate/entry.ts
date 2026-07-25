import { createClientFromRequest } from "npm:@base44/sdk";

/**
 * getCachedFxRate — lee (si existe y sigue vigente) la fila cacheada de
 * ExchangeRateCache para un par (base, quote), en vez de dejar que el
 * cliente lea la entidad directo.
 *
 * Por qué (fix pendiente tras la ronda 4, señalado por José): el panel de seguridad de Base44 marca este
 * hallazgo como "Los usuarios públicos pueden acceder a todos los registros
 * de ExchangeRateCache" — es decir, es sobre LECTURA, no (solo) sobre
 * create/update. En la ronda 3 se cerraron create/update moviendo la
 * escritura a cacheFxRate, pero se dejó "read": true a propósito, dando por
 * hecho que un tipo de cambio no es información sensible — ese razonamiento
 * no es lo que el panel de Base44 evalúa: cualquier tabla con acceso público
 * sin restricción (leído aquí como "público" = sin sesión) se marca,
 * independientemente del contenido. Mismo problema de fondo que create/
 * update: el rls de Base44 no puede expresar "cualquier usuario
 * autenticado, pero no público", así que la única forma de cerrarlo del
 * todo es mover también la lectura a una función backend que exija sesión
 * real, y cerrar "read" a false en el rls de la entidad.
 *
 * Devuelve solo lo que el cliente necesita (rate/source/fetched_at), nunca
 * la fila cruda ni otras filas del mismo par.
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

    const { base: baseCcy, quote } = await req.json();

    if (!isPlausibleCurrencyCode(baseCcy) || !isPlausibleCurrencyCode(quote)) {
      return Response.json({ error: "Código de moneda inválido" }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const rows = await service.entities.ExchangeRateCache.filter({ base: baseCcy, quote });
    if (rows.length === 0) {
      return Response.json({ found: false });
    }

    const sorted = [...rows].sort(
      (a, b) => new Date(b.fetched_at || 0).getTime() - new Date(a.fetched_at || 0).getTime()
    );
    const row = sorted[0];

    if (!row.valid_until || new Date(row.valid_until) <= new Date()) {
      return Response.json({ found: false });
    }

    return Response.json({
      found: true,
      rate: row.rate,
      source: row.source,
      fetched_at: row.fetched_at,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
