import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { getFxRate } from '@/lib/fxRates';

export default function BalanceSummary({ expenses, baseCurrency = 'EUR', members = [] }) {
  const [rates, setRates] = useState({});

  useEffect(() => {
    const currencies = [...new Set(expenses.map(e => e.currency || baseCurrency))].filter(c => c !== baseCurrency);
    currencies.forEach(async (c) => {
      try {
        const { rate } = await getFxRate(c, baseCurrency);
        setRates(prev => ({ ...prev, [c]: rate }));
      } catch {}
    });
  }, [expenses, baseCurrency]);

  const toBase = (amount, currency) => {
    if (!currency || currency === baseCurrency) return amount;
    const rate = rates[currency];
    return rate ? amount * rate : amount;
  };

  const balances = {};
  const allMembers = members.length > 0
    ? members
    : [...new Set(expenses.flatMap(e => [e.paid_by, ...(e.split_with || [])].filter(Boolean)))];
  allMembers.forEach(m => { balances[m] = 0; });

  expenses.forEach(e => {
    const amount = toBase(e.amount || 0, e.currency);
    const payer = e.paid_by;
    const splitWith = e.split_with || [];
    if (!payer) return;
    if (splitWith.length === 0) {
      balances[payer] = (balances[payer] || 0) + amount;
    } else {
      const all = [...new Set([payer, ...splitWith])];
      const share = amount / all.length;
      all.forEach(m => { balances[m] = (balances[m] || 0) - share; });
      balances[payer] = (balances[payer] || 0) + amount;
    }
  });

  const totalSpent = expenses.reduce((sum, e) => sum + toBase(e.amount || 0, e.currency), 0);
  const fmt = (n) => `${Math.abs(n).toLocaleString('es-ES', { maximumFractionDigits: 0 })} ${baseCurrency}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">Balance del viaje</h3>
        <span className="ml-auto text-sm text-muted-foreground">Total: {fmt(totalSpent)}</span>
      </div>
      <div className="space-y-3">
        {Object.entries(balances).map(([member, balance]) => (
          <div key={member} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">{member}</span>
            <div className="flex items-center gap-2">
              {balance > 0.5 ? (
                <><TrendingUp className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-600">+{fmt(balance)}</span></>
              ) : balance < -0.5 ? (
                <><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm font-semibold text-red-500">-{fmt(Math.abs(balance))}</span></>
              ) : (
                <span className="text-sm text-muted-foreground">Equilibrado</span>
              )}
            </div>
          </div>
        ))}
        {Object.keys(balances).length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">Sin gastos todavía</p>
        )}
      </div>
    </div>
  );
}
