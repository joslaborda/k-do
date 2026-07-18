import { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { parseISO, addDays, format } from 'date-fns';
import { getTripDays, tripDayOptionValue } from '@/lib/tripDays';

export default
function AssignDateModal({ spot, tripCities = [], onAssign, onSkip, onUndo }) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');

  // El spot ya tiene city_id fijo desde que se creó (la ciudad activa en ese
  // momento). Cities.jsx solo lo muestra en un día si `assigned_date` Y
  // `city_id` coinciden con ese día — si aquí se deja elegir una fecha de OTRA
  // ciudad del viaje, el spot queda con una fecha que no cuadra con su city_id
  // y desaparece de todas las vistas de itinerario sin aviso. Por eso los
  // días que se ofrecen aquí se filtran a la ciudad del propio spot.
  const dayOptions = useMemo(() => {
    const allDays = getTripDays(tripCities);
    if (!spot?.city_id) return allDays;
    const own = allDays.filter(d => d.cityId === spot.city_id);
    return own.length > 0 ? own : allDays;
  }, [tripCities, spot?.city_id]);

  const tripDates = useMemo(() => new Set(dayOptions.map(d => d.date)), [dayOptions]);

  const minDate = tripCities.map(c => c.start_date).filter(Boolean).sort()[0] || '';
  const maxDate = tripCities.map(c => c.end_date).filter(Boolean).sort().reverse()[0] || '';
  const isAllowed = (date) => tripDates.size === 0 || tripDates.has(date);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]">
      <div className="bg-card w-full max-w-md rounded-t-3xl flex flex-col relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div className="p-5">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />

          {/* Close button */}
          <button aria-label={t('common.close')}
            onClick={onSkip}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Saved confirmation */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{t('spots.assign.saved')}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{spot.title}</p>
            </div>
          </div>

          {/* Date picker — trip days only */}
          <p className="text-sm font-semibold text-foreground mb-2">{t('spots.assign.when')}</p>
          {tripDates.size > 0 ? (
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
            >
              <option value="">{t('spots.sheet.unassigned')}</option>
              {dayOptions.map(d => (
                // key único por fecha+ciudad: un día de tránsito puede repetir la
                // misma fecha en dos ciudades distintas del viaje.
                <option key={tripDayOptionValue(d)} value={d.date}>{d.date} · {d.city}</option>
              ))}
            </select>
          ) : (
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
            />
          )}
        </div>

        {/* Buttons — always visible */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onUndo}
            className="flex-1 py-3 rounded-full text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            {t('spots.undo')}
          </button>
          <button
            onClick={() => {
              if (selectedDate && isAllowed(selectedDate)) {
                onAssign(selectedDate);
              } else {
                onSkip();
              }
            }}
            className="flex-1 py-3 bg-primary text-white rounded-full text-sm font-semibold transition-colors"
          >
            {selectedDate && isAllowed(selectedDate) ? t('spots.assign.confirm') : t('spots.assign.notNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

