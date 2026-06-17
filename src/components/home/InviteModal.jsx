import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Send, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendTripInvite } from '@/lib/invites';

export default function InviteModal({ open, onClose, trip, tripId, queryClient }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const raw = email.trim();
    if (!raw) { setError('Introduce un email o @usuario'); return; }
    setSending(true); setError('');
    try {
      let resolvedEmail = raw;
      if (!raw.includes('@') || raw.startsWith('@')) {
        const query = raw.startsWith('@') ? raw.slice(1) : raw;
        const found = await base44.entities.UserProfile.filter({ username_normalized: query.toLowerCase() });
        const profile = found[0] || (await base44.entities.UserProfile.filter({}))
          .find(p => p.username?.toLowerCase() === query.toLowerCase() || p.display_name?.toLowerCase() === query.toLowerCase());
        if (!profile) { setError(`No existe el usuario @${query}`); setSending(false); return; }
        const users = await base44.entities.User.filter({ id: profile.user_id });
        const user = users[0] || null;
        if (!user?.email) { setError('No se pudo resolver el email'); setSending(false); return; }
        resolvedEmail = user.email;
      }
      const currentMembers = trip?.members || [];
      if (currentMembers.includes(resolvedEmail)) { setError('Este usuario ya es miembro del viaje'); setSending(false); return; }
      const result = await sendTripInvite({
        tripId, email: resolvedEmail, role: 'editor',
        tripName: trip?.name || 'el viaje',
        inviterEmail: trip?.created_by || '',
        inviterName: trip?.created_by || '',
      });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      if (!result?.emailSent && result?.inviteUrl) {
        setShareLink(result.inviteUrl);
      } else {
        setDone(true); setEmail('');
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
            <p className="text-sm text-muted-foreground text-center">Hemos enviado un email a {email}</p>
          </div>
        ) : shareLink ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Invitación creada</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">No podemos enviar email a usuarios que aún no están en Kōdo. Comparte este enlace por WhatsApp o iMessage.</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <p className="text-label2 text-muted-foreground mb-1.5">Enlace de invitación</p>
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
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Invitar al viaje</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Introduce el email de quien quieres añadir. Le llegará un email con el enlace de acceso.</p>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
                placeholder="email@ejemplo.com" type="email" autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 h-11 rounded-full border border-border text-sm font-medium text-muted-foreground bg-card">Cancelar</button>
              <button onClick={handleInvite} disabled={!email.trim() || sending}
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
