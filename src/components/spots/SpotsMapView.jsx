import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLeaflet } from './spotsHelpers';

// Mapa de "todo el viaje" para la tab Mis spots: agrupa por ciudad (no hay
// campo de coordenadas en City, así que el centro de cada cluster se calcula
// como el centroide de los spots de esa ciudad que sí tienen lat/lng — no
// depende de ningún dato nuevo). Tocar el mapa fuera de un cluster dispara
// onCreatePin(lat,lng) para soltar un pin nuevo ahí mismo.
export default function SpotsMapView({ spots = [], cities = [], onCreatePin, onSelectCity, height = 260 }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onCreatePinRef = useRef(onCreatePin);
  const onSelectCityRef = useRef(onSelectCity);
  onCreatePinRef.current = onCreatePin;
  onSelectCityRef.current = onSelectCity;

  const withCoords = spots.filter(s => s?.lat && s?.lng);

  const clusters = Object.values(
    withCoords.reduce((acc, s) => {
      const key = s.city_id || s.city_name || 'sin_ciudad';
      if (!acc[key]) {
        const cityMeta = cities.find(c => c.id === s.city_id);
        acc[key] = { key, name: cityMeta?.name || s.city_name || t('spots.map.otherCity'), lat: 0, lng: 0, count: 0 };
      }
      acc[key].lat += s.lat;
      acc[key].lng += s.lng;
      acc[key].count += 1;
      return acc;
    }, {})
  ).map(c => ({ ...c, lat: c.lat / c.count, lng: c.lng / c.count }));

  useEffect(() => {
    if (!clusters.length) return undefined;
    let cancelled = false;

    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      clusters.forEach(c => {
        const size = Math.min(32 + c.count * 2, 56);
        const icon = L.divIcon({
          html: '<div style="width:' + size + 'px;height:' + size + 'px;background:hsl(16 75% 45% / .92);color:#fff;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:' + (size > 46 ? 15 : 13) + 'px;font-weight:800;box-shadow:0 3px 12px rgba(0,0,0,.3)">' + c.count + '</div>',
          iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: '',
        });
        const marker = L.marker([c.lat, c.lng], { icon }).addTo(map);
        marker.bindTooltip(c.name, { permanent: true, direction: 'bottom', offset: [0, size / 2 + 3], className: 'kodo-city-cluster-label' });
        marker.on('click', (e) => {
          // Evitar que el click del marker también dispare el click del mapa
          // (crearía un pin nuevo justo donde el usuario quería ver el cluster).
          if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
          if (map.getZoom() < 12) {
            map.setView([c.lat, c.lng], 13);
          } else if (onSelectCityRef.current) {
            onSelectCityRef.current(c.key);
          }
        });
      });

      map.on('click', (e) => {
        if (onCreatePinRef.current) onCreatePinRef.current(e.latlng.lat, e.latlng.lng);
      });

      map.fitBounds(L.latLngBounds(clusters.map(c => [c.lat, c.lng])), { padding: [42, 42] });
      mapRef.current = map;

      if (!document.getElementById('kodo-cluster-label-style')) {
        const style = document.createElement('style');
        style.id = 'kodo-cluster-label-style';
        style.textContent = '.kodo-city-cluster-label{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;font-weight:800;font-size:11px;color:hsl(var(--foreground));font-family:inherit;text-shadow:0 1px 2px rgba(255,255,255,.9),0 0 6px rgba(255,255,255,.9)}.kodo-city-cluster-label::before{display:none}';
        document.head.appendChild(style);
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters.map(c => c.key + ':' + c.count).join(',')]);

  if (!clusters.length) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-card">
        <p className="text-sm text-muted-foreground">{t('spots.map.noCoords')}</p>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} style={{ height, borderRadius: 16, overflow: 'hidden', cursor: 'crosshair' }} className="border border-border" />
      <p className="text-xs text-muted-foreground mt-2 px-1">{t('spots.map.tapHint')}</p>
    </div>
  );
}
