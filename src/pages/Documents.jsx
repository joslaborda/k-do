import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotification } from '@/lib/notifications';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PlaneIcon, Hotel, TrainFront, BusFront, Car, Ticket, Shield, FileText } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DocumentForm from '@/components/tickets/DocumentForm';
import PDFViewer from '@/components/PDFViewer';
import { enrichTicketDataWithAutoLinks, createBackfillMutation } from '@/lib/autoLinkTickets';

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


const DOC_ICONS = {
  flight:    PlaneIcon,
  train:     TrainFront,
  hotel:     Hotel,
  bus:       BusFront,
  car:       Car,
  event:     Ticket,
  personal:  Shield,
  insurance: Shield,
  other:     FileText,
};
const DOC_BG = { flight:'bg-blue-50', train:'bg-green-50', hotel:'bg-purple-50', event:'bg-orange-50', personal:'bg-amber-50', other:'bg-secondary' };
const ICON_BG = {
  flight:    'bg-blue-50 dark:bg-blue-950/30 text-blue-500',
  train:     'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
  hotel:     'bg-purple-50 dark:bg-purple-950/30 text-purple-500',
  bus:       'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
  car:       'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
  event:     'bg-orange-50 dark:bg-orange-950/30 text-primary',
  personal:  'bg-secondary text-muted-foreground',
  insurance: 'bg-secondary text-muted-foreground',
  other:     'bg-secondary text-muted-foreground',
};
const CAT_TABS = [
  { key:'all',    icon:'📋', label:'Todos'   },
  { key:'flight', icon:'✈️', label:'Vuelos'  },
  { key:'hotel',  icon:'🏨', label:'Hoteles' },
  { key:'train',  icon:'🚆', label:'Trenes'  },
  { key:'other',  icon:'📄', label:'Otros'   },
];
const VIS = {
  personal:       { label:'Solo yo',    icon:'🔒', cls:'bg-secondary text-muted-foreground' },
  shared:         { label:'Grupo',      icon:'👥', cls:'bg-green-100 text-green-700'       },
  selected_users: { label:'Compartido', icon:'👤', cls:'bg-blue-100 text-blue-700'         },
};

// ── Doc row ───────────────────────────────────────────────────────────────────
function DocRow({ ticket, onEdit, onDelete, onView }) {
  const [open, setOpen] = useState(false);
  const cat  = ticket.category || 'other';
  const IconComp = DOC_ICONS[cat] || DOC_ICONS.other;
  const iconCls = ICON_BG[cat] || ICON_BG.other;
  const bg   = DOC_BG[cat]   || 'bg-secondary';
  const vis  = VIS[ticket.visibility || 'personal'];
  const todayDoc = ticket.date && isToday(parseISO(ticket.date));
  const hasFile  = !!ticket.file_url;

  const displayName = ticket.name || (ticket.origin && ticket.destination
    ? `${ticket.origin} → ${ticket.destination}`
    : 'Sin nombre');
  const routeLabel = ticket.origin && ticket.destination
    ? `${ticket.origin} → ${ticket.destination}`
    : null;

  const timeLabel = ticket.time
    ? ticket.time
    : cat === 'hotel' && ticket.date
    ? `Check-in ${format(parseISO(ticket.date), 'dd MMM', { locale: es })}`
    : null;

  return (
    <div className={`bg-card rounded-xl overflow-hidden mb-2 border transition-all ${todayDoc ? 'border-orange-200' : 'border-border'}`}>
      {/* Main row */}
      <div className={`flex items-center gap-3 px-4 py-3 ${todayDoc ? 'bg-orange-50/40' : ''}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
          <IconComp size={16} className="flex-shrink-0" />
        </div>
        <button onClick={() => hasFile && onView(ticket.file_url)} className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{displayName}</p>
          {routeLabel && <p className="text-xs text-muted-foreground mt-0.5">{routeLabel}</p>}
          {timeLabel && <p className="text-xs text-primary font-semibold mt-0.5">{timeLabel}</p>}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasFile && (
            <button onClick={() => onView(ticket.file_url)}
              className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center hover:bg-orange-100 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          )}
          <button onClick={() => onEdit(ticket)}
            className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-secondary/50 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border">
          <div className="px-4 py-3 bg-secondary/20 space-y-2">
            {/* Visibility badge */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${vis.cls}`}>
              {vis.icon} {vis.label}
            </span>

            {/* Fields */}
            {ticket.origin && ticket.destination && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Ruta</span><span className="text-foreground">{ticket.origin} → {ticket.destination}</span></div>
            )}
            {ticket.date && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Fecha</span><span className="text-foreground">{format(parseISO(ticket.date), 'dd MMM yyyy', { locale: es })}</span></div>
            )}
            {ticket.end_date && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Fin</span><span className="text-foreground">{format(parseISO(ticket.end_date), 'dd MMM yyyy', { locale: es })}</span></div>
            )}
            {ticket.airline && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Vuelo</span><span className="text-foreground">{ticket.airline}</span></div>
            )}
            {ticket.city && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Ciudad</span><span className="text-foreground">{ticket.city}</span></div>
            )}
            {ticket.notes && (
              <div className="flex gap-2 text-xs"><span className="text-muted-foreground w-12 shrink-0">Notas</span><span className="text-foreground">{ticket.notes}</span></div>
            )}

            {/* File */}
            {hasFile && (
              <button onClick={() => onView(ticket.file_url)}
                className="w-full flex items-center gap-3 px-3 py-2 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors text-left mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="text-xs font-medium text-foreground flex-1">Ver documento adjunto</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card">
            <button onClick={() => onDelete(ticket)}
              className="text-xs text-red-500 flex items-center gap-1.5 hover:text-red-700 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Eliminar
            </button>
            <button onClick={() => { onEdit(ticket); setOpen(false); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground flex items-center gap-1.5 hover:bg-secondary/50 transition-colors">
              <Pencil className="w-3 h-3" />Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Documents() {
  const tripId = new URLSearchParams(window.location.search).get('trip_id');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const currentUserEmail = currentUser?.email ?? '';
  const userId = currentUser?.id ?? '';

  const [catFilter, setCatFilter]   = useState('all');
  const [addOpen, setAddOpen]       = useState(false);
  const [editDoc, setEditDoc]       = useState(null);
  const [deleteDoc, setDeleteDoc]   = useState(null);
  const [viewFile, setViewFile]     = useState(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId, staleTime: 0,  // always fresh so new members see docs immediately
  });
  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }),
    enabled: !!tripId, staleTime: 60000,
  });
  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: () => base44.entities.ItineraryDay.filter({ trip_id: tripId }, 'date'),
    enabled: !!tripId, staleTime: 30000,
  });
  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId, staleTime: 60000,
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Backfill auto-links
  useEffect(() => {
    if (!tickets.length || !itineraryDays.length) return;
    const updates = createBackfillMutation(tickets, itineraryDays, cities).filter(u => Object.keys(u.updates).length > 0);
    if (updates.length) {
      Promise.all(updates.map(({ ticketId, updates }) => base44.entities.Ticket.update(ticketId, updates)))
        .then(() => queryClient.invalidateQueries({ queryKey: ['tickets', tripId] }));
    }
  }, [tripId, tickets.length, itineraryDays.length]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create({ ...enrichTicketDataWithAutoLinks(data, itineraryDays, data.city_id), trip_id: tripId, user_id: userId }),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setAddOpen(false);
      const myProf = profiles.find(pr => pr.email === currentUserEmail || pr.user_email === currentUserEmail);
      const others = (trip?.members || []).filter(e => e !== currentUserEmail);
      others.forEach(memberEmail => {
        const p = profiles.find(pr => pr.email === memberEmail || pr.user_email === memberEmail);
        if (p?.user_id) createNotification({
          userId: p.user_id,
          type: 'doc_added',
          actorProfile: myProf,
          refId: tripId,
          refTitle: trip?.name || 'el viaje',
          message: `ha subido un documento: ${data.name || 'nuevo doc'}`,
        });
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, enrichTicketDataWithAutoLinks(data, itineraryDays, data.city_id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets', tripId] }); setEditDoc(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets', tripId] }); setDeleteDoc(null); },
  });

  // Filter
  const filtered = useMemo(() => tickets.filter(t => {
    const vis = t.visibility || 'personal';
    const isOwner = t.created_by === currentUserEmail || t.user_id === userId;
    // personal: only owner sees it
    if (vis === 'personal' && !isOwner) return false;
    // selected_users: owner or explicitly shared
    if (vis === 'selected_users' && !isOwner && !(t.shared_with || []).includes(currentUserEmail)) return false;
    // shared: all trip members — no extra check needed
    if (catFilter !== 'all') {
      if (catFilter === 'other') return !['flight','hotel','train'].includes(t.category);
      return t.category === catFilter;
    }
    return true;
  }), [tickets, catFilter, currentUserEmail, userId]);

  // Group by date
  const grouped = useMemo(() => {
    const todayStr    = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
    const map = {};
    [...filtered]
      .sort((a, b) => ((a.date||'9999') < (b.date||'9999') ? -1 : (a.date||'9999') > (b.date||'9999') ? 1 : (a.time||'99:99').localeCompare(b.time||'99:99')))
      .forEach(t => { const k = t.date || '__none__'; (map[k] = map[k] || []).push(t); });

    return Object.entries(map).map(([date, items]) => ({
      date, items,
      isToday: date === todayStr,
      label: date === '__none__' ? 'Sin fecha'
        : date === todayStr    ? `Hoy · ${format(parseISO(date), 'dd MMM', { locale: es })}`
        : date === tomorrowStr ? `Mañana · ${format(parseISO(date), 'dd MMM', { locale: es })}`
        : format(parseISO(date), "dd MMM · eeee", { locale: es }),
    }));
  }, [filtered]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const members = trip?.members || [];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />Documento
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Documentos</h1>
          {/* Category tabs */}
          <OTabBar
              tabs={CAT_TABS.map(t => ({key:t.key,label:t.label}))}
              activeKey={catFilter}
              onChange={setCatFilter}
            />
      </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        {grouped.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border text-center py-16 px-6">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm font-medium text-foreground mb-1">{catFilter === 'all' ? 'Sin documentos todavía' : 'Sin documentos en esta categoría'}</p>
            <p className="text-xs text-muted-foreground mb-5">Sube vuelos, hoteles, entradas y todo lo que necesites tener a mano</p>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />Añadir documento
            </button>
          </div>
        ) : grouped.map(({ date, label, items, isToday }) => (
          <div key={date} className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 px-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
            {items.map(t => (
              <DocRow key={t.id} ticket={t} onEdit={setEditDoc} onDelete={setDeleteDoc} onView={setViewFile} />
            ))}
          </div>
        ))}
      </div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-base font-semibold">Añadir documento</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 overflow-y-auto flex-1">
            <DocumentForm cities={cities} itineraryDays={itineraryDays} members={members} profiles={profiles} tripCities={cities}
              onSave={(d) => createMutation.mutate(d)} onCancel={() => setAddOpen(false)} saving={createMutation.isPending} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editDoc} onOpenChange={(o) => { if (!o) setEditDoc(null); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-base font-semibold">Editar documento</DialogTitle>
          </DialogHeader>
          {editDoc && (
            <div className="px-5 py-4 overflow-y-auto flex-1">
              <DocumentForm cities={cities} itineraryDays={itineraryDays} members={members} profiles={profiles} tripCities={cities}
                initialData={editDoc}
                onSave={(d) => updateMutation.mutate({ id: editDoc.id, data: d })}
                onCancel={() => setEditDoc(null)} saving={updateMutation.isPending} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={(o) => { if (!o) setDeleteDoc(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>¿Seguro que quieres eliminar "{deleteDoc?.name}"? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteDoc.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File viewer */}
      <PDFViewer fileUrl={viewFile} onClose={() => setViewFile(null)} />
    </div>
  );
}