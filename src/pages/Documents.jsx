import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Eye, EyeOff, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DocumentForm, { CATEGORY_CONFIG } from '@/components/tickets/DocumentForm';
import DocumentCard from '@/components/tickets/DocumentCard';

const VISIBILITY_FILTERS = [
  { value: 'all',            label: 'Todos',   icon: Filter },
  { value: 'personal',       label: 'Solo yo', icon: EyeOff },
  { value: 'shared',         label: 'Grupo',   icon: Eye },
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
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const u = await base44.auth.me();
      setCurrentUserEmail(u.email);
      setUserId(u.id);
      return u;
    }
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', tripId],
    queryFn: () => base44.entities.City.filter({ trip_id: tripId }, 'order'),
    enabled: !!tripId
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
    enabled: !!tripId
  });

  const members = trip?.members || [];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create({ ...data, trip_id: tripId, user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setEditingTicket(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', tripId] });
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  });

  // Visibility filter
  const visibleTickets = tickets.filter(t => {
    const vis = t.visibility || 'personal';
    if (vis === 'personal' && t.created_by !== currentUserEmail && t.user_id !== userId) return false;
    if (vis === 'selected_users' && t.created_by !== currentUserEmail && !(t.shared_with || []).includes(currentUserEmail)) return false;
    if (visFilter !== 'all' && vis !== visFilter) return false;
    if (catFilter !== 'all' && t.category !== catFilter) return false;
    return true;
  });

  // Group by category
  const grouped = visibleTickets.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Documentos ✈️</h1>
          <p className="text-white/90 mt-1">Inteligente, contextual y colaborativo</p>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-6xl -mt-12">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            <button
              onClick={() => setCatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${catFilter === 'all' ? 'bg-orange-700 text-white' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setCatFilter(catFilter === key ? 'all' : key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${catFilter === key ? `${cfg.bg} ${cfg.text} border ${cfg.border}` : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Visibility filter */}
          <div className="flex items-center gap-1 border-l border-border pl-3">
            {VISIBILITY_FILTERS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setVisFilter(f.value)}
                  title={f.label}
                  className={`p-1.5 rounded-lg transition-all ${visFilter === f.value ? 'bg-orange-700 text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </Button>
        </div>

        {/* Empty state */}
        {visibleTickets.length === 0 ? (
          <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Sin documentos todavía</p>
            <p className="text-sm text-muted-foreground mb-5">Sube un PDF o imagen y la IA lo identificará automáticamente</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800">
              <Plus className="w-4 h-4 mr-2" />
              Añadir documento
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const items = grouped[key];
              if (!items?.length) return null;
              const Icon = cfg.icon;
              return (
                <div key={key}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{cfg.label}</h2>
                    <span className="text-xs bg-orange-200 text-orange-800 font-semibold px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir documento</DialogTitle>
          </DialogHeader>
          <DocumentForm
            cities={cities}
            itineraryDays={itineraryDays}
            members={members}
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setDialogOpen(false)}
            saving={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTicket} onOpenChange={(open) => { if (!open) setEditingTicket(null); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar documento</DialogTitle>
          </DialogHeader>
          {editingTicket && (
            <DocumentForm
              cities={cities}
              itineraryDays={itineraryDays}
              members={members}
              initialData={editingTicket}
              onSave={(data) => updateMutation.mutate({ id: editingTicket.id, data })}
              onCancel={() => setEditingTicket(null)}
              saving={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar "{ticketToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(ticketToDelete.id)} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}