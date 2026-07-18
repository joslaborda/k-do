/**
 * Automáticamente vincula documentos a días de itinerario basándose en fecha
 */

export function findMatchingItineraryDay(ticketDate, itineraryDays) {
  if (!ticketDate || !itineraryDays.length) return null;

  const ticketDateObj = new Date(ticketDate);

  // Buscar el primer día cuyo rango incluya la fecha del ticket
  const matchedDay = itineraryDays.find(day => {
    if (!day.date) return false;
    const dayDateObj = new Date(day.date);
    // Comparar por día (ignorar horas)
    return dayDateObj.toDateString() === ticketDateObj.toDateString();
  });

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
    const matchedDay = findMatchingItineraryDay(formData.date, itineraryDays);
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