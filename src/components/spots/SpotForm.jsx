import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TYPES = [
  { value: 'food',      label: 'Comida',     emoji: '🍜' },
  { value: 'sight',     label: 'Atracción',  emoji: '🏛️' },
  { value: 'activity',  label: 'Actividad',  emoji: '⚡' },
  { value: 'shopping',  label: 'Compras',    emoji: '🛍️' },
  { value: 'transport', label: 'Transporte', emoji: '🚆' },
  { value: 'custom',    label: 'Otro',       emoji: '⭐' },
];

const VISIBILITY_OPTIONS = [
  { value: 'trip_members', label: '👥 Todo el grupo' },
  { value: 'personal',     label: '🔒 Solo yo' },
  { value: 'selected_users', label: '👤 Personas específicas' },
];

const DEFAULT_FORM = {
  title: '', type: 'food', notes: '', link: '', address: '',
  visibility: 'trip_members', shared_with: [],
};

export default function SpotForm({ open, onOpenChange, onSubmit, isPending, tripMembers = [] }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [membersInput, setMembersInput] = useState('');

  const handleClose = () => {
    setForm({ ...DEFAULT_FORM });
    setMembersInput('');
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.type) return;
    onSubmit(form);
    handleClose();
  };

  const toggleMember = (email) => {
    setForm((prev) => {
      const already = prev.shared_with.includes(email);
      return {
        ...prev,
        shared_with: already
          ? prev.shared_with.filter((e) => e !== email)
          : [...prev.shared_with, email],
      };
    });
  };

  const canSubmit = form.title.trim() && form.type &&
    (form.visibility !== 'selected_users' || form.shared_with.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">📍 Añadir Spot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre *</label>
            <Input
              placeholder="ej. Ramen Ichiran, Fushimi Inari…"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Type chips */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tipo *</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.type === t.value
                      ? 'bg-orange-700 text-white border-orange-700'
                      : 'bg-white text-foreground border-border hover:border-orange-300'
                  }`}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Notas</label>
            <Textarea
              placeholder="Horarios, precio, recomendaciones…"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Enlace (web, reserva…)</label>
            <Input
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Dirección</label>
            <Input
              placeholder="ej. 1-2-3 Shinjuku, Tokyo"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Visibilidad</label>
            <div className="flex flex-col gap-2">
              {VISIBILITY_OPTIONS.map((v) => (
                <label key={v.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value={v.value}
                    checked={form.visibility === v.value}
                    onChange={() => setForm((p) => ({ ...p, visibility: v.value, shared_with: [] }))}
                    className="accent-orange-700"
                  />
                  <span className="text-sm">{v.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected users picker */}
          {form.visibility === 'selected_users' && tripMembers.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-orange-700">Selecciona quién puede verlo:</p>
              {tripMembers.map((email) => (
                <label key={email} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.shared_with.includes(email)}
                    onChange={() => toggleMember(email)}
                    className="accent-orange-700"
                  />
                  <span className="text-sm text-foreground">{email}</span>
                </label>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-700 hover:bg-orange-800 text-white"
              disabled={!canSubmit || isPending}
            >
              {isPending ? 'Guardando…' : 'Guardar Spot'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}