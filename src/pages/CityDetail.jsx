import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { 
  ArrowLeft, Plus, Calendar, ChevronDown, ChevronUp, 
  Edit2, Trash2, Save, X, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const cityImages = {
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1600',
  'Hiroshima': 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=1600',
  'Hakone': 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=1600',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600'
};

export default function CityDetail() {
   const urlParams = new URLSearchParams(window.location.search);
   const cityId = urlParams.get('id');
   const tripId = urlParams.get('trip_id');

   const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  const [formData, setFormData] = useState({ title: '', date: '', content: '' });
  
  const queryClient = useQueryClient();

  const { data: city } = useQuery({
    queryKey: ['city', cityId],
    queryFn: async () => {
      const cities = await base44.entities.City.filter({ id: cityId });
      return cities[0];
    },
    enabled: !!cityId,
  });

  const { data: days = [], isLoading } = useQuery({
    queryKey: ['itineraryDays', cityId],
    queryFn: () => base44.entities.ItineraryDay.filter({ city_id: cityId }, 'order'),
    enabled: !!cityId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ItineraryDay.create({
      ...data,
      city_id: cityId,
      trip_id: tripId,
      order: days.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDialogOpen(false);
      setFormData({ title: '', date: '', content: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ItineraryDay.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDialogOpen(false);
      setEditingDay(null);
      setFormData({ title: '', date: '', content: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ItineraryDay.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDeleteDialogOpen(false);
      setDayToDelete(null);
    }
  });

  const handleDeleteClick = (day) => {
    setDayToDelete(day);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dayToDelete) {
      deleteMutation.mutate(dayToDelete.id);
    }
  };

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const openEditDialog = (day) => {
    setEditingDay(day);
    setFormData({
      title: day.title,
      date: day.date || '',
      content: day.content || ''
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDay(null);
    setFormData({ title: '', date: '', content: '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingDay) {
      updateMutation.mutate({ id: editingDay.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (!city) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={city.image_url || cityImages[city.name] || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600'}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-6 left-6">
           <Link
             to={createPageUrl(`Cities?trip_id=${tripId}`)}
             className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
           >
             <ArrowLeft className="w-4 h-4" />
             Back
           </Link>
         </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>Japan</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{city.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-12 md:pb-6">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-semibold text-foreground">Itinerario</h2>
           <Button onClick={openNewDialog} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Día
          </Button>
        </div>

        {isLoading ? (
           <div className="space-y-4">
             {[1, 2].map((i) => (
               <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
             ))}
           </div>
         ) : days.length === 0 ? (
           <div className="text-center py-16 glass border-2 border-dashed border-border rounded-2xl">
             <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-medium text-foreground mb-2">Sin itinerario todavía</h3>
             <p className="text-muted-foreground mb-4">Empieza a planificar tus días en {city.name}</p>
             <Button onClick={openNewDialog} className="bg-green-600 hover:bg-green-700">
               <Plus className="w-4 h-4 mr-2" />
               Añadir primer día
             </Button>
           </div>
        ) : (
          <div className="space-y-4">
            {days.map((day, index) => (
              <Collapsible
                key={day.id}
                open={expandedDays[day.id]}
                onOpenChange={() => toggleDay(day.id)}
              >
                <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <CollapsibleTrigger className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{day.title}</h3>
                          {day.date && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(day.date), 'EEEE, MMMM d')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(day);
                          }}
                          aria-label="Editar día"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(day);
                          }}
                          aria-label="Eliminar día"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expandedDays[day.id] ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-0 border-t border-border bg-white/50">
                        <div className="prose prose-sm max-w-none pt-4 text-foreground [&>*]:text-foreground">
                        <ReactMarkdown>{day.content || 'No details added yet.'}</ReactMarkdown>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
           <DialogHeader>
             <DialogTitle className="text-foreground">{editingDay ? 'Editar Día' : 'Añadir Nuevo Día'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-4">
             <div>
               <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="ej. Llegada + Dotonbori nocturno"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Detalles (soporta Markdown)
              </label>
              <Textarea
                placeholder="Añade los detalles del itinerario aquí..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.title.trim() || updateMutation.isPending || createMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {(updateMutation.isPending || createMutation.isPending) 
                  ? 'Guardando...' 
                  : editingDay ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar día?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{dayToDelete?.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}