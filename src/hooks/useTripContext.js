import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getActiveCity } from '@/lib/tripContext';
import { getCountryMeta } from '@/lib/countryConfig';

export function useTripContext(tripId) {
  const storageKey = tripId ? `kodo_active_city_${tripId}` : null;

  const [overrideCityId, setOverrideCityIdState] = useState(() => {
    if (!storageKey) return null;
    return localStorage.getItem(storageKey) || null;
  });

  // Keep in sync if tripId changes
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    setOverrideCityIdState(saved || null);
  }, [storageKey]);

  const setOverrideCityId = useCallback((cityId) => {
    setOverrideCityIdState(cityId);
    if (storageKey) {
      if (cityId) localStorage.setItem(storageKey, cityId);
      else localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const clearOverride = useCallback(() => {
    setOverrideCityId(null);
  }, [setOverrideCityId]);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId,
  });

  const activeCity = useMemo(
    () => getActiveCity({ cities, overrideCityId, nowDate: new Date() }),
    [cities, overrideCityId]
  );

  // Meta del país activo (idioma, moneda, flag…) basado en activeCity
  const activeMeta = useMemo(() => {
    const country = activeCity?.country || trip?.country || '';
    return getCountryMeta(country);
  }, [activeCity, trip]);

  // Ruta completa (países únicos en orden cronológico)
  const countryRoute = useMemo(() => {
    const sorted = [...cities].sort((a, b) => {
      if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
      return (a.order ?? 0) - (b.order ?? 0);
    });
    const seen = new Set();
    const route = [];
    for (const c of sorted) {
      const country = c.country || trip?.country || '';
      if (country && !seen.has(country)) { seen.add(country); route.push(country); }
    }
    return route;
  }, [cities, trip]);

  return { trip, cities, activeCity, activeMeta, countryRoute, overrideCityId, setOverrideCityId, clearOverride };
}