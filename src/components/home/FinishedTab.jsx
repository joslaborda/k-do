import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import { normalizeCountry } from '@/lib/countryConfig';
import { es } from 'date-fns/locale';
import { ArrowRight, Calendar, Compass, DollarSign, MapPin, Users, X } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';

const MAX_AVATARS = 4;
const AVATAR_COLORS = [
  'bg-orange-100 text-primary',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
];

function TravelersSheet({ open, onClose, trip, profiles }) {
  if (!open) return null;
  const memberEmails = trip?.members || [];
  const roles = trip?.roles || {};
  const dateRange = trip?.start_date && trip?.end_date
    ? `${format(parseISO(trip.start_date), 'dd MMM', { locale: es })} – ${format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}`
    : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-background rounded-t-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Handle + header */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-base font-semibold text-foreground">Viajeros</p>
            {dateRange && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {trip?.name} · {dateRange}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {memberEmails.map((email, i) => {
            const prof = profiles.find(p => p.email === email || p.user_email === email);
            const name = prof?.display_name || prof?.username || email;
            const initials = name.slice(0, 2).toUpperCase();
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const isAdmin = roles[email] === 'admin' || trip?.created_by === email;
            const sub = prof?.username ? `@${prof.username}` : email;

            return (
              <div key={email} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                {prof?.avatar_url
                  ? <img src={prof.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}>{initials}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub}</p>
                </div>
                {isAdmin && (
                  <span className="text-xs bg-orange-50 text-primary border border-orange-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    Admin
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="h-8" />
      </div>
    </div>,
    document.body
  );
}

export default function FinishedTab({ trip, cities, expenses, spots, tripId, currentUserEmail, profiles = [] }) {
  const [showTravelers, setShowTravelers] = useState(false);
  const allTripSpots = spots;

  const isSettlement = (e) => e.is_settlement === true || (e.description || '').startsWith('Liquidación:');
  const realExpenses = expenses.filter(e => !isSettlement(e));

  const totalDays = (trip?.start_date && trip?.end_date)
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : null;
  const totalSpent  = realExpenses.reduce((s, e) => s + (parseFloat(e.amount_base || e.amount) || 0), 0);
  const avgPerDay   = totalDays ? totalSpent / totalDays : 0;
  const visitedSpots = allTripSpots.filter(s => !!s.assigned_date).length;
  const currency    = trip?.currency || 'EUR';
  const memberEmails = trip?.members || [];
  const memberCount = memberEmails.length;

  const allCountries = useMemo(() => {
    const sources = cities.length > 0
      ? cities.map(c => c.country).filter(Boolean)
      : [trip?.country].filter(Boolean);
    const seen = {};
    sources.forEach(s => {
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

  // Avatares con overflow
  const visibleMembers = memberEmails.slice(0, MAX_AVATARS);
  const overflow = memberCount - MAX_AVATARS;

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
    <div className="space-y-3">
      {/* Hero */}
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

      {/* Grid stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Días de viaje', value: totalDays || '—', Icon: Calendar },
          { label: 'Ciudades',      value: cities.length,    Icon: MapPin },
          { label: 'Spots visitados', value: visitedSpots,  Icon: Compass },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <s.Icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-2xl font-medium text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}

        {/* Viajeros */}
        <button
          className="bg-card rounded-2xl border border-border p-4 text-left hover:bg-secondary/30 transition-colors"
          onClick={() => setShowTravelers(true)}
        >
          <Users className="w-4 h-4 text-primary mb-2" />
          <p className="text-2xl font-medium text-foreground">{memberCount}</p>
          <div className="flex items-center mt-1.5">
            {visibleMembers.map((email, i) => {
              const prof = profiles.find(p => p.email === email || p.user_email === email);
              const name = prof?.display_name || prof?.username || email;
              const initials = name.slice(0, 2).toUpperCase();
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return prof?.avatar_url
                ? <img key={email} src={prof.avatar_url} alt={name} title={name}
                    className="w-5 h-5 rounded-full object-cover border-2 border-card flex-shrink-0"
                    style={{ marginLeft: i > 0 ? -5 : 0 }} />
                : <div key={email} title={name}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-micro font-semibold border-2 border-card flex-shrink-0 ${color}`}
                    style={{ marginLeft: i > 0 ? -5 : 0 }}>
                    {initials[0]}
                  </div>;
            })}
            {overflow > 0 && (
              <div
                className="w-5 h-5 rounded-full bg-secondary border-2 border-card flex items-center justify-center flex-shrink-0"
                style={{ marginLeft: -5 }}>
                <span className="text-muted-foreground" style={{ fontSize: 8, fontWeight: 500 }}>+{overflow}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{memberCount === 1 ? 'viajero' : 'viajeros'}</p>
        </button>

        {/* Gastos */}
        <div className="bg-card rounded-2xl border border-border p-4 col-span-2">
          <DollarSign className="w-4 h-4 text-primary mb-2" />
          <p className="text-xs text-muted-foreground mb-0.5">Tu parte</p>
          <p className="text-2xl font-medium text-foreground">{myShare.toFixed(0)} {currency}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total grupo: <span className="font-medium text-foreground">{totalSpent.toFixed(0)} {currency}</span>
            {avgPerDay > 0 && <>{' · '}{avgPerDay.toFixed(0)} {currency}/día</>}
          </p>
        </div>
      </div>

      {/* Ruta */}
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

      <TravelersSheet
        open={showTravelers}
        onClose={() => setShowTravelers(false)}
        trip={trip}
        profiles={profiles}
      />
    </div>
  );
}
