import { useState, useEffect, useMemo, useRef, useCallback} from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCountryMeta } from '@/lib/countryConfig';


function OTabBar({ tabs, activeKey, onChange }) {
  const containerRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const updateLine = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.findIndex(t => t.key === activeKey);
    const buttons = containerRef.current.querySelectorAll('button');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const labelEl = btn.querySelector('.tab-label');
    const labelRect = labelEl ? labelEl.getBoundingClientRect() : btnRect;
    setLineStyle({
      left: labelRect.left - containerRect.left,
      width: labelRect.width,
    });
  }, [activeKey, tabs]);

  useEffect(() => {
    updateLine();
    if (!mounted) setTimeout(() => setMounted(true), 50);
  }, [updateLine, mounted]);

  return (
    <div
      ref={containerRef}
      className="relative flex"
      style={{ position: 'relative' }}
    >
      {/* Animated sliding line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: lineStyle.left,
          width: lineStyle.width,
          height: 3,
          background: '#c2410c',
          borderRadius: 2,
          transition: mounted ? 'left 0.25s cubic-bezier(.4,0,.2,1), width 0.25s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      />
      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? '#1a1714' : '#a09890',
                transition: 'color 0.2s',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_EMOJI  = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', custom:'📍', other:'📍' };
const TYPE_LABEL  = { food:'Comida', sight:'Sights', activity:'Actividades', shopping:'Compras', custom:'Otro' };
const TYPE_FILTERS = [
  { key:'all',      label:'Todos' },
  { key:'food',     label:'🍜 Comida' },
  { key:'sight',    label:'🏛️ Sights' },
  { key:'activity', label:'⚡ Actividades' },
  { key:'shopping', label:'🛍️ Compras' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Group spots by country → city
// ─────────────────────────────────────────────────────────────────────────────
function groupByCountry(spots) {
  const g = {};
  spots.forEach(s => {
    const country = s.country || 'Otros';
    if (!g[country]) g[country] = [];
    g[country].push(s);
  });
  return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
}

function countryFlag(country) {
  return getCountryMeta(country)?.flag || '🌍';
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot row — used in both tabs and search results
// ─────────────────────────────────────────────────────────────────────────────
function SpotRow({ spot, isSaved, onSave, onUnsave, showLikes = false, showVisibility = false }) {
  const emoji = TYPE_EMOJI[spot.type] || '📍';
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span className="text-base flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {spot.city_name || spot.city || ''}
          {showLikes && spot.likes_count ? ` · ${spot.likes_count} likes` : ''}
        </p>
      </div>
      {showVisibility && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
          spot.visibility === 'public'
            ? 'bg-orange-50 text-primary border border-orange-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {spot.visibility === 'public' ? 'Público' : 'Privado'}
        </span>
      )}
      {onSave && !isSaved && (
        <button onClick={() => onSave(spot)}
          className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 hover:bg-orange-100 transition-colors">
          <Plus className="w-3.5 h-3.5 text-primary" />
        </button>
      )}
      {onSave && isSaved && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
          ✓ Guardado
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot collection grouped by country
// ─────────────────────────────────────────────────────────────────────────────
function SpotCollection({ spots, showLikes = false, showVisibility = false }) {
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState({});

  if (!spots.length) return (
    <div className="text-center py-10 px-4">
      <p className="text-3xl mb-2">📍</p>
      <p className="text-sm font-medium text-foreground mb-1">Nada aquí todavía</p>
      <p className="text-xs text-muted-foreground">Usa el buscador para descubrir spots y guardarlos</p>
    </div>
  );

  const groups = groupByCountry(spots);

  return (
    <div>
      {groups.map(([country, cSpots], gi) => {
        const isExp = expanded[country] !== false;
        const previewCount = 2;
        const visible = isExp ? (showAll[country] ? cSpots : cSpots.slice(0, previewCount)) : [];
        const flag = countryFlag(country);

        return (
          <div key={country} className={gi > 0 ? 'border-t border-border' : ''}>
            <button onClick={() => setExpanded(p => ({ ...p, [country]: !isExp }))}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm">{flag}</span>
                <span className="text-sm font-medium text-foreground">{country}</span>
                <span className="text-xs text-muted-foreground">· {cSpots.length} spot{cSpots.length !== 1 ? 's' : ''}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`text-muted-foreground transition-transform ${isExp ? 'rotate-90' : ''}`}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {isExp && visible.map(spot => (
              <div key={spot.id} className="border-t border-border">
                <SpotRow spot={spot} showLikes={showLikes} showVisibility={showVisibility} />
              </div>
            ))}

            {isExp && !showAll[country] && cSpots.length > previewCount && (
              <button onClick={() => setShowAll(p => ({ ...p, [country]: true }))}
                className="w-full text-left px-3 py-2 text-xs text-primary font-medium border-t border-border hover:bg-secondary/20 transition-colors">
                Ver {cSpots.length - previewCount} más →
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot search panel
// ─────────────────────────────────────────────────────────────────────────────
function SpotSearchPanel({ savedSpotIds, onSave }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState(null);
  const inputRef = useRef(null);

  const { data: allPublicSpots = [], isLoading } = useQuery({
    queryKey: ['publicSpots'],
    queryFn: async () => {
      const spots = await base44.entities.Spot.filter({ visibility: 'public' });
      return spots;
    },
    staleTime: 60000,
  });

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allPublicSpots.filter(s => {
      const matchesText =
        s.title?.toLowerCase().includes(q) ||
        s.city_name?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q));
      const matchesType = typeFilter === 'all' || s.type === typeFilter;
      return matchesText && matchesType;
    }).slice(0, 20);
  }, [query, typeFilter, allPublicSpots]);

  const handleSave = async (spot) => {
    await onSave(spot);
    setToastMsg(`${spot.title} guardado · Añadido a tu carpeta ${spot.country || ''}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className={`bg-white border rounded-2xl px-3 py-2.5 flex items-center gap-2 transition-colors ${
        query ? 'border-primary' : 'border-border'
      }`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${query ? 'text-primary' : 'text-muted-foreground'}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar spots para guardar..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery('')} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-foreground rounded-2xl px-4 py-3 flex items-center gap-2.5">
          <span className="text-base">✓</span>
          <p className="text-xs font-medium text-white">{toastMsg}</p>
        </div>
      )}

      {/* Results */}
      {query.trim() && (
        <>
          {/* Type filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setTypeFilter(f.key)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  typeFilter === f.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-border text-muted-foreground'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl text-center py-8">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-muted-foreground">Sin resultados para "{query}"</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <p className="text-xs text-muted-foreground px-3 pt-3 pb-1">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
              </p>
              {results.map((spot, i) => {
                const isSaved = savedSpotIds.has(spot.id);
                return (
                  <div key={spot.id} className={i > 0 ? 'border-t border-border' : ''}>
                    <SpotRow
                      spot={spot}
                      isSaved={isSaved}
                      onSave={isSaved ? null : handleSave}
                      showLikes
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('guardados');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const r = await base44.entities.UserProfile.filter({ user_id: user.id });
      return r[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // All spots created by the user
  const { data: mySpots = [] } = useQuery({
    queryKey: ['mySpots', user?.email],
    queryFn: () => base44.entities.Spot.filter({ created_by: user.email }),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  // Saved spots: spots created by user that are in a trip (saved to library)
  // We use a separate query for saved spots without trip_id filter
  const { data: savedSpots = [] } = useQuery({
    queryKey: ['savedSpots', user?.email],
    queryFn: async () => {
      // Saved = spots user explicitly saved from community (not created themselves)
      const all = await base44.entities.Spot.list();
      return all.filter(s => s.created_by !== user.email && s.saved_by?.includes(user.email));
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  // All trips for the user — to count finished ones
  const { data: myTrips = [] } = useQuery({
    queryKey: ['myTrips', user?.id],
    queryFn: async () => {
      // Get trips where user is creator or member
      const created = await base44.entities.Trip.filter({ created_by: user.id });
      return created;
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const tripsCount = myTrips.length;

  const savedSpotIds = useMemo(() => new Set(savedSpots.map(s => s.id)), [savedSpots]);

  // Count unique countries visited
  const countriesCount = useMemo(() => {
    const countries = new Set(mySpots.map(s => s.country).filter(Boolean));
    return countries.size;
  }, [mySpots]);

  // Save a spot to library
  const saveMutation = useMutation({
    mutationFn: async (spot) => {
      const existing = await base44.entities.Spot.filter({ id: spot.id });
      if (existing[0]) {
        const savedBy = existing[0].saved_by || [];
        if (!savedBy.includes(user.email)) {
          await base44.entities.Spot.update(spot.id, { saved_by: [...savedBy, user.email] });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSpots', user?.email] }),
  });

  if (profileLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  const displayName = profile?.display_name || user?.full_name || 'Usuario';
  const initials = displayName[0]?.toUpperCase() || '?';
  const countryMeta = getCountryMeta(profile?.home_country || '');

  return (
    <div className="bg-background min-h-screen">

      {/* ── Header ── */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('TripsList')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Mis viajes
            </Link>
            <Link to={createPageUrl('Settings')}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Configuración
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Perfil</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 pb-24 space-y-4">

        {/* ── Identity card ── */}
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-border flex-shrink-0 flex items-center justify-center bg-primary text-white text-xl font-medium">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none'; }}/>
                : initials
              }
            </div>
            <div>
              <p className="text-base font-medium text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                {profile?.username ? `@${profile.username}` : ''}
                {profile?.username && profile?.home_country ? ' · ' : ''}
                {profile?.home_country ? `${countryMeta.flag} ${profile.home_country}` : ''}
                {profile?.second_nationality ? (() => {
                  const m2 = getCountryMeta(profile.second_nationality);
                  return ` · ${m2.flag} ${profile.second_nationality}`;
                })() : ''}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex border-t border-border pt-3">
            {[
              { value: tripsCount, label: 'Viajes' },
              { value: mySpots.length, label: 'Creados' },
              { value: countriesCount, label: 'Países' },
            ].map((stat, i) => (
              <div key={stat.label} className={`flex-1 text-center ${i > 0 ? 'border-l border-border' : ''}`}>
                <p className="text-lg font-medium text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        <SpotSearchPanel
          savedSpotIds={savedSpotIds}
          onSave={spot => saveMutation.mutateAsync(spot)}
        />

        {/* ── Tabs ── */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <OTabBar
            tabs={[{key:'guardados',label:'Guardados'},{key:'creados',label:'Creados'}]}
            activeKey={tab}
            onChange={setTab}
          />

          {tab === 'guardados' && (
            <SpotCollection spots={savedSpots} />
          )}

          {tab === 'creados' && (
            <SpotCollection spots={mySpots} showLikes showVisibility />
          )}
        </div>

      </div>
    </div>
  );
}
