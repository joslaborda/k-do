import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  if (!profile) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">Cargando perfil…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 px-6 py-8">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to={createPageUrl('TripsList')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver
            </Button>
          </Link>
          <Link to={createPageUrl('Settings')}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="max-w-lg mx-auto mt-6 flex flex-col items-center text-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/30 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-4 border-4 border-white/30">
              {profile.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
          <p className="text-white/70 text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-white/80 text-sm mt-2 max-w-xs">{profile.bio}</p>}
          {profile.home_country && (
            <div className="flex items-center gap-1 text-white/60 text-xs mt-2">
              <MapPin className="w-3 h-3" /> {profile.home_country}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">Cuenta</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verificado</span>
            <span>{user?.is_verified ? '✅ Sí' : '❌ No'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono font-medium">@{profile.username}</span>
          </div>
        </div>

        <Link to={createPageUrl('Settings')}>
          <Button className="w-full bg-orange-700 hover:bg-orange-800">
            <Settings className="w-4 h-4 mr-2" /> Editar perfil y ajustes
          </Button>
        </Link>
      </div>
    </div>
  );
}