import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Loader2, X, Minus } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import { getCountryMeta } from '@/lib/countryConfig';
import { getHardcodedEmergencyInfo } from '@/lib/emergencyDB';
import { getSmartPackingList } from '@/lib/packingDB';
import { useTripContext } from '@/hooks/useTripContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';


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
      className="relative flex"
      style={{ position: 'relative' }}
    >
      {/* Animated sliding line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: lineStyle.left,
          width: lineStyle.width,
          height: 3,
          background: '#c2410c',
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
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? '#1a1714' : '#a09890',
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
  { value:'personal',   label:'Personal',    icon:'👤' },
  { value:'neceser',    label:'Neceser',     icon:'🧴' },
  { value:'tecnologia', label:'Tecnología',  icon:'📱' },
  { value:'ropa',       label:'Ropa',        icon:'👕' },
  { value:'medicinas',  label:'Medicinas',   icon:'💊' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Add packing item sheet
// ─────────────────────────────────────────────────────────────────────────────
function AddPackingSheet({ open, onClose, defaultCategory = 'personal', onSave, saving }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) { setName(''); setCategory(defaultCategory); setQuantity(1); }
  }, [open, defaultCategory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[88vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 pt-4 px-5 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">Añadir artículo</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Name */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Nombre *</p>
            <Input
              placeholder="ej. Crema solar SPF 50"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="h-10 text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {PACKING_CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    category === c.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Cantidad</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-orange-50 transition-colors"
              >
                <Minus className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-xl font-medium text-foreground w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-orange-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground">
            Cancelar
          </button>
          <button
            onClick={() => { if (name.trim()) onSave({ name: name.trim(), category, quantity }); }}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Packing tab
// ─────────────────────────────────────────────────────────────────────────────
function PackingTab({ tripId, country }) {
  const queryClient = useQueryClient();
  const { items: suggestedItems } = getSmartPackingList(country);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCategory, setSheetCategory] = useState('personal');

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.PackingItem.create({ ...d, trip_id: tripId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }); setSheetOpen(false); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const totalItems = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const progress = totalItems > 0 ? Math.round(packedCount / totalItems * 100) : 0;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleGenerateSuggested = async () => {
    for (const item of suggestedItems) {
      await base44.entities.PackingItem.create({
        trip_id: tripId, name: item.name,
        category: item.category, packed: false,
        essential: item.essential || false,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
  };

  if (totalItems === 0) return (
    <>
      <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
        <p className="text-4xl mb-3">🧳</p>
        <p className="text-sm font-medium text-foreground mb-1">Maleta vacía</p>
        <p className="text-xs text-muted-foreground mb-5">Añade artículos manualmente o usa la lista sugerida para {country || 'tu destino'}</p>
        <div className="flex flex-col gap-2">
          {country && suggestedItems.length > 0 && (
            <button onClick={handleGenerateSuggested}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm rounded-xl font-medium">
              ✨ Generar lista para {country}
            </button>
          )}
          <button onClick={() => setSheetOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-sm rounded-xl text-muted-foreground">
            <Plus className="w-4 h-4" />Añadir manualmente
          </button>
        </div>
      </div>
      <AddPackingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultCategory={sheetCategory}
        onSave={d => createMutation.mutate(d)}
        saving={createMutation.isPending}
      />
    </>
  );

  return (
    <>
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Progreso total</p>
          <p className="text-base font-medium text-primary">{progress}%</p>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{packedCount} de {totalItems} artículos listos</p>
      </div>

      {/* Category cards */}
      {PACKING_CATEGORIES.map(cat => {
        const catItems = groupedItems[cat.value] || [];
        const catPacked = catItems.filter(i => i.packed).length;
        return (
          <div key={cat.value} className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{catPacked}/{catItems.length}</span>
            </div>

            <div className="p-3 space-y-1">
              {catItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">Sin artículos</p>
              )}
              {catItems.map(item => {
                const isRequired = item.essential === true;
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl group transition-colors ${
                    item.packed ? 'opacity-60' : 'hover:bg-secondary/50'
                  }`}>
                    {isRequired ? (
                      // Required — no checkbox, alert icon, can still be "checked" by tapping
                      <button
                        onClick={() => !item.packed && toggleMutation.mutate({ id: item.id, packed: true })}
                        className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                      >
                        {item.packed
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        }
                      </button>
                    ) : (
                      <Checkbox
                        checked={item.packed}
                        onCheckedChange={checked => toggleMutation.mutate({ id: item.id, packed: checked })}
                        className="h-4 w-4 flex-shrink-0"
                      />
                    )}
                    <p className={`flex-1 text-sm truncate ${item.packed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item.name}
                      {item.quantity > 1 && <span className="ml-1 text-xs text-muted-foreground">×{item.quantity}</span>}
                    </p>
                    {!isRequired && (
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Inline add button per category */}
              <button
                onClick={() => { setSheetCategory(cat.value); setSheetOpen(true); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl mt-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />Añadir artículo
              </button>
            </div>
          </div>
        );
      })}

      <AddPackingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultCategory={sheetCategory}
        onSave={d => createMutation.mutate(d)}
        saving={createMutation.isPending}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Emergency tab
// ─────────────────────────────────────────────────────────────────────────────
function EmergencyTab({ country, homeCountry, secondNationality, meta }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!country) { setData(null); setLoading(false); return; }
    setLoading(true);
    const d = getHardcodedEmergencyInfo(country, homeCountry, secondNationality || null);
    setData(d);
    setLoading(false);
  }, [country, homeCountry]);

  if (!country) return (
    <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
      <p className="text-4xl mb-3">🚨</p>
      <p className="text-sm font-medium text-foreground mb-1">Abre desde un viaje</p>
      <p className="text-xs text-muted-foreground">La información de emergencias aparece al abrir Utilidades desde un viaje activo</p>
    </div>
  );

  if (loading) return (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );

  if (!data) return (
    <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
      <p className="text-4xl mb-3">🚨</p>
      <p className="text-sm font-medium text-foreground mb-1">Sin datos para {country}</p>
      <p className="text-xs text-muted-foreground">Aún no tenemos información de emergencias para este país</p>
    </div>
  );

  const numbers = [
    data.police && { label:'Policía', number:data.police, emoji:'🚔' },
    data.ambulance && data.ambulance !== data.police && { label:'Ambulancia', number:data.ambulance, emoji:'🚑' },
    data.fire && data.fire !== data.police && data.fire !== data.ambulance && { label:'Bomberos', number:data.fire, emoji:'🚒' },
    data.emergency_general && !data.police && { label:'General', number:data.emergency_general, emoji:'🆘' },
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Emergency numbers */}
      {numbers.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Emergencias · {meta.flag} {country}
            </p>
          </div>
          {numbers.map((n, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{n.emoji}</span>
                <span className="text-sm font-medium text-foreground">{n.label}</span>
              </div>
              <span className="text-xl font-medium text-primary tracking-tight">{n.number}</span>
            </div>
          ))}
        </div>
      )}

      {/* Embassy */}
      {data.embassy && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">🏛️ Tu embajada</p>
          {data.embassy.address && <p className="text-sm text-foreground mb-2">📍 {data.embassy.address}</p>}
          {data.embassy.phone && (
            <p className="text-sm text-foreground mb-2">
              📞 <span className="font-medium">{data.embassy.phone}</span>
            </p>
          )}
          {data.embassy.hours && <p className="text-sm text-muted-foreground mb-2">🕐 {data.embassy.hours}</p>}
          {data.embassy.web && (
            <a href={data.embassy.web} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
              <ExternalLink className="w-3.5 h-3.5" />Web oficial
            </a>
          )}
        </div>
      )}

      {/* Second nationality embassy */}
      {data.secondEmbassy && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">🏛️ Tu segunda embajada</p>
          {data.secondEmbassy.address && <p className="text-sm text-foreground mb-2">📍 {data.secondEmbassy.address}</p>}
          {data.secondEmbassy.phone && <p className="text-sm text-foreground mb-2">📞 <span className="font-medium">{data.secondEmbassy.phone}</span></p>}
          {data.secondEmbassy.hours && <p className="text-sm text-muted-foreground mb-2">🕐 {data.secondEmbassy.hours}</p>}
          {data.secondEmbassy.web && (
            <a href={data.secondEmbassy.web} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
              <ExternalLink className="w-3.5 h-3.5" />Web oficial
            </a>
          )}
        </div>
      )}

      {/* Useful apps */}
      {data.useful_apps?.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">📱 Apps útiles</p>
          </div>
          {data.useful_apps.map((app, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <p className="text-sm font-medium text-foreground mb-0.5">{app.icon} {app.name}</p>
              <p className="text-xs text-muted-foreground">{app.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Safety tips */}
      {data.safety_tips?.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">🛡️ Consejos</p>
          </div>
          {data.safety_tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 border-b border-border last:border-0">
              <span className="text-primary font-medium text-sm flex-shrink-0 mt-0.5">✓</span>
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Utilities() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('clima');
  const [tripId, setTripId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    if (!id) { navigate('/TripsList', { replace: true }); return; }
    setTripId(id);
  }, [navigate]);

  const { trip, cities, activeCity } = useTripContext(tripId);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0] || null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  const homeCountry = myProfile?.home_country || 'España';
  const country = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(country);

  const TABS = [
    ['clima',        '☁️',  'Clima'],
    ['maleta',       '🧳',  'Maleta'],
    ['emergencias',  '🚨',  'Emergencias'],
  ];

  return (
    <div className="bg-background min-h-screen">

      {/* ── Header — exact Documents pattern ── */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <a
              href={createPageUrl('Home') + (tripId ? `?trip_id=${tripId}` : '')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Inicio
            </a>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Utilidades</h1>
          <OTabBar
            tabs={TABS.map(([k,_em,l]) => ({key:k,label:l}))}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24 space-y-4">

        {/* CLIMA */}
        {activeTab === 'clima' && (
          <>
            {cities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <p className="text-4xl mb-3">☁️</p>
                <p className="text-sm font-medium text-foreground mb-1">Sin ciudades</p>
                <p className="text-xs text-muted-foreground">Añade ciudades en la sección Ruta para ver el clima</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cities.map(city => (
                  <WeatherCard key={city.id} city={city} tripCountry={trip?.country} />
                ))}
              </div>
            )}
          </>
        )}

        {/* MALETA */}
        {activeTab === 'maleta' && (
          <PackingTab tripId={tripId} country={country} />
        )}

        {/* EMERGENCIAS */}
        {activeTab === 'emergencias' && (
          <EmergencyTab country={country} homeCountry={homeCountry} secondNationality={myProfile?.second_nationality} meta={meta} />
        )}
      </div>
    </div>
  );
}