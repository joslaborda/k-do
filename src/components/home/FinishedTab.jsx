import { useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { normalizeCountry } from '@/lib/countryConfig';
import { es } from 'date-fns/locale';
import { ArrowRight, Calendar, Compass, DollarSign, MapPin, Users } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';

export default function FinishedTab({ trip, cities, expenses, spots, tripId, currentUserEmail, profiles = [] }) {
  const allTripSpots = spots;

  const isSettlement = (e) => e.is_settlement === true || (e.description || '').startsWith('Liquidación:');
  const realExpenses = expenses.filter(e => !isSettlement(e));

  const totalDays = (trip?.start_date && trip?.end_date)
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : null;
  // Total grupo: suma amount_base (normalizado a moneda base), excluye liquidaciones
  const totalSpent  = realExpenses.reduce((s, e) => s + (parseFloat(e.amount_base || e.amount) || 0), 0);
  const avgPerDay   = totalDays ? totalSpent / totalDays : 0;
  const visitedSpots = allTripSpots.filter(s => !!s.assigned_date).length;
  const currency    = trip?.currency || 'EUR';
  const members     = trip?.members?.length || 1;

  const allCountries = useMemo(() => {
    const sources = cities.length > 0
      ? cities.map(c => c.country).filter(Boolean)
      : [trip?.country].filter(Boolean);
    const seen = {};
    sources.forEach(s => {
      // normalizeCountry traduce inglés→español (Japan→Japón, France→Francia, etc.)
      const esName = normalizeCountry(s) || s;
      if (esName && !seen[esName]) seen[esName] = esName;
    });
    return Object.values(seen);
  }, [trip, cities]);

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const countriesLabel = (() => {
    if (cities.length === 0) return trip?.destination || '';
    if (cities.length === 1) return sortedCities[0]?.name || trip?.destination || '';
    const countries = [...allCountries];
    if (countries.length === 0) return trip?.destination || '';
    if (countries.length === 1) return countries[0];
    if (countries.length === 2) return countries.join(' y ');
    return countries.slice(0, -1).join(', ') + ' y ' + countries[countries.length - 1];
  })();

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl border border-orange-200 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
          <PlaneIcon className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">Gracias por visitar</p>
        <p className="text-2xl font-semibold text-foreground">{countriesLabel}</p>
        {trip?.start_date && trip?.end_date && (
          <p className="text-xs text-muted-foreground mt-2">
            {format(parseISO(trip.start_date), 'dd MMM', { locale: es })} – {format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Días de viaje', value: totalDays || '—', Icon: Calendar },
          { label: 'Ciudades', value: cities.length, Icon: MapPin },
          { label: 'Spots visitados', value: visitedSpots, Icon: Compass },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <s.Icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}

        {/* Viajeros — avatares */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <Users className="w-4 h-4 text-primary mb-2" />
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {(trip?.members || []).map((email, i) => {
              const prof = profiles.find(p => p.email === email || p.user_email === email);
              const name = prof?.display_name || prof?.username || email;
              const initials = name.slice(0, 2).toUpperCase();
              const colors = ['bg-orange-100 text-primary','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700','bg-pink-100 text-pink-700'];
              return prof?.avatar_url
                ? <img key={email} src={prof.avatar_url} alt={name} title={name} className="w-8 h-8 rounded-full object-cover border-2 border-background" style={{marginLeft: i > 0 ? -8 : 0}} />
                : <div key={email} title={name} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-background ${colors[i % colors.length]}`} style={{marginLeft: i > 0 ? -8 : 0}}>{prof?.username?.[0]?.toUpperCase() || prof?.display_name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?'}</div>;
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{members} {members === 1 ? 'viajero' : 'viajeros'}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 col-span-2">
          <DollarSign className="w-4 h-4 text-primary mb-2" />
          <p className="text-xs text-muted-foreground mb-0.5">Tu parte</p>
          {(() => {
            const myShare = realExpenses.reduce((s, e) => {
              const amt = parseFloat(e.amount_base || e.amount) || 0;
              if (!amt) return s;
              if (e.split_type === 'custom' && e.amounts_by_user?.[currentUserEmail]) {
                const total = Object.values(e.amounts_by_user).reduce((t, v) => t + parseFloat(v || 0), 0);
                return s + (total > 0 ? (parseFloat(e.amounts_by_user[currentUserEmail]) / total) * amt : 0);
              }
              const parts = e.split_with?.length > 0 ? e.split_with : [e.paid_by];
              if (!parts.includes(currentUserEmail)) return s;
              return s + amt / parts.length;
            }, 0);
            return (
              <>
                <p className="text-xl font-semibold text-foreground">{myShare.toFixed(0)} {currency}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total grupo: <span className="font-medium text-foreground">{totalSpent.toFixed(0)} {currency}</span>
                  {avgPerDay > 0 && <>{' · '}{avgPerDay.toFixed(0)} {currency}/día</>}
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {sortedCities.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Ruta del viaje</p>
          <div className="flex items-center gap-2 flex-wrap">
            {sortedCities.map((city, i) => (
              <span key={city.id} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{city.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
