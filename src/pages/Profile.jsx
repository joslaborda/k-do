import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Camera, Loader2, UserPlus, UserCheck, MapPin, Globe, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

// ── Avatar ─────────────────────────────────────────────────────────────────
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

// ── Spot type icons ─────────────────────────────────────────────────────────
const SPOT_TYPE_EMOJI = {
  food: '🍽️',
  sight: '🏛️',
  activity: '🎯',
  shopping: '🛍️',
  transport: '🚇',
  custom: '📍',
};

// ── Template card mínima para el perfil ────────────────────────────────────
function MiniTemplateCard({ template, onClick }) {
  return (
    <div
      onClick={() => onClick(template)}
      className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative h-28 bg-muted overflow-hidden">
        {template.cover_image ? (
          <img src={template.cover_image} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🗺️</div>
        )}
        {template.is_premium && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            ✦ {template.price ? `${template.price}€` : 'Premium'}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-foreground line-clamp-1">{template.title}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {template.duration_days && <span>{template.duration_days}d</span>}
          {template.countries?.[0] && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{template.countries[0]}</span>}
          {template.saves_count > 0 && <span className="flex items-center gap-1 ml-auto"><Heart className="w-3 h-3" />{template.saves_count}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Spot card mínima para el perfil ────────────────────────────────────────
function MiniSpotCard({ spot }) {
  return (
    <div className="bg-white border border-border rounded-xl p-3 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{SPOT_TYPE_EMOJI[spot.type] || '📍'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-1">{spot.title}</p>
          {spot.city_name && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{spot.city_name}{spot.country ? `, ${spot.country}` : ''}
            </p>
          )}
          {spot.notes && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{spot.notes}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Stat block ──────────────────────────────────────────────────────────────
function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ¿Estamos viendo el perfil de otro usuario?
  const urlParams = new URLSearchParams(window.location.search);
  const viewUserId = urlParams.get('user_id'); // si viene, es perfil ajeno

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isOwnProfile = !viewUserId || (currentUser && viewUserId === currentUser.id);
  const targetUserId = viewUserId || currentUser?.id;

  // Perfil del usuario objetivo
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: targetUserId });
      return results[0] || null;
    },
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  // Itinerarios publicados del usuario objetivo
  const { data: templates = [] } = useQuery({
    queryKey: ['userTemplates', targetUserId],
    queryFn: async () => {
      const all = await base44.entities.ItineraryTemplate.filter({ created_by_user_id: targetUserId });
      return all.filter(t => isOwnProfile ? true : t.visibility === 'public');
    },
    enabled: !!targetUserId,
  });

  // Spots públicos del usuario objetivo
  const { data: publicSpots = [] } = useQuery({
    queryKey: ['userSpots', targetUserId],
    queryFn: async () => {
      const all = await base44.entities.Spot.filter({ created_by_user_id: targetUserId });
      return all.filter(s => isOwnProfile ? s.visibility === 'public' : s.visibility === 'public');
    },
    enabled: !!targetUserId,
  });

  // Seguidores y siguiendo
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', targetUserId],
    queryFn: () => base44.entities.Follow.filter({ followed_user_id: targetUserId }),
    enabled: !!targetUserId,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', targetUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: targetUserId }),
    enabled: !!targetUserId,
  });

  // ¿El usuario actual sigue al perfil objetivo?
  const { data: myFollows = [] } = useQuery({
    queryKey: ['myFollows', currentUser?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUser.id }),
    enabled: !!currentUser?.id && !isOwnProfile,
  });

  const isFollowing = myFollows.some(f => f.followed_user_id === targetUserId);
  const followRecord = myFollows.find(f => f.followed_user_id === targetUserId);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing && followRecord) {
        await base44.entities.Follow.delete(followRecord.id);
      } else {
        await base44.entities.Follow.create({
          follower_user_id: currentUser.id,
          followed_user_id: targetUserId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFollows', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
    },
  });

  // Cambio de avatar (solo perfil propio)
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    setUploadError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
      refetchProfile();
    } catch {
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 px-6 pb-8 pt-6">
        <div className="max-w-lg mx-auto flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          {isOwnProfile && (
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="max-w-lg mx-auto flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <UserAvatar profile={profile} user={currentUser} size={24} />
            {isOwnProfile && profile && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-orange-900 hover:bg-orange-800 rounded-full flex items-center justify-center border-2 border-white shadow"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {uploadError && <p className="text-white/80 text-xs mb-2 bg-red-900/40 px-3 py-1 rounded-full">{uploadError}</p>}

          <h1 className="text-2xl font-bold text-white">{profile?.display_name || currentUser.full_name || 'Sin nombre'}</h1>
          {profile?.username && <p className="text-white/70 text-sm mt-1 font-mono">@{profile.username}</p>}
          {profile?.bio && <p className="text-white/80 text-sm mt-2 max-w-xs">{profile.bio}</p>}
          {profile?.home_country && (
            <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {profile.home_country}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-8 mt-5">
            <StatBlock value={templates.length} label="Itinerarios" />
            <StatBlock value={followers.length} label="Seguidores" />
            <StatBlock value={following.length} label="Siguiendo" />
            <StatBlock value={publicSpots.length} label="Spots" />
          </div>

          {/* Botón follow/unfollow para perfil ajeno */}
          {!isOwnProfile && currentUser && (
            <Button
              className={`mt-5 px-8 ${isFollowing ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white text-orange-700 hover:bg-white/90'}`}
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
            >
              {followMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <><UserCheck className="w-4 h-4 mr-2" />Siguiendo</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" />Seguir</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="itinerarios">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="itinerarios" className="flex-1">
              🗺️ Itinerarios {templates.length > 0 && <Badge variant="secondary" className="ml-2">{templates.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="spots" className="flex-1">
              📍 Spots {publicSpots.length > 0 && <Badge variant="secondary" className="ml-2">{publicSpots.length}</Badge>}
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="cuenta" className="flex-1">
                ⚙️ Cuenta
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab: Itinerarios */}
          <TabsContent value="itinerarios">
            {templates.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="font-medium">{isOwnProfile ? 'Aún no has publicado itinerarios' : 'Sin itinerarios publicados'}</p>
                {isOwnProfile && (
                  <p className="text-sm mt-1">Publica tu primer viaje desde la página del viaje</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                  <MiniTemplateCard
                    key={t.id}
                    template={t}
                    onClick={(t) => navigate(`${createPageUrl('TemplateDetail')}?id=${t.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Spots */}
          <TabsContent value="spots">
            {publicSpots.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">📍</div>
                <p className="font-medium">{isOwnProfile ? 'Aún no tienes spots públicos' : 'Sin recomendaciones públicas'}</p>
                {isOwnProfile && (
                  <p className="text-sm mt-1">Marca un spot como público desde cualquier viaje para que aparezca aquí</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {publicSpots.map(s => (
                  <MiniSpotCard key={s.id} spot={s} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Cuenta (solo perfil propio) */}
          {isOwnProfile && (
            <TabsContent value="cuenta">
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-border p-4 space-y-3">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cuenta</h2>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Username</span>
                    <span className="font-mono font-medium">{profile?.username ? `@${profile.username}` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nombre</span>
                    <span className="font-medium">{profile?.display_name || currentUser.full_name || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verificado</span>
                    <span>{currentUser.is_verified ? '✅ Sí' : '❌ No'}</span>
                  </div>
                  {profile?.home_country && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">País</span>
                      <span className="font-medium">{profile.home_country}</span>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl('Settings')}>
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
