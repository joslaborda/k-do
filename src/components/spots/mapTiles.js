// Estilo de mapa compartido por los tres Leaflet de la app: el mini-mapa de
// Hoy (TodayRouteMap), el mapa de Spots (SpotsMapView) y el selector de pin
// al crear un spot (LeafletMap). Un solo sitio para cambiar de proveedor de
// tiles el día que se pase a Mapbox con estilo propio del Sistema Ō.
//
// CARTO Positron en vez del estilo "Standard" de OSM: gratis, sin API key,
// mismo volumen que ya cubre de sobra la beta — pero mucho más limpio (gris
// suave, sin el ruido de colores/POIs del estilo por defecto), así los pines
// naranjas del viaje son lo primero que se ve en vez de competir con el mapa.
// CARTO exige atribución visible — se muestra, no se omite en silencio.
export const KODO_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const KODO_TILE_SUBDOMAINS = 'abcd';
export const KODO_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

export function injectKodoMapStyles() {
  if (typeof document === 'undefined' || document.getElementById('kodo-map-shared-style')) return;
  const style = document.createElement('style');
  style.id = 'kodo-map-shared-style';
  style.textContent = `
    .kodo-map-warm .leaflet-tile-pane { filter: saturate(.85) sepia(.04) brightness(1.01); }
    .kodo-map-warm .leaflet-control-attribution {
      background: rgba(255,255,255,.8); font-size: 9px; line-height: 1.4; padding: 1px 5px;
      border-radius: 6px 0 0 0;
    }
    .kodo-map-warm .leaflet-control-zoom a { border-radius: 8px; color: #1a1714; }
    .kodo-map-warm .leaflet-control-zoom { border: none; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
  `;
  document.head.appendChild(style);
}
