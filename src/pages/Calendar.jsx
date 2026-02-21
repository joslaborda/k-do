import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plane, Train, Hotel, Ticket as TicketIcon, Shield, Plus, Trash2, Calendar as CalendarIcon, FileText, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryConfig = {
  flight: { label: 'Vuelo', icon: Plane, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  train: { label: 'Tren', icon: Train, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  hotel: { label: 'Hotel', icon: Hotel, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  freetour: { label: 'Free Tour', icon: TicketIcon, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  insurance: { label: 'Seguro', icon: Shield, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  personal: { label: 'Personal', icon: FileText, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
};

export default function Calendar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'flight',
    date: '',
    notes: '',
    file_url: ''
  });

  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setDialogOpen(false);
      setFormData({ name: '', category: 'flight', date: '', notes: '', file_url: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setEditDialogOpen(false);
      setEditingTicket(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
  });

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setEditDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.category]) acc[ticket.category] = [];
    acc[ticket.category].push(ticket);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-orange-50">
       {/* Header con caja naranja */}
       <div className="bg-orange-700 pt-12 pb-20">
         <div className="max-w-6xl mx-auto px-6">
           <h1 className="text-white text-4xl font-bold">Documentos ✈️</h1>
           <p className="text-white/90 mt-2">Vuelos, trenes, hoteles y más</p>
         </div>
       </div>

      {/* Content */}
      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-6xl -mt-12">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700">

            <Plus className="w-4 h-4 mr-2" />
            Añadir documento
          </Button>
        </div>

        {tickets.length === 0 ?
        <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground">No hay documentos todavía</p>
          </div> :

        <div className="space-y-8">
            {Object.entries(categoryConfig).map(([key, config]) => {
            const categoryTickets = groupedTickets[key] || [];
            if (categoryTickets.length === 0) return null;

            const Icon = config.icon;

            return (
              <div key={key}>
                  <div className="flex items-center gap-3 mb-4">
                     <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center`}>
                       <Icon className="w-5 h-5 text-white" />
                     </div>
                     <h2 className="text-xl font-bold text-foreground">
                       {config.label}
                     </h2>
                     <Badge variant="secondary" className="bg-orange-300 text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80">{categoryTickets.length}</Badge>
                   </div>

                   <div className="grid md:grid-cols-2 gap-4">
                     {categoryTickets.map((ticket) =>
                  <div
                    key={ticket.id} className="bg-zinc-50 p-6 rounded-2xl glass border-2 border-border/50 hover:shadow-xl hover:border-primary/50 transition-all">


                         <div className="flex items-start justify-between mb-4">
                           <div className="flex-1">
                             <h3 className="font-bold text-foreground text-lg mb-1">
                               {ticket.name}
                             </h3>
                             {ticket.date &&
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <CalendarIcon className="w-4 h-4" />
                                 {format(new Date(ticket.date), "d 'de' MMMM yyyy", { locale: es })}
                               </div>
                        }
                           </div>
                           <div className="flex gap-1">
                             <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ticket)}
                          className="text-muted-foreground hover:text-primary hover:bg-secondary"
                          aria-label="Editar">

                               <Pencil className="w-4 h-4" />
                             </Button>
                             <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(ticket.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-secondary"
                          aria-label="Eliminar">

                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         </div>

                         {ticket.notes &&
                    <p className="text-sm text-muted-foreground mb-4">{ticket.notes}</p>
                    }

                        {ticket.file_url &&
                    <a
                      href={ticket.file_url}
                      target="_blank"
                      rel="noopener noreferrer" className="bg-orange-100 text-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors">


                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">Ver documento</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </a>
                    }
                      </div>
                  )}
                  </div>
                </div>);

          })}
          </div>
        }

        {/* Add Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Añadir documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre</label>
                <Input
                  placeholder="ej. Vuelo Madrid - Tokyo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

                </div>
                <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>);

                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-input border-border text-foreground" />

                </div>
                <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Archivo</label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="bg-input border-border text-foreground" />

                  {uploadingFile && <p className="text-xs text-muted-foreground mt-1">Subiendo archivo...</p>}
                  {formData.file_url && <p className="text-xs text-green-400 mt-1">✓ Archivo subido</p>}
                  </div>
                  <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Notas (opcional)</label>
                  <Textarea
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                  Cancelar
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!formData.name.trim() || createMutation.isPending}>

                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar documento</DialogTitle>
            </DialogHeader>
            {editingTicket &&
            <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre</label>
                  <Input
                  placeholder="ej. Vuelo Madrid - Tokyo"
                  defaultValue={editingTicket.name}
                  onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

                  </div>
                  <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Categoría</label>
                  <Select
                  value={editingTicket.category}
                  onValueChange={(v) => setEditingTicket({ ...editingTicket, category: v })}>

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {config.label}
                            </div>
                          </SelectItem>);

                    })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
                  <Input
                  type="date"
                  value={editingTicket.date || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, date: e.target.value })}
                  className="bg-input border-border text-foreground" />

                  </div>
                  <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Notas (opcional)</label>
                  <Textarea
                  placeholder="Notas adicionales..."
                  value={editingTicket.notes || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, notes: e.target.value })}
                  rows={3}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                    Cancelar
                  </Button>
                  <Button
                  onClick={() => updateMutation.mutate({
                    id: editingTicket.id,
                    data: {
                      name: editingTicket.name,
                      category: editingTicket.category,
                      date: editingTicket.date,
                      notes: editingTicket.notes
                    }
                  })}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!editingTicket.name?.trim() || updateMutation.isPending}>

                    {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>
            }
          </DialogContent>
        </Dialog>
      </div>
    </div>);

}