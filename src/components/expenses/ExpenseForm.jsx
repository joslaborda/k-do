import { useState, useRef, useEffect } from 'react';
import { Loader2, Camera, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { convertAmount } from '@/lib/fxRates';

const CATEGORIES = [
  { value: 'food',          label: '🍜 Comida' },
  { value: 'transport',     label: '🚆 Transporte' },
  { value: 'accommodation', label: '🏨 Alojamiento' },
  { value: 'activities',    label: '⚡ Actividades' },
  { value: 'shopping',      label: '🛍️ Compras' },
  { value: 'other',         label: '💰 Otro' },
];

const COMMON_CURRENCIES = [
  'EUR','USD','GBP','JPY','CNY','CHF','MXN','ARS','BRL','THB','KRW','VND','MAD',
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
  profiles = [],
}) {
  const getName = email => userMap[email] || email?.split('@')[0] || email || '?';

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

  const canSave = form.description.trim() && form.amount && parseFloat(form.amount) > 0 && form.split_with.length > 0 && !saving;

  const handleSave = async () => {
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
    onSave({ ...form, currency, amount_base: amountBase, fx_rate_to_base: fxRate, fx_source: fxSource, fx_timestamp: fxTimestamp, receipt_photos: receipts });
  };

  return (
    <>
    <div className="space-y-5">

      {/* Importe + conversión */}
      <div className="bg-secondary rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-3">Importe</p>
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Currency selector inline */}
          <select value={currency} onChange={e => set('currency', e.target.value)}
            className="border border-border rounded-xl px-2 py-1.5 text-sm bg-card outline-none focus:border-primary h-9">
            {orderedCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)}
            step="any"
            className="text-2xl font-medium text-center border-none bg-transparent outline-none text-foreground w-32"
          />
        </div>
        {/* FX preview */}
        {!isSameCurrency && form.amount && parseFloat(form.amount) > 0 && (
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
            {converting
              ? <><Loader2 className="w-3 h-3 animate-spin text-primary" /><span className="text-xs text-primary">Calculando...</span></>
              : fxInfo
                ? <span className="text-xs text-primary font-medium">= {fxInfo.amountConverted.toLocaleString('es')} {baseCurrency}</span>
                : <span className="text-xs text-muted-foreground">tipo real</span>
            }
          </div>
        )}
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
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.category === c.value ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'
              }`}>
              {c.label}
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
                const prof = profiles.find(p => p.email === email || p.user_email === email);
                return prof?.avatar_url
                  ? <img src={prof.avatar_url} alt="" style={{width:24,height:24,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                  : <div style={{width:24,height:24,borderRadius:'50%',background:form.paid_by===email?'#fbd5c0':'#f0ede8',color:form.paid_by===email?'#b34a1a':'#888',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:500,flexShrink:0}}>
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
        {/* Toggle */}
        <div className="flex rounded-xl border border-border overflow-hidden mb-3">
          <button type="button" onClick={selectAll}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.split_with.length === members.length ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-secondary/50'
            }`}>
            Todos por igual
          </button>
          <button type="button" onClick={() => { if (form.split_with.length === members.length) selectNone(); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.split_with.length !== members.length ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-secondary/50'
            }`}>
            Seleccionar
          </button>
        </div>

        {/* Members selection */}
        <div className="flex gap-2 flex-wrap">
          {members.map(email => {
            const selected = form.split_with.includes(email);
            const share = selected && form.split_with.length > 0 && form.amount
              ? (parseFloat(form.amount) / form.split_with.length)
              : null;
            const isZeroDecimal = ['JPY','KRW','VND','IDR'].includes(currency);
            const shareStr = share ? (isZeroDecimal ? Math.round(share).toLocaleString('es') : share.toFixed(2)) : null;
            return (
              <button key={email} type="button" onClick={() => toggleMember(email)}
                className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${
                  selected ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-card border-border hover:border-primary/40'
                }`}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: selected ? '#fbd5c0' : '#f0ede8',
                  color: selected ? '#b34a1a' : '#888',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 500,
                }}>
                  {getName(email).slice(0, 2).toUpperCase()}
                </div>
                <span className={`text-xs font-medium truncate max-w-full ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                  {email === (currentUserEmail || members[0]) ? 'Tú' : getName(email)}
                </span>
                {shareStr && <span className="text-xs text-primary font-medium">{shareStr}</span>}
              </button>
            );
          })}
        </div>
        {form.split_with.length === 0 && (
          <p className="text-xs text-red-500 mt-2">Selecciona al menos una persona</p>
        )}
      </div>

      {/* Botones */}
      <div className="h-20" />
    </div>
    <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex gap-3">
      <button type="button" onClick={onCancel}
        className="flex-1 py-3 border border-border rounded-full text-sm text-muted-foreground hover:bg-secondary/50 transition-colors">
        Cancelar
      </button>
      <button type="button" onClick={handleSave} disabled={!canSave}
        className="py-3 bg-primary text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors" style={{flex:2}}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Guardando...</> : 'Guardar gasto'}
      </button>
    </div>
  </>;
}
