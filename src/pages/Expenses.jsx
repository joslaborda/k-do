import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, Utensils, Train, Hotel, Ticket, ShoppingBag, MoreHorizontal, Camera, X } from 'lucide-react';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import BalanceSummary from '@/components/expenses/BalanceSummary';
import ExpenseChart from '@/components/expenses/ExpenseChart';
import TricountBalance from '@/components/expenses/TricountBalance';

const categories = [
  { value: 'food', label: 'Comida', icon: Utensils },
  { value: 'transport', label: 'Transporte', icon: Train },
  { value: 'accommodation', label: 'Alojamiento', icon: Hotel },
  { value: 'activities', label: 'Actividades', icon: Ticket },
  { value: 'shopping', label: 'Compras', icon: ShoppingBag },
  { value: 'other', label: 'Otro', icon: MoreHorizontal },
];

export default function Expenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'JPY',
    paid_by: 'You',
    split_with: ['Carlos'],
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    receipt_photos: [],
  });

  const queryClient = useQueryClient();
  const { performDelete } = useUndo();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  const { isPulling, pullDistance } = usePullToRefresh(handleRefresh);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date'),
    staleTime: 10000, // Cache por 10 segundos
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({
      ...data,
      amount: parseFloat(data.amount) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDialogOpen(false);
      setFormData({
        description: '',
        amount: '',
        currency: 'JPY',
        paid_by: 'You',
        split_with: ['Carlos'],
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        receipt_photos: [],
      });
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        receipt_photos: [...(formData.receipt_photos || []), file_url]
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setFormData({
      ...formData,
      receipt_photos: formData.receipt_photos.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleDelete = async (expense) => {
    const expenseData = { ...expense };
    delete expenseData.id;
    delete expenseData.created_date;
    delete expenseData.updated_date;
    delete expenseData.created_by;
    
    await performDelete(
      () => deleteMutation.mutateAsync(expense.id),
      () => base44.entities.Expense.create(expenseData),
      expense.description
    );
  };

  const handleSplitChange = (checked) => {
    setFormData({
      ...formData,
      split_with: checked ? ['Carlos'] : [],
    });
  };

  const filteredExpenses = activeTab === 'all' 
    ? expenses 
    : expenses.filter(e => e.paid_by === activeTab);

  return (
    <div className="min-h-screen bg-orange-50">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} />
      
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-4xl font-bold">Gastos 💴</h1>
              <p className="text-white/90 mt-2">Registra y divide los gastos con Carlos</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-white text-orange-700 hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Gasto
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-24 max-w-4xl -mt-12">
        <div className="space-y-6">
          {/* Tricount Balance */}
          <TricountBalance expenses={expenses} />

          {/* Charts */}
          <ExpenseChart expenses={expenses} />

          {/* Balance Summary */}
          <BalanceSummary expenses={expenses} />

          {/* Expenses List */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="glass border border-border p-1">
                <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="You" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Pagaste tú
                </TabsTrigger>
                <TabsTrigger value="Carlos" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Pagó Carlos
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border border-dashed border-border">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin gastos todavía</h3>
                <p className="text-muted-foreground mb-4">Empieza a registrar los gastos del viaje</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir primer gasto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <ExpenseCard 
                    key={expense.id} 
                    expense={expense}
                    onDelete={() => handleDelete(expense)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent className="bg-card border-border">
           <DialogHeader>
             <DialogTitle className="text-foreground">Añadir Gasto</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-4">
             <div>
               <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
               <Input
                placeholder="ej. Cena en Ichiran"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Importe</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
                </div>
                <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda</label>
                <Select 
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">¥ JPY</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Pagado por</label>
               <div className="flex gap-2">
                 <Button
                   type="button"
                   variant={formData.paid_by === 'You' ? 'default' : 'outline'}
                   onClick={() => setFormData({ ...formData, paid_by: 'You' })}
                   className={formData.paid_by === 'You' ? 'bg-green-600 hover:bg-green-700' : 'border-border text-foreground hover:bg-secondary/50'}
                >
                  Tú
                </Button>
                <Button
                  type="button"
                  variant={formData.paid_by === 'Carlos' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, paid_by: 'Carlos' })}
                  className={formData.paid_by === 'Carlos' ? 'bg-blue-600 hover:bg-blue-700' : 'border-border text-foreground hover:bg-secondary/50'}
                >
                  Carlos
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="split"
                checked={formData.split_with.length > 0}
                onCheckedChange={handleSplitChange}
              />
              <label htmlFor="split" className="text-sm text-foreground">
                Dividir a medias con {formData.paid_by === 'You' ? 'Carlos' : 'ti'}
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
               <Input
                 type="date"
                 value={formData.date}
                 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                 className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fotos del recibo (opcional)</label>
              <div className="space-y-3">
                {formData.receipt_photos && formData.receipt_photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.receipt_photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={photo} 
                          alt="Recibo" 
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Añadir foto</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.description.trim() || !formData.amount || createMutation.isPending}
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