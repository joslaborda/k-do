import { createPageUrl } from '@/utils';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeftRight, ArrowRight, X, Receipt, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import BalancesPanel from '@/components/expenses/BalancesPanel';
import { useUndo } from '@/components/hooks/useUndo';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta, computeAvailableCurrencies } from '@/lib/countryConfig';
import { getFxRate } from '@/lib/fxRates';
import { createNotification } from '@/lib/notifications';

// ── Currency data ─────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'USD', name: 'Dólar americano', flag: '🇺🇸' },
  { code: 'GBP', name: 'Libra esterlina', flag: '🇬🇧' },
  { code: 'JPY', name: 'Yen japonés', flag: '🇯🇵' },
  { code: 'MXN', name: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'COP', name: 'Peso colombiano', flag: '🇨🇴' },
  { code: 'ARS', name: 'Peso argentino', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso chileno', flag: '🇨🇱' },
  { code: 'PEN', name: 'Sol peruano', flag: '🇵🇪' },
  { code: 'DOP', name: 'Peso dominicano', flag: '🇩🇴' },
  { code: 'BOB', name: 'Boliviano', flag: '🇧🇴' },
  { code: 'UYU', name: 'Peso uruguayo', flag: '🇺🇾' },
  { code: 'CNY', name: 'Yuan chino', flag: '🇨🇳' },
  { code: 'THB', name: 'Baht tailandés', flag: '🇹🇭' },
  { code: 'MAD', name: 'Dírham marroquí', flag: '🇲🇦' },
  { code: 'TRY', name: 'Lira turca', flag: '🇹🇷' },
  { code: 'KRW', name: 'Won coreano', flag: '🇰🇷' },
  { code: 'VND', name: 'Dong vietnamita', flag: '🇻🇳' },
  { code: 'IDR', name: 'Rupia indonesia', flag: '🇮🇩' },
  { code: 'SGD', name: 'Dólar de Singapur', flag: '🇸🇬' },
  { code: 'INR', name: 'Rupia india', flag: '🇮🇳' },
  { code: 'CHF', name: 'Franco suizo', flag: '🇨🇭' },
  { code: 'CAD', name: 'Dólar canadiense', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar australiano', flag: '🇦🇺' },
];

// ── Category config ───────────────────────────────────────────────────────────
const CAT_CONFIG = {
  food:          { label: 'Comida', emoji: '🍜' },
  transport:     { label: 'Transporte', emoji: '🚆' },
  accommodation: { label: 'Alojamiento', emoji: '🏨' },
  activities:    { label: 'Actividades', emoji: '⚡' },
  shopping:      { label: 'Compras', emoji: '🛍️' },
  other:         { label: 'Otro', emoji: '💰' },
};

// ── Currency Converter ─────────────────────────────────────────────────────────
function CurrencyConverter({ baseCurrency, tripCurrency }) {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState(baseCurrency || 'EUR');
  const [to, setTo] = useState(tripCurrency || 'JPY');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setLoading(true);
    try {
      const r = rate || await getFxRate(from, to);
      setRate(r);
      setResult((parseFloat(amount) * r).toFixed(to === 'JPY' || to === 'KRW' || to === 'VND' || to === 'IDR' ? 0 : 2));
      setUpdatedAt(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSwap = () => { setFrom(to); setTo(from); setResult(null); setRate(null); };

  const fromInfo = CURRENCIES.find(c => c.code === from);
  const toInfo = CURRENCIES.find(c => c.code === to);

  return (
    <div className="space-y-3">
      {/* Converter card */}
      <div className="bg-white rounded-2xl border border-border p-4">
        {/* Currency selectors */}
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">De</p>
            <select value={from} onChange={e => { setFrom(e.target.value); setResult(null); setRate(null); }}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-primary">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <button onClick={handleSwap}
            className="mb-0.5 p-2.5 rounded-xl border border-border bg-secondary hover:bg-orange-50 hover:border-primary/30 transition-colors flex-shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">A</p>
            <select value={to} onChange={e => { setTo(e.target.value); setResult(null); setRate(null); }}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-primary">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
        </div>

        {/* Amount input */}
        <div className="relative mb-3">
          <input
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && handleConvert()}
            placeholder="0.00"
            className="w-full border border-border rounded-xl px-4 py-3 text-2xl font-semibold outline-none focus:border-primary bg-secondary pr-20"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            {fromInfo?.flag} {from}
          </span>
        </div>

        <button onClick={handleConvert} disabled={!amount || loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors">
          {loading ? 'Calculando...' : 'Convertir'}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{amount} {from} =</p>
            <p className="text-3xl font-bold text-primary">{Number(result).toLocaleString('es')} {to}</p>
            {rate && (
              <p className="text-xs text-muted-foreground mt-2">
                1 {from} = {rate.toFixed(4)} {to}
                {updatedAt && ` · ${updatedAt}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick conversions */}
      {rate && amount && result && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Conversiones rápidas</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 50, 100, 200, 500].map(val => (
              <button key={val}
                onClick={() => { setAmount(val.toString()); setResult((val * rate).toFixed(to === 'JPY' || to === 'KRW' || to === 'VND' || to === 'IDR' ? 0 : 2)); }}
                className="text-center py-2.5 px-2 rounded-xl bg-secondary border border-border hover:bg-orange-50 hover:border-primary/20 transition-colors">
                <p className="text-xs text-muted-foreground">{val} {from}</p>
                <p className="text-sm font-semibold text-foreground">{Number((val * rate).toFixed(0)).toLocaleString('es')}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary cards ─────────────────────────────────────────────────────────────
function SummaryCards({ expenses, members, currentUserEmail, currency }) {
  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount_base || e.amount) || 0), 0);
  const byCategory = useMemo(() => {
    const acc = {};
    expenses.forEach(e => {
      const cat = e.category || 'other';
      acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount_base || e.amount) || 0);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // My balance
  const myBalance = useMemo(() => {
    if (!currentUserEmail) return 0;
    const balances = {};
    members.forEach(m => { balances[m] = 0; });
    expenses.forEach(e => {
      const amount = parseFloat(e.amount_base || e.amount) || 0;
      if (!amount) return;
      balances[e.paid_by] = (balances[e.paid_by] || 0) + amount;
      const participants = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
      const share = amount / participants.length;
      participants.forEach(p => { balances[p] = (balances[p] || 0) - share; });
    });
    return balances[currentUserEmail] || 0;
  }, [expenses, members, currentUserEmail]);

  if (expenses.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-1">
      {/* Total */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">Total gastado</p>
        <p className="text-xl font-semibold text-foreground">{total.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">{currency}</span></p>
        <p className="text-xs text-muted-foreground mt-1">{expenses.length} gasto{expenses.length !== 1 ? 's' : ''}</p>
      </div>

      {/* My balance */}
      <div className={`rounded-2xl border p-4 ${Math.abs(myBalance) < 0.5 ? 'bg-white border-border' : myBalance > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs text-muted-foreground mb-1">Mi balance</p>
        {Math.abs(myBalance) < 0.5 ? (
          <>
            <p className="text-xl font-semibold text-foreground">0</p>
            <p className="text-xs text-green-600 mt-1 font-medium">Al día ✓</p>
          </>
        ) : (
          <>
            <p className={`text-xl font-semibold ${myBalance > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {myBalance > 0 ? '+' : ''}{myBalance.toFixed(0)} {currency}
            </p>
            <p className={`text-xs mt-1 font-medium ${myBalance > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {myBalance > 0 ? 'Te deben' : 'Debes'}
            </p>
          </>
        )}
      </div>

      {/* Top category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Mayor gasto</p>
          <p className="text-lg">{CAT_CONFIG[byCategory[0][0]]?.emoji || '💰'}</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{CAT_CONFIG[byCategory[0][0]]?.label || byCategory[0][0]}</p>
          <p className="text-xs text-muted-foreground">{byCategory[0][1].toFixed(0)} {currency}</p>
        </div>
      )}

      {/* Members count */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">Viajeros</p>
        <p className="text-xl font-semibold text-foreground">{members.length || 1}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {total > 0 && members.length > 1 ? `${(total / members.length).toFixed(0)} ${currency}/persona` : 'en el grupo'}
        </p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Expenses() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { performDelete } = useUndo();

  const [tab, setTab] = useState('gastos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Data
  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId, staleTime: 60000,
  });

  const { cities, activeCity } = useTripContext(tripId);
  const baseCurrency = trip?.base_currency || trip?.currency || 'EUR';
  const activeMeta = getCountryMeta(activeCity?.country_code || activeCity?.country || '');
  const defaultCurrency = activeMeta?.currency || baseCurrency;
  const availableCurrencies = computeAvailableCurrencies(cities, baseCurrency);
  const members = trip?.members || [];

  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 120000,
  });
  const userMap = usersData.reduce((map, u) => { map[u.email] = u.full_name || u.email; return map; }, {});

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId, staleTime: 30000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => base44.entities.Expense.create({ ...formData, trip_id: tripId, amount: parseFloat(formData.amount) }),
    onSuccess: async (_, formData) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setDialogOpen(false);
      setEditingExpense(null);
      const otherMembers = (trip?.members || []).filter(email => email !== currentUser?.email);
      if (otherMembers.length > 0) {
        try {
          const profiles = await base44.entities.UserProfile.filter({});
          otherMembers.forEach(email => {
            const profile = profiles.find(p => p.email === email || p.user_email === email);
            if (profile?.user_id) {
              createNotification({
                userId: profile.user_id, type: 'trip_update', refId: tripId,
                refTitle: trip?.name || 'el viaje',
                message: `Nuevo gasto: ${formData.description} (${parseFloat(formData.amount).toFixed(2)} ${formData.currency || 'EUR'})`,
              });
            }
          });
        } catch {}
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => base44.entities.Expense.update(id, { ...formData, amount: parseFloat(formData.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }); setDialogOpen(false); setEditingExpense(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }),
  });

  const handleDelete = async (expense) => {
    const expenseData = { ...expense };
    delete expenseData.id; delete expenseData.created_date;
    delete expenseData.updated_date; delete expenseData.created_by;
    await performDelete(
      () => deleteMutation.mutateAsync(expense.id),
      () => base44.entities.Expense.create(expenseData),
      expense.description
    );
  };

  const handleSave = (formData) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openAdd = () => { setEditingExpense(null); setDialogOpen(true); };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          {/* Back + action */}
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />Inicio
              </button>
            </Link>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Añadir
            </button>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-4">Gastos</h1>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              ['gastos', 'Gastos', '💸'],
              ['balances', 'Balances', '⚖️'],
              ['conversor', 'Conversor', '💱'],
            ].map(([k, l, em]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex flex-col items-center gap-0.5 ${
                  tab === k ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}>
                <span className="text-lg">{em}</span>
                <span className="text-xs">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24 space-y-4">

        {/* ── GASTOS TAB ── */}
        {tab === 'gastos' && (
          <div className="space-y-4">
            <SummaryCards
              expenses={expenses}
              members={members}
              currentUserEmail={currentUser?.email}
              currency={baseCurrency}
            />

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-border animate-pulse" />)}
              </div>
            ) : expenses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <p className="text-4xl mb-3">💸</p>
                <p className="text-sm font-semibold text-foreground mb-1">Sin gastos todavía</p>
                <p className="text-xs text-muted-foreground mb-5">Registra los gastos del viaje para llevar la cuenta entre todos</p>
                <button onClick={openAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />Añadir primer gasto
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                {expenses.map((expense, idx) => (
                  <div key={expense.id} className={idx > 0 ? 'border-t border-border' : ''}>
                    <ExpenseCard
                      expense={expense}
                      userMap={userMap}
                      onEdit={(e) => { setEditingExpense(e); setDialogOpen(true); }}
                      onDelete={() => handleDelete(expense)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BALANCES TAB ── */}
        {tab === 'balances' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <p className="text-4xl mb-3">⚖️</p>
                <p className="text-sm font-semibold text-foreground mb-1">Sin datos aún</p>
                <p className="text-xs text-muted-foreground">Añade gastos para ver los balances del grupo</p>
              </div>
            ) : (
              <BalancesPanel
                expenses={expenses}
                members={members}
                currentUserEmail={currentUser?.email}
                userMap={userMap}
              />
            )}
          </div>
        )}

        {/* ── CONVERSOR TAB ── */}
        {tab === 'conversor' && (
          <CurrencyConverter baseCurrency={baseCurrency} tripCurrency={defaultCurrency} />
        )}
      </div>

      {/* Expense dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-border max-w-lg max-h-[90vh] rounded-2xl flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-foreground font-bold">
              {editingExpense ? 'Editar gasto' : 'Nuevo gasto'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
          <ExpenseForm
            members={members}
            initialData={editingExpense}
            defaultCurrency={defaultCurrency}
            baseCurrency={baseCurrency}
            availableCurrencies={availableCurrencies}
            onSave={handleSave}
            onCancel={() => { setDialogOpen(false); setEditingExpense(null); }}
            saving={createMutation.isPending || updateMutation.isPending}
            userMap={userMap}
          />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}