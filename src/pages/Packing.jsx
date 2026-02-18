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
    queryFn: () => base44.entities.PackingItem.list(),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200 dark:bg-stone-900/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">Maleta 🧳</h1>
              <p className="text-stone-600 dark:text-stone-400">Checklist de equipaje</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900"
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
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-stone-200 rounded-3xl">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
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
                  className="bg-white/70 backdrop-blur-xl border-2 border-stone-200/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all"
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
                              ? 'bg-green-50/50 dark:bg-green-900/20'
                              : 'bg-stone-50/50 dark:bg-stone-800/50 hover:bg-stone-100/50'
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
                                ? 'text-stone-500 line-through dark:text-stone-400' 
                                : 'text-stone-900 dark:text-white'
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
                            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity"
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
                      className="w-full border-dashed"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Artículo</label>
              <Input
                placeholder="ej. Camisetas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Categoría</label>
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
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                className="bg-stone-900 hover:bg-stone-800"
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