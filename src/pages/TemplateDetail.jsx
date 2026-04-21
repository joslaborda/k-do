import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, MapPin, Calendar, Copy, CheckCircle, Heart, Share2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { differenceInDays } from 'date-fns';

export default function TemplateDetail() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneData, setCloneData] = useState({
    name: '',
    start_date: '',
    nights: 7
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Obtener template
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      return base44.entities.ItineraryTemplate.get(templateId);
    },
    enabled: !!templateId
  });

  // Validar acceso
  const canAccess = () => {
    if (!template) return false;
    if (template.visibility === 'public') return true;
    if (template.visibility === 'unlisted') return true; // accesible por link
    if (template.visibility === 'private') {
      return currentUser?.id === template.created_by_user_id;
    }
    return false;
  };

  // Query para colección del usuario (para guardar)
  const { data: myCollection } = useQuery({
    queryKey: ['myCollection', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const results = await base44.entities.Collection.filter({
        owner_user_id: currentUser.id,
        name: 'Guardados'
      });
      return results[0] || null;
    },
    enabled: !!currentUser?.id
  });

  const isSaved =
    myCollection &&
    myCollection.template_ids &&
    myCollection.template_ids.includes(templateId);

  // Mutation para guardar/quitar
  const saveMutation = useMutation({
    mutationFn: async (save) => {
      if (!myCollection) {
        // Crear colección si no existe
        const newCollection = await base44.entities.Collection.create({
          owner_user_id: currentUser.id,
          name: 'Guardados',
          template_ids: [templateId]
        });
        return newCollection;
      } else {
        // Actualizar colección
        const updated = { ...myCollection };
        if (save) {
          if (!updated.template_ids) updated.template_ids = [];
          if (!updated.template_ids.includes(templateId)) {
            updated.template_ids.push(templateId);
          }
        } else {
          updated.template_ids = updated.template_ids.filter((id) => id !== templateId);
        }
        await base44.entities.Collection.update(myCollection.id, {
          template_ids: updated.template_ids
        });
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCollection', currentUser?.id] });
      toast({
        title: isSaved ? 'Removido de guardados' : 'Guardado ✓',
        description: isSaved
          ? 'Se removió de tu colección'
          : 'Añadido a tu colección de guardados'
      });
    }
  });

  // Mutation para clonar
  const cloneMutation = useMutation({
    mutationFn: async () => {
      if (!template || !cloneData.name || !cloneData.start_date) {
        throw new Error('Faltan datos requeridos');
      }

      // Calcular end_date
      const startDate = new Date(cloneData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(cloneData.nights));

      // Crear Trip
      const newTrip = await base44.entities.Trip.create({
        name: cloneData.name,
        destination: template.cities?.[0] || template.title,
        country: template.countries?.[0] || '',
        start_date: cloneData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        description: template.summary || '',
        cover_image: template.cover_image || '',
        members: [currentUser.email],
        roles: { [currentUser.email]: 'admin' },
        currency: 'EUR'
      });

      // Crear Cities
      if (template.cities && template.cities.length > 0) {
        const nights = parseInt(cloneData.nights);
        const nightsPerCity = Math.floor(nights / template.cities.length);
        const extraNights = nights % template.cities.length;

        for (let i = 0; i < template.cities.length; i++) {
          const cityStart = new Date(cloneData.start_date);
          cityStart.setDate(
            cityStart.getDate() + i * nightsPerCity + Math.min(i, extraNights)
          );

          const cityEnd = new Date(cityStart);
          cityEnd.setDate(
            cityEnd.getDate() + nightsPerCity + (i < extraNights ? 1 : 0) - 1
          );

          const country = template.countries?.[i] || template.countries?.[0] || '';

          await base44.entities.City.create({
            trip_id: newTrip.id,
            name: template.cities[i],
            country: country,
            order: i,
            start_date: cityStart.toISOString().split('T')[0],
            end_date: cityEnd.toISOString().split('T')[0]
          });
        }
      }

      return newTrip;
    },
    onSuccess: (newTrip) => {
      toast({
        title: '✨ Viaje creado',
        description: 'Redirigiendo a tu nuevo viaje...'
      });
      setTimeout(() => {
        navigate(createPageUrl(`Home?trip_id=${newTrip.id}`));
      }, 1000);
    }
  });

  const handleSaveToggle = () => {
    if (!currentUser) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Inicia sesión para guardar itinerarios'
      });
      return;
    }
    saveMutation.mutate(!isSaved);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/TemplateDetail?id=${templateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Enlace copiado' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-700" />
      </div>
    );
  }

  if (error || !template || !canAccess()) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {!template ? 'Itinerario no encontrado' : 'No tienes acceso'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {!template
              ? 'El itinerario que buscas no existe'
              : template.visibility === 'private'
              ? 'Este itinerario es privado y solo su creador puede verlo'
              : 'No tienes permiso para acceder a este itinerario'}
          </p>
          <Button onClick={() => navigate(createPageUrl('Explore'))} className="bg-orange-700">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Volver a Explorar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        {template.cover_image && (
          <img
            src={template.cover_image}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Button
            onClick={() => navigate(createPageUrl('Explore'))}
            variant="ghost"
            className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Volver
          </Button>
          <div className="flex gap-2">
            {(template.visibility === 'unlisted' || template.visibility === 'public') && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyLink}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveToggle}
              disabled={saveMutation.isPending || !currentUser}
              className={`bg-white/20 backdrop-blur hover:bg-white/30 ${
                isSaved ? 'text-red-400' : 'text-white'
              }`}
            >
              <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-4xl font-bold text-white">{template.title}</h1>
          {template.summary && (
            <p className="text-white/90 mt-2 line-clamp-2">{template.summary}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Duración</p>
            <p className="text-2xl font-bold text-foreground">{template.duration_days} días</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Ciudades</p>
            <p className="text-2xl font-bold text-foreground">{template.cities?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border md:col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Países</p>
            <p className="text-sm font-medium text-foreground flex flex-wrap gap-1">
              {template.countries?.join(', ') || 'N/A'}
            </p>
          </div>
        </div>

        {/* Cities List */}
        {template.cities && template.cities.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Ruta</h2>
            <div className="space-y-2">
              {template.cities.map((city, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-700 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{city}</p>
                    {template.countries?.[idx] && (
                      <p className="text-sm text-muted-foreground">{template.countries[idx]}</p>
                    )}
                  </div>
                  {idx < template.cities.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => setCloneDialogOpen(true)}
            disabled={!currentUser || cloneMutation.isPending}
            className="bg-orange-700 hover:bg-orange-800 text-white font-bold h-12"
          >
            {cloneMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando viaje...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Usar Este Itinerario
              </>
            )}
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Crear viaje desde este itinerario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Nombre del viaje *
              </label>
              <Input
                placeholder="ej. Mi primer viaje..."
                value={cloneData.name}
                onChange={(e) => setCloneData({ ...cloneData, name: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Fecha de inicio *
              </label>
              <Input
                type="date"
                value={cloneData.start_date}
                onChange={(e) => setCloneData({ ...cloneData, start_date: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Duración (noches)
              </label>
              <Input
                type="number"
                min="1"
                value={cloneData.nights}
                onChange={(e) => setCloneData({ ...cloneData, nights: e.target.value })}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aproximadamente {Math.ceil(parseInt(cloneData.nights) / (template.cities?.length || 1))} noches por ciudad
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCloneDialogOpen(false)}
                className="border-border text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => cloneMutation.mutate()}
                disabled={
                  !cloneData.name.trim() || !cloneData.start_date || cloneMutation.isPending
                }
                className="bg-orange-700 hover:bg-orange-800"
              >
                Crear Viaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}