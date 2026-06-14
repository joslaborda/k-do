import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';

/**
 * Shared Avatar component — shows profile photo if available, else initials.
 * Usage: <Avatar email="user@example.com" size={36} />
 *    OR: <Avatar profile={profileObj} size={36} />
 *    OR: <Avatar email="user@example.com" profiles={profilesByEmailMap} size={36} />
 *        profiles = { email → profileObj } — evita queries globales
 *
 * UserProfile tiene campo email (desde build 86) — lookup directo sin cruzar User.
 */
export default function Avatar({ email, profile: profileProp, profiles: profilesMap, size = 36, className = "" }) {
  const profileFromMap = profilesMap && email ? (profilesMap[email] || null) : null;
  const skipQueries = !!profileProp || !!profileFromMap;

  const { data: profileData = [] } = useQuery({
    queryKey: ['profileByEmail', email],
    queryFn: () => base44.entities.UserProfile.filter({ email }),
    staleTime: 5 * 60 * 1000,
    enabled: !skipQueries && !!email,
  });

  const profile = useMemo(() => {
    if (profileProp) return profileProp;
    if (profileFromMap) return profileFromMap;
    return profileData[0] || null;
  }, [profileProp, profileFromMap, profileData]);

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
