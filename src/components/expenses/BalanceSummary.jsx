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

    expenses.forEach((expense) => {
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
    <div className="bg-[#ffffff] p-6 rounded-2xl glass border border-border">
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
           <Scale className="w-5 h-5 text-primary" />
           <h3 className="font-medium text-foreground">Balance del Viaje</h3>
         </div>
         <button
          onClick={fetchExchangeRate}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          disabled={loadingRate}>

           {loadingRate ?
          <Loader2 className="w-3 h-3 animate-spin" /> :

          <RefreshCw className="w-3 h-3" />
          }
           {exchangeRate && <span>1€ = ¥{exchangeRate.toFixed(1)}</span>}
         </button>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="bg-secondary rounded-xl p-4">
           <p className="text-muted-foreground text-sm mb-1">Pagaste tú</p>
           <p className="text-2xl font-semibold text-foreground">{formatJPY(youPaidJPY)}</p>
           {exchangeRate && <p className="text-xs text-muted-foreground mt-1">{formatEUR(youPaidJPY / exchangeRate)}</p>}
         </div>
         <div className="bg-secondary rounded-xl p-4">
           <p className="text-muted-foreground text-sm mb-1">Pagó Carlos</p>
           <p className="text-2xl font-semibold text-foreground">{formatJPY(carlosPaidJPY)}</p>
           {exchangeRate && <p className="text-xs text-muted-foreground mt-1">{formatEUR(carlosPaidJPY / exchangeRate)}</p>}
         </div>
       </div>

       <div className="border-t border-border pt-4">
         <div className="flex items-center justify-between mb-2">
           <span className="text-muted-foreground">Total gastado</span>
           <div className="text-right">
             <span className="font-semibold text-foreground">{formatJPY(totalSpentJPY)}</span>
             {exchangeRate && <span className="text-xs text-muted-foreground ml-2">({formatEUR(totalSpentJPY / exchangeRate)})</span>}
           </div>
         </div>
        
        {netBalanceJPY !== 0 &&
        <div className={`p-4 rounded-xl mt-3 ${netBalanceJPY > 0 ? 'bg-green-600/10 border border-green-600/30' : 'bg-primary/10 border border-primary/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {netBalanceJPY > 0 ?
              <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Carlos te debe</span>
                  </> :

              <>
                    <TrendingDown className="w-4 h-4 text-primary" />
                    <span className="text-primary">Debes a Carlos</span>
                  </>
              }
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${netBalanceJPY > 0 ? 'text-green-600' : 'text-primary'}`}>
                {formatJPY(netBalanceJPY)}
              </p>
              {netBalanceEUR &&
            <p className={`text-lg font-semibold mt-1 ${netBalanceJPY > 0 ? 'text-green-700' : 'text-primary/80'}`}>
                  {formatEUR(netBalanceEUR)}
                </p>
            }
            </div>
          </div>
        }

        {netBalanceJPY === 0 && totalSpentJPY > 0 &&
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl mt-3 bg-secondary border border-border">
            <Scale className="w-4 h-4 text-primary" />
            <span className="text-foreground">¡Todo cuadrado!</span>
          </div>
        }
      </div>
    </div>);

}