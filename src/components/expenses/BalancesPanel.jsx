import { calculateBalances, getDebts } from '@/lib/expenseBalances';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

export default function BalancesPanel({ expenses = [], members = [], currentUserEmail = '', userMap = {}, baseCurrency = 'EUR' }) {
  const currencySymbol = baseCurrency === 'EUR' ? '€' : baseCurrency === 'JPY' ? '¥' : baseCurrency === 'USD' ? '$' : baseCurrency === 'GBP' ? '£' : baseCurrency;
  const balances = calculateBalances(expenses, members);
  const debts = getDebts(balances);

  const getName = (email) => userMap[email] || email;

  const currentUserBalance = balances[currentUserEmail] || 0;
  const isSettled = Math.abs(currentUserBalance) < 0.01;

  return (
    <div className="space-y-6">
      {/* Tu balance */}
      <div className={`rounded-2xl p-6 text-white ${
        currentUserBalance > 0.01
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : currentUserBalance < -0.01
          ? 'bg-gradient-to-br from-red-500 to-rose-600'
          : 'bg-gradient-to-br from-blue-500 to-cyan-600'
      }`}>
        <p className="text-white/80 text-sm font-medium mb-1">Tu balance</p>
        <h2 className="text-4xl font-bold mb-4">
          {currentUserBalance >= 0 ? '+' : ''}{currentUserBalance.toFixed(2)}€
        </h2>
        <p className="text-white/80 text-sm">
          {isSettled
            ? '✓ Estás en paz'
            : currentUserBalance > 0
            ? 'Te deben este dinero'
            : 'Debes este dinero'}
        </p>
      </div>

      {/* Resumen total */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total gastado',
            value: expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0).toFixed(baseCurrency === 'JPY' ? 0 : 2),
            icon: TrendingDown,
            color: 'from-orange-100 to-orange-50',
          },
          {
            label: 'Pagaste',
            value: expenses
              .filter(e => e.paid_by === currentUserEmail)
              .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
              .toFixed(baseCurrency === 'JPY' ? 0 : 2),
            icon: TrendingUp,
            color: 'from-blue-100 to-blue-50',
          },
          {
            label: 'Tu parte',
            value: Math.abs(
              expenses.reduce((sum, e) => {
                if (e.split_type === 'equal') {
                  const share = (parseFloat(e.amount) || 0) / (e.split_with?.length || 1);
                  return e.split_with?.includes(currentUserEmail) ? sum + share : sum;
                } else {
                  return sum + (parseFloat(e.amounts_by_user?.[currentUserEmail]) || 0);
                }
              }, 0)
            ).toFixed(2),
            icon: TrendingDown,
            color: 'from-purple-100 to-purple-50',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 border border-white/40`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">{stat.label}</p>
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}{currencySymbol}</p>
            </div>
          );
        })}
      </div>

      {/* Deudas claras */}
      {debts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Ajustes pendientes</h3>
          <div className="space-y-3">
            {debts.map((debt, i) => {
              const isRelevant =
                debt.from === currentUserEmail || debt.to === currentUserEmail;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isRelevant
                      ? debt.from === currentUserEmail
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      isRelevant
                        ? debt.from === currentUserEmail
                          ? 'text-red-700'
                          : 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {getName(debt.from)}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${
                      isRelevant
                        ? debt.from === currentUserEmail
                          ? 'text-red-500'
                          : 'text-green-500'
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      isRelevant
                        ? debt.from === currentUserEmail
                          ? 'text-red-700'
                          : 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {getName(debt.to)}
                    </span>
                  </div>
                  <span className={`font-bold whitespace-nowrap ${
                    isRelevant
                      ? debt.from === currentUserEmail
                        ? 'text-red-700'
                        : 'text-green-700'
                      : 'text-gray-700'
                  }`}>
                    {debt.amount.toFixed(baseCurrency === 'JPY' ? 0 : 2)}{currencySymbol}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-green-700">✓ Todos en paz</p>
          <p className="text-sm text-green-600">No hay deudas pendientes</p>
        </div>
      )}
    </div>
  );
}