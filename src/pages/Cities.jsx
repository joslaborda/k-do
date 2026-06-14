import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format, differenceInDays, parseISO, isToday, isTomorrow, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ChevronDown, ChevronUp, Plus, Pencil, Trash2, X, Check, GripVertical, MapPin, Map, Utensils, Landmark, Ticket, ShoppingBag, CirclePlus, Hotel, Train, Car, Ship, Shield, FileText, Compass } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DocumentForm from '@/components/tickets/DocumentForm';
import PDFViewer from '@/components/PDFViewer';
import SpotDetailModal from '@/components/trip/SpotDetailModal';
import { enrichTicketDataWithAutoLinks } from '@/lib/autoLinkTickets';

// ── Constants ─────────────────────────────────────────────────────────────────
const DOC_ICON_MAP = {
  flight: PlaneIcon, hotel: Hotel, train: Train,
  bus: Car, car: Car, ticket: Ticket, insurance: Shield, other: FileText,
};
const DOC_TRANSPORT = new Set(['flight','train','bus','boat','ferry']);
const SPOT_ICONS = {
  food:     Utensils,
  sight:    Landmark,
  activity: Ticket,
  shopping: ShoppingBag,
  custom:   CirclePlus,
  restaurant: Utensils,
  museum:   Landmark,
};
const SPOT_COLORS = {
  food: 'bg-orange-50 text-primary', sight: 'bg-violet-50 text-violet-600',
  activity: 'bg-green-50 text-green-600', shopping: 'bg-blue-50 text-blue-600',
  custom: 'bg-secondary text-muted-foreground', restaurant: 'bg-orange-50 text-primary',
  museum: 'bg-violet-50 text-violet-600',
};

function getTransportIcon(docs, cityStartDate) {
  if (!docs || !cityStartDate) return null;
  const doc = docs.find(d => {
    const docDate = d.date || d.valid_from || d.start_date;
    return docDate === cityStartDate && DOC_TRANSPORT.has(d.type || d.doc_type);
  });
  if (!doc) return null;
  const t = doc.type || doc.doc_type;
  const M = { flight: PlaneIcon, train: Train, bus: Car }; const I = M[t] || Ship; return I;
}

// ── Draggable spot list ───────────────────────────────────────────────────────
function DraggableSpots({ spots, onReorder, onEdit }) {
  const [items, setItems] = useState(spots);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const touchRef = useRef(null);

  useEffect(() => { setItems(spots); }, [spots]);

  const onDragStart = (e, i) => { setDragging(i); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e, i) => { e.preventDefault(); setDragOver(i); };
  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragging === null || dragging === i) return;
    const next = [...items];
    const [m] = next.splice(dragging, 1);
    next.splice(i, 0, m);
    setItems(next); setDragging(null); setDragOver(null);
    onReorder(next);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  const onTouchStart = (e, i) => { touchRef.current = i; setDragging(i); };
  const onTouchMove = (e) => {
    if (touchRef.current === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    document.querySelectorAll('[data-spot-row]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) setDragOver(parseInt(el.dataset.spotRow));
    });
  };
  const onTouchEnd = () => {
    if (touchRef.current !== null && dragOver !== null && touchRef.current !== dragOver) {
      const next = [...items];
      const [m] = next.splice(touchRef.current, 1);
      next.splice(dragOver, 0, m);
      setItems(next);
      onReorder(next);
    }
    touchRef.current = null; setDragging(null); setDragOver(null);
  };

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {items.map((spot, i) => (
        <div key={spot.id} data-spot-row={i}
          draggable
          onDragStart={e => onDragStart(e, i)}
          onDragOver={e => onDragOver(e, i)}
          onDrop={e => onDrop(e, i)}
          onDragEnd={onDragEnd}
          onTouchStart={e => onTouchStart(e, i)}
          className={`flex items-center gap-2 px-4 py-3 border-t border-border transition-all select-none
            ${dragging === i ? 'opacity-40' : ''}
            ${dragOver === i && dragging !== i ? 'bg-accent/40' : ''}
          `}>
          <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0 cursor-grab touch-none" />
          <span className="text-sm shrink-0">{(() => { const I = SPOT_ICONS[spot.type]; return I ? <I size={14} className='text-muted-foreground' /> : <MapPin size={14} className='text-muted-foreground' />; })()}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
            {spot.assigned_time && <p className="text-xs text-primary font-medium mt-0.5">{spot.assigned_time}</p>}
            {spot.notes
              ? <p className="text-xs text-muted-foreground mt-0.5 truncate">{spot.notes}</p>
              : <button onClick={() => onEdit(spot)} className="text-xs text-primary mt-0.5 flex items-center gap-1">
                  <Plus className="w-3 h-3" />Añadir nota
                </button>
            }
          </div>
          <button onClick={() => onEdit(spot)}
            className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Spot edit modal ───────────────────────────────────────────────────────────
function SpotEditModal({ spot, open, onClose, onSave, onRemove }) {
  const [notes, setNotes] = useState(spot?.notes || '');
  const [time, setTime] = useState(spot?.assigned_time || '');
  useEffect(() => { if (spot) { setNotes(spot.notes || ''); setTime(spot.assigned_time || ''); } }, [spot]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{(() => { const I = SPOT_ICONS[spot?.type]; return I ? <I size={14} className='text-muted-foreground' /> : <MapPin size={14} className='text-muted-foreground' />; })()}</span>
            {spot?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 py-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Hora</p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="h-9 border border-border rounded-xl px-3 text-sm text-foreground bg-secondary outline-none focus:border-primary w-[120px]"
              />
              {time && <button onClick={() => setTime('')} className="text-xs text-muted-foreground hover:text-foreground">Quitar</button>}
              {!time && <span className="text-xs text-muted-foreground">opcional</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Nota personal</p>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Añade una nota para este spot..."
              className="text-sm bg-secondary border-border resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button onClick={() => onRemove(spot)}
            className="text-xs text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors">
            <Trash2 className="w-3 h-3" />Quitar del día
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => onSave(spot, notes, time)}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ── Doc viewer modal ──────────────────────────────────────────────────────────
const DOC_BG = { flight:'bg-blue-50', hotel:'bg-purple-50', train:'bg-green-50', bus:'bg-amber-50', car:'bg-orange-50', ticket:'bg-rose-50', insurance:'bg-teal-50', other:'bg-secondary' };

function DocViewerModal({ doc, open, onClose, onEdit }) {
  const type = doc?.category || doc?.type || doc?.doc_type || 'other';
  const DocIcon = DOC_ICON_MAP[type] || FileText;
  const bgColor = DOC_BG[type] || 'bg-secondary';

  const openFile = () => {
    if (doc?.file_url) window.open(doc.file_url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm p-0 gap-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}><DocIcon size={18} className='text-foreground opacity-70' /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{doc?.name || doc?.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{type} {doc?.date ? `· ${doc.date}` : ''}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* File preview / upload zone */}
        {doc?.file_url ? (
          <button onClick={openFile} className="mx-4 my-3 bg-secondary rounded-xl p-4 flex items-center gap-3 hover:bg-border/40 transition-colors text-left w-[calc(100%-2rem)]">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Ver documento</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toca para abrir en el navegador</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
        ) : (
          <div className="mx-4 my-3 border-2 border-dashed border-border rounded-xl p-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40 mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-xs text-muted-foreground">Sin archivo adjunto</p>
          </div>
        )}

        {/* Fields */}
        <div className="px-4 pb-3 flex flex-col gap-2 border-t border-border pt-3">
          {doc?.time && (
            <div className="flex gap-3"><span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5">Hora</span><span className="text-sm text-primary font-medium">{doc.time}</span></div>
          )}
          {doc?.origin && (
            <div className="flex gap-3"><span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5">Origen</span><span className="text-sm text-foreground">{doc.origin}</span></div>
          )}
          {doc?.destination && (
            <div className="flex gap-3"><span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5">Destino</span><span className="text-sm text-foreground">{doc.destination}</span></div>
          )}
          {doc?.notes && (
            <div className="flex gap-3"><span className="text-xs text-muted-foreground w-14 shrink-0 pt-0.5">Notas</span><span className="text-sm text-foreground">{doc.notes}</span></div>
          )}
          {doc?.visibility === 'shared' && (
            <div className="flex gap-3 items-center"><span className="text-xs text-muted-foreground w-14 shrink-0">Con</span><span className="text-xs bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Grupo</span></div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
            {doc?.file_url && (
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={openFile}>
                Abrir
              </Button>
            )}
          </div>
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit} className="flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />Editar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Day expanded content ──────────────────────────────────────────────────────
function DayContent({ day, dayDate, docs, spots, tripId, cityId, isToday_, isTomorrow_, isEmpty, onReorderSpots, queryClient, trip, cities, itineraryDays, profiles, userId }) {
  const [editingSpot, setEditingSpot] = useState(null);   // spot object — view+edit modal
  const [viewingDoc,  setViewingDoc]  = useState(null);   // doc object — view modal
  const [viewingFile, setViewingFile] = useState(null);   // file url — PDFViewer
  const [editingDoc,  setEditingDoc]  = useState(null);   // doc object — edit modal
  const [titleVal,    setTitleVal]    = useState(day?.title || '');
  const [titleEditing, setTitleEditing] = useState(false);
  const [addingNote,  setAddingNote]  = useState(false);
  const [editingNote, setEditingNote] = useState(null);   // noteIdx
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('');
  const [savingDoc,   setSavingDoc]   = useState(false);
  const [addingDoc,   setAddingDoc]   = useState(false);
  const [savingNewDoc, setSavingNewDoc] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [order, setOrder]             = useState(null);   // manual drag order for no-time items

  // Notes
  const parseNotes = (raw) => {
    if (!raw) return [];
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
    return raw.trim() ? [{ text: raw, time: '' }] : [];
  };
  const [notesList, setNotesList] = useState(() => parseNotes(day?.content));
  useEffect(() => { setNotesList(parseNotes(day?.content)); setTitleVal(day?.title || ''); }, [day?.id, day?.content, day?.title]);

  const updateNote = (i, field, val) => setNotesList(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: val } : n));

  const saveNotes = async (list) => {
    setSavingNotes(true);
    const clean = (list || notesList).filter(n => n.text?.trim());
    const payload = { content: JSON.stringify(clean) };
    try {
      if (day?.id) await base44.entities.ItineraryDay.update(day.id, payload);
      else await base44.entities.ItineraryDay.create({ city_id: cityId, trip_id: tripId, date: dayDate, title: '', ...payload, order: 0 });
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', tripId] });
      queryClient.invalidateQueries({ queryKey: ['allDocs', tripId] });
    } finally { setSavingNotes(false); }
  };

  const saveTitle = async () => {
    if (day?.id) await base44.entities.ItineraryDay.update(day.id, { title: titleVal });
    else await base44.entities.ItineraryDay.create({ city_id: cityId, trip_id: tripId, date: dayDate, title: titleVal, content: '', order: 0 });
    queryClient.invalidateQueries({ queryKey: ['itineraryDays', tripId] });
    setTitleEditing(false);
  };

  const handleSpotSave = async (spot, newNotes, newTime) => {
    await base44.entities.Spot.update(spot.id, { notes: newNotes, assigned_time: newTime || null });
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    setEditingSpot(null);
  };
  const handleSpotRemove = async (spot) => {
    await base44.entities.Spot.update(spot.id, { assigned_date: null, day_order: null, assigned_time: null });
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    setEditingSpot(null);
  };

  const handleDocSave = async (data) => {
    setSavingDoc(true);
    try {
      const enriched = enrichTicketDataWithAutoLinks(data, itineraryDays || [], data.city_id);
      await base44.entities.Ticket.update(editingDoc.id, enriched);
      queryClient.invalidateQueries({ queryKey: ['allDocs', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
      setEditingDoc(null);
    } finally { setSavingDoc(false); }
  };

  const handleDocCreate = async (data) => {
    setSavingNewDoc(true);
    try {
      const enriched = enrichTicketDataWithAutoLinks(data, itineraryDays || [], data.city_id);
      await base44.entities.Ticket.create({ ...enriched, trip_id: tripId, user_id: userId, date: enriched.date || dayDate });
      queryClient.invalidateQueries({ queryKey: ['allDocs', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setAddingDoc(false);
    } finally { setSavingNewDoc(false); }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    const updated = [...notesList, { text: newNoteText.trim(), time: newNoteTime }];
    setNotesList(updated);
    setNewNoteText(''); setNewNoteTime(''); setAddingNote(false);
    await saveNotes(updated);
  };
  const handleDeleteNote = async (idx) => {
    const updated = notesList.filter((_, i) => i !== idx);
    setNotesList(updated);
    setEditingNote(null);
    await saveNotes(updated);
  };
  const handleSaveNote = async (idx) => {
    await saveNotes(notesList);
    setEditingNote(null);
  };

  const dayDocs = [...docs].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  // Build timeline
  const { withTime, noTime } = useMemo(() => {
    const docItems  = dayDocs.map(d  => ({ ...d,  _kind: 'doc',  _time: d.time || null, _title: d.name || d.title || 'Documento', _sub: d.origin && d.destination ? `${d.origin} → ${d.destination}` : null }));
    const spotItems = spots.map(s   => ({ ...s,  _kind: 'spot', _time: s.assigned_time || null, _title: s.title || 'Spot', _sub: s.notes || null }));
    const noteItems = notesList.filter(n => n.text?.trim()).map((n, i) => ({
      id: 'note-' + i, _kind: 'note', _time: n.time || null, _title: n.text, _sub: null, _noteIdx: i,
    }));
    const all = [...docItems, ...spotItems, ...noteItems];
    return {
      withTime: all.filter(i => i._time).sort((a, b) => a._time.localeCompare(b._time)),
      noTime:   all.filter(i => !i._time),
    };
  }, [dayDocs, spots, notesList]);

  // Draggable no-time items
  const [dragItems, setDragItems]   = useState(noTime);
  const [dragging,  setDragging]    = useState(null);
  const [dragOver,  setDragOver]    = useState(null);
  const touchRef = useRef(null);
  useEffect(() => { setDragItems(noTime); }, [noTime.length, spots.length, notesList.length]);

  const onDragStart = (e, i) => { setDragging(i); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e, i) => { e.preventDefault(); setDragOver(i); };
  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragging === null || dragging === i) return;
    const next = [...dragItems]; const [m] = next.splice(dragging, 1); next.splice(i, 0, m);
    setDragItems(next); setDragging(null); setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };
  const onTouchStart = (e, i) => { touchRef.current = i; setDragging(i); };
  const onTouchMove = (e) => {
    if (touchRef.current === null) return; e.preventDefault();
    const y = e.touches[0].clientY;
    document.querySelectorAll('[data-notime-row]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) setDragOver(parseInt(el.dataset.notimeRow));
    });
  };
  const onTouchEnd = () => {
    if (touchRef.current !== null && dragOver !== null && touchRef.current !== dragOver) {
      const next = [...dragItems]; const [m] = next.splice(touchRef.current, 1); next.splice(dragOver, 0, m);
      setDragItems(next);
    }
    touchRef.current = null; setDragging(null); setDragOver(null);
  };

  const timeline = [...withTime, ...dragItems];
  const bgClass = isToday_ ? 'bg-orange-50/50 dark:bg-orange-950/10' : 'bg-card';
  const borderLeft = isToday_ ? 'border-l-2 border-l-primary' : '';

  const renderItem = (item, idx, isNoTime) => {
    const DocIcon = item._kind === 'doc' ? (DOC_ICON_MAP[item.category || item.type || item.doc_type] || FileText) : null;
    const isLast = idx === timeline.length - 1;

    return (
      <div key={item.id || idx}
        data-notime-row={isNoTime ? idx - withTime.length : undefined}
        draggable={isNoTime}
        onDragStart={isNoTime ? e => onDragStart(e, idx - withTime.length) : undefined}
        onDragOver={isNoTime ? e => onDragOver(e, idx - withTime.length) : undefined}
        onDrop={isNoTime ? e => onDrop(e, idx - withTime.length) : undefined}
        onDragEnd={isNoTime ? onDragEnd : undefined}
        onTouchStart={isNoTime ? e => onTouchStart(e, idx - withTime.length) : undefined}
        className={`flex items-stretch border-t border-border transition-all select-none
          ${isNoTime && dragging === idx - withTime.length ? 'opacity-40' : ''}
          ${isNoTime && dragOver === idx - withTime.length && dragging !== idx - withTime.length ? 'bg-accent/20' : ''}
        `}>

        {/* Time column */}
        <div className="w-12 shrink-0 flex flex-col items-center pt-3.5 pb-1 pl-4 gap-0">
          {item._time
            ? <span className="text-label2 font-medium text-primary leading-none whitespace-nowrap">{item._time}</span>
            : isNoTime
            ? <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 cursor-grab touch-none mt-0.5" />
            : <div className="w-2 h-2 rounded-full bg-border mt-1" />}
          {!isLast && <div className="w-px flex-1 bg-border/50 mt-1.5" />}
        </div>

        {/* Tappable body — opens view */}
        <button
          onClick={() => {
            if (item._kind === 'doc') { if (item.file_url) setViewingFile(item.file_url); else setViewingDoc(item); }
            if (item._kind === 'spot') setEditingSpot(item);
            if (item._kind === 'note') setEditingNote(item._noteIdx);
          }}
          className="flex-1 flex items-center gap-3 px-3 py-3 hover:bg-secondary/20 transition-colors text-left min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item._kind === 'doc' ? 'bg-orange-50 dark:bg-orange-950/30' : (SPOT_COLORS[item.type] || 'bg-secondary')}`}>
            {item._kind === 'doc' && DocIcon
              ? <DocIcon size={15} className="text-primary" />
              : item._kind === 'note'
              ? <FileText size={14} className='text-muted-foreground' />
              : (() => { const SpI = SPOT_ICONS[item.type] || CirclePlus; return <SpI size={14} className={SPOT_COLORS[item.type]?.split(' ')[1] || 'text-muted-foreground'} />; })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item._title}</p>
            {item._sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item._sub}</p>}
          </div>
        </button>

        {/* Edit button */}
        <button
          onClick={e => {
            e.stopPropagation();
            if (item._kind === 'doc')  setEditingDoc(item);
            if (item._kind === 'spot') setEditingSpot(item);
            if (item._kind === 'note') setEditingNote(item._noteIdx);
          }}
          className="w-10 flex items-center justify-center shrink-0 border-l border-border hover:bg-secondary/30 transition-colors">
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <div className={`${bgClass} ${borderLeft}`} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

      {/* Title */}
      <div className="px-4 py-3 border-t border-border bg-card">
        {titleEditing ? (
          <div className="flex items-center gap-2">
            <Input value={titleVal} onChange={e => setTitleVal(e.target.value)}
              placeholder="¿Qué harás este día?" className="flex-1 h-9 text-sm bg-secondary border-border"
              autoFocus onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setTitleEditing(false); }} />
            <button onClick={() => setTitleEditing(false)} className="text-muted-foreground p-1"><X className="w-4 h-4" /></button>
            <button onClick={saveTitle} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></button>
          </div>
        ) : (
          <button onClick={() => setTitleEditing(true)} className="w-full flex items-center gap-2 text-left group">
            <span className={`flex-1 text-sm ${titleVal ? 'font-medium text-foreground' : 'text-muted-foreground italic'}`}>
              {titleVal || 'Añadir título al día...'}
            </span>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Timeline */}
      {timeline.map((item, idx) => renderItem(item, idx, idx >= withTime.length))}

      {/* Add actions */}
      <div className="flex border-t border-border">
        <button onClick={() => setAddingDoc(true)}
          className="flex-1 flex items-center justify-center py-3 text-sm font-semibold text-primary hover:bg-accent transition-colors border-r border-border">
          + Doc
        </button>
        <Link to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
          className="flex-1 flex items-center justify-center py-3 text-sm font-semibold text-primary hover:bg-accent transition-colors border-r border-border">
          + Spot
        </Link>
        <button onClick={() => { setAddingNote(true); setNewNoteText(''); setNewNoteTime(''); }}
          className="flex-1 flex items-center justify-center py-3 text-sm font-semibold text-primary hover:bg-accent transition-colors">
          + Nota
        </button>
      </div>

      {/* Add note inline */}
      {addingNote && (
        <div className="border-t border-border p-4 bg-secondary/30">
          <Textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)}
            placeholder="Escribe una nota..." className="text-sm bg-card border-border resize-none w-full mb-3" rows={3} autoFocus />
          <div className="flex items-center gap-3 flex-wrap">
            <input type="time" value={newNoteTime} onChange={e => setNewNoteTime(e.target.value)}
              className="h-8 border border-border rounded-lg px-2 text-xs bg-card text-foreground outline-none focus:border-primary w-[100px]" />
            <span className="text-xs text-muted-foreground">hora opcional</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setAddingNote(false)} className="text-xs text-muted-foreground px-4 py-2 rounded-full border border-border hover:bg-secondary/50 transition-colors">Cancelar</button>
              <button onClick={handleAddNote} disabled={!newNoteText.trim()}
                className="text-xs text-white bg-primary px-4 py-2 rounded-full font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit note inline */}
      {editingNote !== null && notesList[editingNote] && (
        <div className="border-t border-border p-4 bg-secondary/30">
          <Textarea value={notesList[editingNote].text} onChange={e => updateNote(editingNote, 'text', e.target.value)}
            className="text-sm bg-card border-border resize-none w-full mb-3" rows={3} autoFocus />
          <div className="flex items-center gap-3 flex-wrap">
            <input type="time" value={notesList[editingNote].time || ''} onChange={e => updateNote(editingNote, 'time', e.target.value)}
              className="h-8 border border-border rounded-lg px-2 text-xs bg-card text-foreground outline-none focus:border-primary w-[100px]" />
            <button onClick={() => handleDeleteNote(editingNote)} className="text-xs text-red-500 flex items-center gap-1">
              <Trash2 className="w-3 h-3" />Eliminar
            </button>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setEditingNote(null)} className="text-xs text-muted-foreground px-4 py-2 rounded-full border border-border hover:bg-secondary/50 transition-colors">Cancelar</button>
              <button onClick={() => handleSaveNote(editingNote)} className="text-xs text-white bg-primary px-4 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add doc modal */}
      {addingDoc && (
        <Dialog open={addingDoc} onOpenChange={o => { if (!o) setAddingDoc(false); }}>
          <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] p-0 gap-0 flex flex-col">
            <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
              <DialogTitle className="text-base font-semibold">Añadir documento</DialogTitle>
            </DialogHeader>
            <div className="px-5 py-4 overflow-y-auto flex-1">
              <DocumentForm
                cities={cities || []}
                itineraryDays={itineraryDays || []}
                members={trip?.members || []}
                profiles={profiles || []}
                tripCities={cities || []}
                initialData={{ date: dayDate }}
                minDate={trip?.start_date || undefined}
                maxDate={trip?.end_date || undefined}
                onSave={handleDocCreate}
                onCancel={() => setAddingDoc(false)}
                saving={savingNewDoc}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Spot modal — view + edit */}
      {editingSpot && (
        <SpotDetailModal
          spot={editingSpot}
          open={!!editingSpot}
          onClose={() => setEditingSpot(null)}
          onSave={() => { queryClient.invalidateQueries({ queryKey: ['spots', tripId] }); setEditingSpot(null); }}
          onRemove={handleSpotRemove}
          queryClient={queryClient}
          tripId={tripId}
        />
      )}

      {/* PDFViewer — opens file directly */}
      {viewingFile && (
        <PDFViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
      )}

      {/* Doc view modal — for docs without file */}
      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} open={!!viewingDoc} onClose={() => setViewingDoc(null)}
          onEdit={() => { setEditingDoc(viewingDoc); setViewingDoc(null); }} />
      )}

      {/* Doc edit modal */}
      {editingDoc && (
        <Dialog open={!!editingDoc} onOpenChange={o => { if (!o) setEditingDoc(null); }}>
          <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] p-0 gap-0 flex flex-col">
            <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
              <DialogTitle className="text-base font-semibold">Editar documento</DialogTitle>
            </DialogHeader>
            <div className="px-5 py-4 overflow-y-auto flex-1">
              <DocumentForm
                initialData={editingDoc}
                cities={cities || []}
                itineraryDays={itineraryDays || []}
                members={trip?.members || []}
                profiles={profiles || []}
                tripCities={cities || []}
                onSave={handleDocSave}
                onCancel={() => setEditingDoc(null)}
                saving={savingDoc}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────
function DayRow({ day, dateStr, allDocs, allSpots, tripId, cityId, isToday_, isTomorrow_, queryClient, defaultOpen, trip, cities, itineraryDays, profiles, userId }) {
  const [open, setOpen] = useState(defaultOpen);

  const docs = useMemo(() =>
    allDocs.filter(d => {
      const dd = d.date || d.valid_from || d.start_date;
      return dd === dateStr;
    }),
    [allDocs, dateStr]
  );

  const spots = useMemo(() =>
    allSpots
      .filter(s => s.assigned_date === dateStr && s.city_id === cityId)
      .sort((a, b) => (a.day_order ?? 999) - (b.day_order ?? 999)),
    [allSpots, dateStr, cityId]
  );

  const hasContent = docs.length > 0 || spots.length > 0;
  const isEmpty = !day?.title && !hasContent;
  const label = isToday_ ? format(parseISO(dateStr), 'dd MMM', { locale: es }) : format(parseISO(dateStr), 'dd MMM', { locale: es });

  const rowBorder = isToday_ ? 'border-t-2 border-t-primary' : 'border-t border-t-border';
  const rowBg = isToday_ ? 'bg-orange-50/70' : open ? 'bg-secondary/20' : 'bg-card hover:bg-secondary/10';

  // Pills de contenido
  const notesCount = day?.notes?.length || 0;
  const pillItems = [
    docs.length > 0 && { label: `${docs.length} doc${docs.length > 1 ? 's' : ''}`, cls: 'bg-orange-50 text-primary' },
    spots.length > 0 && { label: `${spots.length} spot${spots.length > 1 ? 's' : ''}`, cls: 'bg-violet-50 text-violet-700' },
    notesCount > 0 && { label: `${notesCount} nota${notesCount > 1 ? 's' : ''}`, cls: 'bg-green-50 text-green-700' },
  ].filter(Boolean);

  return (
    <div className="mb-2">
      {/* Card */}
      <div className={`bg-card rounded-2xl border overflow-hidden ${isToday_ ? 'border-orange-200' : 'border-border'}`}>
        {/* Header */}
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-stretch gap-0 text-left">
          {/* Franja lateral */}
          <div className={`w-1 self-stretch rounded-l-2xl flex-shrink-0 ${isToday_ ? 'bg-primary' : 'bg-transparent'}`} />
          {/* Contenido header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
            {/* Fecha */}
            <div className="flex flex-col items-center w-9 flex-shrink-0">
              <span className={`text-lg font-bold leading-none ${isToday_ ? 'text-primary' : 'text-foreground'}`}>
                {format(parseISO(dateStr), 'd', { locale: es })}
              </span>
              <span className="text-micro uppercase tracking-wide font-semibold text-muted-foreground mt-0.5">
                {format(parseISO(dateStr), 'MMM', { locale: es })}
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${!day?.title && !hasContent ? 'text-muted-foreground italic font-normal' : 'text-foreground'}`}>
                {day?.title || (hasContent
                ? pillItems.map(p => p.label).join(' · ')
                : 'Toca para planificar')}
              </p>
              {hasContent && (
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {pillItems.map((p, i) => (
                    <span key={i} className={`text-label font-bold px-2 py-0.5 rounded-full ${p.cls}`}>{p.label}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Badges + chevron */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isToday_ && <span className="text-label bg-primary text-white px-2 py-0.5 rounded-full font-semibold">Hoy</span>}
              {isTomorrow_ && <span className="text-label bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-full">Mañana</span>}
              {open
                ? <ChevronUp className={`w-4 h-4 ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`} />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </button>

      {open && (
        <DayContent
          day={day}
          dayDate={dateStr}
          docs={docs}
          spots={spots}
          tripId={tripId}
          cityId={cityId}
          isToday_={isToday_}
          isTomorrow_={isTomorrow_}
          isEmpty={isEmpty}
          onReorderSpots={() => {}}
          queryClient={queryClient}
          trip={trip}
          cities={cities}
          itineraryDays={itineraryDays}
          profiles={profiles}
          userId={userId}
        />
      )}
      </div>
    </div>
  );
}

// ── City block ────────────────────────────────────────────────────────────────
function CityBlock({ city, idx, total, allDocs, allSpots, itineraryDays, tripId, isActive, isPast, queryClient, trip, cities, profiles, userId }) {
  const [open, setOpen] = useState(isActive);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const cityDays = useMemo(() => {
    if (!city.start_date || !city.end_date) return [];
    try {
      const start = parseISO(city.start_date);
      const end = parseISO(city.end_date);
      if (end < start) return [];
      return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
    } catch { return []; }
  }, [city]);

  const daysByDate = useMemo(() => {
    const m = {};
    itineraryDays.filter(d => d.city_id === city.id).forEach(d => { if (d.date) m[d.date] = d; });
    return m;
  }, [itineraryDays, city.id]);

  const transportIcon = useMemo(() =>
    getTransportIcon(allDocs, city.start_date),
    [allDocs, city.start_date]
  );

  return (
    <div className="mb-4">
      {/* Ciudad header — colapsable */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-1 py-2 text-left">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isPast ? 'bg-green-100 text-green-700' : isActive ? 'bg-primary text-white' : 'bg-orange-100 text-primary'
        }`}>
          {isPast ? <Check size={10} className='text-green-700' /> : idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {city.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {city.start_date && city.end_date
              ? `${format(parseISO(city.start_date), 'dd MMM', { locale: es })} – ${format(parseISO(city.end_date), 'dd MMM', { locale: es })}`
              : 'Sin fechas'}
          </span>
        </div>
        {isPast && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0 font-semibold">Visitada</span>}
        {isActive && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full shrink-0 font-semibold">Ahora</span>}
        {!isActive && !isPast && <span className="text-xs bg-orange-100 text-primary px-2 py-0.5 rounded-full shrink-0 font-medium">Próxima</span>}
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Días sueltos debajo — mismas cards que ciudad única */}
      {open && (
        <div className="flex flex-col gap-2 mt-2">
          {cityDays.length === 0 && (
            <div className="bg-card border border-border rounded-2xl px-4 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sin fechas asignadas</p>
              <p className="text-xs text-primary">Edita el viaje para añadir fechas →</p>
            </div>
          )}
          {cityDays.map(dateStr => (
            <DayRow
              key={dateStr}
              day={daysByDate[dateStr] || null}
              dateStr={dateStr}
              allDocs={allDocs}
              allSpots={allSpots}
              tripId={tripId}
              cityId={city.id}
              isToday_={dateStr === todayStr}
              isTomorrow_={dateStr === tomorrowStr}
              queryClient={queryClient}
              defaultOpen={dateStr === todayStr}
              trip={trip}
              cities={cities}
              itineraryDays={itineraryDays}
              profiles={profiles}
              userId={userId}
            />
          ))}
        </div>
      )}

      {/* Conector transporte entre ciudades */}
      {idx < total - 1 && transportIcon && (
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">{transportIcon}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Cities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const userId = currentUser?.id ?? '';

  const [tripId, setTripId] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('trip_id');
    if (!id || id === 'null') { navigate(createPageUrl('TripsList'), { replace: true }); return; }
    setTripId(id);
    window.scrollTo(0, 0);
  }, [navigate]);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripId ? base44.entities.Trip.get(tripId) : null,
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const { data: allDocs = [] } = useQuery({
    queryKey: ['allDocs', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allSpots = [] } = useQuery({
    queryKey: ['spots', tripId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 30000,
  });

  const sortedCities = useMemo(() =>
    [...cities].sort((a, b) => (a.start_date || '').localeCompare(b.start_date || '')),
    [cities]
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  // Progress
  const tripStart = trip?.start_date;
  const tripEnd = trip?.end_date;
  const totalDays = tripStart && tripEnd ? differenceInDays(parseISO(tripEnd), parseISO(tripStart)) + 1 : null;
  const dayNumber = tripStart && todayStr >= tripStart ? differenceInDays(parseISO(todayStr), parseISO(tripStart)) + 1 : null;
  const progress = totalDays && dayNumber ? Math.min(100, Math.round((dayNumber / totalDays) * 100)) : 0;
  const tripNotStarted = tripStart && todayStr < tripStart;
  const tripFinished = tripEnd && todayStr > tripEnd;
  const daysLeft = tripStart ? differenceInDays(parseISO(tripStart), new Date()) : null;

  const activeCityName = useMemo(() => {
    const c = sortedCities.find(c => c.start_date && c.end_date && todayStr >= c.start_date && todayStr <= c.end_date);
    return c?.name || '';
  }, [sortedCities, todayStr]);

  if (!tripId) return null;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />Inicio
              </button>
            </Link>
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId + '&open_settings=true'}>
              <button className="text-sm text-primary flex items-center gap-1 font-semibold">
                <Plus className="w-4 h-4" />Ciudad
              </button>
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1">Ruta</h1>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">La base de tu viaje en Kōdo. Construye con el grupo el itinerario completo día a día con Documentos, Spots y Notas. Tu tab Hoy en Home mostrará el día a día de tu viaje.</p>

          {/* Progress */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              {tripNotStarted && daysLeft !== null ? `Faltan ${daysLeft} días` :
               tripFinished ? 'Viaje completado' :
               dayNumber && totalDays ? `Día ${dayNumber} de ${totalDays}${activeCityName ? ` · ${activeCityName}` : ''}` :
               'Sin fechas'}
            </span>
            <span className={`text-xs font-medium ${tripFinished ? 'text-green-700' : 'text-primary'}`}>
              {tripFinished ? '100%' : progress > 0 ? `${progress}%` : ''}
            </span>
          </div>
          {(progress > 0 || tripFinished) && (
            <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all ${tripFinished ? 'bg-green-600' : 'bg-primary'}`}
                style={{ width: `${tripFinished ? 100 : progress}%` }} />
            </div>
          )}
          {!(progress > 0 || tripFinished) && <div className="mb-3" />}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        {sortedCities.length === 0 ? (
          <div className="text-center py-16">
            <div className='w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4'><Map className='w-7 h-7 text-muted-foreground/50' /></div>
            <p className="text-muted-foreground mb-4">Aún no hay ciudades en la ruta</p>
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId + '&open_settings=true'}>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />Añadir ciudad
              </Button>
            </Link>
          </div>
        ) : sortedCities.length === 1 ? (
          // Una sola ciudad — mostrar días directamente sin cabecera de ciudad
          <div className="flex flex-col gap-0">
            {(() => {
              const city = sortedCities[0];
              const cityDays = (() => {
                if (!city.start_date || !city.end_date) return [];
                try {
                  const start = parseISO(city.start_date);
                  const end = parseISO(city.end_date);
                  if (end < start) return [];
                  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
                } catch { return []; }
              })();
              const daysByDate = {};
              itineraryDays.filter(d => d.city_id === city.id).forEach(d => { if (d.date) daysByDate[d.date] = d; });
              if (cityDays.length === 0) return (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Sin fechas asignadas</p>
                  <p className="text-xs text-primary">Edita el viaje para añadir fechas →</p>
                </div>
              );
              return cityDays.map(dateStr => (
                <DayRow
                  key={dateStr}
                  day={daysByDate[dateStr] || null}
                  dateStr={dateStr}
                  allDocs={allDocs}
                  allSpots={allSpots}
                  tripId={tripId}
                  cityId={city.id}
                  isToday_={dateStr === todayStr}
                  isTomorrow_={dateStr === tomorrowStr}
                  queryClient={queryClient}
                  defaultOpen={dateStr === todayStr}
                  trip={trip}
                  cities={cities}
                  itineraryDays={itineraryDays}
                  profiles={profiles}
                  userId={userId}
                />
              ));
            })()}
          </div>
        ) : (
          // Varias ciudades — mostrar bloques por ciudad
          <div className="flex flex-col gap-0">
            {sortedCities.map((city, idx) => {
              const isPast = city.end_date && todayStr > city.end_date;
              const isActive = city.start_date && city.end_date && todayStr >= city.start_date && todayStr <= city.end_date;
              return (
                <CityBlock
                  key={city.id}
                  city={city}
                  idx={idx}
                  total={sortedCities.length}
                  allDocs={allDocs}
                  allSpots={allSpots}
                  itineraryDays={itineraryDays}
                  tripId={tripId}
                  isActive={isActive}
                  isPast={isPast}
                  queryClient={queryClient}
                  trip={trip}
                  cities={cities}
                  profiles={profiles}
                  userId={userId}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
