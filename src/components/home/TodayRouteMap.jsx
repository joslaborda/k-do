import { useEffect, useRef } from 'react';
import { loadLeaflet } from '@/components/spots/spotsHelpers';
import { KODO_TILE_URL, KODO_TILE_SUBDOMAINS, KODO_TILE_ATTRIBUTION, injectKodoMapStyles } from '@/components/spots/mapTiles';

// Mini-mapa de la ruta del día: hotel (si hay uno guardado como spot type
// 'hotel' para esta ciudad) + los items del día con coordenadas, numerados
// en el mismo orden en que aparecen en el timeline de abajo (`items` ya
// llega ordenado desde DayCard.jsx — aquí solo se dibuja). Usa el mismo
// loader/CDN de Leaflet que ya usa LeafletMap.jsx (Restaurants.jsx) para el
// selector de pin — nada nuevo que cargar dos veces.
//
// `items` puede mezclar spots (lat/lng) y documentos de transporte con una
// ubicación guardada (location_lat/location_lng — aeropuerto/estación,
// buscada en DocumentForm). Lo que no tiene coordenadas se ignora aquí,
// sigue apareciendo en el timeline de abajo como siempre.
const DOC_ROUTE_COLOR = { flight: '#2563eb', train: '#16a34a' };

export default function TodayRouteMap({ hotelSpot, items = [], height = 150, onSelectSpot }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectSpotRef = useRef(onSelectSpot);
  onSelectSpotRef.current = onSelectSpot;

  const routeItems = items.filter(i => i._kind === 'spot' ? (i?.lat && i?.lng) : (i?.location_lat && i?.location_lng));
  const hasHotel = !!(hotelSpot?.lat && hotelSpot?.lng);
  const totalPoints = routeItems.length + (hasHotel ? 1 : 0);

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
        const hotelMarker = L.marker([hotelSpot.lat, hotelSpot.lng], { icon: hotelIcon }).addTo(map);
        // Mismo criterio que pedía: tocar el pin abre la misma ficha que tocar
        // la fila del timeline — no hay una fila de "hotel" en el timeline,
        // pero sigue siendo la misma SpotDetailModal que abre cualquier spot.
        hotelMarker.on('click', () => { if (onSelectSpotRef.current) onSelectSpotRef.current({ ...hotelSpot, _kind: 'spot' }); });
      }

      routeItems.forEach((item, i) => {
        const isDoc = item._kind === 'doc';
        const lat = isDoc ? item.location_lat : item.lat;
        const lng = isDoc ? item.location_lng : item.lng;
        points.push([lat, lng]);
        const bg = isDoc ? (DOC_ROUTE_COLOR[item.category || item.type] || 'hsl(16 75% 45%)') : 'hsl(16 75% 45%)';
        const numIcon = L.divIcon({
          html: '<div style="width:24px;height:24px;background:' + bg + ';color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.3)">' + (i + 1) + '</div>',
          iconSize: [24, 24], iconAnchor: [12, 12], className: '',
        });
        const marker = L.marker([lat, lng], { icon: numIcon }).addTo(map);
        // Click en el pin = click en la fila del timeline de abajo: misma
        // ficha (SpotDetailModal o ItemDetailSheet), mismo item, un solo
        // sitio de verdad — `item` ya trae el _kind correcto desde DayCard.
        marker.on('click', () => { if (onSelectSpotRef.current) onSelectSpotRef.current(item); });
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
  }, [hotelSpot?.id, hotelSpot?.lat, hotelSpot?.lng, routeItems.map(i => i.id + ':' + (i._kind === 'doc' ? i.location_lat + ':' + i.location_lng : i.lat + ':' + i.lng)).join(',')]);

  if (totalPoints === 0) return null;

  return <div ref={containerRef} className="kodo-map-warm" style={{ height, borderRadius: 12, overflow: 'hidden' }} />;
}
