import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Loader2, X, Minus, AlertTriangle, Landmark, MapPin, Phone, Mail, Clock } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import { getCountryMeta } from '@/lib/countryConfig';
import { getHardcodedEmergencyInfo } from '@/lib/emergencyDB';
import { getSmartPackingList } from '@/lib/packingDB';
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
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col max-h-[88vh]" onClick={e => e.stopPropagation()}>
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
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40'
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
        background: checked ? '#c2410c' : essential ? '#fff3ee' : 'white',
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
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c2410c' }} />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Packing tab
// ─────────────────────────────────────────────────────────────────────────────
function PackingTab({ tripId, country, tripInProgress }) {
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState({});
  const [adding, setAdding] = useState(null); // category key or 'souvenir'
  const [newName, setNewName] = useState('');
  const [newEssential, setNewEssential] = useState(false);
  const [activeInnerTab, setActiveInnerTab] = useState('maleta');
  const addInputRef = useRef(null);

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.PackingItem.create({ ...d, trip_id: tripId }),
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
                  background: activeInnerTab === t.key ? '#c2410c' : 'transparent',
                  marginBottom: 2,
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: activeInnerTab === t.key ? '#1a1714' : '#a09890',
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
              <p className="text-4xl mb-3">🧳</p>
              <p className="text-sm font-medium text-foreground mb-1">Maleta vacía</p>
              <p className="text-xs text-muted-foreground mb-5">
                Añade los artículos que vas a necesitar{country ? ` en ${country}` : ''}
              </p>
              <button onClick={() => openAdding(PACKING_CATEGORIES[0].value)}
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
                  <p className="text-sm font-medium text-primary">{progress}%</p>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-primary rounded-full transition-all duration-500"
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
                        <span className="text-base">{cat.icon}</span>
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
                        ) : (
                          <button onClick={() => openAdding(cat.value)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-border text-xs text-primary font-medium hover:bg-orange-50/50 transition-colors">
                            <Plus className="w-3.5 h-3.5" />Añadir artículo
                          </button>
                        )}
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
                <p className="text-3xl mb-2">🛍️</p>
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
    data.police && { label:'Policía', number:data.police, emoji:'🚔' },
    data.ambulance && data.ambulance !== data.police && { label:'Ambulancia', number:data.ambulance, emoji:'🚑' },
    data.fire && data.fire !== data.police && data.fire !== data.ambulance && { label:'Bomberos', number:data.fire, emoji:'🚒' },
    data.emergency_general && !data.police && { label:'General', number:data.emergency_general, emoji:'🆘' },
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
                <span className="text-lg">{n.emoji}</span>
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
        if (normalizeC(country) === normalizeC(homeCountry)) return null;
        const emb = typeof data.embassy === 'string'
          ? { phone: data.embassy.match(/[+\d][\d\s()-]{6,}/)?.[0] }
          : data.embassy;
        return (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tu embajada en {country}</p>
            </div>
            {emb.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{emb.address}</p>
              </div>
            )}
            {emb.phone && (
              <a href={'tel:' + (emb.phone || '').replace(/[^0-9+]/g, '')} className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-primary">{emb.phone}</span>
              </a>
            )}
            {emb.hours && (
              <div className="flex items-center gap-2.5">
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
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-lg">{app.icon}</div>
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
  const initialTab = searchParams.get('tab') || 'emergencias';
  const [activeTab, setActiveTab] = useState(initialTab);

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

  const country = tripCities[0]?.country || trip?.country || '';
  const meta = country ? getCountryMeta(country) : {};
  const homeCountry = myProfile?.nationality || myProfile?.country || 'España';
  const secondNationality = myProfile?.second_nationality || null;

  const tripInProgress = trip?.start_date && trip?.end_date
    ? new Date() >= new Date(trip.start_date) && new Date() <= new Date(trip.end_date)
    : false;

  const tabs = [
    { key: 'emergencias', label: 'Emergencias' },
    { key: 'maleta',      label: 'Maleta' },
    { key: 'tiempo',      label: 'Tiempo' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Utilidades</h1>
          <OTabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-5 pb-24 space-y-4">
        {activeTab === 'emergencias' && (
          <EmergencyContent
            country={country}
            homeCountry={homeCountry}
            secondNationality={secondNationality}
            meta={meta}
          />
        )}
        {activeTab === 'maleta' && (
          <PackingTab tripId={tripId} country={country} tripInProgress={tripInProgress} />
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
