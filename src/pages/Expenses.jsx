import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, ArrowLeftRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { getFxRate } from '@/lib/fxRates';
import { createNotification } from '@/lib/notifications';


// ── Conversor de moneda integrado en Gastos ──────────────────────────────────
const HISPANO_CURRENCIES = [
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'USD', name: 'Dólar americano', flag: '🇺🇸' },
  { code: 'MXN', name: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'COP', name: 'Peso colombiano', flag: '🇨🇴' },
  { code: 'ARS', name: 'Peso argentino', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso chileno', flag: '🇨🇱' },
  { code: 'PEN', name: 'Sol peruano', flag: '🇵🇪' },
  { code: 'DOP', name: 'Peso dominicano', flag: '🇩🇴' },
  { code: 'BOB', name: 'Boliviano', flag: '🇧🇴' },
  { code: 'UYU', name: 'Peso uruguayo', flag: '🇺🇾' },
  { code: 'VES', name: 'Bolívar venezolano', flag: '🇻🇪' },
  { code: 'GTQ', name: 'Quetzal guatemalteco', flag: '🇬🇹' },
  { code: 'PYG', name: 'Guaraní paraguayo', flag: '🇵🇾' },
  { code: 'JPY', name: 'Yen japonés', flag: '🇯🇵' },
  { code: 'GBP', name: 'Libra esterlina', flag: '🇬🇧' },
  { code: 'CNY', name: 'Yuan chino', flag: '🇨🇳' },
  { code: 'THB', name: 'Baht tailandés', flag: '🇹🇭' },
  { code: 'MAD', name: 'Dírham marroquí', flag: '🇲🇦' },
  { code: 'TRY', name: 'Lira turca', flag: '🇹🇷' },
];

function CurrencyConverter({ baseCurrency, tripCurrency }) {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState(baseCurrency || 'EUR');
  const [toCurrency, setToCurrency] = useState(tripCurrency || 'JPY');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getRate = async () => {
    if (!fromCurrency || !toCurrency) return;
    setLoading(true);
    try {
      const r = await getFxRate(fromCurrency, toCurrency);
      setRate(r);
      if (amount) setResult((parseFloat(amount) * r).toFixed(toCurrency === 'JPY' ? 0 : 2));
      setLastUpdated(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setRate(null);
  };

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setLoading(true);
    try {
      const r = rate || await getFxRate(fromCurrency, toCurrency);
      setRate(r);
      setResult((parseFloat(amount) * r).toFixed(toCurrency === 'JPY' ? 0 : 2));
      setLastUpdated(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
    } catch {}
    finally { setLoading(false); }
  };

  const fromInfo = HISPANO_CURRENCIES.find(c => c.code === fromCurrency);
  const toInfo = HISPANO_CURRENCIES.find(c => c.code === toCurrency);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">De</label>
            <select value={fromCurrency} onChange={e => { setFromCurrency(e.target.value); setResult(null); }}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-orange-400">
              {HISPANO_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSwap} className="mt-5 p-2.5 rounded-xl border border-border bg-secondary hover:bg-orange-50 hover:border-orange-300 transition-colors flex-shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground"/>
          </button>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">A</label>
            <select value={toCurrency} onChange={e => { setToCurrency(e.target.value); setResult(null); }}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-orange-400">
              {HISPANO_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && handleConvert()}
            placeholder="0.00"
            className="w-full border border-border rounded-xl px-4 py-3.5 text-xl font-semibold outline-none focus:border-orange-400 bg-secondary pr-20"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            {fromInfo?.flag} {fromCurrency}
          </span>
        </div>

        <button onClick={handleConvert} disabled={!amount || loading}
          className="w-full py-3 rounded-xl bg-orange-700 text-white font-semibold text-sm disabled:opacity-40 hover:bg-orange-800 transition-colors">
          {loading ? 'Calculando...' : 'Convertir'}
        </button>

        {result && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{amount} {fromCurrency} =</p>
            <p className="text-3xl font-bold text-orange-700">{Number(result).toLocaleString('es')} {toCurrency}</p>
            <p className="text-xs text-muted-foreground mt-2">
              1 {fromCurrency} = {rate?.toFixed(4)} {toCurrency}
              {lastUpdated && ` · actualizado ${lastUpdated}`}
            </p>
          </div>
        )}

        {!result && rate && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
          </p>
        )}
      </div>

      {/* Conversiones rápidas */}
      {rate && amount && result && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Conversiones rápidas</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 50, 100, 200, 500].map(val => (
              <button key={val} onClick={() => { setAmount(val.toString()); setResult((val * rate).toFixed(toCurrency === 'JPY' ? 0 : 2)); }}
                className="text-center py-2.5 px-3 rounded-xl bg-secondary border border-border hover:bg-orange-50 hover:border-orange-200 transition-colors">
                <p className="text-xs text-muted-foreground">{val} {fromCurrency}</p>
                <p className="text-sm font-semibold text-foreground">{Number((val * rate).toFixed(toCurrency === 'JPY' ? 0 : 2)).toLocaleString('es')}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Expenses() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
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