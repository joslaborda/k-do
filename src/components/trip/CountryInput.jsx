import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { getAllCountries, canonicalizeCountry } from '@/lib/countryCatalog';

export default function CountryInput({ value, onChange, locale = 'es-ES' }) {
  const countries = useMemo(() => getAllCountries(locale), [locale]);

  return (
    <>
      <datalist id="country-list">
        {countries.map((c) => (
          <option key={c.code} value={c.label} />
        ))}
      </datalist>

      <Input
        list="country-list"
        value={value}
        onChange={(e) => {
          // Pass raw value while typing; canonicalize only on exact match
          const raw = e.target.value;
          const exact = countries.find((c) => c.label.toLowerCase() === raw.toLowerCase());
          onChange(exact ? exact.label : raw);
        }}
        onBlur={(e) => {
          // On blur, try to canonicalize what was typed
          const raw = e.target.value.trim();
          if (raw) {
            const canonical = canonicalizeCountry(raw, countries);
            onChange(canonical);
          }
        }}
        placeholder="Escribe para buscar país…"
        className="bg-input border-border text-foreground"
      />
    </>
  );
}