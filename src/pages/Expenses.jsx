import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, Utensils, Train, Hotel, Ticket, ShoppingBag, MoreHorizontal } from 'lucide-react';
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

const categories = [
  { value: 'food', label: 'Food', icon: Utensils },
  { value: 'transport', label: 'Transport', icon: Train },
  { value: 'accommodation', label: 'Accommodation', icon: Hotel },
  { value: 'activities', label: 'Activities', icon: Ticket },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function Expenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'JPY',
    paid_by: 'You',
    split_with: ['Carlos'],
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date'),
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
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
            <p className="text-slate-500 mt-1">Track and split costs with Carlos</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance Summary */}
          <div className="lg:col-span-1">
            <BalanceSummary expenses={expenses} />
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-white border border-slate-200 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="You" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  You paid
                </TabsTrigger>
                <TabsTrigger value="Carlos" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Carlos paid
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">No expenses yet</h3>
                <p className="text-slate-500 mb-4">Start tracking your trip expenses</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add first expense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <ExpenseCard 
                    key={expense.id} 
                    expense={expense}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <Input
                placeholder="e.g., Dinner at Ichiran"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Currency</label>
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
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Paid by</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.paid_by === 'You' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, paid_by: 'You' })}
                  className={formData.paid_by === 'You' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  You
                </Button>
                <Button
                  type="button"
                  variant={formData.paid_by === 'Carlos' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, paid_by: 'Carlos' })}
                  className={formData.paid_by === 'Carlos' ? 'bg-amber-500 hover:bg-amber-600' : ''}
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
              <label htmlFor="split" className="text-sm text-slate-700">
                Split equally with {formData.paid_by === 'You' ? 'Carlos' : 'You'}
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Category</label>
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
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                className="bg-slate-900 hover:bg-slate-800"
                disabled={!formData.description.trim() || !formData.amount || createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}