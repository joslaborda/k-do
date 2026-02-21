import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, Trash2, Grip } from 'lucide-react';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'personal',
    quantity: 1,
  });

  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.PackingItem.filter({ created_by: user.email });
    },
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
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-stone-800/80 backdrop-blur-xl border-b border-stone-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-100 mb-2">Maleta 🧳</h1>
              <p className="text-stone-400">Checklist de equipaje</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">Progreso total</span>
              <span className="text-4xl font-bold">{progress}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur">
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
      <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
        {totalItems === 0 ? (
            <div className="text-center py-24 bg-stone-800 backdrop-blur-sm border-2 border-dashed border-stone-700 rounded-3xl">
              <Package className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400">Empieza añadiendo artículos a tu maleta</p>
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
                    className="bg-stone-800 backdrop-blur-xl border-2 border-stone-700 rounded-3xl overflow-hidden hover:shadow-xl transition-all"
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
                      <p className="text-center text-stone-400 py-8 text-sm">
                        Sin artículos
                      </p>
                    ) : (
                      categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${
                            item.packed
                              ? 'bg-green-900/20'
                              : 'bg-stone-700/50 hover:bg-stone-700'
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
                                ? 'text-stone-400 line-through' 
                                : 'text-stone-100'
                            }`}>
                              {item.name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-sm text-stone-400">×{item.quantity}</span>
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 hover:bg-stone-700 transition-opacity"
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
                      className="w-full border-dashed border-stone-700 text-stone-300 hover:bg-stone-700"
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
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Categoría</label>
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
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="bg-stone-700 border-stone-600 text-stone-100"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-600 text-stone-300 hover:bg-stone-700">
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