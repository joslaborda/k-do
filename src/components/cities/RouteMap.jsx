import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

export default function RouteMap({ cities }) {
  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [cities]);

  const mapQuery = useMemo(() => {
    return sortedCities
      .map(c => c.accommodation ? `${c.accommodation}, ${c.name}` : c.name)
      .join('+');
  }, [sortedCities]);

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  const openInMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(mapQuery)}`;

  if (cities.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
      <div className="relative" style={{ height: '340px' }}>
        <iframe
          key={embedUrl}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa del viaje"
        />
      </div>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-orange-50/50">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {sortedCities.map((city, i) => (
            <span key={city.id} className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <span className="w-3.5 h-3.5 bg-orange-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {city.name}
              </span>
              {i < sortedCities.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </span>
          ))}
        </div>
        <a
          href={openInMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 font-medium flex-shrink-0 ml-3"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir en Maps
        </a>
      </div>
    </div>
  );
}