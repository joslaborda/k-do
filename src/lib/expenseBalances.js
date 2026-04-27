/**
 * expenseBalances.js
 * Calcula balances tipo Splitwise con algoritmo de mínimas transacciones
 * Soporta multi-divisa: todos los montos se normalizan a la moneda base del viaje
 */

/**
 * Calcula balances netos por usuario
 * @param {Array} expenses - gastos con amount_base (convertido a moneda base)
 * @param {Array} members - emails de los miembros
 */
export function calculateBalances(expenses, members) {
  const balances = {};
  members.forEach(email => { balances[email] = 0; });

  expenses.forEach(expense => {
    // Usar amount_base si existe (ya convertido), si no usar amount
    const amount = parseFloat(expense.amount_base || expense.amount) || 0;
    const { paid_by, split_type, split_with, amounts_by_user } = expense;

    if (!paid_by || !amount) return;

    // Quien paga suma lo que pagó
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Calcular parte de cada uno
    if (split_type === 'equal') {
      const participants = split_with?.length > 0 ? split_with : [paid_by];
      const share = amount / participants.length;
      participants.forEach(email => {
        balances[email] = (balances[email] || 0) - share;
      });
    } else if (split_type === 'custom' && amounts_by_user) {
      // amounts_by_user en moneda original — usar ratios para calcular en base
      const totalCustom = Object.values(amounts_by_user).reduce((s, v) => s + parseFloat(v || 0), 0);
      Object.entries(amounts_by_user).forEach(([email, val]) => {
        const ratio = totalCustom > 0 ? parseFloat(val) / totalCustom : 0;
        balances[email] = (balances[email] || 0) - (amount * ratio);
      });
    } else if (split_type === 'solo') {
      // Solo para el que paga, nadie más debe nada
      // No restamos nada a nadie
    }
  });

  return balances;
}

/**
 * Algoritmo de mínimas transacciones (greedy)
 * Minimiza el número de pagos necesarios para saldar todas las deudas
 */
export function getDebts(balances) {
  // Filtrar balances significativos
  const credits = []; // positivo: te deben
  const debts_list = []; // negativo: debes

  Object.entries(balances).forEach(([email, bal]) => {
    if (bal > 0.01) credits.push({ email, amount: bal });
    else if (bal < -0.01) debts_list.push({ email, amount: -bal });
  });

  // Ordenar de mayor a menor
  credits.sort((a, b) => b.amount - a.amount);
  debts_list.sort((a, b) => b.amount - a.amount);

  const result = [];

  // Greedy: el que más debe paga al que más le deben
  let i = 0, j = 0;
  while (i < credits.length && j < debts_list.length) {
    const credit = credits[i];
    const debt = debts_list[j];

    const amount = Math.min(credit.amount, debt.amount);
    if (amount > 0.01) {
      result.push({
        from: debt.email,
        to: credit.email,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount < 0.01) i++;
    if (debt.amount < 0.01) j++;
  }

  return result;
}

/**
 * Calcula el total gastado normalizado a moneda base
 */
export function getTotalInBase(expenses) {
  return expenses.reduce((sum, e) => sum + parseFloat(e.amount_base || e.amount || 0), 0);
}