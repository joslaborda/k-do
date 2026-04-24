import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import BalancesPanel from '@/components/expenses/BalancesPanel';
import { useUndo } from '@/components/hooks/useUndo';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta, computeAvailableCurrencies } from '@/lib/countryConfig';
import { createNotification } from '@/lib/notifications';

export default function Expenses() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { user: currentUser } = useAuth();

  const queryClient = useQueryClient();
  const { performDelete } = useUndo();

  // Obtener trip
  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const members = trip?.members || [];

  // Context: active city + available currencies
  const { cities, activeCity } = useTripContext(tripId);
  const baseCurrency = trip?.base_currency || trip?.currency || 'EUR';
  const activeMeta = getCountryMeta(activeCity?.country_code || activeCity?.country || '');
  const defaultCurrency = activeMeta?.currency || baseCurrency;
  const availableCurrencies = computeAvailableCurrencies(cities, baseCurrency);

  // Obtener datos de usuarios para crear mapa de nombres
  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 120000,
  });

  // Crear mapa: email -> nombre
  const userMap = usersData.reduce((map, user) => {
    map[user.email] = user.full_name || user.email;
    return map;
  }, {});

  // Obtener gastos
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  // Crear gasto
  const createMutation = useMutation({
    mutationFn: (formData) =>
      base44.entities.Expense.create({
        ...formData,
        trip_id: tripId,
        amount: parseFloat(formData.amount),
      }),
    onSuccess: async (_, formData) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setDialogOpen(false);
      setEditingExpense(null);

      // Notificar al resto de miembros del viaje
      const otherMembers = (trip?.members || []).filter(email => email !== currentUser?.email);
      if (otherMembers.length > 0) {
        try {
          const profiles = await base44.entities.UserProfile.filter({});
          otherMembers.forEach(email => {
            const profile = profiles.find(p => p.email === email || p.user_email === email);
            if (profile?.user_id) {
              createNotification({
                userId: profile.user_id,
                type: 'trip_update',
                refId: tripId,
                refTitle: trip?.name || 'el viaje',
                message: `Nuevo gasto: ${formData.description} (${parseFloat(formData.amount).toFixed(2)} ${formData.currency || 'EUR'})`,
              });
            }
          });
        } catch {
          // silencioso
        }
      }
    },
  });

  // Actualizar gasto
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) =>
      base44.entities.Expense.update(id, {
        ...formData,
        amount: parseFloat(formData.amount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setDialogOpen(false);
      setEditingExpense(null);
    },
  });

  // Eliminar gasto
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }),
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

  const handleSave = (formData) => {
    if (editingExpense) {
      updateMutation.mutate({
        id: editingExpense.id,
        formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-600 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-4xl font-bold">Gastos 💰</h1>
              <p className="text-white/90 mt-2">Registra y divide los gastos del viaje</p>
            </div>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setDialogOpen(true);
              }}
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6 pb-20 -mt-12">
        {/* Balances Panel */}
        {!isLoading && (
          <div className="mb-8">
            <BalancesPanel
              expenses={expenses}
              members={members}
              currentUserEmail={currentUser?.email}
              userMap={userMap}
            />
          </div>
        )}

        {/* Gastos */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Registro de gastos</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sin gastos todavía
              </h3>
              <p className="text-muted-foreground mb-6">
                Empieza a registrar los gastos del viaje
              </p>
              <Button
                onClick={() => {
                  setEditingExpense(null);
                  setDialogOpen(true);
                }}
                className="bg-orange-700 hover:bg-orange-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir primer gasto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  userMap={userMap}
                  onEdit={(e) => {
                    setEditingExpense(e);
                    setDialogOpen(true);
                  }}
                  onDelete={() => handleDelete(expense)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-border max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">
              {editingExpense ? 'Editar gasto' : 'Nuevo gasto'}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            members={members}
            initialData={editingExpense}
            defaultCurrency={defaultCurrency}
            baseCurrency={baseCurrency}
            availableCurrencies={availableCurrencies}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setEditingExpense(null);
            }}
            saving={createMutation.isPending || updateMutation.isPending}
            userMap={userMap}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}