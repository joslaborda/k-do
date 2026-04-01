/**
 * Calcula balances de gastos tipo Tricount
 * Devuelve quién debe a quién y cuánto
 */

export function calculateBalances(expenses, members) {
  // Inicializar balance por usuario (cuánto pagó - cuánto debe)
  const balances = {};
  members.forEach(email => {
    balances[email] = 0;
  });

  // Procesar cada gasto
  expenses.forEach(expense => {
    const { amount, paid_by, split_type, split_with, amounts_by_user } = expense;

    // El que paga registra lo que pagó
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Calcular cuánto debe pagar cada usuario
    let shares = {};

    if (split_type === 'equal') {
      // División a partes iguales entre los de split_with
      const participants = split_with || [paid_by];
      const sharePerPerson = amount / participants.length;
      participants.forEach(email => {
        shares[email] = sharePerPerson;
      });
    } else if (split_type === 'custom') {
      // División personalizada
      shares = { ...amounts_by_user };
    }

    // Restar de cada usuario su parte
    Object.entries(shares).forEach(([email, share]) => {
      balances[email] = (balances[email] || 0) - share;
    });
  });

  return balances;
}

/**
 * Convierte balances en relaciones de deuda claras
 * Ej: "Juan debe 24€ a María"
 */
export function getDebts(balances) {
  const debts = [];
  const users = Object.keys(balances);

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];
      const balance1 = balances[user1];
      const balance2 = balances[user2];

      // Si uno tiene positivo y otro negativo, hay deuda
      if (balance1 > 0.01 && balance2 < -0.01) {
        const amount = Math.min(balance1, -balance2);
        debts.push({
          from: user2,
          to: user1,
          amount: parseFloat(amount.toFixed(2))
        });
      } else if (balance1 < -0.01 && balance2 > 0.01) {
        const amount = Math.min(-balance1, balance2);
        debts.push({
          from: user1,
          to: user2,
          amount: parseFloat(amount.toFixed(2))
        });
      }
    }
  }

  return debts.filter(d => d.amount > 0.01);
}