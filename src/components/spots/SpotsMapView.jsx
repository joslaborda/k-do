import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { renderToStaticMarkup } from 'react-dom/server';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { loadLeaflet, TYPE_CONFIG } from './spotsHelpers';
import { KODO_TILE_URL, KODO_TILE_SUBDOMAINS, KODO_TILE_ATTRIBUTION, injectKodoMapStyles } from './mapTiles';
import { sameCityName } from '@/lib/tripDays';

// A partir de este zoom, un cluster de ciudad "explota" en un pin por cada
// spot individual (en su propia coordenada) en vez de seguir mostrando un
// solo número agregado — antes el número nunca se abría por mucho que
// hicieras zoom, y tocarlo solo te mandaba de vuelta a la lista, que no es
// lo que se espera de un mapa.
const SPLIT_ZOOM = 15;

// Antes cada día usaba uno de los 5 --chart-1..5, todos tonos naranja/marrón
// muy parecidos entre sí ("los colores... no son suficientemente
// diferentes" fue el feedback exacto). Esta paleta está sacada de las
// líneas del metro de Londres precisamente porque están diseñadas para
// distinguirse a simple vista incluso en espacios pequeños (un aro de pocos
// px, un pin, un chip) — el mismo problema que resuelve el mapa del tube.
// Si un viaje tiene más de 12 días con spots asignados, se cicla desde el
// principio otra vez.
const TUBE_COLORS = [
  '#E32017', // Central — rojo
  '#0098D4', // Victoria — azul claro
  '#00782A', // District — verde
  '#B36305', // Bakerloo — marrón
  '#9B0056', // Metropolitan — magenta
  '#003688', // Piccadilly — azul oscuro
  '#F3A9BB', // Hammersmith & City — rosa
  '#6950A1', // Elizabeth — morado
  '#95CDBA', // Waterloo & City — turquesa
  '#FFD300', // Circle — amarillo
  '#A0A5A9', // Jubilee — gris
  '#000000', // Northern — negro
];

// Mapa de "todo el viaje" para la tab Mis spots: agrupa por ciudad (no hay
// campo de coordenadas en City, así que el centro de cada cluster se calcula
// como el centroide de los spots de esa ciudad que sí tienen lat/lng — no
// depende de ningún dato nuevo). Tocar el mapa fuera de un cluster dispara
// onCreatePin(lat,lng) para soltar un pin nuevo ahí mismo.
//
// El selector de día (chips arriba del mapa) cambia el mapa entero a una
// vista de un solo día — pines numerados y conectados con línea, en el
// mismo orden del itinerario — igual criterio que TodayRouteMap en Home,
// pero disponible para cualquier día del viaje, no solo hoy. "Todos" vuelve
// a la vista agrupada por ciudad de siempre.
export default function SpotsMapView({ spots = [], cities = [], onCreatePin, onSelectSpot, height = 260 }) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? undefined : es;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onCreatePinRef = useRef(onCreatePin);
  const onSelectSpotRef = useRef(onSelectSpot);
  onCreatePinRef.current = onCreatePin;
  onSelectSpotRef.current = onSelectSpot;

  const [selectedDate, setSelectedDate] = useState(null);

  const withCoords = spots.filter(s => s?.lat && s?.lng);

  const distinctDates = [...new Set(withCoords.map(s => s.assigned_date).filter(Boolean))].sort();
  const hasUnscheduled = withCoords.some(s => !s.assigned_date);
  const dayColor = (date) => date ? TUBE_COLORS[distinctDates.indexOf(date) % TUBE_COLORS.length] : 'hsl(var(--muted-foreground) / .35)';

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

  // Spots del día seleccionado, en el mismo orden que ya usa el timeline de
  // Home/Ruta: day_order primero (posición explícita guardada al arrastrar),
  // si no hay, por hora asignada, si tampoco hay, se quedan al final — así
  // el numerito del pin coincide con el orden real del día.
  const dayRouteSpots = !selectedDate ? [] : withCoords
    .filter(s => s.assigned_date === selectedDate)
    .sort((a, b) => {
      if (a.day_order != null && b.day_order != null) return a.day_order - b.day_order;
      if (a.day_order != null) return -1;
      if (b.day_order != null) return 1;
      const at = a.assigned_time || '99:99', bt = b.assigned_time || '99:99';
      return at.localeCompare(bt);
    });

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
      // Mismo fix que TodayRouteMap: el contenedor puede no tener su tamaño
      // final asentado en el instante en que corre este efecto (cambio de
      // tab, layout todavía animando) y un fitBounds contra un tamaño stale
      // deja el mapa con pines fuera del viewport visible.
      map.invalidateSize();

      map.on('click', (e) => {
        if (onCreatePinRef.current) onCreatePinRef.current(e.latlng.lat, e.latlng.lng);
      });

      const numberedIcon = (num, color, size = 26) => L.divIcon({
        html: '<div style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.3)">' + num + '</div>',
        iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: '',
      });

      if (selectedDate) {
        // Vista de un día: ruta conectada y numerada, sin clusters — igual
        // que TodayRouteMap, pero para el día que se haya elegido.
        const color = dayColor(selectedDate);
        const points = dayRouteSpots.map(s => [s.lat, s.lng]);

        dayRouteSpots.forEach((spot, i) => {
          const marker = L.marker([spot.lat, spot.lng], { icon: numberedIcon(i + 1, color) }).addTo(map);
          marker.on('click', (e) => {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            if (onSelectSpotRef.current) onSelectSpotRef.current(spot);
          });
        });

        if (points.length > 1) {
          L.polyline(points, { color, weight: 2.5, dashArray: '5,6', opacity: 0.85 }).addTo(map);
          map.fitBounds(L.latLngBounds(points), { padding: [42, 42] });
        } else if (points.length === 1) {
          map.setView(points[0], 15);
        }

        requestAnimationFrame(() => {
          if (cancelled || !mapRef.current) return;
          mapRef.current.invalidateSize();
          if (points.length > 1) mapRef.current.fitBounds(L.latLngBounds(points), { padding: [42, 42] });
          else if (points.length === 1) mapRef.current.setView(points[0], 15);
        });

        mapRef.current = map;
        return;
      }

      // Icono de un spot suelto — aro de color por día + icono real de su
      // tipo. Se reutiliza tanto para clusters de un solo spot como para
      // cada pin cuando un cluster de varios "explota" al hacer zoom.
      const singleIcon = (spot, size = 30) => {
        const tc = TYPE_CONFIG[spot.type] || TYPE_CONFIG.custom;
        const Icon = tc.Icon;
        const inner = renderToStaticMarkup(<Icon size={14} color="#fff" strokeWidth={2.5} />);
        const ring = dayColor(spot.assigned_date || null);
        return L.divIcon({
          html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;padding:3px;background:' + ring + '">' +
            '<div style="width:100%;height:100%;background:hsl(16 75% 45% / .92);color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center">' + inner + '</div>' +
          '</div>',
          iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: '',
        });
      };

      // Icono del cluster agregado (2+ spots) — número + aro partido por día.
      const clusterIcon = (c) => {
        const size = Math.min(32 + c.count * 2, 56);
        const fontSize = size > 46 ? 15 : 13;
        const dayBuckets = [...distinctDates, null]
          .map(d => ({ d, count: c.spots.filter(s => (s.assigned_date || null) === d).length }))
          .filter(b => b.count > 0);
        let ringBg = 'transparent';
        if (dayBuckets.length === 1) {
          ringBg = dayColor(dayBuckets[0].d);
        } else if (dayBuckets.length > 1) {
          let acc = 0;
          const stops = dayBuckets.map(b => {
            const pct = (b.count / c.count) * 100;
            const seg = dayColor(b.d) + ' ' + acc + '% ' + (acc + pct) + '%';
            acc += pct;
            return seg;
          });
          ringBg = 'conic-gradient(' + stops.join(',') + ')';
        }
        const ringThickness = dayBuckets.length ? 3 : 0;
        return L.divIcon({
          html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;padding:' + ringThickness + 'px;background:' + ringBg + '">' +
            '<div style="width:100%;height:100%;background:hsl(16 75% 45% / .92);color:#fff;border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:' + fontSize + 'px;font-weight:800;box-shadow:0 3px 12px rgba(0,0,0,.3)">' + c.count + '</div>' +
          '</div>',
          iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: '',
        });
      };

      // Antes un cluster de varios spots se quedaba siendo SIEMPRE un solo
      // número, por mucho zoom que hicieras, y tocarlo mandaba a la lista en
      // vez de mostrar algo en el mapa. Luego, al arreglarlo con un
      // setView(centroide, SPLIT_ZOOM) fijo, si los spots del cluster
      // estaban repartidos más lejos entre sí de lo que ese zoom llega a
      // mostrar, los pines quedaban fuera del encuadre — "explotaba a nada".
      // Ahora, al tocar un cluster: (1) se marca como "expandido" (así se
      // dibuja como pines individuales pase lo que pase con el zoom
      // resultante) y (2) se hace fitBounds sobre las coordenadas REALES de
      // sus spots, no un zoom fijo — así siempre quedan dentro del encuadre.
      let markers = [];
      const expandedKeys = new Set();
      const drawMarkers = () => {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        const zoomExploded = map.getZoom() >= SPLIT_ZOOM;

        clusters.forEach(c => {
          if (c.count === 1) {
            const spot = c.spots[0];
            const marker = L.marker([spot.lat, spot.lng], { icon: singleIcon(spot) }).addTo(map);
            marker.on('click', (e) => {
              if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
              if (onSelectSpotRef.current) onSelectSpotRef.current(spot);
            });
            markers.push(marker);
            return;
          }

          if (zoomExploded || expandedKeys.has(c.key)) {
            c.spots.forEach(spot => {
              const marker = L.marker([spot.lat, spot.lng], { icon: singleIcon(spot) }).addTo(map);
              marker.on('click', (e) => {
                if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                if (onSelectSpotRef.current) onSelectSpotRef.current(spot);
              });
              markers.push(marker);
            });
            return;
          }

          const icon = clusterIcon(c);
          const marker = L.marker([c.lat, c.lng], { icon }).addTo(map);
          marker.bindTooltip(c.name, { permanent: true, direction: 'bottom', offset: [0, icon.options.iconSize[0] / 2 + 3], className: 'kodo-city-cluster-label' });
          marker.on('click', (e) => {
            // Evitar que el click del marker también dispare el click del
            // mapa (crearía un pin nuevo justo donde querías ver el cluster).
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            expandedKeys.add(c.key);
            const bounds = L.latLngBounds(c.spots.map(s => [s.lat, s.lng]));
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
            // fitBounds no siempre dispara 'zoomend' (si el zoom resultante
            // es el mismo que ya había, solo dispara 'moveend') — se
            // redibuja también aquí para no depender de eso.
            drawMarkers();
          });
          markers.push(marker);
        });
      };

      map.on('zoomend', drawMarkers);

      map.fitBounds(L.latLngBounds(clusters.map(c => [c.lat, c.lng])), { padding: [42, 42] });
      drawMarkers();
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
  }, [
    selectedDate,
    clusters.map(c => c.key + ':' + c.spots.map(s => s.id + '@' + (s.assigned_date || '')).join('|')).join(','),
    dayRouteSpots.map(s => s.id + '@' + (s.day_order ?? '') + '@' + (s.assigned_time || '')).join(','),
  ]);

  if (!clusters.length) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-card">
        <p className="text-sm text-muted-foreground">{t('spots.map.noCoords')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Selector de día — antes la única forma de ver "los pins de un día"
          era leer el aro de color de cada cluster, que con 5 tonos naranja
          casi iguales no distinguía nada. Elegir un chip cambia el mapa
          entero a la ruta conectada y numerada de ese día; "Todos" vuelve a
          la vista agrupada por ciudad. */}
      {distinctDates.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setSelectedDate(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !selectedDate ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            }`}>
            {t('spots.map.allDays')}
          </button>
          {distinctDates.map((d, i) => (
            <button key={d} onClick={() => setSelectedDate(d)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedDate === d ? 'text-white border-transparent' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
              style={selectedDate === d ? { background: TUBE_COLORS[i % TUBE_COLORS.length] } : {}}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TUBE_COLORS[i % TUBE_COLORS.length] }} />
              {format(parseISO(d), 'dd MMM', { locale: dateLocale })}
            </button>
          ))}
        </div>
      )}

      <div ref={containerRef} style={{ height, borderRadius: 16, overflow: 'hidden', cursor: 'crosshair' }} className="border border-border kodo-map-warm" />

      {selectedDate ? (
        <p className="text-xs text-muted-foreground mt-2 px-1">{t('spots.map.dayRouteHint')}</p>
      ) : (
        <>
          {hasUnscheduled && distinctDates.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 px-1 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-muted-foreground/35" />
              {t('spots.map.noDate')}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2 px-1">{t('spots.map.tapHint')}</p>
        </>
      )}
    </div>
  );
}
