import { base44 } from '@/api/base44Client';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';

/**
 * Extracts place names from itinerary content using simple heuristics.
 * Returns an array of strings to add to visited_places.
 */
export function extractPlacesFromDays(days) {
  const places = new Set();
  for (const day of days) {
    if (day.title) places.add(day.title.replace(/^Día \d+:?\s*/i, '').trim());
    if (day.content) {
      // Extract bold items (**Place Name**) and bullet points
      const boldMatches = day.content.match(/\*\*([^*]{3,40})\*\*/g) || [];
      boldMatches.forEach(m => places.add(m.replace(/\*\*/g, '').trim()));
    }
  }
  return Array.from(places).filter(p => p.length > 2);
}

/**
 * Saves preferences to both localStorage (fast) and the Trip entity (persistent).
 */
export async function savePreferences(tripId, preferences) {
  localStorage.setItem(`trip_prefs_${tripId}`, JSON.stringify(preferences));
  await base44.entities.Trip.update(tripId, { ai_preferences: preferences });
}

/**
 * Loads preferences: Trip entity first (persistent), localStorage as fallback.
 */
export async function loadPreferences(tripId, trip) {
  if (trip?.ai_preferences && Object.keys(trip.ai_preferences).length > 0) {
    // Also sync to localStorage for offline use
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
 * Returns array of { title, date, content } objects.
 */
export async function generateDaysForCity({ city, trip, existingDays, preferences, allCities, onStatus }) {
  const startDate = parseISO(city.start_date);
  const endDate = parseISO(city.end_date);
  const numDays = differenceInDays(endDate, startDate) + 1;

  const datesArray = Array.from({ length: numDays }, (_, i) =>
    format(addDays(startDate, i), 'yyyy-MM-dd')
  );

  // Use visited_places from trip entity (most accurate) + extract from existing days as fallback
  const visitedFromTrip = trip.visited_places || [];
  const visitedFromDays = extractPlacesFromDays(existingDays.filter(d => d.city_id !== city.id));
  const allVisited = Array.from(new Set([...visitedFromTrip, ...visitedFromDays]));

  // Also include current city's existing days to avoid intra-city repetition
  const sameCityExistingContent = existingDays
    .filter(d => d.city_id === city.id)
    .map(d => `- ${d.title}: ${d.content?.substring(0, 300)}`)
    .join('\n');

  if (onStatus) onStatus(`Recordando tus preferencias para ${city.name}...`);

  const prompt = `
Eres un experto planificador de viajes a Japón con memoria precisa. Debes generar un itinerario detallado para la ciudad de ${city.name}.

DATOS DEL VIAJE:
- Viaje: ${trip.name}
- Destino: ${trip.destination}, ${trip.country}
- Fechas generales: ${trip.start_date} → ${trip.end_date}
- Descripción: ${trip.description || 'Sin descripción'}

CIUDAD ACTUAL: ${city.name}
FECHAS EN ESTA CIUDAD: ${city.start_date} → ${city.end_date} (${numDays} días)
FECHAS A CUBRIR: ${datesArray.join(', ')}

OTRAS CIUDADES DE LA RUTA: ${allCities.map(c => `${c.name} (${c.start_date}→${c.end_date})`).join(', ')}

PREFERENCIAS DEL USUARIO (guardadas):
- Ritmo: ${preferences.pace || 'equilibrado'}
- Lugares a visitar: ${preferences.places || 'No especificados'}
- Restaurantes: ${preferences.restaurants || 'No especificados'}
- Experiencias: ${preferences.experiences || 'No especificadas'}
- Evitar: ${preferences.avoid || 'Nada especificado'}

🚫 LUGARES YA USADOS EN EL VIAJE (NO REPETIR NINGUNO DE ESTOS):
${allVisited.length > 0 ? allVisited.map(p => `- ${p}`).join('\n') : 'Ninguno todavía'}

${sameCityExistingContent ? `DÍAS YA PLANIFICADOS EN ${city.name.toUpperCase()} (coherencia interna, no repetir):\n${sameCityExistingContent}` : ''}

INSTRUCCIONES CRÍTICAS:
1. Crea exactamente ${numDays} día(s), uno por fecha: ${datesArray.join(', ')}
2. ⚠️ NO menciones NINGÚN lugar de la lista "LUGARES YA USADOS". Sin excepciones.
3. Agrupa actividades por barrios/zonas para minimizar desplazamientos
4. Incluye: turismo matutino, comida (con restaurantes reales), actividades vespertinas y cena
5. El contenido debe estar en Markdown rico con emojis, horarios aproximados y descripciones
6. Menciona zonas (ej. "Zona Shibuya", "Barrio Gion") en el título
7. Adapta el número de actividades al ritmo: relajado=3-4, equilibrado=5-6, intenso=7-8 actividades
8. Mantén coherencia con el resto del itinerario del viaje

Responde SOLO con JSON válido, sin markdown ni explicaciones:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "title": "Título descriptivo del día con zona o temática",
      "content": "Contenido detallado en Markdown con horarios, lugares y tips"
    }
  ]
}
`;

  if (onStatus) onStatus(`Evitando lugares repetidos en ${city.name}...`);

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
 */
export async function regenerateDay({ day, city, trip, allDays, preferences, onStatus }) {
  const visitedFromTrip = trip.visited_places || [];
  const otherDaysInCity = allDays.filter(d => d.city_id === city.id && d.id !== day.id);
  const daysInOtherCities = allDays.filter(d => d.city_id !== city.id);

  const visitedFromOtherDays = extractPlacesFromDays(daysInOtherCities);
  const usedInThisCity = extractPlacesFromDays(otherDaysInCity);
  const allVisited = Array.from(new Set([...visitedFromTrip, ...visitedFromOtherDays, ...usedInThisCity]));

  if (onStatus) onStatus('Mejorando tu plan actual...');

  const prompt = `
Eres un experto planificador de viajes a Japón con memoria perfecta. Regenera SOLO el día ${day.date} en ${city.name}.

VIAJE: ${trip.name} - ${trip.destination}
CIUDAD: ${city.name} (${city.start_date} → ${city.end_date})
DÍA A REGENERAR: ${day.date} (título actual: "${day.title}")

DÍAS YA PLANIFICADOS EN ${city.name.toUpperCase()} (mantener coherencia, no repetir sus lugares):
${otherDaysInCity.map(d => `- ${d.title}: ${d.content?.substring(0, 250)}`).join('\n') || 'Ninguno'}

🚫 TODOS LOS LUGARES YA USADOS EN EL VIAJE (NO REPETIR):
${allVisited.length > 0 ? allVisited.map(p => `- ${p}`).join('\n') : 'Ninguno todavía'}

PREFERENCIAS (guardadas): Ritmo ${preferences.pace || 'equilibrado'}
${preferences.places ? `Lugares deseados: ${preferences.places}` : ''}
${preferences.restaurants ? `Restaurantes: ${preferences.restaurants}` : ''}
${preferences.experiences ? `Experiencias: ${preferences.experiences}` : ''}
${preferences.avoid ? `Evitar: ${preferences.avoid}` : ''}

INSTRUCCIONES:
1. ⚠️ NO uses NINGÚN lugar de la lista de ya usados
2. Propón zonas y actividades diferentes a los otros días de la ciudad
3. Mantén coherencia con el ritmo y estilo del resto del viaje
4. Incluye horarios, restaurantes reales y consejos prácticos en Markdown

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
 */
export async function suggestCitiesForTrip({ trip, preferences }) {
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const prompt = `
Eres un experto planificador de viajes a Japón. El usuario tiene un viaje de ${totalDays} días a ${trip.destination}, ${trip.country} 
desde ${trip.start_date} hasta ${trip.end_date}.

PREFERENCIAS:
- Ritmo: ${preferences.pace || 'equilibrado'}
- Lugares a visitar: ${preferences.places || 'No especificados'}
- Experiencias: ${preferences.experiences || 'No especificadas'}
- Evitar: ${preferences.avoid || 'Nada'}

Sugiere las ciudades perfectas para este viaje, asignando días a cada una de forma lógica (considerando tiempos de traslado).
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