import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ROLE_LABELS = { admin: 'Admin', editor: 'Editor', viewer: 'Solo ver' };
const ROLE_COLORS = { admin: 'bg-orange-100 text-orange-700', editor: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-600' };
const STATUS_ICON = { pending: Clock, accepted: CheckCircle, declined: XCircle };
const STATUS_COLOR = { pending: 'text-yellow-600', accepted: 'text-green-600', declined: 'text-red-500' };

export default function TripMembersPanel({ trip, currentUserEmail }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const queryClient = useQueryClient();

  const tripId = trip?.id;
  const members = trip?.members || [];
  const roles = trip?.roles || {};
  const isAdmin = roles[currentUserEmail] === 'admin' || trip?.created_by === currentUserEmail;

  const { data: invites = [] } = useQuery({
    queryKey: ['invites', tripId],
    queryFn: () => base44.entities.TripInvite.filter({ trip_id: tripId }),
    enabled: !!tripId,
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const userMap = usersData.reduce((m, u) => { m[u.email] = u.full_name || u.email; return m; }, {});

  const inviteMutation = useMutation({
    mutationFn: async ({ email: inv_email, role: inv_role }) => {
      // Check not already member
      if (members.includes(inv_email)) throw new Error('Ya es miembro');
      // Check not already invited
      const existing = invites.find((i) => i.email === inv_email && i.status === 'pending');
      if (existing) throw new Error('Ya hay una invitación pendiente');
      // Create invite
      await base44.entities.TripInvite.create({
        trip_id: tripId,
        email: inv_email,
        role: inv_role,
        status: 'pending',
        invited_by: currentUserEmail,
      });
      // Also invite via platform
      await base44.users.inviteUser(inv_email, inv_role === 'admin' ? 'admin' : 'user').catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', tripId] });
      setEmail('');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (invite) => {
      const newMembers = [...new Set([...members, invite.email])];
      const newRoles = { ...roles, [invite.email]: invite.role };
      await base44.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });
      await base44.entities.TripInvite.update(invite.id, { status: 'accepted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (inviteId) => base44.entities.TripInvite.update(inviteId, { status: 'declined' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invites', tripId] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberEmail) => {
      const newMembers = members.filter((e) => e !== memberEmail);
      const newRoles = { ...roles };
      delete newRoles[memberEmail];
      await base44.entities.Trip.update(tripId, { members: newMembers, roles: newRoles });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const pendingInvites = invites.filter((i) => i.status === 'pending');
  const canInvite = isAdmin && email.trim() && email.includes('@');

  return (
    <div className="space-y-6">
      {/* Current members */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Miembros ({members.length})</h3>
        <div className="space-y-2">
          {members.map((memberEmail) => {
            const memberRole = roles[memberEmail] || 'viewer';
            const isMe = memberEmail === currentUserEmail;
            const isCreator = trip?.created_by === memberEmail;
            return (
              <div key={memberEmail} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                  {(userMap[memberEmail] || memberEmail)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userMap[memberEmail] || memberEmail}
                    {isMe && <span className="ml-1 text-xs text-muted-foreground">(tú)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{memberEmail}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[memberRole]}`}>
                  {ROLE_LABELS[memberRole]}
                </span>
                {isAdmin && !isCreator && !isMe && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMemberMutation.mutate(memberEmail)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Invitaciones pendientes</h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => {
              const StatusIcon = STATUS_ICON[inv.status];
              return (
                <div key={inv.id} className="flex items-center gap-3 bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <Mail className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">Rol: {ROLE_LABELS[inv.role]}</p>
                  </div>
                  <StatusIcon className={`w-4 h-4 ${STATUS_COLOR[inv.status]}`} />
                  {/* Admin can manually accept */}
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => acceptMutation.mutate(inv)}>
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => declineMutation.mutate(inv.id)}>
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite form (admins only) */}
      {isAdmin && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invitar persona
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="flex-1 bg-white border-border text-sm"
              onKeyDown={(e) => e.key === 'Enter' && canInvite && inviteMutation.mutate({ email, role })}
            />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-28 bg-white border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Solo ver</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => inviteMutation.mutate({ email, role })}
              disabled={!canInvite || inviteMutation.isPending}
              className="bg-orange-700 hover:bg-orange-800 text-sm"
            >
              {inviteMutation.isPending ? '...' : 'Invitar'}
            </Button>
          </div>
          {inviteMutation.isError && (
            <p className="text-xs text-destructive mt-2">{inviteMutation.error?.message}</p>
          )}
        </div>
      )}
    </div>
  );
}