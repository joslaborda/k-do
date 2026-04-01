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
 * @param {Object} formData - datos del formulario
 * @param {Array} itineraryDays - lista de días del itinerario
 * @param {String} userSelectedCityId - city_id seleccionado manualmente por el usuario
 * @returns {Object} datos preparados con vinculaciones automáticas
 */
export function enrichTicketDataWithAutoLinks(formData, itineraryDays, userSelectedCityId) {
  const enriched = { ...formData };

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