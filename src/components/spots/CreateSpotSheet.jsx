import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, MapPin, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TYPE_CONFIG, reverseGeocode } from './spotsHelpers';
import LeafletMap from './LeafletMap';

export default
function CreateSpotSheet({ open, onClose, onSave, saving, spots, city, country }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('food');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [pinLat, setPinLat] = useState(null);
  const [pinLng, setPinLng] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [duplicate, setDuplicate] = useState(null); // spot that matches

  // A: real-time duplicate check
  useEffect(() => {
    if (!title.trim() || title.length < 3) { setDuplicate(null); return; }
    const match = spots.find(s =>
      s.title?.toLowerCase().trim() === title.toLowerCase().trim() &&
      (s.city_name?.toLowerCase() === city?.toLowerCase() || !s.city_name)
    );
    setDuplicate(match || null);
  }, [title, spots, city]);

  const handleGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = pos.coords.latitude, ln = pos.coords.longitude;
        setPinLat(la); setPinLng(ln);
        const addr = await reverseGeocode(la, ln);
        if (addr) setAddress(addr);
        setShowMap(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    // B: block if exact duplicate
    if (duplicate) return;
    if (!title.trim()) return;
    onSave({ title, type, notes, address, lat: pinLat, lng: pinLng, visibility: isPublic ? 'public' : 'trip_members' });
    // reset
    setTitle(''); setType('food'); setNotes(''); setAddress('');
    setPinLat(null); setPinLng(null); setShowMap(false); setIsPublic(true);
  };

  if (!open) return null;

  const defaultLat = pinLat || 35.6762;
  const defaultLng = pinLng || 139.6503;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
        {/* Handle + header — fixed */}
        <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-base">Crear spot</p>
            <button aria-label="Cerrar" onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Location FIRST (map at top) */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ubicación</p>
            {/* Map placeholder / real map */}
            <div className="rounded-xl overflow-hidden border border-border mb-2" style={{ height: '180px', background: 'var(--kodo-bg-subtle)', position: 'relative' }}>
              {showMap
                ? <LeafletMap lat={defaultLat} lng={defaultLng} onMove={(la, ln, addr) => { setPinLat(la); setPinLng(ln); if (addr) setAddress(addr); }} />
                : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs">Toca para añadir ubicación</p>
                  </div>
                )
              }
            </div>
            <button aria-label="Usar mi ubicación" onClick={() => { if (!pinLat) handleGPS(); setShowMap(true); }}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-border rounded-2xl text-sm text-primary font-medium hover:bg-orange-50 transition-colors mb-2">
              <span className="flex items-center gap-2"><Navigation className="w-4 h-4"/>{locating ? 'Localizando...' : 'Usar mi ubicación actual'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="o escribe la dirección..." className="h-9 text-sm" />
          </div>

          {/* Name + duplicate check */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nombre *</p>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Ichiran Ramen Shinjuku"
              className="h-10 text-sm"
              autoFocus
            />
            {duplicate && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Ya existe este spot en {city}</p>
                  <p className="text-xs text-amber-700 mt-0.5">"{duplicate.title}" ya está en tu lista.</p>
                </div>
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'transport').map(([val, tc]) => (
                <button key={val} onClick={() => setType(val)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                    type === val ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}>
                  {tc.Icon && <tc.Icon size={13} />} {tc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nota</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="¿Algo que recordar sobre este lugar?"
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"
            />
          </div>

          {/* Visibility toggle */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibilidad</p>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setIsPublic(true)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isPublic ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'}`}>
                Kōdo Community
              </button>
              <button onClick={() => setIsPublic(false)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isPublic ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-secondary/50'}`}>
                Solo mi viaje
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              {isPublic ? 'Otros viajeros podrán descubrirlo y guardarlo' : 'Solo tú y tu grupo lo verán'}
            </p>
          </div>
        </div>

        {/* Sticky footer buttons */}
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving || !!duplicate}
            className="flex-1 bg-primary hover:bg-primary/90 text-white">
            {saving ? 'Guardando...' : 'Guardar spot'}
          </Button>
        </div>
      </div>
    </div>
  );
}

