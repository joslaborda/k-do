import { useState } from 'react';
import { Sparkles, Zap, Coffee, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PACE_OPTIONS = [
  { value: 'relajado', label: 'Relajado', emoji: '😌', desc: 'Pocas actividades, tiempo libre' },
  { value: 'equilibrado', label: 'Equilibrado', emoji: '⚖️', desc: 'Balance entre turismo y descanso' },
  { value: 'intenso', label: 'Intenso', emoji: '🚀', desc: 'Máximo aprovechamiento del tiempo' },
];

export default function AIGeneratorPanel({ open, onOpenChange, onGenerate, isGenerating, trip, cities }) {
  const [preferences, setPreferences] = useState({
    places: '',
    restaurants: '',
    experiences: '',
    avoid: '',
    pace: 'equilibrado',
  });

  const hasRoute = cities && cities.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-xl">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Generar itinerario con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Route summary */}
          <div className={`rounded-xl p-4 text-sm ${hasRoute ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            {hasRoute ? (
              <div>
                <p className="font-semibold text-green-700 mb-1">✅ Ruta detectada ({cities.length} ciudades)</p>
                <p className="text-green-600">La IA generará actividades respetando tus ciudades y fechas existentes.</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cities.map(c => (
                    <span key={c.id} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      📍 {c.name} {c.start_date && c.end_date ? `(${c.start_date} → ${c.end_date})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-amber-700 mb-1">⚠️ Sin ruta definida</p>
                <p className="text-amber-600">La IA sugerirá ciudades y fechas basándose en las fechas del viaje.</p>
              </div>
            )}
          </div>

          {/* Pace */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Ritmo del viaje</label>
            <div className="grid grid-cols-3 gap-2">
              {PACE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPreferences(p => ({ ...p, pace: opt.value }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    preferences.pace === opt.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-border bg-white hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Places */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              📍 Lugares que quieres visitar <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="ej. Fushimi Inari, TeamLab, Dotonbori, Shibuya Crossing..."
              value={preferences.places}
              onChange={e => setPreferences(p => ({ ...p, places: e.target.value }))}
              rows={2}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>

          {/* Restaurants */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              🍜 Restaurantes específicos <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="ej. Ichiran Ramen, Narisawa, Sukiyabashi Jiro..."
              value={preferences.restaurants}
              onChange={e => setPreferences(p => ({ ...p, restaurants: e.target.value }))}
              rows={2}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>

          {/* Experiences */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              ✨ Experiencias deseadas <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="ej. ceremonia del té, sumo, onsen, mercado de pescado..."
              value={preferences.experiences}
              onChange={e => setPreferences(p => ({ ...p, experiences: e.target.value }))}
              rows={2}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>

          {/* Avoid */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              🚫 Cosas a evitar <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="ej. muchas horas caminando, museos aburridos, zonas muy turísticas..."
              value={preferences.avoid}
              onChange={e => setPreferences(p => ({ ...p, avoid: e.target.value }))}
              rows={2}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={() => onGenerate(preferences)}
              disabled={isGenerating}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Generando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generar</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}