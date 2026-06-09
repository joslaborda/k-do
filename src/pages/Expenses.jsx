import { createPageUrl } from '@/utils';
import { useState, useEffect, useMemo, useRef, useCallback} from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowRight, X, Trash2, Utensils, Bus, Hotel, Ticket, ShoppingBag, MoreHorizontal, DollarSign, Scale, BarChart2, Compass, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta, computeAvailableCurrencies } from '@/lib/countryConfig';
import { getFxRate } from '@/lib/fxRates';
import { notify, resolveUserIds } from '@/lib/notifications';
import { calculateBalances, getDebts } from '@/lib/expenseBalances';
import ExpenseForm from '@/components/expenses/ExpenseForm';

function OTabBar({ tabs, activeKey, onChange }) {
  const containerRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const updateLine = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.findIndex(t => t.key === activeKey);
    const buttons = containerRef.current.querySelectorAll('button');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const labelEl = btn.querySelector('.tab-label');
    const labelRect = labelEl ? labelEl.getBoundingClientRect() : btnRect;
    setLineStyle({
      left: labelRect.left - containerRect.left,
      width: labelRect.width,
    });
  }, [activeKey, tabs]);

  useEffect(() => {
    updateLine();
    if (!mounted) setTimeout(() => setMounted(true), 50);
  }, [updateLine, mounted]);

  return (
    <div
      ref={containerRef}
      className="relative flex"
      style={{ position: 'relative' }}
    >
      {/* Animated sliding line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: lineStyle.left,
          width: lineStyle.width,
          height: 3,
          background: 'hsl(var(--primary))',
          borderRadius: 2,
          transition: mounted ? 'left 0.25s cubic-bezier(.4,0,.2,1), width 0.25s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      />
      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? 'var(--kodo-text-active)' : 'var(--kodo-nav-inactive)',
                transition: 'color 0.2s',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// ── Category config ───────────────────────────────────────────────────────────
const CAT_ICONS = {
  food:          Utensils,
  transport:     Bus,
  accommodation: Hotel,
  activities:    Ticket,
  shopping:      ShoppingBag,
  drinks:        Wine,
  other:         MoreHorizontal,
};
const CAT_COLORS = {
  food: 'bg-orange-100 text-orange-600', transport: 'bg-blue-100 text-blue-600',
  accommodation: 'bg-purple-100 text-purple-600', activities: 'bg-pink-100 text-pink-600',
  shopping: 'bg-emerald-100 text-emerald-600', drinks: 'bg-pink-100 text-pink-600', other: 'bg-slate-100 text-slate-600',
};
const CAT_CONFIG = {
  food:          { label: 'Comida',      emoji: '🍜' },
  transport:     { label: 'Transporte',  emoji: '🚆' },
  accommodation: { label: 'Alojamiento', emoji: '🏨' },
  activities:    { label: 'Actividades', emoji: '⚡' },
  shopping:      { label: 'Compras',     emoji: '🛍️' },
  drinks:        { label: 'Bebidas',     emoji: '🍷' },
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
  const profile = profiles[email] || null;  // profiles is profilesByEmail map
  const name = profile?.display_name || profile?.username || email || '?';
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
              style={{ flex: 1, background: 'hsl(var(--primary))', color: 'white', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
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
  const paidByName = userMap[expense.paid_by] || expense.paid_by || '?';
  const splitCount = expense.split_with?.length || 1;

  return (
    <button onClick={() => onEdit(expense)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors border-b border-border last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${CAT_COLORS[expense.category] || CAT_COLORS.other}`}>
        {(() => { const I = CAT_ICONS[expense.category] || CAT_ICONS.other; return <I size={16} />; })()}
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
      <div className="bg-card rounded-2xl border border-border text-center py-16 px-6">
        <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-25" />
        <p className="text-sm font-medium text-foreground mb-1">Sin gastos todavía</p>
        <p className="text-xs text-muted-foreground mb-5">Registra los gastos para llevar la cuenta entre todos</p>
        <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm rounded-full font-medium">
          <Plus className="w-4 h-4" />Añadir primer gasto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mi balance */}
      <div className="bg-card rounded-2xl border border-border p-4">
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
      <div className="flex flex-wrap gap-2">
        {[['all', null, 'Todos'], ...Object.entries(CAT_CONFIG).map(([k, v]) => [k, k, v.label])].map(([k, catKey, l]) => (
          <button key={k} onClick={() => setCatFilter(k)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
              catFilter === k ? 'bg-primary text-white border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
            }`}>
            {catKey && CAT_ICONS[catKey] ? (() => { const I = CAT_ICONS[catKey]; return <I size={12} />; })() : <Compass size={12} />} {l}
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
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
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
function BalancesTab({ expenses, members, currentUserEmail, userMap, baseCurrency, profilesByEmail, onSettle }) {
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
      <div className="bg-card rounded-2xl border border-border text-center py-16">
        <Scale className="w-8 h-8 mx-auto mb-3 opacity-25" />
        <p className="text-sm font-medium text-foreground mb-1">Sin datos aún</p>
        <p className="text-xs text-muted-foreground">Añade gastos para ver los balances del grupo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mi balance */}
      <div className={`rounded-2xl border p-4 ${iSettled ? 'bg-card border-border' : myBalance > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs text-muted-foreground mb-1">Tu balance</p>
        <p className={`text-2xl font-medium ${iSettled ? 'text-foreground' : myBalance > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {iSettled ? '✓ Al día' : `${myBalance > 0 ? '+' : ''}${fmtAmt(myBalance, baseCurrency)} ${sym(baseCurrency)}`}
        </p>
        {!iSettled && (
          <p className={`text-xs mt-1 font-medium ${myBalance > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {myBalance > 0 ? 'Te deben este dinero' : 'Debes este dinero'}
          </p>
        )}
        {/* Mi gasto real */}
        {(() => {
          const iPaid = expenses.filter(e => e.paid_by === currentUserEmail).reduce((s, e) => s + (e.amount_base || e.amount || 0), 0);
          const iOweTotal = debts.filter(d => d.from === currentUserEmail).reduce((s, d) => s + d.amount, 0);
          const myRealSpend = iPaid - Math.max(0, myBalance);
          return iPaid > 0 ? (
            <div className="mt-3 pt-3 border-t border-border/50 flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">He pagado</p>
                <p className="text-sm font-medium text-foreground">{fmtAmt(iPaid, baseCurrency)} {sym(baseCurrency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mi parte real</p>
                <p className="text-sm font-medium text-foreground">{fmtAmt(Math.max(0, myRealSpend), baseCurrency)} {sym(baseCurrency)}</p>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* Lo que debo yo — botón "He pagado" para saldar */}
      {iOwe.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tienes que pagar</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {iOwe.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={d.to} profiles={profilesByEmail} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userMap[d.to] || d.to}
                  </p>
                  <p className="text-xs text-red-500 font-medium mt-0.5">Debes {fmtAmt(d.amount, baseCurrency)} {sym(baseCurrency)}</p>
                </div>
                <button onClick={() => onSettle(d)}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-full font-semibold flex-shrink-0">
                  Saldar deuda
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
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {owesMe.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={d.from} profiles={profilesByEmail} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userMap[d.from] || d.from}
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
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {members.map((email, i) => {
            const bal = balances[email] || 0;
            const isMe = email === currentUserEmail;
            const name = userMap[email] || email || '?';
            const total = Math.max(...Object.values(balances).map(Math.abs), 0.01);
            const pct = Math.abs(bal) / total * 100;
            return (
              <div key={email} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <Avatar email={email} profiles={profilesByEmail} size={30} />
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

  // Excluir liquidaciones — no son gastos reales, son transferencias contables
  const realExpenses = useMemo(() => expenses.filter(e => !e.is_settlement), [expenses]);

  // Mi parte real: lo que me toca pagar de los gastos reales
  const mySpend = useMemo(() => {
    return realExpenses.reduce((sum, e) => {
      const amt = parseFloat(e.amount_base || e.amount) || 0;
      if (!amt) return sum;
      const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
      if (e.split_type === 'custom' && e.amounts_by_user?.[currentUserEmail]) {
        const total = Object.values(e.amounts_by_user).reduce((s, v) => s + parseFloat(v || 0), 0);
        return sum + (total > 0 ? (parseFloat(e.amounts_by_user[currentUserEmail]) / total) * amt : 0);
      }
      if (parts.includes(currentUserEmail)) return sum + amt / parts.length;
      return sum;
    }, 0);
  }, [realExpenses, currentUserEmail]);

  // Total real del grupo (sin liquidaciones)
  const totalGroup = useMemo(() =>
    realExpenses.reduce((s, e) => s + (parseFloat(e.amount_base || e.amount) || 0), 0),
  [realExpenses]);

  // Días: usando fechas de gastos reales únicamente
  const tripDays = useMemo(() => {
    const dates = realExpenses.map(e => e.date).filter(Boolean).sort();
    if (!dates.length) return 1;
    return Math.max(1, Math.round((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1);
  }, [realExpenses]);

  const myPerDay = tripDays > 0 ? mySpend / tripDays : mySpend;

  // Mi gasto por categoría (solo gastos reales)
  const myByCategory = useMemo(() => {
    const acc = {};
    realExpenses.forEach(e => {
      const amt = parseFloat(e.amount_base || e.amount) || 0;
      if (!amt) return;
      const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
      if (!parts.includes(currentUserEmail)) return;
      let myShare = 0;
      if (e.split_type === 'custom' && e.amounts_by_user?.[currentUserEmail]) {
        const total = Object.values(e.amounts_by_user).reduce((s, v) => s + parseFloat(v || 0), 0);
        myShare = total > 0 ? (parseFloat(e.amounts_by_user[currentUserEmail]) / total) * amt : 0;
      } else {
        myShare = amt / parts.length;
      }
      if (myShare > 0) acc[e.category || 'other'] = (acc[e.category || 'other'] || 0) + myShare;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [realExpenses, currentUserEmail]);

  const maxCat = myByCategory[0]?.[1] || 1;

  // Grupo por categoría (sin liquidaciones)
  const groupByCategory = useMemo(() => {
    const acc = {};
    realExpenses.forEach(e => {
      const cat = e.category || 'other';
      acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount_base || e.amount) || 0);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [realExpenses]);

  // Por ciudad (sin liquidaciones)
  const byCity = useMemo(() => {
    const acc = {};
    realExpenses.forEach(e => {
      const city = e.city_name || 'Sin ciudad';
      acc[city] = (acc[city] || 0) + (parseFloat(e.amount_base || e.amount) || 0);
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [realExpenses]);

  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border text-center py-16">
        <BarChart2 className="w-8 h-8 mx-auto mb-3 opacity-25" />
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
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total mío</p>
          <p className="text-xl font-medium text-foreground">{fmtAmt(mySpend, baseCurrency)} {s}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Media/día</p>
          <p className="text-xl font-medium text-foreground">{fmtAmt(myPerDay, baseCurrency)} {s}</p>
        </div>
      </div>

      {myByCategory.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Por categoría (mi parte)</p>
          <div className="space-y-3">
            {myByCategory.map(([cat, amt]) => {
              const tc = CAT_CONFIG[cat] || CAT_CONFIG.other;
              const pct = amt / maxCat * 100;
              return (
                <div key={cat} className="flex items-center gap-2.5">
                  {(() => { const I = CAT_ICONS[cat] || CAT_ICONS.other; const col = CAT_COLORS[cat] || CAT_COLORS.other; return <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${col}`}><I size={15} /></div>; })()}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{tc.label}</span>
                      <span className="text-muted-foreground">{fmtAmt(amt, baseCurrency)} {s}</span>
                    </div>
                    <div style={{ height: 5, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'hsl(var(--primary))', borderRadius: 4 }} />
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
      <div className="bg-card rounded-2xl border border-border p-4">
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
                {(() => { const I = CAT_ICONS[cat] || CAT_ICONS.other; const col = CAT_COLORS[cat] || CAT_COLORS.other; return <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${col}`}><I size={15} /></div>; })()}
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
        <div className="bg-card rounded-2xl border border-border p-4">
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
function ExpenseDetailSheet({ expense, baseCurrency, userMap, profilesByEmail, onClose, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!expense) return null;
  const tc = CAT_CONFIG[expense.category] || CAT_CONFIG.other;
  const isSame = expense.currency === baseCurrency || !expense.currency;
  const s = sym(baseCurrency);

  return (
    <>
      <div className="fixed inset-0 flex items-end justify-center bg-black/40" onClick={onClose} style={{zIndex:70}}>
        <div className="bg-card w-full max-w-lg rounded-t-3xl" onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-4 mb-4" />
          <div className="flex items-start justify-between px-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
                {(() => { const I = CAT_ICONS[expense.category] || CAT_ICONS.other; return <I size={16} />; })()}
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
                <Avatar email={expense.paid_by} profiles={profilesByEmail} size={20} />
                <span className="text-sm text-foreground">{userMap[expense.paid_by] || expense.paid_by}</span>
              </div>
            </div>
            {/* Dividido entre */}
            {expense.split_with?.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-muted-foreground">Dividido entre</span>
                <div className="flex gap-1.5">
                  {expense.split_with.map(email => (
                    <Avatar key={email} email={email} profiles={profilesByEmail} size={22} />
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
              className="flex-1 py-2.5 bg-primary text-white rounded-full text-sm font-medium">
              Editar
            </button>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50" onClick={() => setConfirmDelete(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm font-medium text-foreground">¿Eliminar este gasto?</p>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-11">{expense.description} — Se eliminará permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 border border-border rounded-full text-sm text-muted-foreground">Cancelar</button>
              <button onClick={() => { setConfirmDelete(false); onDelete(expense); }} className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Expense add/edit sheet ────────────────────────────────────────────────────
function ExpenseSheet({ open, onClose, editingExpense, members, defaultCurrency, baseCurrency, availableCurrencies, userMap, onSave, saving, currentUserEmail, profilesByEmail }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black/40" onClick={onClose} style={{zIndex:70}}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col" style={{maxHeight:"min(96vh, 700px)"}} onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">{editingExpense ? 'Editar gasto' : 'Nuevo gasto'}</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
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
            currentUserEmail={currentUserEmail}
            profiles={profilesByEmail}
          />
        </div>
        {/* Buttons — outside scroll, always visible */}
        <div className="flex-shrink-0 flex gap-3 px-5 pt-4 pb-8 border-t border-border" style={{paddingBottom:"max(2rem, env(safe-area-inset-bottom, 2rem))"}}>
          <button onClick={onClose}
            className="flex-1 py-3 border border-border rounded-full text-sm text-muted-foreground hover:bg-secondary/50 transition-colors">
            Cancelar
          </button>
          <button
            form="expense-form"
            onClick={() => document.getElementById('expense-form-submit')?.click()}
            className="py-3 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors" style={{flex:2}}>
            {saving ? 'Guardando...' : (editingExpense ? 'Guardar cambios' : 'Guardar gasto')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
// ── Tab: Conversión de divisa ─────────────────────────────────────────────────
function ConversionTab({ cities, baseCurrency, activeCity, homeCurrency = 'EUR' }) {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState(homeCurrency || baseCurrency);
  const [rates, setRates] = useState({});
  const [loadingRates, setLoadingRates] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  // Collect ALL currencies from trip cities, always include baseCurrency
  const allCurrencies = useMemo(() => {
    const set = new Set();
    // Always include user's home currency first
    if (homeCurrency) set.add(homeCurrency);
    set.add(baseCurrency);
    cities.forEach(c => {
      const meta = getCountryMeta(c.country_code || c.country || '');
      if (meta?.currency) set.add(meta.currency);
    });
    // Always show at least EUR and USD
    set.add('EUR'); set.add('USD');
    return Array.from(set);
  }, [cities, homeCurrency, baseCurrency]);

  const activeMeta = getCountryMeta(activeCity?.country_code || activeCity?.country || '');
  const activeCurrency = activeMeta?.currency;

  // Currencies to convert TO (everything except fromCurrency)
  const targetCurrencies = allCurrencies.filter(c => c !== fromCurrency);

  useEffect(() => {
    if (targetCurrencies.length === 0) return;
    setLoadingRates(true);
    Promise.all(targetCurrencies.map(to => getFxRate(fromCurrency, to).then(r => [to, r.rate])))
      .then(pairs => {
        const obj = {};
        pairs.forEach(([k, v]) => { obj[k] = v; });
        setRates(obj);
        setLastFetch(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(() => {})
      .finally(() => setLoadingRates(false));
  }, [fromCurrency, targetCurrencies.join(',')]);

  // Reset fromCurrency if baseCurrency changes
  useEffect(() => { setFromCurrency(homeCurrency || baseCurrency); }, [homeCurrency, baseCurrency]);

  const numeric = parseFloat(amount) || 0;

  return (
    <div className="space-y-3">
      {/* Amount + from currency */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground mb-2">Convertir desde</p>
        <div className="flex items-center gap-2">
          <select
            value={fromCurrency}
            onChange={e => { setFromCurrency(e.target.value); setRates({}); }}
            className="h-12 border border-border rounded-xl px-3 text-sm font-medium text-foreground outline-none focus:border-primary bg-secondary appearance-none"
          >
            {allCurrencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex-1 flex items-center h-12 border border-border rounded-xl px-3 focus-within:border-primary transition-colors">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 text-lg font-semibold text-foreground outline-none bg-transparent"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        {lastFetch && (
          <p className="text-xs text-muted-foreground mt-2">Tasas actualizadas a las {lastFetch}</p>
        )}
      </div>

      {/* Results */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loadingRates ? (
          <div className="py-8 text-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          targetCurrencies.map((currency, i) => {
            const rate = rates[currency];
            const converted = rate ? (numeric * rate).toFixed(2) : '—';
            const isActive = currency === activeCurrency;
            return (
              <div key={currency}
                className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''} ${isActive ? 'bg-orange-50/40' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{getCountryMeta(currency)?.flag || '💱'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{currency}</p>
                    {isActive && <p className="text-xs text-primary font-medium">Ciudad actual</p>}
                    {rate && <p className="text-xs text-muted-foreground">1 {fromCurrency} = {rate.toFixed(4)} {currency}</p>}
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">{converted}</p>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center px-4">
        Fuente: Banco Central Europeo · Solo orientativo
      </p>
    </div>
  );
}


export default function Expenses() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user: currentUser } = useAuth();
  const currentUserEmail = currentUser?.email ?? '';
  const queryClient = useQueryClient();

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

  // Fetch user profile to get home currency as fallback
  const { data: myProfile_ } = useQuery({
    queryKey: ['myProfile_exp', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const r = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return r[0] || null;
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  // baseCurrency: trip field > user home currency > EUR
  const baseCurrency = trip?.base_currency || trip?.currency ||
    myProfile_?.home_currency || 'EUR';
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
    staleTime: 0,
  });

  const userMap = useMemo(() => {
    const m = {};
    (usersData || []).forEach(u => {
      const prof = (profiles || []).find(p => p.user_id === u.id);
      m[u.email] = prof?.display_name || prof?.username || u.full_name || u.email || u.email;
    });
    return m;
  }, [usersData, profiles]);
  // Build profilesByEmail: cross-reference usersData (has email) with profiles (has user_id + avatar_url)
  const profilesByEmail = useMemo(() => {
    const map = {};
    // Primero por user_id (más preciso)
    (usersData || []).forEach(u => {
      const prof = (profiles || []).find(p => p.user_id === u.id);
      if (prof) map[u.email] = prof;
    });
    // Fallback: buscar por email directamente en profiles
    (profiles || []).forEach(p => {
      const email = p.email || p.user_email;
      if (email && !map[email]) map[email] = p;
    });
    return map;
  }, [profiles, usersData]);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId, staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.Expense.create({ ...d, trip_id: tripId, amount: parseFloat(d.amount) }),
    onError: () => alert('Error al guardar el gasto. Inténtalo de nuevo.'),
    onSuccess: async (_, d) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setSheetOpen(false); setEditingExpense(null);
      const others = (trip?.members || []).filter(e => e !== currentUser?.email);
      if (others.length > 0) {
        resolveUserIds(others).then(resolved => {
          resolved.forEach(({ userId }) => notify({
            userId,
            type: 'expense_added',
            actor: myProfile_,
            tripId,
            tripName: trip?.name,
            refTitle: d.description || 'gasto',
          }));
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }) => base44.entities.Expense.update(id, { ...d, amount: parseFloat(d.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses', tripId] }); setSheetOpen(false); setEditingExpense(null); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    onError: () => alert('Error al actualizar el gasto.'),
  });

  const [pendingDeleteClose, setPendingDeleteClose] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setDetailExpense(null); // close sheet after confirmed delete
    },
    onError: () => alert('Error al eliminar el gasto.'),
  });

  const handleSave = d => {
    if (editingExpense) updateMutation.mutate({ id: editingExpense.id, d });
    else createMutation.mutate(d);
  };

  const handleDelete = (expense) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(expense.id);
  };

  const openAdd = () => { setEditingExpense(null); setSheetOpen(true); };
  const openEdit = e => { setEditingExpense(e); setSheetOpen(true); };

  const handleSettle = async (debt) => {
    // Mark debt as settled — create a settlement expense
    try {
      await createMutation.mutateAsync({
        description: `Liquidación: ${userMap[debt.from] || debt.from} → ${userMap[debt.to] || debt.to}`,
        amount: debt.amount, currency: baseCurrency, amount_base: debt.amount,
        category: 'other', paid_by: debt.from, split_with: [debt.to],
        split_type: 'equal', date: new Date().toISOString().slice(0, 10),
        is_settlement: true,
      });
      // Notificar a quien le deben que le han liquidado
      try {
        const resolved = await resolveUserIds([debt.to]);
        const allProfiles = await base44.entities.UserProfile.list();
        const myProf = allProfiles.find(p => p.user_id === currentUser?.id);
        resolved.forEach(({ userId }) => notify({
          userId,
          type: 'expense_settled',
          actor: myProf,
          tripId,
          tripName: trip?.name,
          refExtra: { amount: debt.amount, currency: baseCurrency },
        }));
      } catch {}
    } catch {}
  };

  return (
    <div className="bg-background min-h-screen">
      {/* ── Header — same pattern as Restaurants/Translator/Documents ── */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            <button onClick={openAdd} className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Gasto
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Gastos</h1>
          <OTabBar
            tabs={[{key:'gastos',label:'Gastos'},{key:'balances',label:'Balances'},...(availableCurrencies.length > 1 ? [{key:'conversión',label:'Conversión'}] : []),{key:'stats',label:'Stats'}]}
            activeKey={tab}
            onChange={setTab}
          />
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
            profilesByEmail={profilesByEmail}
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

        {tab === 'conversión' && (
          <ConversionTab
            cities={cities}
            baseCurrency={baseCurrency}
            activeCity={activeCity}
            homeCountry={myProfile_?.home_country}
            homeCurrency={myProfile_?.home_currency || 'EUR'}
          />
        )}
      </div>

      {/* Detail sheet */}
      {detailExpense && (
        <ExpenseDetailSheet
          expense={detailExpense}
          baseCurrency={baseCurrency}
          userMap={userMap}
          profilesByEmail={profilesByEmail}
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
        currentUserEmail={currentUserEmail}
        profiles={profilesByEmail}
      />
    </div>
  );
}