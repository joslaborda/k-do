import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'food', label: '🍽️ Comida' },
  { value: 'transport', label: '🚗 Transporte' },
  { value: 'accommodation', label: '🏨 Alojamiento' },
  { value: 'activities', label: '🎭 Actividades' },
  { value: 'shopping', label: '🛍️ Compras' },
  { value: 'other', label: '📦 Otro' },
];

export default function ExpenseForm({
  members = [],
  initialData = null,
  onSave,
  onCancel,
  saving = false,
  userMap = {},
}) {
  const getName = (email) => userMap[email] || email;
  const [form, setForm] = useState(
    initialData || {
      description: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      paid_by: members[0] || '',
      split_type: 'equal',
      split_with: members || [],
      amounts_by_user: {},
    }
  );

  const [customAmounts, setCustomAmounts] = useState(
    initialData?.amounts_by_user || {}
  );

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleMember = (email) => {
    setForm(prev => ({
      ...prev,
      split_with: prev.split_with.includes(email)
        ? prev.split_with.filter(e => e !== email)
        : [...prev.split_with, email],
    }));
  };

  const updateCustomAmount = (email, value) => {
    const num = parseFloat(value) || 0;
    setCustomAmounts(prev => ({ ...prev, [email]: num }));
  };

  const equalSplit = () => {
    if (!form.amount || form.split_with.length === 0) return 0;
    return (parseFloat(form.amount) / form.split_with.length).toFixed(2);
  };

  const customTotal = Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const amountMismatch = form.split_type === 'custom' && 
    Math.abs(customTotal - parseFloat(form.amount || 0)) > 0.01;

  const canSave = 
    form.description.trim() && 
    form.amount && 
    parseFloat(form.amount) > 0 &&
    form.split_with.length > 0 &&
    !amountMismatch &&
    !saving;

  const handleSave = () => {
    if (form.split_type === 'custom') {
      onSave({ ...form, amounts_by_user: customAmounts });
    } else {
      onSave(form);
    }
  };

  return (
    <div className="space-y-5">
      {/* Descripción */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Descripción *
        </label>
        <Input
          placeholder="ej. Cena en Dotonbori"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="bg-input border-border"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Importe */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Importe *
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            step="0.01"
            className="bg-input border-border"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Categoría
          </label>
          <Select value={form.category} onValueChange={(v) => set('category', v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Fecha */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Fecha
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="bg-input border-border"
          />
        </div>

        {/* Quién paga */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Quién paga *
          </label>
          <Select value={form.paid_by} onValueChange={(v) => set('paid_by', v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {members.map((email) => (
                <SelectItem key={email} value={email}>
                  {getName(email)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* División */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Dividir gasto
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              set('split_type', 'equal');
              setCustomAmounts({});
            }}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              form.split_type === 'equal'
                ? 'bg-orange-700 text-white border-orange-700'
                : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            A partes iguales
          </button>
          <button
            type="button"
            onClick={() => set('split_type', 'custom')}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              form.split_type === 'custom'
                ? 'bg-orange-700 text-white border-orange-700'
                : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {/* Seleccionar participantes */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Dividir entre *
        </label>
        <div className="space-y-2 bg-secondary/30 rounded-lg p-3 max-h-48 overflow-y-auto">
          {members.map((email) => (
            <label
              key={email}
              className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors"
            >
              <Checkbox
                checked={form.split_with.includes(email)}
                onCheckedChange={() => toggleMember(email)}
              />
              <span className="text-sm text-foreground">{getName(email)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mostrar división igual */}
      {form.split_type === 'equal' && form.split_with.length > 0 && form.amount && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-orange-900 mb-2">
            División: {equalSplit()}€ por persona
          </p>
          <div className="space-y-1">
            {form.split_with.map((email) => (
              <div key={email} className="text-xs text-orange-700 flex justify-between">
                <span>{getName(email)}</span>
                <span className="font-semibold">{equalSplit()}€</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* División personalizada */}
      {form.split_type === 'custom' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Especifica cuánto paga cada persona (total debe ser {form.amount}€)
          </p>
          <div className="space-y-2 bg-secondary/30 rounded-lg p-3 max-h-48 overflow-y-auto">
            {form.split_with.map((email) => (
              <div key={email} className="flex items-center gap-2">
                <span className="text-sm text-foreground flex-1 truncate">{getName(email)}</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmounts[email] || ''}
                  onChange={(e) => updateCustomAmount(email, e.target.value)}
                  step="0.01"
                  className="w-20 h-8 bg-input border-border text-sm"
                />
                <span className="text-sm text-muted-foreground w-4">€</span>
              </div>
            ))}
          </div>

          {amountMismatch && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs font-semibold text-red-700">
                ❌ Total: {customTotal.toFixed(2)}€ (debe ser {form.amount}€)
              </p>
            </div>
          )}

          {!amountMismatch && customTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs font-semibold text-green-700">
                ✓ Total: {customTotal.toFixed(2)}€
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border hover:bg-secondary/50"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="bg-orange-700 hover:bg-orange-800"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </div>
  );
}