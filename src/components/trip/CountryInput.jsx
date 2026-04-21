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
          const raw = e.target.value;
          const canonical = canonicalizeCountry(raw, countries);
          onChange(canonical);
        }}
        placeholder="Escribe para buscar país…"
        className="bg-input border-border text-foreground"
      />
    </>
  );
}