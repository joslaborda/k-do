import { BusFront } from '@/lib/icons';
import { useState, useRef, useEffect } from 'react';
import { Loader2, Camera, Upload, X, Utensils, Hotel, Ticket, ShoppingBag, CirclePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { convertAmount } from '@/lib/fxRates';

const CATEGORIES = [
  { value: 'food',          label: 'Comida',      Icon: Utensils    },
  { value: 'transport',     label: 'Transporte',  Icon: BusFront         },
  { value: 'accommodation', label: 'Alojamiento', Icon: Hotel       },
  { value: 'activities',    label: 'Actividades', Icon: Ticket      },
  { value: 'shopping',      label: 'Compras',     Icon: ShoppingBag },
  { value: 'other',         label: 'Otro',        Icon: CirclePlus  },
];

const COMMON_CURRENCIES = [
  'EUR','GBP','JPY','CNY','CHF','MXN','ARS','BRL','THB','KRW','VND','MAD',
  'TRY','SGD','IDR','CAD','AUD','INR','MYR','PHP','ZAR','CLP','PEN','AED','SAR',
  'NOK','SEK','DKK','PLN','CZK','HUF','NZD','KES','RUB','EGP','CRC','COP',
];

export default function ExpenseForm({
  members = [],
  initialData = null,
  defaultCurrency = 'EUR',
  baseCurrency = 'EUR',
  availableCurrencies = [],
  onSave,
  onCancel,
  saving = false,
  userMap = {},
  currentUserEmail = '',
  profiles = {},
  profilesByEmail,
}) {
  const getName = email => userMap[email] || email || email || '?';
  const profileMap = profilesByEmail || profiles || {};

  const orderedCurrencies = [...new Set([defaultCurrency, baseCurrency, ...availableCurrencies, ...COMMON_CURRENCIES])];

  const [form, setForm] = useState(initialData || {
    description: '',
    amount: '',
    currency: defaultCurrency,
    category: 'food',
    date: new Date().toISOString().slice(0, 10),
    paid_by: members[0] || '',
    split_type: 'equal',
    split_with: [...members],
    amounts_by_user: {},
  });

  const [receipts, setReceipts] = useState(initialData?.receipt_photos || []);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [converting, setConverting] = useState(false);
  const [fxInfo, setFxInfo] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const currency = form.currency || defaultCurrency;
  const isSameCurrency = currency === baseCurrency;

  // Auto-convert on amount/currency change
  useEffect(() => {
    if (!form.amount || parseFloat(form.amount) <= 0 || isSameCurrency) { setFxInfo(null); return; }
    const t = setTimeout(async () => {
      setConverting(true);
      try {
        const r = await convertAmount(parseFloat(form.amount), currency, baseCurrency, form.date || null);
        setFxInfo(r);
      } catch { setFxInfo(null); }
      finally { setConverting(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [form.amount, currency, baseCurrency, form.date, isSameCurrency]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleMember = email => {
    setForm(p => ({
      ...p,
      split_with: p.split_with.includes(email)
        ? p.split_with.filter(e => e !== email)
        : [...p.split_with, email],
    }));
  };

  const selectAll = () => set('split_with', [...members]);
  const selectNone = () => set('split_with', []);

  const equalShare = () => {
    if (!form.amount || form.split_with.length === 0) return null;
    const isZeroDecimal = ['JPY','KRW','VND','IDR'].includes(currency);
    const share = parseFloat(form.amount) / form.split_with.length;
    return isZeroDecimal ? Math.round(share).toLocaleString('es') : share.toFixed(2);
  };

  const handleReceiptUpload = async file => {
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReceipts(p => [...p, file_url]);
    } finally { setUploadingReceipt(false); }
  };

  const canSave = form.description.trim() && form.amount && parseFloat(form.amount) > 0 && !saving && (
    form.split_type === 'solo' ||
    (form.split_type === 'equal' && form.split_with.length > 0) ||
    (form.split_type === 'custom' && Object.values(form.amounts_by_user||{}).some(v => parseFloat(v) > 0))
  );

  const handleSave = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Introduce un importe para guardar el gasto.');
      return;
    }
    if (!form.description.trim()) {
      alert('Añade una descripción al gasto.');
      return;
    }
    if (!form.paid_by) {
      alert('Indica quién pagó el gasto.');
      return;
    }
    let amountBase = parseFloat(form.amount);
    let fxRate = 1, fxSource = 'same', fxTimestamp = new Date().toISOString();
    if (!isSameCurrency) {
      if (fxInfo) {
        amountBase = fxInfo.amountConverted; fxRate = fxInfo.rate; fxSource = fxInfo.source; fxTimestamp = fxInfo.fetchedAt;
      } else {
        try {
          const r = await convertAmount(parseFloat(form.amount), currency, baseCurrency, form.date || null);
          amountBase = r.amountConverted; fxRate = r.rate; fxSource = r.source; fxTimestamp = r.fetchedAt;
        } catch {}
      }
    }
    const splitWith = form.split_type === 'custom'
      ? Object.entries(form.amounts_by_user||{}).filter(([,v]) => parseFloat(v) > 0).map(([e]) => e)
      : form.split_with;
    onSave({ ...form, split_with: splitWith, currency, amount_base: amountBase, fx_rate_to_base: fxRate, fx_source: fxSource, fx_timestamp: fxTimestamp, receipt_photos: receipts });
  };

  return (
    <div className="space-y-5">

      {/* Importe + conversión — cantidad domina, moneda secundaria */}
      <div className="bg-secondary rounded-2xl py-6 px-4 text-center">
        {/* Cantidad — grande y centrada */}
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={form.amount}
          onChange={e => {
            const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
            set('amount', val);
          }}
          autoFocus
          className="text-5xl font-bold text-center bg-transparent outline-none text-foreground placeholder:text-border w-full mb-1"
          style={{ letterSpacing: '-1px' }}
        />
        <div className="w-16 h-0.5 bg-primary rounded-full mx-auto mb-4" />

        {/* Moneda — píldora pequeña como selector secundario */}
        <div className="flex items-center justify-center gap-3">
          <div className="relative inline-flex items-center">
            <select
              value={currency}
              onChange={e => set('currency', e.target.value)}
              className="appearance-none bg-card border border-border rounded-full pl-3 pr-7 py-1.5 text-xs font-semibold text-muted-foreground outline-none focus:border-primary cursor-pointer"
            >
              {orderedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <svg className="absolute right-2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {/* FX inline */}
          {!isSameCurrency && form.amount && parseFloat(form.amount) > 0 && (
            <span className="text-xs text-muted-foreground">
              {converting
                ? '...'
                : fxInfo
                  ? `≈ ${fxInfo.amountConverted.toLocaleString('es')} ${baseCurrency}`
                  : ''}
            </span>
          )}
        </div>
      </div>

      {/* Descripción + recibos */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <input
            placeholder="Descripción del gasto *"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="flex-1 text-sm text-foreground placeholder-muted-foreground bg-transparent outline-none"
          />
          <div className="flex gap-1.5 flex-shrink-0">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingReceipt}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-orange-50 transition-colors disabled:opacity-40">
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={uploadingReceipt}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-orange-50 transition-colors disabled:opacity-40">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {receipts.length > 0 && (
          <div className="flex gap-2 px-4 py-3 flex-wrap">
            {receipts.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="Recibo" className="w-14 h-14 rounded-lg object-cover border border-border" />
                <button onClick={() => setReceipts(p => p.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {uploadingReceipt && (
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])} />

      {/* Fecha */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha</p>
        <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
          className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-card text-foreground" />
      </div>

      {/* Categoría */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Categoría</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.value} type="button" onClick={() => set('category', c.value)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.category === c.value ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}>
              <c.Icon size={13} />{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quién paga */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Pagó</p>
        <div className="flex gap-2 flex-wrap">
          {members.map(email => (
            <button key={email} type="button" onClick={() => set('paid_by', email)}
              className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                form.paid_by === email ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:border-primary/40'
              }`}>
              {(() => {
                const prof = profileMap?.[email] || null;
                return prof?.avatar_url
                  ? <img src={prof.avatar_url} alt="" style={{width:24,height:24,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                  : <div style={{width:24,height:24,borderRadius:'50%',background:form.paid_by===email?'var(--kodo-bg-orange-mid)':'var(--kodo-progress-track)',color:form.paid_by===email?'hsl(var(--primary))':'var(--kodo-text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:500,flexShrink:0}}>
                      {getName(email).slice(0,2).toUpperCase()}
                    </div>;
              })()}
              <span className={`text-xs truncate font-medium ${form.paid_by === email ? 'text-primary' : 'text-muted-foreground'}`}>
                {email === (currentUserEmail || members[0]) ? 'Tú' : getName(email)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* División */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Dividir entre</p>
        {/* Mode selector */}
        <div className="flex rounded-xl border border-border overflow-hidden mb-3 text-sm">
          {[
            { key: 'equal', label: 'A partes iguales' },
            { key: 'custom', label: 'Personalizado' },
            { key: 'solo', label: 'Solo yo' },
          ].map(m => (
            <button key={m.key} type="button"
              onClick={() => {
                set('split_type', m.key);
                if (m.key === 'equal') set('split_with', [...members]);
                if (m.key === 'solo') { set('split_with', [form.paid_by || members[0]]); }
                if (m.key === 'custom') {
                  const eq = form.amount ? (parseFloat(form.amount) / members.length).toFixed(2) : '';
                  const init = members.reduce((a, e) => ({ ...a, [e]: eq }), {});
                  set('amounts_by_user', init); set('split_with', [...members]);
                }
              }}
              className={`flex-1 py-2 font-medium transition-colors text-xs ${
                form.split_type === m.key ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {form.split_type === 'equal' && (
          <div className="flex gap-2 flex-wrap">
            {members.map(email => {
              const selected = form.split_with.includes(email);
              const share = selected && form.split_with.length > 0 && form.amount
                ? (parseFloat(form.amount) / form.split_with.length) : null;
              const isZeroDecimal = ['JPY','KRW','VND','IDR'].includes(currency);
              const shareStr = share ? (isZeroDecimal ? Math.round(share).toLocaleString('es') : share.toFixed(2)) : null;
              const sp = profileMap?.[email];
              return (
                <button key={email} type="button" onClick={() => toggleMember(email)}
                  className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${
                    selected ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:border-primary/40'
                  }`}>
                  {sp?.avatar_url
                    ? <img src={sp.avatar_url} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}} />
                    : <div style={{width:28,height:28,borderRadius:'50%',background:selected?'var(--kodo-bg-orange-mid)':'var(--kodo-progress-track)',color:selected?'hsl(var(--primary))':'var(--kodo-text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500}}>
                        {getName(email).slice(0,2).toUpperCase()}</div>}
                  <span className={`text-xs font-medium truncate max-w-full ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {email === (currentUserEmail || members[0]) ? 'Tú' : getName(email)}
                  </span>
                  {shareStr && <span className="text-xs text-primary font-medium">{shareStr} {currency}</span>}
                </button>
              );
            })}
          </div>
        )}

        {form.split_type === 'custom' && (
          <div className="space-y-2">
            {members.map(email => {
              const sp = profileMap?.[email];
              return (
                <div key={email} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-card">
                  {sp?.avatar_url
                    ? <img src={sp.avatar_url} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                    : <div style={{width:28,height:28,borderRadius:'50%',background:'var(--kodo-progress-track)',color:'var(--kodo-text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,flexShrink:0}}>
                        {getName(email).slice(0,2).toUpperCase()}</div>}
                  <span className="text-xs font-medium text-foreground flex-1 truncate">
                    {email === (currentUserEmail || members[0]) ? 'Tú' : getName(email)}
                  </span>
                  <input
                    type="number" min="0" step="any" placeholder="0"
                    value={form.amounts_by_user?.[email] || ''}
                    onChange={e => set('amounts_by_user', { ...form.amounts_by_user, [email]: e.target.value })}
                    className="w-20 text-right text-sm border border-border rounded-lg px-2 py-1 outline-none focus:border-primary bg-secondary"
                  />
                  <span className="text-xs text-muted-foreground">{currency}</span>
                </div>
              );
            })}
            {(() => {
              const total = Object.values(form.amounts_by_user || {}).reduce((s,v) => s + parseFloat(v||0), 0);
              const diff = parseFloat(form.amount||0) - total;
              return Math.abs(diff) > 0.01 ? (
                <p className="text-xs text-amber-600 mt-1">Faltan {Math.abs(diff).toFixed(2)} {currency} por asignar</p>
              ) : total > 0 ? (
                <p className="text-xs text-green-600 mt-1">Total cuadra</p>
              ) : null;
            })()}
          </div>
        )}

        {form.split_type === 'solo' && (
          <p className="text-xs text-muted-foreground bg-secondary rounded-xl px-3 py-2">
            Este gasto es solo para ti. No afecta a los balances del grupo.
          </p>
        )}

        {form.split_type === 'equal' && form.split_with.length === 0 && (
          <p className="text-xs text-red-500 mt-2">Selecciona al menos una persona</p>
        )}
      </div>

      {/* Botones */}
    {/* Hidden submit trigger for ExpenseSheet */}
    <button id="expense-form-submit" type="button" onClick={handleSave} style={{display:'none'}} />
    </div>
  );
}
