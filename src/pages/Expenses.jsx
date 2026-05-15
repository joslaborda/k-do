import { createPageUrl } from '@/utils';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUndo } from '@/components/hooks/useUndo';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta, computeAvailableCurrencies } from '@/lib/countryConfig';
import { createNotification } from '@/lib/notifications';
import { calculateBalances, getDebts } from '@/lib/expenseBalances';
import ExpenseForm from '@/components/expenses/ExpenseForm';

// ── Category config ───────────────────────────────────────────────────────────
const CAT_CONFIG = {
  food:          { label: 'Comida',      emoji: '🍜' },
  transport:     { label: 'Transporte',  emoji: '🚆' },
  accommodation: { label: 'Alojamiento', emoji: '🏨' },
  activities:    { label: 'Actividades', emoji: '⚡' },
  shopping:      { label: 'Compras',     emoji: '🛍️' },
  other:         { label: 'Otro',        emoji: '💰' },
};

// ── Currency symbol helper ─────────────────────────────────────────────────────
function sym(code) {
  const MAP = { EUR:'€', USD:'$', GBP:'£', JPY:'¥', KRW:'₩', CNY:'¥', THB:'฿', VND:'₫', INR:'₹', MXN:'$', COP:'$' };
  return MAP[code] || code;
}

function fmtAmt(n, code) {
  const isZeroDecimal = ['JPY','KRW','VND','IDR'].includes(code);
  const v = isZeroDecimal ? Math.round(n) : parseFloat(n.toFixed(2));
  return v.toLocaleString('es');
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ email, profiles = [], size = 28 }) {
  const profile = profiles.find(p => p.email === email || p.user_email === email);
  const name = profile?.display_name || profile?.username || email?.split('@')[0] || '?';
  const initials = name.slice(0, 2).toUpperCase();
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  const COLORS = ['#fbd5c0', '#c5deff', '#c5efd4', '#e8d5fb', '#fde8b5'];
  const TEXT = ['#b34a1a', '#1d4ed8', '#15803d', '#7e22ce', '#92400e'];
  const idx = email?.charCodeAt(0) % 5 || 0;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: COLORS[idx], color: TEXT[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 500, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── CurrencyBanner — shown when active city changes ───────────────────────────
function CurrencyBanner({ countryName, currencyCode, currencyName, flag, onAccept, onDismiss }) {
  return (
    <div style={{ background: '#fff3ee', border: '0.5px solid #fbd5c0', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{flag}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#b34a1a' }}>Has llegado a {countryName}</p>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#fbd5c0', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, marginTop: -2 }}>×</button>
          </div>
          <p style={{ fontSize: 12, color: '#c2410c', marginBottom: 10, lineHeight: 1.4 }}>
            La moneda local es {currencyName} ({currencyCode}). ¿Registrar gastos en {currencyCode}?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onAccept}
              style={{ flex: 1, background: '#c2410c', color: 'white', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Sí, usar {currencyCode}
            </button>
            <button onClick={onDismiss}
              style={{ flex: 1, background: 'white', color: '#c2410c', border: '0.5px solid #fbd5c0', borderRadius: 8, padding: '7px 0', fontSize: 12, cursor: 'pointer' }}>
              Mantener base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expense row ───────────────────────────────────────────────────────────────
function ExpenseRow({ expense, baseCurrency, userMap, onEdit, onDelete }) {
  const tc = CAT_CONFIG[expense.category] || CAT_CONFIG.other;
  const isSame = expense.currency === baseCurrency || !expense.currency;
  const paidByName = userMap[expense.paid_by] || expense.paid_by?.split('@')[0] || '?';
  const splitCount = expense.split_with?.length || 1;

  return (
    <button onClick={() => onEdit(expense)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors border-b border-border last:border-0">
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {tc.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {expense.description}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
          Pagó {paidByName} · ÷ {splitCount}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {!isSame && (
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {sym(expense.currency)}{fmtAmt(parseFloat(expense.amount || 0), expense.currency)}
          </p>
        )}
        <p style={{ fontSize: isSame ? 13 : 11, fontWeight: isSame ? 500 : 400, color: isSame ? 'var(--color-text-primary)' : '#c2410c' }}>
          {sym(baseCurrency)}{fmtAmt(parseFloat(expense.amount_base || expense.amount || 0), baseCurrency)}
        </p>
      </div>
    </button>
  );
}

// ── Tab: Gastos ───────────────────────────────────────────────────────────────
function GastosTab({ expenses, baseCurrency, userMap, onEdit, onDelete, onAdd, currentUserEmail }) {
  const [catFilter, setCatFilter] = useState('all');

  const myBalance = useMemo(() => {
    const balances = {};
    expenses.forEach(e => {
      const amt = parseFloat(e.amount_base || e.amount) || 0;
      if (!amt || !e.paid_by) return;
      balances[e.paid_by] = (balances[e.paid_by] || 0) + amt;
      const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
      const share = amt / parts.length;
      parts.forEach(p => { balances[p] = (balances[p] || 0) - share; });
    });
    return balances[currentUserEmail] || 0;
  }, [expenses, currentUserEmail]);

  const filtered = catFilter === 'all' ? expenses : expenses.filter(e => e.category === catFilter);

  // Group by date
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => {
      const d = e.date || e.created_date?.slice(0, 10) || 'Sin fecha';
      if (!g[d]) g[d] = [];
      g[d].push(e);
    });
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDate = (d) => {
    if (d === 'Sin fecha') return d;
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch { return d; }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-sm font-medium text-foreground mb-1">Sin gastos todavía</p>
        <p className="text-xs text-muted-foreground mb-5">Registra los gastos para llevar la cuenta entre todos</p>
        <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm rounded-xl font-medium">
          <Plus className="w-4 h-4" />Añadir primer gasto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mi balance */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">Tu balance</p>
        <div className="flex items-baseline justify-between">
          <p className={`text-2xl font-medium ${Math.abs(myBalance) < 0.5 ? 'text-foreground' : myBalance > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {Math.abs(myBalance) < 0.5 ? '0' : `${myBalance > 0 ? '+' : ''}${fmtAmt(myBalance, baseCurrency)}`} {sym(baseCurrency)}
          </p>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            Math.abs(myBalance) < 0.5 ? 'bg-secondary text-muted-foreground border-border' :
            myBalance > 0 ? 'bg-green-50 text-green-700 border-green-200' :
            'bg-red-50 text-red-600 border-red-200'
          }`}>
            {Math.abs(myBalance) < 0.5 ? 'Al día ✓' : myBalance > 0 ? 'Te deben' : 'Debes'}
          </span>
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['all', '🌍', 'Todos'], ...Object.entries(CAT_CONFIG).map(([k, v]) => [k, v.emoji, v.label])].map(([k, em, l]) => (
          <button key={k} onClick={() => setCatFilter(k)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
              catFilter === k ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:border-primary/40'
            }`}>
            <span>{em}</span> {l}
          </button>
        ))}
      </div>

      {/* Lista agrupada por fecha */}
      {grouped.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">Sin gastos en esta categoría</div>
      ) : (
        grouped.map(([date, exps]) => (
          <div key={date}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{formatDate(date)}</p>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {exps.map(e => (
                <ExpenseRow key={e.id} expense={e} baseCurrency={baseCurrency} userMap={userMap} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Tab: Balances ─────────────────────────────────────────────────────────────
function BalancesTab({ expenses, members, currentUserEmail, userMap, baseCurrency, profiles, onSettle }) {
  const balances = useMemo(() => calculateBalances(expenses, members), [expenses, members]);
  const debts = useMemo(() => getDebts(balances), [balances]);

  const myBalance = balances[currentUserEmail] || 0;
  const iSettled = Math.abs(myBalance) < 0.01;

  // Debts where I owe someone
  const iOwe = debts.filter(d => d.from === currentUserEmail);
  // Debts where someone owes me
  const owesMe = debts.filter(d => d.to === currentUserEmail);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border text-center py-16">
        <p className="text-4xl mb-3">⚖️</p>
        <p className="text-sm font-medium text-foreground mb-1">Sin datos aún</p>
        <p className="text-xs text-muted-foreground">Añade gastos para ver los balances del grupo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mi balance */}
      <div className={`rounded-2xl border p-4 ${iSettled ? 'bg-white border-border' : myBalance > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs text-muted-foreground mb-1">Tu balance</p>
        <p className={`text-2xl font-medium ${iSettled ? 'text-foreground' : myBalance > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {iSettled ? '✓ Al día' : `${myBalance > 0 ? '+' : ''}${fmtAmt(myBalance, baseCurrency)} ${sym(baseCurrency)}`}
        </p>
        {!iSettled && (
          <p className={`text-xs mt-1 font-medium ${myBalance > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {myBalance > 0 ? 'Te deben este dinero' : 'Debes este dinero'}
          </p>
        )}
      </div>

      {/* Lo que debo yo — botón "He pagado" para saldar */}
      {iOwe.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tienes que pagar</p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {iOwe.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={d.to} profiles={profiles} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userMap[d.to] || d.to?.split('@')[0]}
                  </p>
                  <p className="text-xs text-red-500 font-medium mt-0.5">Debes {fmtAmt(d.amount, baseCurrency)} {sym(baseCurrency)}</p>
                </div>
                <button onClick={() => onSettle(d)}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium flex-shrink-0">
                  He pagado
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lo que me deben a mí — solo informativo */}
      {owesMe.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Te deben</p>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {owesMe.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={d.from} profiles={profiles} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userMap[d.from] || d.from?.split('@')[0]}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">Te debe {fmtAmt(d.amount, baseCurrency)} {sym(baseCurrency)}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">Pendiente</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Ellos verán el botón "He pagado" en su vista</p>
        </div>
      )}

      {/* Todos los saldos */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Saldo de todos</p>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {members.map((email, i) => {
            const bal = balances[email] || 0;
            const isMe = email === currentUserEmail;
            const name = userMap[email] || email?.split('@')[0] || '?';
            const total = Math.max(...Object.values(balances).map(Math.abs), 0.01);
            const pct = Math.abs(bal) / total * 100;
            return (
              <div key={email} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={email} profiles={profiles} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{isMe ? 'Tú' : name}</span>
                    <span className={`text-sm font-medium ${Math.abs(bal) < 0.01 ? 'text-muted-foreground' : bal > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {Math.abs(bal) < 0.01 ? '0' : `${bal > 0 ? '+' : ''}${fmtAmt(bal, baseCurrency)}`} {sym(baseCurrency)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: Math.abs(bal) < 0.01 ? '#d1d5db' : bal > 0 ? '#16a34a' : '#dc2626', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {iSettled && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-green-700">✓ Todos en paz</p>
          <p className="text-xs text-green-600 mt-1">No hay deudas pendientes en el grupo</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Estadísticas ─────────────────────────────────────────────────────────
function StatsTab({ expenses, baseCurrency, currentUserEmail, cities = [] }) {
  const s = sym(baseCurrency);

  // My spend (what I owe, my share of all expenses)
  const mySpend = useMemo(() => {
    return expenses.reduce((sum, e) => {
      const amt = parseFloat(e.amount_base || e.amount) || 0;
      if (!amt) return sum;
      if (e.split_type === 'equal') {
        const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
        if (parts.includes(currentUserEmail)) return sum + amt / parts.length;
      } else if (e.split_type === 'custom' && e.amounts_by_user?.[currentUserEmail]) {
        const total = Object.values(e.amounts_by_user).reduce((s, v) => s + parseFloat(v || 0), 0);
        const ratio = total > 0 ? parseFloat(e.amounts_by_user[currentUserEmail]) / total : 0;
        return sum + amt * ratio;
      } else if (e.split_with?.includes(currentUserEmail) || e.paid_by === currentUserEmail) {
        const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
        return sum + amt / parts.length;
      }
      return sum;
    }, 0);
  }, [expenses, currentUserEmail]);

  const totalGroup = useMemo(() => expenses.reduce((s, e) => s + (parseFloat(e.amount_base || e.amount) || 0), 0), [expenses]);

  // Days of trip
  const tripDays = useMemo(() => {
    if (!expenses.length) return 1;
    const dates = expenses.map(e => e.date).filter(Boolean).sort();
    if (!dates.length) return 1;
    const diff = Math.max(1, Math.round((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1);
    return diff;
  }, [expenses]);

  const myPerDay = tripDays > 0 ? mySpend / tripDays : mySpend;

  // My spend by category
  const myByCategory = useMemo(() => {
    const acc = {};
    expenses.forEach(e => {
      const amt = parseFloat(e.amount_base || e.amount) || 0;
      if (!amt) return;
      let myShare = 0;
      if (e.split_type === 'equal') {
        const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
        if (parts.includes(currentUserEmail)) myShare = amt / parts.length;
      } else {
        const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
        if (parts.includes(currentUserEmail) || e.paid_by === currentUserEmail) myShare = amt / parts.length;
      }
      if (myShare > 0) acc[e.category || 'other'] = (acc[e.category || 'other'] || 0) + myShare;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [expenses, currentUserEmail]);

  const maxCat = myByCategory[0]?.[1] || 1;

  // Group spend by category (curiosity)
  const groupByCategory = useMemo(() => {
    const acc = {};
    expenses.forEach(e => {
      const cat = e.category || 'other';
      acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount_base || e.amount) || 0);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // By city
  const byCity = useMemo(() => {
    const acc = {};
    expenses.forEach(e => {
      const city = e.city_name || 'Sin ciudad';
      acc[city] = (acc[city] || 0) + (parseFloat(e.amount_base || e.amount) || 0);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border text-center py-16">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm font-medium text-foreground mb-1">Sin estadísticas</p>
        <p className="text-xs text-muted-foreground">Añade gastos para ver el desglose</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mi gasto — PRIMERO */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mi gasto</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total mío</p>
          <p className="text-xl font-medium text-foreground">{fmtAmt(mySpend, baseCurrency)} {s}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Media/día</p>
          <p className="text-xl font-medium text-foreground">{fmtAmt(myPerDay, baseCurrency)} {s}</p>
        </div>
      </div>

      {myByCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Por categoría (mi parte)</p>
          <div className="space-y-3">
            {myByCategory.map(([cat, amt]) => {
              const tc = CAT_CONFIG[cat] || CAT_CONFIG.other;
              const pct = amt / maxCat * 100;
              return (
                <div key={cat} className="flex items-center gap-2.5">
                  <span className="text-base flex-shrink-0">{tc.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{tc.label}</span>
                      <span className="text-muted-foreground">{fmtAmt(amt, baseCurrency)} {s}</span>
                    </div>
                    <div style={{ height: 5, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#c2410c', borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grupo — curiosidad */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grupo (total)</p>
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground">Total grupo</span>
          <span className="text-sm font-medium text-foreground">{fmtAmt(totalGroup, baseCurrency)} {s}</span>
        </div>
        <div className="space-y-2.5">
          {groupByCategory.map(([cat, amt]) => {
            const tc = CAT_CONFIG[cat] || CAT_CONFIG.other;
            const pct = amt / totalGroup * 100;
            return (
              <div key={cat} className="flex items-center gap-2.5">
                <span className="text-base flex-shrink-0">{tc.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{tc.label}</span>
                    <span className="text-muted-foreground">{fmtAmt(amt, baseCurrency)} {s}</span>
                  </div>
                  <div style={{ height: 4, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#f97316', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {byCity.length > 1 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Por ciudad</p>
          <div className="space-y-2">
            {byCity.map(([city, amt]) => (
              <div key={city} className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground">{city}</span>
                <span className="text-sm font-medium text-foreground">{fmtAmt(amt, baseCurrency)} {s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expense detail sheet ──────────────────────────────────────────────────────
function ExpenseDetailSheet({ expense, baseCurrency, userMap, profiles, onClose, onEdit, onDelete }) {
  if (!expense) return null;
  const tc = CAT_CONFIG[expense.category] || CAT_CONFIG.other;
  const isSame = expense.currency === baseCurrency || !expense.currency;
  const s = sym(baseCurrency);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white w-full max-w-lg rounded-t-3xl" onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-4 mb-4" />
          <div className="flex items-start justify-between px-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
                {tc.emoji}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{expense.description}</p>
                <p className="text-xs text-muted-foreground">{tc.label}{expense.date ? ' · ' + expense.date : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Importe */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Importe</span>
              <div className="text-right">
                {!isSame && <p className="text-sm font-medium text-foreground">{sym(expense.currency)}{fmtAmt(parseFloat(expense.amount || 0), expense.currency)}</p>}
                <p className={`${isSame ? 'text-base' : 'text-xs'} font-medium ${isSame ? 'text-foreground' : 'text-primary'}`}>
                  {s}{fmtAmt(parseFloat(expense.amount_base || expense.amount || 0), baseCurrency)}
                </p>
              </div>
            </div>
            {/* Pagó */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Pagó</span>
              <div className="flex items-center gap-2">
                <Avatar email={expense.paid_by} profiles={profiles} size={20} />
                <span className="text-sm text-foreground">{userMap[expense.paid_by] || expense.paid_by?.split('@')[0]}</span>
              </div>
            </div>
            {/* Dividido entre */}
            {expense.split_with?.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-muted-foreground">Dividido entre</span>
                <div className="flex gap-1.5">
                  {expense.split_with.map(email => (
                    <Avatar key={email} email={email} profiles={profiles} size={22} />
                  ))}
                </div>
              </div>
            )}
            {/* Fotos */}
            {expense.receipt_photos?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recibos</p>
                <div className="flex gap-2">
                  {expense.receipt_photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="Recibo" className="w-16 h-16 rounded-lg object-cover border border-border" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border">
            <button onClick={() => setConfirmDelete(true)} className="w-full text-xs text-red-400 hover:text-red-600 py-2.5 text-center">
              Eliminar gasto
            </button>
          </div>
          <div className="flex gap-3 px-5 pb-5 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground">Cerrar</button>
            <button onClick={() => { onClose(); onEdit(expense); }}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
              Editar
            </button>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <p className="text-sm font-medium text-foreground mb-1">¿Eliminar este gasto?</p>
            <p className="text-xs text-muted-foreground mb-5"><strong>{expense.description}</strong> se eliminará permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 border border-border rounded-xl text-sm text-muted-foreground">Cancelar</button>
              <button onClick={() => { onDelete(expense); setConfirmDelete(false); onClose(); }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Expense add/edit sheet ────────────────────────────────────────────────────
function ExpenseSheet({ open, onClose, editingExpense, members, defaultCurrency, baseCurrency, availableCurrencies, userMap, onSave, saving }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">{editingExpense ? 'Editar gasto' : 'Nuevo gasto'}</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ExpenseForm
            members={members}
            initialData={editingExpense}
            defaultCurrency={defaultCurrency}
            baseCurrency={baseCurrency}
            availableCurrencies={availableCurrencies}
            onSave={(data) => { onSave(data); onClose(); }}
            onCancel={onClose}
            saving={saving}
            userMap={userMap}
          />
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Expenses() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { performDelete } = useUndo();

  const [tab, setTab] = useState('gastos');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [detailExpense, setDetailExpense] = useState(null);
  const [currencyBannerDismissed, setCurrencyBannerDismissed] = useState(false);
  const [activeCurrencyOverride, setActiveCurrencyOverride] = useState(null);
  const [prevCityId, setPrevCityId] = useState(null);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId, staleTime: 60000,
  });

  const { cities, activeCity } = useTripContext(tripId);
  const baseCurrency = trip?.base_currency || trip?.currency || 'EUR';
  const activeMeta = getCountryMeta(activeCity?.country_code || activeCity?.country || '');
  const activeLocalCurrency = activeMeta?.currency;
  const availableCurrencies = computeAvailableCurrencies(cities, baseCurrency);
  const members = trip?.members || [];

  // Show banner when active city changes and local currency differs from base
  const showCurrencyBanner = !currencyBannerDismissed &&
    activeLocalCurrency && activeLocalCurrency !== baseCurrency;

  // When city changes, reset banner
  useEffect(() => {
    if (activeCity?.id && activeCity.id !== prevCityId) {
      setPrevCityId(activeCity.id);
      setCurrencyBannerDismissed(false);
    }
  }, [activeCity?.id]);

  const defaultCurrency = activeCurrencyOverride || activeLocalCurrency || baseCurrency;

  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 120000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.filter({}),
    staleTime: 120000,
  });

  const userMap = usersData.reduce((m, u) => { m[u.email] = u.full_name || u.email; return m; }, {});

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId, staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.Expense.create({ ...d, trip_id: tripId, amount: parseFloat(d.amount) }),
    onSuccess: async (_, d) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setSheetOpen(false); setEditingExpense(null);
      const others = (trip?.members || []).filter(e => e !== currentUser?.email);
      if (others.length > 0) {
        try {
          others.forEach(async email => {
            const p = profiles.find(pr => pr.email === email || pr.user_email === email);
            if (p?.user_id) createNotification({ userId: p.user_id, type: 'trip_update', refId: tripId, refTitle: trip?.name || 'el viaje', message: `Nuevo gasto: ${d.description}` });
          });
        } catch {}
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }) => base44.entities.Expense.update(id, { ...d, amount: parseFloat(d.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }); setSheetOpen(false); setEditingExpense(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }),
  });

  const handleSave = d => {
    if (editingExpense) updateMutation.mutate({ id: editingExpense.id, d });
    else createMutation.mutate(d);
  };

  const handleDelete = async expense => {
    const data = { ...expense };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    await performDelete(() => deleteMutation.mutateAsync(expense.id), () => base44.entities.Expense.create(data), expense.description);
  };

  const openAdd = () => { setEditingExpense(null); setSheetOpen(true); };
  const openEdit = e => { setEditingExpense(e); setSheetOpen(true); };

  const handleSettle = async (debt) => {
    // Mark debt as settled — create a settlement expense
    try {
      await createMutation.mutateAsync({
        description: `Liquidación: ${userMap[debt.from] || debt.from?.split('@')[0]} → ${userMap[debt.to] || debt.to?.split('@')[0]}`,
        amount: debt.amount, currency: baseCurrency, amount_base: debt.amount,
        category: 'other', paid_by: debt.from, split_with: [debt.to],
        split_type: 'equal', date: new Date().toISOString().slice(0, 10),
        is_settlement: true,
      });
    } catch {}
  };

  return (
    <div className="bg-background min-h-screen">
      {/* ── Header — same pattern as Restaurants/Translator/Documents ── */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            <button onClick={openAdd} className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Añadir
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Gastos</h1>
          <div className="flex border-b border-border">
            {[['gastos','💸','Gastos'],['balances','⚖️','Balances'],['stats','📊','Stats']].map(([k, em, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 flex flex-col items-center py-2 pb-2.5 gap-0.5 border-b-2 transition-colors ${
                  tab === k ? 'border-primary' : 'border-transparent'
                }`}>
                <span className="text-base leading-none">{em}</span>
                <span className={`text-xs font-medium leading-none ${tab === k ? 'text-primary' : 'text-muted-foreground'}`}>{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-5 pb-24 space-y-4">
        {/* Currency banner */}
        {showCurrencyBanner && (tab === 'gastos') && (
          <CurrencyBanner
            countryName={activeCity?.country || activeCity?.name || ''}
            currencyCode={activeLocalCurrency}
            currencyName={activeMeta?.languageLabel || activeLocalCurrency}
            flag={activeMeta?.flag || '🌍'}
            onAccept={() => { setActiveCurrencyOverride(activeLocalCurrency); setCurrencyBannerDismissed(true); }}
            onDismiss={() => setCurrencyBannerDismissed(true)}
          />
        )}

        {tab === 'gastos' && (
          <GastosTab
            expenses={expenses}
            baseCurrency={baseCurrency}
            userMap={userMap}
            onEdit={e => setDetailExpense(e)}
            onDelete={handleDelete}
            onAdd={openAdd}
            currentUserEmail={currentUser?.email}
          />
        )}

        {tab === 'balances' && (
          <BalancesTab
            expenses={expenses}
            members={members}
            currentUserEmail={currentUser?.email}
            userMap={userMap}
            baseCurrency={baseCurrency}
            profiles={profiles}
            onSettle={handleSettle}
          />
        )}

        {tab === 'stats' && (
          <StatsTab
            expenses={expenses}
            baseCurrency={baseCurrency}
            currentUserEmail={currentUser?.email}
            cities={cities}
          />
        )}
      </div>

      {/* Detail sheet */}
      {detailExpense && (
        <ExpenseDetailSheet
          expense={detailExpense}
          baseCurrency={baseCurrency}
          userMap={userMap}
          profiles={profiles}
          onClose={() => setDetailExpense(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add/edit sheet */}
      <ExpenseSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingExpense(null); }}
        editingExpense={editingExpense}
        members={members}
        defaultCurrency={defaultCurrency}
        baseCurrency={baseCurrency}
        availableCurrencies={availableCurrencies}
        userMap={userMap}
        onSave={handleSave}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
