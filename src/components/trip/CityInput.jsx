/**
 * CityInput — Autocomplete de ciudades para un país dado.
 * Carga top cities desde countryConfig (IA + cache) y muestra un datalist.
 * Incluye opción "Other / Otra" para ciudades no listadas.
 */
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { getTopCities } from '@/lib/countryConfig';
import { Loader2 } from 'lucide-react';

const OTHER_LABEL = 'Other / Otra';

export default function CityInput({ country, value, onChange, placeholder = 'Elige o escribe una ciudad...' }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const listId = `city-list-${country?.replace(/\s/g, '-') || 'default'}`;

  useEffect(() => {
    if (!country) return;
    setLoading(true);
    getTopCities(country)
      .then((c) => setCities(c))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [country]);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === OTHER_LABEL) {
      setShowOther(true);
      onChange('');
    } else {
      setShowOther(false);
      onChange(raw);
    }
  };

  if (showOther) {
    return (
      <div className="space-y-2">
        <Input
          placeholder="Escribe el nombre de la ciudad..."
          value={otherValue}
          onChange={(e) => { setOtherValue(e.target.value); onChange(e.target.value); }}
          className="bg-input border-border text-foreground"
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setShowOther(false); onChange(''); setOtherValue(''); }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          ← Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
      )}
      <datalist id={listId}>
        {cities.map((c) => <option key={c} value={c} />)}
        <option value={OTHER_LABEL} />
      </datalist>
      <Input
        list={listId}
        value={value}
        onChange={handleChange}
        placeholder={loading ? 'Cargando ciudades...' : placeholder}
        className="bg-input border-border text-foreground"
      />
    </div>
  );
}