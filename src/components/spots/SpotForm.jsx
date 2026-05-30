import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Image, X, Loader2 } from 'lucide-react';

const TYPES = [
  { value: 'food',      label: 'Comida',     emoji: '🍜' },
  { value: 'sight',     label: 'Atracción',  emoji: '🏛️' },
  { value: 'activity',  label: 'Actividad',  emoji: '⚡' },
  { value: 'shopping',  label: 'Compras',    emoji: '🛍️' },
  { value: 'transport', label: 'Transporte', emoji: '🚆' },
  { value: 'custom',    label: 'Otro',       emoji: '⭐' },
];

const VISIBILITY_OPTIONS = [
  { value: 'trip_members', label: 'Todo el grupo' },
  { value: 'personal',     label: 'Solo yo' },
  { value: 'community',    label: 'Comunidad' },
];

const DEFAULT_FORM = {
  title: '', type: 'food', notes: '', link: '', address: '',
  visibility: 'trip_members', shared_with: [], image_url: null, tags: [],
};

export default function SpotForm({ open, onOpenChange, onSubmit, isPending, tripMembers = [] }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef(null);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const tag = tagInput.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '_');
      if (tag && !form.tags.includes(tag)) {
        setForm(f => ({ ...f, tags: [...f.tags, tag] }));
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setForm(f => ({ ...f, tags: f.tags.slice(0, -1) }));
    }
  };

  const handleClose = () => {
    setForm({ ...DEFAULT_FORM });
    setTagInput('');
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.type) return;
    onSubmit(form);
    handleClose();
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB'); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image_url: file_url }));
    } catch (err) {
      alert('Error al subir: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = form.title.trim() && form.type && !uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Añadir spot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">

          {/* Foto */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Foto (opcional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <input id="spot-camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-secondary">
                <img src={form.image_url} alt="foto spot" className="w-full h-full object-cover" />
                <button
                  onClick={() => setForm(f => ({ ...f, image_url: null }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 border border-dashed border-border rounded-xl py-5 flex flex-col items-center gap-1.5 text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                  <span className="text-xs">Galería</span>
                </button>
                <button
                  onClick={() => document.getElementById('spot-camera-input')?.click()}
                  disabled={uploading}
                  className="flex-1 border border-dashed border-border rounded-xl py-5 flex flex-col items-center gap-1.5 text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs">Cámara</span>
                </button>
              </div>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre *</label>
            <Input
              placeholder="ej. Ramen Ichiran"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-secondary border-border"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo *</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    form.type === t.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  <span>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notas</label>
            <Textarea
              placeholder="Descripción, horarios, precio..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dirección</label>
            <Input
              placeholder="Calle, zona..."
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="bg-secondary border-border"
            />
          </div>

          {/* Visibilidad */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Visibilidad</label>
            <div className="flex gap-2">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, visibility: opt.value }))}
                  className={`flex-1 py-2 rounded-full border text-xs font-medium transition-all ${
                    form.visibility === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hashtags</label>
            <div className={`flex flex-wrap gap-1.5 items-center min-h-[40px] px-3 py-2 rounded-xl border bg-secondary border-border ${tagInput || form.tags.length > 0 ? 'border-primary/30' : ''}`}>
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  #{tag}
                  <button
                    onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}
                    className="text-primary/60 hover:text-primary leading-none ml-0.5"
                  >×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={form.tags.length === 0 ? "ramen, mirador, imprescindible..." : ""}
                className="flex-1 min-w-[80px] bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Pulsa Enter o coma para añadir · Backspace para borrar</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground bg-secondary hover:bg-border transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className="flex-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar spot'}
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
