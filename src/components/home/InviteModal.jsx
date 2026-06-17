import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, Copy, Send, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendTripInvite } from '@/lib/invites';
import { useQuery } from '@tanstack/react-query';

const AVATAR_COLORS = [
  'bg-orange-100 text-primary',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
];

function MiniAvatar({ email, profiles = [], index = 0 }) {
  const prof = profiles.find(p => p.email === email || p.user_email === email);
  const name = prof?.display_name || prof?.username || email || '?';
  const initials = name.slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  if (prof?.avatar_url) {
    return <img src={prof.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export default function InviteModal({ open, onClose, trip, tripId, queryClient, profiles = [] }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const members = trip?.members || [];

  // Invitaciones pendientes para este viaje
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['tripPendingInvites', tripId],
    queryFn: () => base44.entities.TripInvite.filter({ trip_id: tripId, status: 'pending' }),
    enabled: !!tripId && open,
    staleTime: 30000,
  });

  // Validación en tiempo real: comprobar si el email introducido ya está
  const emailLower = email.trim().toLowerCase();
  const isAlreadyMember = emailLower && members.some(m => m.toLowerCase() === emailLower);
  const isAlreadyInvited = emailLower && pendingInvites.some(i => i.email?.toLowerCase() === emailLower);

  const handleInvite = async () => {
    const raw = email.trim();
    if (!raw) { setError('Introduce un email o @usuario'); return; }
    setSending(true); setError('');
    try {
      let resolvedEmail = raw;
      if (!raw.includes('@') || raw.startsWith('@')) {
        const query = raw.startsWith('@') ? raw.slice(1) : raw;
        let found = await base44.entities.UserProfile.filter({ username_normalized: query.toLowerCase() });
        if (!found.length) {
          found = await base44.entities.UserProfile.filter({ username: query });
        }
        const profile = found[0] || null;
        if (!profile) { setError(`No existe el usuario @${query}`); setSending(false); return; }
        if (profile.email) {
          resolvedEmail = profile.email;
        } else {
          const users = await base44.entities.User.filter({ id: profile.user_id });
          const user = users[0] || null;
          if (!user?.email) { setError('No se pudo resolver el email'); setSending(false); return; }
          resolvedEmail = user.email;
        }
      }
      if (members.includes(resolvedEmail.toLowerCase())) {
        setError('Este usuario ya es miembro del viaje');
        setSending(false); return;
      }
      if (pendingInvites.some(i => i.email?.toLowerCase() === resolvedEmail.toLowerCase())) {
        setError('Ya hay una invitación pendiente para este email');
        setSending(false); return;
      }
      const result = await sendTripInvite({
        tripId, email: resolvedEmail, role: 'editor',
        tripName: trip?.name || 'el viaje',
        inviterEmail: trip?.created_by || '',
        inviterName: trip?.created_by || '',
      });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripPendingInvites', tripId] });
      if (!result?.emailSent && result?.inviteUrl) {
        setShareLink(result.inviteUrl);
      } else {
        setDone(true); setSentTo(resolvedEmail); setEmail('');
        setTimeout(() => { setDone(false); onClose(); }, 2500);
      }
    } catch (e) { setError(e?.message || 'Error al enviar la invitación. Inténtalo de nuevo.'); }
    setSending(false);
  };

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-background rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        {done ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-base font-semibold text-foreground">¡Invitación enviada!</p>
            <p className="text-sm text-muted-foreground text-center">Hemos enviado un email a {sentTo}</p>
          </div>
        ) : shareLink ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Invitación creada</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">No podemos enviar email a usuarios externos. Comparte este enlace por WhatsApp o iMessage.</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1.5">Enlace de invitación</p>
              <p className="text-xs text-foreground font-mono break-all leading-relaxed">{shareLink}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="w-full h-11 rounded-full bg-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              {copied ? <><Check className="w-4 h-4" />¡Copiado!</> : <><Copy className="w-4 h-4" />Copiar enlace</>}
            </button>
            <button onClick={() => { setShareLink(''); onClose(); }} className="text-xs text-muted-foreground text-center py-1">Cerrar</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Invitar al viaje</h2>
            </div>

            {/* Input */}
            <div className={`bg-card border rounded-2xl px-4 py-3 flex items-center gap-2 transition-colors ${
              isAlreadyMember || isAlreadyInvited ? 'border-amber-300' : 'border-border'
            }`}>
              <Send className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
                placeholder="email@ejemplo.com o @usuario" type="email" autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>

            {/* Validación inline en tiempo real */}
            {isAlreadyMember && (
              <p className="text-xs text-amber-700 mt-2 px-1">Ya es miembro del viaje</p>
            )}
            {isAlreadyInvited && !isAlreadyMember && (
              <p className="text-xs text-amber-700 mt-2 px-1">Ya tiene una invitación pendiente</p>
            )}

            {/* Error de envío */}
            {error && !isAlreadyMember && !isAlreadyInvited && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Lista de miembros y pendientes */}
            {(members.length > 0 || pendingInvites.length > 0) && (
              <div className="mt-4 border border-border rounded-2xl overflow-hidden">
                {/* Miembros aceptados */}
                {members.map((memberEmail, i) => {
                  const prof = profiles.find(p => p.email === memberEmail || p.user_email === memberEmail);
                  const name = prof?.display_name || prof?.username || memberEmail;
                  return (
                    <div key={memberEmail} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 || pendingInvites.length > 0 ? 'border-t border-border' : ''}`}>
                      <MiniAvatar email={memberEmail} profiles={profiles} index={i} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{memberEmail}</p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                        <Check className="w-3 h-3" />Miembro
                      </span>
                    </div>
                  );
                })}

                {/* Invitaciones pendientes */}
                {pendingInvites.map((inv, i) => (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-border">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">Invitado por {inv.invited_by || 'admin'}</p>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground bg-card">Cancelar</button>
              <button onClick={handleInvite}
                disabled={!email.trim() || sending || isAlreadyMember || isAlreadyInvited}
                className="flex-1 h-11 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
