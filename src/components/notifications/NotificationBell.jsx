import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
import { notify, resolveUserIds } from '@/lib/notifications';
import { Bell, X, Mail, FileText, Receipt, Camera, UserPlus, Compass, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { useTranslation } from 'react-i18next';

const TYPE = {
  doc_added:       { Icon: FileText,  color: 'text-blue-500',   bg: 'bg-blue-50',   labelKey: 'notifications.docAdded' },
  expense_added:   { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  labelKey: 'notifications.expenseAdded' },
  expense_settled: { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  labelKey: 'notifications.expenseSettled' },
  photo_added:     { Icon: Camera,    color: 'text-primary',    bg: 'bg-orange-50', labelKey: 'notifications.photoAdded' },
  member_joined:   { Icon: UserPlus,  color: 'text-violet-500', bg: 'bg-violet-50', labelKey: 'notifications.memberJoined' },
  trip_invite:     { Icon: Mail,      color: 'text-primary',    bg: 'bg-orange-50', labelKey: 'notifications.tripInvite' },
  spot_added:      { Icon: Compass,   color: 'text-primary',    bg: 'bg-orange-50', labelKey: 'notifications.spotAdded' },
};
const FALLBACK = { Icon: Bell, color: 'text-muted-foreground', bg: 'bg-secondary', labelKey: 'notifications.new' };

function TripInviteModal({ notif, onClose, onAccept }) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { t: translate } = useTranslation();
  const [tripData, setTripData] = useState(null);
  const [invite, setInvite] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (!notif?.trip_id) { setLoading(false); return; }
    (async () => {
      try {
        const fetchedTrip = await base44.entities.Trip.get(notif.trip_id);
        setTripData(fetchedTrip);
        if (currentUser?.email) {
          // invites.js siempre guarda el email en minúsculas (normalizedEmail);
          // si aquí se filtraba con currentUser.email tal cual, un email con
          // mayúsculas nunca encontraba su propia invitación pendiente.
          const invs = await base44.entities.TripInvite.filter({ trip_id: notif.trip_id, email: currentUser.email.toLowerCase(), status: 'pending' });
          setInvite(invs[0] || null);
        }
        const memberEmails = fetchedTrip.members || [];
        const users = await base44.entities.User.filter({ email: { $in: memberEmails } });
        const ids = users.map(u => u.id).filter(Boolean);
        const profiles = ids.length
          ? await base44.entities.UserProfile.filter({ user_id: { $in: ids } })
          : [];
        setMembers(memberEmails.map(email => {
          const u = users.find(x => x.email === email);
          const p = profiles.find(x => x.user_id === u?.id);
          return { email, name: p?.display_name || p?.username || email, avatar: p?.avatar_url };
        }));
      } catch {}
      setLoading(false);
    })();
  }, [notif?.trip_id, currentUser?.email]);

  const handleAccept = async () => {
    if (!invite || !currentUser?.email) return;
    setProcessing(true);
    try {
      await acceptTripInvite(invite.id, invite.invite_token);
      try {
        const myProfArr = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
        const myProf = myProfArr[0] || null;
        const latestTrip = await base44.entities.Trip.get(invite.trip_id);
        const others = (latestTrip?.members || []).filter(e => e !== currentUser.email);
        const resolved = await resolveUserIds(others);
        resolved.forEach(({ userId }) => notify({ userId, type: 'member_joined', actor: myProf, tripId: invite.trip_id, tripName: latestTrip?.name }));
      } catch {}
      qc.invalidateQueries({ queryKey: ['myPendingInvites'] });
      onAccept(tripData);
    } catch (e) {
      console.error('Error aceptando invitación:', e);
    }
    setProcessing(false);
  };

  const handleDecline = async () => {
    if (!invite) return;
    setProcessing(true);
    try {
      await declineTripInvite(invite.id, invite.invite_token);
      qc.invalidateQueries({ queryKey: ['myPendingInvites'] });
      onClose();
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-background rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{translate('common.loading')}</div>
        ) : tripData ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('notifications.inviteFrom')} <span className="font-medium text-foreground">{notif.actor_display_name || notif.actor_username || t('notifications.someone')}</span></p>
                <p className="text-base font-semibold text-foreground">{tripData.name || tripData.destination}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 mb-5">
              {tripData.destination && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{tripData.destination}{tripData.country ? `, ${tripData.country}` : ''}</span>
                </div>
              )}
              {tripData.start_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={12} className="text-muted-foreground flex-shrink-0" />
                  <span>
                    {parseISO(tripData.start_date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {tripData.end_date && ` — ${parseISO(tripData.end_date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </span>
                </div>
              )}
              {members.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <div className="flex -space-x-2">
                    {members.slice(0, 4).map(m => (
                      m.avatar
                        ? <img key={m.email} src={m.avatar} className="w-6 h-6 rounded-full object-cover border-2 border-card" alt={m.name} />
                        : <div key={m.email} className="w-6 h-6 rounded-full bg-orange-100 border-2 border-card flex items-center justify-center text-micro font-bold text-primary">{m.name.slice(0,2).toUpperCase()}</div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{members.length} {members.length !== 1 ? translate('common.travelers') : translate('common.traveler')}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleDecline} disabled={processing}
                className="flex-1 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground bg-card">
                {translate('invites.reject')}
              </button>
              <button onClick={handleAccept} disabled={processing || !invite}
                className="flex-1 h-11 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50">
                {processing ? translate('common.loading') : translate('notifications.joinTrip')}
              </button>
            </div>
          </>
        ) : <div className="py-8 text-center text-sm text-muted-foreground">{translate('errors.generic')}</div>}
      </div>
    </div>
  );
}

function NotifItem({ n, currentTripId, onRead, onNavigate }) {
  const { t } = useTranslation();
  const cfg = TYPE[n.type] ?? FALLBACK;
  const { Icon } = cfg;
  const name = n.actor_display_name || n.actor_username || t('notifications.someone');
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
          <span className="font-semibold">{name}</span>{' '}{t(cfg.labelKey)}
          {n.ref_title ? <span className="text-muted-foreground"> · {n.ref_title}</span> : ''}
          {showTrip ? <span className="text-muted-foreground"> · {n.trip_name}</span> : ''}
        </p>
        {n.created_date && <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: es })}</p>}
      </div>
    </div>
  );
}

export default function NotificationBell({ userId, userEmail, currentTripId }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [inviteNotif, setInviteNotif] = useState(null);
  const ref = useRef();
  const bellRef = useRef();
  const notifsRef = useRef([]);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const key = ['notifications', userId, currentTripId || 'all'];

  const { data: notifications = [] } = useQuery({
    queryKey: key,
    queryFn: () => currentTripId
      ? base44.entities.Notification.filter({ user_id: userId, trip_id: currentTripId }, '-created_date', 40)
      : base44.entities.Notification.filter({ user_id: userId }, '-created_date', 40),
    enabled: !!userId,
    refetchInterval: open ? false : 20000,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  notifsRef.current = notifications;
  const unread = notifications.filter(n => !n.read).length;

  const markAll = async () => {
    const items = notifsRef.current.filter(n => !n.read);
    qc.setQueryData(key, (old = []) => old.map(n => ({ ...n, read: true })));
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
      case 'doc_added':       return navigate(createPageUrl('Documents') + trip + (n.ref_id ? `&doc_id=${n.ref_id}` : ''));
      case 'expense_added':   return navigate(createPageUrl('Expenses') + trip);
      case 'expense_settled': return navigate(createPageUrl('Expenses') + trip + '&tab=balances');
      case 'photo_added':     return navigate(createPageUrl('Photos') + trip);
      case 'member_joined':   return navigate(createPageUrl('Home') + trip + '&scroll=members');
      case 'spot_added':      return navigate(createPageUrl('Cities') + trip + (extra.spotDate ? `&date=${extra.spotDate}` : ''));
      default:                return navigate(createPageUrl('Home') + trip);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <button ref={bellRef} onClick={handleToggle}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-secondary/60 transition-colors"
          aria-label={t('notifications.title')}>
          <Bell className="w-5 h-5 text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-label font-bold flex items-center justify-center px-1 border-2 border-background">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div style={{position:"fixed", top: bellRef.current ? bellRef.current.getBoundingClientRect().bottom + 8 : 64, right: 12}} className="w-80 max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-2xl shadow-xl z-[200] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm text-foreground">{t('notifications.title')}</span>
              <button aria-label={t('common.close')} onClick={doClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0
                ? <div className="py-12 text-center"><Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{t('notifications.noNotifications')}</p></div>
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
    </div>
  );
}
