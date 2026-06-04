import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Crown, Pencil, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { sendTripInvite } from '@/lib/invites';

const roleConfig = {
  admin: { label: 'Admin', icon: Crown, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  editor: { label: 'Editor', icon: Pencil, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  viewer: { label: 'Lector', icon: Eye, color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default function MembersPanel({ trip, currentUserEmail, isAdmin, profiles = [] }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  const members = trip?.members || [];
  const roles = trip?.roles || {};

  const updateTripMutation = useMutation({
    mutationFn: data => base44.entities.Trip.update(trip.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', trip.id] }),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (members.includes(inviteEmail.trim())) {
      toast({ title: 'Ya es miembro', description: 'Este usuario ya está en el viaje' });
      return;
    }
    setInviting(true);
    try {
      await sendTripInvite({
        tripId: trip.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        tripName: trip.name,
        inviterEmail: currentUserEmail,
        inviterName: currentUserEmail.split('@')[0],
      });
      toast({ title: '✓ Invitación enviada', description: `Email enviado a ${inviteEmail.trim()}` });
      setInviteEmail('');
      setInviteRole('editor');
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'No se pudo enviar la invitación' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = (email, newRole) => {
    const adminCount = Object.values(roles).filter(r => r === 'admin').length;
    if (roles[email] === 'admin' && adminCount <= 1 && newRole !== 'admin') {
      alert('Debe haber al menos un admin en el viaje.');
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
          <h3 className="font-medium text-foreground text-sm">Viajeros ({members.length})</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => document.getElementById('invite-input')?.focus()}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />Invitar
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
          const prof = profiles.find(p => p.email === email || p.user_email === email);
          const displayName = prof?.display_name || email?.split('@')[0] || email;
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
                    {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(tú)</span>}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs mt-0.5 ${config.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {config.label}
                  </div>
                </div>
              </div>
              {isAdmin && !isCurrentUser && (
                <Select value={role} onValueChange={v => handleRoleChange(email, v)}>
                  <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Lector</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {isAdmin && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Mail className="w-3 h-3" />Invitar por email
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="invite-input"
                placeholder="email@ejemplo.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                className="text-sm flex-1"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-24 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Lector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              {inviting ? '...' : 'Enviar invitación'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
