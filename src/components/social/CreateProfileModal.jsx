import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, XCircle, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername, checkUsernameAvailability } from '@/lib/username';
import { getCountryMeta } from '@/lib/countryConfig';

// ── País list ─────────────────────────────────────────────────────────────────
const HISPANO_FIRST = ['España','México','Colombia','Argentina','Perú','Venezuela','Chile','Ecuador','Guatemala','Cuba','Bolivia','República Dominicana','Honduras','Paraguay','El Salvador','Nicaragua','Costa Rica','Panamá','Uruguay','Puerto Rico','Guinea Ecuatorial'];
const ALL_COUNTRIES_RAW = ['Afganistán','Albania','Alemania','Andorra','Angola','Antigua y Barbuda','Arabia Saudí','Argelia','Argentina','Armenia','Aruba','Australia','Austria','Azerbaiyán','Bahamas','Bahréin','Bangladés','Barbados','Bélgica','Belice','Benín','Bielorrusia','Bolivia','Bosnia y Herzegovina','Botswana','Brasil','Brunéi','Bulgaria','Burkina Faso','Burundi','Bután','Cabo Verde','Camboya','Camerún','Canadá','Chad','Chile','China','Chipre','Colombia','Comoras','Congo','Corea del Norte','Corea del Sur','Costa Rica','Costa de Marfil','Croacia','Cuba','Curazao','Dinamarca','Dominica','Ecuador','Egipto','El Salvador','Emiratos Árabes Unidos','Eritrea','Eslovaquia','Eslovenia','España','Estados Unidos','Estonia','Etiopía','Filipinas','Finlandia','Fiyi','Francia','Gabón','Gambia','Georgia','Ghana','Gibraltar','Granada','Grecia','Guatemala','Guinea','Guinea Ecuatorial','Guinea-Bisáu','Guyana','Guyana Francesa','Haití','Honduras','Hungría','India','Indonesia','Irak','Irán','Irlanda','Islandia','Israel','Italia','Jamaica','Japón','Jordania','Kazajistán','Kenia','Kirguistán','Kiribati','Kosovo','Kuwait','Laos','Lesoto','Letonia','Líbano','Liberia','Libia','Liechtenstein','Lituania','Luxemburgo','Madagascar','Malaui','Malasia','Maldivas','Malí','Malta','Marruecos','Martinica','Mauritania','Mauricio','México','Micronesia','Moldavia','Mónaco','Mongolia','Montenegro','Mozambique','Myanmar','Namibia','Nepal','Nicaragua','Níger','Nigeria','Noruega','Nueva Zelanda','Omán','Pakistán','Palaos','Panamá','Papúa Nueva Guinea','Paraguay','Países Bajos','Perú','Polonia','Portugal','Puerto Rico','Qatar','Reino Unido','República Centroafricana','República Checa','República del Congo','República Dominicana','Ruanda','Rumanía','Rusia','Saint-Martin','Samoa','San Cristóbal y Nieves','San Marino','San Vicente','Santa Lucía','Santo Tomé y Príncipe','Senegal','Serbia','Seychelles','Sierra Leona','Singapur','Sint Maarten','Somalia','Sri Lanka','Sudáfrica','Sudán','Sudán del Sur','Suecia','Suiza','Surinam','Tailandia','Taiwan','Tayikistán','Tanzania','Timor Oriental','Togo','Tonga','Trinidad y Tobago','Túnez','Turkmenistán','Turquía','Tuvalu','Ucrania','Uganda','Uruguay','Uzbekistán','Vanuatu','Venezuela','Vietnam','Yemen','Yibuti','Zambia','Zimbabue','Esuatini'];
const SORTED_COUNTRIES = [...HISPANO_FIRST, ...ALL_COUNTRIES_RAW.filter(n => !HISPANO_FIRST.includes(n)).sort((a, b) => a.localeCompare(b, 'es'))];
const COUNTRIES = SORTED_COUNTRIES.map(name => {
  const meta = getCountryMeta(name);
  return { name, flag: meta.flag || '🌍', currency: meta.currency || 'USD' };
});

// ── Slides de features (3-6) ──────────────────────────────────────────────────
const FEATURE_SLIDES = [
  { id: 'grupo' },
  { id: 'preparativos' },
  { id: 'gastos' },
  { id: 'hoy' },
];

// ── Selector de país ──────────────────────────────────────────────────────────
function CountryPicker({ value, onChange, placeholder = 'Selecciona un país' }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = search
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;
  const selected = COUNTRIES.find(c => c.name === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl border text-sm text-left transition-colors ${value ? 'border-primary bg-card' : 'border-border bg-secondary/40'}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 font-medium text-foreground">
            <span className="text-lg">{selected.flag}</span>
            <span>{selected.name}</span>
            {selected.currency && (
              <span className="text-xs text-primary font-semibold ml-1">{selected.currency} ✓</span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar país..."
              className="w-full px-3 py-2 text-sm bg-secondary rounded-xl outline-none border border-border focus:border-primary/50"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(country => (
              <button
                key={country.name}
                type="button"
                onClick={() => { onChange(country); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-secondary/60 ${value === country.name ? 'bg-orange-50 text-primary font-semibold' : 'text-foreground'}`}
              >
                <span className="text-base flex-shrink-0">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-xs text-muted-foreground">{country.currency}</span>
                {value === country.name && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Barra de progreso / dots ──────────────────────────────────────────────────
function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-4' : i < current ? 'bg-primary/40 w-1.5' : 'bg-border w-1.5'}`}
        />
      ))}
    </div>
  );
}

// ── Slide feature: Grupo ──────────────────────────────────────────────────────
function SlideGrupo() {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">3 / 6</p>
      <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Vuestro viaje,<br />un solo sitio</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Invita a tus compañeros al viaje. Todos tendréis acceso a la misma información: ruta, documentos, spots y gastos.
      </p>

      {/* Demo: documentos compartidos */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header miembros */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-1">
            {['C','M','A'].map((l, i) => (
              <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-violet-500' : 'bg-cyan-600'}`}
                style={{ marginLeft: i > 0 ? -6 : 0 }}>
                {l}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">3 viajeros</span>
          </div>
          <span className="text-xs bg-orange-50 text-primary border border-orange-200 px-2.5 py-1 rounded-full font-semibold">+ Invitar</span>
        </div>

        {/* Docs compartidos */}
        <div className="divide-y divide-border">
          {[
            { icon: '✈️', bg: 'bg-blue-50', name: 'MAD → NRT · Iberia', sub: '09:45 · 12 mar', vis: 'Grupo', visCls: 'bg-green-100 text-green-700' },
            { icon: '🏨', bg: 'bg-purple-50', name: 'Park Hyatt Tokyo', sub: 'Check-in 12 mar', vis: 'Solo yo', visCls: 'bg-secondary text-muted-foreground' },
            { icon: '🛡️', bg: 'bg-secondary', name: 'Seguro de viaje', sub: 'Válido 12–24 mar', vis: 'Compartido', visCls: 'bg-blue-100 text-blue-700' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${doc.bg}`}>{doc.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.sub}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${doc.visCls}`}>{doc.vis}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide feature: Preparativos ───────────────────────────────────────────────
function SlidePreparativos() {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">4 / 6</p>
      <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Todo listo antes<br />de despegar</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Kōdo te da información personalizada: visados, vacunas, adaptadores. Sube tus documentos y asígnalos a un día concreto para que aparezcan cuando los necesites.
      </p>

      {/* Countdown */}
      <div className="bg-card border border-border rounded-2xl p-4 text-center mb-3">
        <p className="text-5xl font-semibold text-primary leading-none">47</p>
        <p className="text-xs text-muted-foreground mt-1">días para el viaje</p>
        <p className="text-xs text-primary mt-1.5">Primera parada: Tokio · 12 mar</p>
      </div>

      {/* Grid maleta + docs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Maleta</p>
          <p className="text-2xl font-semibold text-foreground">34%</p>
          <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '34%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">6/18 items</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Documentos</p>
          <p className="text-2xl font-semibold text-foreground">3</p>
          <p className="text-xs text-muted-foreground mt-3">3 subidos</p>
        </div>
      </div>

      {/* Checklist exacto al código */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">Por hacer antes del viaje</p>
            <p className="text-xs text-muted-foreground">pasaporte de España</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Todo listo ✓</span>
        </div>
        {/* Visados: level ok → solo informativo, badge verde */}
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border">
          <div style={{ height: 2.5, width: 20, background: 'hsl(var(--primary))', borderRadius: 2 }} />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Visados</p>
          <Check className="w-3 h-3 text-green-500 ml-auto" />
        </div>
        <div className="flex items-start gap-3 px-4 py-2.5 border-b border-border">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">Sin visado — Japón</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pasaporte español · No requiere trámite</p>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 border border-green-200">ok</span>
        </div>
        {/* Equipamiento: level info → sin checkbox, badge recomendado */}
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border">
          <div style={{ height: 2.5, width: 20, background: 'hsl(var(--primary))', borderRadius: 2 }} />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Equipamiento</p>
        </div>
        <div className="flex items-start gap-3 px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">Adaptador tipo A</p>
            <p className="text-xs text-muted-foreground mt-0.5">Diferente al europeo</p>
          </div>
          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 border border-amber-100">recom.</span>
        </div>
      </div>
    </div>
  );
}

// ── Slide feature: Gastos ─────────────────────────────────────────────────────
function SlideGastos() {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">5 / 6</p>
      <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Las cuentas aquí<br />siempre encajan</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Apunta quién paga y con quién comparte cada gasto. Kōdo lleva los balances y al final todos saben exactamente lo que se deben.
      </p>

      {/* Balance */}
      <div className="bg-card border border-border rounded-2xl px-4 py-3 mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Tu balance</p>
          <p className="text-3xl font-semibold text-green-600">+€25.00</p>
        </div>
        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">Te deben</span>
      </div>

      {/* Gastos */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
        {[
          { icon: '🍽️', bg: 'bg-orange-50', name: 'Cena en Tsukiji', sub: 'Pagó Carlos · ÷ 4', amount: '€60.00' },
          { icon: '🎫', bg: 'bg-orange-50', name: 'TeamLab Planets', sub: 'Pagó José · ÷ 4', amount: '€80.00' },
        ].map((g, i, arr) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${g.bg}`}>{g.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.sub}</p>
            </div>
            <p className="text-sm font-semibold text-foreground flex-shrink-0">{g.amount}</p>
          </div>
        ))}
      </div>

      {/* Balances — quién debe a quién */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-2 bg-secondary/30 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Te deben a ti</p>
        </div>
        {[
          { initial: 'M', color: 'bg-violet-500', text: 'María debe a Carlos', amount: '€15.00' },
          { initial: 'A', color: 'bg-cyan-600', text: 'Ana debe a Carlos', amount: '€15.00' },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
            <div className={`w-7 h-7 rounded-full ${b.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{b.initial}</div>
            <p className="text-sm font-medium text-foreground flex-1">{b.text}</p>
            <p className="text-sm font-bold text-red-500 flex-shrink-0">{b.amount}</p>
          </div>
        ))}
        <div className="px-4 py-2 bg-secondary/30 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tú debes a</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">J</div>
          <p className="text-sm font-medium text-foreground flex-1">Carlos debe a José</p>
          <p className="text-sm font-bold text-red-500 flex-shrink-0">€5.00</p>
        </div>
      </div>
    </div>
  );
}

// ── Slide feature: Hoy + Spots ────────────────────────────────────────────────
function SlideHoy() {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">6 / 6</p>
      <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Tu día a día<br />en la tab Hoy</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Todo lo que subes y preparas genera tu itinerario diario. La tab Hoy te muestra el clima, los documentos del día y tus spots. Busca restaurantes, museos o cualquier plan, asígnales día y hora para que aparezcan exactamente cuando los necesitas.
      </p>

      {/* DayCard HOY fiel al código */}
      <div className="bg-card border-2 border-orange-200 rounded-2xl overflow-hidden mb-3">
        <div className="flex items-center justify-between px-4 py-2.5 bg-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">HOY</span>
            <span className="text-sm font-semibold text-foreground">Tokio</span>
            <span className="text-xs text-muted-foreground">14 mar · 3</span>
          </div>
          <span className="text-sm">⛅ <span className="text-xs font-semibold text-foreground">18°</span></span>
        </div>
        {/* Timeline items */}
        {[
          { time: '09:45', icon: '✈️', iconBg: 'bg-blue-50', name: 'MAD → NRT · Iberia', sub: 'Vuelo · asignado hoy', hasLine: true },
          { time: '14:00', icon: '📍', iconBg: 'bg-orange-50', name: 'Tsukiji Fish Market', sub: 'Spot · asignado 14:00', hasLine: true },
          { time: null, icon: '🍽️', iconBg: 'bg-orange-50', name: 'Sukiyabashi Jiro', sub: 'Restaurante · sin hora · toca para añadir', hasLine: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-start gap-0 px-4 py-2 ${i < 2 ? 'border-b border-border' : ''}`}>
            <div className="w-10 flex-shrink-0 flex flex-col items-end pt-0.5 gap-1">
              {item.time
                ? <span className="text-[10px] font-semibold text-primary leading-none">{item.time}</span>
                : <div className="w-2 h-2 rounded-full bg-border mt-1" />}
              {item.hasLine && <div className="w-px h-5 bg-border mr-1.5" />}
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mx-2 text-sm ${item.iconBg}`}>{item.icon}</div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-foreground leading-snug truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Spots buscador */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border">
          <div className="flex-1 py-2 text-center border-b-2 border-primary -mb-px">
            <span className="text-xs font-bold text-primary">Buscar</span>
          </div>
          <div className="flex-1 py-2 text-center">
            <span className="text-xs text-muted-foreground">Mis spots</span>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="bg-secondary border border-border rounded-xl px-3 py-2 flex items-center gap-2 mb-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="text-xs text-muted-foreground">Restaurantes, museos, cafeterías...</span>
          </div>
          {[
            { icon: '🍜', bg: 'bg-orange-50', name: 'Ramen Ichiran Shibuya', sub: 'Restaurante · Tokio', badge: null },
            { icon: '🎨', bg: 'bg-blue-50', name: 'TeamLab Planets', sub: 'Actividad · asignado 15 mar', badge: 'Guardado' },
          ].map((spot, i, arr) => (
            <div key={i} className={`flex items-center gap-2 py-2 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${spot.bg}`}>{spot.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug truncate">{spot.name}</p>
                <p className="text-[10px] text-muted-foreground">{spot.sub}</p>
              </div>
              {spot.badge
                ? <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold border border-green-200 flex-shrink-0">{spot.badge}</span>
                : <div className="w-5 h-5 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CreateProfileModal({ user, open }) {
  // slide: 0=perfil, 1=pasaporte, 2..5=features
  const [slide, setSlide] = useState(0);
  const TOTAL_SLIDES = 6;

  // Step 1
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  // Step 2
  const [nationality, setNationality] = useState('España');
  const [homeCountry, setHomeCountry] = useState('España');
  const [homeCurrency, setHomeCurrency] = useState('EUR');
  const [secondNationality, setSecondNationality] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Username debounce check
  useEffect(() => {
    if (!username) { setAvailable(null); setUsernameError(''); return; }
    const err = validateUsername(username);
    if (err) { setUsernameError(err); setAvailable(null); return; }
    setUsernameError('');
    setChecking(true);
    const timer = setTimeout(async () => {
      const ok = await checkUsernameAvailability(username, user?.id);
      setAvailable(ok);
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, user?.id]);

  const handleNationalitySelect = useCallback((country) => {
    setNationality(country.name);
  }, []);

  const handleResidenceSelect = useCallback((country) => {
    setHomeCountry(country.name);
    setHomeCurrency(country.currency);
  }, []);

  const handleSecondNationalitySelect = useCallback((country) => {
    setSecondNationality(country.name);
  }, []);

  const canStep1 = displayName.trim().length >= 2 && !validateUsername(username) && available === true;
  const canStep2 = !!nationality && !!homeCountry;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const ok = await checkUsernameAvailability(username, user?.id);
      if (!ok) { setError('Username ya en uso'); setSaving(false); setAvailable(false); return; }
      await base44.entities.UserProfile.create({
        user_id: user.id,
        username,
        username_normalized: username,
        display_name: displayName.trim(),
        home_country: homeCountry,
        home_currency: homeCurrency,
        nationality,
        second_nationality: secondNationality || null,
      });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
      setSlide(2); // go to features
    } catch {
      setError('Error al crear el perfil. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  const featureSlides = [SlideGrupo, SlidePreparativos, SlideGastos, SlideHoy];
  const isFeatureSlide = slide >= 2;
  const isLastSlide = slide === TOTAL_SLIDES - 1;
  const FeatureComponent = isFeatureSlide ? featureSlides[slide - 2] : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <ProgressDots current={slide} total={TOTAL_SLIDES} />
        {isFeatureSlide && !isLastSlide && (
          <button
            onClick={() => setSlide(TOTAL_SLIDES - 1)}
            className="text-sm text-muted-foreground font-medium"
          >
            Saltar
          </button>
        )}
        {!isFeatureSlide && (
          <span className="text-xs text-muted-foreground font-medium">Obligatorio</span>
        )}
        {isLastSlide && <div className="w-10" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col">

        {/* SLIDE 0: Perfil */}
        {slide === 0 && (
          <div className="flex-1 flex flex-col">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">1 / 6</p>
            <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Cuéntanos un<br />poco sobre ti</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Ayúdanos a conocerte mejor para ofrecerte una experiencia personalizada.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nombre y apellidos</p>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder=""
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-foreground outline-none transition-colors ${displayName.trim() ? 'border-primary bg-card' : 'border-border bg-secondary/40'} focus:border-primary`}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">@usuario</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">@</span>
                  <input
                    value={username}
                    onChange={e => { setUsername(normalizeUsername(e.target.value)); setAvailable(null); }}
                    placeholder=""
                    maxLength={30}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={`w-full pl-8 pr-10 py-3 rounded-2xl border text-sm font-medium text-foreground outline-none transition-colors ${available === true ? 'border-primary bg-card' : available === false ? 'border-red-400 bg-red-50' : 'border-border bg-secondary/40'} focus:border-primary`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    {!checking && available === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {!checking && available === false && <XCircle className="w-4 h-4 text-red-500" />}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Letras, números y _ · mín. 3 caracteres</p>
                {usernameError && <p className="text-xs text-red-500 mt-0.5">{usernameError}</p>}
                {!checking && !usernameError && available === false && (
                  <p className="text-xs text-red-500 mt-0.5">Este @usuario ya está en uso, prueba con otro</p>
                )}
                {!checking && !usernameError && available === true && (
                  <p className="text-xs text-green-600 mt-0.5">¡Disponible!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: Pasaporte */}
        {slide === 1 && (
          <div className="flex-1 flex flex-col">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">2 / 6</p>
            <h2 className="text-2xl font-black text-foreground leading-tight mb-2">Cuéntanos un<br />poco sobre ti</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Esta información se usa para calcular visados, vacunas obligatorias e información consular si estás en el extranjero.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nacionalidad del pasaporte</p>
                <CountryPicker
                  value={nationality}
                  onChange={handleNationalitySelect}
                  placeholder="Selecciona tu nacionalidad"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">País de residencia</p>
                <CountryPicker
                  value={homeCountry}
                  onChange={handleResidenceSelect}
                  placeholder="¿Dónde vives?"
                />
                <p className="text-xs text-muted-foreground mt-1.5">La moneda se detecta automáticamente de tu país.</p>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Segundo pasaporte <span className="font-normal text-muted-foreground normal-case tracking-normal">— opcional</span>
                </p>
                <CountryPicker
                  value={secondNationality}
                  onChange={handleSecondNationalitySelect}
                  placeholder="No tengo"
                />
                {secondNationality && (
                  <button
                    onClick={() => setSecondNationality('')}
                    className="text-xs text-muted-foreground mt-1.5 underline"
                  >
                    Quitar segundo pasaporte
                  </button>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">Si tienes dos pasaportes, Kōdo los compara para facilitarte el trámite de visado.</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )}

        {/* SLIDES 2-5: Features */}
        {isFeatureSlide && FeatureComponent && (
          <FeatureComponent />
        )}
      </div>

      {/* Bottom CTA — fixed */}
      <div className="px-5 pb-8 pt-3 flex-shrink-0 border-t border-border bg-background">
        {slide === 0 && (
          <>
            <button
              onClick={() => setSlide(1)}
              disabled={!canStep1}
              className="w-full py-3.5 rounded-full bg-primary text-white text-sm font-bold disabled:bg-border disabled:text-muted-foreground transition-colors"
            >
              Siguiente
            </button>
            {!canStep1 && (
              <p className="text-xs text-muted-foreground text-center mt-2">Rellena todos los campos para continuar</p>
            )}
          </>
        )}

        {slide === 1 && (
          <button
            onClick={handleSave}
            disabled={!canStep2 || saving}
            className="w-full py-3.5 rounded-full bg-primary text-white text-sm font-bold disabled:bg-border disabled:text-muted-foreground transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Siguiente'}
          </button>
        )}

        {isFeatureSlide && !isLastSlide && (
          <button
            onClick={() => setSlide(s => s + 1)}
            className="w-full py-3.5 rounded-full bg-primary text-white text-sm font-bold transition-colors"
          >
            Siguiente
          </button>
        )}

        {isLastSlide && (
          <button
            onClick={() => {/* el queryClient ya invalidó → TripsList se refresca y needsOnboarding = false */}}
            className="w-full py-3.5 rounded-full bg-primary text-white text-sm font-bold transition-colors"
          >
            Empezar →
          </button>
        )}
      </div>
    </div>
  );
}
