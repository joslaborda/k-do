import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MemberAvatarRow({ trip, profiles, onInvite, currentUserEmail }) {
  const colors = ['bg-orange-100 text-primary','bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-green-100 text-green-700'];
  const memberEmails = (trip?.members || [trip?.created_by]).filter(Boolean);

  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['memberProfiles', memberEmails.join(',')],
    queryFn: async () => {
      if (!memberEmails.length) return [];
      // Intento directo por email (funciona si el usuario tiene email backfilled)
      const direct = await base44.entities.UserProfile.filter({ email: { $in: memberEmails } });
      // Emails que no encontramos por email directo
      const foundEmails = new Set(direct.map(p => p.email).filter(Boolean));
      const missing = memberEmails.filter(e => !foundEmails.has(e));
      if (!missing.length) return direct;
      // Fallback para los que faltan: User → user_id → UserProfile
      const users = await base44.entities.User.filter({ email: { $in: missing } });
      const ids = users.map(u => u.id).filter(Boolean);
      const extra = ids.length
        ? await base44.entities.UserProfile.filter({ user_id: { $in: ids } })
        : [];
      // Enriquecer con user_email para poder lookupear
      const enriched = extra.map(p => ({
        ...p,
        email: users.find(u => u.id === p.user_id)?.email || '',
      }));
      return [...direct, ...enriched];
    },
    enabled: memberEmails.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const profileMap = useMemo(() => {
    const map = {};
    memberProfiles.forEach(p => { if (p.email) map[p.email] = p; });
    (profiles || []).forEach(p => {
      const e = p.email || p.user_email;
      if (e) map[e] = p;
    });
    return map;
  }, [memberProfiles, profiles]);

  return (
    <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
      {memberEmails.map((email, i) => {
        const profile = profileMap[email] || null;
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
