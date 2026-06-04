import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Check, UserPlus, Bookmark, Mail, MapPin, X, FileText, Receipt, MessageCircle, Camera, Compass } from 'lucide-react';
import { acceptTripInvite, declineTripInvite } from '@/lib/invites';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

const TYPE_CONFIG = {
  follow:          { icon: UserPlus,      color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'te ha seguido' },
  template_save:   { icon: Bookmark,      color: 'text-orange-500', bg: 'bg-orange-50', label: 'guardó tu itinerario' },
  trip_invite:     { icon: Mail,          color: 'text-green-500',  bg: 'bg-green-50',  label: 'te invitó a un viaje' },
  trip_update:     { icon: MapPin,        color: 'text-purple-500', bg: 'bg-purple-50', label: 'actualizó el viaje' },
  trip_join:       { icon: UserPlus,      color: 'text-green-500',  bg: 'bg-green-50',  label: 'se unió al viaje' },
  spot_added:      { icon: Compass,       color: 'text-orange-500', bg: 'bg-orange-50', label: 'añadió un spot' },
  spot_time:       { icon: Compass,       color: 'text-orange-500', bg: 'bg-orange-50', label: 'modificó la hora de un spot' },
  doc_added:       { icon: FileText,      color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'subió un documento' },
  expense_added:   { icon: Receipt,       color: 'text-green-500',  bg: 'bg-green-50',  label: 'añadió un gasto' },
  expense_settled: { icon: Receipt,       color: 'text-green-500',  bg: 'bg-green-50',  label: 'liquidó una deuda' },
  chat_message:    { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50', label: 'escribió en el chat' },
  photo_upload:    { icon: Camera,        color: 'text-orange-500', bg: 'bg-orange-50', label: 'subió fotos' },
};

function NotifItem({ n, onRead }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.trip_update;
  const Icon = cfg.icon;
  const name = n.actor_display_name || n.actor_username || 'Alguien';
  const hasValidAvatar = n.actor_avatar && n.actor_avatar.startsWith('http');

  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors ${!n.read ? 'bg-orange-50/40' : ''}`}
    >
      <div className="relative flex-shrink-0">
        {hasValidAvatar
          ? <img src={n.actor_avatar} className="w-9 h-9 rounded-full object-cover" alt={name} />
          : <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
        }
        {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{name}</span>
          {' '}{cfg.label}
          {n.ref_title ? <span className="font-medium"> · {n.ref_title}</span> : ''}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: es }) : ''}
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
  const qc = useQueryClient();
  const QKEY = ['notifications', userId];

  // Notifications query — no refetch while panel open
  const { data: notifications = [] } = useQuery({
    queryKey: QKEY,
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }, '-created_date', 30),
    enabled: !!userId,
    refetchInterval: open ? false : 20000,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Pending invites — only when open
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites', userEmail],
    queryFn: () => base44.entities.TripInvite.filter({ email: userEmail, status: 'pending' }),
    enabled: !!userEmail && open,
    staleTime: 30000,
  });

  const unread = notifications.filter(n => !n.read).length;

  // Mark all read — optimistic + server
  const markAllRead = useMutation({
    mutationFn: async () => {
      const items = notifications.filter(n => !n.read);
      if (!items.length) return;
      await Promise.all(items.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onMutate: () => {
      qc.setQueryData(QKEY, old => old?.map(n => ({ ...n, read: true })) ?? old);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });

  const markOne = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onMutate: (id) => {
      qc.setQueryData(QKEY, old => old?.map(n => n.id === id ? { ...n, read: true } : n) ?? old);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) handleClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    markAllRead.mutate();
  }, [notifications]);

  const handleClose = useCallback(() => {
    setOpen(false);
    qc.invalidateQueries({ queryKey: QKEY });
  }, [qc, QKEY]);

  const handleAccept = async (inv) => {
    setProcessingInvite(inv.id);
    try {
      await acceptTripInvite(inv.id, inv.invite_token, inv.trip_id, userEmail);
      qc.invalidateQueries({ queryKey: ['pendingInvites', userEmail] });
      handleClose();
      navigate(createPageUrl('Home') + '?trip_id=' + inv.trip_id);
    } catch {}
    setProcessingInvite(null);
  };

  const handleDecline = async (inv) => {
    setProcessingInvite(inv.id);
    try {
      await declineTripInvite(inv.id, inv.invite_token);
      qc.invalidateQueries({ queryKey: ['pendingInvites', userEmail] });
    } catch {}
    setProcessingInvite(null);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => open ? handleClose() : handleOpen()}
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

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Notificaciones</span>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Invites on top */}
            {pendingInvites.map(inv => (
              <div key={inv.id} className="mx-3 my-2 rounded-xl border border-orange-200 overflow-hidden" style={{background:'#fff7ed'}}>
                <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'#fde8df'}}>
                    <Mail className="w-4 h-4" style={{color:'#c2410c'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{color:'#7c2d12'}}>{inv.trip_name || 'Nuevo viaje'}</p>
                    <p className="text-xs mt-0.5" style={{color:'#9a3412'}}>{inv.invited_by || 'Alguien'} te ha invitado</p>
                  </div>
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <button onClick={() => handleAccept(inv)} disabled={processingInvite === inv.id}
                    className="py-1.5 rounded-full text-xs font-medium text-white" style={{flex:2, background:'#c2410c'}}>
                    {processingInvite === inv.id ? '...' : 'Aceptar'}
                  </button>
                  <button onClick={() => handleDecline(inv)} disabled={processingInvite === inv.id}
                    className="py-1.5 rounded-full text-xs" style={{flex:1, border:'0.5px solid #fed7aa', color:'#9a3412'}}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}

            {/* Notifications */}
            {notifications.length === 0 && pendingInvites.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sin notificaciones
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} n={n} onRead={(id) => markOne.mutate(id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
