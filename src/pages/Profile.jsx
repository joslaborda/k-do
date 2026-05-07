import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, MapPin, Globe, ChevronDown, ChevronRight, BookmarkCheck, Pencil, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COUNTRIES = [
  { name: 'España', flag: '🇪🇸', currency: 'EUR' },
  { name: 'México', flag: '🇲🇽', currency: 'MXN' },
  { name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  { name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  { name: 'Perú', flag: '🇵🇪', currency: 'PEN' },
  { name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  { name: 'Venezuela', flag: '🇻🇪', currency: 'VES' },
  { name: 'Ecuador', flag: '🇪🇨', currency: 'USD' },
  { name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
  { name: 'Brasil', flag: '🇧🇷', currency: 'BRL' },
  { name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP' },
  { name: 'Francia', flag: '🇫🇷', currency: 'EUR' },
  { name: 'Alemania', flag: '🇩🇪', currency: 'EUR' },
  { name: 'Italia', flag: '🇮🇹', currency: 'EUR' },
  { name: 'Otro', flag: '🌍', currency: 'USD' },
];

const TYPE_EMOJI = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', custom:'📍' };

// Agrupa spots por país → ciudad
function groupByCountryCity(spots) {
  const groups = {};
  spots.forEach(s => {
    const country = s.country || 'Otros';
    const city = s.city_name || s.city || '—';
    if (!groups[country]) groups[country] = {};
    if (!groups[country][city]) groups[country][city] = [];
    groups[country][city].push(s);
  });
  return groups;
}

function SpotMiniCard({ spot }) {
  const emoji = TYPE_EMOJI[spot.type] || '📍';
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
        {spot.notes && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{spot.notes}</p>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {spot.visited && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✅</span>}
      </div>
    </div>
  );
}

function CountryCityAccordion({ groups }) {
  const [openCountries, setOpenCountries] = useState({});
  const [openCities, setOpenCities] = useState({});
  const countries = Object.keys(groups);
  if (!countries.length) return (
    <div className="text-center py-8">
      <p className="text-2xl mb-2">📍</p>
      <p className="text-sm text-muted-foreground">Nada aquí todavía</p>
    </div>
  );
  return (
    <div className="space-y-2">
      {countries.map(country => {
        const cities = groups[country];
        const totalSpots = Object.values(cities).flat().length;
        const isOpen = openCountries[country] !== false; // open by default
        return (
          <div key={country} className="rounded-xl border border-border overflow-hidden">
            <button onClick={() => setOpenCountries(p => ({ ...p, [country]: !isOpen }))}
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-border/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{country}</span>
                <span className="text-xs text-muted-foreground">{totalSpots} spot{totalSpots !== 1 ? 's' : ''}</span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
            </button>
            {isOpen && (
              <div className="divide-y divide-border">
                {Object.entries(cities).map(([city, spots]) => {
                  const cityKey = country + city;
                  const cityOpen = openCities[cityKey] !== false;
                  return (
                    <div key={city}>
                      <button onClick={() => setOpenCities(p => ({ ...p, [cityKey]: !cityOpen }))}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{city}</span>
                          <span className="text-xs text-muted-foreground">{spots.length}</span>
                        </div>
                        {cityOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground"/> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground"/>}
                      </button>
                      {cityOpen && (
                        <div className="px-4 pb-2">
                          {spots.map((s, i) => <SpotMiniCard key={s.id || i} spot={s} />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [spotsTab, setSpotsTab] = useState('saved'); // saved | created | shared

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const r = await base44.entities.UserProfile.filter({ user_id: user.id });
      return r[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Todos los spots del usuario
  const { data: allSpots = [] } = useQuery({
    queryKey: ['allUserSpots', user?.email],
    queryFn: () => base44.entities.Spot.list(),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        username: profile.username || '',
        home_country: profile.home_country || 'España',
        home_currency: profile.home_currency || 'EUR',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: data => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
      setEditing(false);
    },
  });

  // Clasificar spots
  const savedSpots = useMemo(() =>
    allSpots.filter(s => s.created_by !== user?.email && s.trip_id),
    [allSpots, user?.email]
  );

  const createdSpots = useMemo(() =>
    allSpots.filter(s => s.created_by === user?.email),
    [allSpots, user?.email]
  );

  const sharedSpots = useMemo(() =>
    allSpots.filter(s => s.created_by === user?.email && s.visibility === 'public'),
    [allSpots, user?.email]
  );

  const savedGroups = useMemo(() => groupByCountryCity(savedSpots), [savedSpots]);
  const createdGroups = useMemo(() => groupByCountryCity(createdSpots), [createdSpots]);
  const sharedGroups = useMemo(() => groupByCountryCity(sharedSpots), [sharedSpots]);

  const activeGroups = spotsTab === 'saved' ? savedGroups : spotsTab === 'created' ? createdGroups : sharedGroups;
  const activeCount = spotsTab === 'saved' ? savedSpots.length : spotsTab === 'created' ? createdSpots.length : sharedSpots.length;

  if (isLoading) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-700 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 pb-10">
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-lg mx-auto px-5 flex items-center justify-between">
          <Link to={createPageUrl('TripsList')}>
            <button className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium">
              <ArrowLeft className="w-4 h-4"/>Mis viajes
            </button>
          </Link>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium">
            <Settings className="w-4 h-4"/>{editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-12 space-y-4">
        {/* Avatar + nombre */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-white shadow flex items-center justify-center overflow-hidden flex-shrink-0">
              {(profile?.avatar_url) ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display='none'}/>
              ) : (
                <span className="text-2xl font-bold text-orange-700">
                  {(profile?.display_name || user?.full_name || '?')[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-foreground truncate">{profile?.display_name || user?.full_name}</p>
              {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              {profile?.home_country && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3"/>
                  <span>{COUNTRIES.find(c => c.name === profile.home_country)?.flag} {profile.home_country}</span>
                  <span>·</span>
                  <Globe className="w-3 h-3"/>
                  <span>{profile.home_currency}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
            <p className="font-semibold text-sm">Editar perfil</p>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre visible</label>
              <Input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Tu nombre"/>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL de avatar (opcional)</label>
              <Input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://..."/>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">País de origen</label>
              <select value={form.home_country}
                onChange={e => {
                  const c = COUNTRIES.find(x => x.name === e.target.value) || COUNTRIES[0];
                  setForm(p => ({ ...p, home_country: c.name, home_currency: c.currency }));
                }}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-secondary outline-none focus:border-orange-400">
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Moneda base</label>
              <select value={form.home_currency}
                onChange={e => setForm(p => ({ ...p, home_currency: e.target.value }))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-secondary outline-none focus:border-orange-400">
                {['EUR','USD','MXN','COP','ARS','CLP','GBP','JPY','BRL'].map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        )}

        {/* Biblioteca de Spots */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <p className="font-semibold text-sm text-foreground mb-3">Mi biblioteca de spots</p>
            <div className="flex gap-1">
              {[
                { key:'saved', icon:<BookmarkCheck className="w-3.5 h-3.5"/>, label:'Guardados', count:savedSpots.length },
                { key:'created', icon:<Pencil className="w-3.5 h-3.5"/>, label:'Mis creados', count:createdSpots.length },
                { key:'shared', icon:<Share2 className="w-3.5 h-3.5"/>, label:'Compartidos', count:sharedSpots.length },
              ].map(tab => (
                <button key={tab.key} onClick={() => setSpotsTab(tab.key)}
                  className={"flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors " +
                    (spotsTab === tab.key ? 'bg-orange-700 text-white border-orange-700' : 'bg-white border-border text-muted-foreground hover:border-orange-300')}>
                  {tab.icon}{tab.label}
                  {tab.count > 0 && <span className={"text-xs px-1.5 py-0.5 rounded-full " + (spotsTab === tab.key ? 'bg-white/20' : 'bg-secondary')}>{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {spotsTab === 'saved' && (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Spots que has guardado de la comunidad, organizados por destino</p>
                <CountryCityAccordion groups={savedGroups}/>
              </div>
            )}
            {spotsTab === 'created' && (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Spots que has creado — incluye los que has visitado y valorado</p>
                <CountryCityAccordion groups={createdGroups}/>
              </div>
            )}
            {spotsTab === 'shared' && (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Spots que has publicado para la comunidad de Kōdo</p>
                <CountryCityAccordion groups={sharedGroups}/>
              </div>
            )}
          </div>
        </div>

        {/* Cuenta */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="font-semibold text-sm text-foreground mb-3">Cuenta</p>
          <div className="space-y-2">
            {[
              { label:'Email', value: user?.email },
              { label:'Username', value: profile?.username ? '@' + profile.username : '—' },
              { label:'País', value: (COUNTRIES.find(c => c.name === profile?.home_country)?.flag || '') + ' ' + (profile?.home_country || '—') },
              { label:'Moneda', value: profile?.home_currency || '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => base44.auth.logout()}
            className="w-full mt-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
