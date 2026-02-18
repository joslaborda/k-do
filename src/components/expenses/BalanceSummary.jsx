import { ArrowRight, TrendingUp, TrendingDown, Scale } from 'lucide-react';

export default function BalanceSummary({ expenses }) {
  const calculateBalances = () => {
    let youPaid = 0;
    let carlosPaid = 0;
    let youOwes = 0;
    let carlosOwes = 0;

    expenses.forEach(expense => {
      const amount = expense.amount || 0;
      const splitWith = expense.split_with || [];
      const isSplit = splitWith.length > 0;
      const splitAmount = isSplit ? amount / 2 : 0;

      if (expense.paid_by === 'You') {
        youPaid += amount;
        if (isSplit && splitWith.includes('Carlos')) {
          carlosOwes += splitAmount;
        }
      } else if (expense.paid_by === 'Carlos') {
        carlosPaid += amount;
        if (isSplit && splitWith.includes('You')) {
          youOwes += splitAmount;
        }
      }
    });

    const netBalance = carlosOwes - youOwes;
    return { youPaid, carlosPaid, youOwes, carlosOwes, netBalance };
  };

  const { youPaid, carlosPaid, netBalance } = calculateBalances();
  const totalSpent = youPaid + carlosPaid;

  const formatAmount = (amount) => `¥${Math.abs(amount).toLocaleString()}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-6">
        <Scale className="w-5 h-5 text-slate-400" />
        <h3 className="font-medium text-slate-300">Balance del Viaje</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Pagaste tú</p>
          <p className="text-2xl font-semibold">{formatAmount(youPaid)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Pagó Carlos</p>
          <p className="text-2xl font-semibold">{formatAmount(carlosPaid)}</p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Total gastado</span>
          <span className="font-semibold">{formatAmount(totalSpent)}</span>
        </div>
        
        {netBalance !== 0 && (
          <div className={`flex items-center justify-between p-3 rounded-xl mt-3 ${netBalance > 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
            <div className="flex items-center gap-2">
              {netBalance > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Carlos te debe</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300">Debes a Carlos</span>
                </>
              )}
            </div>
            <span className={`font-semibold ${netBalance > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatAmount(netBalance)}
            </span>
          </div>
        )}

        {netBalance === 0 && totalSpent > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl mt-3 bg-white/10">
            <Scale className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">¡Todo cuadrado!</span>
          </div>
        )}
      </div>
    </div>
  );
}