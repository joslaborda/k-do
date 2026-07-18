/**
 * Automáticamente vincula documentos a días de itinerario basándose en fecha
 */

export function findMatchingItineraryDay(ticketDate, itineraryDays, preferredCityId) {
  if (!ticketDate || !itineraryDays.length) return null;

  const ticketDateObj = new Date(ticketDate);

  // En un día de tránsito, dos ItineraryDay de ciudades distintas pueden caer
  // en la misma fecha. Antes se tomaba el primero que encajara por fecha, sin
  // más — si el ticket ya tenía una ciudad conocida (elegida a mano o porque
  // el documento ya estaba vinculado a un city_id), el auto-link podía
  // "robarle" el día a la ciudad equivocada. Ahora, si se conoce la ciudad,
  // se prioriza el día de esa ciudad; solo si no hay match para ella se cae al
  // primer día que coincida en fecha (comportamiento anterior).
  const matchesDate = (day) => {
    if (!day.date) return false;
    return new Date(day.date).toDateString() === ticketDateObj.toDateString();
  };

  if (preferredCityId) {
    const cityMatch = itineraryDays.find(day => matchesDate(day) && day.city_id === preferredCityId);
    if (cityMatch) return cityMatch;
  }

  const matchedDay = itineraryDays.find(matchesDate);

  return matchedDay || null;
}

/**
 * Prepara datos del documento con vinculación automática
 * Solo vincula documentos de categoría "viaje" (flight, train, hotel, event)
 * Los documentos "personal" y "other" NO se asocian automáticamente
 * @param {Object} formData - datos del formulario
 * @param {Array} itineraryDays - lista de días del itinerario
 * @param {String} userSelectedCityId - city_id seleccionado manualmente por el usuario
 * @returns {Object} datos preparados con vinculaciones automáticas
 */
export function enrichTicketDataWithAutoLinks(formData, itineraryDays, userSelectedCityId) {
  const enriched = { ...formData };
  const travelCategories = ['flight', 'train', 'hotel', 'event'];
  const isTravel = travelCategories.includes(formData.category);

  // Solo hacer auto-linking si es una categoría de viaje
  if (!isTravel) {
    return enriched;
  }

  // Si tiene fecha y no tiene day asignado, buscar automáticamente
  if (formData.date && !formData.itinerary_day_id) {
    // Si el usuario ya eligió ciudad a mano, se prioriza el día de ESA ciudad
    // para esa fecha (relevante en días de tránsito, donde la fecha sola es
    // ambigua entre dos ciudades).
    const matchedDay = findMatchingItineraryDay(formData.date, itineraryDays, userSelectedCityId);
    if (matchedDay) {
      enriched.itinerary_day_id = matchedDay.id;
      // Solo asignar city_id si el usuario no lo ha elegido manualmente
      if (!userSelectedCityId) {
        enriched.city_id = matchedDay.city_id;
      }
    }
  }

  return enriched;
}

/**
 * Backfill: asigna city_id e itinerary_day_id a documentos existentes sin vinculación
 * Solo procesa documentos de categoría "viaje" (flight, train, hotel, event)
 * Ignora documentos personal y other que no necesitan vinculación
 */
export function createBackfillMutation(allTickets, itineraryDays, cities) {
  const travelCategories = ['flight', 'train', 'hotel', 'event'];
  const ticketsToUpdate = allTickets.filter(t => 
    !t.city_id && !t.itinerary_day_id && t.date && travelCategories.includes(t.category)
  );

  return ticketsToUpdate.map(ticket => {
    const matchedDay = findMatchingItineraryDay(ticket.date, itineraryDays);
    const updates = {};

    if (matchedDay) {
      updates.itinerary_day_id = matchedDay.id;
      updates.city_id = matchedDay.city_id;
    }

    return { ticketId: ticket.id, updates };
  });
}