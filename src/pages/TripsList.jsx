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
      <div className="bg-orange-700 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight">Kōdo</h1>
            <p className="text-white/90 text-base font-medium mt-0.5">Travel your way</p>
            <p className="text-white/60 text-sm mt-1">Tu próximo viaje empieza aquí</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-5 shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Crear viaje
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-orange-50 mx-auto px-6 py-8 max-w-6xl">
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Aún no tienes viajes</h2>
            <p className="text-muted-foreground text-sm mb-6">Crea tu primer viaje y empieza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Crear tu primer viaje
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Tus viajes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.map((trip) => {
                const tripCities = allCities.filter(c => c.trip_id === trip.id);
                return <TripCard key={trip.id} trip={trip} cities={tripCities} />;
              })}
            </div>
          </>
        )}
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