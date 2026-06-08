import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Loader2, X, Minus, AlertTriangle, Landmark, MapPin, Phone, Mail, Clock, User, Shirt, Droplets, Smartphone, Pill, MoreHorizontal } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import { getCountryMeta } from '@/lib/countryConfig';
import { getHardcodedEmergencyInfo } from '@/lib/emergencyDB';
import { getCountryRequirements } from '@/lib/packingDB';
import { ShieldCheck, ShieldX, ShieldAlert, Zap, Syringe, Coins, Info, ChevronDown, ChevronUp, Shield, Cross, Flame } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { Link, useSearchParams } from 'react-router-dom';


function OTabBar({ tabs, activeKey, onChange }) {
  const containerRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const updateLine = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.findIndex(t => t.key === activeKey);
    const buttons = containerRef.current.querySelectorAll('button');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const labelEl = btn.querySelector('.tab-label');
    const labelRect = labelEl ? labelEl.getBoundingClientRect() : btnRect;
    setLineStyle({
      left: labelRect.left - containerRect.left,
      width: labelRect.width,
    });
  }, [activeKey, tabs]);

  useEffect(() => {
    updateLine();
    if (!mounted) setTimeout(() => setMounted(true), 50);
  }, [updateLine, mounted]);

  return (
    <div
      ref={containerRef}
      className="relative flex overflow-x-auto"
      style={{ position: 'relative' }}>
      {/* Animated sliding line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: lineStyle.left,
          width: lineStyle.width,
          height: 3,
          background: 'hsl(var(--primary))',
          borderRadius: 2,
          transition: mounted ? 'left 0.25s cubic-bezier(.4,0,.2,1), width 0.25s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      />
      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1 min-w-0"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? 'var(--kodo-text-active)' : 'var(--kodo-nav-inactive)',
                transition: 'color 0.2s',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PACKING_CATEGORIES = [
  { value:'personal',   label:'Personal',   Icon: User },
  { value:'ropa',       label:'Ropa',       Icon: Shirt },
  { value:'neceser',    label:'Néceres',    Icon: Droplets },
  { value:'tecnologia', label:'Tecnología', Icon: Smartphone },
  { value:'medicinas',  label:'Medicinas',  Icon: Pill },
  { value:'otros',      label:'Otros',      Icon: MoreHorizontal },
];

// ─────────────────────────────────────────────────────────────────────────────
// Add packing item sheet
// ─────────────────────────────────────────────────────────────────────────────
function AddPackingSheet({ open, onClose, defaultCategory = 'personal', onSave, saving }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [essential, setEssential] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setCategory(defaultCategory); setEssential(false); }
  }, [open, defaultCategory]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), category, essential, packed: false });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl p-5 pb-8 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto" />
        <p className="text-sm font-medium text-foreground">Nuevo artículo</p>
        <input autoFocus placeholder="Nombre del artículo..." value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Categoría</p>
          <div className="grid grid-cols-2 gap-2">
            {PACKING_CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${category === cat.value ? 'border-primary bg-orange-50' : 'border-border'}`}>
                <cat.Icon size={14} color={category === cat.value ? '#c2410c' : '#888'} />
                <span className={`text-xs font-medium ${category === cat.value ? 'text-primary' : 'text-muted-foreground'}`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setEssential(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${essential ? 'border-primary bg-orange-50' : 'border-border'}`}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${essential ? 'border-primary bg-primary' : 'border-border'}`}>
            {essential && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span className={`text-sm ${essential ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Marcar como esencial</span>
        </button>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border border-border text-sm text-muted-foreground">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim() || saving}
            className="flex-[2] py-3 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-40">
            {saving ? 'Añadiendo...' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Requirements tab — Visa, Enchufes, Vacunas, Moneda
// ─────────────────────────────────────────────────────────────────────────────
const PLUG_IMAGES = {
  'A': 'Tipo A — 2 clavijas planas paralelas (EEUU/México/Japón)',
  'B': 'Tipo B — 2 clavijas planas + redonda (EEUU)',
  'C': 'Tipo C — 2 clavijas redondas (Europa/Sudamérica)',
  'D': 'Tipo D — 3 clavijas redondas en triángulo (India)',
  'E': 'Tipo E — 2 clavijas redondas + agujero (Francia/Bélgica)',
  'F': 'Tipo F — 2 clavijas redondas con toma tierra (Alemania/Europa)',
  'G': 'Tipo G — 3 clavijas rectangulares (UK/Singapur/HK)',
  'H': 'Tipo H — 3 clavijas oblicuas (Israel)',
  'I': 'Tipo I — 2/3 clavijas planas en ángulo (Australia/Argentina)',
  'J': 'Tipo J — 3 clavijas redondas (Suiza)',
  'K': 'Tipo K — 2 redondas + tierra (Dinamarca)',
  'L': 'Tipo L — 3 clavijas redondas en línea (Italia)',
  'M': 'Tipo M — 3 clavijas redondas grandes (Sudáfrica)',
  'N': 'Tipo N — 2/3 clavijas redondas (Brasil)',
};

function PlugIcon({ type }) {
  const colors = { A:'bg-blue-50 text-blue-700', B:'bg-blue-50 text-blue-700', C:'bg-green-50 text-green-700', F:'bg-green-50 text-green-700', E:'bg-green-50 text-green-700', G:'bg-purple-50 text-purple-700', I:'bg-amber-50 text-amber-700', default:'bg-secondary text-muted-foreground' };
  const cls = colors[type] || colors.default;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cls} text-xs font-semibold`}>
      <Zap size={11} />
      {type}
    </div>
  );
}

function RequirementsTab({ reqs, country, homeCountry }) {
  const [showAllVaccines, setShowAllVaccines] = useState(false);

  if (!country) return (
    <div className="bg-card rounded-2xl border border-border text-center py-12 px-6">
      <Info className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Sin destino asignado al viaje</p>
    </div>
  );

  if (!reqs) return (
    <div className="bg-card rounded-2xl border border-border text-center py-12 px-6">
      <Info className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground mb-1">Sin datos para {country}</p>
      <p className="text-xs text-muted-foreground">Consulta el consulado o embajada de tu país</p>
    </div>
  );

  const visa = reqs.visa || {};
  const adapter = reqs.adapter || {};
  const vaccines = reqs.vaccines || [];
  const currency = reqs.currency || {};
  const tips = reqs.tips || [];

  // Determinar estado del visado usando nuevo campo type/label
  const visaNeeded = visa.needed;
  const visaType = visa.type;
  const visaLabel = visa.label || (visaNeeded === false ? 'Sin visado' : visaNeeded === true ? 'Visado requerido' : 'Verificar con consulado');

  let visaColor, visaIcon;
  if (visaNeeded === false) {
    visaColor = 'bg-green-50 border-green-200'; visaIcon = <ShieldCheck className="w-5 h-5 text-green-600" />;
  } else if (visaType === 'evisa' || visaType === 'voa' || visaType === 'eta' || visaType === 'esta' || visaType === 'nzeta') {
    visaColor = 'bg-amber-50 border-amber-200'; visaIcon = <ShieldAlert className="w-5 h-5 text-amber-500" />;
  } else {
    visaColor = 'bg-red-50 border-red-200'; visaIcon = <ShieldX className="w-5 h-5 text-red-500" />;
  }

  const requiredVax = vaccines.filter(v => v.priority === 'obligatoria' || v.priority?.includes('obligatori'));
  const recommendedVax = vaccines.filter(v => !requiredVax.includes(v));

  // Detectar si el adaptador español es compatible
  // Usar meta.plug como fuente si adapter.type no está disponible
  const plugTypeRaw = adapter.type || (meta?.plug ? meta.plug.split('/').map(p => `Tipo ${p}`).join(' · ') : '');
  const spanishPlugs = ['C', 'E', 'F'];
  const destPlugs = plugTypeRaw.match(/Tipo ([A-N])/g)?.map(t => t.replace('Tipo ', '')) || [];
  const needsAdapter = adapter.needed ?? (destPlugs.length > 0 && !destPlugs.every(p => spanishPlugs.includes(p)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Requisitos para viajar a <span className="font-medium text-foreground">{country}</span> con pasaporte de <span className="font-medium text-foreground">{homeCountry}</span></p>

      {/* Visado */}
      <div className={`bg-card rounded-2xl border p-4 ${visaColor}`}>
        <div className="flex items-center gap-3">
          {visaIcon}
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{visaLabel}</p>
            {visa.info && <p className="text-xs text-muted-foreground mt-0.5">{visa.info}</p>}
            {visaType && visaType !== 'esta' && visaType !== 'nzeta' && (
              <p className="text-xs font-medium text-amber-700 mt-1">
                {visaType === 'evisa' && '🌐 Tramitar online antes de viajar'}
                {visaType === 'voa' && '🛬 Se obtiene a la llegada en el aeropuerto'}
                {visaType === 'eta' && '🌐 Autorización electrónica — tramitar online'}
              </p>
            )}
            {visaType === 'esta' && <p className="text-xs font-medium text-amber-700 mt-1">🌐 Tramitar ESTA en esta.cbp.dhs.gov</p>}
            {visaType === 'nzeta' && <p className="text-xs font-medium text-amber-700 mt-1">🌐 Tramitar NZeTA en nzeta.immigration.govt.nz</p>}
          </div>
        </div>
      </div>

      {/* Enchufe */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enchufe y voltaje</p>
        </div>
        {needsAdapter ? (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {destPlugs.length > 0 ? destPlugs.map(p => <PlugIcon key={p} type={p} />) : <span className="text-sm text-foreground">{adapter.type || 'Varios tipos'}</span>}
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">Adaptador necesario</span>
            </div>
            <p className="text-xs text-muted-foreground">{adapter.info}</p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">Compatible</span>
            <p className="text-xs text-muted-foreground">{adapter.info || 'Sin adaptador necesario'}</p>
          </div>
        )}
      </div>

      {/* Vacunas */}
      {vaccines.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Syringe className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vacunas</p>
          </div>
          {requiredVax.length > 0 && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium text-red-600 mb-2">Obligatorias para entrada</p>
              {requiredVax.map((v, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{v.name}</span>
                </div>
              ))}
            </div>
          )}
          {recommendedVax.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-amber-600 mb-2">Recomendadas</p>
              {(showAllVaccines ? recommendedVax : recommendedVax.slice(0, 3)).map((v, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <div>
                    <span className="text-sm text-foreground">{v.name}</span>
                    {v.priority && v.priority !== 'recomendada' && <span className="text-xs text-muted-foreground ml-1">({v.priority})</span>}
                  </div>
                </div>
              ))}
              {recommendedVax.length > 3 && (
                <button onClick={() => setShowAllVaccines(v => !v)} className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                  {showAllVaccines ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver {recommendedVax.length - 3} más</>}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {vaccines.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <Syringe className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-foreground">Sin vacunas requeridas</p>
            <p className="text-xs text-muted-foreground">No hay requisitos de vacunación específicos para {country}</p>
          </div>
        </div>
      )}

      {/* Moneda */}
      {currency.info && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Moneda</p>
          </div>
          <p className="text-sm text-foreground">{currency.info}</p>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Info className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Consejos útiles</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                <p className="text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Packing tab
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Shared checkbox — cuadrado, borde naranja pendiente, relleno naranja + check al marcar
// ─────────────────────────────────────────────────────────────────────────────
function KodoCheck({ checked, onChange, essential = false }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        border: checked ? 'none' : `1.5px solid ${essential ? '#c2410c' : '#d4cfc8'}`,
        background: checked ? 'hsl(var(--primary))' : essential ? 'hsl(var(--accent))' : 'hsl(var(--card))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {!checked && essential && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(var(--primary))' }} />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Packing tab
// ─────────────────────────────────────────────────────────────────────────────
function PackingTab({ tripId, country, tripInProgress, userId, externalOpen, onExternalClose }) {
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState({});
  const [adding, setAdding] = useState(null);
  const [newName, setNewName] = useState('');
  const [newEssential, setNewEssential] = useState(false);
  const [activeInnerTab, setActiveInnerTab] = useState('maleta');
  const [sheetOpen, setSheetOpen] = useState(false);
  const effectiveSheetOpen = sheetOpen || externalOpen;
  const closeSheet = () => { setSheetOpen(false); onExternalClose?.(); };
  const [sheetCategory, setSheetCategory] = useState('personal');
  const addInputRef = useRef(null);

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.PackingItem.create({ ...d, trip_id: tripId, user_id: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const packingItems  = items.filter(i => i.category !== 'souvenir');
  const souvenirItems = items.filter(i => i.category === 'souvenir');

  const totalItems  = packingItems.length;
  const packedCount = packingItems.filter(i => i.packed).length;
  const progress    = totalItems > 0 ? Math.round(packedCount / totalItems * 100) : 0;

  const grouped = PACKING_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = packingItems.filter(i => i.category === cat.value);
    return acc;
  }, {});

  const openAdding = (key) => {
    setAdding(key);
    setNewName('');
    setNewEssential(false);
    setTimeout(() => addInputRef.current?.focus(), 80);
  };

  const commitAdd = async () => {
    if (!newName.trim()) { setAdding(null); return; }
    if (adding === 'souvenir') {
      await createMutation.mutateAsync({ name: newName.trim(), category: 'souvenir', packed: false, essential: false });
    } else {
      await createMutation.mutateAsync({ name: newName.trim(), category: adding, packed: false, essential: newEssential });
    }
    setNewName('');
    setNewEssential(false);
    setAdding(null);
  };

  const toggleCollapsed = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  // Inner tab bar (Maleta / Souvenirs) — Ō style
  const innerTabs = [
    { key: 'maleta', label: 'Maleta' },
    ...(tripInProgress ? [{ key: 'souvenirs', label: 'Souvenirs' }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Inner tabs */}
      {tripInProgress && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex">
            {innerTabs.map(t => (
              <button key={t.key} onClick={() => setActiveInnerTab(t.key)}
                className="flex-1 flex flex-col items-center py-3 gap-1.5">
                <div style={{
                  height: 3, borderRadius: 2, width: 18,
                  background: activeInnerTab === t.key ? 'hsl(var(--primary))' : 'transparent',
                  marginBottom: 2,
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: activeInnerTab === t.key ? 'var(--kodo-text-active)' : 'var(--kodo-nav-inactive)',
                }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MALETA ── */}
      {activeInnerTab === 'maleta' && (
        <>
          {totalItems === 0 ? (
            <div className="bg-card rounded-2xl border border-border text-center py-14 px-6">
                            <p className="text-sm font-medium text-foreground mb-1">Maleta vacía</p>
              <p className="text-xs text-muted-foreground mb-5">
                Añade los artículos que vas a necesitar{country ? ` en ${country}` : ''}
              </p>
              <button onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm rounded-full font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />Añadir artículo
              </button>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Progreso total</p>
                  <p className={`text-sm font-medium ${progress === 100 ? 'text-green-700' : 'text-primary'}`}>{progress}%</p>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-600' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{packedCount} de {totalItems} artículos listos</p>
              </div>

              {/* Categories */}
              {PACKING_CATEGORIES.map(cat => {
                const catItems = grouped[cat.value] || [];
                const catPacked = catItems.filter(i => i.packed).length;
                const allDone = catItems.length > 0 && catPacked === catItems.length;
                const isCollapsed = collapsed[cat.value] ?? allDone;
                const essentialCount = catItems.filter(i => i.essential && !i.packed).length;
                const isAddingHere = adding === cat.value;

                return (
                  <div key={cat.value} className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Category header */}
                    <button onClick={() => toggleCollapsed(cat.value)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <cat.Icon size={15} color="#888" />
                        <span className="text-sm font-medium text-foreground">{cat.label}</span>
                        {essentialCount > 0 && (
                          <span className="text-xs font-medium text-primary bg-orange-50 px-1.5 py-0.5 rounded-full">
                            {essentialCount} esencial{essentialCount > 1 ? 'es' : ''}
                          </span>
                        )}
                        {allDone && catItems.length > 0 && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{catPacked}/{catItems.length}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
                          <polyline points="18 15 12 9 6 15"/>
                        </svg>
                      </div>
                    </button>

                    {!isCollapsed && (
                      <>
                        {catItems.length === 0 && !isAddingHere && (
                          <p className="text-xs text-muted-foreground text-center py-4 border-t border-border">Sin artículos</p>
                        )}
                        {catItems.map(item => (
                          <div key={item.id}
                            className={`flex items-center gap-3 px-4 py-2.5 border-t border-border group transition-colors ${item.packed ? 'opacity-55' : 'hover:bg-secondary/20'}`}>
                            <KodoCheck
                              checked={item.packed}
                              onChange={v => toggleMutation.mutate({ id: item.id, packed: v })}
                              essential={item.essential}
                            />
                            <p className={`flex-1 text-sm truncate ${item.packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </p>
                            {!item.essential && (
                              <button onClick={() => deleteMutation.mutate(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Inline add */}
                        {isAddingHere ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border">
                            <input
                              ref={addInputRef}
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAdding(null); }}
                              placeholder="Nombre del artículo..."
                              className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                            />
                            <button onClick={() => setNewEssential(v => !v)}
                              className={`text-xs px-2 py-1 rounded-lg border transition-colors ${newEssential ? 'bg-orange-50 border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                              esencial
                            </button>
                            <button onClick={commitAdd}
                              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {/* ── SOUVENIRS ── */}
      {activeInnerTab === 'souvenirs' && (
        <div className="space-y-3">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {souvenirItems.length === 0 && adding !== 'souvenir' && (
              <div className="text-center py-12 px-6">
                                <p className="text-sm font-medium text-foreground mb-1">Lista vacía</p>
                <p className="text-xs text-muted-foreground mb-5">Anota lo que quieres comprar en el viaje</p>
                <button onClick={() => openAdding('souvenir')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm rounded-full font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />Añadir
                </button>
              </div>
            )}

            {souvenirItems.map((item, i) => (
              <div key={item.id}
                className={`flex items-center gap-3 px-4 py-3 group transition-colors ${i > 0 ? 'border-t border-border' : ''} ${item.packed ? 'opacity-55' : 'hover:bg-secondary/20'}`}>
                <KodoCheck
                  checked={item.packed}
                  onChange={v => toggleMutation.mutate({ id: item.id, packed: v })}
                />
                <p className={`flex-1 text-sm truncate ${item.packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.name}
                </p>
                <button onClick={() => deleteMutation.mutate(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {adding === 'souvenir' ? (
              <div className={`flex items-center gap-2 px-4 py-2.5 ${souvenirItems.length > 0 ? 'border-t border-border' : ''}`}>
                <input
                  ref={addInputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAdding(null); }}
                  placeholder="¿Qué quieres comprar?"
                  className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                />
                <button onClick={commitAdd}
                  className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            ) : souvenirItems.length > 0 ? (
              <button onClick={() => openAdding('souvenir')}
                className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-border text-xs text-primary font-medium hover:bg-orange-50/50 transition-colors">
                <Plus className="w-3.5 h-3.5" />Añadir
              </button>
            ) : null}
          </div>
        </div>
      )}
      <AddPackingSheet
        open={effectiveSheetOpen}
        onClose={closeSheet}
        defaultCategory={sheetCategory}
        saving={createMutation.isPending}
        onSave={async (data) => {
          await createMutation.mutateAsync({ ...data, trip_id: tripId });
          closeSheet();
        }}
      />
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Emergency tab
// ─────────────────────────────────────────────────────────────────────────────
function EmergencyContent({ country, homeCountry, secondNationality, meta }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!country) { setData(null); setLoading(false); return; }
    setLoading(true);
    const d = getHardcodedEmergencyInfo(country, homeCountry, secondNationality || null);
    setData(d);
    setLoading(false);
  }, [country, homeCountry, secondNationality]);

  // No early return — show all tabs even without active trip

  // loading/data handled inline below

  const numbers = data ? [
    data.police && { label:'Policía', number:data.police, Icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
    data.ambulance && data.ambulance !== data.police && { label:'Ambulancia', number:data.ambulance, Icon: Cross, color: 'text-red-500', bg: 'bg-red-50' },
    data.fire && data.fire !== data.police && data.fire !== data.ambulance && { label:'Bomberos', number:data.fire, Icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    data.emergency_general && !data.police && { label:'General', number:data.emergency_general, Icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50' },
  ].filter(Boolean) : [];

  return (
    <div className="space-y-4">
      {/* No trip — show info message */}
      {loading && country && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      )}
      {!loading && country && !data && (
        <div className="bg-card rounded-2xl border border-border text-center py-10 px-6">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground mb-1">Sin datos para {country}</p>
          <p className="text-xs text-muted-foreground">Aún no tenemos información de emergencias para este país</p>
        </div>
      )}
      {/* Emergency numbers */}
      {!loading && data && numbers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Emergencias · {meta.flag} {country}
            </p>
          </div>
          {numbers.map((n, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                  <n.Icon className={`w-4 h-4 ${n.color}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{n.label}</span>
              </div>
              <span className="text-xl font-medium text-primary tracking-tight">{n.number}</span>
            </div>
          ))}
        </div>
      )}

      {/* Embassy — hide if user is in their own country */}
      {data && data.embassy && (() => {
        const normalizeC = (c) => (c || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isHomeCountry = normalizeC(country) === normalizeC(homeCountry);
        if (isHomeCountry) return null;
        const emb = typeof data.embassy === 'string'
          ? { name: data.embassy.split(':')[0], phone: data.embassy.match(/[+\d][\d\s()-]{6,}/)?.[0] }
          : data.embassy;
        return (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1"><Landmark className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Embajada de {homeCountry} en {country}</p></div>
            {emb.name && <p className="text-sm font-semibold text-foreground">{emb.name}</p>}
            {emb.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{emb.address}</p>
              </div>
            )}
            {emb.phone && (
              <a href={`tel:${emb.phone.replace(/\s/g,'')}`} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-primary">{emb.phone}</span>
              </a>
            )}
            {emb.emergency_phone && (
              <a href={`tel:${emb.emergency_phone.replace(/\s/g,'')}`} className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Emergencias 24h</p>
                  <p className="text-sm font-bold text-primary">{emb.emergency_phone}</p>
                </div>
              </a>
            )}
            {emb.email && (
              <a href={`mailto:${emb.email}`} className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary">{emb.email}</span>
              </a>
            )}
            {emb.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{emb.hours}</p>
              </div>
            )}
            {emb.web && (
              <a href={emb.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium">Sitio web oficial</span>
              </a>
            )}
          </div>
        );
      })()}
      {!loading && data && !data.embassy && (() => {
        const normalizeC = (c) => (c || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizeC(country) === normalizeC(homeCountry)) return null;
        const CONSULATE_LINKS = {
          'argentina': 'https://cancilleria.gob.ar/es/servicios/embajadas-y-consulados',
          'colombia': 'https://www.cancilleria.gov.co/tramites_servicios/consulados',
          'mexico': 'https://sre.gob.mx/representaciones',
          'chile': 'https://www.minrel.gob.cl/embajadas-y-consulados',
          'peru': 'https://www.rree.gob.pe/SitePages/Embajadas.aspx',
          'venezuela': 'https://mppre.gob.ve/embajadas-y-consulados/',
          'ecuador': 'https://www.cancilleria.gob.ec/embajadas-y-consulados/',
          'bolivia': 'https://www.cancilleria.gob.bo/',
          'uruguay': 'https://www.gub.uy/ministerio-relaciones-exteriores/',
          'paraguay': 'https://www.mre.gov.py/',
          'brasil': 'https://www.gov.br/mre/pt-br/assuntos/embaixadas-e-consulados',
          'brazil': 'https://www.gov.br/mre/pt-br/assuntos/embaixadas-e-consulados',
          'espana': 'https://www.exteriores.gob.es/es/EmbajadasConsulados',
          'spain': 'https://www.exteriores.gob.es/es/EmbajadasConsulados',
          'portugal': 'https://www.embaixadaportugal.mne.pt',
          'francia': 'https://www.diplomatie.gouv.fr/fr/le-ministere-et-son-reseau/ambassades-et-consulats/',
          'alemania': 'https://www.auswaertiges-amt.de/de/about-us/auslandsvertretungen',
          'italia': 'https://www.esteri.it/it/ambasciate-e-consolati/',
          'reino unido': 'https://www.gov.uk/world',
          'estados unidos': 'https://www.usembassy.gov',
          'china': 'http://www.fmprc.gov.cn/eng/',
        };
        const hn = (homeCountry || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const link = Object.entries(CONSULATE_LINKS).find(([k]) => hn.includes(k))?.[1] 
          || 'https://www.google.com/search?q=embajada+' + encodeURIComponent(homeCountry || '') + '+en+' + encodeURIComponent(country || '');
        return (
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Landmark className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground mb-1">Sin datos de embajada</p>
            <p className="text-xs text-muted-foreground mb-3">No tenemos todavía los datos de la embajada de {homeCountry} en {country}.</p>
            <a href={link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary font-medium">
              Buscar en web oficial de tu país →
            </a>
          </div>
        );
      })()}

      {/* Apps de interés */}
      {!loading && data?.useful_apps?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Apps útiles en {country}</p>
          </div>
          {data.useful_apps.map((app, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
              {(() => {
                const domains = {
                  'Uber': 'uber.com', 'Grab': 'grab.com', 'Bolt': 'bolt.eu',
                  'Gojek': 'gojek.com', 'Cabify': 'cabify.com', 'DiDi': 'didiglobal.com',
                  'Careem': 'careem.com', 'Rappi': 'rappi.com', 'iFood': 'ifood.com.br',
                  'Google Maps': 'maps.google.com', 'Google Translate': 'translate.google.com',
                  'WhatsApp': 'whatsapp.com', 'Citymapper': 'citymapper.com',
                  'Moovit': 'moovit.com', 'Naver Maps': 'naver.com', 'Naver': 'naver.com',
                  'DB Navigator': 'bahn.de', 'SNCF Connect': 'sncf-connect.com',
                  'Trenitalia': 'trenitalia.com', 'Yandex Go': 'yandex.com',
                  'WeChat': 'wechat.com', 'Alipay': 'alipay.com',
                  'MakeMyTrip': 'makemytrip.com', 'Traveloka': 'traveloka.com',
                  'SBB Mobile': 'sbb.ch', 'PassApp': 'passapp.net',
                  'Doctolib': 'doctolib.fr', 'VPN': 'protonvpn.com',
                  'AlertCops': 'alertcops.com', 'Ola': 'olacabs.com',
                  'InDriver': 'indriver.com', 'inDrive': 'indriver.com',
                  'T-money': 'tmoney.co.kr', 'Suica': 'jreast.co.jp', 'PASMO': 'pasmo.co.jp',
                  'Kakao': 'kakaocorp.com', 'LINE': 'line.me', 'LINE MAN': 'lineman.me',
                  'Snapp': 'snapp.ir', 'BiTaksi': 'bitaksi.com',
                  'Beat': 'free-now.com', 'FreeNow': 'free-now.com',
                  'Angkas': 'angkas.com', 'PickMe': 'pickme.lk',
                  'Little Cab': 'littlecab.co.ke', 'M-Pesa': 'safaricom.co.ke',
                  'MTR Mobile': 'mtr.com.hk', 'MyTransport': 'lta.gov.sg',
                  'RTA Dubai': 'rta.ae', 'Dubai Metro': 'rta.ae', 'Karwa': 'mowasalat.com',
                  'NHS App': 'nhs.uk', 'Mercado Libre': 'mercadolibre.com',
                  'NS ': 'ns.nl', 'CP ': 'cp.pt', 'ÖBB': 'oebb.at',
                  'WienMobil': 'wienerlinien.at', 'BVG': 'bvg.de', 'MVV': 'mvv-muenchen.de',
                  'Italo': 'italotreno.it', 'KOLEO': 'koleo.pl', 'Trafi': 'trafi.com',
                  'BKK Futár': 'bkk.hu', 'PID Lítačka': 'pid.cz', '9292': '9292.nl',
                  'MySOS': 'juntendo.ac.jp', 'Hyperdia': 'hyperdia.com',
                  'IRCTC': 'irctc.co.in', 'MyEG': 'myeg.com.my',
                  'GeoNet NZ': 'geonet.org.nz', 'MetService NZ': 'metservice.com',
                  'MeteoSwiss': 'meteoswiss.admin.ch', 'WeatherCAN': 'weather.gc.ca',
                  'Safetravel IS': 'safetravel.is', 'GovReady': 'govready.io',
                  'CDMX app': 'cdmx.gob.mx', 'Bip!': 'metro.cl',
                  'Trekking Nepal': 'tourism.gov.np', 'Machu Picchu Tickets': 'machupicchu.gob.pe',
                  '99': '99app.com', 'OASA Telematics': 'oasa.gr',
                  '112 app': '112.eu', 'Emergency+': '112australia.org.au',
                  'Hjelp112': '112.no', '112 Sverige': 'sos.se', '112 Suomi': '112.fi',
                  '112 Eesti': 'häirekeskus.ee', 'BE-Alert': 'be-alert.be',
                  'Burgernet': 'burgernet.nl', 'Air Raid Siren UA': 'dsns.gov.ua',
                  'Home Front Command': 'oref.org.il', 'Panic Button SA': 'panicbutton.co.za',
                  '1999 App': 'bangkok.go.th', 'Taiwan Beats': 'emic.gov.tw',
                };
                const key = Object.keys(domains).find(k => app.name?.includes(k));
                const domain = key ? domains[key] : null;
                return domain ? (
                  <img src={'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64'} alt={app.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-secondary" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null;
              })()}
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary" style={{display: 'none'}}>{app.name?.[0]?.toUpperCase() || '?'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{app.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consejos de seguridad */}
      {!loading && data?.safety_tips?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consejos de seguridad</p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {data.safety_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                <p className="text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities — wrapper principal con tabs
// ─────────────────────────────────────────────────────────────────────────────
export default function Utilities() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip_id');
  const initialTab = searchParams.get('tab') || 'tiempo';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [packingSheetOpen, setPackingSheetOpen] = useState(false);
  const [packingCategory, setPackingCategory] = useState('personal');

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => { const r = await base44.entities.Trip.filter({ id: tripId }); return r[0] || null; },
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: tripCities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0] || null; },
    enabled: !!user?.id, staleTime: 300000,
  });

  // Para viajes multipaís, usar la ciudad activa según la fecha de hoy
  const today = new Date().toISOString().slice(0, 10);
  const activeCity = tripCities.find(c => c.start_date <= today && (!c.end_date || c.end_date >= today))
    || tripCities[0];
  const country = activeCity?.country || trip?.country || '';
  const meta = country ? getCountryMeta(country) : {};
  const homeCountry = myProfile?.nationality || myProfile?.home_country || myProfile?.country || 'España';
  const secondNationality = myProfile?.second_nationality || null;

  const tripInProgress = trip?.start_date && trip?.end_date
    ? new Date() >= new Date(trip.start_date) && new Date() <= new Date(trip.end_date)
    : false;

  const tabs = [
    { key: 'tiempo',      label: 'Clima' },
    { key: 'emergencias', label: 'Emergencias' },
    { key: 'maleta',      label: 'Maleta' },
    { key: 'requisitos',  label: 'Requisitos' },
  ];
  
  // Requisitos del país activo
  const countryReqs = country ? getCountryRequirements(country, homeCountry) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 pt-12 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-foreground">Utilidades</h1>
            {activeTab === 'maleta' && (
              <button onClick={() => setPackingSheetOpen(true)}
                className="flex items-center gap-1.5 text-primary text-sm font-medium">
                <Plus className="w-4 h-4" /> Artículo
              </button>
            )}
          </div>
          <OTabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeTab === 'emergencias' && (
          <EmergencyContent
            country={country}
            homeCountry={homeCountry}
            secondNationality={secondNationality}
            meta={meta}
          />
        )}
        {activeTab === 'maleta' && (
          <PackingTab tripId={tripId} country={country} tripInProgress={tripInProgress} userId={user?.id} externalOpen={packingSheetOpen} onExternalClose={() => setPackingSheetOpen(false)} />
        )}
        {activeTab === 'requisitos' && (
          <RequirementsTab reqs={countryReqs} country={country} homeCountry={homeCountry} />
        )}
        {activeTab === 'tiempo' && (
          <div className="space-y-4">
            {tripCities.length > 0 ? (
              tripCities.map(city => (
                <WeatherCard key={city.id} city={city.name} tripCountry={city.country || country} showCityName />
              ))
            ) : country ? (
              <WeatherCard city={trip?.name || country} tripCountry={country} />
            ) : (
              <div className="bg-card rounded-2xl border border-border text-center py-10 px-6">
                <p className="text-sm text-muted-foreground">Sin destino asignado al viaje</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
