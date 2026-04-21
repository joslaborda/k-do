/**
 * Selector pequeño "Ahora estoy en:" para sobreescribir la ciudad activa.
 * Solo guarda en localStorage via hook; no toca datos de la BD.
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const AUTO_VALUE = '__auto__';

export default function ActiveCitySelector({ cities = [], overrideCityId, setOverrideCityId, clearOverride, activeCity, onSelect }) {
  if (!cities.length) return null;

  // Soporte firma antigua (setOverrideCityId+clearOverride) y nueva (onSelect)
  const value = overrideCityId || AUTO_VALUE;

  const handleChange = (val) => {
    if (onSelect) {
      onSelect(val === AUTO_VALUE ? null : val);
    } else {
      if (val === AUTO_VALUE) clearOverride?.();
      else setOverrideCityId?.(val);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/90 border border-border rounded-xl px-3 py-2 shadow-sm">
      <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Ahora estoy en:</span>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="h-7 border-0 bg-transparent shadow-none text-sm font-semibold text-foreground p-0 focus:ring-0 min-w-[120px]">
          <SelectValue placeholder={activeCity?.name || 'Auto'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO_VALUE}>🗓️ Automático (por fecha)</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              📍 {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}