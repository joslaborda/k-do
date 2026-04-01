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

  console.log('🔗 enrichTicketDataWithAutoLinks START:', {
    ticketDate: formData.date,
    ticketName: formData.name,
    category: formData.category,
    isTravel,
    userSelectedCityId,
    itineraryDaysAvailable: itineraryDays.length,
  });

  // Solo hacer auto-linking si es una categoría de viaje
  if (!isTravel) {
    console.log('⏭️ Skipping auto-link: categoría no es de viaje (personal/other no necesitan vinculación)');
    return enriched;
  }

  // Si tiene fecha y no tiene day asignado, buscar automáticamente
  if (formData.date && !formData.itinerary_day_id) {
    const matchedDay = findMatchingItineraryDay(formData.date, itineraryDays);
    console.log('🔍 Searching for itinerary day:', { ticketDate: formData.date, matchedDay: matchedDay?.title || 'NOT FOUND' });
    if (matchedDay) {
      enriched.itinerary_day_id = matchedDay.id;
      // Solo asignar city_id si el usuario no lo ha elegido manualmente
      if (!userSelectedCityId) {
        enriched.city_id = matchedDay.city_id;
      }
      console.log('✅ Auto-linked:', { itinerary_day_id: matchedDay.id, city_id: matchedDay.city_id });
    } else {
      console.log('❌ No matching itinerary day found for date:', formData.date);
    }
  } else {
    console.log('⏭️ Skipping auto-link:', {
      hasDate: !!formData.date,
      hasItineraryDayId: !!formData.itinerary_day_id,
    });
  }

  console.log('🔗 enrichTicketDataWithAutoLinks END:', {
    city_id: enriched.city_id,
    itinerary_day_id: enriched.itinerary_day_id,
  });

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
  
  console.log(`📊 Backfill: Found ${ticketsToUpdate.length} travel tickets without city_id or itinerary_day_id`);

  return ticketsToUpdate.map(ticket => {
    const matchedDay = findMatchingItineraryDay(ticket.date, itineraryDays);
    const updates = {};

    if (matchedDay) {
      updates.itinerary_day_id = matchedDay.id;
      updates.city_id = matchedDay.city_id;
      console.log(`✅ Backfill: ${ticket.name} → Day: ${matchedDay.title}, City: ${matchedDay.city_id}`);
    } else {
      console.log(`⚠️ Backfill: ${ticket.name} (${ticket.date}) - no matching day found`);
    }

    return { ticketId: ticket.id, updates };
  });
}