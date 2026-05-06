import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, Trash2, Grip, Sparkles, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { getSmartPackingList, COUNTRY_REQUIREMENTS } from '@/lib/packingDB';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  { value: 'personal', label: 'Personal', icon: '👤', color: 'from-blue-500 to-cyan-500' },
  { value: 'neceser', label: 'Neceser', icon: '🧴', color: 'from-pink-500 to-rose-500' },
  { value: 'tecnologia', label: 'Tecnología', icon: '📱', color: 'from-purple-500 to-indigo-500' },
  { value: 'ropa', label: 'Ropa', icon: '👕', color: 'from-amber-500 to-orange-500' },
  { value: 'medicinas', label: 'Medicinas', icon: '💊', color: 'from-green-500 to-emerald-500' },
];

export default function Packing() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip } = useTripContext(tripId);
  const country = trip?.country || '';
  const { items: suggestedItems, requirements } = getSmartPackingList(country);
  const [showSmartPanel, setShowSmartPanel] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'personal',
    quantity: 1,
  });

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: () => base44.entities.PackingItem.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PackingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems'] });
      setDialogOpen(false);
      setFormData({ name: '', category: 'personal', quantity: 1 });
    },
  });

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, packed }) => base44.entities.PackingItem.update(id, { packed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packingItems'] }),
  });

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const packedItems = items.filter(i => i.packed).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-3">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            Mis viajes
          </button>
          <h1 className="text-white text-4xl font-bold">Maleta 🧳</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-white/90">Checklist de equipaje</p>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">🔒 Solo visible para ti</span>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-white text-orange-700 hover:bg-white/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>

          {/* Requisitos del destino */}
          {requirements && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white mt-4 border border-white/20">
              <button onClick={() => setShowSmartPanel(o => !o)}
                className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">Requisitos para {country}</span>
                </div>
                {showSmartPanel ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
              </button>
              {showSmartPanel && (
                <div className="mt-3 space-y-2">
                  {/* Visado */}
                  <div className={"flex items-start gap-2 p-2.5 rounded-xl " + (requirements.visa?.needed ? "bg-red-500/20" : "bg-green-500/20")}>
                    {requirements.visa?.needed
                      ? <AlertTriangle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5"/>
                      : <CheckCircle2 className="w-4 h-4 text-green-200 flex-shrink-0 mt-0.5"/>}
                    <div>
                      <p className="text-xs font-semibold">{requirements.visa?.needed ? '⚠️ Visado necesario' : '✅ Sin visado'}</p>
                      <p className="text-xs text-white/80 mt-0.5">{requirements.visa?.info}</p>
                    </div>
                  </div>
                  {/* Adaptador */}
                  {requirements.adapter?.needed && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-200 flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-xs font-semibold">🔌 Adaptador {requirements.adapter.type}</p>
                        <p className="text-xs text-white/80 mt-0.5">{requirements.adapter.info}</p>
                      </div>
                    </div>
                  )}
                  {/* Vacunas */}
                  {requirements.vaccines?.length > 0 && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-500/20">
                      <Info className="w-4 h-4 text-blue-200 flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-xs font-semibold">💉 Vacunas recomendadas</p>
                        <p className="text-xs text-white/80 mt-0.5">{requirements.vaccines.map(v => v.name).join(' · ')}</p>
                      </div>
                    </div>
                  )}
                  {/* Moneda */}
                  {requirements.currency?.info && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/10">
                      <Info className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5"/>
                      <p className="text-xs text-white/80">{requirements.currency.info}</p>
                    </div>
                  )}
                  {/* Tips */}
                  {requirements.tips?.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/10">
                      <span className="text-xs text-white/60 flex-shrink-0">→</span>
                      <p className="text-xs text-white/80">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">Progreso total</span>
              <span className="text-4xl font-bold">{progress}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm opacity-90 mt-3">
              {packedItems} de {totalItems} artículos listos ✨
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">
        {totalItems === 0 ? (
            <div className="text-center py-12 glass border-2 border-dashed border-border rounded-3xl">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-1">Tu maleta está vacía</p>
              <p className="text-muted-foreground text-sm mb-5">Añade items manualmente o usa la lista inteligente</p>
              {country && suggestedItems.length > 0 && (
                <button
                  onClick={async () => {
                    for (const item of suggestedItems) {
                      await base44.entities.PackingItem.create({
                        trip_id: tripId, name: item.name,
                        category: item.category, packed: false,
                      });
                    }
                    queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
                  }}
                  className="bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-800 transition-colors flex items-center gap-2 mx-auto">
                  <Sparkles className="w-4 h-4"/>
                  Generar lista para {country}
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const categoryItems = groupedItems[cat.value] || [];
                const packedCount = categoryItems.filter(i => i.packed).length;
                const categoryProgress = categoryItems.length > 0 
                  ? Math.round((packedCount / categoryItems.length) * 100) 
                  : 0;

                return (
                  <div 
                    key={cat.value} 
                    className="glass border-2 border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all"
                  >
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${cat.color} p-6 text-white`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{cat.icon}</span>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{cat.label}</h2>
                        <p className="text-sm opacity-90">
                          {packedCount}/{categoryItems.length} completo
                        </p>
                      </div>
                      <div className="text-3xl font-bold">{categoryProgress}%</div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-2">
                    {categoryItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        Sin artículos
                      </p>
                    ) : (
                      categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${
                            item.packed
                              ? 'bg-green-600/20'
                              : 'bg-secondary/50 hover:bg-secondary'
                          }`}
                        >
                          <Checkbox
                            checked={item.packed}
                            onCheckedChange={(checked) =>
                              togglePackedMutation.mutate({ id: item.id, packed: checked })
                            }
                            className="h-5 w-5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              item.packed 
                                ? 'text-muted-foreground line-through' 
                                : 'text-foreground'
                            }`}>
                              {item.name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-sm text-muted-foreground">×{item.quantity}</span>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-secondary transition-opacity"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add button in category */}
                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, category: cat.value });
                        setDialogOpen(true);
                      }}
                      className="w-full border-dashed border-border text-foreground hover:bg-secondary/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir a {cat.label}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}