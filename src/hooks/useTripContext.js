import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getActiveCity } from '@/lib/tripContext';

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

  return { trip, cities, activeCity, overrideCityId, setOverrideCityId, clearOverride };
}