import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTripContext } from '@/hooks/useTripContext';
import { getSeedSpotsForCity } from '@/lib/spotsDB';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Navigation, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OSM_MAP = { restaurant:'food',cafe:'food',bar:'food',fast_food:'food',pub:'food',bakery:'food',museum:'sight',monument:'sight',attraction:'sight',viewpoint:'sight',temple:'sight',church:'sight',shrine:'sight',castle:'sight',gallery:'sight',park:'sight',shop:'shopping',mall:'shopping',market:'shopping',bus_station:'transport',train_station:'transport',subway_entrance:'transport',sports_centre:'activity',cinema:'activity',theatre:'activity' };
function osmToType(type,cls){return OSM_MAP[type]||OSM_MAP[cls]||'sight';}

async function searchPlaces(query,city,country){
  const q=[query,city,country].filter(Boolean).join(', ');
  const params=new URLSearchParams({q,format:'json',limit:8,addressdetails:1,namedetails:1});
  const res=await fetch('https://nominatim.openstreetmap.org/search?'+params,{headers:{'Accept-Language':'es,en','User-Agent':'KodoTravelApp/1.0'},signal:AbortSignal.timeout(8000)});
  if(!res.ok)throw new Error('search failed');
  const data=await res.json();
  return data.map(item=>({id:item.place_id?.toString(),name:item.namedetails?.name||item.display_name?.split(',')[0]||query,address:[item.address?.road,item.address?.city||item.address?.town].filter(Boolean).join(', '),lat:parseFloat(item.lat),lng:parseFloat(item.lon),type:osmToType(item.type,item.class)}));
}

async function nearbyPlaces(lat,lng){
  const d=0.012;
  const query=`[out:json][timeout:10];(node["amenity"](${lat-d},${lng-d},${lat+d},${lng+d});node["tourism"](${lat-d},${lng-d},${lat+d},${lng+d}););out 15;`;
  const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:query,signal:AbortSignal.timeout(12000)});
  if(!res.ok)throw new Error('overpass failed');
  const data=await res.json();
  return (data.elements||[]).filter(el=>el.tags?.name).map(el=>({id:el.id?.toString(),name:el.tags.name,address:[el.tags['addr:street'],el.tags['addr:housenumber']].filter(Boolean).join(' '),lat:el.lat,lng:el.lon,type:osmToType(el.tags.amenity||el.tags.tourism||'','')})).slice(0,12);
}

async function reverseGeocode(lat,lng){
  try{
    const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,{headers:{'Accept-Language':'es,en','User-Agent':'KodoTravelApp/1.0'},signal:AbortSignal.timeout(6000)});
    const d=await res.json();const a=d.address||{};
    const road=a.road||a.pedestrian||a.footway||'';
    const city=a.city||a.town||a.village||a.municipality||'';
    return [road,city].filter(Boolean).join(', ')||d.display_name?.split(',').slice(0,2).join(',')||'';
  }catch{return '';}
}

async function loadLeaflet(){
  if(window.L)return window.L;
  await new Promise((res,rej)=>{
    const link=document.createElement('link');link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(link);
    const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=res;script.onerror=rej;document.head.appendChild(script);
  });
  return window.L;
}

const TYPE_CONFIG={food:{label:'Comer',emoji:'🍜',color:'bg-orange-100 text-orange-800'},sight:{label:'Cultura',emoji:'🏛️',color:'bg-blue-100 text-blue-800'},activity:{label:'Actividad',emoji:'⚡',color:'bg-green-100 text-green-800'},shopping:{label:'Compras',emoji:'🛍️',color:'bg-purple-100 text-purple-800'},transport:{label:'Transporte',emoji:'🚆',color:'bg-slate-100 text-slate-800'},custom:{label:'Otro',emoji:'📍',color:'bg-yellow-100 text-yellow-800'}};

// KEY: resolve city_id so spots appear in Home Hoy/Mañana
function cityIdForDate(date,cities){
  if(!date||!cities?.length)return null;
  const s=[...cities].sort((a,b)=>(a.start_date||'').localeCompare(b.start_date||''));
  for(const c of s){if(c.start_date&&c.end_date&&date>=c.start_date&&date<=c.end_date)return c.id;}
  const b=s.filter(c=>c.start_date&&c.start_date<=date);
  return b.length?b[b.length-1].id:s[0]?.id||null;
}
function cityNameForDate(date,cities){
  if(!date||!cities?.length)return null;
  const s=[...cities].sort((a,b)=>(a.start_date||'').localeCompare(b.start_date||''));
  for(const c of s){if(c.start_date&&c.end_date&&date>=c.start_date&&date<=c.end_date)return c.name;}
  const b=s.filter(c=>c.start_date&&c.start_date<=date);
  return b.length?b[b.length-1].name:s[0]?.name||null;
}

function buildCityHashtags(cityName,country){
  if(!cityName||!country)return[];
  const seeds=getSeedSpotsForCity(country,cityName);
  if(!seeds.length)return[];
  const freq={};
  seeds.forEach(s=>(s.tags||[]).forEach(t=>{if(t?.length>1)freq[t]=(freq[t]||0)+1;}));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([tag])=>'#'+tag);
}

const RECENT_KEY='kodo_recent_searches';
function getRecent(){try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');}catch{return[];}}
function addRecent(q){const s=getRecent().filter(x=>x.query!==q);s.unshift({query:q,date:new Date().toISOString()});localStorage.setItem(RECENT_KEY,JSON.stringify(s.slice(0,8)));}
function clearRecent(){localStorage.removeItem(RECENT_KEY);}

function LeafletMap({lat,lng,onMove}){
  const mapRef=useRef(null);const markerRef=useRef(null);const containerRef=useRef(null);
  useEffect(()=>{
    let cancelled=false;
    loadLeaflet().then(L=>{
      if(cancelled||!containerRef.current||mapRef.current)return;
      const map=L.map(containerRef.current,{zoomControl:true,attributionControl:false}).setView([lat,lng],15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const icon=L.divIcon({html:'<div style="width:24px;height:24px;background:#c2410c;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',iconSize:[24,24],iconAnchor:[12,24],className:''});
      const marker=L.marker([lat,lng],{icon,draggable:true}).addTo(map);
      marker.on('dragend',async e=>{const{lat:la,lng:ln}=e.target.getLatLng();const addr=await reverseGeocode(la,ln);onMove(la,ln,addr);});
      map.on('click',async e=>{const{lat:la,lng:ln}=e.latlng;marker.setLatLng([la,ln]);const addr=await reverseGeocode(la,ln);onMove(la,ln,addr);});
      mapRef.current=map;markerRef.current=marker;setTimeout(()=>map.invalidateSize(),100);
    }).catch(()=>{});
    return()=>{cancelled=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[]);
  useEffect(()=>{if(markerRef.current&&mapRef.current){markerRef.current.setLatLng([lat,lng]);mapRef.current.setView([lat,lng],15);}},[lat,lng]);
  return <div ref={containerRef} style={{height:'160px',width:'100%',borderRadius:'12px',overflow:'hidden',zIndex:0}}/>;
}

function HeartIcon({filled,size=16}){
  return filled
    ?<svg width={size} height={size} viewBox="0 0 24 24" fill="#c2410c" stroke="#c2410c" strokeWidth="0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    :<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function ChatIcon({size=15}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;}
function SendIcon({size=15}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;}

function useLikeSimple(spotId,userId){
  const isReal=spotId&&!String(spotId).startsWith('seed_')&&!String(spotId).startsWith('seed-')&&!String(spotId).startsWith('ms-');
  const queryClient=useQueryClient();
  const{data:likes=[]}=useQuery({queryKey:['likes','spot',spotId],queryFn:()=>base44.entities.Like.filter({target_id:spotId,target_type:'spot'}),enabled:!!spotId&&!!userId&&isReal,staleTime:30000});
  const likeRecord=likes.find(l=>l.user_id===userId);
  const isLiked=!!likeRecord;const count=isReal?likes.length:0;
  const mutation=useMutation({mutationFn:async()=>{if(isLiked&&likeRecord)await base44.entities.Like.delete(likeRecord.id);else await base44.entities.Like.create({user_id:userId,target_id:spotId,target_type:'spot'});},onSuccess:()=>queryClient.invalidateQueries({queryKey:['likes','spot',spotId]})});
  return{isLiked,count,toggle:()=>{if(isReal&&userId)mutation.mutate();}};
}

function useCommentCount(spotId){
  const isReal=spotId&&!String(spotId).startsWith('seed_')&&!String(spotId).startsWith('seed-')&&!String(spotId).startsWith('ms-');
  const{data:comments=[]}=useQuery({queryKey:['spotComments',spotId],queryFn:()=>base44.entities.SpotComment.filter({spot_id:spotId}),enabled:isReal&&!!spotId,staleTime:60000});
  return isReal?comments.length:0;
}

function CommentsSheet({spot,userId,userProfile,onClose}){
  const queryClient=useQueryClient();
  const[text,setText]=useState('');
  const[editingId,setEditingId]=useState(null);
  const[editText,setEditText]=useState('');
  const[confirmDeleteId,setConfirmDeleteId]=useState(null);
  const listRef=useRef(null);
  const tc=TYPE_CONFIG[spot?.type]||TYPE_CONFIG.custom;
  const isRealSpot=spot?.id&&!String(spot.id).startsWith('seed_')&&!String(spot.id).startsWith('seed-');

  const{data:comments=[]}=useQuery({queryKey:['spotComments',spot?.id],queryFn:()=>base44.entities.SpotComment.filter({spot_id:spot.id}),enabled:!!spot?.id&&isRealSpot,staleTime:15000});
  const{isLiked,count:likeCount,toggle:toggleLike}=useLikeSimple(spot?.id,userId);

  const createMutation=useMutation({mutationFn:()=>base44.entities.SpotComment.create({spot_id:spot.id,user_id:userId,user_display_name:userProfile?.display_name||'',username:userProfile?.username||'',user_avatar:userProfile?.avatar_url||'',text:text.trim()}),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['spotComments',spot.id]});setText('');setTimeout(()=>{if(listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight;},120);}});
  const editMutation=useMutation({mutationFn:({id,text})=>base44.entities.SpotComment.update(id,{text}),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['spotComments',spot.id]});setEditingId(null);setEditText('');}});
  const deleteMutation=useMutation({mutationFn:id=>base44.entities.SpotComment.delete(id),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['spotComments',spot.id]});setConfirmDeleteId(null);}});

  function Av({name,size=28}){return<div style={{width:size,height:size,borderRadius:'50%',background:'#fff3e8',color:'#c2410c',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:500,flexShrink:0}}>{(name||'?')[0].toUpperCase()}</div>;}

  if(!isRealSpot)return(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl" onClick={e=>e.stopPropagation()}>
        <div className="w-9 h-1 bg-border rounded-full mx-auto mt-4 mb-3"/>
        <div className="px-5 pb-8 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm font-medium text-foreground mb-2">Guarda este spot primero</p>
          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">Los comentarios están disponibles una vez guardas el spot en tu viaje.</p>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white w-full">Entendido</Button>
        </div>
      </div>
    </div>
  );

  return(
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[85vh]" onClick={e=>e.stopPropagation()}>
          <div className="flex-shrink-0 px-5 pt-4">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4"/>
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${tc.color}`}>{tc.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
                <p className="text-xs text-muted-foreground">{tc.label}{spot.city_name?' · '+spot.city_name:''}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-4 px-5 py-2.5 border-b border-border">
            <button onClick={toggleLike} className="flex items-center gap-1.5 transition-colors">
              <HeartIcon filled={isLiked} size={17}/>
              <span className={`text-sm ${isLiked?'text-primary':'text-muted-foreground'}`}>{likeCount>0?likeCount:'Me gusta'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ChatIcon size={14}/><span className="text-sm">{comments.length} {comments.length===1?'comentario':'comentarios'}</span>
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {comments.length===0&&(
              <div className="text-center py-12">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-sm font-medium text-foreground mb-1">Sin comentarios todavía</p>
                <p className="text-xs text-muted-foreground">¡Sé el primero en compartir un consejo!</p>
              </div>
            )}
            {comments.map(c=>{
              const isMine=c.user_id===userId;const isEditing=editingId===c.id;
              const diff=c.created_date?Math.floor((Date.now()-new Date(c.created_date))/86400000):null;
              const dateLabel=diff===null?'':diff===0?'Hoy':diff===1?'Ayer':`Hace ${diff}d`;
              return(
                <div key={c.id} className={`flex gap-2.5 ${isMine?'flex-row-reverse':''}`}>
                  <Av name={c.user_display_name||c.username}/>
                  <div className={`flex-1 min-w-0 flex flex-col ${isMine?'items-end':'items-start'}`}>
                    <div className={`px-3 py-2 rounded-2xl max-w-[85%] ${isMine?'bg-orange-50 rounded-tr-none':'bg-secondary rounded-tl-none'}`}>
                      <p className={`text-xs font-medium mb-1 ${isMine?'text-primary text-right':'text-foreground'}`}>{isMine?'Tú':'@'+(c.username||c.user_display_name||'?')}</p>
                      {isEditing?<textarea value={editText} onChange={e=>setEditText(e.target.value)} className="text-sm text-foreground bg-transparent resize-none outline-none w-full min-h-[36px]" autoFocus/>:<p className="text-sm text-foreground leading-relaxed">{c.text}</p>}
                    </div>
                    <div className={`flex items-center gap-3 mt-1 px-1 ${isMine?'flex-row-reverse':''}`}>
                      <span className="text-xs text-muted-foreground/60">{dateLabel}</span>
                      {isMine&&!isEditing&&<><button onClick={()=>{setEditingId(c.id);setEditText(c.text||'');}} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Editar</button><button onClick={()=>setConfirmDeleteId(c.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Eliminar</button></>}
                      {isMine&&isEditing&&<><button onClick={()=>editMutation.mutate({id:c.id,text:editText})} disabled={!editText.trim()||editMutation.isPending} className="text-xs text-primary font-medium disabled:opacity-40">{editMutation.isPending?'Guardando...':'Guardar'}</button><button onClick={()=>{setEditingId(null);setEditText('');}} className="text-xs text-muted-foreground">Cancelar</button></>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex-shrink-0 flex gap-2.5 items-end px-5 py-3 border-t border-border bg-white">
            <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(text.trim())createMutation.mutate();}}} placeholder="Escribe un comentario..." className="flex-1 text-sm border border-border rounded-2xl px-3 py-2.5 resize-none outline-none focus:border-primary bg-secondary min-h-[40px] max-h-24" rows={1}/>
            <button onClick={()=>{if(text.trim())createMutation.mutate();}} disabled={!text.trim()||createMutation.isPending} className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-opacity">
              {createMutation.isPending?<div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>:<SendIcon size={14}/>}
            </button>
          </div>
        </div>
      </div>
      {confirmDeleteId&&(
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5"/>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">¿Eliminar comentario?</p>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">Tu comentario se borrará permanentemente.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={()=>setConfirmDeleteId(null)} className="flex-1">Cancelar</Button>
              <Button onClick={()=>deleteMutation.mutate(confirmDeleteId)} disabled={deleteMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0">{deleteMutation.isPending?'Eliminando...':'Eliminar'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlaceResultCard({place,onSave,saving,isDuplicate,userId,onComment}){
  const tc=TYPE_CONFIG[place.type]||TYPE_CONFIG.custom;
  const{isLiked,count:likeCount}=useLikeSimple(place.id,userId);
  const commentCount=useCommentCount(place.id);
  return(
    <div className={`bg-white rounded-xl border flex overflow-hidden transition-all ${isDuplicate?'border-amber-200':'border-border hover:shadow-sm'}`}>
      <div className={`w-12 flex items-center justify-center flex-shrink-0 ${tc.color.split(' ')[0]} ${isDuplicate?'opacity-50':''}`}><span className="text-xl">{tc.emoji}</span></div>
      <div className={`flex-1 min-w-0 p-3 ${isDuplicate?'opacity-60':''}`}>
        <p className="font-medium text-sm text-foreground leading-tight">{place.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tc.label}{place.address?' · '+place.address:''}</p>
        {(likeCount>0||commentCount>0)&&(
          <div className="flex items-center gap-3 mt-1.5">
            {likeCount>0&&<span className="flex items-center gap-1 text-xs text-muted-foreground"><HeartIcon filled={isLiked} size={11}/>{likeCount}</span>}
            {commentCount>0&&<button onClick={()=>onComment&&onComment(place)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><ChatIcon size={11}/>{commentCount} {commentCount===1?'consejo':'consejos'}</button>}
          </div>
        )}
        {isDuplicate?<p className="text-xs text-amber-600 mt-1.5 font-medium">Ya en tu lista</p>:<Button size="sm" onClick={()=>onSave(place)} disabled={saving} className="mt-2 h-7 text-xs bg-primary hover:bg-primary/90 text-white px-3"><Plus className="w-3 h-3 mr-1"/>{saving?'Guardando...':'Añadir'}</Button>}
      </div>
    </div>
  );
}

function CommunitySpotCard({spot,onSave,saving,alreadySaved,userId,onComment}){
  const tc=TYPE_CONFIG[spot.type]||TYPE_CONFIG.custom;
  const{isLiked,count:likeCount,toggle:toggleLike}=useLikeSimple(spot.id,userId);
  const commentCount=useCommentCount(spot.id);
  return(
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${tc.color}`}>{tc.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground leading-tight">{spot.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tc.label}{spot.city_name?' · '+spot.city_name:''}</p>
            {spot.notes&&<p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{spot.notes}</p>}
            {spot.tags?.length>0&&<div className="flex flex-wrap gap-1 mt-2">{spot.tags.slice(0,4).map(t=><span key={t} className="text-xs bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-100">#{t}</span>)}</div>}
            {spot.creator_username&&<p className="text-xs text-muted-foreground/60 mt-1.5">Por @{spot.creator_username}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-stretch border-t border-border">
        <button onClick={e=>{e.stopPropagation();toggleLike();}} className="flex items-center justify-center gap-1.5 flex-1 py-2.5 hover:bg-secondary/30 transition-colors">
          <HeartIcon filled={isLiked} size={16}/><span className={`text-xs ${isLiked?'text-primary':'text-muted-foreground'}`}>{likeCount>0?likeCount:''}</span>
        </button>
        <div className="w-px bg-border"/>
        <button onClick={e=>{e.stopPropagation();onComment(spot);}} className="flex items-center justify-center gap-1.5 flex-1 py-2.5 text-muted-foreground hover:bg-secondary/30 transition-colors">
          <ChatIcon size={14}/><span className="text-xs">{commentCount>0?commentCount:''}</span>
        </button>
        <div className="w-px bg-border"/>
        {alreadySaved
          ?<div className="flex items-center justify-center gap-1.5 flex-1 py-2.5 text-green-600 font-medium"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span className="text-xs">Guardado</span></div>
          :<button onClick={e=>{e.stopPropagation();onSave(spot);}} disabled={saving} className="flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium text-primary hover:bg-secondary/30 transition-colors disabled:opacity-50"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span className="text-xs">{saving?'...':'Guardar'}</span></button>
        }
      </div>
    </div>
  );
}

function MySpotRow({spot,onTap,onComment,userId}){
  const tc=TYPE_CONFIG[spot.type]||TYPE_CONFIG.custom;
  const{isLiked,count:likeCount,toggle:toggleLike}=useLikeSimple(spot.id,userId);
  const commentCount=useCommentCount(spot.id);
  return(
    <div className="border-b border-border last:border-0">
      <button onClick={()=>onTap(spot)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${tc.color}`}>{tc.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tc.label}{spot.city_name?' · '+spot.city_name:''}</p>
          {spot.assigned_date&&<p className="text-xs text-primary mt-0.5">📅 {spot.assigned_date}{spot.assigned_time?' · '+spot.assigned_time:''}</p>}
        </div>
        <div className="flex-shrink-0">
          {spot.visited?<span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 font-medium">Visitado ✓</span>:spot.assigned_date?<span className="text-xs bg-orange-50 text-primary px-2.5 py-1 rounded-full border border-orange-100">Asignado</span>:<span className="text-xs text-muted-foreground/50">Sin día →</span>}
        </div>
      </button>
      <div className="flex items-center gap-4 px-4 pb-3">
        <button onClick={e=>{e.stopPropagation();toggleLike();}} className="flex items-center gap-1.5 transition-colors">
          <HeartIcon filled={isLiked} size={13}/><span className={`text-xs ${isLiked?'text-primary':'text-muted-foreground'}`}>{likeCount>0?likeCount:'Me gusta'}</span>
        </button>
        <button onClick={e=>{e.stopPropagation();onComment(spot);}} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChatIcon size={12}/>{commentCount>0?commentCount+' comentarios':'Comentar'}
        </button>
      </div>
    </div>
  );
}

function SpotDetailSheet({spot,open,onClose,onDelete,tripId,tripCities,userId,onComment}){
  const queryClient=useQueryClient();
  const[notes,setNotes]=useState('');const[assignedDate,setAssignedDate]=useState('');const[assignedTime,setAssignedTime]=useState('');const[saving,setSaving]=useState(false);const[confirmDelete,setConfirmDelete]=useState(false);
  const{isLiked,count:likeCount,toggle:toggleLike}=useLikeSimple(spot?.id,userId);
  const tripDayOptions=useMemo(()=>{
    const days=[];const sorted=[...(tripCities||[])].sort((a,b)=>(a.start_date||'').localeCompare(b.start_date||''));
    sorted.forEach(c=>{if(c.start_date&&c.end_date){let d=new Date(c.start_date);const end=new Date(c.end_date);while(d<=end){days.push({date:d.toISOString().slice(0,10),city:c.name,cityId:c.id});d.setDate(d.getDate()+1);}}});
    return days;
  },[tripCities]);
  useEffect(()=>{if(spot){setNotes(spot.notes||'');setAssignedDate(spot.assigned_date||'');setAssignedTime(spot.assigned_time||'');}},[spot?.id]);
  if(!open||!spot)return null;
  const tc=TYPE_CONFIG[spot.type]||TYPE_CONFIG.custom;
  const handleSave=async()=>{
    setSaving(true);
    try{
      const resolvedCityId=assignedDate?cityIdForDate(assignedDate,tripCities):null;
      const resolvedCityName=assignedDate?cityNameForDate(assignedDate,tripCities):null;
      await base44.entities.Spot.update(spot.id,{notes,assigned_date:assignedDate||null,assigned_time:assignedTime||null,...(resolvedCityId&&{city_id:resolvedCityId}),...(resolvedCityName&&{city_name:resolvedCityName})});
      queryClient.invalidateQueries({queryKey:['spots',tripId]});onClose();
    }catch(e){alert('Error: '+e.message);}finally{setSaving(false);}
  };
  const mapsUrl=spot.lat&&spot.lng?`https://www.google.com/maps?q=${spot.lat},${spot.lng}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title+(spot.city_name?' '+spot.city_name:''))}`;
  return(
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[88vh]" onClick={e=>e.stopPropagation()}>
          <div className="flex-shrink-0 pt-4">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-3"/>
            <div className="flex items-center gap-3 px-5 pb-4 border-b border-border">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${tc.color}`}>{tc.emoji}</div>
              <div className="flex-1 min-w-0"><p className="font-medium text-foreground text-sm leading-tight">{spot.title}</p><p className="text-xs text-muted-foreground">{tc.label}{spot.city_name?' · '+spot.city_name:''}</p></div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Mi nota</p>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Reservar para las 20h..." className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Día</p>
                {tripDayOptions.length>0?<select value={assignedDate} onChange={e=>setAssignedDate(e.target.value)} className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"><option value="">Sin asignar</option>{tripDayOptions.map(d=><option key={d.date} value={d.date}>{d.date} · {d.city}</option>)}</select>:<input type="date" value={assignedDate} onChange={e=>setAssignedDate(e.target.value)} className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"/>}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Hora</p>
                <input type="time" value={assignedTime} onChange={e=>setAssignedTime(e.target.value)} className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"/>
              </div>
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"><Navigation className="w-4 h-4"/>Ver en Google Maps</a>
          </div>
          <div className="flex-shrink-0 flex border-t border-border">
            <button onClick={toggleLike} className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors"><HeartIcon filled={isLiked} size={16}/><span className={`text-sm ${isLiked?'text-primary':'text-muted-foreground'}`}>{likeCount>0?likeCount:'Me gusta'}</span></button>
            <div className="w-px bg-border"/>
            <button onClick={()=>{onClose();onComment(spot);}} className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-secondary/30 transition-colors text-muted-foreground"><ChatIcon size={15}/><span className="text-sm">Comentar</span></button>
          </div>
          <div className="flex-shrink-0 border-t border-border"><button onClick={()=>setConfirmDelete(true)} className="w-full text-xs text-red-400 hover:text-red-600 transition-colors py-2 text-center">Eliminar spot</button></div>
          <div className="flex-shrink-0 flex gap-3 px-5 pb-6 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">{saving?'Guardando...':'Guardar cambios'}</Button>
          </div>
        </div>
      </div>
      {confirmDelete&&(
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5"/>
            <p className="text-sm font-medium text-foreground mb-1">¿Eliminar "{spot.title}"?</p>
            <p className="text-xs text-muted-foreground mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={()=>setConfirmDelete(false)} className="flex-1">Cancelar</Button>
              <Button onClick={()=>{onDelete(spot.id);setConfirmDelete(false);onClose();}} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0">Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AssignDateModal({spot,tripCities=[],onAssign,onSkip,onUndo}){
  const[selectedDate,setSelectedDate]=useState('');
  const tripDayOptions=useMemo(()=>{
    const days=[];const sorted=[...tripCities].sort((a,b)=>(a.start_date||'').localeCompare(b.start_date||''));
    sorted.forEach(c=>{if(c.start_date&&c.end_date){let d=new Date(c.start_date);const end=new Date(c.end_date);while(d<=end){days.push({date:d.toISOString().slice(0,10),city:c.name});d.setDate(d.getDate()+1);}}});
    return days;
  },[tripCities]);
  return(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-t-3xl">
        <div className="p-5 pb-8">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5"/>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">¡Guardado!</p><p className="text-xs text-muted-foreground truncate">{spot?.title}</p></div>
            <button onClick={onSkip} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0"><X className="w-4 h-4"/></button>
          </div>
          <p className="text-sm font-medium text-foreground mb-2">¿Cuándo quieres visitar este spot?</p>
          {tripDayOptions.length>0?<select value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary mb-4"><option value="">Sin asignar</option>{tripDayOptions.map(d=><option key={d.date} value={d.date}>{d.date} · {d.city}</option>)}</select>:<input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full h-11 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary mb-4"/>}
          <div className="flex gap-3">
            <button onClick={onUndo} className="flex-1 py-3 border border-border rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors">Deshacer</button>
            <button onClick={()=>selectedDate?onAssign(selectedDate):onSkip()} className="flex-[2] py-3 bg-primary text-white rounded-xl text-sm font-medium">{selectedDate?'Confirmar':'Ahora no'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateSpotSheet({open,onClose,onSave,saving,spots,city,country}){
  const[title,setTitle]=useState('');const[type,setType]=useState('food');const[notes,setNotes]=useState('');const[address,setAddress]=useState('');const[isPublic,setIsPublic]=useState(true);const[pinLat,setPinLat]=useState(null);const[pinLng,setPinLng]=useState(null);const[showMap,setShowMap]=useState(false);const[locating,setLocating]=useState(false);
  const duplicate=useMemo(()=>{if(!title.trim()||title.length<3)return null;return spots.find(s=>s.title?.toLowerCase().trim()===title.toLowerCase().trim())||null;},[title,spots]);
  const handleGPS=()=>{setLocating(true);navigator.geolocation.getCurrentPosition(async pos=>{const la=pos.coords.latitude,ln=pos.coords.longitude;setPinLat(la);setPinLng(ln);const addr=await reverseGeocode(la,ln);if(addr)setAddress(addr);setShowMap(true);setLocating(false);},()=>setLocating(false),{timeout:10000,enableHighAccuracy:true});};
  const reset=()=>{setTitle('');setType('food');setNotes('');setAddress('');setPinLat(null);setPinLng(null);setShowMap(false);setIsPublic(true);};
  const handleSave=()=>{if(!title.trim()||duplicate)return;onSave({title,type,notes,address,lat:pinLat,lng:pinLng,visibility:isPublic?'public':'trip_members'});reset();};
  if(!open)return null;
  return(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[92vh]" onClick={e=>e.stopPropagation()}>
        <div className="flex-shrink-0 px-5 pt-4 pb-4 border-b border-border">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4"/>
          <div className="flex items-center justify-between"><p className="font-medium text-foreground text-base">Crear spot</p><button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground"/></button></div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ubicación</p>
            <div className="rounded-xl overflow-hidden border border-border mb-2" style={{height:'160px',background:'#f0f4f8',position:'relative'}}>
              {showMap&&pinLat?<LeafletMap lat={pinLat} lng={pinLng} onMove={(la,ln,addr)=>{setPinLat(la);setPinLng(ln);if(addr)setAddress(addr);}}/>:<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer" onClick={()=>{if(!pinLat)handleGPS();else setShowMap(true);}}><MapPin className="w-7 h-7 text-muted-foreground/40"/><p className="text-xs">Toca para añadir ubicación</p></div>}
            </div>
            <button onClick={()=>{if(!pinLat)handleGPS();else setShowMap(true);}} className="w-full flex items-center justify-between px-4 py-2.5 border border-border rounded-xl text-sm text-primary font-medium hover:bg-orange-50 transition-colors mb-2"><span className="flex items-center gap-2"><Navigation className="w-4 h-4"/>{locating?'Localizando...':'Usar mi ubicación'}</span><ArrowRight className="w-4 h-4"/></button>
            <Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="o escribe la dirección..." className="h-9 text-sm"/>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nombre *</p>
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="ej. Ichiran Ramen Shinjuku" className="h-10 text-sm" autoFocus/>
            {duplicate&&<div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2"><span className="text-base shrink-0">⚠️</span><div><p className="text-xs font-medium text-amber-800">Ya existe este spot en {city}</p><p className="text-xs text-amber-700 mt-0.5">"{duplicate.title}" ya está en tu lista.</p></div></div>}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">{Object.entries(TYPE_CONFIG).filter(([k])=>k!=='transport').map(([val,tc])=><button key={val} onClick={()=>setType(val)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${type===val?'bg-primary text-white border-primary':'bg-white text-muted-foreground border-border hover:border-primary/40'}`}>{tc.emoji} {tc.label}</button>)}</div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Nota</p>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="¿Algo que recordar sobre este lugar?" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 h-20 resize-none outline-none focus:border-primary bg-secondary"/>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibilidad</p>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={()=>setIsPublic(true)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isPublic?'bg-primary text-white':'bg-white text-muted-foreground hover:bg-secondary/50'}`}>🌍 Kōdo Community</button>
              <button onClick={()=>setIsPublic(false)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isPublic?'bg-primary text-white':'bg-white text-muted-foreground hover:bg-secondary/50'}`}>🔒 Solo mi viaje</button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 px-1">{isPublic?'Otros viajeros podrán descubrirlo y guardarlo':'Solo tú y tu grupo lo verán'}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-border bg-white">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim()||saving||!!duplicate} className="flex-1 bg-primary hover:bg-primary/90 text-white">{saving?'Guardando...':'Guardar spot'}</Button>
        </div>
      </div>
    </div>
  );
}

function Toast({spot,city,visible,onUndo}){
  if(!visible||!spot)return null;
  return(
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-auto">
      <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <span className="text-lg">✅</span>
        <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium">Guardado{city?' en '+city:''}</p><p className="text-white/60 text-xs truncate">{spot.title}</p></div>
        <button onClick={onUndo} className="text-amber-400 text-xs font-medium flex-shrink-0">Deshacer</button>
      </div>
    </div>
  );
}

export default function Restaurants(){
  const urlParams=new URLSearchParams(window.location.search);
  const tripId=urlParams.get('trip_id');
  const{user}=useAuth();
  const queryClient=useQueryClient();
  const{trip,activeCity,cities:tripCities}=useTripContext(tripId);
  const city=activeCity?.name||trip?.destination||'';
  const country=activeCity?.country||trip?.country||'';
  const cityId=activeCity?.id||null;

  useEffect(()=>{window.scrollTo(0,0);},[]);

  const[tab,setTab]=useState('buscar');
  const[searchQuery,setSearchQuery]=useState('');
  const[recentSearches,setRecentSearches]=useState(getRecent);
  const[osmResults,setOsmResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const[nearbyResults,setNearbyResults]=useState([]);
  const[loadingNearby,setLoadingNearby]=useState(false);
  const[showCreate,setShowCreate]=useState(false);
  const[savingId,setSavingId]=useState(null);
  const[selectedCity,setSelectedCity]=useState('');
  const[stateFilter,setStateFilter]=useState('all');
  const[communityFilter,setCommunityFilter]=useState('all');
  const[assignDateSpot,setAssignDateSpot]=useState(null);
  const[toast,setToast]=useState({visible:false,spot:null,city:''});
  const[lastSavedId,setLastSavedId]=useState(null);
  const[selectedSpot,setSelectedSpot]=useState(null);
  const[commentSpot,setCommentSpot]=useState(null);
  const[mySpotSearch,setMySpotSearch]=useState('');
  const searchTimer=useRef(null);const toastTimer=useRef(null);

  useEffect(()=>{if(activeCity?.name&&!selectedCity)setSelectedCity(activeCity.name);},[activeCity?.name]);

  const{data:spots=[]}=useQuery({queryKey:['spots',tripId],queryFn:()=>base44.entities.Spot.filter({trip_id:tripId}),enabled:!!tripId,staleTime:30000});
  const{data:myProfile}=useQuery({queryKey:['myProfile',user?.id],queryFn:async()=>{const r=await base44.entities.UserProfile.filter({user_id:user.id});return r[0]||null;},enabled:!!user?.id,staleTime:60000});
  const{data:publicSpots=[]}=useQuery({queryKey:['publicSpots'],queryFn:()=>base44.entities.Spot.filter({visibility:'public'}),staleTime:5*60*1000});

  const createMutation=useMutation({mutationFn:d=>base44.entities.Spot.create(d),onSuccess:()=>queryClient.invalidateQueries({queryKey:['spots',tripId]})});
  const updateMutation=useMutation({mutationFn:({id,data})=>base44.entities.Spot.update(id,data),onSuccess:()=>queryClient.invalidateQueries({queryKey:['spots',tripId]})});
  const deleteMutation=useMutation({mutationFn:id=>base44.entities.Spot.delete(id),onSuccess:()=>queryClient.invalidateQueries({queryKey:['spots',tripId]})});

  useEffect(()=>{
    if(!searchQuery.trim()||searchQuery.length<2){setOsmResults([]);return;}
    clearTimeout(searchTimer.current);
    searchTimer.current=setTimeout(async()=>{
      setSearching(true);addRecent(searchQuery.trim());setRecentSearches(getRecent());
      try{setOsmResults(await searchPlaces(searchQuery,selectedCity||city,country));}catch{setOsmResults([]);}finally{setSearching(false);}
    },700);
    return()=>clearTimeout(searchTimer.current);
  },[searchQuery,selectedCity,city,country]);

  const handleNearby=async()=>{
    setLoadingNearby(true);setNearbyResults([]);
    navigator.geolocation.getCurrentPosition(async pos=>{try{setNearbyResults(await nearbyPlaces(pos.coords.latitude,pos.coords.longitude));}catch{}finally{setLoadingNearby(false);}},()=>setLoadingNearby(false),{timeout:10000,enableHighAccuracy:true});
  };

  const baseData=(extra)=>({trip_id:tripId||undefined,city_id:cityId||undefined,city_name:selectedCity||city,country,visibility:'trip_members',visited:false,created_by:user?.email,created_by_user_id:user?.id,creator_username:myProfile?.username||'',...extra});

  const showToastFn=(spot,cityName)=>{
    setToast({visible:true,spot,city:cityName||selectedCity||city});
    clearTimeout(toastTimer.current);
    toastTimer.current=setTimeout(()=>setToast({visible:false,spot:null,city:''}),3200);
  };

  const saveOsmPlace=async(place)=>{
    if(!tripId)return;if(spots.some(s=>s.title?.toLowerCase().trim()===place.name?.toLowerCase().trim()))return;
    setSavingId(place.id);
    try{const created=await createMutation.mutateAsync(baseData({title:place.name,type:place.type||'sight',address:place.address||'',lat:place.lat,lng:place.lng}));setLastSavedId(created?.id);setOsmResults([]);setNearbyResults([]);setSearchQuery('');showToastFn({title:place.name},selectedCity||city);if(created?.id)setAssignDateSpot(created);}catch(e){alert('Error: '+e.message);}finally{setSavingId(null);}
  };

  const saveManualSpot=async(form)=>{
    if(!tripId)return;setSavingId('manual');
    try{const created=await createMutation.mutateAsync(baseData({title:form.title,type:form.type,notes:form.notes,address:form.address,lat:form.lat,lng:form.lng,visibility:form.visibility}));setLastSavedId(created?.id);setShowCreate(false);showToastFn({title:form.title},selectedCity||city);if(created?.id)setAssignDateSpot(created);}finally{setSavingId(null);}
  };

  const saveCommunitySpot=async(spot)=>{
    if(!tripId)return;if(spots.some(s=>s.title?.toLowerCase().trim()===spot.title?.toLowerCase().trim()))return;
    const key=spot.id||spot.title;setSavingId(key);
    try{const created=await createMutation.mutateAsync(baseData({title:spot.title,type:spot.type,address:spot.address||'',lat:spot.lat,lng:spot.lng,notes:spot.notes||''}));setLastSavedId(created?.id);showToastFn({title:spot.title},selectedCity||city);if(created?.id)setAssignDateSpot(created);}finally{setSavingId(null);}
  };

  const undoSave=async()=>{if(lastSavedId){await deleteMutation.mutateAsync(lastSavedId);setLastSavedId(null);}setToast({visible:false,spot:null,city:''});};

  const seedSpots=useMemo(()=>{if(!country)return[];return getSeedSpotsForCity(country,selectedCity||city);},[country,selectedCity,city]);
  const hashtags=useMemo(()=>buildCityHashtags(selectedCity||city,country),[selectedCity,city,country]);
  const seedSearchResults=useMemo(()=>{
    if(!searchQuery.trim()||searchQuery.length<2)return[];
    const q=searchQuery.toLowerCase().replace('#','');
    return seedSpots.filter(s=>s.title?.toLowerCase().includes(q)||s.notes?.toLowerCase().includes(q)||s.tags?.some(t=>t.toLowerCase().includes(q))).slice(0,5);
  },[searchQuery,seedSpots]);

  const communitySpots=useMemo(()=>{
    const myTitles=new Set(spots.map(s=>s.title?.toLowerCase()));
    const targetCity=(selectedCity||city).toLowerCase();
    const fromUsers=publicSpots.filter(s=>!targetCity||s.city_name?.toLowerCase()===targetCity);
    const fromSeed=seedSpots.filter(s=>!myTitles.has(s.title?.toLowerCase())).map(s=>({...s,_source:'seed',id:`seed_${s.title}`}));
    const all=[...fromUsers.map(s=>({...s,_source:'user'})),...fromSeed];
    return communityFilter==='all'?all:all.filter(s=>s.type===communityFilter);
  },[publicSpots,seedSpots,spots,communityFilter,selectedCity,city]);

  const filteredSpots=useMemo(()=>{
    let r=spots.filter(s=>{if(stateFilter==='assigned')return!!s.assigned_date;if(stateFilter==='unassigned')return!s.assigned_date&&!s.visited;if(stateFilter==='visited')return!!s.visited;return true;});
    if(mySpotSearch.trim()){const q=mySpotSearch.toLowerCase();r=r.filter(s=>s.title?.toLowerCase().includes(q)||s.notes?.toLowerCase().includes(q)||s.city_name?.toLowerCase().includes(q));}
    return r;
  },[spots,stateFilter,mySpotSearch]);

  const isSearchActive=searchQuery.length>=2;

  return(
    <div className="bg-background min-h-screen">
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home')+'?trip_id='+tripId}><button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"><ArrowRight className="w-4 h-4 rotate-180"/>Inicio</button></Link>
            <button onClick={()=>setShowCreate(true)} className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors"><Plus className="w-4 h-4"/>Crear spot</button>
          </div>
          <h1 className="text-2xl font-medium text-foreground mb-4">Spots</h1>
          <div className="flex border-b border-border">
            {[['buscar','🔍','Buscar'],['mis','📍','Mis spots'],['comunidad','🌍','Comunidad']].map(([k,emoji,label])=>(
              <button key={k} onClick={()=>setTab(k)} className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex flex-col items-center gap-0.5 ${tab===k?'text-primary border-primary':'text-muted-foreground border-transparent hover:text-foreground'}`}>
                <span className="text-base">{emoji}</span><span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        {tab==='buscar'&&(
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Buscar lugares, hashtags..." className="w-full pl-9 pr-24 py-2.5 rounded-xl text-sm outline-none bg-white border border-border focus:border-primary text-foreground"/>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {searchQuery?<button onClick={()=>{setSearchQuery('');setOsmResults([]);}} className="text-muted-foreground p-1"><X className="w-4 h-4"/></button>:<button onClick={handleNearby} className="flex items-center gap-1 text-xs bg-orange-50 text-primary px-2 py-1 rounded-lg font-medium"><Navigation className="w-3 h-3"/>Cerca</button>}
              </div>
            </div>
            {!isSearchActive&&tripCities.length>0&&(
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ciudades del viaje</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {tripCities.map(c=><button key={c.id} onClick={()=>setSelectedCity(c.name)} className={`text-sm px-4 py-1.5 rounded-full border font-medium flex-shrink-0 transition-colors ${selectedCity===c.name?'bg-primary text-white border-primary':'bg-white border-border text-foreground hover:border-primary/40'}`}>{c.name}</button>)}
                </div>
              </div>
            )}
            {!isSearchActive&&hashtags.length>0&&(
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Explorar en {selectedCity||city}</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map(tag=><button key={tag} onClick={()=>setSearchQuery(tag.replace('#',''))} className="text-sm px-3 py-1.5 rounded-full border border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">{tag}</button>)}
                </div>
              </div>
            )}
            {!isSearchActive&&recentSearches.length>0&&(
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Búsquedas recientes</p>
                  <button onClick={()=>{clearRecent();setRecentSearches([]);}} className="text-xs text-muted-foreground hover:text-foreground">Borrar</button>
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((s,i)=>{const diff=Math.floor((Date.now()-new Date(s.date))/86400000);return(<button key={i} onClick={()=>setSearchQuery(s.query)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors text-left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground flex-shrink-0"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg><span className="flex-1 text-sm text-foreground truncate">{s.query}</span><span className="text-xs text-muted-foreground">{diff===0?'Hoy':diff===1?'Ayer':`Hace ${diff}d`}</span></button>);})}
                </div>
              </div>
            )}
            {isSearchActive&&(
              <div className="space-y-3">
                {seedSearchResults.length>0&&<><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lugares conocidos</p>{seedSearchResults.map((p,i)=>{const isDup=spots.some(s=>s.title?.toLowerCase().trim()===p.title?.toLowerCase().trim());return<PlaceResultCard key={`seed-${i}`} place={{id:`seed-${i}`,name:p.title,type:p.type,address:p.address||''}} onSave={saveOsmPlace} saving={savingId===`seed-${i}`} isDuplicate={isDup} userId={user?.id} onComment={setCommentSpot}/>;})}{osmResults.length>0&&<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Más resultados</p>}</>}
                {searching&&<p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>}
                {!searching&&osmResults.length>0&&<>{osmResults.map(p=>{const isDup=spots.some(s=>s.title?.toLowerCase().trim()===p.name?.toLowerCase().trim());return<PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id} isDuplicate={isDup} userId={user?.id} onComment={setCommentSpot}/>;})}<button onClick={()=>setShowCreate(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"><Plus className="w-4 h-4"/>Crear "{searchQuery}" manualmente</button></>}
                {!searching&&!osmResults.length&&!seedSearchResults.length&&<div className="text-center py-8"><p className="text-sm text-muted-foreground mb-3">Sin resultados para "{searchQuery}"</p><button onClick={()=>setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl font-medium"><Plus className="w-4 h-4"/>Crear manualmente</button></div>}
              </div>
            )}
            {nearbyResults.length>0&&<div className="space-y-2"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{nearbyResults.length} lugares cerca</p>{nearbyResults.map(p=>{const isDup=spots.some(s=>s.title?.toLowerCase().trim()===p.name?.toLowerCase().trim());return<PlaceResultCard key={p.id} place={p} onSave={saveOsmPlace} saving={savingId===p.id} isDuplicate={isDup} userId={user?.id} onComment={setCommentSpot}/>;})}</div>}
            {loadingNearby&&<p className="text-sm text-muted-foreground text-center py-4">Obteniendo tu ubicación...</p>}
          </div>
        )}

        {tab==='mis'&&(
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <input value={mySpotSearch} onChange={e=>setMySpotSearch(e.target.value)} placeholder="Buscar en mis spots..." className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none bg-white border border-border focus:border-primary text-foreground"/>
              {mySpotSearch&&<button onClick={()=>setMySpotSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1"><X className="w-4 h-4"/></button>}
            </div>
            <div className="flex bg-secondary rounded-xl p-1 mb-4">
              {[['all','Todos'],['assigned','Asignados'],['unassigned','Sin día'],['visited','Visitados']].map(([v,l])=><button key={v} onClick={()=>setStateFilter(v)} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${stateFilter===v?'bg-white text-foreground shadow-sm':'text-muted-foreground hover:text-foreground'}`}>{l}</button>)}
            </div>
            {spots.length===0?(<div className="text-center py-16"><p className="text-4xl mb-4">📍</p><p className="text-muted-foreground mb-4 text-sm">Aún no tienes spots en este viaje</p><button onClick={()=>setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl font-medium"><Plus className="w-4 h-4"/>Crear primer spot</button></div>)
            :filteredSpots.length===0&&mySpotSearch.trim()?(<div className="space-y-4"><div className="text-center py-6 bg-white rounded-2xl border border-border"><p className="text-2xl mb-2">🔍</p><p className="text-sm font-medium text-foreground mb-1">No tienes ese spot todavía</p><p className="text-xs text-muted-foreground">Resultados para <strong>"{mySpotSearch}"</strong></p></div>{seedSpots.filter(s=>s.title?.toLowerCase().includes(mySpotSearch.toLowerCase())).slice(0,4).map((p,i)=>{const isDup=spots.some(s=>s.title?.toLowerCase().trim()===p.title?.toLowerCase().trim());return<PlaceResultCard key={`ms-${i}`} place={{id:`ms-${i}`,name:p.title,type:p.type,address:p.address||''}} onSave={saveOsmPlace} saving={savingId===`ms-${i}`} isDuplicate={isDup} userId={user?.id} onComment={setCommentSpot}/>;})}<button onClick={()=>{setTab('buscar');setSearchQuery(mySpotSearch);}} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-border rounded-xl text-sm text-primary font-medium hover:bg-orange-50 transition-colors"><Search className="w-4 h-4"/>Buscar "{mySpotSearch}" en el mapa</button></div>)
            :filteredSpots.length===0?(<div className="text-center py-10"><p className="text-muted-foreground text-sm">Sin spots con ese filtro</p></div>)
            :(<div className="bg-white rounded-2xl border border-border overflow-hidden">{filteredSpots.map(spot=><MySpotRow key={spot.id} spot={spot} onTap={s=>setSelectedSpot(s)} onComment={s=>setCommentSpot(s)} userId={user?.id}/>)}</div>)}
          </div>
        )}

        {tab==='comunidad'&&(
          <div>
            {tripCities.length>0&&<div className="flex gap-2 mb-4 overflow-x-auto pb-1">{tripCities.map(c=>{const today=new Date().toISOString().slice(0,10);const isCurrent=c.start_date&&c.end_date&&today>=c.start_date&&today<=c.end_date;return(<button key={c.id} onClick={()=>setSelectedCity(c.name)} className={`text-sm px-4 py-1.5 rounded-full border font-medium flex-shrink-0 transition-colors flex items-center gap-1.5 ${(selectedCity||activeCity?.name)===c.name?'bg-primary text-white border-primary':'bg-white border-border text-muted-foreground hover:border-primary/40'}`}>{c.name}{isCurrent&&<span className="w-1.5 h-1.5 rounded-full bg-green-400"/>}</button>);})} </div>}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">{[['all','Todos','🌍'],['food','Comer','🍽️'],['sight','Cultura','🏛️'],['activity','Actividad','⚡'],['shopping','Compras','🛍️']].map(([v,l,em])=><button key={v} onClick={()=>setCommunityFilter(v)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 flex items-center gap-1 ${communityFilter===v?'bg-primary text-white border-primary':'bg-white border-border text-muted-foreground hover:border-primary/40'}`}>{em} {l}</button>)}</div>
            {communitySpots.length===0?(<div className="text-center py-16"><p className="text-4xl mb-4">🌍</p><p className="text-muted-foreground text-sm">Sin spots de la comunidad para {selectedCity||city} todavía</p></div>)
            :(<div className="space-y-3">{communitySpots.slice(0,20).map((spot,idx)=>{const alreadySaved=spots.some(s=>s.title?.toLowerCase()===spot.title?.toLowerCase());const key=spot.id||spot.title;return<CommunitySpotCard key={key||idx} spot={spot} onSave={saveCommunitySpot} saving={savingId===key} alreadySaved={alreadySaved} userId={user?.id} onComment={s=>setCommentSpot(s)}/>;})}</div>)}
          </div>
        )}
      </div>

      <CreateSpotSheet open={showCreate} onClose={()=>setShowCreate(false)} onSave={saveManualSpot} saving={savingId==='manual'} spots={spots} city={selectedCity||city} country={country}/>
      {selectedSpot&&<SpotDetailSheet spot={selectedSpot} open={!!selectedSpot} onClose={()=>setSelectedSpot(null)} onDelete={id=>deleteMutation.mutate(id)} tripId={tripId} tripCities={tripCities} userId={user?.id} onComment={s=>{setSelectedSpot(null);setCommentSpot(s);}}/>}
      {commentSpot&&<CommentsSheet spot={commentSpot} userId={user?.id} userProfile={myProfile} onClose={()=>setCommentSpot(null)}/>}
      {assignDateSpot&&<AssignDateModal spot={assignDateSpot} tripCities={tripCities} onAssign={async(date)=>{const resolvedCityId=cityIdForDate(date,tripCities);const resolvedCityName=cityNameForDate(date,tripCities);await updateMutation.mutateAsync({id:assignDateSpot.id,data:{assigned_date:date,...(resolvedCityId&&{city_id:resolvedCityId}),...(resolvedCityName&&{city_name:resolvedCityName})}});setAssignDateSpot(null);}} onSkip={()=>setAssignDateSpot(null)} onUndo={async()=>{if(assignDateSpot?.id)await deleteMutation.mutateAsync(assignDateSpot.id);setAssignDateSpot(null);}}/>}
      <Toast spot={toast.spot} city={toast.city} visible={toast.visible} onUndo={undoSave}/>
    </div>
  );
}