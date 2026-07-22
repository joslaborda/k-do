import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadLeaflet, TYPE_CONFIG } from './spotsHelpers';
import { KODO_TILE_URL, KODO_TILE_SUBDOMAINS, KODO_TILE_ATTRIBUTION, injectKodoMapStyles } from './mapTiles';
import { sameCityName } from '@/lib/tripDays';

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

  // Agrupar por NOMBRE de ciudad normalizado, no por city_id — un spot puede
  // tener city_id de una estancia concreta (o ni eso, si es "sin_ciudad") y
  // dos estancias distintas del mismo viaje pueden compartir nombre (p. ej.
  // "Lima" ida y vuelta). Agrupar por id partía esos casos en dos clusters
  // de 1 con el mismo nombre en vez de uno solo de 2 — mismo criterio que ya
  // usa sameCityName() en SpotDetailModal/SpotDetailSheet para esto mismo.
  const clusters = Object.values(
    withCoords.reduce((acc, s) => {
      const cityMeta = cities.find(c => c.id === s.city_id);
      const name = cityMeta?.name || s.city_name || t('spots.map.otherCity');
      const key = Object.keys(acc).find(k => sameCityName(k, name)) || name;
      if (!acc[key]) acc[key] = { key, name, lat: 0, lng: 0, spots: [] };
      acc[key].lat += s.lat;
      acc[key].lng += s.lng;
      acc[key].spots.push(s);
      return acc;
    }, {})
  ).map(c => ({ ...c, lat: c.lat / c.spots.length, lng: c.lng / c.spots.length, count: c.spots.length }));

  useEffect(() => {
    if (!clusters.length) return undefined;
    let cancelled = false;

    injectKodoMapStyles();
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      // zoomControl:true — mismo default que LeafletMap.jsx (el selector de
      // pin al crear spot). Antes lo llevaba a false sin querer y, sumado a
      // scrollWheelZoom:false, no había ninguna forma de hacer zoom out.
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
      L.tileLayer(KODO_TILE_URL, { subdomains: KODO_TILE_SUBDOMAINS, attribution: KODO_TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

      clusters.forEach(c => {
        // Un cluster de un solo spot no aporta nada mostrando "1" — se ve el
        // icono real de su tipo (mismo TYPE_CONFIG que SpotCard/MySpotRow),
        // así se sabe qué es sin tener que tocarlo. Con 2+ sí tiene sentido
        // el número, ahí ya es "cuántos hay", no "qué es".
        const single = c.count === 1 ? c.spots[0] : null;
        const size = single ? 30 : Math.min(32 + c.count * 2, 56);
        const inner = single
          ? renderToStaticMarkup((() => {
              const tc = TYPE_CONFIG[single.type] || TYPE_CONFIG.custom;
              const Icon = tc.Icon;
              return <Icon size={14} color="#fff" strokeWidth={2.5} />;
            })())
          : String(c.count);
        const fontSize = single ? 0 : (size > 46 ? 15 : 13);
        const icon = L.divIcon({
          html: '<div style="width:' + size + 'px;height:' + size + 'px;background:hsl(16 75% 45% / .92);color:#fff;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:' + fontSize + 'px;font-weight:800;box-shadow:0 3px 12px rgba(0,0,0,.3)">' + inner + '</div>',
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
      <div ref={containerRef} style={{ height, borderRadius: 16, overflow: 'hidden', cursor: 'crosshair' }} className="border border-border kodo-map-warm" />
      <p className="text-xs text-muted-foreground mt-2 px-1">{t('spots.map.tapHint')}</p>
    </div>
  );
}
