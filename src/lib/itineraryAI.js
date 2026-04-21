// ============ COUNTRY CONFIG ============
const COUNTRY_CONFIGS = {
  'Japón': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
  'Japan': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
  'Tailandia': { currency: 'THB', symbol: '฿', locale: 'th-TH', lang: 'Thai', langNative: 'ภาษาไทย', flag: '🇹🇭' },
  'Corea del Sur': { currency: 'KRW', symbol: '₩', locale: 'ko-KR', lang: 'Korean', langNative: '한국어', flag: '🇰🇷' },
  'China': { currency: 'CNY', symbol: '¥', locale: 'zh-CN', lang: 'Chinese', langNative: '中文', flag: '🇨🇳' },
  'Vietnam': { currency: 'VND', symbol: '₫', locale: 'vi-VN', lang: 'Vietnamese', langNative: 'Tiếng Việt', flag: '🇻🇳' },
  'India': { currency: 'INR', symbol: '₹', locale: 'hi-IN', lang: 'Hindi', langNative: 'हिन्दी', flag: '🇮🇳' },
  'Francia': { currency: 'EUR', symbol: '€', locale: 'fr-FR', lang: 'French', langNative: 'Français', flag: '🇫🇷' },
  'Italia': { currency: 'EUR', symbol: '€', locale: 'it-IT', lang: 'Italian', langNative: 'Italiano', flag: '🇮🇹' },
  'Alemania': { currency: 'EUR', symbol: '€', locale: 'de-DE', lang: 'German', langNative: 'Deutsch', flag: '🇩🇪' },
  'Portugal': { currency: 'EUR', symbol: '€', locale: 'pt-PT', lang: 'Portuguese', langNative: 'Português', flag: '🇵🇹' },
  'Grecia': { currency: 'EUR', symbol: '€', locale: 'el-GR', lang: 'Greek', langNative: 'Ελληνικά', flag: '🇬🇷' },
  'Reino Unido': { currency: 'GBP', symbol: '£', locale: 'en-GB', lang: 'English', langNative: 'English', flag: '🇬🇧' },
  'Suiza': { currency: 'CHF', symbol: 'Fr', locale: 'de-CH', lang: 'German', langNative: 'Deutsch', flag: '🇨🇭' },
  'México': { currency: 'MXN', symbol: '$', locale: 'es-MX', lang: 'Spanish', langNative: 'Español', flag: '🇲🇽' },
  'Estados Unidos': { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🇺🇸' },
  'Brasil': { currency: 'BRL', symbol: 'R$', locale: 'pt-BR', lang: 'Portuguese', langNative: 'Português', flag: '🇧🇷' },
  'Argentina': { currency: 'ARS', symbol: '$', locale: 'es-AR', lang: 'Spanish', langNative: 'Español', flag: '🇦🇷' },
  'Marruecos': { currency: 'MAD', symbol: 'DH', locale: 'ar-MA', lang: 'Arabic', langNative: 'العربية', flag: '🇲🇦' },
  'Turquía': { currency: 'TRY', symbol: '₺', locale: 'tr-TR', lang: 'Turkish', langNative: 'Türkçe', flag: '🇹🇷' },
  'Australia': { currency: 'AUD', symbol: '$', locale: 'en-AU', lang: 'English', langNative: 'English', flag: '🇦🇺' },
};

export function getCountryConfig(country) {
  if (!country) return { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🌍' };
  return (
    COUNTRY_CONFIGS[country] ||
    Object.entries(COUNTRY_CONFIGS).find(([k]) => k.toLowerCase() === country.toLowerCase())?.[1] ||
    { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🌍' }
  );
}
// ============ FIN COUNTRY CONFIG ============

import { base44 } from '@/api/base44Client';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';

/**
 * Extracts place names from itinerary content using simple heuristics.
 */
export function extractPlacesFromDays(days) {
  const places = new Set();
  for (const day of days) {
    if (day.title) places.add(day.title.replace(/^Día \d+:?\s*/i, '').trim());
    if (day.content) {
      const boldMatches = day.content.match(/\*\*([^*]{3,40})\*\*/g) || [];
      boldMatches.forEach(m => places.add(m.replace(/\*\*/g, '').trim()));
    }
  }
  return Array.from(places).filter(p => p.length > 2);
}

/**
 * Saves preferences to both localStorage and the Trip entity.
 */
export async function savePreferences(tripId, preferences) {
  localStorage.setItem(`trip_prefs_${tripId}`, JSON.stringify(preferences));
  await base44.entities.Trip.update(tripId, { ai_preferences: preferences });
}

/**
 * Loads preferences: Trip entity first, localStorage as fallback.
 */
export async function loadPreferences(tripId, trip) {
  if (trip?.ai_preferences && Object.keys(trip.ai_preferences).length > 0) {
    localStorage.setItem(`trip_prefs_${tripId}`, JSON.stringify(trip.ai_preferences));
    return trip.ai_preferences;
  }
  try {
    return JSON.parse(localStorage.getItem(`trip_prefs_${tripId}`) || '{}');
  } catch {
    return {};
  }
}

/**
 * Adds new places to the trip's visited_places list, deduplicating.
 */
export async function updateVisitedPlaces(trip, newDays) {
  const existing = trip.visited_places || [];
  const newPlaces = extractPlacesFromDays(newDays);
  const merged = Array.from(new Set([...existing, ...newPlaces]));
  await base44.entities.Trip.update(trip.id, { visited_places: merged });
  return merged;
}

/**
 * Generates itinerary days for a single city using AI.
 * Works for ANY country, not just Japan.
 */
export async function generateDaysForCity({ city, trip, existingDays, preferences, allCities, onStatus }) {
  const startDate = parseISO(city.start_date);
  const endDate = parseISO(city.end_date);
  const numDays = differenceInDays(endDate, startDate) + 1;

  const datesArray = Array.from({ length: numDays }, (_, i) =>
    format(addDays(startDate, i), 'yyyy-MM-dd')
  );

  const visitedFromTrip = trip.visited_places || [];
  const visitedFromDays = extractPlacesFromDays(existingDays.filter(d => d.city_id !== city.id));
  const allVisited = Array.from(new Set([...visitedFromTrip, ...visitedFromDays]));

  const sameCityExistingContent = existingDays
    .filter(d => d.city_id === city.id)
    .map(d => `- ${d.title}: ${d.content?.substring(0, 300)}`)
    .join('\n');

  const destination = trip.destination || city.name;
  const country = trip.country || '';

  if (onStatus) onStatus(`Planificando ${city.name}...`);

  const prompt = `
Eres un experto planificador de viajes con amplio conocimiento de ${country}. 
Genera un itinerario detallado para ${city.name}, ${country}.

DATOS DEL VIAJE:
- Viaje: ${trip.name}
- Destino principal: ${destination}, ${country}
- Fechas generales: ${trip.start_date} → ${trip.end_date}
- Descripción: ${trip.description || 'Sin descripción'}

CIUDAD ACTUAL: ${city.name}
FECHAS: ${city.start_date} → ${city.end_date} (${numDays} días)
FECHAS A CUBRIR: ${datesArray.join(', ')}

OTRAS CIUDADES DE LA RUTA: ${allCities.map(c => `${c.name} (${c.start_date}→${c.end_date})`).join(', ')}

PREFERENCIAS DEL USUARIO:
- Ritmo: ${preferences.pace || 'equilibrado'}
- Lugares a visitar: ${preferences.places || 'No especificados'}
- Restaurantes: ${preferences.restaurants || 'No especificados'}
- Experiencias: ${preferences.experiences || 'No especificadas'}
- Evitar: ${preferences.avoid || 'Nada especificado'}

🚫 LUGARES YA USADOS EN EL VIAJE (NO REPETIR):
${allVisited.length > 0 ? allVisited.map(p => `- ${p}`).join('\n') : 'Ninguno todavía'}

${sameCityExistingContent ? `DÍAS YA PLANIFICADOS EN ${city.name.toUpperCase()} (no repetir):\n${sameCityExistingContent}` : ''}

INSTRUCCIONES:
1. Crea exactamente ${numDays} día(s), uno por fecha: ${datesArray.join(', ')}
2. ⚠️ NO menciones NINGÚN lugar de la lista "LUGARES YA USADOS"
3. Agrupa actividades por zonas/barrios para minimizar desplazamientos
4. Incluye: turismo matutino, comida (restaurantes reales locales), tarde y cena
5. Usa Markdown con emojis, horarios aproximados y descripciones útiles
6. Menciona el barrio o zona en el título del día (ej. "Zona Centro Histórico")
7. Adapta actividades al ritmo: relajado=3-4, equilibrado=5-6, intenso=7-8 actividades
8. Menciona la gastronomía típica local del país cuando sea relevante
9. Incluye consejos prácticos (transporte local, costumbres, propinas, etc.)

Responde SOLO con JSON válido, sin markdown ni explicaciones:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "title": "Título descriptivo con zona o temática",
      "content": "Contenido detallado en Markdown con horarios, lugares y tips"
    }
  ]
}
`;

  if (onStatus) onStatus(`Generando itinerario para ${city.name}...`);

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        days: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    },
  });

  return result.days || [];
}

/**
 * Regenerates a single day with full trip context.
 * Works for ANY country.
 */
export async function regenerateDay({ day, city, trip, allDays, preferences, onStatus }) {
  const visitedFromTrip = trip.visited_places || [];
  const otherDaysInCity = allDays.filter(d => d.city_id === city.id && d.id !== day.id);
  const daysInOtherCities = allDays.filter(d => d.city_id !== city.id);

  const visitedFromOtherDays = extractPlacesFromDays(daysInOtherCities);
  const usedInThisCity = extractPlacesFromDays(otherDaysInCity);
  const allVisited = Array.from(new Set([...visitedFromTrip, ...visitedFromOtherDays, ...usedInThisCity]));

  const country = trip.country || '';

  if (onStatus) onStatus('Mejorando tu plan actual...');

  const prompt = `
Eres un experto planificador de viajes con amplio conocimiento de ${country}.
Regenera SOLO el día ${day.date} en ${city.name}, ${country}.

VIAJE: ${trip.name} - ${trip.destination}, ${country}
CIUDAD: ${city.name} (${city.start_date} → ${city.end_date})
DÍA A REGENERAR: ${day.date} (título actual: "${day.title}")

DÍAS YA PLANIFICADOS EN ${city.name.toUpperCase()} (mantener coherencia, no repetir lugares):
${otherDaysInCity.map(d => `- ${d.title}: ${d.content?.substring(0, 250)}`).join('\n') || 'Ninguno'}

🚫 TODOS LOS LUGARES YA USADOS EN EL VIAJE (NO REPETIR):
${allVisited.length > 0 ? allVisited.map(p => `- ${p}`).join('\n') : 'Ninguno'}

PREFERENCIAS: Ritmo ${preferences.pace || 'equilibrado'}
${preferences.places ? `Lugares deseados: ${preferences.places}` : ''}
${preferences.restaurants ? `Restaurantes: ${preferences.restaurants}` : ''}
${preferences.experiences ? `Experiencias: ${preferences.experiences}` : ''}
${preferences.avoid ? `Evitar: ${preferences.avoid}` : ''}

INSTRUCCIONES:
1. ⚠️ NO uses NINGÚN lugar de la lista de ya usados
2. Propón zonas y actividades diferentes a los otros días de la ciudad
3. Mantén coherencia con el estilo del viaje
4. Incluye horarios, restaurantes reales locales y consejos prácticos en Markdown
5. Incluye gastronomía típica de ${country} cuando sea relevante

Responde SOLO con JSON válido:
{
  "title": "Nuevo título descriptivo con zona",
  "content": "Contenido detallado en Markdown con horarios, lugares y tips"
}
`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
      },
    },
  });

  return result;
}

/**
 * Suggests cities for a trip that has no route defined.
 * Works for ANY country.
 */
export async function suggestCitiesForTrip({ trip, preferences }) {
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const country = trip.country || trip.destination || 'el destino';

  const prompt = `
Eres un experto planificador de viajes con amplio conocimiento de ${country}.
El usuario tiene un viaje de ${totalDays} días a ${trip.destination}, ${country}
desde ${trip.start_date} hasta ${trip.end_date}.

PREFERENCIAS:
- Ritmo: ${preferences.pace || 'equilibrado'}
- Lugares a visitar: ${preferences.places || 'No especificados'}
- Experiencias: ${preferences.experiences || 'No especificadas'}
- Evitar: ${preferences.avoid || 'Nada'}

Sugiere las ciudades/zonas perfectas para este viaje, asignando días de forma lógica
(considera tiempos de traslado entre ciudades, distancias, y lo más destacado de cada una).
Las fechas deben ser consecutivas sin gaps, empezando en ${trip.start_date} y terminando en ${trip.end_date}.

Responde SOLO con JSON válido:
{
  "cities": [
    {
      "name": "Nombre de la ciudad",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "order": 0
    }
  ]
}
`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        cities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  });

  return result.cities || [];
}