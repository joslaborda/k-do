import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchCountries, getCountryLabel } from '@/lib/countryConfig';

// Antes esta lista vivía duplicada aquí, a mano, desincronizada del catálogo
// canónico de countryConfig.js (con entradas repetidas — "Guatemala",
// "Costa Rica", "Panamá", "Nicaragua", "Etiopía", "Mozambique" y "Zimbabue"
// aparecían dos veces — y sin traducción al idioma activo). Se usa
// searchCountries(), que ya resuelve por alias/inglés/ISO y no depende de
// Intl.supportedValuesOf (que sí falla en iOS Safari, motivo original de que
// esto se hardcodeara).

export default function CountryInput({ value, onChange, placeholder = 'País…' }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'es').split('-')[0];
  const [query, setQuery] = useState(() => value ? getCountryLabel(value, lang) : '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value ? getCountryLabel(value, lang) : ''); }, [value, lang]);

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle); };
  }, []);

  // searchCountries devuelve {value, label}: value es SIEMPRE el canónico en
  // español (lo que se guarda en la BD), label el nombre traducido (lo que se
  // ve). Con la lista vieja el input guardaba directamente el texto tecleado.
  const filtered = useMemo(() => searchCountries(query, lang, 10), [query, lang]);

  const select = opt => { setQuery(opt.label); onChange(opt.value); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        className="flex h-10 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
      />
      {open && filtered.length > 0 && (
        <ul style={{
          position:'absolute',top:'100%',left:0,right:0,zIndex:200,
          background:'hsl(var(--card))',border:'1px solid hsl(var(--border))',borderRadius:12,
          marginTop:4,maxHeight:200,overflowY:'auto',
          boxShadow:'0 4px 16px rgba(0,0,0,0.1)',listStyle:'none',padding:4,
        }}>
          {filtered.map(opt => (
            <li key={opt.value}
              onMouseDown={() => select(opt)}
              onTouchEnd={e => { e.preventDefault(); select(opt); }}
              style={{padding:'8px 12px',fontSize:14,cursor:'pointer',borderRadius:8,color:'var(--kodo-text-active)'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--kodo-bg-orange)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
