import { useState } from 'react';
import { Settings, X, Save, ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CitySettingsModal({ city, tripId }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: city.name || '',
    accommodation: city.accommodation || '',
    start_date: city.start_date || '',
    end_date: city.end_date || '',
    image_url: city.image_url || '',
  });
  const queryClient = useQueryClient();

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setForm({
      name: city.name || '',
      accommodation: city.accommodation || '',
      start_date: city.start_date || '',
      end_date: city.end_date || '',
      image_url: city.image_url || '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.City.update(city.id, form);
    queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
    queryClient.invalidateQueries({ queryKey: ['city', city.id] });
    setSaving(false);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/30 hover:text-white transition-all"
        title="Ajustes de la ciudad"
      >
        <Settings className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Ajustes de {city.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Ciudad / Parada</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Tokyo"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Alojamiento</label>
              <Input
                value={form.accommodation}
                onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
                placeholder="Ej: APA Hotel Pride Kokkaigijidomae, Tokyo"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              {form.image_url && (
                <div className="mb-2 rounded-lg overflow-hidden h-24 bg-muted">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                </div>
              )}
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha llegada</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha salida</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="bg-orange-700 hover:bg-orange-800 text-white"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}