import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, UserPlus, UserCheck, Globe, Bookmark, BookmarkCheck,
  Plus, Loader2, MapPin
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

// ── helpers ───────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 8 }) {
  const initials = profile?.display_name?.[0]?.toUpperCase() || '?';
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} className={`w-${size} h-${size} rounded-full object-cover`} alt={initials} />;
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── User search ───────────────────────────────────────────────────────────────
function UserSearchBlock({ myUserId, myProfile }) {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', myUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: myUserId }),
    enabled: !!myUserId,
    staleTime: 30000,
  });

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['userSearch', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const clean = query.toLowerCase().trim();
      return base44.entities.UserProfile.filter({ username_normalized: clean });
    },
    enabled: query.trim().length >= 2,
    staleTime: 10000,
  });

  const followedIds = new Set(follows.map(f => f.followed_user_id));

  const followMutation = useMutation({
    mutationFn: async (profile) => {
      const existing = follows.find(f => f.followed_user_id === profile.user_id);
      if (existing) {
        await base44.entities.Follow.delete(existing.id);
      } else {
        await base44.entities.Follow.create({ follower_user_id: myUserId, followed_user_id: profile.user_id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follows', myUserId] }),
  });

  return (
    <div>
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Search className="w-4 h-4" />Buscar usuarios</h3>
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
        <Input
          className="pl-7"
          placeholder="username..."
          value={query}
          onChange={e => setQuery(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
        />
      </div>
      {isFetching && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
      {!isFetching && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Sin resultados para @{query}</p>
      )}
      {results.filter(p => p.user_id !== myUserId).map(profile => {
        const isFollowing = followedIds.has(profile.user_id);
        return (
          <div key={profile.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-orange-50 transition-colors">
            <Avatar profile={profile} size={9} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
            <Button
              size="sm"
              variant={isFollowing ? 'secondary' : 'default'}
              className={isFollowing ? '' : 'bg-orange-700 hover:bg-orange-800 text-white'}
              onClick={() => followMutation.mutate(profile)}
              disabled={followMutation.isPending}
            >
              {isFollowing ? <><UserCheck className="w-3 h-3 mr-1" />Siguiendo</> : <><UserPlus className="w-3 h-3 mr-1" />Seguir</>}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ── Itinerary templates ───────────────────────────────────────────────────────
function TemplatesBlock({ myUserId }) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['publicTemplates'],
    queryFn: () => base44.entities.ItineraryTemplate.filter({ visibility: 'public' }, '-created_date', 6),
    staleTime: 60000,
  });

  const { data: myCollection } = useQuery({
    queryKey: ['myCollection', myUserId],
    queryFn: async () => {
      const cols = await base44.entities.Collection.filter({ owner_user_id: myUserId });
      return cols[0] || null;
    },
    enabled: !!myUserId,
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (templateId) => {
      if (myCollection) {
        const ids = myCollection.template_ids || [];
        const already = ids.includes(templateId);
        await base44.entities.Collection.update(myCollection.id, {
          template_ids: already ? ids.filter(i => i !== templateId) : [...ids, templateId],
        });
      } else {
        await base44.entities.Collection.create({ owner_user_id: myUserId, name: 'Guardados', template_ids: [templateId] });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCollection', myUserId] }),
  });

  const savedIds = new Set(myCollection?.template_ids || []);

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4" />Itinerarios para ti</h3>
      {templates.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">Sé el primero en publicar</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {templates.map(t => {
            const saved = savedIds.has(t.id);
            return (
              <div key={t.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {t.cover_image && <img src={t.cover_image} className="w-full h-24 object-cover" alt={t.title} onError={e => e.currentTarget.style.display='none'} />}
                <div className="p-3">
                  <p className="font-semibold text-sm text-foreground">{t.title}</p>
                  {t.summary && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.summary}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {t.duration_days && <span>📅 {t.duration_days} días</span>}
                    {t.countries?.length > 0 && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{t.countries.join(', ')}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm" variant="ghost"
                      className="flex-1 text-xs h-7 hover:bg-orange-50"
                      onClick={() => saveMutation.mutate(t.id)}
                      disabled={saveMutation.isPending}
                    >
                      {saved ? <><BookmarkCheck className="w-3 h-3 mr-1 text-orange-600" />Guardado</> : <><Bookmark className="w-3 h-3 mr-1" />Guardar</>}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Publish itinerary ─────────────────────────────────────────────────────────
function PublishBlock({ myUserId, trips, allCities }) {
  const [open, setOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handlePublish = async () => {
    if (!selectedTripId) return;
    setSaving(true);
    const trip = trips.find(t => t.id === selectedTripId);
    const cities = allCities.filter(c => c.trip_id === selectedTripId);
    const duration = trip.start_date && trip.end_date
      ? differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1
      : null;
    const countries = [...new Set(cities.map(c => c.country).filter(Boolean))];
    const cityNames = cities.sort((a,b) => (a.order||0)-(b.order||0)).map(c => c.name);
    await base44.entities.ItineraryTemplate.create({
      title: trip.name,
      summary: trip.description || '',
      duration_days: duration,
      countries,
      cities: cityNames,
      cover_image: trip.cover_image || '',
      created_by_user_id: myUserId,
      visibility: 'public',
      source_trip_id: trip.id,
    });
    queryClient.invalidateQueries({ queryKey: ['publicTemplates'] });
    setSaving(false);
    setOpen(false);
    setSelectedTripId('');
  };

  return (
    <div>
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4" />Publicar itinerario</h3>
      <p className="text-sm text-muted-foreground mb-3">Comparte el resumen de uno de tus viajes (sin docs ni gastos).</p>
      <Button onClick={() => setOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-1.5" />Publicar un itinerario
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Publicar itinerario</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Solo se publicará el resumen: título, ciudades y duración. Nunca documentos ni gastos.</p>
          <div className="space-y-4 pt-2">
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger><SelectValue placeholder="Selecciona un viaje..." /></SelectTrigger>
              <SelectContent>
                {trips.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button className="bg-orange-700 hover:bg-orange-800 text-white" disabled={!selectedTripId || saving} onClick={handlePublish}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SocialExploreSection({ myUserId, myProfile, trips, allCities }) {
  return (
    <div className="space-y-8 mt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Explorar</h2>
        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5 font-medium">🌍 Social</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <UserSearchBlock myUserId={myUserId} myProfile={myProfile} />
        </div>
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-5">
          <TemplatesBlock myUserId={myUserId} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <PublishBlock myUserId={myUserId} trips={trips} allCities={allCities} />
      </div>
    </div>
  );
}