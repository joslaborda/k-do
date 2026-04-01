import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, Plane, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import TripTemplates from '@/components/trip/TripTemplates';
import { toast } from '@/components/ui/use-toast';
import TripCard from '@/components/trip/TripCard';

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
    currency: 'EUR'
  });

  const queryClient = useQueryClient();

  // Get current user
  useState(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date')
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const trip = await base44.entities.Trip.create({ ...data, members: [user?.email] });

      // Si hay plantilla seleccionada, crear packing items
      if (selectedTemplate && selectedTemplate.packingItems) {
        const packingPromises = selectedTemplate.packingItems.map((item) =>
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
          description: `${selectedTemplate.packingItems.length} artículos añadidos a tu maleta`
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
        currency: 'EUR'
      });
    }
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
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="bg-orange-700 mx-auto px-6 py-12 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-50 mb-2 text-4xl font-black">Kōdo</h1>
              <p className="text-slate-50 text-lg">Planifica tu próxima aventura</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg" className="bg-green-600 text-primary-foreground px-8 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-primary/90">


              <Plus className="w-5 h-5 mr-2" />
              Nuevo Viaje
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-orange-50 mx-auto px-6 py-12 max-w-6xl">
        {trips.length === 0 ?
        <div className="text-center py-24 glass border-2 border-dashed border-border rounded-3xl">
            <Plane className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Empieza tu aventura!</h2>
            <p className="text-muted-foreground mb-8">Crea tu primer viaje y comienza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Viaje
            </Button>
          </div> :

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const tripCities = allCities.filter(c => c.trip_id === trip.id);
              return (
                <TripCard key={trip.id} trip={trip} cities={tripCities} />
              );
            })}
          </div>
        }
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
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
                className="bg-input border-border text-foreground" />

            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Destino *</label>
                <Input
                  placeholder="ej. Tokio"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País</label>
                <Input
                  placeholder="ej. Japón"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <Textarea
                placeholder="Describe tu viaje..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-input border-border text-foreground" />

            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              <Input
                placeholder="https://..."
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="bg-input border-border text-foreground" />

            </div>

            <div className="pt-4 border-t border-border">
              <TripTemplates onSelect={setSelectedTemplate} />
              {selectedTemplate &&
              <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary flex items-center gap-2">
                    <span>{selectedTemplate.emoji}</span>
                    <span>Plantilla "{selectedTemplate.name}" seleccionada</span>
                  </p>
                </div>
              }
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.name || !formData.destination || !formData.start_date || createMutation.isPending}>

                {createMutation.isPending ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}