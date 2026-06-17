import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Users, Car, FileText, Hotel, TrainFront } from 'lucide-react';
import { BusFront, PlaneIcon } from '@/lib/icons';
import { getCountryMeta } from '@/lib/countryConfig';
import MemberAvatarRow from './MemberAvatarRow';

export default function InicioTab({ trip, cities, documents, packingItems, profiles, tripId, onInvite, currentUserEmail }) {
  const todayStr  = format(new Date(), 'yyyy-MM-dd');
  const tripStart = trip?.start_date || '';
  const daysLeft  = tripStart ? differenceInDays(parseISO(tripStart), new Date()) : null;
  const isDeparture = daysLeft === 0;

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const TRANSPORT_TYPES = ['flight', 'train', 'bus', 'car'];
  const todayDocs = documents.filter(d => {
    const docDate = d.date || d.valid_from || d.start_date;
    return docDate === todayStr;
  }).sort((a, b) => {
    const aT = TRANSPORT_TYPES.indexOf(a.type);
    const bT = TRANSPORT_TYPES.indexOf(b.type);
    if (aT !== bT) return (aT === -1 ? 99 : aT) - (bT === -1 ? 99 : bT);
    return (a.time || '').localeCompare(b.time || '');
  });

  const firstDoc = todayDocs[0] || null;

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  let countdown = null;
  if (firstDoc?.time) {
    const [h, m] = firstDoc.time.split(':').map(Number);
    const diff = (h * 60 + m) - nowMinutes;
    if (diff > 0 && diff <= 480) {
      countdown = diff <= 60 ? `en ${diff} min` : `en ${Math.round(diff / 60)}h ${diff % 60 > 0 ? (diff % 60) + 'min' : ''}`.trim();
    }
  }

  const DOC_ICON = {
    flight: (props) => <PlaneIcon size={20} {...props} />,
    train:  (props) => <TrainFront size={20} {...props} />,
    bus:    (props) => <BusFront size={20} {...props} />,
    hotel:  (props) => <Hotel size={20} {...props} />,
    car:    (props) => <Car size={20} {...props} />,
    other:  (props) => <FileText size={20} {...props} />,
  };

  const packedCount = packingItems.filter(i => i.packed).length;
  const packedPct   = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;

  const destName   = sortedCities.length > 0 ? sortedCities.map(c => c.name).join(' · ') : trip?.destination || '';
  const firstCity  = sortedCities[0];
  const countryMeta = getCountryMeta(firstCity?.country || trip?.country || '');

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: 160, background: 'var(--kodo-hero-bg)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.15) 100%)' }} />
        {countryMeta?.flag && (
          <div style={{ position: 'absolute', top: 14, right: 16, fontSize: 32, zIndex: 1 }}>{countryMeta.flag}</div>
        )}
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 18px' }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--kodo-hero-eyebrow)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {isDeparture ? '¡Hoy empieza!' : '¡Mañana empieza!'}
          </p>
          <p style={{ fontSize: 22, fontWeight: 500, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>
            {firstCity?.country || trip?.destination || trip?.name}<br/>te espera
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>{destName}</p>
        </div>
      </div>

      {firstDoc && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {TRANSPORT_TYPES.includes(firstDoc.type) ? 'Tu primer ' + (firstDoc.type === 'flight' ? 'vuelo' : firstDoc.type === 'train' ? 'tren' : 'transporte') : 'Primer documento'}
            </p>
            {countdown && <span className="text-xs font-medium text-primary">Sale {countdown}</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
              {(() => { const I = DOC_ICON[firstDoc.type] || DOC_ICON.other; return <I className="text-primary" />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{firstDoc.title || firstDoc.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{firstDoc.time ? `Salida ${firstDoc.time}` : 'Sin hora'}</p>
            </div>
            {firstDoc.time && <p className="text-base font-semibold text-foreground flex-shrink-0">{firstDoc.time}</p>}
          </div>
          {firstDoc.file_url && (
            <div className="px-4 pb-3">
              <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}
                className="block w-full py-2.5 bg-primary text-white text-sm font-medium text-center rounded-full">
                Ver billete
              </Link>
            </div>
          )}
        </div>
      )}

      {packingItems.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Maleta</p>
            <p className="text-sm font-medium text-primary">{packedPct}%</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: packedPct + '%' }} />
          </div>
          <p className="text-xs text-muted-foreground">{packedCount} de {packingItems.length} listos</p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />Viajeros
          </p>
        </div>
        <MemberAvatarRow trip={trip} profiles={profiles} onInvite={onInvite} currentUserEmail={currentUserEmail} />
      </div>
    </div>
  );
}
