/**
 * expenseBalances.js
 * Calcula balances tipo Splitwise con algoritmo de mínimas transacciones
 * Soporta multi-divisa: todos los montos se normalizan a la moneda base del viaje
 */

// UserProfile.email se guarda siempre en minúsculas, pero trip.members y los
// emails guardados en cada Expense (paid_by/split_with/amounts_by_user)
// pueden venir de antes de esa normalización, o de un miembro cuyo email de
// auth tenía mayúsculas distintas. Sin normalizar aquí, la misma persona
// podía acabar como DOS claves distintas en `balances` ("Maria@x.com" y
// "maria@x.com") — cada una con su propio saldo — y getDebts() generaba una
// deuda fantasma entre esa persona y sí misma, o simplemente números que no
// cuadraban. Todo el cálculo trabaja siempre con el email en minúsculas.
const norm = (email) => (email || '').trim().toLowerCase();

/**
 * Calcula balances netos por usuario
 * @param {Array} expenses - gastos con amount_base (convertido a moneda base)
 * @param {Array} members - emails de los miembros
 */
export function calculateBalances(expenses, members) {
  if (!Array.isArray(expenses) || !Array.isArray(members)) return {};
  const balances = {};
  members.forEach(email => { const e = norm(email); if (e) balances[e] = 0; });

  expenses.forEach(expense => {
    // Usar amount_base si existe (ya convertido), si no usar amount
    const amount = parseFloat(expense.amount_base || expense.amount) || 0;
    const paid_by = norm(expense.paid_by);
    const { split_type } = expense;
    const split_with = (expense.split_with || []).map(norm);
    const amounts_by_user = expense.amounts_by_user
      ? Object.fromEntries(Object.entries(expense.amounts_by_user).map(([e, v]) => [norm(e), v]))
      : null;

    if (!paid_by || !amount) return;

    // Quien paga suma lo que pagó
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Calcular parte de cada uno
    if (split_type === 'equal') {
      // Deduplicar: si trip.members llegó a tener a la misma persona dos
      // veces con distinta capitalización (bug histórico ya corregido en el
      // origen, pero pueden quedar viajes con el dato así), sin este Set un
      // gasto "a partes iguales entre todos" la debitaba el doble.
      const participants = [...new Set(split_with.length > 0 ? split_with : [paid_by])];
      const share = amount / participants.length;
      participants.forEach(email => {
        balances[email] = (balances[email] || 0) - share;
      });
    } else if (split_type === 'custom' && amounts_by_user) {
      // amounts_by_user en moneda original — usar ratios para calcular en base.
      // Los importes negativos se tratan como 0: ya se bloquean en el
      // formulario, pero si llega un gasto con un valor negativo por
      // cualquier otra vía (import, edición directa por API), sin este guard
      // podían invertir a quién se debita/acredita cada parte.
      const safeAmounts = Object.fromEntries(
        Object.entries(amounts_by_user).map(([e, v]) => [e, Math.max(0, parseFloat(v) || 0)])
      );
      const totalCustom = Object.values(safeAmounts).reduce((s, v) => s + v, 0);
      const participants = Object.keys(safeAmounts);
      if (totalCustom > 0) {
        Object.entries(safeAmounts).forEach(([email, val]) => {
          const ratio = val / totalCustom;
          balances[email] = (balances[email] || 0) - (amount * ratio);
        });
      } else if (participants.length > 0) {
        // Todos los importes a 0/vacíos (dato legado, importado o editado a
        // mano): con ratio=0 para todos, antes nadie se debitaba nada pero el
        // pagador sí se acreditaba el importe completo — rompía la invariante
        // "suma de balances = 0" y getDebts() generaba una deuda fantasma de
        // todo el grupo hacia el pagador. Se reparte a partes iguales entre
        // quienes estaban en el split en vez de perder el débito por completo.
        const share = amount / participants.length;
        participants.forEach(email => {
          balances[email] = (balances[email] || 0) - share;
        });
      }
    } else if (split_type === 'solo') {
      // Gasto personal: solo afecta al pagador, neto 0 para el grupo
      // El pagador adelanta y se lo descuenta a sí mismo → no crea deuda entre miembros
      balances[paid_by] = (balances[paid_by] || 0) - amount;
    } else {
      // split_type desconocido, vacío, o "custom" sin amounts_by_user: sin
      // esta rama el pagador se acreditaba el importe completo (línea de
      // arriba) y nadie quedaba debitado, rompiendo la invariante "suma de
      // balances = 0" y generando una deuda fantasma. Se reparte a partes
      // iguales entre split_with (o solo el pagador si no hay nadie más),
      // igual que el resto de ramas de "dato inesperado" de esta función.
      const participants = [...new Set(split_with.length > 0 ? split_with : [paid_by])];
      const share = amount / participants.length;
      participants.forEach(email => {
        balances[email] = (balances[email] || 0) - share;
      });
    }
  });

  return balances;
}

/**
 * Algoritmo de mínimas transacciones (greedy)
 * Minimiza el número de pagos necesarios para saldar todas las deudas
 */
export function getDebts(balances) {
  if (!balances || typeof balances !== 'object') return [];
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
  if (!Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, e) => sum + parseFloat(e.amount_base || e.amount || 0), 0);
}