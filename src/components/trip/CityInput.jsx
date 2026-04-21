import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { getTopCities } from '@/lib/countryConfig';
import { Loader2 } from 'lucide-react';

export default function CityInput({ country, value, onChange, placeholder = 'Elige o escribe una ciudad...' }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const listId = `city-list-${country?.replace(/\s/g, '-') || 'default'}`;

  useEffect(() => {
    if (!country) return;
    setLoading(true);
    getTopCities(country)
      .then((c) => setCities(c))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [country]);

  return (
    <div className="relative">
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
      )}
      <datalist id={listId}>
        {cities.map((c) => <option key={c} value={c} />)}
      </datalist>
      <Input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={loading ? 'Cargando ciudades...' : placeholder}
        className="bg-input border-border text-foreground"
      />
    </div>
  );
}