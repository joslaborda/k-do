import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, Bookmark, UserPlus, UserCheck, MapPin, Globe, Compass } from 'lucide-react';
import TemplateCard from '@/components/explore/TemplateCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function Avatar({ profile }) {
  const initials = profile?.display_name?.[0]?.toUpperCase() || '?';
  if (profile?.avatar_url) return <img src={profile.avatar_url} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt={initials}/>;
  return <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{initials}</div>;
}

function SpotFeedCard({ spot, profile, currentUserId, onSave }) {
  const TYPE_EMOJI = { food:'🍽️', sight:'🏛️', activity:'⚡', shopping:'🛍️', transport:'🚆', custom:'📍' };
  const emoji = TYPE_EMOJI[spot.type] || '📍';
  const isOwn = currentUserId === spot.created_by_user_id;

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 60000,
  });
  const ups = comments.filter(c => c.thumb === 'up').length;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      {spot.image_url && <div className="h-32 overflow-hidden"><img src={spot.image_url} alt={spot.title} className="w-full h-full object-cover"/></div>}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar profile={profile}/>
          <div className="flex-1 min-w-0">
            <Link to={createPageUrl('Profile') + '?user_id=' + spot.created_by_user_id}
              className="text-xs font-semibold text-foreground hover:text-orange-700 block truncate">
              {profile?.display_name || 'Viajero'}
              {profile?.username && <span className="text-muted-foreground font-normal ml-1">@{profile.username}</span>}
            </Link>
            {spot.city_name && <p className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="w-3 h-3"/>{spot.city_name}{spot.country ? ', ' + spot.country : ''}</p>}
          </div>
          <span className="text-lg">{emoji}</span>
        </div>
        {spot.source_display_name && (
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Heart className="w-3 h-3 text-orange-400"/>Descubierto por @{spot.source_username || spot.source_display_name}
          </p>
        )}
        <p className="font-semibold text-sm text-foreground mb-1">{spot.title}</p>
        {spot.notes && <p className="text-xs text-muted-foreground line-clamp-2">{spot.notes}</p>}
        {spot.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {spot.tags.slice(0,3).map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-3 mt-2.5">
          {ups > 0 && <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">👍 {ups}</span>}
          {comments.length > 0 && <span className="text-xs text-muted-foreground">💬 {comments.length}</span>}
          {!isOwn && currentUserId && (
            <button onClick={() => onSave(spot)} className="ml-auto text-xs text-orange-700 font-medium hover:underline flex items-center gap-1">
              <Bookmark className="w-3 h-3"/>Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserCard({ profile, currentUserId, myFollows }) {
  const queryClient = useQueryClient();
  const followRecord = myFollows.find(f => f.followed_user_id === profile.user_id);
  const isOwn = currentUserId === profile.user_id;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (followRecord) await base44.entities.Follow.delete(followRecord.id);
      else await base44.entities.Follow.create({ follower_user_id: currentUserId, followed_user_id: profile.user_id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myFollows', currentUserId] }),
  });

  return (
    <div className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3">
      <Avatar profile={profile}/>
      <div className="flex-1 min-w-0">
        <Link to={createPageUrl('Profile') + '?user_id=' + profile.user_id}
          className="font-semibold text-sm text-foreground hover:text-orange-700 block truncate">
          {profile.display_name || 'Viajero'}
        </Link>
        {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
      </div>
      {!isOwn && currentUserId && (
        <button onClick={() => followMutation.mutate()}
          className={"flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors " +
            (followRecord ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-orange-700 text-white hover:bg-orange-800')}>
          {followRecord ? <><UserCheck className="w-3 h-3"/>Siguiendo</> : <><UserPlus className="w-3 h-3"/>Seguir</>}
        </button>
      )}
    </div>
  );
}

export default function TemplatesFeedTabs({ currentUserId, currentUserEmail, myProfile }) {
  const [activeTab, setActiveTab] = useState('spots');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

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
    queryKey: ['myFollows', currentUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUserId }),
    enabled: !!currentUserId,
    staleTime: 60000,
  });

  const followedUserIds = myFollows.map(f => f.followed_user_id);

  const profileMap = useMemo(() => {
    const m = {};
    allProfiles.forEach(p => { m[p.user_id] = p; });
    return m;
  }, [allProfiles]);

  // Algoritmo: primero seguidos, luego por popularidad
  const rankedSpots = useMemo(() => {
    return [...publicSpots].sort((a, b) => {
      const aF = followedUserIds.includes(a.created_by_user_id) ? 10 : 0;
      const bF = followedUserIds.includes(b.created_by_user_id) ? 10 : 0;
      return (bF + (b.saves_count || 0)) - (aF + (a.saves_count || 0));
    });
  }, [publicSpots, followedUserIds]);

  const filteredSpots = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rankedSpots;
    return rankedSpots.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.city_name?.toLowerCase().includes(q) ||
      s.country?.toLowerCase().includes(q) ||
      s.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [rankedSpots, searchQuery]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return publicTemplates;
    return publicTemplates.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.cities?.some(c => c.toLowerCase().includes(q)) ||
      t.countries?.some(c => c.toLowerCase().includes(q))
    );
  }, [publicTemplates, searchQuery]);

  const filteredPeople = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProfiles.filter(p =>
      p.user_id !== currentUserId && (!q ||
        p.display_name?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.home_country?.toLowerCase().includes(q))
    ).sort((a, b) => (followedUserIds.includes(a.user_id) ? 0 : 1) - (followedUserIds.includes(b.user_id) ? 0 : 1));
  }, [allProfiles, searchQuery, currentUserId, followedUserIds]);

  const saveSpotMutation = useMutation({
    mutationFn: spot => base44.entities.SavedSpot.create({
      user_id: currentUserId, folder: 'General',
      title: spot.title, type: spot.type,
      address: spot.address || '', city_name: spot.city_name || '', country: spot.country || '',
      notes: spot.notes || '', image_url: spot.image_url || '',
      source_spot_id: spot.id, source_user_id: spot.created_by_user_id,
      source_username: profileMap[spot.created_by_user_id]?.username || '',
      source_display_name: profileMap[spot.created_by_user_id]?.display_name || '',
      tags: spot.tags || [],
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSpots', currentUserId] }),
  });

  const tabs = [
    { id: 'spots', label: 'Spots', icon: '📍', count: filteredSpots.length },
    { id: 'viajes', label: 'Viajes', icon: '🗺️', count: filteredTemplates.length },
    { id: 'gente', label: 'Gente', icon: '👥', count: filteredPeople.length },
  ];

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Busca spots, destinos, viajeros..."
          className="pl-9 bg-white"/>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={"flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border " +
              (activeTab === t.id ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border hover:border-orange-300')}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count > 0 && <span className={"text-xs " + (activeTab === t.id ? 'text-white/70' : 'text-muted-foreground')}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* SPOTS */}
      {activeTab === 'spots' && (
        loadingSpots ? (
          <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-border animate-pulse"/>)}</div>
        ) : filteredSpots.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📍</div>
            <p className="font-semibold text-foreground">Sin spots todavía</p>
            <p className="text-sm text-muted-foreground mt-1">Sé el primero en publicar un spot</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSpots.slice(0, 12).map(spot => (
              <SpotFeedCard key={spot.id} spot={spot} profile={profileMap[spot.created_by_user_id]}
                currentUserId={currentUserId} onSave={s => saveSpotMutation.mutate(s)}/>
            ))}
          </div>
        )
      )}

      {/* VIAJES */}
      {activeTab === 'viajes' && (
        loadingTemplates ? (
          <div className="grid grid-cols-2 gap-3">{[1,2].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-border animate-pulse"/>)}</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="font-semibold text-foreground">Sin itinerarios todavía</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTemplates.slice(0, 6).map(t => <TemplateCard key={t.id} template={t} currentUser={{ id: currentUserId, email: currentUserEmail }}/>)}
          </div>
        )
      )}

      {/* GENTE */}
      {activeTab === 'gente' && (
        <div className="space-y-3">
          {filteredPeople.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👥</div>
              <p className="font-semibold text-foreground">{searchQuery ? 'Sin resultados' : 'Sin viajeros todavía'}</p>
            </div>
          ) : filteredPeople.map(p => (
            <UserCard key={p.user_id} profile={p} currentUserId={currentUserId} myFollows={myFollows}/>
          ))}
        </div>
      )}
    </div>
  );
}
