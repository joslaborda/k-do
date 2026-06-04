import { useState, useRef, useEffect } from 'react';
import { Bell, Check, UserPlus, Bookmark, Mail, MapPin, X, FileText, Receipt, MessageCircle, Camera, Loader2 } from 'lucide-react';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

const TYPE_CONFIG = {
  follow:         { icon: UserPlus,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',   label: 'te ha seguido' },
  template_save:  { icon: Bookmark,  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'ha guardado tu itinerario' },
  trip_invite:    { icon: Mail,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/30',  label: 'te ha invitado a un viaje' },
  trip_update:    { icon: MapPin,    color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', label: 'actualizó el viaje' },
  spot_added:     { icon: MapPin,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'añadió un spot' },
  spot_time:      { icon: MapPin,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'modificó la hora de un spot' },
  doc_added:      { icon: FileText,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',   label: 'subió un documento' },
  expense_added:  { icon: Receipt,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/30',  label: 'añadió un gasto' },
  expense_settled:{ icon: Receipt,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/30',  label: 'liquidó una deuda contigo' },
  chat_message:   { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', label: 'escribió en el chat' },
  photo_upload:   { icon: Camera,        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'subió fotos al viaje' },
  trip_join:      { icon: UserPlus,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/30',  label: 'se unió al viaje' },
};

function NotificationItem({ notif, onRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.trip_update;
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-orange-50/50 transition-colors cursor-pointer border-b border-border/50 last:border-0 ${!notif.read ? 'bg-orange-50/30' : ''}`}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      {/* Avatar / icon */}
      <div className="relative flex-shrink-0">
        {notif.actor_avatar ? (
          <img src={notif.actor_avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
        ) : (
          <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
        )}
        {!notif.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{notif.actor_display_name || notif.actor_username || 'Alguien'}</span>
          {' '}{cfg.label}
          {notif.ref_title ? <span className="font-medium"> "{notif.ref_title}"</span> : ''}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: es })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationBell({ userId, userEmail }) {
  const [open, setOpen] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(null);
  const ref = useRef();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites', userEmail],
    queryFn: () => base44.entities.TripInvite.filter({ email: userEmail, status: 'pending' }),
    enabled: !!userEmail && open,
    staleTime: 30000,
    refetchInterval: open ? 30000 : false,
  });

  const handleAcceptInvite = async (invite) => {
    setProcessingInvite(invite.id);
    try {
      await acceptTripInvite(invite.id, invite.invite_token, invite.trip_id, userEmail);
      queryClient.invalidateQueries({ queryKey: ['pendingInvites', userEmail] });
      setOpen(false);
      navigate(createPageUrl('Home') + '?trip_id=' + invite.trip_id);
    } catch {}
    setProcessingInvite(null);
  };

  const handleDeclineInvite = async (invite) => {
    setProcessingInvite(invite.id);
    try {
      await declineTripInvite(invite.id, invite.invite_token);
      queryClient.invalidateQueries({ queryKey: ['pendingInvites', userEmail] });
    } catch {}
    setProcessingInvite(null);
  };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }, '-created_date', 30),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const unread = notifications.filter(n => !n.read).length + pendingInvites.length;

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unreadItems = notifications.filter(n => !n.read);
      await Promise.all(unreadItems.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onMutate: () => {
      queryClient.setQueryData(['notifications', userId], (old) =>
        old ? old.map(n => ({ ...n, read: true })) : old
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening) markAllRead.mutate();
        }}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-secondary/60 transition-colors text-foreground"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm text-foreground">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-orange-700 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Marcar todas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {/* Pending invites — always on top */}
            {pendingInvites.map(invite => (
              <div key={invite.id} className="mx-3 my-2 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800" style={{background:'#fff7ed'}}>
                <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{background:'#fde8df'}}>
                    <Mail className="w-4 h-4" style={{color:'#c2410c'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{color:'#7c2d12'}}>{invite.trip_name || 'Nuevo viaje'}</p>
                    <p className="text-xs mt-0.5" style={{color:'#9a3412'}}>{invite.invited_by || 'Alguien'} te ha invitado</p>
                  </div>
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    disabled={processingInvite === invite.id}
                    className="flex-2 flex-1 py-1.5 rounded-full text-xs font-medium text-white border-none cursor-pointer"
                    style={{background:'#c2410c', flex:2}}>
                    {processingInvite === invite.id ? '...' : 'Aceptar'}
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite)}
                    disabled={processingInvite === invite.id}
                    className="flex-1 py-1.5 rounded-full text-xs cursor-pointer"
                    style={{background:'transparent', border:'0.5px solid #fed7aa', color:'#9a3412', flex:1}}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}

            {notifications.length === 0 && pendingInvites.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sin notificaciones
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem key={n.id} notif={n} onRead={(id) => markRead.mutate(id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}