import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Calendar, MapPin, FileText, Plane, Train, Hotel, Shield,
  Eye, ArrowRight, StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TicketQuickViewer from './TicketQuickViewer';

// ── helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const catIcon = {
  flight: Plane, train: Train, hotel: Hotel, insurance: Shield,
  event: Calendar, personal: FileText, other: FileText, freetour: FileText,
};
const catLabel = {
  flight: 'Vuelo', train: 'Tren', hotel: 'Hotel', insurance: 'Seguro',
  event: 'Evento', personal: 'Doc personal', other: 'Otro', freetour: 'Free Tour',
};
const catColor = {
  flight: 'bg-indigo-100 text-indigo-700',
  train: 'bg-emerald-100 text-emerald-700',
  hotel: 'bg-purple-100 text-purple-700',
  insurance: 'bg-yellow-100 text-yellow-700',
  event: 'bg-orange-100 text-orange-700',
  personal: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-600',
  freetour: 'bg-orange-100 text-orange-700',
};

// ── sub-components ────────────────────────────────────────────────────────────
function PlanCard({ itDay, cityOfDay, tripId }) {
  if (itDay) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Plan</p>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm leading-snug">{itDay.title}</p>
          {cityOfDay && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{cityOfDay.name}</p>}
        </div>
        <Link to={createPageUrl(`CityDetail?trip_id=${tripId}&city_id=${itDay.city_id}`)}>
          <Button size="sm" variant="outline" className="w-full text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-50">
            Abrir plan <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Plan</p>
      <p className="text-sm text-muted-foreground flex-1">Sin plan para este día</p>
      {cityOfDay && (
        <Link to={createPageUrl(`CityDetail?trip_id=${tripId}&city_id=${cityOfDay.id}`)}>
          <Button size="sm" variant="outline" className="w-full text-xs h-7">Abrir ciudad</Button>
        </Link>
      )}
    </div>
  );
}

function SpotsCard({ spots, cityOfDay, tripId }) {
  const preview = spots.slice(0, 3);
  const typeEmoji = { food: '🍜', sight: '🏯', activity: '🎯', shopping: '🛍', transport: '🚌', custom: '📍' };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Spots</p>
      {preview.length === 0
        ? <p className="text-sm text-muted-foreground flex-1">Sin spots para este día</p>
        : <ul className="flex-1 space-y-1">
            {preview.map(s => (
              <li key={s.id} className="flex items-center gap-1.5 text-sm">
                <span className="text-base leading-none">{typeEmoji[s.type] || '📍'}</span>
                <span className="truncate text-foreground">{s.title}</span>
              </li>
            ))}
          </ul>
      }
      {cityOfDay && (
        <Link to={createPageUrl(`CityDetail?trip_id=${tripId}&city_id=${cityOfDay.id}`)}>
          <Button size="sm" variant="outline" className="w-full text-xs h-7">Ver spots</Button>
        </Link>
      )}
    </div>
  );
}

function DocsCard({ docs, tripId }) {
  const [viewerTicket, setViewerTicket] = useState(null);
  const preview = docs.slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Docs</p>
      {preview.length === 0
        ? <p className="text-sm text-muted-foreground flex-1">Sin docs para este día</p>
        : <ul className="flex-1 space-y-1.5">
            {preview.map(doc => {
              const Icon = catIcon[doc.category] || FileText;
              const colorCls = catColor[doc.category] || catColor.other;
              const label = catLabel[doc.category] || doc.category;
              const hasFile = !!doc.file_url;
              return (
                <li key={doc.id}>
                  <button
                    onClick={() => hasFile && setViewerTicket(doc)}
                    disabled={!hasFile}
                    className={`w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-colors ${hasFile ? 'hover:bg-orange-50 cursor-pointer' : 'opacity-60 cursor-default'}`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${colorCls}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-foreground truncate block">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </span>
                    {hasFile && <Eye className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
      }
      <Link to={createPageUrl(`Documents?trip_id=${tripId}`)}>
        <Button size="sm" variant="outline" className="w-full text-xs h-7">Ver todos los docs</Button>
      </Link>

      <TicketQuickViewer
        ticket={viewerTicket}
        open={!!viewerTicket}
        onOpenChange={open => !open && setViewerTicket(null)}
      />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function TodayTomorrowPanel({ tripId, cities }) {
  const [tab, setTab] = useState('today');

  const targetDate = tab === 'today' ? todayStr() : tomorrowStr();

  const { data: itDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: async () => {
      if (!base44.entities.Spot) return [];
      return base44.entities.Spot.filter({ trip_id: tripId });
    },
    enabled: !!tripId,
    staleTime: 60000,
  });

  // 1. Determine itinerary day for target date
  const itDay = itDays.find(d => d.date === targetDate) || null;

  // 2. Determine city of the day
  const sortedCities = [...cities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  let cityOfDay = null;
  if (itDay) {
    cityOfDay = cities.find(c => c.id === itDay.city_id) || null;
  }
  if (!cityOfDay) {
    // fallback: city whose date range includes targetDate
    cityOfDay = sortedCities.find(c => c.start_date && c.end_date && targetDate >= c.start_date && targetDate <= c.end_date) || null;
  }
  if (!cityOfDay && sortedCities.length > 0) {
    cityOfDay = sortedCities[0];
  }

  // 3. Spots for the day
  const daySpots = itDay
    ? spots.filter(s => s.itinerary_day_id === itDay.id)
    : cityOfDay
      ? spots.filter(s => s.city_id === cityOfDay.id)
      : [];

  // 4. Docs for the day
  const dayDocs = tickets.filter(t => {
    const byDate = t.date === targetDate;
    const byCity = cityOfDay && t.city_id === cityOfDay.id;
    const byDayId = itDay && t.itinerary_day_id === itDay.id;
    return byDate || byDayId || (byCity && !t.itinerary_day_id);
  });

  if (cities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5 text-center text-muted-foreground text-sm">
        Añade paradas primero para ver el plan del día
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {['today', 'tomorrow'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === t ? 'bg-orange-700 text-white' : 'text-muted-foreground hover:bg-orange-50'}`}
          >
            {t === 'today' ? '☀️ Hoy' : '🌙 Mañana'}
          </button>
        ))}
      </div>

      {/* City label */}
      {cityOfDay && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="font-medium">{cityOfDay.name}</span>
          <span>· {targetDate}</span>
        </div>
      )}

      {/* 3 columns */}
      <div className="grid grid-cols-3 divide-x divide-border p-4 gap-0">
        <div className="pr-4">
          <PlanCard itDay={itDay} cityOfDay={cityOfDay} tripId={tripId} />
        </div>
        <div className="px-4">
          <SpotsCard spots={daySpots} cityOfDay={cityOfDay} tripId={tripId} />
        </div>
        <div className="pl-4">
          <DocsCard docs={dayDocs} tripId={tripId} />
        </div>
      </div>
    </div>
  );
}