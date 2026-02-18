import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Scale, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BalanceSummary({ expenses }) {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: "What is the current EUR to JPY exchange rate? Reply with ONLY the number, nothing else. For example: 162.5",
      add_context_from_internet: true
    });
    const rate = parseFloat(result.replace(/[^0-9.]/g, ''));
    if (!isNaN(rate)) {
      setExchangeRate(rate);
    }
    setLoadingRate(false);
  };

  const convertToJPY = (amount, currency) => {
    if (currency === 'JPY') return amount;
    if (currency === 'EUR' && exchangeRate) return amount * exchangeRate;
    return amount;
  };

  const convertToEUR = (amountJPY) => {
    if (!exchangeRate) return null;
    return amountJPY / exchangeRate;
  };

  const calculateBalances = () => {
    let youPaidJPY = 0;
    let carlosPaidJPY = 0;
    let youOwesJPY = 0;
    let carlosOwesJPY = 0;

    expenses.forEach(expense => {
      const amount = expense.amount || 0;
      const amountJPY = convertToJPY(amount, expense.currency || 'JPY');
      const splitWith = expense.split_with || [];
      const isSplit = splitWith.length > 0;
      const splitAmount = isSplit ? amountJPY / 2 : 0;

      if (expense.paid_by === 'You') {
        youPaidJPY += amountJPY;
        if (isSplit && splitWith.includes('Carlos')) {
          carlosOwesJPY += splitAmount;
        }
      } else if (expense.paid_by === 'Carlos') {
        carlosPaidJPY += amountJPY;
        if (isSplit && splitWith.includes('You')) {
          youOwesJPY += splitAmount;
        }
      }
    });

    const netBalanceJPY = carlosOwesJPY - youOwesJPY;
    return { youPaidJPY, carlosPaidJPY, youOwesJPY, carlosOwesJPY, netBalanceJPY };
  };

  const { youPaidJPY, carlosPaidJPY, netBalanceJPY } = calculateBalances();
  const totalSpentJPY = youPaidJPY + carlosPaidJPY;

  const formatJPY = (amount) => `¥${Math.abs(amount).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`;
  const formatEUR = (amount) => `€${Math.abs(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const netBalanceEUR = convertToEUR(netBalanceJPY);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-300">Balance del Viaje</h3>
        </div>
        <button 
          onClick={fetchExchangeRate}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          disabled={loadingRate}
        >
          {loadingRate ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {exchangeRate && <span>1€ = ¥{exchangeRate.toFixed(1)}</span>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Pagaste tú</p>
          <p className="text-2xl font-semibold">{formatJPY(youPaidJPY)}</p>
          {exchangeRate && <p className="text-xs text-slate-500 mt-1">{formatEUR(youPaidJPY / exchangeRate)}</p>}
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Pagó Carlos</p>
          <p className="text-2xl font-semibold">{formatJPY(carlosPaidJPY)}</p>
          {exchangeRate && <p className="text-xs text-slate-500 mt-1">{formatEUR(carlosPaidJPY / exchangeRate)}</p>}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Total gastado</span>
          <div className="text-right">
            <span className="font-semibold">{formatJPY(totalSpentJPY)}</span>
            {exchangeRate && <span className="text-xs text-slate-500 ml-2">({formatEUR(totalSpentJPY / exchangeRate)})</span>}
          </div>
        </div>
        
        {netBalanceJPY !== 0 && (
          <div className={`p-4 rounded-xl mt-3 ${netBalanceJPY > 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {netBalanceJPY > 0 ? (
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
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${netBalanceJPY > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatJPY(netBalanceJPY)}
              </p>
              {netBalanceEUR && (
                <p className={`text-lg font-semibold mt-1 ${netBalanceJPY > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatEUR(netBalanceEUR)}
                </p>
              )}
            </div>
          </div>
        )}

        {netBalanceJPY === 0 && totalSpentJPY > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl mt-3 bg-white/10">
            <Scale className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">¡Todo cuadrado!</span>
          </div>
        )}
      </div>
    </div>
  );
}