import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, Trash2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  { value: 'ropa', label: 'Ropa', icon: '👕' },
  { value: 'tecnologia', label: 'Tecnología', icon: '📱' },
  { value: 'documentos', label: 'Documentos', icon: '📄' },
  { value: 'higiene', label: 'Higiene', icon: '🧴' },
  { value: 'medicinas', label: 'Medicinas', icon: '💊' },
  { value: 'otros', label: 'Otros', icon: '📦' },
];

export default function Packing() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'ropa',
    quantity: 1,
    notes: '',
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
      setFormData({ name: '', category: 'ropa', quantity: 1, notes: '' });
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

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Maleta 🧳</h1>
              <p className="text-stone-600">Lista de equipaje para el viaje</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-stone-900 hover:bg-stone-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 bg-stone-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">Progreso</span>
              <span className="text-2xl font-bold text-stone-900">{progress}%</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {packedItems} de {totalItems} artículos empacados
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-24">
        {totalItems === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">Aún no has añadido artículos a tu maleta</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => {
              const categoryItems = groupedItems[cat.value] || [];
              if (categoryItems.length === 0) return null;

              const packedCount = categoryItems.filter(i => i.packed).length;

              return (
                <div key={cat.value} className="bg-white border-2 border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">{cat.label}</h2>
                        <p className="text-sm text-stone-500">
                          {packedCount}/{categoryItems.length} empacados
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          item.packed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <Checkbox
                          checked={item.packed}
                          onCheckedChange={(checked) =>
                            togglePackedMutation.mutate({ id: item.id, packed: checked })
                          }
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${item.packed ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                            {item.name}
                            {item.quantity > 1 && (
                              <span className="ml-2 text-sm text-stone-500">×{item.quantity}</span>
                            )}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-stone-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Notas (opcional)</label>
              <Textarea
                placeholder="Notas adicionales..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
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