import { Navigation } from 'lucide-react';
import { extractPlaces, buildMapsUrl } from '@/lib/extractPlaces';

export default function DayMapButton({ day, city }) {
  const places = extractPlaces(day.content);
  if (places.length === 0) return null;

  const origin = city?.accommodation || city?.name || '';
  const url = buildMapsUrl(origin, places, city?.name);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1.5 rounded-lg transition-colors"
      title={`Ver ruta desde ${origin} en Google Maps`}
    >
      <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
      Ver ruta en mapa
    </a>
  );
}