import { useMemo, useState, useRef, useEffect } from 'react';
import { getAllCountries, canonicalizeCountry } from '@/lib/countryCatalog';

export default function CountryInput({ value, onChange, locale = 'es-ES', placeholder = 'Escribe para buscar país…' }) {
  const countries = useMemo(() => getAllCountries(locale), [locale]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Sync external value changes
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle); };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return countries.slice(0, 8);
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return countries.filter(c => {
      const l = c.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return l.startsWith(q) || l.includes(q);
    }).slice(0, 10);
  }, [query, countries]);

  const select = (label) => {
    setQuery(label);
    onChange(label);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            const canonical = canonicalizeCountry(query, countries);
            if (canonical !== query) { setQuery(canonical); onChange(canonical); }
            setOpen(false);
          }, 150);
        }}
        className="flex h-10 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
      />
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1px solid #e8e3dc', borderRadius: 12,
          marginTop: 4, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', listStyle: 'none', padding: 4,
        }}>
          {filtered.map(c => (
            <li
              key={c.code}
              onMouseDown={() => select(c.label)}
              onTouchEnd={() => select(c.label)}
              style={{
                padding: '8px 12px', fontSize: 14, cursor: 'pointer',
                borderRadius: 8, color: '#1a1714',
              }}
              onMouseEnter={e => e.target.style.background = '#fff3ee'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
