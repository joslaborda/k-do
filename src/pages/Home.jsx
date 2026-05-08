import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlobalSearch from '@/components/GlobalSearch';
import { format, differenceInDays, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Users, Settings, Trash2, ArrowRight, Search, ChevronDown, ChevronUp, FileText, Send } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTripCoverImage } from '@/lib/tripImage';
import TripMembersPanel from '@/components/trip/TripMembersPanel';
import IntelligentTimeline from '@/components/trip/IntelligentTimeline';
import DeleteTripModal from '@/components/trip/DeleteTripModal';
import TripCountdownBanner from '@/components/trip/TripCountdownBanner';
import TripAlerts from '@/components/trip/TripAlerts';
import { COUNTRY_REQUIREMENTS } from '@/lib/packingDB';

// ── Convert COUNTRY_REQUIREMENTS to requirements array ────────────────────────
function getDestinationRequirements(country, originCountry) {
  const data = COUNTRY_REQUIREMENTS[country];
  if (!data) return [];

  const reqs = [];

  // Visa
  if (data.visa) {
    reqs.push({
      type: 'visa',
      title: data.visa.needed ? 'Visado requerido' : 'Sin visado',
      description: data.visa.info,
      level: data.visa.needed ? 'required' : 'optional',
    });
  }

  // Adapter
  if (data.adapter?.needed) {
    reqs.push({
      type: 'tech',
      title: `Adaptador de enchufe — ${data.adapter.type || ''}`,
      description: data.adapter.info,
      level: 'required',
    });
  }

  // Currency tip
  if (data.currency?.info) {
    reqs.push({
      type: 'money',
      title: 'Moneda y pagos',
      description: data.currency.info,
      level: 'optional',
    });
  }

  // Vaccines
  (data.vaccines || []).forEach(v => {
    reqs.push({
      type: 'vaccine',
      title: `Vacuna: ${v.name}`,
      description: v.priority,
      level: v.priority?.includes('requer') ? 'required' : 'recommended',
    });
  });

  // Tips
  (data.tips || []).forEach(tip => {
    reqs.push({ type: 'safety', title: tip, description: '', level: 'optional' });
  });

  return reqs;
}

// ── Requirement badge ─────────────────────────────────────────────────────────
function ReqBadge({ level }) {
  if (level === 'required') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium shrink-0">Obligatorio</span>;
  if (level === 'recommended') return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">Recomendado</span>;
  return null;
}

const REQ_ICONS = { visa:'🛂', vaccine:'💉', health:'🏥', safety:'💡', money:'💰', transport:'🚌', climate:'🌡️', culture:'🙏', tech:'🔌', nature:'🦟' };

// ── Pre-trip tab ──────────────────────────────────────────────────────────────
function PreTripTab({ trip, cities, packingItems, documents, myProfile }) {
  const [reqExpanded, setReqExpanded] = useState(true);
  const tripId = trip?.id;
  const originCountry = myProfile?.home_country || 'España';

  const allCountries = useMemo(() => {
    const s = new Set();
    if (trip?.country) s.add(trip.country);
    cities.forEach(c => { if (c.country) s.add(c.country); });
    return [...s];
  }, [trip, cities]);

  const allRequirements = useMemo(() => {
    return allCountries.flatMap(country => {
      const reqs = getDestinationRequirements(country, originCountry);
      return reqs.map(r => ({ ...r, country }));
    }).sort((a, b) => {
      const order = { required: 0, recommended: 1, optional: 2 };
      return (order[a.level] ?? 3) - (order[b.level] ?? 3);
    });
  }, [allCountries, originCountry]);

  const urgentCount = allRequirements.filter(r => r.level === 'required').length;
  const packedCount = packingItems.filter(i => i.packed).length;
  const packedPct = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;
  const docsCount = documents?.length || 0;

  return (
    <div className="space-y-4">
      {/* Quick status */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Packing') + '?trip_id=' + tripId}>
          <div className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs text-muted-foreground mb-1">Maleta</p>
            <p className="text-xl font-semibold text-foreground">{packedPct}%</p>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 rounded-full transition-all" style={{ width: packedPct + '%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{packedCount}/{packingItems.length} items</p>
          </div>
        </Link>
        <Link to={createPageUrl('Documents') + '?trip_id=' + tripId}>
          <div className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs text-muted-foreground mb-1">Documentos</p>
            <p className="text-xl font-semibold text-foreground">{docsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{docsCount === 0 ? 'Ninguno subido' : `${docsCount} subido${docsCount > 1 ? 's' : ''}`}</p>
          </div>
        </Link>
      </div>

      {/* Destination requirements */}
      {allRequirements.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <button onClick={() => setReqExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-base">🗂️</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Por hacer antes del viaje</p>
                {urgentCount > 0 && <p className="text-xs text-red-600 mt-0.5">{urgentCount} obligatorio{urgentCount > 1 ? 's' : ''}</p>}
              </div>
            </div>
            {reqExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {reqExpanded && (
            <div className="border-t border-border divide-y divide-border">
              {allRequirements.filter(r => r.level !== 'optional' || r.type === 'tech').map((req, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-lg shrink-0 mt-0.5">{REQ_ICONS[req.type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium text-foreground">{req.title}</p>
                      <ReqBadge level={req.level} />
                    </div>
                    {req.description && <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>}
                    {allCountries.length > 1 && <p className="text-xs text-muted-foreground mt-0.5">📍 {req.country}</p>}
                  </div>
                </div>
              ))}
              {/* Tips separately collapsible */}
              {allRequirements.filter(r => r.type === 'safety').length > 0 && (
                <details className="px-4 py-3">
                  <summary className="text-xs font-medium text-muted-foreground cursor-pointer">💡 Consejos del destino</summary>
                  <div className="mt-2 space-y-1">
                    {allRequirements.filter(r => r.type === 'safety').map((req, i) => (
                      <p key={i} className="text-xs text-muted-foreground">· {req.title}</p>
                    ))}
                  </div>
                </details>
              )}
              <div className="px-4 py-2.5 bg-secondary/30">
                <p className="text-xs text-muted-foreground">Basado en pasaporte de {originCountry}. Verifica con fuentes oficiales antes de viajar.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Viajeros */}
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Viajeros
        </p>
        <TripMembersPanel trip={trip} currentUserEmail={''} />
      </div>
    </div>
  );
}

// ── Today tab ─────────────────────────────────────────────────────────────────
function DaySection({ label, city, docs, spots, tripId, isToday }) {
  const DOC_ICONS = { flight: '✈️', hotel: '🏨', train: '🚆', bus: '🚌', car: '🚗', ticket: '🎟️', insurance: '🛡️', other: '📄' };
  const SPOT_ICONS = { food: '🍜', sight: '🏛️', activity: '⚡', shopping: '🛍️', custom: '📍' };

  const hasContent = docs.length > 0 || spots.length > 0;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isToday ? 'border-orange-300 bg-white' : 'border-border bg-white'}`}>
      {/* Day header */}
      <div className={`px-4 py-3 flex items-center justify-between ${isToday ? 'bg-orange-50 border-b border-orange-200' : 'bg-secondary/40 border-b border-border'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-orange-700' : 'text-muted-foreground'}`}>{label}</span>
          <span className="text-sm font-semibold text-foreground">{city.name}</span>
        </div>
        {city.start_date && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(city.start_date), 'dd MMM', { locale: es })}
          </span>
        )}
      </div>

      {/* Documents for this day */}
      {docs.length > 0 && (
        <div className="divide-y divide-border">
          {docs.map(doc => (
            <Link key={doc.id} to={createPageUrl('Documents') + '?trip_id=' + tripId}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
              <span className="text-xl shrink-0">{DOC_ICONS[doc.type] || DOC_ICONS.other}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title || doc.name}</p>
                {doc.description && <p className="text-xs text-muted-foreground truncate">{doc.description}</p>}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Spots for this day */}
      {spots.length > 0 && (
        <div className={`divide-y divide-border ${docs.length > 0 ? 'border-t border-border' : ''}`}>
          {spots.map(spot => (
            <div key={spot.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-base shrink-0">{SPOT_ICONS[spot.type] || '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{spot.title}</p>
                {spot.notes && <p className="text-xs text-muted-foreground truncate">{spot.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">Sin documentos ni spots para este día</p>
          <Link to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
            className="text-xs text-orange-600 mt-1 inline-block">+ Añadir spots →</Link>
        </div>
      )}
    </div>
  );
}

function TodayTab({ trip, cities, expenses, tripId, trip_members }) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(today.getTime() + 86400000), 'yyyy-MM-dd');
  const currency = trip?.currency || 'EUR';

  // Sort cities by start_date
  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const todayCity = useMemo(() =>
    sortedCities.find(c => c.start_date && c.end_date && todayStr >= c.start_date && todayStr <= c.end_date) || sortedCities[0],
    [sortedCities, todayStr]
  );

  const tomorrowCity = useMemo(() =>
    sortedCities.find(c => c.start_date === tomorrowStr) ||
    sortedCities.find(c => c.start_date && c.end_date && tomorrowStr >= c.start_date && tomorrowStr <= c.end_date),
    [sortedCities, tomorrowStr]
  );

  // Fetch all docs and spots once
  const { data: allDocs = [] } = useQuery({
    queryKey: ['allDocs', tripId],
    queryFn: () => base44.entities.Document.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: allSpots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  // Filter docs by date
  const docsForDate = (dateStr) =>
    allDocs.filter(d => d.date === dateStr || d.valid_from === dateStr || d.start_date === dateStr);

  // Filter spots by city (only those assigned to a day = have trip_date field)
  const spotsForCity = (cityId) =>
    allSpots.filter(s => s.city_id === cityId && s.trip_date);

  // Today's expenses
  const todayExpenses = useMemo(() =>
    expenses.filter(e => e.date === todayStr || (e.created_date || '').startsWith(todayStr)),
    [expenses, todayStr]
  );
  const todayTotal = todayExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const dayNumber = trip?.start_date ? differenceInDays(today, parseISO(trip.start_date)) + 1 : null;
  const totalDays = (trip?.start_date && trip?.end_date) ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1 : null;

  return (
    <div className="space-y-3">
      {/* Day counter */}
      {dayNumber && totalDays && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-medium">Día {dayNumber} de {totalDays}</span>
          <Link to={createPageUrl('Cities') + '?trip_id=' + tripId} className="text-xs text-orange-600">Ver ruta completa →</Link>
        </div>
      )}

      {/* HOY */}
      {todayCity && (
        <DaySection
          label="Hoy"
          city={todayCity}
          docs={docsForDate(todayStr)}
          spots={spotsForCity(todayCity.id)}
          tripId={tripId}
          isToday={true}
        />
      )}

      {/* MAÑANA */}
      {tomorrowCity && (
        <DaySection
          label="Mañana"
          city={tomorrowCity}
          docs={docsForDate(tomorrowStr)}
          spots={spotsForCity(tomorrowCity.id)}
          tripId={tripId}
          isToday={false}
        />
      )}

      {/* Gastos hoy — solo si hay */}
      {todayExpenses.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">💰 Gastos de hoy</p>
            <span className="text-sm font-semibold text-foreground">{todayTotal.toFixed(2)} {currency}</span>
          </div>
          <div className="space-y-1.5">
            {todayExpenses.slice(0, 3).map(exp => (
              <div key={exp.id} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground truncate flex-1">{exp.description || exp.category || 'Gasto'}</span>
                <span className="text-xs font-medium text-foreground ml-2">{(exp.amount || 0).toFixed(2)} {currency}</span>
              </div>
            ))}
          </div>
          <Link to={createPageUrl('Expenses') + '?trip_id=' + tripId} className="block mt-2 text-xs text-orange-600 text-center">Ver todos →</Link>
        </div>
      )}

      {/* Viajeros */}
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Viajeros
        </p>
        <TripMembersPanel trip={trip} currentUserEmail={''} />
      </div>
    </div>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────
function ChatTab({ tripId, currentUserEmail, myProfile }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 10000,
    refetchInterval: 15000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 5 * 60 * 1000,
  });

  const profileMap = useMemo(() => {
    const m = {};
    profiles.forEach(p => { if (p.user_email || p.created_by) m[p.user_email || p.created_by] = p; });
    return m;
  }, [profiles]);

  const sortedMessages = useMemo(() =>
    [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    [messages]
  );

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.TripMessage.create({
        trip_id: tripId,
        content: message.trim(),
        created_by: currentUserEmail,
        sender_name: myProfile?.display_name || currentUserEmail,
      });
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
    } catch {}
    setSending(false);
  };

  const formatTime = (d) => { try { return format(new Date(d), 'HH:mm'); } catch { return ''; } };
  const formatDate = (d) => { try { const dt = new Date(d); return isToday(dt) ? 'Hoy' : format(dt, 'dd MMM', { locale: es }); } catch { return ''; } };

  const grouped = useMemo(() => {
    const items = [];
    let lastDate = null;
    sortedMessages.forEach(msg => {
      const dl = formatDate(msg.created_date);
      if (dl !== lastDate) { items.push({ type: 'date', label: dl }); lastDate = dl; }
      items.push({ type: 'msg', msg });
    });
    return items;
  }, [sortedMessages]);

  return (
    <div className="flex flex-col" style={{ minHeight: '55vh' }}>
      <div className="flex-1 space-y-1 pb-4" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        {grouped.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm text-muted-foreground">Empieza la conversación del viaje</p>
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === 'date') return (
            <div key={i} className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          );
          const { msg } = item;
          const me = msg.created_by === currentUserEmail;
          const profile = profileMap[msg.created_by];
          const displayName = profile?.display_name || msg.sender_name || (msg.created_by || '').split('@')[0] || 'Usuario';
          const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={msg.id || i} className={`flex items-end gap-2 ${me ? 'flex-row-reverse' : 'flex-row'}`}>
              {!me && (
                <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs font-semibold text-orange-700 shrink-0 mb-1">{initials}</div>
              )}
              <div className={`flex flex-col max-w-[75%] ${me ? 'items-end' : 'items-start'}`}>
                {!me && <p className="text-xs text-muted-foreground mb-0.5 px-1">{displayName}</p>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${me ? 'bg-orange-700 text-white rounded-br-sm' : 'bg-secondary border border-border text-foreground rounded-bl-sm'}`}>
                  {msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 px-1">{formatTime(msg.created_date)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input value={message} onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Mensaje..." className="flex-1 h-10 text-sm" disabled={sending} />
        <Button onClick={sendMessage} disabled={!message.trim() || sending}
          className="h-10 px-4 bg-orange-700 hover:bg-orange-800 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [formData, setFormData] = useState({});
  const [tab, setTab] = useState('main');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    if (!id || id === 'null' || id === 'default') { navigate(createPageUrl('TripsList'), { replace: true }); return; }
    setTripId(id);
    window.scrollTo(0, 0);
  }, [navigate]);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripId ? base44.entities.Trip.get(tripId) : null,
    enabled: !!tripId,
    onSuccess: (data) => { if (data) setFormData({ name: data.name||'', destination: data.destination||'', country: data.country||'', start_date: data.start_date||'', end_date: data.end_date||'', description: data.description||'', cover_image: data.cover_image||'', currency: data.currency||'EUR', members: data.members||[] }); }
  });

  useEffect(() => {
    if (trip && !formData.name) setFormData({ name: trip.name||'', destination: trip.destination||'', country: trip.country||'', start_date: trip.start_date||'', end_date: trip.end_date||'', description: trip.description||'', cover_image: trip.cover_image||'', currency: trip.currency||'EUR', members: trip.members||[] });
  }, [trip]);

  const updateTripMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.update(tripId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setSettingsOpen(false); }
  });

  const deleteTripMutation = useMutation({
    mutationFn: () => base44.entities.Trip.delete(tripId),
    onSuccess: () => { setDeleteOpen(false); navigate(createPageUrl('TripsList'), { replace: true }); }
  });

  const currentUserEmail = currentUser?.email;
  const roles = trip?.roles || {};
  const isAdmin = !trip || roles[currentUserEmail] === 'admin' || trip?.created_by === currentUserEmail || Object.keys(roles).length === 0;

  const { activeCity, activeMeta, countryRoute } = useTripContext(tripId);

  const { data: cities = [] } = useQuery({ queryKey: ['cities', tripId], queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'), enabled: !!tripId, staleTime: 30000 });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses', tripId], queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: packingItems = [] } = useQuery({ queryKey: ['packingItems', tripId], queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: documents = [] } = useQuery({ queryKey: ['documents', tripId], queryFn: () => base44.entities.Document.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 30000 });
  const { data: tripMessages = [] } = useQuery({ queryKey: ['tripMessages', tripId], queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }), enabled: !!tripId, staleTime: 10000, refetchInterval: 30000 });
  const { data: myProfile } = useQuery({ queryKey: ['myProfile', currentUser?.id], queryFn: async () => { if (!currentUser?.id) return null; const r = await base44.entities.UserProfile.filter({ user_id: currentUser.id }); return r[0]||null; }, enabled: !!currentUser?.id, staleTime: 60000 });

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tripStart = trip?.start_date;
  const tripEnd = trip?.end_date;
  const tripInProgress = tripStart && tripEnd && todayStr >= tripStart && todayStr <= tripEnd;
  const tripNotStarted = tripStart && todayStr < tripStart;
  const daysUntilTrip = tripStart ? differenceInDays(parseISO(tripStart), today) : null;

  const unreadCount = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return tripMessages.filter(m => m.created_by !== currentUserEmail && new Date(m.created_date) > cutoff).length;
  }, [tripMessages, currentUserEmail]);

  const mainTabLabel = tripInProgress ? 'Hoy' : 'Preparación';

  if (tripLoading || !tripId) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-4">🌸</div><p className="text-muted-foreground">Cargando viaje...</p></div>
    </div>
  );

  return (
    <div className="bg-orange-50 min-h-screen">
      {/* Hero */}
      <div className="relative" style={{ backgroundImage: `url(${getTripCoverImage(trip, cities)})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 pt-12">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('TripsList')}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Mis viajes
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm hover:bg-white/30 transition-colors">
                <Search className="w-3.5 h-3.5" /> Buscar
              </button>
              <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 w-9 h-9">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Trip info */}
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{trip?.name}</h1>
          <div className="flex flex-wrap gap-3 text-white/80 text-sm mb-3">
            {cities.length > 0 ? (
              <span className="flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {[...cities].sort((a,b) => (a.start_date||'').localeCompare(b.start_date||'')).map((city, i) => (
                  <span key={city.id} className="flex items-center gap-1">
                    {i > 0 && <ArrowRight className="w-3 h-3 opacity-60" />}
                    {city.name}
                  </span>
                ))}
              </span>
            ) : (
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{trip?.destination}, {trip?.country}</span>
            )}
            {trip?.start_date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(parseISO(trip.start_date), 'dd MMM', { locale: es })}{trip.end_date && ` - ${format(parseISO(trip.end_date), 'dd MMM yyyy', { locale: es })}`}</span>}
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{trip?.members?.length || 1} viajero{(trip?.members?.length || 1) > 1 ? 's' : ''}</span>
          </div>



          {/* Tabs */}
          <div className="flex border-b border-white/20">
            {[
              { key: 'main', label: mainTabLabel },
              { key: 'itinerary', label: 'Itinerario' },
              { key: 'chat', label: unreadCount > 0 ? `Chat · ${unreadCount}` : 'Chat' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${tab === t.key ? 'text-white border-white' : 'text-white/60 border-transparent hover:text-white/80'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-6 pb-28 space-y-4">
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />
        <TripAlerts tripId={tripId} cities={cities} trip={trip} />

        {tab === 'main' && (
          <>
            {tripNotStarted && daysUntilTrip !== null && (
              <TripCountdownBanner daysUntilTrip={daysUntilTrip} tripId={tripId} cities={cities} packingItems={packingItems} trip={trip} expenses={expenses} />
            )}
            {tripInProgress
              ? <TodayTab trip={trip} cities={cities} expenses={expenses} tripId={tripId} trip_members={trip?.members} />
              : <PreTripTab trip={trip} cities={cities} packingItems={packingItems} documents={documents} myProfile={myProfile} />
            }
          </>
        )}

        {tab === 'itinerary' && (
          <IntelligentTimeline tripId={tripId} cities={cities} expenses={expenses} trip={trip} />
        )}

        {tab === 'chat' && (
          <ChatTab tripId={tripId} currentUserEmail={currentUserEmail} myProfile={myProfile} />
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground text-2xl">⚙️ Configuración del Viaje</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label><Input value={formData.name||''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ej. Japón 2025" className="bg-input border-border text-foreground" /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label><Input value={formData.destination||''} onChange={e => setFormData({...formData, destination: e.target.value})} className="bg-input border-border text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">País</label><Input value={formData.country||''} onChange={e => setFormData({...formData, country: e.target.value})} className="bg-input border-border text-foreground" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label><Input type="date" value={formData.start_date||''} onChange={e => setFormData({...formData, start_date: e.target.value})} className="bg-input border-border text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label><Input type="date" value={formData.end_date||''} onChange={e => setFormData({...formData, end_date: e.target.value})} className="bg-input border-border text-foreground" /></div>
            </div>
            <div><label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label><Textarea value={formData.description||''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="bg-input border-border text-foreground" /></div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              {formData.cover_image && <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted"><img src={formData.cover_image} alt="preview" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display='none'} /></div>}
              <Input value={formData.cover_image||''} onChange={e => setFormData({...formData, cover_image: e.target.value})} placeholder="https://images.unsplash.com/..." className="bg-input border-border text-foreground" />
            </div>
            <div className="flex items-center justify-between pt-4">
              {isAdmin && <Button variant="ghost" size="sm" onClick={() => { setSettingsOpen(false); setDeleteOpen(true); }} className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4 mr-2" />Eliminar viaje</Button>}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancelar</Button>
                <Button onClick={() => updateTripMutation.mutate(formData)} className="bg-orange-700 hover:bg-orange-800" disabled={!formData.name || !formData.destination || updateTripMutation.isPending}>{updateTripMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteTripModal open={deleteOpen} onOpenChange={setDeleteOpen} tripName={trip?.name||''} onConfirm={() => deleteTripMutation.mutate()} isPending={deleteTripMutation.isPending} />
    </div>
  );
}
