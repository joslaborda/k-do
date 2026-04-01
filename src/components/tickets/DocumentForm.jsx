import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plane, Train, Hotel, CalendarDays, FileText, Package, MapPin, Sparkles, Upload, Eye, EyeOff, Users, Loader2, Check } from 'lucide-react';

export const CATEGORY_CONFIG = {
  flight:   { label: 'Vuelo',            icon: Plane,        color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  train:    { label: 'Tren',             icon: Train,        color: 'from-green-500 to-emerald-500', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  hotel:    { label: 'Hotel',            icon: Hotel,        color: 'from-purple-500 to-pink-500',   bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  event:    { label: 'Evento',           icon: CalendarDays, color: 'from-orange-500 to-red-500',   bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  personal: { label: 'Personal',         icon: FileText,     color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  other:    { label: 'Otro',             icon: Package,      color: 'from-slate-500 to-gray-500',   bg: 'bg-slate-50',  text: 'text-slate-700',  border: 'border-slate-200' },
};

const VISIBILITY_OPTIONS = [
  { value: 'personal',       label: 'Solo yo',          icon: EyeOff },
  { value: 'shared',         label: 'Todo el grupo',    icon: Eye },
  { value: 'selected_users', label: 'Usuarios concretos', icon: Users },
];

const EMPTY_FORM = {
  name: '', category: 'flight', date: '', end_date: '', notes: '',
  file_url: '', origin: '', destination: '', airline: '',
  city: '', doc_type: '', city_id: '', arrival_city_id: '',
  itinerary_day_id: '', visibility: 'personal', shared_with: [],
};

export default function DocumentForm({ cities = [], itineraryDays = [], members = [], initialData = null, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── File upload + AI analysis ────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('file_url', file_url);
    setUploadingFile(false);

    // Only analyse if it's a PDF or image
    const isPDForImage = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isPDForImage) return;

    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza este documento de viaje y extrae la información disponible. Devuelve un JSON con los campos que puedas identificar. Haz sugerencias razonables basándote en el contexto visible.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            category:    { type: 'string', enum: ['flight','train','hotel','event','personal','other'] },
            name:        { type: 'string' },
            origin:      { type: 'string' },
            destination: { type: 'string' },
            airline:     { type: 'string' },
            city:        { type: 'string' },
            date:        { type: 'string', description: 'YYYY-MM-DD' },
            end_date:    { type: 'string', description: 'YYYY-MM-DD' },
            doc_type:    { type: 'string' },
          }
        }
      });

      const suggested = {};
      for (const [k, v] of Object.entries(result)) {
        if (v && typeof v === 'string' && v.trim()) suggested[k] = v.trim();
      }

      // Try to match city name to a city in the trip
      if (suggested.destination || suggested.city) {
        const cityName = (suggested.destination || suggested.city || '').toLowerCase();
        const matched = cities.find(c => c.name.toLowerCase().includes(cityName) || cityName.includes(c.name.toLowerCase()));
        if (matched) suggested.city_id = matched.id;
      }

      // Suggest itinerary day by date
      if (suggested.date && itineraryDays.length > 0) {
        const match = itineraryDays.find(d => d.date === suggested.date);
        if (match) suggested.itinerary_day_id = match.id;
      }

      setForm(prev => ({ ...prev, ...suggested }));
      setAiSuggested(true);
    } catch (_) {
      // AI failed silently — user fills manually
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Dynamic fields per category ──────────────────────────────────────────
  const renderCategoryFields = () => {
    switch (form.category) {
      case 'flight':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Origen" placeholder="ej. Madrid" value={form.origin} onChange={v => set('origin', v)} />
              <Field label="Destino" placeholder="ej. Tokyo" value={form.destination} onChange={v => set('destination', v)} />
            </div>
            <Field label="Aerolínea (opcional)" placeholder="ej. Iberia" value={form.airline} onChange={v => set('airline', v)} />
            <Field label="Fecha" type="date" value={form.date} onChange={v => set('date', v)} />
          </>
        );
      case 'train':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Origen" placeholder="ej. Kyoto" value={form.origin} onChange={v => set('origin', v)} />
              <Field label="Destino" placeholder="ej. Osaka" value={form.destination} onChange={v => set('destination', v)} />
            </div>
            <Field label="Fecha" type="date" value={form.date} onChange={v => set('date', v)} />
          </>
        );
      case 'hotel':
        return (
          <>
            <Field label="Ciudad" placeholder="ej. Tokyo" value={form.city} onChange={v => set('city', v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in" type="date" value={form.date} onChange={v => set('date', v)} />
              <Field label="Check-out" type="date" value={form.end_date} onChange={v => set('end_date', v)} />
            </div>
          </>
        );
      case 'event':
        return (
          <>
            <Field label="Ciudad" placeholder="ej. Osaka" value={form.city} onChange={v => set('city', v)} />
            <Field label="Fecha" type="date" value={form.date} onChange={v => set('date', v)} />
          </>
        );
      case 'personal':
        return (
          <>
            <Field label="Tipo de documento" placeholder="ej. Pasaporte, Visado..." value={form.doc_type} onChange={v => set('doc_type', v)} />
            <Field label="Fecha de expiración" type="date" value={form.date} onChange={v => set('date', v)} />
          </>
        );
      case 'other':
        return <Field label="Fecha (opcional)" type="date" value={form.date} onChange={v => set('date', v)} />;
      default:
        return null;
    }
  };

  // ── Itinerary day suggestions ────────────────────────────────────────────
  const suggestedDay = form.date && !form.itinerary_day_id
    ? itineraryDays.find(d => d.date === form.date)
    : null;

  // ── City suggestion ──────────────────────────────────────────────────────
  const primaryCity = form.city || form.destination || form.origin || '';
  const suggestedCity = !form.city_id && primaryCity
    ? cities.find(c => c.name.toLowerCase().includes(primaryCity.toLowerCase()) || primaryCity.toLowerCase().includes(c.name.toLowerCase()))
    : null;

  const canSave = form.name.trim() && !uploadingFile && !analyzing;

  return (
    <div className="space-y-4">
      {/* AI status banner */}
      {analyzing && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Loader2 className="w-4 h-4 text-orange-600 animate-spin flex-shrink-0" />
          <span className="text-sm text-orange-700 font-medium">Analizando documento con IA...</span>
        </div>
      )}
      {aiSuggested && !analyzing && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium">La IA ha rellenado los campos. Revisa y confirma.</span>
        </div>
      )}

      {/* File upload — first */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Archivo</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all flex items-center gap-3"
        >
          {uploadingFile ? (
            <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
          ) : form.file_url ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Upload className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploadingFile ? 'Subiendo...' : form.file_url ? '✓ Archivo subido (haz clic para cambiar)' : 'Haz clic para subir PDF o imagen'}
          </span>
        </div>
        <input ref={fileInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo de documento</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = form.category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => set('category', key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${active ? `${cfg.bg} ${cfg.border} ${cfg.text} border-2` : 'border-border text-muted-foreground hover:bg-secondary/50'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <Field label="Nombre *" placeholder="ej. Vuelo Madrid → Tokyo" value={form.name} onChange={v => set('name', v)} />

      {/* Dynamic fields */}
      {renderCategoryFields()}

      {/* City association */}
      {cities.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Asociar a ciudad
          </label>
          {suggestedCity && !form.city_id && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-orange-700">IA sugiere: <strong>{suggestedCity.name}</strong></span>
              <button onClick={() => set('city_id', suggestedCity.id)} className="ml-auto text-xs bg-orange-700 text-white px-2 py-0.5 rounded-md hover:bg-orange-800">Aceptar</button>
            </div>
          )}
          <Select value={form.city_id || 'none'} onValueChange={v => set('city_id', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {(form.category === 'flight' || form.category === 'train') && (
            <div className="mt-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ciudad destino (opcional)</label>
              <Select value={form.arrival_city_id || 'none'} onValueChange={v => set('arrival_city_id', v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Itinerary day association */}
      {itineraryDays.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Asociar a día de itinerario
          </label>
          {suggestedDay && !form.itinerary_day_id && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-orange-700">IA sugiere: <strong>{suggestedDay.title}</strong></span>
              <button onClick={() => set('itinerary_day_id', suggestedDay.id)} className="ml-auto text-xs bg-orange-700 text-white px-2 py-0.5 rounded-md hover:bg-orange-800">Aceptar</button>
            </div>
          )}
          <Select value={form.itinerary_day_id || 'none'} onValueChange={v => set('itinerary_day_id', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {itineraryDays.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.cityName ? `${d.cityName} — ` : ''}{d.title}{d.date ? ` (${d.date})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Visibility */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Visibilidad</label>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = form.visibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('visibility', opt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all flex-1 justify-center ${active ? 'bg-orange-700 text-white border-orange-700' : 'border-border text-muted-foreground hover:bg-secondary/50'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected users picker */}
        {form.visibility === 'selected_users' && members.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">Selecciona quién puede ver este documento:</p>
            <div className="flex flex-wrap gap-2">
              {members.map(email => {
                const selected = (form.shared_with || []).includes(email);
                return (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      const current = form.shared_with || [];
                      set('shared_with', selected ? current.filter(e => e !== email) : [...current, email]);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected ? 'bg-orange-700 text-white border-orange-700' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                  >
                    {email}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Notas (opcional)</label>
        <Textarea
          placeholder="Notas adicionales..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="border-border text-foreground hover:bg-secondary/50">
          Cancelar
        </Button>
        <Button
          onClick={() => onSave(form)}
          className="bg-orange-700 hover:bg-orange-800"
          disabled={!canSave || saving}
        >
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}