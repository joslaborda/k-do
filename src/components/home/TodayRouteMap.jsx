import { useEffect, useRef } from 'react';
import { loadLeaflet } from '@/components/spots/spotsHelpers';
import { KODO_TILE_URL, KODO_TILE_SUBDOMAINS, KODO_TILE_ATTRIBUTION, injectKodoMapStyles } from '@/components/spots/mapTiles';

// Mini-mapa de la ruta del día: hotel (si hay uno guardado como spot type
// 'hotel' para esta ciudad) + los spots del día conectados en el orden de
// day_order. Usa el mismo loader/CDN de Leaflet que ya usa LeafletMap.jsx
// (Restaurants.jsx) para el selector de pin — nada nuevo que cargar dos veces.
//
// Solo pinta spots con lat/lng real; los que no tienen coordenadas (creados
// a mano sin marcar el mapa) se ignoran aquí, siguen apareciendo en el
// timeline de abajo como siempre.
export default function TodayRouteMap({ hotelSpot, spots = [], height = 150 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const routeSpots = spots.filter(s => s?.lat && s?.lng);
  const hasHotel = !!(hotelSpot?.lat && hotelSpot?.lng);
  const totalPoints = routeSpots.length + (hasHotel ? 1 : 0);

  useEffect(() => {
    if (totalPoints === 0) return undefined;
    let cancelled = false;

    injectKodoMapStyles();
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
      L.tileLayer(KODO_TILE_URL, { subdomains: KODO_TILE_SUBDOMAINS, attribution: KODO_TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

      const points = [];

      if (hasHotel) {
        points.push([hotelSpot.lat, hotelSpot.lng]);
        const hotelIcon = L.divIcon({
          html: '<div style="width:26px;height:26px;background:#6b6460;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="transform:rotate(45deg)"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg></div>',
          iconSize: [26, 26], iconAnchor: [13, 26], className: '',
        });
        L.marker([hotelSpot.lat, hotelSpot.lng], { icon: hotelIcon }).addTo(map);
      }

      routeSpots.forEach((spot, i) => {
        points.push([spot.lat, spot.lng]);
        const numIcon = L.divIcon({
          html: '<div style="width:24px;height:24px;background:hsl(16 75% 45%);color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.3)">' + (i + 1) + '</div>',
          iconSize: [24, 24], iconAnchor: [12, 12], className: '',
        });
        L.marker([spot.lat, spot.lng], { icon: numIcon }).addTo(map);
      });

      if (points.length > 1) {
        L.polyline(points, { color: 'hsl(16 75% 45%)', weight: 2.5, dashArray: '5,6', opacity: 0.85 }).addTo(map);
        map.fitBounds(L.latLngBounds(points), { padding: [24, 24] });
      } else {
        map.setView(points[0], 15);
      }

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelSpot?.id, hotelSpot?.lat, hotelSpot?.lng, routeSpots.map(s => s.id + ':' + s.lat + ':' + s.lng).join(',')]);

  if (totalPoints === 0) return null;

  return <div ref={containerRef} className="kodo-map-warm" style={{ height, borderRadius: 12, overflow: 'hidden' }} />;
}
