import { useState, useEffect, useRef } from 'react';
import { loadLeaflet, reverseGeocode } from './spotsHelpers';

export default function LeafletMap({ lat, lng, onMove }) {
  const leafletRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current || leafletRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const icon = L.divIcon({
        html: '<div style="width:28px;height:28px;background:hsl(var(--primary));border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
        iconSize: [28, 28], iconAnchor: [14, 28], className: ''
      });
      const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
      marker.on('dragend', async e => {
        const { lat: la, lng: ln } = e.target.getLatLng();
        const addr = await reverseGeocode(la, ln);
        onMove(la, ln, addr);
      });
      map.on('click', async e => {
        const { lat: la, lng: ln } = e.latlng;
        marker.setLatLng([la, ln]);
        const addr = await reverseGeocode(la, ln);
        onMove(la, ln, addr);
      });
      leafletRef.current = map;
      markerRef.current = marker;
    });
    return () => { cancelled = true; if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  useEffect(() => {
    if (markerRef.current && leafletRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      leafletRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return <div ref={containerRef} style={{ height: 220, borderRadius: 12, overflow: 'hidden' }} />;
}
