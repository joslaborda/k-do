import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, Plane, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import TripTemplates from '@/components/trip/TripTemplates';
import { toast } from '@/components/ui/use-toast';

export default function TripsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    country: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_image: '',
    currency: 'EUR',
  });

  const queryClient = useQueryClient();

  // Get current user
  useState(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const trip = await base44.entities.Trip.create({ ...data, members: [user?.email] });
      
      // Si hay plantilla seleccionada, crear packing items
      if (selectedTemplate && selectedTemplate.packingItems) {
        const packingPromises = selectedTemplate.packingItems.map(item =>
          base44.entities.PackingItem.create({
            ...item,
            trip_id: trip.id,
            user_id: user?.id,
            packed: false
          })
        );
        await Promise.all(packingPromises);
        toast({
          title: "¡Viaje creado! 🎉",
          description: `${selectedTemplate.packingItems.length} artículos añadidos a tu maleta`,
        });
      }
      
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setDialogOpen(false);
      setSelectedTemplate(null);
      setFormData({
        name: '',
        destination: '',
        country: '',
        start_date: '',
        end_date: '',
        description: '',
        cover_image: '',
        currency: 'EUR',
      });
    },
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">🌸 Kōdo</h1>
              <p className="text-lg text-muted-foreground">Planifica tus aventuras</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Viaje
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {trips.length === 0 ? (
          <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
            <Plane className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Empieza tu aventura!</h2>
            <p className="text-muted-foreground mb-8">Crea tu primer viaje y comienza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Viaje
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} to={createPageUrl(`TripDetail?id=${trip.id}`)}>
                <div className="glass border-2 border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-primary to-orange-600 relative overflow-hidden">
                    {trip.cover_image ? (
                      <img 
                        src={trip.cover_image} 
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🗺️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{trip.name}</h3>
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.destination}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      {trip.start_date && format(new Date(trip.start_date), 'dd MMM', { locale: es })}
                      {trip.end_date && ` - ${format(new Date(trip.end_date), 'dd MMM yyyy', { locale: es })}`}
                    </div>
                    
                    {trip.description && (
                      <p className="text-sm text-foreground line-clamp-2 mb-4">
                        {trip.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {trip.members?.length || 1} viajero{(trip.members?.length || 1) > 1 ? 's' : ''}
                      </div>
                      <span className="text-xs px-2 py-1 bg-secondary rounded-full text-foreground">
                        {trip.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">✈️ Nuevo Viaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
              <Input
                placeholder="ej. Japón 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label>
                <Input
                  placeholder="ej. Tokio"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País</label>
                <Input
                  placeholder="ej. Japón"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <Textarea
                placeholder="Describe tu viaje..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              <Input
                placeholder="https://..."
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <TripTemplates onSelect={setSelectedTemplate} />
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary flex items-center gap-2">
                    <span>{selectedTemplate.emoji}</span>
                    <span>Plantilla "{selectedTemplate.name}" seleccionada</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.name || !formData.destination || !formData.start_date || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}