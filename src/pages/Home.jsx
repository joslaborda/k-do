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
import { getCountryRequirements } from '@/lib/packingDB';

// ── Requirement level badge ───────────────────────────────────────────────────
function ReqBadge({ level }) {
  if (level === 'required') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium shrink-0">Obligatorio</span>;
  if (level === 'recommended') return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">Recomendado</span>;
  return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0">Opcional</span>;
}

const REQ_ICONS = { visa:'🛂', vaccine:'💉', health:'🏥', safety:'⚠️', money:'💰', transport:'🚌', climate:'🌡️', culture:'🙏', tech:'🔌', nature:'🦟' };

// ── Pre-trip tab ──────────────────────────────────────────────────────────────
function PreTripTab({ trip, cities, packingItems, documents, myProfile }) {
  const [reqExpanded, setReqExpanded] = useState(true);

  const originCountry = myProfile?.home_country || 'España';
  const allCountries = useMemo(() => {
    const s = new Set();
    if (trip?.country) s.add(trip.country);
    cities.forEach(c => { if (c.country) s.add(c.country); });
    return [...s];
  }, [trip, cities]);

  const allRequirements = useMemo(() => {
    return allCountries.flatMap(country => {
      const r = getCountryRequirements(country, originCountry);
      if (!r?.requirements?.length) return [];
      return r.requirements.map(req => ({ ...req, country, flag: r.flag || '🌍' }));
    }).sort((a, b) => {
      const order = { required: 0, recommended: 1, optional: 2 };
      return (order[a.level] ?? 3) - (order[b.level] ?? 3);
    });
  }, [allCountries, originCountry]);

  const urgentCount = allRequirements.filter(r => r.level === 'required').length;
  const packedCount = packingItems.filter(i => i.packed).length;
  const packedPct = packingItems.length ? Math.round(packedCount / packingItems.length * 100) : 0;
  const docsCount = documents?.length || 0;

  const tripId = trip?.id;
  const start = trip?.start_date;
  const daysLeft = start ? differenceInDays(parseISO(start), new Date()) : null;

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
            <p className="text-xs text-muted-foreground mt-1">{docsCount === 0 ? 'Ninguno subido' : docsCount === 1 ? '1 documento' : `${docsCount} documentos`}</p>
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
                {urgentCount > 0 && <p className="text-xs text-red-600">{urgentCount} obligatorio{urgentCount > 1 ? 's' : ''}</p>}
              </div>
            </div>
            {reqExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {reqExpanded && (
            <div className="border-t border-border divide-y divide-border">
              {allRequirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-lg shrink-0 mt-0.5">{REQ_ICONS[req.type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium text-foreground">{req.title}</p>
                      <ReqBadge level={req.level} />
                    </div>
                    {req.description && <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>}
                    {allCountries.length > 1 && <p className="text-xs text-muted-foreground mt-0.5">{req.flag} {req.country}</p>}
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-secondary/30">
                <p className="text-xs text-muted-foreground">Requisitos para pasaporte de {originCountry}. Verifica siempre con fuentes oficiales.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Viajeros */}
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Viajeros</p>
        <TripMembersPanel trip={trip} currentUserEmail={''} />
      </div>
    </div>
  );
}

// ── Today tab ─────────────────────────────────────────────────────────────────
function TodayTab({ trip, cities, expenses, tripId }) {
  const today = new Date();

  // Find today's city
  const todayCity = useMemo(() => {
    return cities.find(c => {
      if (!c.start_date || !c.end_date) return false;
      const s = parseISO(c.start_date), e = parseISO(c.end_date);
      return today >= s && today <= e;
    }) || cities[0];
  }, [cities, today]);

  // Today's expenses
  const todayExpenses = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    return expenses.filter(e => e.date === todayStr || (e.created_date && e.created_date.startsWith(todayStr)));
  }, [expenses, today]);

  const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSoFar = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const currency = trip?.currency || 'EUR';

  // Tomorrow's city / transport
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowCity = useMemo(() => {
    return cities.find(c => {
      if (!c.start_date) return false;
      const s = parseISO(c.start_date);
      return format(s, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
    });
  }, [cities, tomorrow]);

  const { data: todayDocs = [] } = useQuery({
    queryKey: ['todayDocs', tripId, format(today, 'yyyy-MM-dd')],
    queryFn: async () => {
      const all = await base44.entities.Document.filter({ trip_id: tripId });
      const todayStr = format(today, 'yyyy-MM-dd');
      return all.filter(d => d.date === todayStr || d.valid_from === todayStr);
    },
    enabled: !!tripId,
    staleTime: 60000,
  });

  const dayNumber = trip?.start_date ? differenceInDays(today, parseISO(trip.start_date)) + 1 : null;
  const totalDays = (trip?.start_date && trip?.end_date) ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1 : null;

  return (
    <div className="space-y-4">
      {/* Current city header */}
      {todayCity && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-orange-600" />
            <p className="text-sm font-semibold text-foreground">Hoy en {todayCity.name}</p>
            {dayNumber && totalDays && (
              <span className="ml-auto text-xs text-muted-foreground">Día {dayNumber} de {totalDays}</span>
            )}
          </div>
          {todayCity.notes && <p className="text-xs text-muted-foreground mt-1">{todayCity.notes}</p>}
        </div>
      )}

      {/* Today's docs */}
      {todayDocs.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Documentos de hoy</p>
          </div>
          {todayDocs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
              <span className="text-lg">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title || doc.name}</p>
                {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
              </div>
              <Link to={createPageUrl('Documents') + '?trip_id=' + tripId} className="text-xs text-orange-600">Ver →</Link>
            </div>
          ))}
        </div>
      )}

      {/* Today's expenses */}
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3">💰 Gastos</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Hoy</span>
          <span className="text-sm font-semibold text-foreground">{todayTotal.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total viaje</span>
          <span className="text-sm text-muted-foreground">{totalSoFar.toFixed(2)} {currency}</span>
        </div>
        {todayExpenses.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
            {todayExpenses.slice(0, 4).map(exp => (
              <div key={exp.id} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground truncate flex-1">{exp.description || exp.category || 'Gasto'}</span>
                <span className="text-xs font-medium text-foreground ml-2">{(exp.amount || 0).toFixed(2)} {currency}</span>
              </div>
            ))}
          </div>
        )}
        <Link to={createPageUrl('Expenses') + '?trip_id=' + tripId} className="block mt-3 text-xs text-orange-600 text-center">Ver todos los gastos →</Link>
      </div>

      {/* Tomorrow */}
      {tomorrowCity && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">🚆 Mañana</p>
          <p className="text-sm text-amber-900 font-medium">Llegas a {tomorrowCity.name}</p>
          {tomorrowCity.transport_notes && <p className="text-xs text-amber-700 mt-0.5">{tomorrowCity.transport_notes}</p>}
        </div>
      )}

      {/* Full timeline link */}
      <Link to={createPageUrl('Cities') + '?trip_id=' + tripId}
        className="flex items-center justify-between bg-white rounded-xl border border-border px-4 py-3 hover:shadow-sm transition-shadow">
        <span className="text-sm font-medium text-foreground">Ver itinerario completo</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────
function ChatTab({ tripId, currentUserEmail, myProfile }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useState(null)[0];

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
    profiles.forEach(p => { m[p.user_email || p.created_by] = p; });
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

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return format(d, 'HH:mm');
    } catch { return ''; }
  };

  const formatMsgDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return 'Hoy';
      return format(d, 'dd MMM', { locale: es });
    } catch { return ''; }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    sortedMessages.forEach(msg => {
      const dateLabel = formatMsgDate(msg.created_date);
      if (dateLabel !== lastDate) {
        groups.push({ type: 'date', label: dateLabel });
        lastDate = dateLabel;
      }
      groups.push({ type: 'message', msg });
    });
    return groups;
  }, [sortedMessages]);

  const isMe = (msg) => msg.created_by === currentUserEmail;

  return (
    <div className="flex flex-col" style={{ minHeight: '60vh' }}>
      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto px-1 pb-4" style={{ maxHeight: '60vh' }}>
        {groupedMessages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm text-muted-foreground">Empieza la conversación</p>
          </div>
        )}
        {groupedMessages.map((item, i) => {
          if (item.type === 'date') {
            return (
              <div key={i} className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2">{item.label}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            );
          }
          const { msg } = item;
          const me = isMe(msg);
          const profile = profileMap[msg.created_by];
          const displayName = profile?.display_name || msg.sender_name || msg.created_by?.split('@')[0] || 'Usuario';
          const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

          return (
            <div key={msg.id || i} className={`flex items-end gap-2 ${me ? 'flex-row-reverse' : 'flex-row'}`}>
              {!me && (
                <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs font-semibold text-orange-700 shrink-0 mb-1">
                  {initials}
                </div>
              )}
              <div className={`flex flex-col ${me ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {!me && <p className="text-xs text-muted-foreground mb-0.5 px-1">{displayName}</p>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  me
                    ? 'bg-orange-700 text-white rounded-br-sm'
                    : 'bg-white border border-border text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 px-1">{formatMsgTime(msg.created_date)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border mt-3">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Mensaje..."
          className="flex-1 h-10 text-sm"
          disabled={sending}
        />
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
  const [tab, setTab] = useState('main'); // 'main' | 'itinerary' | 'chat'
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('trip_id');
    if (!id || id === 'null' || id === 'default') {
      navigate(createPageUrl('TripsList'), { replace: true });
      return;
    }
    setTripId(id);
    window.scrollTo(0, 0);
  }, [navigate]);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripId ? base44.entities.Trip.get(tripId) : null,
    enabled: !!tripId,
    onSuccess: (data) => {
      if (data) setFormData({ name: data.name||'', destination: data.destination||'', country: data.country||'', start_date: data.start_date||'', end_date: data.end_date||'', description: data.description||'', cover_image: data.cover_image||'', currency: data.currency||'EUR', members: data.members||[] });
    }
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
  const tripStart = trip?.start_date ? new Date(trip.start_date) : null;
  const tripEnd = trip?.end_date ? new Date(trip.end_date) : null;
  const tripInProgress = tripStart && tripEnd && today >= tripStart && today <= tripEnd;
  const tripNotStarted = tripStart && today < tripStart;
  const daysUntilTrip = tripStart ? differenceInDays(tripStart, today) : null;

  // Unread messages count (messages not from me, in last 24h)
  const unreadCount = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return tripMessages.filter(m => m.created_by !== currentUserEmail && new Date(m.created_date) > cutoff).length;
  }, [tripMessages, currentUserEmail]);

  const mainTabLabel = tripInProgress ? 'Hoy' : 'Preparación';

  if (tripLoading || !tripId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">🌸</div><p className="text-muted-foreground">Cargando viaje...</p></div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 min-h-screen">
      {/* Hero */}
      <div className="relative" style={{ backgroundImage: `url(${getTripCoverImage(trip, cities)})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
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

            {/* Trip title */}
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{trip?.name}</h1>
            <div className="flex flex-wrap gap-3 text-white/80 text-sm mb-3">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{trip?.destination}, {trip?.country}</span>
              {trip?.start_date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(trip.start_date), 'dd MMM', { locale: es })}{trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}</span>}
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{trip?.members?.length || 1} viajero{(trip?.members?.length || 1) > 1 ? 's' : ''}</span>
            </div>

            {/* Active city badge */}
            {activeCity && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
                  <span>{activeMeta?.flag}</span>
                  <span>Ahora: {activeCity.name}</span>
                  <span className="text-white/60">· {activeMeta?.currency}</span>
                </span>
                {countryRoute?.length > 1 && (
                  <span className="text-white/60 text-xs flex items-center gap-1">
                    {countryRoute.map((c, i) => <span key={c} className="flex items-center gap-1">{i > 0 && <ArrowRight className="w-3 h-3" />}{c}</span>)}
                  </span>
                )}
              </div>
            )}

            {/* TABS */}
            <div className="flex border-b border-white/20">
              {[
                { key: 'main', label: mainTabLabel },
                { key: 'itinerary', label: 'Itinerario' },
                { key: 'chat', label: unreadCount > 0 ? `Chat · ${unreadCount}` : 'Chat' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    tab === t.key
                      ? 'text-white border-white'
                      : 'text-white/60 border-transparent hover:text-white/80'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-6 pb-28">
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} tripId={tripId} />
        <TripAlerts tripId={tripId} cities={cities} trip={trip} />

        {/* PRE-TRIP / TODAY TAB */}
        {tab === 'main' && (
          <>
            {tripNotStarted && daysUntilTrip !== null && (
              <TripCountdownBanner daysUntilTrip={daysUntilTrip} tripId={tripId} cities={cities} packingItems={packingItems} trip={trip} expenses={expenses} />
            )}
            {tripInProgress ? (
              <TodayTab trip={trip} cities={cities} expenses={expenses} tripId={tripId} />
            ) : (
              <PreTripTab trip={trip} cities={cities} packingItems={packingItems} documents={documents} myProfile={myProfile} />
            )}
          </>
        )}

        {/* ITINERARY TAB */}
        {tab === 'itinerary' && (
          <IntelligentTimeline tripId={tripId} cities={cities} expenses={expenses} trip={trip} />
        )}

        {/* CHAT TAB */}
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
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label><Input value={formData.destination||''} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="ej. Tokio" className="bg-input border-border text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">País</label><Input value={formData.country||''} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="ej. Japón" className="bg-input border-border text-foreground" /></div>
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
