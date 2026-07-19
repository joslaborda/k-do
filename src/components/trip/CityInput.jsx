import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { getTopCities } from '@/lib/countryConfig';
import { Loader2, ChevronDown } from 'lucide-react';

export default function CityInput({ country, value, onChange, placeholder = 'Elige o escribe una ciudad...', extraSuggestions = [] }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(value || '');
  const containerRef = useRef(null);

  // Sync filter when value changes externally
  useEffect(() => { setFilter(value || ''); }, [value]);

  // Load cities whenever country changes, clear previous list
  useEffect(() => {
    if (!country) { setCities([]); return; }
    setCities([]);
    setLoading(true);
    getTopCities(country)
      .then((c) => setCities(c))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [country]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // extraSuggestions: nombres de ciudad que el propio usuario ya escribió en
  // este viaje (p. ej. una parada repetida) — no dependen de country ni de la
  // lista "top cities", así que se combinan con esa lista en vez de sustituirla.
  // Así se sugieren tanto ciudades conocidas como paradas que el usuario ya usó,
  // incluyendo pueblos pequeños que no salen en ningún listado global.
  const allSuggestions = [...new Set([...(extraSuggestions || []), ...cities])];
  const filtered = filter
    ? allSuggestions.filter((c) => c.toLowerCase().includes(filter.toLowerCase()))
    : allSuggestions;

  const handleInput = (e) => {
    const v = e.target.value;
    setFilter(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (city) => {
    setFilter(city);
    onChange(city);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={filter}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={loading ? 'Cargando ciudades...' : placeholder}
          className="bg-input border-border text-foreground pr-8"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-card border border-border rounded-xl shadow-lg">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => handleSelect(city)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-primary transition-colors"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}