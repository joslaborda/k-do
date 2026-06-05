import { useState, useRef, useEffect } from 'react';
import { Bell, X, Mail, FileText, Receipt, Camera, UserPlus, Compass, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

const TYPE = {
  doc_added:       { Icon: FileText,  color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'subió un documento' },
  expense_added:   { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  label: 'añadió un gasto' },
  expense_settled: { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  label: 'liquidó tu deuda' },
  photo_added:     { Icon: Camera,    color: 'text-orange-500', bg: 'bg-orange-50', label: 'subió fotos' },
  member_joined:   { Icon: UserPlus,  color: 'text-violet-500', bg: 'bg-violet-50', label: 'se unió al viaje' },
  trip_invite:     { Icon: Mail,      color: 'text-primary',    bg: 'bg-orange-50', label: 'te invitó a un viaje' },
  spot_added:      { Icon: Compass,   color: 'text-orange-500', bg: 'bg-orange-50', label: 'añadió un spot' },
};
const FALLBACK = { Icon: Bell, color: 'text-muted-foreground', bg: 'bg-secondary', label: 'nueva notificación' };

function TripInviteModal({ notif, onClose, onAccept }) {
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!notif?.trip_id) { setLoading(false); return; }
    (async () => {
      try {
        const t = await base44.entities.Trip.get(notif.trip_id);
        setTrip(t);
        const [profiles, users] = await Promise.all([
          base44.entities.UserProfile.list(),
          base44.entities.User.list(),
        ]);
        setMembers((t.members || []).map(email => {
          const u = users.find(x => x.email === email);
          const p = profiles.find(x => x.user_id === u?.id);
          return { email, name: p?.display_name || p?.username || email.split('@')[0], avatar: p?.avatar_url };
        }));
      } catch {}
      setLoading(false);
    })();
  }, [notif?.trip_id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-foreground">Invitación al viaje</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : trip ? (
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-xl font-semibold text-foreground">{trip.name || trip.destination}</p>
              {trip.destination && <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}</p>}
            </div>
            {trip.start_date && (
              <div className="bg-secondary rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Fechas</p>
                <p className="text-sm font-medium">
                  {new Date(trip.start_date).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                  {trip.end_date && ` → ${new Date(trip.end_date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </p>
              </div>
            )}
            {members.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" />{members.length} viajero{members.length !== 1 ? 's' : ''}</p>
                <div className="flex gap-2 flex-wrap">
                  {members.map(m => (
                    <div key={m.email} className="flex items-center gap-1.5">
                      {m.avatar ? <img src={m.avatar} className="w-7 h-7 rounded-full object-cover" alt={m.name} />
                        : <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-primary">{m.name.slice(0,2).toUpperCase()}</div>}
                      <span className="text-xs text-muted-foreground">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Invitado por <span className="font-medium text-foreground">{notif.actor_display_name || 'Alguien'}</span></p>
          </div>
        ) : <div className="py-8 text-center text-sm text-muted-foreground">No se pudo cargar el viaje</div>}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-sm text-muted-foreground">Cerrar</button>
          {trip && <button onClick={() => onAccept(trip)} className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-medium">Ver viaje</button>}
        </div>
      </div>
    </div>
  );
}

function NotifItem({ n, currentTripId, onRead, onNavigate }) {
  const cfg = TYPE[n.type] ?? FALLBACK;
  const { Icon } = cfg;
  const name = n.actor_display_name || n.actor_username || 'Alguien';
  const showTrip = !currentTripId && n.trip_name;
  return (
    <div onClick={() => { onRead(n.id); onNavigate(n); }}
      className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
      <div className="relative flex-shrink-0">
        {n.actor_avatar
          ? <img src={n.actor_avatar} className="w-9 h-9 rounded-full object-cover" alt={name} />
          : <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>}
        {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{name}</span>{' '}{cfg.label}
          {n.ref_title ? <span className="text-muted-foreground"> · {n.ref_title}</span> : ''}
          {showTrip ? <span className="text-muted-foreground"> · {n.trip_name}</span> : ''}
        </p>
        {n.created_date && <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: es })}</p>}
      </div>
    </div>
  );
}

export default function NotificationBell({ userId, userEmail, currentTripId }) {
  const [open, setOpen] = useState(false);
  const [inviteNotif, setInviteNotif] = useState(null);
  const ref = useRef();
  const notifsRef = useRef([]);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const key = ['notifications', userId];

  const { data: notifications = [] } = useQuery({
    queryKey: key,
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }, '-created_date', 40),
    enabled: !!userId,
    refetchInterval: open ? false : 20000,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Keep ref always current — avoids stale closure in async functions
  notifsRef.current = notifications;

  const unread = notifications.filter(n => !n.read).length;

  const markAll = async () => {
    const items = notifsRef.current.filter(n => !n.read);
    // Optimistic — update cache immediately
    qc.setQueryData(key, (old = []) => old.map(n => ({ ...n, read: true })));
    // Server — fire and forget
    if (items.length) {
      items.forEach(n => base44.entities.Notification.update(n.id, { read: true }).catch(() => {}));
    }
  };

  const markOne = (id) => {
    qc.setQueryData(key, (old = []) => old.map(n => n.id === id ? { ...n, read: true } : n));
    base44.entities.Notification.update(id, { read: true }).catch(() => {});
  };

  const doClose = () => {
    setOpen(false);
    // Refetch after close to sync with server
    setTimeout(() => qc.invalidateQueries({ queryKey: key }), 500);
  };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) doClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleToggle = () => {
    if (open) { doClose(); }
    else { setOpen(true); markAll(); }
  };

  const handleNavigate = (n) => {
    if (n.type === 'trip_invite') { setInviteNotif(n); return; }
    doClose();
    if (!n.trip_id) return;
    const extra = (() => { try { return n.ref_extra ? JSON.parse(n.ref_extra) : {}; } catch { return {}; } })();
    const trip = `?trip_id=${n.trip_id}`;
    switch (n.type) {
      case 'doc_added':      return navigate(createPageUrl('Documents') + trip + (n.ref_id ? `&doc_id=${n.ref_id}` : ''));
      case 'expense_added':  return navigate(createPageUrl('Expenses') + trip);
      case 'expense_settled':return navigate(createPageUrl('Expenses') + trip + '&tab=balances');
      case 'photo_added':    return navigate(createPageUrl('Photos') + trip);
      case 'member_joined':  return navigate(createPageUrl('Home') + trip + '&scroll=members');
      case 'spot_added':     return navigate(createPageUrl('Cities') + trip + (extra.spotDate ? `&date=${extra.spotDate}` : ''));
      default:               return navigate(createPageUrl('Home') + trip);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleToggle}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-secondary/60 transition-colors"
        aria-label="Notificaciones">
        <Bell className="w-5 h-5 text-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm text-foreground">Notificaciones</span>
            <button onClick={doClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0
              ? <div className="py-12 text-center"><Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">Sin notificaciones</p></div>
              : notifications.map(n => <NotifItem key={n.id} n={n} currentTripId={currentTripId} onRead={markOne} onNavigate={handleNavigate} />)
            }
          </div>
        </div>
      )}

      {inviteNotif && (
        <TripInviteModal notif={inviteNotif} onClose={() => setInviteNotif(null)}
          onAccept={(trip) => { setInviteNotif(null); doClose(); navigate(createPageUrl('Home') + `?trip_id=${trip.id}`); }} />
      )}
    </div>
  );
}
