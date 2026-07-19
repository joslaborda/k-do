/**
 * tripDays.js — Días de un viaje a partir de sus ciudades.
 *
 * Este bucle estaba copy-pasteado en 7 sitios (asignar fecha a un spot, la hoja de
 * detalle, el modal, el formulario de documentos y dos veces en Spots). Cuando
 * apareció el bug del cambio de horario —se perdía el último día del viaje en los
 * husos con horario de verano— hubo que arreglarlo siete veces. Vive aquí para que
 * la próxima vez se arregle una.
 *
 * Ojo con las fechas: `parseISO` + `addDays` de date-fns respetan el cambio de
 * hora. Iterar con `new Date()` + `setDate()` y serializar con `toISOString()` NO:
 * mezcla métodos locales con UTC y desplaza o se come días.
 */
import { parseISO, addDays, format, differenceInDays } from 'date-fns';

/**
 * Días de cada ciudad del viaje, en orden cronológico.
 * Solo incluye ciudades con fecha de inicio y fin.
 *
 * Ojo: en un día de tránsito (la ciudad A termina el mismo día que empieza la
 * ciudad B) esta lista tiene dos entradas con la misma `date` pero distinto
 * `cityId`. Si el selector que consume esto usa solo `date` como value de un
 * <option>, el navegador no distingue cuál de las dos se eligió — usa siempre
 * la primera con ese valor. Por eso cada entrada trae `cityId`: los selectores
 * deben usar `${date}__${cityId}` como value, no `date` a secas.
 *
 * @param {Array<{id?: string, name?: string, start_date?: string, end_date?: string, order?: number}>} cities
 * @returns {Array<{ date: string, city: string, cityId: string|null }>}  date en formato 'yyyy-MM-dd'
 */
export function getTripDays(cities = []) {
  // `= []` solo cubre undefined: si llega null explícito hay que atajarlo aquí.
  if (!Array.isArray(cities)) return [];
  const sorted = [...cities].sort((a, b) => {
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
    return (a.order ?? 0) - (b.order ?? 0);
  });
  const days = [];
  for (const c of sorted) {
    if (!c.start_date || !c.end_date) continue;
    let d = parseISO(c.start_date);
    const end = parseISO(c.end_date);
    // Tope de seguridad: una fecha corrupta en la BD no debe colgar la pantalla.
    let guard = 0;
    while (d <= end && guard++ < 400) {
      days.push({ date: format(d, 'yyyy-MM-dd'), city: c.name || '', cityId: c.id || null });
      d = addDays(d, 1);
    }
  }
  return days;
}

/** Compara nombres de ciudad ignorando mayúsculas/minúsculas y espacios al
 *  borde — dos estancias son "la misma ciudad" a efectos de agrupar días
 *  aunque se haya tecleado con distinta capitalización o un espacio de más
 *  (p. ej. "Lima" vs "lima " al crear una parada nueva). Sin esto, una
 *  comparación exacta (===) excluye en silencio visitas repetidas a la
 *  misma ciudad cuyo nombre no coincide carácter a carácter. */
export function sameCityName(a, b) {
  const norm = s => (s || '').trim().toLowerCase();
  const na = norm(a);
  return !!na && na === norm(b);
}

/** Value único para un <option> de selector fecha+ciudad: combina fecha y ciudad
 *  para que días de tránsito (misma fecha, dos ciudades) no colisionen. */
export function tripDayOptionValue(day) {
  return `${day.date}__${day.cityId || ''}`;
}

/** Inversa de tripDayOptionValue: separa el value del <option> en {date, cityId}. */
export function parseTripDayOptionValue(value) {
  if (!value) return { date: '', cityId: null };
  const idx = value.indexOf('__');
  if (idx === -1) return { date: value, cityId: null };
  return { date: value.slice(0, idx), cityId: value.slice(idx + 2) || null };
}

/** Solo las fechas ('yyyy-MM-dd'), sin repetir y ordenadas. */
export function getTripDates(cities = []) {
  return [...new Set(getTripDays(cities).map(x => x.date))].sort();
}

/**
 * Días que faltan hasta una fecha 'yyyy-MM-dd', comparando siempre medianoche
 * contra medianoche. `differenceInDays(parseISO(dateStr), new Date())` sin
 * normalizar se adelantaba un día durante casi toda la víspera (comparaba
 * medianoche del destino contra la hora actual) — este bug estaba repetido en
 * Home.jsx, InicioTab.jsx, PreTripTab.jsx y Cities.jsx. Vive aquí para que la
 * próxima vez se arregle una sola vez (mismo patrón que getTripStatus en
 * TripCard.jsx, que ya lo hacía bien).
 *
 * @param {string} dateStr - fecha en formato 'yyyy-MM-dd'
 * @returns {number|null} días que faltan (negativo si ya pasó), null si no hay fecha
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = parseISO(dateStr);
  target.setHours(0, 0, 0, 0);
  return differenceInDays(target, today);
}
