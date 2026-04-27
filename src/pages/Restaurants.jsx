import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Plus, X, ExternalLink, CheckCircle, Trash2, Compass, Navigation, PenLine, Heart, Star, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { getCountryMeta } from '@/lib/countryConfig';
import { createPageUrl } from '@/utils';

const OSM_MAP = {
  restaurant:'food', cafe:'food', bar:'food', fast_food:'food', pub:'food',
  bakery:'food', ice_cream:'food', food_court:'food', biergarten:'food',
  museum:'sight', monument:'sight', attraction:'sight', artwork:'sight',
  viewpoint:'sight', historic:'sight', temple:'sight', church:'sight',
  shrine:'sight', castle:'sight', ruins:'sight', gallery:'sight',
  park:'sight', nature_reserve:'sight', beach:'sight', peak:'sight',
  shop:'shopping', mall:'shopping', market:'shopping', supermarket:'shopping',
  bus_station:'transport', train_station:'transport', subway_entrance:'transport',
  airport:'transport', ferry_terminal:'transport',
  sports_centre:'activity', gym:'activity', swimming_pool:'activity',
  cinema:'activity', theatre:'activity', nightclub:'activity',
};

function osmToType(type, cls) { return OSM_MAP[type] || OSM_MAP[cls] || 'sight'; }

async function searchPlaces(query, city, country) {
  const q = [query, city, country].filter(Boolean).join(', ');
  const params = new URLSearchParams({ q, format:'json', limit:10, addressdetails:1, namedetails:1 });
  const res = await fetch('https://nominatim.openstreetmap.org/search?' + params, {
    headers: { 'Accept-Language':'es,en', 'User-Agent':'KodoTravelApp/1.0' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('search failed');
  const data = await res.json();
  return data.map(item => ({
    id: item.place_id?.toString(),
    name: item.namedetails?.name || item.namedetails?.['name:en'] || item.display_name?.split(',')[0] || query,
    address: [item.address?.road, item.address?.suburb, item.address?.city || item.address?.town || item.address?.village].filter(Boolean).join(', '),
    lat: parseFloat(item.lat), lng: parseFloat(item.lon),
    type: osmToType(item.type, item.class),
    osm_id: item.osm_id?.toString(),
  }));
}

async function nearbyPlaces(lat, lng) {
  const d = 0.012;
  const query = `[out:json][timeout:12];(node["amenity"](${lat-d},${lng-d},${lat+d},${lng+d});node["tourism"](${lat-d},${lng-d},${lat+d},${lng+d});node["historic"](${lat-d},${lng-d},${lat+d},${lng+d}););out 20;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method:'POST', body:query, signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error('overpass failed');
  const data = await res.json();
  return (data.elements||[]).filter(el => el.tags?.name).map(el => ({
    id: el.id?.toString(), name: el.tags.name,
    address: [el.tags['addr:street'], el.tags['addr:housenumber']].filter(Boolean).join(' '),
    lat: el.lat, lng: el.lon,
    type: osmToType(el.tags.amenity||el.tags.tourism||el.tags.historic||'', ''),
    osm_id: el.id?.toString(),
  })).slice(0, 15);
}

const SPOT_TYPES = [
  { value:'all', label:'Todos', emoji:'\u{1F4CD}' },
  { value:'food', label:'Restaurantes', emoji:'\u{1F35C}' },
  { value:'sight', label:'Atracciones', emoji:'\u{1F3DB}\uFE0F' },
  { value:'activity', label:'Actividades', emoji:'\u26A1' },
  { value:'shopping', label:'Compras', emoji:'\u{1F6CD}\uFE0F' },
  { value:'transport', label:'Transporte', emoji:'\u{1F686}' },
  { value:'custom', label:'Otro', emoji:'\u2B50' },
];

const TYPE_COLORS = {
  food:'bg-orange-100 text-orange-700 border-orange-200',
  sight:'bg-blue-100 text-blue-700 border-blue-200',
  activity:'bg-green-100 text-green-700 border-green-200',
  shopping:'bg-purple-100 text-purple-700 border-purple-200',
  transport:'bg-slate-100 text-slate-700 border-slate-200',
  custom:'bg-yellow-100 text-yellow-700 border-yellow-200',
};

function PlaceResultCard({ place, onSave, saving }) {
  const typeConf = SPOT_TYPES.find(t => t.value === place.type) || SPOT_TYPES[6];
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-orange-50 flex-shrink-0 flex items-center justify-center self-stretch">
        <span className="text-2xl">{typeConf.emoji}</span>
      </div>
      <div className="flex-1 min-w-0 p-3">
        <p className="font-semibold text-foreground text-sm leading-tight">{place.name}</p>
        <span className={"inline-block text-xs px-2 py-0.5 rounded-full border mt-1 " + (TYPE_COLORS[place.type]||TYPE_COLORS.custom)}>{typeConf.label}</span>
        {place.address && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0"/><span className="line-clamp-1">{place.address}</span></p>}
        <Button size="sm" onClick={() => onSave(place)} disabled={saving} className="mt-2 h-7 text-xs bg-orange-700 hover:bg-orange-800 text-white px-3">
          <Plus className="w-3 h-3 mr-1"/>{saving ? 'Guardando...' : 'Guardar spot'}
        </Button>
      </div>
    </div>
  );
}

function ManualForm({ onSave, saving, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('custom');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const addTag = v => { const t=v.trim().toLowerCase(); if(t&&!tags.includes(t)) setTags(p=>[...p,t]); setTagInput(''); };
  return (
    <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Crear spot</p>
        <button onClick={onClose} className="text-muted-foreground"><X className="w-4 h-4"/></button>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Mirador del atardecer, Ramen de la abuela..." className="h-9 text-sm"/>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
        <div className="flex flex-wrap gap-1.5">
          {SPOT_TYPES.filter(t => t.value!=='all').map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={"text-xs px-2.5 py-1 rounded-full border transition-colors "+(type===t.value?'bg-orange-700 text-white border-orange-700':'bg-white text-muted-foreground border-border hover:border-orange-300')}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tags <span className="opacity-60">(para que otros te encuentren)</span></label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
              #{t}<button onClick={() => setTags(p=>p.filter(x=>x!==t))}><X className="w-2.5 h-2.5"/></button>
            </span>
          ))}
        </div>
        <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(tagInput);} }}
          onBlur={() => tagInput && addTag(tagInput)}
          placeholder="sunset, mirador, templo... (Enter para añadir)" className="h-9 text-sm"/>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Dirección o referencia</label>
        <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, barrio, descripción..." className="h-9 text-sm"/>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Mejor hora para ir, qué pedir, por qué mola..."
          className="w-full text-sm border border-border rounded-lg px-3 py-2 h-20 resize-none outline-none focus:border-orange-400"/>
      </div>
      <Button onClick={() => onSave({ title, type, notes, address, tags })} disabled={!title.trim()||saving} className="w-full bg-orange-700 hover:bg-orange-800 text-white">
        {saving ? 'Guardando...' : 'Guardar spot'}
      </Button>
    </div>
  );
}


// ── Popup valoración (mismo que SpotCard) ────────────────────────────────────
function RatingPopup({ spot, userId, userProfile, onClose }) {
  const queryClient = useQueryClient();
  const [thumb, setThumb] = useState(null);
  const [text, setText] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id, user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      user_avatar: userProfile?.avatar_url || '',
      thumb, text: text.trim() || null,
      image_url: imageUrl.trim() || null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-sm">¿Qué te pareció?</p>
            <p className="text-xs text-muted-foreground mt-0.5">{spot.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><X className="w-4 h-4"/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setThumb('up')} className={"flex items-center justify-center gap-2 py-3 rounded-xl border transition-all " + (thumb==='up' ? 'bg-green-50 border-green-300' : 'bg-secondary border-border hover:border-green-200')}>
            <span className="text-xl">👍</span><span className={"text-sm font-medium " + (thumb==='up' ? 'text-green-700' : 'text-muted-foreground')}>Me gustó</span>
          </button>
          <button onClick={() => setThumb('down')} className={"flex items-center justify-center gap-2 py-3 rounded-xl border transition-all " + (thumb==='down' ? 'bg-red-50 border-red-300' : 'bg-secondary border-border hover:border-red-200')}>
            <span className="text-xl">👎</span><span className={"text-sm font-medium " + (thumb==='down' ? 'text-red-700' : 'text-muted-foreground')}>No tanto</span>
          </button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Cuéntanos qué tal... (opcional)"
          className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-orange-400 bg-secondary mb-3"/>
        {showImageField
          ? <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL de la foto..." className="w-full text-sm border border-border rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 bg-secondary mb-3"/>
          : <button onClick={() => setShowImageField(true)} className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-orange-300 hover:text-orange-600 mb-3"><Camera className="w-4 h-4"/>Añadir foto</button>
        }
        <button onClick={() => mutation.mutate()} disabled={!thumb || mutation.isPending}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-medium text-sm disabled:opacity-50 hover:bg-green-700">
          {mutation.isPending ? 'Guardando...' : 'Guardar valoración'}
        </button>
      </div>
    </div>
  );
}

// ── Popup comentarios ─────────────────────────────────────────────────────────
function CommentsPopup({ spot, userId, userProfile, onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [thumb, setThumb] = useState(null);
  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 30000,
  });
  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id, user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      thumb, text: text.trim() || null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] }); setText(''); setThumb(null); },
  });
  const ups = comments.filter(c => c.thumb==='up').length;
  const downs = comments.filter(c => c.thumb==='down').length;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl flex flex-col max-h-[75vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-3"/>
          <div className="flex items-start justify-between">
            <div><p className="font-semibold text-sm">Comentarios</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">👍 {ups}</span>
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">👎 {downs}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><X className="w-4 h-4"/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sin comentarios todavía</p>}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">{c.user_display_name?.[0]?.toUpperCase()||'?'}</div>
              <div className="flex-1 bg-secondary rounded-2xl rounded-tl-none px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">@{c.username||c.user_display_name}</span>
                  <span className="text-sm">{c.thumb==='up'?'👍':'👎'}</span>
                </div>
                {c.text && <p className="text-sm">{c.text}</p>}
                {c.image_url && <img src={c.image_url} alt="foto" className="w-full rounded-xl mt-2 object-cover max-h-40" onError={e=>e.currentTarget.style.display='none'}/>}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex gap-2 mb-2">
            <button onClick={() => setThumb(thumb==='up'?null:'up')} className={"px-3 py-1.5 rounded-lg text-sm border " + (thumb==='up'?'bg-green-50 border-green-300':'bg-secondary border-border')}>👍</button>
            <button onClick={() => setThumb(thumb==='down'?null:'down')} className={"px-3 py-1.5 rounded-lg text-sm border " + (thumb==='down'?'bg-red-50 border-red-300':'bg-secondary border-border')}>👎</button>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Añade un comentario..."
              className="flex-1 text-sm border border-border rounded-xl px-3 py-1.5 resize-none outline-none focus:border-orange-400 bg-secondary h-9"/>
          </div>
          <button onClick={() => mutation.mutate()} disabled={!thumb||mutation.isPending}
            className="w-full py-2 rounded-xl bg-orange-700 text-white text-sm font-medium disabled:opacity-50 hover:bg-orange-800">
            {mutation.isPending ? '...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SavedSpotCard ─────────────────────────────────────────────────────────────
function SavedSpotCard({ spot, currentUserEmail, userId, userProfile, onDelete, onToggleVisited, onTogglePublic }) {
  const [showRating, setShowRating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 30000,
  });

  const type = spot.type || 'custom';
  const TYPE_CONFIG = {
    food:{ label:'Restaurante', emoji:'🍽️', color:'bg-orange-100 text-orange-800' },
    sight:{ label:'Atracción', emoji:'🏛️', color:'bg-blue-100 text-blue-800' },
    activity:{ label:'Actividad', emoji:'⚡', color:'bg-green-100 text-green-800' },
    shopping:{ label:'Compras', emoji:'🛍️', color:'bg-purple-100 text-purple-800' },
    transport:{ label:'Transporte', emoji:'🚆', color:'bg-slate-100 text-slate-800' },
    custom:{ label:'Otro', emoji:'⭐', color:'bg-yellow-100 text-yellow-800' },
  };
  const tc = TYPE_CONFIG[type] || TYPE_CONFIG.custom;
  const canDelete = spot.created_by === currentUserEmail;
  const ups = comments.filter(c => c.thumb==='up').length;
  const downs = comments.filter(c => c.thumb==='down').length;

  const handleMarkVisited = () => {
    if (!spot.visited) { onToggleVisited(spot); setShowRating(true); }
    else { onToggleVisited(spot); }
  };

  return (
    <>
      <div className={"rounded-2xl border transition-all " + (spot.visited ? 'bg-green-50 border-green-200' : 'bg-white border-border')}>
        <div className="p-4">
          {(spot.source_username||spot.source_display_name) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Heart className="w-3 h-3 text-orange-400"/>
              Recomendado por <span className="font-medium text-orange-700">@{spot.source_username||spot.source_display_name}</span>
            </p>
          )}
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">{tc.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-sm leading-tight">{spot.title}</p>
                {spot.visited && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">✅ Visitado</span>}
              </div>
              <span className={"inline-block text-xs px-2 py-0.5 rounded-full mt-1 " + tc.color}>{tc.label}</span>
              {spot.address && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5"><MapPin className="w-3 h-3 flex-shrink-0"/>{spot.address}</p>}
              {spot.notes && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{spot.notes}</p>}
              {spot.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spot.tags.map(t => <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">#{t}</span>)}
                </div>
              )}
            </div>
          </div>
          {(ups+downs) > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {ups>0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">👍 {ups}</span>}
              {downs>0 && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">👎 {downs}</span>}
              <button onClick={() => setShowComments(true)} className="text-xs text-muted-foreground hover:text-orange-700 ml-1">
                💬 {comments.length} comentario{comments.length!==1?'s':''}
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-inherit px-4 py-3 flex gap-2">
          <button onClick={handleMarkVisited}
            className={"flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all " +
              (spot.visited ? 'bg-green-100 border-green-300' : 'bg-secondary border-border hover:bg-green-50 hover:border-green-200')}>
            <span className="text-base">✅</span>
            <span className={"text-xs font-medium " + (spot.visited ? 'text-green-700' : 'text-muted-foreground')}>{spot.visited?'Hecho':'Marcar hecho'}</span>
          </button>
          <button onClick={() => setShowComments(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border border-border bg-secondary hover:bg-blue-50 hover:border-blue-200 transition-all">
            <span className="text-base">💬</span>
            <span className="text-xs font-medium text-muted-foreground">{comments.length>0?`${comments.length} comentarios`:'Comentar'}</span>
          </button>
          <button onClick={() => onTogglePublic(spot)}
            className={"flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all " +
              (spot.visibility==='public' ? 'bg-blue-50 border-blue-200' : 'bg-secondary border-border hover:bg-blue-50 hover:border-blue-200')}>
            <span className="text-base">🌍</span>
            <span className={"text-xs font-medium " + (spot.visibility==='public'?'text-blue-700':'text-muted-foreground')}>{spot.visibility==='public'?'Publicado':'Compartir'}</span>
          </button>
          {canDelete && (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl border border-border bg-secondary hover:bg-red-50 hover:border-red-200 transition-all">
              <span className="text-base">🗑️</span>
              <span className="text-xs font-medium text-muted-foreground">Borrar</span>
            </button>
          )}
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          {(spot.lat&&spot.lng) && (
            <a href={`https://www.google.com/maps?q=${spot.lat},${spot.lng}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-green-700 hover:underline flex items-center gap-1">
              <Navigation className="w-3 h-3"/>Abrir en Maps
            </a>
          )}
          {spot.visited && (
            <button onClick={() => onToggleVisited(spot)} className="text-xs text-muted-foreground hover:text-foreground ml-auto underline underline-offset-2">
              Desmarcar como visitado
            </button>
          )}
        </div>
      </div>
      {showRating && <RatingPopup spot={spot} userId={userId} userProfile={userProfile} onClose={() => setShowRating(false)}/>}
      {showComments && <CommentsPopup spot={spot} userId={userId} userProfile={userProfile} onClose={() => setShowComments(false)}/>}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4"/>
            <p className="font-semibold text-sm mb-1">¿Eliminar este spot?</p>
            <p className="text-xs text-muted-foreground mb-5">Se eliminará <strong>{spot.title}</strong>. Esta acción no se puede deshacer.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="py-3 rounded-xl border border-border bg-secondary text-sm font-medium">Cancelar</button>
              <button onClick={() => { onDelete(spot.id); setShowDeleteConfirm(false); }} className="py-3 rounded-xl bg-red-600 text-white text-sm font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function Restaurants() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trip, activeCity } = useTripContext(tripId);
  const city = activeCity?.name||trip?.destination||'';
  const country = activeCity?.country||trip?.country||'';
  const flag = getCountryMeta(activeCity?.country_code||country||'').flag;
  const cityId = activeCity?.id||null;

  const [panelMode, setPanelMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const searchTimer = useRef(null);

  const { data: spots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0]||null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.Spot.create(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Spot.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });
  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Spot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spots', tripId] }),
  });

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try { setSearchResults(await searchPlaces(searchQuery, city, country)); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 700);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, city, country]);

  const handleNearby = async () => {
    setPanelMode('nearby'); setLoadingNearby(true); setNearbyError(''); setNearbyResults([]);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const results = await nearbyPlaces(pos.coords.latitude, pos.coords.longitude);
          setNearbyResults(results);
          if (!results.length) setNearbyError('No encontramos lugares con nombre cerca de ti');
        } catch { setNearbyError('Error al buscar lugares cercanos'); }
        finally { setLoadingNearby(false); }
      },
      () => { setNearbyError('No se pudo obtener tu ubicación. Activa el GPS.'); setLoadingNearby(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const baseData = extra => ({
    trip_id: tripId, city_id: cityId||undefined, city_name: city, country,
    visibility: 'trip_members', visited: false,
    created_by: user?.email, created_by_user_id: user?.id,
    creator_username: myProfile?.username||'',
    creator_display_name: myProfile?.display_name||user?.full_name||'',
    creator_avatar: myProfile?.avatar_url||'',
    ...extra,
  });

  const saveOsmPlace = async place => {
    setSavingId(place.id);
    try {
      await createMutation.mutateAsync(baseData({
        title: place.name, type: place.type||'sight',
        address: place.address||'', lat: place.lat, lng: place.lng,
        osm_id: place.osm_id||'', tags: [],
      }));
      setSearchResults([]); setNearbyResults([]); setSearchQuery(''); setPanelMode(null);
    } finally { setSavingId(null); }
  };

  const saveManual = async form => {
    setSavingId('manual');
    try {
      await createMutation.mutateAsync(baseData({ title:form.title, type:form.type, notes:form.notes, address:form.address, tags:form.tags||[] }));
      setPanelMode(null);
    } finally { setSavingId(null); }
  };

  const handleToggleVisited = spot => updateMutation.mutate({ id:spot.id, data:{ visited:!spot.visited } });
  const handleTogglePublic = spot => updateMutation.mutate({ id:spot.id, data:{ visibility:spot.visibility==='public'?'trip_members':'public' } });

  const filteredSpots = activeFilter==='all' ? spots : spots.filter(s => s.type===activeFilter);
  const pendingCount = spots.filter(s => !s.visited).length;

  if (!tripId) return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <div className="bg-orange-700 pt-12 pb-20 px-6"><h1 className="text-white text-4xl font-bold">Spots</h1></div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <Compass className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-30"/>
          <h2 className="text-xl font-bold mb-2">Selecciona un viaje</h2>
          <Button onClick={() => navigate(createPageUrl('TripsList'))} className="bg-orange-700 hover:bg-orange-800 text-white w-full mt-4">Ir a mis viajes</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      <div className="bg-orange-700 pt-12 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <p className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-1">{trip?.name||'Tu viaje'}</p>
            <h1 className="text-white text-4xl font-bold">Spots {flag}</h1>
            <p className="text-white/80 mt-1 text-sm">
              {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount>1?'s':''}` : spots.length > 0 ? 'Todos visitados' : 'Sin spots todavía'}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={city ? `Busca en ${city}...` : 'Busca un lugar...'}
                className="pl-9 pr-24 bg-white border-0 h-11 text-sm"/>
              {searchQuery ? (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                  <X className="w-4 h-4"/>
                </button>
              ) : (
                <button onClick={handleNearby}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                  <Navigation className="w-3 h-3"/>Cerca
                </button>
              )}
            </div>
            <button onClick={() => setPanelMode(panelMode === 'manual' ? null : 'manual')}
              className={"w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all " +
                (panelMode === 'manual' ? 'bg-white text-orange-700 border-white' : 'bg-white/20 text-white border-white/30 hover:bg-white/30')}>
              {panelMode === 'manual' ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
            </button>
          </div>
          {searching && <p className="text-white/70 text-xs mt-2 text-center">Buscando...</p>}
          {loadingNearby && <p className="text-white/70 text-xs mt-2 text-center">Obteniendo tu ubicación...</p>}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-white/70 text-xs mt-2 text-center">Sin resultados — prueba en inglés</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-4">
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">{searchResults.length} resultados</p>
            {searchResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
          </div>
        )}

        {panelMode === 'nearby' && (
          <div className="space-y-3">
            {loadingNearby && (
              <div className="bg-white rounded-2xl border border-border p-6 text-center">
                <Navigation className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-pulse"/>
                <p className="text-sm text-muted-foreground">Obteniendo tu ubicación...</p>
              </div>
            )}
            {nearbyError && <div className="bg-white rounded-2xl border border-border p-4 text-center"><p className="text-sm text-muted-foreground">{nearbyError}</p></div>}
            {!loadingNearby && nearbyResults.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">{nearbyResults.length} lugares cerca de ti</p>
                {nearbyResults.map(p => <PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id}/>)}
              </>
            )}
          </div>
        )}

        {panelMode === 'manual' && <ManualForm onSave={saveManual} saving={savingId==='manual'} onClose={() => setPanelMode(null)}/>}

        {spots.length > 0 && !['search','nearby'].includes(panelMode) && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {SPOT_TYPES.filter(t => t.value==='all' || spots.some(s => s.type===t.value)).map(t => (
              <button key={t.value} onClick={() => setActiveFilter(t.value)}
                className={"flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border " +
                  (activeFilter===t.value ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-muted-foreground border-border hover:border-orange-300')}>
                <span>{t.emoji}</span><span>{t.label}</span>
                {t.value!=='all' && <span className={"text-xs "+(activeFilter===t.value?'text-white/70':'text-muted-foreground')}>{spots.filter(s=>s.type===t.value).length}</span>}
              </button>
            ))}
          </div>
        )}

        {filteredSpots.length > 0 ? (
          <div className="space-y-3">
            {filteredSpots.filter(s => !s.visited).map(spot => (
              <SavedSpotCard key={spot.id} spot={spot} currentUserEmail={user?.email} userId={user?.id} userProfile={myProfile}
                onDelete={id => deleteMutation.mutate(id)} onToggleVisited={handleToggleVisited} onTogglePublic={handleTogglePublic}/>
            ))}
            {filteredSpots.filter(s => s.visited).length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">Visitados</p>
                {filteredSpots.filter(s => s.visited).map(spot => (
                  <SavedSpotCard key={spot.id} spot={spot} currentUserEmail={user?.email}
                    onDelete={id => deleteMutation.mutate(id)} onToggleVisited={handleToggleVisited} onTogglePublic={handleTogglePublic}/>
                ))}
              </>
            )}
          </div>
        ) : panelMode === null && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Sin spots todavía</h3>
            <p className="text-muted-foreground text-sm">Busca lugares, usa tu ubicación o crea un spot a mano.</p>
          </div>
        )}
      </div>
    </div>
  );
}