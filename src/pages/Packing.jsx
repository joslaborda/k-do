import { createPageUrl } from '@/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Info, ChevronDown, ChevronRight, Plug, Syringe, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { getSmartPackingList } from '@/lib/packingDB';
import { normalizeCountry } from '@/lib/countryConfig';

const CATEGORIES = [
  { value: 'personal',    label: 'Personal',    icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { value: 'ropa',        label: 'Ropa',        icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg> },
  { value: 'neceser',     label: 'Neceser',     icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg> },
  { value: 'tecnologia',  label: 'Tecnología',  icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> },
  { value: 'medicinas',   label: 'Medicinas',   icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { value: 'otros',       label: 'Otros',       icon: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
];

export default function Packing() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip } = useTripContext(tripId);
  const country = normalizeCountry(trip?.country || '');
  const { items: suggestedItems, requirements } = getSmartPackingList(country);

  const [showReqs, setShowReqs] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'personal', quantity: 1 });

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PackingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
      setDialogOpen(false);
      setFormData({ name: '', category: 'personal', quantity: 1 });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] }),
  });

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const total = items.length;
  const packed = items.filter(i => i.packed).length;
  const progress = total > 0 ? Math.round((packed / total) * 100) : 0;

  const handleSave = () => {
    if (!formData.name.trim()) return;
    createMutation.mutate({
      ...formData,
      trip_id: tripId,
      created_by: currentUser?.email,
      packed: false,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 max-w-3xl mx-auto">
        <a href={createPageUrl('Home') + '?trip_id=' + tripId}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Inicio
        </a>
        <h1 className="text-2xl font-semibold text-foreground">Maleta</h1>
        <p className="text-sm text-muted-foreground mt-1">{trip?.name || 'Tu viaje'}</p>
      </div>

      <div className="px-4 max-w-3xl mx-auto space-y-4">

        {/* Progress */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progreso</span>
            <span className="text-xl font-semibold text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{packed} de {total} artículos listos</p>
        </div>

        {/* Requisitos destino */}
        {requirements && country && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setShowReqs(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Requisitos para {country}</span>
              </div>
              {showReqs
                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showReqs && (
              <div className="border-t border-border divide-y divide-border">
                {/* Visado */}
                <div className={`flex items-start gap-3 px-4 py-3 ${requirements.visa?.needed ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20'}`}>
                  {requirements.visa?.needed
                    ? <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    : <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold">{requirements.visa?.needed ? 'Visado necesario' : 'Sin visado'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{requirements.visa?.info}</p>
                  </div>
                </div>
                {/* Adaptador */}
                {requirements.adapter?.needed && (
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Plug className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Adaptador {requirements.adapter.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{requirements.adapter.info}</p>
                    </div>
                  </div>
                )}
                {/* Vacunas */}
                {requirements.vaccines?.length > 0 && (
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Syringe className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Vacunas recomendadas</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{requirements.vaccines.map(v => v.name).join(' · ')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><rect x="6" y="7" width="12" height="14" rx="2"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Tu maleta está vacía</p>
            <p className="text-xs text-muted-foreground">Añade artículos manualmente</p>
          </div>
        )}

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const catItems = grouped[cat.value] || [];
          const catPacked = catItems.filter(i => i.packed).length;
          const catPct = catItems.length > 0 ? Math.round((catPacked / catItems.length) * 100) : 0;
          if (catItems.length === 0 && total > 0) return null;

          return (
            <div key={cat.value} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Cat header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/40 border-b border-border">
                <div className="flex items-center gap-2">
                  {cat.icon(catPct === 100 ? '#16a34a' : '#9a9490')}
                  <span className="text-xs font-semibold text-foreground">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{catPacked}/{catItems.length}</span>
                  {catPct === 100 && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-0.5 bg-secondary">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${catPct}%`, background: catPct === 100 ? '#16a34a' : '#c2410c' }} />
              </div>

              {/* Items */}
              {catItems.map((item, idx) => (
                <div key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-border group ${item.packed ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleMutation.mutate({ id: item.id, packed: !item.packed })}
                    className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors ${
                      item.packed ? 'bg-primary border-primary' : 'border-border bg-background hover:border-primary'
                    }`}
                  >
                    {item.packed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${item.packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.name}
                      {item.quantity > 1 && <span className="ml-1.5 text-xs text-muted-foreground font-normal">×{item.quantity}</span>}
                    </span>
                    {item.essential && !item.packed && (
                      <p className="text-xs text-primary font-medium mt-0.5">Obligatorio</p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              ))}

              {/* Add within category */}
              <button
                onClick={() => { setFormData(f => ({ ...f, category: cat.value })); setDialogOpen(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors border-t border-dashed border-border"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir a {cat.label}
              </button>
            </div>
          );
        })}

        {/* Global add button */}
        <button
          onClick={() => setDialogOpen(true)}
          className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir artículo
        </button>

      </div>

      {/* Add Modal — bottom sheet */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-card rounded-t-2xl border-t border-border px-5 pt-4 pb-8 z-10">
            {/* Handle */}
            <div className="w-8 h-1 bg-border rounded-full mx-auto mb-4" />
            <h2 className="text-base font-semibold text-foreground mb-5">Añadir artículo</h2>

            {/* Nombre */}
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
            <input
              type="text"
              placeholder="ej. Camisetas"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4"
            />

            {/* Cantidad */}
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cantidad</label>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setFormData(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                className="w-8 h-8 rounded-xl border border-border bg-secondary flex items-center justify-center text-foreground hover:bg-border transition-colors text-lg"
              >−</button>
              <span className="text-lg font-semibold text-foreground min-w-[28px] text-center">{formData.quantity}</span>
              <button
                onClick={() => setFormData(f => ({ ...f, quantity: f.quantity + 1 }))}
                className="w-8 h-8 rounded-xl border border-border bg-secondary flex items-center justify-center text-foreground hover:bg-border transition-colors text-lg"
              >+</button>
              <span className="text-xs text-muted-foreground">unidades</span>
            </div>

            {/* Categoría */}
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Categoría</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {CATEGORIES.map(cat => {
                const isOn = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFormData(f => ({ ...f, category: cat.value }))}
                    className={`border rounded-xl py-2 px-1 flex flex-col items-center gap-1.5 transition-all ${
                      isOn ? 'border-primary bg-orange-50 dark:bg-orange-950/30' : 'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isOn ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-secondary'}`}>
                      {cat.icon(isOn ? '#c2410c' : 'var(--muted-foreground, #9a9490)')}
                    </div>
                    <span className={`text-[10px] font-medium ${isOn ? 'text-primary' : 'text-foreground'}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground bg-secondary hover:bg-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || createMutation.isPending}
                className="flex-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
