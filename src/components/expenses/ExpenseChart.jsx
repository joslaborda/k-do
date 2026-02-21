import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  accommodation: '#8b5cf6',
  activities: '#ec4899',
  shopping: '#14b8a6',
  other: '#6b7280'
};

const CATEGORY_LABELS = {
  food: 'Comida',
  transport: 'Transporte',
  accommodation: 'Alojamiento',
  activities: 'Actividades',
  shopping: 'Compras',
  other: 'Otro'
};

export default function ExpenseChart({ expenses }) {
  const chartData = useMemo(() => {
    const byCategory = expenses.reduce((acc, exp) => {
      const category = exp.category || 'other';
      if (!acc[category]) acc[category] = 0;

      // Convertir todo a JPY
      const amount = exp.currency === 'EUR' ? exp.amount * 160 : exp.amount;
      acc[category] += amount;
      return acc;
    }, {});

    return Object.entries(byCategory).map(([category, amount]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: Math.round(amount),
      fill: COLORS[category] || COLORS.other
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  if (expenses.length === 0) {
    return (
      <div className="bg-[#ffffff] text-stone-400 py-8 text-center">
        <p>No hay gastos registrados aún</p>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="bg-white rounded-xl border-2 border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Distribución por categoría</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ¥${entry.value.toLocaleString()}`}>

              {chartData.map((entry, index) =>
              <Cell key={`cell-${index}`} fill={entry.fill} />
              )}
            </Pie>
            <Tooltip
              formatter={(value) => `¥${value.toLocaleString()}`} />

          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border-2 border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Comparación de gastos</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) =>
              <Cell key={`cell-${index}`} fill={entry.fill} />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">Total gastado</p>
        <p className="text-4xl font-bold">¥{totalAmount.toLocaleString()}</p>
        <p className="text-sm opacity-75 mt-2">≈ €{Math.round(totalAmount / 160).toLocaleString()}</p>
      </div>
    </div>);

}