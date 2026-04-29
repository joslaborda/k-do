import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Camera, Loader2, UserPlus, UserCheck, MapPin, Globe, Heart, Link as LinkIcon, Instagram, Bookmark, FolderOpen, Plus, X } from 'lucide-react';
import { createNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

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

// ── SavedSpot card en carpeta ───────────────────────────────────────────────
function SavedSpotCard({ spot, onDelete, onMoveFolder, folders, onMigrate }) {
  const [showMove, setShowMove] = useState(false);
  return (
    <div className="bg-white border border-border rounded-xl p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{SPOT_TYPE_EMOJI[spot.type] || '📍'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-1">{spot.title}</p>
          {spot.city_name && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{spot.city_name}{spot.country ? `, ${spot.country}` : ''}
            </p>
          )}
          {spot.notes && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{spot.notes}</p>}
          <div className="flex items-center gap-2 mt-2">
            {spot.address && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />Maps
              </a>
            )}
            <button onClick={() => setShowMove(s => !s)}
              className="text-xs text-muted-foreground hover:text-orange-600 flex items-center gap-0.5 ml-auto">
              <FolderOpen className="w-3 h-3" />Mover
            </button>
            <button onClick={() => onDelete(spot.id)}
              className="text-xs text-muted-foreground hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </div>
          {showMove && (
            <div className="mt-2 flex flex-wrap gap-1">
              {folders.filter(f => f !== spot.folder).map(f => (
                <button key={f} onClick={() => { onMoveFolder(spot.id, f); setShowMove(false); }}
                  className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200 hover:bg-orange-100">
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Guardados tab ───────────────────────────────────────────────────────────
function MigrateToTripModal({ spot, userId, onClose }) {
  const queryClient = useQueryClient();
  const { data: trips = [] } = useQuery({
    queryKey: ['myTrips', userId],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Trip.filter({ created_by: user.email });
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  const migrateMutation = useMutation({
    mutationFn: (tripId) => base44.entities.Spot.create({
      trip_id: tripId,
      title: spot.title, type: spot.type,
      address: spot.address || '', city_name: spot.city_name || '', country: spot.country || '',
      lat: spot.lat, lng: spot.lng, notes: spot.notes || '',
      image_url: spot.image_url || '', tags: spot.tags || [],
      source_spot_id: spot.source_spot_id || spot.id,
      source_user_id: spot.source_user_id || userId,
      source_username: spot.source_username || '',
      source_display_name: spot.source_display_name || '',
      visibility: 'trip_members', visited: false,
      created_by_user_id: userId,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spots'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4"/>
        <p className="font-semibold text-sm mb-1">Añadir a un viaje</p>
        <p className="text-xs text-muted-foreground mb-4">¿A qué viaje quieres añadir <strong>{spot.title}</strong>?</p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {trips.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tienes viajes activos</p>}
          {trips.map(t => (
            <button key={t.id} onClick={() => migrateMutation.mutate(t.id)}
              disabled={migrateMutation.isPending}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-orange-50 hover:border-orange-200 transition-colors text-left">
              <span className="text-xl">✈️</span>
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.destination}{t.country ? ', ' + t.country : ''}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary">Cancelar</button>
      </div>
    </div>
  );
}

function SavedSpotsTab({ userId }) {
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState('all');
  const [migratingSpot, setMigratingSpot] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const { data: savedSpots = [] } = useQuery({
    queryKey: ['savedSpots', userId],
    queryFn: () => base44.entities.SavedSpot.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSpot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSpots', userId] }),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, folder }) => base44.entities.SavedSpot.update(id, { folder }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSpots', userId] }),
  });

  // Carpetas únicas
  const folders = ['General', ...new Set(savedSpots.map(s => s.folder).filter(f => f && f !== 'General'))];

  const visibleSpots = activeFolder === 'all'
    ? savedSpots
    : savedSpots.filter(s => s.folder === activeFolder);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    // La carpeta se crea al mover el primer spot
    setActiveFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  if (savedSpots.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-5xl mb-3">🔖</div>
      <p className="font-medium">Sin guardados todavía</p>
      <p className="text-sm mt-1">Guarda spots de otros viajeros desde sus perfiles</p>
    </div>
  );

  return (
    <div>
      {/* Carpetas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        <button
          onClick={() => setActiveFolder('all')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeFolder === 'all' ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border'
          }`}
        >
          📚 Todos <span className="opacity-70">{savedSpots.length}</span>
        </button>
        {folders.map(f => (
          <button key={f}
            onClick={() => setActiveFolder(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFolder === f ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border'
            }`}
          >
            📁 {f} <span className="opacity-70">{savedSpots.filter(s => s.folder === f).length}</span>
          </button>
        ))}
        {/* Nueva carpeta */}
        {showNewFolder ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Nombre carpeta"
              className="text-xs border border-border rounded-full px-3 py-1.5 outline-none w-32"
            />
            <button onClick={createFolder} className="text-orange-700"><Plus className="w-4 h-4" /></button>
            <button onClick={() => setShowNewFolder(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => setShowNewFolder(true)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-dashed border-border hover:border-orange-300 hover:text-orange-600 transition-colors">
            <Plus className="w-3 h-3" /> Carpeta
          </button>
        )}
      </div>

      {/* Lista */}
      {migratingSpot && <MigrateToTripModal spot={migratingSpot} userId={userId} onClose={() => setMigratingSpot(null)}/>}
      <div className="space-y-3">
        {visibleSpots.map(spot => (
          <SavedSpotCard
            key={spot.id}
            spot={spot}
            folders={folders}
            onDelete={id => deleteMutation.mutate(id)}
            onMoveFolder={(id, folder) => moveMutation.mutate({ id, folder })}
            onMigrate={spot => setMigratingSpot(spot)}
          />
        ))}
        {visibleSpots.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Esta carpeta está vacía</p>
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Profile() {
  const { user: currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const viewUserId = urlParams.get('user_id');

  const isOwnProfile = !viewUserId || (currentUser && viewUserId === currentUser.id);
  const targetUserId = viewUserId || currentUser?.id;

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: targetUserId });
      return results[0] || null;
    },
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['userTemplates', targetUserId],
    queryFn: async () => {
      const all = await base44.entities.ItineraryTemplate.filter({ created_by_user_id: targetUserId });
      return all.filter(t => isOwnProfile ? true : t.visibility === 'public');
    },
    enabled: !!targetUserId,
    staleTime: 60000,
  });

  const { data: publicSpots = [] } = useQuery({
    queryKey: ['userSpots', targetUserId],
    queryFn: async () => {
      const all = await base44.entities.Spot.filter({ created_by_user_id: targetUserId });
      return all.filter(s => s.visibility === 'public');
    },
    enabled: !!targetUserId,
    staleTime: 60000,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', targetUserId],
    queryFn: () => base44.entities.Follow.filter({ followed_user_id: targetUserId }),
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', targetUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: targetUserId }),
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ['myFollows', currentUser?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUser.id }),
    enabled: !!currentUser?.id && !isOwnProfile,
    staleTime: 30000,
  });

  const isFollowing = myFollows.some(f => f.followed_user_id === targetUserId);
  const followRecord = myFollows.find(f => f.followed_user_id === targetUserId);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      return results[0] || null;
    },
    enabled: !!currentUser?.id && !isOwnProfile,
  });

  const { data: savedSpots = [] } = useQuery({
    queryKey: ['savedSpots', targetUserId],
    queryFn: () => base44.entities.SavedSpot.filter({ user_id: targetUserId }),
    enabled: !!targetUserId && isOwnProfile,
    staleTime: 30000,
  });

  const saveSpotMutation = useMutation({
    mutationFn: (spot) => base44.entities.SavedSpot.create({
      user_id: currentUser.id,
      folder: 'General',
      title: spot.title,
      type: spot.type,
      address: spot.address || '',
      city_name: spot.city_name || '',
      country: spot.country || '',
      lat: spot.lat,
      lng: spot.lng,
      link: spot.link || '',
      notes: spot.notes || '',
      image_url: spot.image_url || '',
      source_spot_id: spot.id,
      source_user_id: targetUserId,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSpots', currentUser?.id] }),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing && followRecord) {
        await base44.entities.Follow.delete(followRecord.id);
      } else {
        await base44.entities.Follow.create({
          follower_user_id: currentUser.id,
          followed_user_id: targetUserId,
        });
        createNotification({ userId: targetUserId, type: 'follow', actorProfile: myProfile });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFollows', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
    },
  });

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

      {/* Cover image — overflow-hidden propio, NO envuelve el avatar */}
      <div className="relative h-36 bg-orange-700 overflow-hidden">
        {profile?.cover_image_url ? (
          <img src={profile.cover_image_url} className="w-full h-full object-cover" alt="portada" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-800" />
        )}
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-white hover:bg-black/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          {isOwnProfile && (
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/20">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Sección del perfil — fuera del overflow-hidden */}
      <div className="max-w-lg mx-auto px-6">

        {/* Avatar superpuesto */}
        <div className="flex items-end justify-between" style={{ marginTop: '-40px' }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-orange-200 shadow-md">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full bg-orange-600 flex items-center justify-center text-3xl font-bold text-white">
                  {profile?.display_name?.[0]?.toUpperCase() || currentUser?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            {isOwnProfile && profile && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-orange-900 hover:bg-orange-800 rounded-full flex items-center justify-center border-2 border-white shadow"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAvatarChange} />
          </div>

          {!isOwnProfile && currentUser && (
            <Button
              size="sm"
              className={`mb-1 ${isFollowing ? 'bg-white border border-orange-700 text-orange-700 hover:bg-orange-50' : 'bg-orange-700 text-white hover:bg-orange-800'}`}
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
            >
              {followMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
                isFollowing ? <><UserCheck className="w-4 h-4 mr-1" />Siguiendo</> : <><UserPlus className="w-4 h-4 mr-1" />Seguir</>}
            </Button>
          )}
        </div>

        {uploadError && <p className="text-destructive text-xs mt-2">{uploadError}</p>}

        <h1 className="text-xl font-bold text-foreground mt-3">{profile?.display_name || currentUser.full_name || 'Sin nombre'}</h1>
        {profile?.username && <p className="text-muted-foreground text-sm font-mono">@{profile.username}</p>}

        {profile?.travel_style && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold capitalize">
            {profile.travel_style === 'mochilero' ? '🎒' : profile.travel_style === 'confort' ? '🏨' : profile.travel_style === 'lujo' ? '✨' : profile.travel_style === 'aventura' ? '🏔️' : profile.travel_style === 'cultural' ? '🏛️' : '🍽️'} {profile.travel_style}
          </span>
        )}

        {profile?.bio && <p className="text-foreground/80 text-sm mt-2 leading-relaxed">{profile.bio}</p>}

        <div className="flex flex-wrap gap-3 mt-2">
          {profile?.home_country && (
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Globe className="w-3 h-3" /> {profile.home_country}
            </span>
          )}
          {profile?.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 text-xs flex items-center gap-1 hover:underline">
              <LinkIcon className="w-3 h-3" /> {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile?.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 text-xs flex items-center gap-1 hover:underline">
              <Instagram className="w-3 h-3" /> @{profile.instagram}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pb-4 border-b border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{templates.length}</p>
            <p className="text-xs text-muted-foreground">Itinerarios</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{publicSpots.length}</p>
            <p className="text-xs text-muted-foreground">Spots</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{followers.length}</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{following.length}</p>
            <p className="text-xs text-muted-foreground">Siguiendo</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <Tabs defaultValue="guardados">
          <TabsList className="w-full mb-6 flex-wrap h-auto gap-1">
            {isOwnProfile && (
              <TabsTrigger value="guardados" className="flex-1 min-w-0">
                🔖 <span className="ml-1">Guardados</span> {savedSpots.length > 0 && <Badge variant="secondary" className="ml-1">{savedSpots.length}</Badge>}
              </TabsTrigger>
            )}
            {isOwnProfile && (
              <TabsTrigger value="cuenta" className="flex-1 min-w-0">
                ⚙️ <span className="ml-1">Cuenta</span>
              </TabsTrigger>
            )}
            {/* Social tabs hidden - Phase 2 */}
          </TabsList>

          <TabsContent value="itinerarios">
            {templates.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="font-medium">{isOwnProfile ? 'Aún no has publicado itinerarios' : 'Sin itinerarios publicados'}</p>
                {isOwnProfile && <p className="text-sm mt-1">Publica tu primer viaje desde la página del viaje</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                  <MiniTemplateCard key={t.id} template={t} onClick={(t) => navigate(`${createPageUrl('TemplateDetail')}?id=${t.id}`)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="spots">
            {publicSpots.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">📍</div>
                <p className="font-medium">{isOwnProfile ? 'Aún no tienes spots públicos' : 'Sin recomendaciones públicas'}</p>
                {isOwnProfile && <p className="text-sm mt-1">Marca un spot como público desde cualquier viaje para que aparezca aquí</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {publicSpots.map(s => (
                  <div key={s.id} className="bg-white border border-border rounded-xl p-3 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{SPOT_TYPE_EMOJI[s.type] || '📍'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{s.title}</p>
                        {s.city_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{s.city_name}{s.country ? `, ${s.country}` : ''}
                          </p>
                        )}
                        {s.notes && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.notes}</p>}
                        {!isOwnProfile && currentUser && (
                          <button
                            onClick={() => saveSpotMutation.mutate(s)}
                            disabled={saveSpotMutation.isPending}
                            className="mt-2 flex items-center gap-1 text-xs text-orange-700 hover:text-orange-800 font-medium"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            {saveSpotMutation.isPending ? 'Guardando...' : 'Guardar en mis favoritos'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="guardados">
              <SavedSpotsTab userId={currentUser?.id} />
            </TabsContent>
          )}

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
                <Button variant="ghost" onClick={() => base44.auth.logout()} className="w-full text-destructive hover:bg-destructive/10">
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