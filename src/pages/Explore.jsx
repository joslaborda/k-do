import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Search, MapPin, Heart, Bookmark, Users, Compass, Globe, UserPlus, UserCheck, X, Tag, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TemplateCard from '@/components/explore/TemplateCard';
import CommunitySearch from '@/components/social/CommunitySearch';
import { createPageUrl } from '@/utils';
import { useLike } from '@/hooks/useLike';

const SPOT_TYPE_EMOJI = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', transport:'🚆', custom:'📍' };
const TYPE_COLORS = {
  food:'bg-orange-100 text-orange-700', sight:'bg-blue-100 text-blue-700',
  activity:'bg-green-100 text-green-700', shopping:'bg-purple-100 text-purple-700',
  transport:'bg-slate-100 text-slate-700', custom:'bg-yellow-100 text-yellow-700',
};

function Avatar({ profile, size }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = profile?.display_name?.[0]?.toUpperCase() || '?';
  if (profile?.avatar_url) return <img src={profile.avatar_url} className={cls + ' rounded-full object-cover flex-shrink-0'} alt={initials}/>;
  return <div className={cls + ' rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold flex-shrink-0'}>{initials}</div>;
}

function LikeButton({ targetId, targetType, userId, targetOwnerId }) {
  const { isLiked, count, toggle } = useLike({ targetId, targetType, userId, targetOwnerId });
  if (!userId) return null;
  return (
    <button onClick={toggle} className={"flex items-center gap-1 transition-colors " + (isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400')}>
      <Heart className={"w-3.5 h-3.5 " + (isLiked ? 'fill-current' : '')}/>
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}

function FeedSpotCard({ spot, profile, currentUser, onSave, saving }) {
  const emoji = SPOT_TYPE_EMOJI[spot.type] || '📍';
  const color = TYPE_COLORS[spot.type] || TYPE_COLORS.custom;
  const isOwn = currentUser?.id === spot.created_by_user_id;
  const attribution = spot.source_username || spot.source_display_name;
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {spot.image_url && <div className="h-36 overflow-hidden"><img src={spot.image_url} alt={spot.title} className="w-full h-full object-cover"/></div>}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar profile={profile} size="sm"/>
          <div className="flex-1 min-w-0">
            <Link to={createPageUrl('Profile') + '?user_id=' + spot.created_by_user_id}
              className="text-xs font-semibold text-foreground hover:text-orange-700 truncate block">
              {profile?.display_name || 'Viajero'}{profile?.username && <span className="text-muted-foreground font-normal ml-1">@{profile.username}</span>}
            </Link>
            {(spot.city_name || spot.country) && (
              <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                <MapPin className="w-3 h-3"/>{[spot.city_name, spot.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <span className={"text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 " + color}>{emoji}</span>
        </div>
        {attribution && (
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Heart className="w-3 h-3 text-orange-400"/>Descubierto por @{attribution}
          </p>
        )}
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-foreground text-sm">{spot.title}</p>
          {spot.avg_rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400"/>
              {spot.avg_rating}
            </span>
          )}
        </div>
        {spot.notes && <p className="text-xs text-muted-foreground line-clamp-2">{spot.notes}</p>}
        {spot.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {spot.tags.slice(0,4).map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-3 mt-3">
          <LikeButton targetId={spot.id} targetType="spot" userId={currentUser?.id} targetOwnerId={spot.created_by_user_id}/>
          {!isOwn && currentUser && (
            <button onClick={() => onSave(spot)} disabled={saving} className="flex items-center gap-1.5 text-xs text-orange-700 font-medium hover:text-orange-800">
              <Bookmark className="w-3.5 h-3.5"/>{saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserCard({ profile, currentUser, myFollows, onFollow }) {
  const isOwn = currentUser?.id === profile.user_id;
  const followRecord = myFollows.find(f => f.followed_user_id === profile.user_id);
  const isFollowing = !!followRecord;
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <Avatar profile={profile}/>
      <div className="flex-1 min-w-0">
        <Link to={createPageUrl('Profile') + '?user_id=' + profile.user_id} className="font-semibold text-sm text-foreground hover:text-orange-700 block truncate">
          {profile.display_name || 'Viajero'}
        </Link>
        {profile.username && <p className="text-xs text-muted-foreground font-mono">@{profile.username}</p>}
        {profile.home_country && <p className="text-xs text-muted-foreground">{profile.home_country}</p>}
      </div>
      {!isOwn && currentUser && (
        <Button size="sm" onClick={() => onFollow(profile, followRecord)}
          className={isFollowing ? 'border border-orange-200 text-orange-700 bg-white hover:bg-orange-50' : 'bg-orange-700 hover:bg-orange-800 text-white'}>
          {isFollowing ? <><UserCheck className="w-3.5 h-3.5 mr-1"/>Siguiendo</> : <><UserPlus className="w-3.5 h-3.5 mr-1"/>Seguir</>}
        </Button>
      )}
    </div>
  );
}

function EmptyFeed({ emoji, title, subtitle }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm mt-1 max-w-xs mx-auto">{subtitle}</p>
    </div>
  );
}

export default function Explore() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [spotSearch, setSpotSearch] = useState('');
  const [spotCity, setSpotCity] = useState('');
  const [spotTag, setSpotTag] = useState('');
  const [peopleQuery, setPeopleQuery] = useState('');
  const [savingSpotId, setSavingSpotId] = useState(null);

  const { data: publicSpots = [], isLoading: loadingSpots } = useQuery({
    queryKey: ['spotsPublic'],
    queryFn: () => base44.entities.Spot.filter({ visibility: 'public' }),
    staleTime: 3 * 60 * 1000,
  });

  const { data: publicTemplates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['templatesPublic'],
    queryFn: () => base44.entities.ItineraryTemplate.filter({ visibility: 'public' }, '-created_date'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ['myFollows', currentUser?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUser.id }),
    enabled: !!currentUser?.id, staleTime: 60000,
  });

  const { data: myTrips = [] } = useQuery({
    queryKey: ['myTrips', currentUser?.id],
    queryFn: () => base44.entities.Trip.filter({ created_by: currentUser.email }),
    enabled: !!currentUser?.email, staleTime: 60000,
  });

  const followedUserIds = myFollows.map(f => f.followed_user_id);
  const myDestinations = [...new Set(myTrips.flatMap(t => [t.country, t.destination]).filter(Boolean))];

  const profileMap = useMemo(() => {
    const m = {};
    allProfiles.forEach(p => { m[p.user_id] = p; });
    return m;
  }, [allProfiles]);

  // Algoritmo de ranking de spots:
  // 1. De seguidos
  // 2. Mismo destino que mis viajes
  // 3. Por popularidad (saves_count)
  const rankedSpots = useMemo(() => {
    return [...publicSpots].sort((a, b) => {
      const aFollowed = followedUserIds.includes(a.created_by_user_id) ? 3 : 0;
      const bFollowed = followedUserIds.includes(b.created_by_user_id) ? 3 : 0;
      const aDestination = myDestinations.some(d => d && (a.country?.toLowerCase().includes(d.toLowerCase()) || a.city_name?.toLowerCase().includes(d.toLowerCase()))) ? 2 : 0;
      const bDestination = myDestinations.some(d => d && (b.country?.toLowerCase().includes(d.toLowerCase()) || b.city_name?.toLowerCase().includes(d.toLowerCase()))) ? 2 : 0;
      const aScore = aFollowed + aDestination + Math.min(a.saves_count || 0, 5);
      const bScore = bFollowed + bDestination + Math.min(b.saves_count || 0, 5);
      return bScore - aScore;
    });
  }, [publicSpots, followedUserIds, myDestinations]);

  // Filtrado de spots
  const filteredSpots = useMemo(() => {
    const q = spotSearch.toLowerCase().trim();
    const c = spotCity.toLowerCase().trim();
    const t = spotTag.toLowerCase().trim();
    return rankedSpots.filter(s => {
      const matchQ = !q || s.title?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q);
      const matchC = !c || s.city_name?.toLowerCase().includes(c) || s.country?.toLowerCase().includes(c);
      const matchT = !t || s.tags?.some(tag => tag.toLowerCase().includes(t));
      return matchQ && matchC && matchT;
    });
  }, [rankedSpots, spotSearch, spotCity, spotTag]);

  const siguiendoSpots = useMemo(() =>
    publicSpots.filter(s => followedUserIds.includes(s.created_by_user_id)),
    [publicSpots, followedUserIds]
  );
  const siguiendoTemplates = useMemo(() =>
    publicTemplates.filter(t => followedUserIds.includes(t.created_by_user_id)),
    [publicTemplates, followedUserIds]
  );

  const filteredProfiles = useMemo(() => {
    const q = peopleQuery.toLowerCase().trim();
    return allProfiles.filter(p =>
      p.user_id !== currentUser?.id && (!q ||
        p.display_name?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.home_country?.toLowerCase().includes(q))
    ).sort((a, b) => {
      const aF = followedUserIds.includes(a.user_id) ? 0 : 1;
      const bF = followedUserIds.includes(b.user_id) ? 0 : 1;
      return aF - bF;
    });
  }, [allProfiles, peopleQuery, currentUser?.id, followedUserIds]);

  const followMutation = useMutation({
    mutationFn: async ({ profile, followRecord }) => {
      if (followRecord) await base44.entities.Follow.delete(followRecord.id);
      else await base44.entities.Follow.create({ follower_user_id: currentUser.id, followed_user_id: profile.user_id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myFollows', currentUser?.id] }),
  });

  const saveSpotMutation = useMutation({
    mutationFn: spot => base44.entities.SavedSpot.create({
      user_id: currentUser.id, folder: 'General',
      title: spot.title, type: spot.type,
      address: spot.address||'', city_name: spot.city_name||'', country: spot.country||'',
      lat: spot.lat, lng: spot.lng, notes: spot.notes||'', image_url: spot.image_url||'',
      source_spot_id: spot.id, source_user_id: spot.created_by_user_id,
      source_username: profileMap[spot.created_by_user_id]?.username || '',
      source_display_name: profileMap[spot.created_by_user_id]?.display_name || '',
      tags: spot.tags || [],
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savedSpots', currentUser?.id] }); setSavingSpotId(null); },
  });

  const handleSaveSpot = async spot => { setSavingSpotId(spot.id); await saveSpotMutation.mutateAsync(spot); };
  const handleFollow = (profile, followRecord) => followMutation.mutate({ profile, followRecord });

  const activeFilters = [spotSearch, spotCity, spotTag].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      <div className="bg-orange-700 pt-12 pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-4xl font-bold mb-1">Explorar</h1>
          <p className="text-white/80 text-sm mb-4">Descubre spots, viajes y viajeros</p>
          <button onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-3 text-white/80 text-sm border border-white/20">
            <Search className="w-4 h-4 flex-shrink-0"/>
            <span>Busca destinos, @usuarios, spots...</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs defaultValue="explorar">
          <TabsList className="w-full mb-5 bg-white border border-border">
            <TabsTrigger value="explorar" className="flex-1 data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-1"/>Explorar
            </TabsTrigger>
            <TabsTrigger value="siguiendo" className="flex-1 data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-1"/>Siguiendo
              {(siguiendoSpots.length + siguiendoTemplates.length) > 0 && (
                <Badge variant="secondary" className="ml-1">{siguiendoSpots.length + siguiendoTemplates.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex-1 data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-1"/>Personas
            </TabsTrigger>
          </TabsList>

          {/* ── EXPLORAR ──────────────────────────────────────────────────── */}
          <TabsContent value="explorar">
            {/* Filtros de spots */}
            <div className="bg-white rounded-2xl border border-border p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filtrar spots</p>
                {activeFilters > 0 && (
                  <button onClick={() => { setSpotSearch(''); setSpotCity(''); setSpotTag(''); }}
                    className="text-xs text-orange-700 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3"/>Limpiar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Buscar</label>
                  <Input value={spotSearch} onChange={e => setSpotSearch(e.target.value)}
                    placeholder="mirador, ramen..." className="h-8 text-xs"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ciudad/País</label>
                  <Input value={spotCity} onChange={e => setSpotCity(e.target.value)}
                    placeholder="Tokyo, Italia..." className="h-8 text-xs"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tag</label>
                  <Input value={spotTag} onChange={e => setSpotTag(e.target.value)}
                    placeholder="sunset, temple..." className="h-8 text-xs"/>
                </div>
              </div>
            </div>

            {/* Spots */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-orange-700"/>
                <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Spots</h2>
                <Badge variant="secondary" className="ml-auto">{filteredSpots.length}</Badge>
              </div>
              {loadingSpots ? (
                <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-border animate-pulse"/>)}</div>
              ) : filteredSpots.length === 0 ? (
                <EmptyFeed emoji="📍" title="Sin spots" subtitle={activeFilters > 0 ? 'Prueba cambiando los filtros' : 'Sé el primero en publicar un spot'}/>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSpots.slice(0,12).map(spot => (
                    <FeedSpotCard key={spot.id} spot={spot} profile={profileMap[spot.created_by_user_id]}
                      currentUser={currentUser} onSave={handleSaveSpot} saving={savingSpotId===spot.id}/>
                  ))}
                </div>
              )}
            </div>

            {/* Itinerarios */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-orange-700"/>
                <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Itinerarios</h2>
                <Badge variant="secondary" className="ml-auto">{publicTemplates.length}</Badge>
              </div>
              {loadingTemplates ? (
                <div className="grid grid-cols-2 gap-3">{[1,2].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-border animate-pulse"/>)}</div>
              ) : publicTemplates.length === 0 ? (
                <EmptyFeed emoji="🗺️" title="Sin itinerarios todavía" subtitle="Publica tu primer viaje"/>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {publicTemplates.slice(0,6).map(t => <TemplateCard key={t.id} template={t} currentUser={currentUser}/>)}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── SIGUIENDO ─────────────────────────────────────────────────── */}
          <TabsContent value="siguiendo">
            {followedUserIds.length === 0 ? (
              <EmptyFeed emoji="👥" title="Aún no sigues a nadie" subtitle="Ve a Personas y sigue a viajeros"/>
            ) : (siguiendoSpots.length + siguiendoTemplates.length) === 0 ? (
              <EmptyFeed emoji="✨" title="Sin contenido todavía" subtitle="Las personas que sigues no han publicado nada aún"/>
            ) : (
              <div className="space-y-8">
                {siguiendoSpots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Compass className="w-4 h-4 text-orange-700"/>
                      <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Spots</h2>
                      <Badge variant="secondary" className="ml-auto">{siguiendoSpots.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {siguiendoSpots.map(spot => (
                        <FeedSpotCard key={spot.id} spot={spot} profile={profileMap[spot.created_by_user_id]}
                          currentUser={currentUser} onSave={handleSaveSpot} saving={savingSpotId===spot.id}/>
                      ))}
                    </div>
                  </div>
                )}
                {siguiendoTemplates.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-orange-700"/>
                      <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Itinerarios</h2>
                      <Badge variant="secondary" className="ml-auto">{siguiendoTemplates.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {siguiendoTemplates.map(t => <TemplateCard key={t.id} template={t} currentUser={currentUser}/>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── PERSONAS ──────────────────────────────────────────────────── */}
          <TabsContent value="personas">
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder="Busca por nombre, @usuario o país..." value={peopleQuery}
                onChange={e => setPeopleQuery(e.target.value)} className="pl-9 bg-white"/>
            </div>
            {filteredProfiles.length === 0 ? (
              <EmptyFeed emoji="🔍" title={peopleQuery ? 'Sin resultados' : 'Sin viajeros todavía'}
                subtitle={peopleQuery ? 'Prueba con otro nombre' : 'Sé de los primeros en unirte'}/>
            ) : (
              <div className="space-y-3">
                {filteredProfiles.map(profile => (
                  <UserCard key={profile.user_id} profile={profile} currentUser={currentUser}
                    myFollows={myFollows} onFollow={handleFollow}/>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CommunitySearch open={searchOpen} onOpenChange={setSearchOpen}/>
    </div>
  );
}

