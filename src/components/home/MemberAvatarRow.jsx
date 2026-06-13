import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MemberAvatarRow({ trip, profiles, onInvite, currentUserEmail }) {
  const colors = ['bg-orange-100 text-primary','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];
  const memberEmails = (trip?.members || [trip?.created_by]).filter(Boolean);
  const { data: usersData = [] } = useQuery({
    queryKey: ['memberUsers', memberEmails.join(',')],
    queryFn: () => base44.entities.User.filter({ email: { $in: memberEmails } }),
    enabled: memberEmails.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
      {memberEmails.map((email, i) => {
        const u = usersData.find(x => x.email === email);
        const profile = (u ? profiles?.find(p => p.user_id === u.id) : null)
          || profiles?.find(p => p.email === email || p.user_email === email);
        const name = profile?.display_name || profile?.username || email;
        const initials = name.slice(0,2).toUpperCase();
        const isMe = email === currentUserEmail;
        return (
          <div key={email} className="flex flex-col items-center gap-1">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={name} className="w-9 h-9 rounded-full object-cover" />
              : <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${colors[i % colors.length]}`}>{initials}</div>
            }
            <span className="text-xs text-muted-foreground max-w-[48px] truncate text-center">{isMe ? 'Tú' : name}</span>
          </div>
        );
      })}
      <button onClick={onInvite} className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary/40 transition-colors">
          <UserPlus className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <span className="text-xs text-muted-foreground">Añadir</span>
      </button>
    </div>
  );
}
