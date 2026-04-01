import { base44 } from '@/api/base44Client';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';

/**
 * Generates itinerary days for a single city using AI.
 * Returns array of { title, date, content } objects.
 */
export async function generateDaysForCity({ city, trip, existingDays, preferences, allCities }) {
  const startDate = parseISO(city.start_date);
  const endDate = parseISO(city.end_date);
  const numDays = differenceInDays(endDate, startDate) + 1;

  // Collect already used places to avoid repetition
  const usedPlaces = existingDays
    .filter(d => d.city_id !== city.id)
    .map(d => d.content)
    .join('\n');

  const datesArray = Array.from({ length: numDays }, (_, i) =>
    format(addDays(startDate, i), 'yyyy-MM-dd')
  );

  const prompt = `
Eres un experto planificador de viajes a Japón. Debes generar un itinerario detallado para la ciudad de ${city.name}.

DATOS DEL VIAJE:
- Viaje: ${trip.name}
- Destino: ${trip.destination}, ${trip.country}
- Fechas generales: ${trip.start_date} → ${trip.end_date}
- Descripción: ${trip.description || 'Sin descripción'}

CIUDAD ACTUAL: ${city.name}
FECHAS EN ESTA CIUDAD: ${city.start_date} → ${city.end_date} (${numDays} días)
FECHAS A CUBRIR: ${datesArray.join(', ')}

OTRAS CIUDADES DE LA RUTA: ${allCities.map(c => `${c.name} (${c.start_date}→${c.end_date})`).join(', ')}

PREFERENCIAS DEL USUARIO:
- Ritmo: ${preferences.pace || 'equilibrado'}
- Lugares a visitar: ${preferences.places || 'No especificados'}
- Restaurantes: ${preferences.restaurants || 'No especificados'}
- Experiencias: ${preferences.experiences || 'No especificadas'}
- Evitar: ${preferences.avoid || 'Nada especificado'}

LUGARES YA PLANIFICADOS EN OTRAS CIUDADES (NO REPETIR):
${usedPlaces || 'Ninguno todavía'}

INSTRUCCIONES:
1. Crea exactamente ${numDays} día(s), uno por fecha de este array: ${datesArray.join(', ')}
2. Agrupa actividades por barrios/zonas para minimizar desplazamientos
3. Incluye: turismo matutino, comida (con restaurantes reales), actividades vespertinas y cena
4. El contenido debe estar en Markdown rico con emojis, horarios aproximados y pequeñas descripciones
5. Menciona zonas (ej. "Zona Shibuya", "Barrio Gion") en el título
6. NO repitas lugares ya usados en otras ciudades
7. Adapta el número de actividades al ritmo: relajado=3-4, equilibrado=5-6, intenso=7-8 actividades

Responde SOLO con JSON válido, sin markdown ni explicaciones, con este formato exacto:
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
 * Suggests cities for a trip that has no route defined.
 * Returns array of city objects to create.
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