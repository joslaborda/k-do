import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeEmail } from '@/lib/utils';

/**
 * Avatar compartido — foto de perfil si hay, si no iniciales. Con
 * showName=true además pinta Nombre completo + @username al lado (nunca el
 * email en crudo, aunque no se encuentre perfil).
 *
 * Antes había 4 copias locales de esto (InviteModal, Expenses, Explore,
 * CommunitySearch), cada una con su propio criterio de iniciales/colores —
 * la misma persona se veía distinta según la página. Y todas compartían el
 * mismo fallback roto: si no se encontraba el perfil, mostraban el email en
 * vez del nombre. La causa más común de "no se encuentra el perfil" era que
 * el email de búsqueda no estaba normalizado a minúsculas igual que
 * UserProfile.email (ver TripsList.jsx) — normalizeEmail() aquí es la
 * última barrera, aunque el email ya debería llegar normalizado desde el
 * origen.
 */
export default function Avatar({
  email, profile: profileProp, profiles: profilesMap,
  size = 36, className = '', showName = false, isMe = false,
}) {
  const { t } = useTranslation();
  const normEmail = normalizeEmail(email);
  const profileFromMap = profilesMap && normEmail ? (profilesMap[normEmail] || null) : null;
  const skipQueries = !!profileProp || !!profileFromMap;

  const { data: profileData = [] } = useQuery({
    queryKey: ['profileByEmail', normEmail],
    queryFn: async () => {
      if (!normEmail) return [];
      // Intento directo por email (funciona si el usuario tiene email backfilled)
      const direct = await base44.entities.UserProfile.filter({ email: normEmail });
      if (direct.length > 0) return direct;
      // Fallback: resolver via User → user_id
      const users = await base44.entities.User.filter({ email: { $in: [normEmail] } });
      if (!users.length) return [];
      const profs = await base44.entities.UserProfile.filter({ user_id: users[0].id });
      return profs;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !skipQueries && !!normEmail,
  });

  const profile = useMemo(() => {
    if (profileProp) return profileProp;
    if (profileFromMap) return profileFromMap;
    return profileData[0] || null;
  }, [profileProp, profileFromMap, profileData]);

  // display_name y username son campos obligatorios de UserProfile — si
  // ninguno aparece es que no se encontró el perfil, no que la persona no
  // tenga nombre. El email nunca es el fallback visible.
  const name = profile?.display_name || null;
  const username = profile?.username || null;
  const initials = (name || username || '?').slice(0, 2).toUpperCase();
  const s = size;

  const photo = profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt={name || username || ''}
      className={className}
      style={{ width: s, height: s, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
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

  if (!showName) return photo;

  const displayName = isMe ? t('common.you') : (name || (username ? null : t('common.member')));

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {photo}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{displayName || (username ? `@${username}` : t('common.member'))}</p>
        {username && !isMe && <p className="text-xs text-muted-foreground truncate">@{username}</p>}
      </div>
    </div>
  );
}
