import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Check } from 'lucide-react';

export default function TricountBalance({ expenses }) {
  // Calcular saldos tipo Tricount
  const balances = useMemo(() => {
    const balanceMap = {};
    const EXCHANGE_RATE = 160; // 1 EUR = 160 JPY

    // Convertir todo a EUR para simplificar
    const convertToEUR = (amount, currency) => {
      return currency === 'JPY' ? amount / EXCHANGE_RATE : amount;
    };

    // Procesar cada gasto
    expenses.forEach(expense => {
      const amountEUR = convertToEUR(expense.amount, expense.currency);
      const paidBy = expense.paid_by;
      const splitWith = expense.split_with || [];
      
      // Si no se divide con nadie, es un gasto personal
      if (splitWith.length === 0) {
        return;
      }

      // Calcular cuánto debe cada persona
      const totalPeople = splitWith.length + 1; // +1 por quien pagó
      const amountPerPerson = amountEUR / totalPeople;

      // Inicializar balances si no existen
      if (!balanceMap[paidBy]) balanceMap[paidBy] = {};
      splitWith.forEach(person => {
        if (!balanceMap[paidBy]) balanceMap[paidBy] = {};
        if (!balanceMap[person]) balanceMap[person] = {};
        if (!balanceMap[paidBy][person]) balanceMap[paidBy][person] = 0;
        if (!balanceMap[person][paidBy]) balanceMap[person][paidBy] = 0;
      });

      // Quien pagó recibe dinero de los demás
      splitWith.forEach(person => {
        balanceMap[person][paidBy] += amountPerPerson;
      });
    });

    // Simplificar deudas (netear)
    const simplifiedBalances = [];
    const people = Object.keys(balanceMap);
    
    people.forEach(person1 => {
      people.forEach(person2 => {
        if (person1 !== person2) {
          const debt1to2 = balanceMap[person1]?.[person2] || 0;
          const debt2to1 = balanceMap[person2]?.[person1] || 0;
          
          if (debt1to2 > debt2to1 && debt1to2 - debt2to1 > 0.01) {
            simplifiedBalances.push({
              from: person1,
              to: person2,
              amount: Math.round((debt1to2 - debt2to1) * 100) / 100
            });
          }
        }
      });
    });

    // Remover duplicados
    const uniqueBalances = simplifiedBalances.filter((balance, index, self) =>
      index === self.findIndex((b) => 
        b.from === balance.from && b.to === balance.to
      )
    );

    return uniqueBalances;
  }, [expenses]);

  // Calcular totales por persona
  const personTotals = useMemo(() => {
    const totals = {};
    balances.forEach(b => {
      totals[b.from] = (totals[b.from] || 0) - b.amount;
      totals[b.to] = (totals[b.to] || 0) + b.amount;
    });
    return totals;
  }, [balances]);

  if (balances.length === 0) {
    return (
      <Card className="p-8 text-center glass border-border">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-foreground mb-2">¡Todo cuadrado!</h3>
        <p className="text-muted-foreground">No hay deudas pendientes entre viajeros</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/20 rounded-xl">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Balance de Grupo</h3>
          <p className="text-sm text-muted-foreground">Quién debe a quién</p>
        </div>
      </div>

      {/* Resumen de cada persona */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {Object.entries(personTotals).map(([person, total]) => (
          <div key={person} className={`p-4 rounded-xl ${
            total > 0 ? 'bg-green-500/10 border border-green-500/30' : 
            total < 0 ? 'bg-red-500/10 border border-red-500/30' : 
            'bg-secondary border border-border'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{person}</span>
              <span className={`text-lg font-bold ${
                total > 0 ? 'text-green-600' : 
                total < 0 ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {total > 0 ? '+' : ''}{total.toFixed(2)}€
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? 'Le deben' : total < 0 ? 'Debe' : 'Sin deudas'}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de transferencias necesarias */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground mb-3">Transferencias para saldar:</h4>
        {balances.map((balance, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">{balance.from === 'You' ? '👤' : '👨‍💼'}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{balance.from}</p>
                <p className="text-xs text-muted-foreground">Debe pagar</p>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-primary" />

            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">{balance.to === 'You' ? '👤' : '👨‍💼'}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{balance.to}</p>
                <p className="text-xs text-muted-foreground">Debe recibir</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{balance.amount.toFixed(2)}€</p>
              <p className="text-xs text-muted-foreground">≈ {Math.round(balance.amount * 160)}¥</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-600 flex items-start gap-2">
          <span>💡</span>
          <span>
            Estas transferencias minimizan el número de pagos necesarios para saldar todas las deudas del grupo.
          </span>
        </p>
      </div>
    </Card>
  );
}