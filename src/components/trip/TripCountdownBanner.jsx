import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Circle } from 'lucide-react';

export default function TripCountdownBanner({
  daysUntilTrip,
  tripId,
  cities = [],
  packingItems = [],
  trip = {},
  expenses = []
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [hideExpiry, setHideExpiry] = useState(null);

  // Check localStorage on mount
  useEffect(() => {
    const storageKey = `kodo_hide_trip_banner_${tripId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const timestamp = parseInt(stored, 10);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (now - timestamp < oneDayMs) {
        setIsVisible(false);
        setHideExpiry(new Date(timestamp + oneDayMs));
        return;
      } else {
        // Expiry passed, remove from storage
        localStorage.removeItem(storageKey);
      }
    }
    setIsVisible(true);
  }, [tripId]);

  // Only show if banner is visible and within range
  if (!isVisible || daysUntilTrip > 7 || daysUntilTrip < 0) {
    return null;
  }

  // Helper: determinar estado de checklist item
  const isDocsOk = trip.documents_count > 0;
  const isPackingOk = packingItems.length > 0 && Math.round((packingItems.filter((i) => i.packed).length / packingItems.length) * 100) >= 80;
  const isCurrencyOk = !!trip.currency;
  const isRouteOk = cities.length > 0;
  const isGuestOk = (trip.members?.length || 0) > 1;

  const items = [
    {
      id: 'docs',
      label: 'Docs listos',
      ok: isDocsOk,
      page: 'Documents',
      icon: '📄'
    },
    {
      id: 'packing',
      label: 'Maleta',
      ok: isPackingOk,
      page: 'Packing',
      icon: '🧳'
    },
    {
      id: 'currency',
      label: 'Divisa',
      ok: isCurrencyOk,
      page: 'Utilities',
      icon: '💱'
    },
    {
      id: 'route',
      label: 'Ruta',
      ok: isRouteOk,
      page: 'Cities',
      icon: '🗺️'
    },
    {
      id: 'guests',
      label: 'Invitados',
      ok: isGuestOk,
      page: null, // No link, informa solamente
      icon: '👥'
    }
  ];

  const handleHide = () => {
    const storageKey = `kodo_hide_trip_banner_${tripId}`;
    localStorage.setItem(storageKey, Date.now().toString());
    setIsVisible(false);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">🚀 Tu viaje empieza en {daysUntilTrip} día{daysUntilTrip !== 1 ? 's' : ''}</h3>
          <p className="text-white/90 text-sm mt-1">Aquí está tu checklist rápido</p>
        </div>
        <button
          onClick={handleHide}
          className="text-white/80 hover:text-white transition-colors"
          title="Ocultar por 24 horas"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id}>
            {item.page ? (
              <Link
                to={createPageUrl(`${item.page}?trip_id=${tripId}`)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm flex-1">{item.label}</span>
                {item.ok ? (
                  <CheckCircle className="w-5 h-5 text-green-300" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40" />
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-3 p-2 rounded-lg opacity-75">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm flex-1">{item.label}</span>
                {item.ok ? (
                  <CheckCircle className="w-5 h-5 text-green-300" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <Link to={createPageUrl(`Packing?trip_id=${tripId}`)} className="flex-1">
          <Button className="w-full bg-white text-orange-700 hover:bg-orange-50 font-bold">
            Ver checklist completo
          </Button>
        </Link>
      </div>
    </div>
  );
}