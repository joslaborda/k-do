import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Mail, FileText, Receipt, Camera, UserPlus, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

// Icon + color per type
const TYPE = {
  doc_added:        { Icon: FileText,  color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'subió un documento' },
  expense_added:    { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  label: 'añadió un gasto' },
  expense_settled:  { Icon: Receipt,   color: 'text-green-600',  bg: 'bg-green-50',  label: 'liquidó tu deuda' },
  photo_added:      { Icon: Camera,    color: 'text-orange-500', bg: 'bg-orange-50', label: 'subió fotos' },
  member_joined:    { Icon: UserPlus,  color: 'text-violet-500', bg: 'bg-violet-50', label: 'se unió al viaje' },
  trip_invite:      { Icon: Mail,      color: 'text-primary',    bg: 'bg-orange-50', label: 'te invitó a un viaje' },
  spot_added:       { Icon: Compass,   color: 'text-orange-500', bg: 'bg-orange-50', label: 'añadió un spot' },
};
const FALLBACK = { Icon: Bell, color: 'text-muted-foreground', bg: 'bg-secondary', label: 'nueva notificación' };

function NotifItem({ n, currentTripId, onRead }) {
  const cfg = TYPE[n.type] ?? FALLBACK;
  const { Icon } = cfg;
  const name = n.actor_display_name || n.actor_username || 'Alguien';
  const showTrip = !currentTripId && n.trip_name;

  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {n.actor_avatar
          ? <img src={n.actor_avatar} className="w-9 h-9 rounded-full object-cover" alt={name} />
          : <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
        }
        {!n.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{name}</span>
          {' '}{cfg.label}
          {n.ref_title ? <span className="text-muted-foreground"> · {n.ref_title}</span> : ''}
          {showTrip ? <span className="text-muted-foreground"> · {n.trip_name}</span> : ''}
        </p>
        {n.created_date && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: es })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function NotificationBell({ userId, userEmail, currentTripId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const qc = useQueryClient();
  const QKEY = ['notifications', userId];

  const { data: notifications = [] } = useQuery({
    queryKey: QKEY,
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }, '-created_date', 40),
    enabled: !!userId,
    refetchInterval: open ? false : 20000,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const unread = notifications.filter(n => !n.read).length;

  const markOne = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onMutate: (id) => {
      qc.setQueryData(QKEY, old => old?.map(n => n.id === id ? { ...n, read: true } : n));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      if (!unread.length) return;
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onMutate: () => {
      // Optimistic: badge goes to 0 immediately
      qc.setQueryData(QKEY, old => old?.map(n => ({ ...n, read: true })));
    },
    // No onSuccess invalidate — would undo the optimistic update
    // Invalidation happens when panel closes (handleToggle + outside click)
  });

  // Close on outside click + invalidate on close
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        qc.invalidateQueries({ queryKey: QKEY });
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [qc, userId]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      qc.invalidateQueries({ queryKey: QKEY });
    } else {
      setOpen(true);
      markAll.mutate();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-secondary/60 transition-colors"
        aria-label="Notificaciones"
      >
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
            <button
              onClick={() => { setOpen(false); qc.invalidateQueries({ queryKey: QKEY }); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0
              ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                </div>
              )
              : notifications.map(n => (
                  <NotifItem
                    key={n.id}
                    n={n}
                    currentTripId={currentTripId}
                    onRead={(id) => markOne.mutate(id)}
                  />
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
