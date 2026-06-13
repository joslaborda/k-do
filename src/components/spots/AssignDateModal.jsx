import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { X } from 'lucide-react';

export default
function AssignDateModal({ spot, tripCities = [], onAssign, onSkip, onUndo }) {
  const [selectedDate, setSelectedDate] = useState('');

  const tripDates = useMemo(() => {
    const dates = new Set();
    tripCities.forEach(c => {
      if (c.start_date && c.end_date) {
        let d = new Date(c.start_date);
        const end = new Date(c.end_date);
        while (d <= end) {
          dates.add(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return dates;
  }, [tripCities]);

  const minDate = tripCities.map(c => c.start_date).filter(Boolean).sort()[0] || '';
  const maxDate = tripCities.map(c => c.end_date).filter(Boolean).sort().reverse()[0] || '';
  const isAllowed = (date) => tripDates.size === 0 || tripDates.has(date);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]">
      <div className="bg-card w-full max-w-md rounded-t-3xl flex flex-col relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div className="p-5">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />

          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Saved confirmation */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">¡Guardado!</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{spot.title}</p>
            </div>
          </div>

          {/* Date picker — trip days only */}
          <p className="text-sm font-semibold text-foreground mb-2">¿Cuándo quieres visitar este spot?</p>
          {tripDates.size > 0 ? (
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
            >
              <option value="">Sin asignar</option>
              {(() => {
                const days = [];
                const sorted = [...tripCities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
                sorted.forEach(c => {
                  if (c.start_date && c.end_date) {
                    let d = new Date(c.start_date);
                    const end = new Date(c.end_date);
                    while (d <= end) {
                      days.push({ date: d.toISOString().slice(0, 10), city: c.name });
                      d.setDate(d.getDate() + 1);
                    }
                  }
                });
                return days.map(d => (
                  <option key={d.date} value={d.date}>{d.date} · {d.city}</option>
                ));
              })()}
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
            Deshacer
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
            {selectedDate && isAllowed(selectedDate) ? 'Confirmar' : 'Ahora no'}
          </button>
        </div>
      </div>
    </div>
  );
}

