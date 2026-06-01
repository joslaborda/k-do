import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format, differenceInDays, parseISO, isToday, isTomorrow, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ChevronDown, ChevronUp, Plus, X, Check, GripVertical, MapPin } from 'lucide-react';
import { PlaneIcon, Hotel, TrainFront, BusFront, Car, Ship, Ticket, Shield, FileText } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Constants ─────────────────────────────────────────────────────────────────
const DOC_ICON_MAP = {
  flight: PlaneIcon, hotel: Hotel, train: TrainFront,
  bus: BusFront, car: Car, ticket: Ticket, insurance: Shield, other: FileText,
};
const DOC_TRANSPORT = new Set(['flight','train','bus','boat','ferry']);
const SPOT_ICONS = { food:'🍜', sight:'🏛️', activity:'⚡', shopping:'🛍️', custom:'📍' };

function getTransportIcon(docs, cityStartDate) {
  if (!docs || !cityStartDate) return null;
  const doc = docs.find(d => {
    const docDate = d.date || d.valid_from || d.start_date;
    return docDate === cityStartDate && DOC_TRANSPORT.has(d.type || d.doc_type);
  });
  if (!doc) return null;
  const t = doc.type || doc.doc_type;
  const M = { flight: PlaneIcon, train: TrainFront, bus: BusFront }; const I = M[t] || Ship; return I;
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
          <span className="text-sm shrink-0">{SPOT_ICONS[spot.type] || '📍'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{spot.title}</p>
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
  useEffect(() => { if (spot) setNotes(spot.notes || ''); }, [spot]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{SPOT_ICONS[spot?.type] || '📍'}</span>
            {spot?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 py-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Nota personal</p>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Añade una nota para este spot..."
            className="text-sm bg-secondary border-border resize-none"
            rows={3}
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button onClick={() => onRemove(spot)}
            className="text-xs text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Quitar del día
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => onSave(spot, notes)}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ── Doc viewer modal ──────────────────────────────────────────────────────────
const DOC_BG = { flight:'bg-blue-50', hotel:'bg-purple-50', train:'bg-green-50', bus:'bg-amber-50', car:'bg-orange-50', ticket:'bg-rose-50', insurance:'bg-teal-50', other:'bg-secondary' };

function DocViewerModal({ doc, open, onClose }) {
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
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center shrink-0">
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

        <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          {doc?.file_url && (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={openFile}>
              Abrir documento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Day expanded content ──────────────────────────────────────────────────────
function DayContent({ day, dayDate, docs, spots, tripId, cityId, isToday_, isTomorrow_, isEmpty, onReorderSpots, queryClient }) {
  const [editingSpot, setEditingSpot] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [notes, setNotes] = useState(day?.content || '');
  const [noteTime, setNoteTime] = useState(day?.note_time || '');
  const [notesChanged, setNotesChanged] = useState(false);
  const [titleVal, setTitleVal] = useState(day?.title || '');
  useEffect(() => { setNotes(day?.content || ''); setNoteTime(day?.note_time || ''); }, [day?.id]);
  const [titleEditing, setTitleEditing] = useState(isEmpty && !day?.title);

  const dayDocs = useMemo(() =>
    [...docs].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')),
    [docs]
  );

  const saveNotes = async () => {
    if (!notesChanged) return;
    const payload = { content: notes, note_time: noteTime || null };
    if (day?.id) {
      await base44.entities.ItineraryDay.update(day.id, payload);
    } else {
      await base44.entities.ItineraryDay.create({
        city_id: cityId, trip_id: tripId, date: dayDate,
        title: '', ...payload, order: 0
      });
    }
    queryClient.invalidateQueries({ queryKey: ['itineraryDays', tripId] });
    queryClient.invalidateQueries({ queryKey: ['allCities'] });
    setNotesChanged(false);
  };

  const saveTitle = async () => {
    if (day?.id) {
      await base44.entities.ItineraryDay.update(day.id, { title: titleVal });
    } else {
      await base44.entities.ItineraryDay.create({
        city_id: cityId, trip_id: tripId, date: dayDate,
        title: titleVal, content: '', order: 0
      });
    }
    queryClient.invalidateQueries({ queryKey: ['itineraryDays', tripId] });
    queryClient.invalidateQueries({ queryKey: ['allCities'] });
    setTitleEditing(false);
  };

  const handleReorder = async (newOrder) => {
    await Promise.all(newOrder.map((s, i) => base44.entities.Spot.update(s.id, { day_order: i })));
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
  };

  const handleSpotSave = async (spot, newNotes) => {
    await base44.entities.Spot.update(spot.id, { notes: newNotes });
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    setEditingSpot(null);
  };

  const handleSpotRemove = async (spot) => {
    await base44.entities.Spot.update(spot.id, { assigned_date: null, day_order: null });
    queryClient.invalidateQueries({ queryKey: ['spots', tripId] });
    setEditingSpot(null);
  };

  const bgClass = isToday_ ? 'bg-orange-50/50 dark:bg-orange-950/10' : 'bg-card';
  const borderLeft = isToday_ ? 'border-l-2 border-l-primary' : '';

  return (
    <div className={`${bgClass} ${borderLeft}`}>
      {/* Title — for empty days or editing */}
      {(isEmpty || titleEditing) && (
        <div className="px-4 py-3 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Título del día</p>
          <div className="flex items-center gap-2">
            <Input
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              placeholder="¿Qué harás este día?"
              className="flex-1 h-9 text-sm bg-secondary border-border"
              autoFocus={isEmpty}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setTitleEditing(false); }}
            />
            <button onClick={() => setTitleEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            <button onClick={saveTitle} className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></button>
          </div>
        </div>
      )}

      {/* Documents */}
      {dayDocs.length > 0 && (
        <div>
          <div className="px-4 py-1.5 bg-secondary/50 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documentos</p>
          </div>
          {dayDocs.map(doc => (
            <button key={doc.id} onClick={() => setViewingDoc(doc)}
              className="w-full flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-secondary/20 transition-colors text-left">
              {(() => { const I = DOC_ICON_MAP[doc.category || doc.type || doc.doc_type] || FileText; return <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><I size={16} className="text-muted-foreground" /></div>; })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.title}</p>
                {doc.time && <p className="text-xs text-primary font-medium mt-0.5">{doc.time}</p>}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          ))}
        </div>
      )}

      {/* Spots */}
      {spots.length > 0 && (
        <div>
          <div className="px-4 py-1.5 bg-secondary/50 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Spots</p>
          </div>
          <DraggableSpots
            spots={spots}
            onReorder={handleReorder}
            onEdit={setEditingSpot}
          />
        </div>
      )}

      {/* Add spot */}
      <Link to={createPageUrl('Restaurants') + '?trip_id=' + tripId}
        className="flex items-center gap-2 px-4 py-3 border-t border-border hover:bg-accent/20 transition-colors">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-sm text-primary font-medium">Añadir spot</span>
      </Link>

      {/* Notes */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notas del día</p>
        <Textarea
          value={notes}
          onChange={e => { setNotes(e.target.value); setNotesChanged(true); }}
          placeholder={
            isToday_ ? '¿Algo que apuntar para hoy?' :
            isTomorrow_ ? '¿Algo que apuntar para mañana?' :
            '¿Algo que apuntar para este día?'
          }
          className="text-sm bg-card border-border resize-none min-h-[100px] w-full"
          rows={4}
        />
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-muted-foreground shrink-0">Hora</label>
          <input
            type="time"
            value={noteTime}
            onChange={e => { setNoteTime(e.target.value); setNotesChanged(true); }}
            className="h-8 border border-border rounded-lg px-2 text-sm text-foreground bg-card outline-none focus:border-primary flex-1 max-w-[110px]"
          />
          <span className="text-xs text-muted-foreground">opcional</span>
        </div>
        {notesChanged && (
          <button
            onClick={saveNotes}
            className="mt-2 w-full py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
            Guardar nota
          </button>
        )}
      </div>

      {editingSpot && (
        <SpotEditModal
          spot={editingSpot}
          open={!!editingSpot}
          onClose={() => setEditingSpot(null)}
          onSave={handleSpotSave}
          onRemove={handleSpotRemove}
        />
      )}

      {viewingDoc && (
        <DocViewerModal
          doc={viewingDoc}
          open={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────
function DayRow({ day, dateStr, allDocs, allSpots, tripId, cityId, isToday_, isTomorrow_, queryClient, defaultOpen }) {
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

  const rowBg = isToday_
    ? 'bg-orange-50'
    : open ? 'bg-secondary/20' : 'bg-card hover:bg-secondary/10';
  const rowBorder = isToday_ ? 'border-t-2 border-t-primary' : 'border-t border-t-border';

  return (
    <div className={rowBorder}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${rowBg} transition-colors`}>
        <span className={`text-xs font-semibold w-12 shrink-0 text-left ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`}>
          {label}
        </span>
        <span className={`flex-1 text-sm text-left truncate ${
          day?.title
            ? isToday_ ? 'font-semibold text-primary' : 'font-medium text-foreground'
            : 'text-muted-foreground italic'
        }`}>
          {day?.title || 'Sin planificar'}
        </span>
        {isToday_ && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full shrink-0">hoy</span>}
        {isTomorrow_ && open && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">mañana</span>}
        {open
          ? <ChevronUp className={`w-4 h-4 shrink-0 ${isToday_ ? 'text-primary' : 'text-muted-foreground'}`} />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
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
        />
      )}
    </div>
  );
}

// ── City block ────────────────────────────────────────────────────────────────
function CityBlock({ city, idx, total, allDocs, allSpots, itineraryDays, tripId, isActive, isPast, queryClient }) {
  const [open, setOpen] = useState(isActive);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  // Generate all days for this city from start to end date
  const cityDays = useMemo(() => {
    if (!city.start_date || !city.end_date) return [];
    try {
      const start = parseISO(city.start_date);
      const end = parseISO(city.end_date);
      if (end < start) return [];
      return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
    } catch { return []; }
  }, [city]);

  // Map itinerary days by date
  const daysByDate = useMemo(() => {
    const m = {};
    itineraryDays.filter(d => d.city_id === city.id).forEach(d => { if (d.date) m[d.date] = d; });
    return m;
  }, [itineraryDays, city.id]);

  // Transport icon from docs
  const transportIcon = useMemo(() =>
    getTransportIcon(allDocs, city.start_date),
    [allDocs, city.start_date]
  );

  const dotClass = isPast
    ? 'bg-green-700 w-3 h-3'
    : isActive
    ? 'w-3.5 h-3.5 bg-primary border-2 border-background ring-2 ring-primary'
    : 'bg-border w-3 h-3';

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0 pt-3.5">
        <div className={`rounded-full shrink-0 ${dotClass}`} />
        {idx < total - 1 && <div className="w-px bg-border flex-1 min-h-8 mt-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-0 min-w-0 ${idx < total - 1 ? 'pb-0' : ''}`}>
        <div className={`bg-card rounded-2xl border overflow-hidden mb-1 ${
          isActive ? 'border-orange-200' : isPast ? 'border-border opacity-75' : 'border-border'
        }`}>
          {/* City header */}
          <button onClick={() => setOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
              isActive ? 'bg-orange-50' : 'hover:bg-secondary/30'
            }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isPast ? 'bg-green-100 text-green-700' : isActive ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
            }`}>
              {isPast ? '✓' : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {city.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {city.start_date && city.end_date
                  ? `${format(parseISO(city.start_date), 'dd MMM', { locale: es })} – ${format(parseISO(city.end_date), 'dd MMM', { locale: es })}`
                  : city.start_date
                  ? format(parseISO(city.start_date), 'dd MMM yyyy', { locale: es })
                  : 'Sin fechas'}
              </p>
            </div>
            {isPast && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Visitada</span>}
            {isActive && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full shrink-0">Ahora</span>}
            {!isActive && !isPast && <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full shrink-0">Próxima</span>}
            {open
              ? <ChevronUp className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
          </button>

          {/* Days */}
          {open && cityDays.length > 0 && (
            <div>
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
                />
              ))}
            </div>
          )}

          {/* No dates — prompt */}
          {open && cityDays.length === 0 && (
            <div className="px-4 py-4 text-center border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Sin fechas asignadas</p>
              <p className="text-xs text-primary">Edita el viaje para añadir fechas →</p>
            </div>
          )}
        </div>

        {/* Transport connector to next city */}
        {idx < total - 1 && transportIcon && (
          <div className="flex items-center gap-2 px-4 py-1 mb-1">
            <span className="text-sm">{transportIcon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Cities() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

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
              <button className="text-xs text-primary flex items-center gap-1 font-medium">
                <Plus className="w-3.5 h-3.5" />Ciudad
              </button>
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2">Ruta</h1>

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
          <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${tripFinished ? 'bg-green-600' : 'bg-primary'}`}
              style={{ width: `${tripFinished ? 100 : progress}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        {sortedCities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🗺️</p>
            <p className="text-muted-foreground mb-4">Aún no hay ciudades en la ruta</p>
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId + '&open_settings=true'}>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />Añadir ciudad
              </Button>
            </Link>
          </div>
        ) : (
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
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
