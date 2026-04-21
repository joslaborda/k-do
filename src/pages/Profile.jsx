import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function UserAvatar({ profile, user, size = 24 }) {
  const initials = profile?.display_name?.[0]?.toUpperCase()
    || user?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || '?';
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        className={`w-${size} h-${size} rounded-full object-cover border-4 border-white/30`}
        alt={initials}
      />
    );
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30`}>
      {initials}
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    setUploadError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
    } catch {
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 px-6 py-8">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/TripsList">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver
            </Button>
          </Link>
          <Link to="/Settings">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="max-w-lg mx-auto mt-6 flex flex-col items-center text-center">
          {/* Avatar con botón de edición */}
          <div className="relative mb-4">
            <UserAvatar profile={profile} user={user} size={24} />
            {profile && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-orange-900 hover:bg-orange-800 rounded-full flex items-center justify-center border-2 border-white shadow"
                title="Cambiar foto"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          {uploadError && <p className="text-white/80 text-xs mb-2 bg-red-900/40 px-3 py-1 rounded-full">{uploadError}</p>}
          <h1 className="text-2xl font-bold text-white">{profile?.display_name || user.full_name || 'Sin nombre'}</h1>
          {profile?.username && <p className="text-white/70 text-sm mt-1 font-mono">@{profile.username}</p>}
          <p className="text-white/60 text-xs mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cuenta</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono font-medium">{profile?.username ? `@${profile.username}` : '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{profile?.display_name || user.full_name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verificado</span>
            <span>{user.is_verified ? '✅ Sí' : '❌ No'}</span>
          </div>
          {profile?.home_country && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">País</span>
              <span className="font-medium">{profile.home_country}</span>
            </div>
          )}
        </div>

        <Link to="/Settings">
          <Button className="w-full bg-orange-700 hover:bg-orange-800">
            <Settings className="w-4 h-4 mr-2" /> Editar ajustes
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={() => base44.auth.logout()}
          className="w-full text-destructive hover:bg-destructive/10"
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}