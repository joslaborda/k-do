import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Crown, Pencil, Eye, Mail, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { sendTripInvite } from '@/lib/invites';
import { useTranslation } from 'react-i18next';

export default function MembersPanel({
  trip, currentUserEmail, isAdmin, profiles = []
}) {
  const { t } = useTranslation();

  const roleConfig = {
    admin: { label: t('membersPanel.roleAdmin'), icon: Crown, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    editor: { label: t('membersPanel.roleEditor'), icon: Pencil, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    viewer: { label: t('membersPanel.roleViewer'), icon: Eye, color: 'bg-secondary text-foreground border-border' },
  };
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const queryClient = useQueryClient();

  const members = trip?.members || [];
  const roles = trip?.roles || {};

  // `profiles` llega como array (así lo devuelve el useQuery de perfiles en
  // Home.jsx: `data: profiles = []`), pero este componente asumía que podía
  // llegar como objeto {email: profile} — con un array, `profiles?.[email]`
  // siempre daba undefined y la lista de miembros se quedaba sin avatar/nombre.
  // Se admite cualquiera de las dos formas.
  const getProfile = (email) => {
    if (!profiles) return null;
    if (Array.isArray(profiles)) return profiles.find(p => p.email === email || p.user_email === email) || null;
    return profiles[email] || null;
  };

  const updateTripMutation = useMutation({
    mutationFn: data => base44.entities.Trip.update(trip.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', trip.id] }),
  });

  // Expulsar miembro: MembersPanel existía en el proyecto pero no estaba
  // conectado a ninguna pantalla, y aunque se conectara solo permitía cambiar
  // el rol — no había forma de sacar a alguien del viaje sin tocar la BD a
  // mano. Igual que con el rol, no se puede expulsar al creador del viaje ni
  // a uno mismo.
  const removeMemberMutation = useMutation({
    mutationFn: async (email) => {
      const newMembers = members.filter(e => e !== email);
      const newRoles = { ...roles };
      delete newRoles[email];
      await base44.entities.Trip.update(trip.id, { members: newMembers, roles: newRoles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      setMemberToRemove(null);
    },
    onError: (e) => toast({ title: t('common.error'), description: e?.message || t('membersPanel.removeError') }),
  });

  const handleInvite = async () => {
    const raw = inviteEmail.trim();
    if (!raw) return;
    setInviting(true);
    try {
      let resolvedEmail = raw;
      // If not an email, search by username
      if (!raw.includes('@')) {
        const query = raw.startsWith('@') ? raw.slice(1) : raw;
        // Buscar por username_normalized primero, luego por username exacto
        let found = await base44.entities.UserProfile.filter({ username_normalized: query.toLowerCase() });
        if (!found.length) {
          found = await base44.entities.UserProfile.filter({ username: query });
        }
        if (!found.length) {
          toast({ title: t('membersPanel.userNotFound'), description: t('membersPanel.userNotFoundDesc', { query }) });
          setInviting(false);
          return;
        }
        const profile = found[0];
        // Resolver email: primero desde el campo email del perfil (backfilled), luego via User.filter
        if (profile.email) {
          resolvedEmail = profile.email;
        } else {
          const users = await base44.entities.User.filter({ id: profile.user_id });
          const user = users[0];
          if (!user?.email) {
            toast({ title: t('common.error'), description: t('membersPanel.resolveEmailError') });
            setInviting(false);
            return;
          }
          resolvedEmail = user.email;
        }
      }
      if (members.includes(resolvedEmail)) {
        toast({ title: t('membersPanel.alreadyMember'), description: t('membersPanel.alreadyMemberDesc') });
        setInviting(false);
        return;
      }
      const result = await sendTripInvite({
        tripId: trip.id,
        email: resolvedEmail,
        role: inviteRole,
        tripName: trip.name,
        inviterEmail: currentUserEmail,
        inviterName: (() => {
          const myProf = profiles.find(p => p.email === currentUserEmail || p.user_email === currentUserEmail);
          return myProf?.display_name || myProf?.username || currentUserEmail;
        })(),
      });
      if (!result?.emailSent && result?.inviteUrl) {
        setShareLink(result.inviteUrl);
        setInviteEmail('');
      } else {
        toast({ title: t('membersPanel.inviteSent'), description: t('membersPanel.inviteSentDesc', { email: resolvedEmail }) });
        setInviteEmail('');
        setInviteRole('editor');
      }
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
    } catch (e) {
      toast({ title: t('common.error'), description: e.message || t('membersPanel.inviteError') });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = (email, newRole) => {
    const adminCount = Object.values(roles).filter(r => r === 'admin').length;
    if (roles[email] === 'admin' && adminCount <= 1 && newRole !== 'admin') {
      toast({ title: t('membersPanel.notAllowed'), description: t('membersPanel.needOneAdmin'), variant: 'destructive' });
      return;
    }
    updateTripMutation.mutate({ roles: { ...roles, [email]: newRole } });
  };

  return (
    <div className="space-y-4">
      {/* Header — single Invitar button here, no duplicate circle below */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground text-sm">{t('membersPanel.travelersCount', { count: members.length })}</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => document.getElementById('invite-input')?.focus()}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />{t('membersPanel.invite')}
          </button>
        )}
      </div>

      {/* Member list */}
      <div className="space-y-2">
        {members.map(email => {
          const role = roles[email] || 'viewer';
          const config = roleConfig[role];
          const RoleIcon = config.icon;
          const isCurrentUser = email === currentUserEmail;
          const isCreator = trip?.created_by === email;
          const prof = getProfile(email);
          const displayName = prof?.display_name || prof?.username || email || email;
          const initials = displayName.slice(0,2).toUpperCase();

          return (
            <div key={email} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                {prof?.avatar_url
                  ? <img src={prof.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-primary">{initials}</div>
                }
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {displayName}
                    {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">{t('membersPanel.you')}</span>}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs mt-0.5 ${config.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {config.label}
                  </div>
                </div>
              </div>
              {isAdmin && !isCurrentUser && (
                <div className="flex items-center gap-1.5">
                  <Select value={role} onValueChange={v => handleRoleChange(email, v)}>
                    <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('membersPanel.roleAdmin')}</SelectItem>
                      <SelectItem value="editor">{t('membersPanel.roleEditor')}</SelectItem>
                      <SelectItem value="viewer">{t('membersPanel.roleViewer')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isCreator && (
                    <button
                      onClick={() => setMemberToRemove(email)}
                      aria-label={t('membersPanel.removeFromTrip')}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmación de expulsión */}
      {memberToRemove && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40" onClick={() => setMemberToRemove(null)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
            <p className="font-semibold text-foreground text-sm mb-1">{t('membersPanel.removeFromTrip')}</p>
            <p className="text-xs text-muted-foreground mb-5">
              {(() => {
                const prof = getProfile(memberToRemove);
                const name = prof?.display_name || prof?.username || memberToRemove;
                return t('membersPanel.removeConfirmBody', { name });
              })()}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setMemberToRemove(null)} className="flex-1 py-3 rounded-full border border-border text-sm text-muted-foreground">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => removeMemberMutation.mutate(memberToRemove)}
                disabled={removeMemberMutation.isPending}
                className="flex-1 py-3 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {removeMemberMutation.isPending ? '...' : t('membersPanel.remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite form */}
      {isAdmin && (
        <div className="pt-4 border-t border-border">
          {shareLink ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />{t('membersPanel.shareLinkHint')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('membersPanel.shareLinkNote')}
              </p>
              <div className="bg-secondary rounded-xl px-3 py-2.5">
                <p className="text-xs font-mono break-all text-foreground leading-relaxed">{shareLink}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  {copied ? <><Check className="w-3.5 h-3.5 mr-1" />{t('membersPanel.copied')}</> : <><Copy className="w-3.5 h-3.5 mr-1" />{t('membersPanel.copyLink')}</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShareLink('')}>{t('membersPanel.back')}</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Mail className="w-3 h-3" />{t('invites.modal.byEmail')}
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="invite-input"
                    placeholder={t('membersPanel.emailPlaceholder')}
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    className="text-sm flex-1"
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-24 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('membersPanel.roleAdmin')}</SelectItem>
                      <SelectItem value="editor">{t('membersPanel.roleEditor')}</SelectItem>
                      <SelectItem value="viewer">{t('membersPanel.roleViewer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  {inviting ? '...' : t('invites.modal.sendInvite')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
