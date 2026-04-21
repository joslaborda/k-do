/**
 * Trip Context Engine — lógica pura sin side-effects de React.
 */

/**
 * Parsea una fecha YYYY-MM-DD de forma robusta (sin zona horaria).
 */
export function parseDateOnly(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Ordena ciudades: primero por start_date, luego por order.
 */
function sortedCities(cities) {
  return [...cities].sort((a, b) => {
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
    if (a.start_date) return -1;
    if (b.start_date) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/**
 * Devuelve la ciudad activa con prioridad:
 *  1) overrideCityId si es válido (está en la lista)
 *  2) ciudad cuyas fechas envuelven nowDate (viaje en curso)
 *  3) si el viaje aún no empezó → primera parada
 *  4) si el viaje ya terminó    → última parada
 *  5) fallback: primera ciudad
 */
export function getActiveCity({ cities = [], overrideCityId = null, nowDate = new Date() } = {}) {
  if (!cities.length) return null;

  // 1. Override manual
  if (overrideCityId) {
    const found = cities.find((c) => c.id === overrideCityId);
    if (found) return found;
  }

  const now = nowDate instanceof Date ? nowDate : new Date(nowDate);
  const sorted = sortedCities(cities);

  // 2. Ciudad en curso (fechas envuelven hoy)
  for (const city of sorted) {
    const start = parseDateOnly(city.start_date);
    const end = parseDateOnly(city.end_date);
    if (start && end && now >= start && now <= end) return city;
  }

  // 3. Viaje no empezado → primera parada cronológica
  const firstWithDate = sorted.find((c) => c.start_date);
  if (firstWithDate) {
    const firstStart = parseDateOnly(firstWithDate.start_date);
    if (firstStart && now < firstStart) return firstWithDate;
  }

  // 4. Viaje terminado → última parada cronológica
  const lastWithDate = [...sorted].reverse().find((c) => c.end_date);
  if (lastWithDate) {
    const lastEnd = parseDateOnly(lastWithDate.end_date);
    if (lastEnd && now > lastEnd) return lastWithDate;
  }

  // 5. Fallback: primera ciudad
  return sorted[0];
}