import { useMemo, useState, useRef, useEffect } from 'react';

// Hardcoded list — Intl.supportedValuesOf fails on iOS Safari
const COUNTRY_LIST = [
  'España','México','Colombia','Argentina','Perú','Chile','Venezuela','Ecuador',
  'Bolivia','Paraguay','Uruguay','Costa Rica','Guatemala','Honduras','El Salvador',
  'Nicaragua','Panamá','Cuba','República Dominicana','Puerto Rico',
  'Estados Unidos','Canadá','Brasil','Reino Unido','Francia','Alemania','Italia',
  'Portugal','Países Bajos','Bélgica','Suiza','Austria','Suecia','Noruega',
  'Dinamarca','Finlandia','Polonia','Chequia','Hungría','Rumanía','Grecia',
  'Turquía','Rusia','Ucrania','Israel','Emiratos Árabes Unidos','Arabia Saudí',
  'Japón','China','Corea del Sur','India','Tailandia','Vietnam','Indonesia',
  'Malasia','Singapur','Filipinas','Australia','Nueva Zelanda','Sudáfrica',
  'Kenia','Egipto','Marruecos','Nigeria','Ghana','Etiopía','Tanzania',
  'Mozambique','Angola','Camerún','Costa de Marfil','Senegal','Madagascar',
  'Zambia','Zimbabue','Botswana','Namibia','Túnez','Argelia','Libia','Sudán',
  'Etiopía','Somalia','Mozambique','Zimbabue','Irlanda','Escocia','Eslovaquia',
  'Eslovenia','Croacia','Serbia','Bulgaria','Albania','Kosovo','Montenegro',
  'Macedonia del Norte','Bosnia y Herzegovina','Moldavia','Bielorrusia','Georgia',
  'Armenia','Azerbaiyán','Kazajistán','Uzbekistán','Turkmenistán','Kirguistán',
  'Tayikistán','Afganistán','Pakistán','Bangladés','Nepal','Sri Lanka','Myanmar',
  'Camboya','Laos','Mongolia','Bután','Maldivas','Qatar','Kuwait','Bahréin',
  'Omán','Jordania','Líbano','Siria','Irak','Irán','Yemen',
  'Jamaica','Trinidad y Tobago','Barbados','Bahamas','Haití','Guatemala',
  'Belice','Guyana','Surinam','Panamá','Costa Rica','Nicaragua',
];

const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function CountryInput({ value, onChange, placeholder = 'País…' }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle); };
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return COUNTRY_LIST.slice(0, 8);
    return COUNTRY_LIST.filter(c => norm(c).startsWith(q) || norm(c).includes(q)).slice(0, 10);
  }, [query]);

  const select = label => { setQuery(label); onChange(label); setOpen(false); };

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
          background:'white',border:'1px solid #e8e3dc',borderRadius:12,
          marginTop:4,maxHeight:200,overflowY:'auto',
          boxShadow:'0 4px 16px rgba(0,0,0,0.1)',listStyle:'none',padding:4,
        }}>
          {filtered.map(c => (
            <li key={c}
              onMouseDown={() => select(c)}
              onTouchEnd={e => { e.preventDefault(); select(c); }}
              style={{padding:'8px 12px',fontSize:14,cursor:'pointer',borderRadius:8,color:'#1a1714'}}
              onMouseEnter={e => e.currentTarget.style.background='#fff3ee'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
