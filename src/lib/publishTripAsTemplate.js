import { base44 } from '@/api/base44Client';
import { differenceInDays } from 'date-fns';

/**
 * Publica un viaje como ItineraryTemplate o actualiza uno existente
 * @param {Object} trip - Trip object
 * @param {Array} cities - Array de ciudades del viaje
 * @param {Object} user - User object con id y email
 * @param {Object} profile - UserProfile object con username
 * @param {string} visibility - 'private' | 'unlisted' | 'public'
 * @returns {Object} - Template creado o actualizado con { id, visibility, source_trip_id }
 */
export async function publishTripAsTemplate(trip, cities, user, profile, visibility) {
  if (!trip || !user) {
    throw new Error('Trip y User son requeridos');
  }

  const userId = user.id;
  const tripId = trip.id;
  const templateVisibility = visibility || trip.template_visibility || 'private';

  // Calcular duración
  let durationDays = 1;
  if (trip.start_date && trip.end_date) {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    durationDays = Math.max(1, differenceInDays(end, start) + 1);
  }

  // Extraer países y ciudades
  const countries = [];
  const cityNames = [];
  const citiesSeen = new Set();

  if (cities && cities.length > 0) {
    cities.forEach((city) => {
      // Añadir país si no está duplicado
      if (city.country && !countries.includes(city.country)) {
        countries.push(city.country);
      }
      // Añadir nombre de ciudad si no está duplicado
      if (city.name && !citiesSeen.has(city.name)) {
        cityNames.push(city.name);
        citiesSeen.add(city.name);
      }
    });
  }

  // Fallback: si no hay ciudades, usar country del trip
  if (countries.length === 0 && trip.country) {
    countries.push(trip.country);
  }

  // Generar slug simple (title + sufijo corto)
  const slug = trip.name
    ? trip.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50)
    : 'template';

  // Datos base del template
  const templateData = {
    title: trip.name || 'Sin título',
    summary: trip.description || `Un itinerario de ${durationDays} días`,
    duration_days: durationDays,
    countries: countries,
    cities: cityNames,
    tags: [], // Opcional: podrías extraer de description
    cover_image: trip.cover_image || '',
    created_by_user_id: userId,
    visibility: templateVisibility,
    source_trip_id: tripId,
    slug: slug
  };

  // Añadir username si existe profile
  if (profile && profile.username) {
    templateData.created_by_username = profile.username;
  }

  try {
    // Si el trip ya tiene template_id, actualizar
    if (trip.template_id) {
      const updated = await base44.entities.ItineraryTemplate.update(
        trip.template_id,
        templateData
      );
      return {
        id: updated.id,
        visibility: updated.visibility,
        source_trip_id: updated.source_trip_id
      };
    } else {
      // Crear nuevo template
      const created = await base44.entities.ItineraryTemplate.create(templateData);

      // Guardar template_id en el trip + visibility
      await base44.entities.Trip.update(tripId, {
        template_id: created.id,
        template_visibility: templateVisibility
      });

      return {
        id: created.id,
        visibility: created.visibility,
        source_trip_id: created.source_trip_id
      };
    }
  } catch (error) {
    console.error('Error publishing trip as template:', error);
    throw error;
  }
}

/**
 * Genera URL de TemplateDetail para compartir
 * @param {string} templateId - Template ID
 * @returns {string} - URL completa del template
 */
export function getTemplateShareUrl(templateId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/TemplateDetail?id=${templateId}`;
}