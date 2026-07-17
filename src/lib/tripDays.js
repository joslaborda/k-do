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
import { parseISO, addDays, format } from 'date-fns';

/**
 * Días de cada ciudad del viaje, en orden cronológico.
 * Solo incluye ciudades con fecha de inicio y fin.
 *
 * @param {Array<{name?: string, start_date?: string, end_date?: string, order?: number}>} cities
 * @returns {Array<{ date: string, city: string }>}  date en formato 'yyyy-MM-dd'
 */
export function getTripDays(cities = []) {
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
      days.push({ date: format(d, 'yyyy-MM-dd'), city: c.name || '' });
      d = addDays(d, 1);
    }
  }
  return days;
}

/** Solo las fechas ('yyyy-MM-dd'), sin repetir y ordenadas. */
export function getTripDates(cities = []) {
  return [...new Set(getTripDays(cities).map(x => x.date))].sort();
}
