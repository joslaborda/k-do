import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Eye, EyeOff, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DocumentForm, { CATEGORY_CONFIG } from '@/components/tickets/DocumentForm';
import DocumentCard from '@/components/tickets/DocumentCard';
import { enrichTicketDataWithAutoLinks, createBackfillMutation } from '@/lib/autoLinkTickets';

const VISIBILITY_FILTERS = [
  { value: 'all',            label: 'Todos',     icon: Filter },
  { value: 'personal',       label: 'Solo yo',   icon: EyeOff },
  { value: 'shared',         label: 'Grupo',     icon: Eye },
  { value: 'selected_users', label: 'Concretos', icon: Users },
];

export default function Documents() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [visFilter, setVisFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const queryClient = useQueryClient();

  const { user: currentUser } = useAuth();
  const currentUserEmail = currentUser?.email ?? '';
  const userId = currentUser?.id ?? '';

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays', tripId],
    queryFn: async () => {
      const days = await base44.entities.ItineraryDay.filter({ trip_id: tripId }, 'date');
      const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));
      return days.map(d => ({ ...d, cityName: cityMap[d.city_id] || '' }));
    },
    enabled: !!tripId && cities.length > 0
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const members = trip?.members || [];

  // Backfill automático de documentos sin vinculación
  useEffect(() => {
    if (tickets.length > 0 && itineraryDays.length > 0) {
      const backfillUpdates = createBackfillMutation(tickets, itineraryDays, cities);
      const ticketsNeedingUpdate = backfillUpdates.filter(u => Object.keys(u.updates).length > 0);
      
      if (ticketsNeedingUpdate.length > 0) {
        ticketsNeedingUpdate.forEach(({ ticketId, updates }) => {
          base44.entities.Ticket.update(ticketId, updates);
        });
        queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      }
    }
  }, [tripId, tickets.length, itineraryDays.length]);

  const createMutation = useMutation({
    mutationFn: (formData) => {
      const enrichedData = enrichTicketDataWithAutoLinks(formData, itineraryDays, formData.city_id);
      return base44.entities.Ticket.create({ ...enrichedData, trip_id: tripId, user_id: userId });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets', tripId] }); setDialogOpen(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => {
      const enrichedData = enrichTicketDataWithAutoLinks(formData, itineraryDays, formData.city_id);
      return base44.entities.Ticket.update(id, enrichedData);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets', tripId] }); setEditingTicket(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  });

  const visibleTickets = tickets.filter(t => {
    const vis = t.visibility || 'personal';
    if (vis === 'personal' && t.created_by !== currentUserEmail && t.user_id !== userId) return false;
    if (vis === 'selected_users' && t.created_by !== currentUserEmail && !(t.shared_with || []).includes(currentUserEmail)) return false;
    if (visFilter !== 'all' && vis !== visFilter) return false;
    if (catFilter !== 'all' && t.category !== catFilter) return false;
    return true;
  });

  const grouped = visibleTickets.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#fdf6ee]">

      {/* ── HERO HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-orange-700 pt-14 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-orange-200 text-sm font-semibold uppercase tracking-widest mb-2">Tu viaje</p>
              <h1 className="text-white text-4xl font-extrabold leading-tight">Documentos</h1>
              <p className="text-orange-100/80 mt-2 text-sm">Vuelos, hoteles, trenes y más — todo en un lugar</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg flex-shrink-0 px-4 py-2 rounded-xl mt-1"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Añadir
            </Button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT — floats over hero ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 pb-20">

        {/* Toolbar card */}
         <div className="bg-white rounded-2xl shadow-md border border-white/60 p-2 mb-8 -translate-y-2.5">
           {/* Category pills - scrollable row */}
           <div className="relative">
           <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-1 border-b border-gray-100 scrollbar-hide">

            <button
              onClick={() => setCatFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${catFilter === 'all' ? 'bg-orange-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
               const Icon = cfg.icon;
               const active = catFilter === key;
               return (
                 <button
                   key={key}
                   onClick={() => setCatFilter(active ? 'all' : key)}
                   className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${active ? `${cfg.bg} ${cfg.text} shadow-sm` : 'text-gray-500 hover:bg-gray-100'}`}
                 >
                   <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                   <span>{cfg.label}</span>
                 </button>
               );
             })}
          </div>

           </div>
           <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white pointer-events-none"/>
           </div>
          {/* Visibility filters - scrollable row */}
          <div className="relative"><div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-hide">
            {VISIBILITY_FILTERS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setVisFilter(f.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${visFilter === f.value ? 'bg-orange-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {visibleTickets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10 text-orange-400" />
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1">Sin documentos todavía</p>
            <p className="text-sm text-gray-400 mb-6">Sube un PDF o imagen y la IA lo identificará automáticamente</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 rounded-xl px-6 font-bold shadow">
              <Plus className="w-4 h-4 mr-2" />
              Añadir documento
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const items = grouped[key];
              if (!items?.length) return null;
              const Icon = cfg.icon;
              return (
                <section key={key}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                    </div>
                    <h2 className="text-lg font-extrabold text-gray-800">{cfg.label}</h2>
                    <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  {/* Cards grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {items.map(ticket => (
                      <DocumentCard
                        key={ticket.id}
                        ticket={ticket}
                        onEdit={(t) => setEditingTicket(t)}
                        onDelete={(t) => { setTicketToDelete(t); setDeleteDialogOpen(true); }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DIALOGS (sin cambios) ────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-extrabold">Añadir documento</DialogTitle>
          </DialogHeader>
          <DocumentForm cities={cities} itineraryDays={itineraryDays} members={members}
            onSave={(data) => createMutation.mutate(data)} onCancel={() => setDialogOpen(false)} saving={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTicket} onOpenChange={(open) => { if (!open) setEditingTicket(null); }}>
        <DialogContent className="bg-white max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-extrabold">Editar documento</DialogTitle>
          </DialogHeader>
          {editingTicket && (
            <DocumentForm cities={cities} itineraryDays={itineraryDays} members={members}
              initialData={editingTicket} onSave={(data) => updateMutation.mutate({ id: editingTicket.id, formData: data })}
              onCancel={() => setEditingTicket(null)} saving={updateMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar "{ticketToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(ticketToDelete.id)} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}