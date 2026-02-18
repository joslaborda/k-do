import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, AlertTriangle, CheckCircle2, Edit2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CATEGORY_LABELS = {
  food: 'Comida',
  transport: 'Transporte',
  accommodation: 'Alojamiento',
  activities: 'Actividades',
  shopping: 'Compras',
  other: 'Otro'
};

export default function BudgetTracker({ expenses }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => base44.entities.Budget.list(),
  });

  const budget = budgets[0];

  const createOrUpdateMutation = useMutation({
    mutationFn: async (amount) => {
      if (budget) {
        await base44.entities.Budget.update(budget.id, { total_budget_jpy: amount });
      } else {
        await base44.entities.Budget.create({ total_budget_jpy: amount });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setDialogOpen(false);
      setBudgetAmount('');
    },
  });

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => {
      const amount = exp.currency === 'EUR' ? exp.amount * 160 : exp.amount;
      return sum + amount;
    }, 0);
  }, [expenses]);

  const categorySpending = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      const category = exp.category || 'other';
      if (!acc[category]) acc[category] = 0;
      const amount = exp.currency === 'EUR' ? exp.amount * 160 : exp.amount;
      acc[category] += amount;
      return acc;
    }, {});
  }, [expenses]);

  if (!budget) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Presupuesto del viaje</h3>
            <p className="text-sm opacity-90">Establece tu presupuesto total</p>
          </div>
          <TrendingUp className="w-8 h-8 opacity-75" />
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full bg-white text-purple-600 hover:bg-white/90"
        >
          Establecer presupuesto
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Establecer presupuesto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Presupuesto total (JPY)</label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
              <Button
                onClick={() => createOrUpdateMutation.mutate(parseFloat(budgetAmount))}
                disabled={!budgetAmount || createOrUpdateMutation.isPending}
                className="w-full"
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const percentage = (totalSpent / budget.total_budget_jpy) * 100;
  const remaining = budget.total_budget_jpy - totalSpent;

  return (
    <div className={`rounded-2xl p-6 text-white ${
      percentage > 100 
        ? 'bg-gradient-to-br from-red-500 to-pink-600' 
        : percentage > 80 
        ? 'bg-gradient-to-br from-orange-500 to-yellow-600'
        : 'bg-gradient-to-br from-green-500 to-emerald-600'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Presupuesto del viaje</h3>
          <p className="text-sm opacity-90">
            {percentage > 100 ? '¡Excedido!' : percentage > 80 ? 'Cerca del límite' : 'En buen camino'}
          </p>
        </div>
        <button
          onClick={() => {
            setBudgetAmount(budget.total_budget_jpy.toString());
            setDialogOpen(true);
          }}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">¥{totalSpent.toLocaleString()}</span>
          <span className="text-sm opacity-90">de ¥{budget.total_budget_jpy.toLocaleString()}</span>
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-3 bg-white/20" />
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-90">{percentage.toFixed(1)}% usado</span>
          <span className={remaining >= 0 ? 'opacity-90' : 'font-bold'}>
            {remaining >= 0 ? `¥${remaining.toLocaleString()} restante` : `¥${Math.abs(remaining).toLocaleString()} sobre presupuesto`}
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2 pt-3 border-t border-white/20">
        <p className="text-xs uppercase tracking-wider opacity-75 mb-2">Por categoría</p>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const spent = categorySpending[key] || 0;
          const categoryPercent = (spent / budget.total_budget_jpy) * 100;
          return spent > 0 ? (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="opacity-90">{label}</span>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(categoryPercent, 100)} className="h-1.5 w-20 bg-white/20" />
                <span className="font-medium w-24 text-right">¥{spent.toLocaleString()}</span>
              </div>
            </div>
          ) : null;
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Presupuesto total (JPY)</label>
              <Input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={() => createOrUpdateMutation.mutate(parseFloat(budgetAmount))}
              disabled={!budgetAmount || createOrUpdateMutation.isPending}
              className="w-full"
            >
              Actualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}