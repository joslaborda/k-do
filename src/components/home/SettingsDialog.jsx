import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, ChevronDown, Trash2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CountryInput from '@/components/trip/CountryInput';
import { normalizeCountry } from '@/lib/countryConfig';
import { useTranslation } from 'react-i18next';

export default
function SettingsDialog({
  const { t } = useTranslation(); open, onClose, trip, cities, tripId, isAdmin, onDelete, onSaved, onInvite, profiles = [] }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingCity, setEditingCity] = useState(null); // city id or 'new'
  const [cityDraft, setCityDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [cityLoading, setCityLoading] = useState(null);

  // Init form from trip data
  useEffect(() => {
    if (open && trip) {
      setName(trip.name || '');
      setStartDate(trip.start_date || '');
      setEndDate(trip.end_date || '');
      setEditingCity(null);
    }
  }, [open, trip]);

  const totalDays = startDate && endDate
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    : null;

  const handleSaveTrip = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Trip.update(tripId, {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
      });
      onSaved();
      onClose();
    } catch {}
    setSaving(false);
  };

  const openCityEdit = (city) => {
    setEditingCity(city.id);
    setCityDraft({
      name: city.name || '',
      country: city.country || '',
      start_date: city.start_date || '',
      end_date: city.end_date || '',
    });
  };

  const closeCityEdit = () => {
    setEditingCity(null);
    setCityDraft({});
  };

  const saveCityEdit = async (cityId) => {
    if (!cityDraft.name?.trim()) return;
    setCityLoading(cityId);
    try {
      await base44.entities.City.update(cityId, {
        name: cityDraft.name.trim(),
        country: normalizeCountry(cityDraft.country || ''),
        start_date: cityDraft.start_date || '',
        end_date: cityDraft.end_date || '',
      });
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  const deleteCity = async (cityId) => {
    if (cities.length <= 1) return;
    setCityLoading(cityId);
    try {
      await base44.entities.City.delete(cityId);
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  const addCity = async () => {
    setEditingCity('new');
    setCityDraft({ name: '', country: '', start_date: endDate || '', end_date: '' });
  };

  const saveNewCity = async () => {
    if (!cityDraft.name?.trim()) return;
    setCityLoading('new');
    try {
      await base44.entities.City.create({
        trip_id: tripId,
        name: cityDraft.name.trim(),
        country: normalizeCountry(cityDraft.country || ''),
        start_date: cityDraft.start_date || '',
        end_date: cityDraft.end_date || '',
      });
      queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
      closeCityEdit();
    } catch {}
    setCityLoading(null);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border p-0 max-w-md max-h-[90vh] overflow-y-auto gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-foreground text-base font-semibold">{t('trip.settings')}</DialogTitle>
        </DialogHeader>

        {/* Nombre */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{t('trip.tripName')}</p>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-8 text-sm font-medium border-0 p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder=t('trip.tripName')
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1.5">Fechas del viaje</p>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-8 text-sm flex-1"
              />
              {totalDays && (
                <span className="text-xs bg-accent text-primary px-2 py-1 rounded-full font-medium shrink-0">
                  {totalDays}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Paradas */}
        <div className="bg-secondary/50 px-5 py-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Paradas · {cities.length} ciudad{cities.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {cities.map((city, idx) => (
          <div key={city.id}>
            {/* City row */}
            <button
              onClick={() => editingCity === city.id ? closeCityEdit() : openCityEdit(city)}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-border hover:bg-secondary/30 transition-colors text-left">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                editingCity === city.id ? 'bg-primary text-white' : 'bg-accent text-primary border border-orange-200'
              }`}>{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{city.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {city.country}
                  {city.start_date && city.end_date && ` · ${format(parseISO(city.start_date), 'dd MMM', { locale: es })} – ${format(parseISO(city.end_date), 'dd MMM', { locale: es })}`}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${editingCity === city.id ? 'rotate-180' : ''}`} />
            </button>

            {/* Inline edit panel */}
            {editingCity === city.id && (
              <div className="bg-secondary/40 border-b border-border px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                    <Input value={cityDraft.name || ''} onChange={e => setCityDraft(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" aria-label="Ciudad de origen" placeholder="Ciudad" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">País</p>
                    <CountryInput value={cityDraft.country || ''} onChange={v => setCityDraft(p => ({ ...p, country: v }))} placeholder="País" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
                    <Input type="date" value={cityDraft.start_date || ''} onChange={e => setCityDraft(p => ({ ...p, start_date: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
                    <Input type="date" value={cityDraft.end_date || ''} onChange={e => setCityDraft(p => ({ ...p, end_date: e.target.value }))} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {cities.length > 1 ? (
                    <button
                      onClick={() => deleteCity(city.id)}
                      disabled={cityLoading === city.id}
                      className="text-xs text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                      {cityLoading === city.id ? 'Eliminando...' : 'Eliminar parada'}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Mínimo una parada</span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={closeCityEdit}>
                      Cancelar
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                      onClick={() => saveCityEdit(city.id)}
                      disabled={!cityDraft.name?.trim() || cityLoading === city.id}>
                      {cityLoading === city.id ? 'Guardando...' : 'Listo'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Nueva parada */}
        {editingCity === 'new' ? (
          <div className="bg-secondary/40 border-b border-border px-5 py-4 space-y-3">
            <p className="text-xs font-medium text-primary">Nueva parada</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                <Input value={cityDraft.name || ''} onChange={e => setCityDraft(p => ({ ...p, name: e.target.value }))} aria-label="Ciudad" className="h-8 text-sm" placeholder="Ciudad" autoFocus />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">País</p>
                <CountryInput value={cityDraft.country || ''} onChange={v => setCityDraft(p => ({ ...p, country: v }))} placeholder="País" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha inicio</p>
                <Input type="date" value={cityDraft.start_date || ''} onChange={e => setCityDraft(p => ({ ...p, start_date: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha fin</p>
                <Input type="date" value={cityDraft.end_date || ''} onChange={e => setCityDraft(p => ({ ...p, end_date: e.target.value }))} className="h-8 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={closeCityEdit}>
                Cancelar
              </Button>
              <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                onClick={saveNewCity}
                disabled={!cityDraft.name?.trim() || cityLoading === 'new'}>
                {cityLoading === 'new' ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </div>
          </div>
        ) : (
          <button onClick={addCity}
            className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-border hover:bg-secondary/30 transition-colors text-left">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <span className="text-muted-foreground text-xs">+</span>
            </div>
            <span className="text-sm text-muted-foreground">Añadir parada</span>
          </button>
        )}

        {/* Viajeros */}
        <div className="bg-secondary/50 px-5 py-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Viajeros · {trip?.members?.length || 1}
          </p>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex gap-2">
            {(trip?.members || [trip?.created_by]).filter(Boolean).map((email, i) => {
              const prof = profiles?.find(p => p.email === email || p.user_email === email);
              const name = prof?.display_name || prof?.username || email || '?';
              const initials = name.slice(0,2).toUpperCase();
              const colors = ['bg-accent text-primary', 'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
              return prof?.avatar_url
                ? <img key={email} src={prof.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <div key={email} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>{initials}</div>;
            })}
          </div>
          <button onClick={() => { onClose(); setTimeout(() => onInvite?.(), 100); }}
            className="text-xs text-primary flex items-center gap-1 font-medium">
            <UserPlus className="w-3.5 h-3.5" />Invitar
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5">
          {isAdmin && (
            <button onClick={onDelete}
              className="text-sm text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />Eliminar viaje
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleSaveTrip}
              disabled={!name.trim() || saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

