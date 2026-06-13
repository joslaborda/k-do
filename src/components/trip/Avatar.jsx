import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';

/**
 * Shared Avatar component — shows profile photo if available, else initials.
 * Usage: <Avatar email="user@example.com" size={36} />
 * OR:    <Avatar profile={profileObj} size={36} />
 */
export default function Avatar({ email, profile: profileProp, size = 36, className = "" }) {
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 5 * 60 * 1000,
    enabled: !profileProp,
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 10 * 60 * 1000,
    enabled: !profileProp && !!email,
  });

  const profile = useMemo(() => {
    if (profileProp) return profileProp;
    if (!email) return null;
    const u = usersData.find(x => x.email === email);
    return allProfiles.find(p => p.user_id === u?.id) || null;
  }, [profileProp, email, allProfiles, usersData]);

  const name = profile?.display_name || profile?.username || email || '?';
  const initials = name.slice(0, 2).toUpperCase();
  const s = size;

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={name}
        className={className}
        style={{ width: s, height: s, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: s, height: s, borderRadius: '50%', flexShrink: 0,
        background: 'var(--kodo-bg-orange)', color: 'hsl(var(--primary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, s * 0.35), fontWeight: 600,
      }}
    >
      {initials}
    </div>
  );
}
