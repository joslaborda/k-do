import { useState, useRef, useEffect } from 'react';
import { Bell, Check, UserPlus, Bookmark, Mail, MapPin, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  follow:         { icon: UserPlus,  color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'te ha seguido' },
  template_save:  { icon: Bookmark,  color: 'text-orange-500', bg: 'bg-orange-50', label: 'ha guardado tu itinerario' },
  trip_invite:    { icon: Mail,      color: 'text-green-500',  bg: 'bg-green-50',  label: 'te ha invitado a un viaje' },
  trip_update:    { icon: MapPin,    color: 'text-purple-500', bg: 'bg-purple-50', label: 'actualizó el viaje' },
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

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const queryClient = useQueryClient();

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

  const unread = notifications.filter(n => !n.read).length;

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unreadItems = notifications.filter(n => !n.read);
      await Promise.all(unreadItems.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors text-white"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-orange-700">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
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
            {notifications.length === 0 ? (
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