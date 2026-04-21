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
 * Devuelve la ciudad activa con prioridad:
 *  1) overrideCityId si es válido (está en la lista)
 *  2) ciudad cuyas fechas envuelven nowDate
 *  3) primera ciudad por order
 */
export function getActiveCity({ cities = [], overrideCityId = null, nowDate = new Date() } = {}) {
  if (!cities.length) return null;

  // 1. Override manual
  if (overrideCityId) {
    const found = cities.find((c) => c.id === overrideCityId);
    if (found) return found;
  }

  // 2. Por fecha
  const now = nowDate instanceof Date ? nowDate : new Date(nowDate);
  for (const city of cities) {
    const start = parseDateOnly(city.start_date);
    const end = parseDateOnly(city.end_date);
    if (start && end && now >= start && now <= end) return city;
  }

  // 3. Fallback: primera ciudad
  return cities[0];
}