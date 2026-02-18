import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Plus, MapPin, Trash2, Check, X, UtensilsCrossed, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const visitedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

export default function Restaurants() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    cuisine: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setDialogOpen(false);
      setSelectedLocation(null);
      setFormData({ name: '', city: '', cuisine: '', notes: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedLocation) {
      createMutation.mutate({
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        visited: false,
      });
    }
  };

  const toggleVisited = (restaurant) => {
    updateMutation.mutate({
      id: restaurant.id,
      data: { visited: !restaurant.visited }
    });
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Japan center
  const defaultCenter = [35.6762, 139.6503];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Restaurantes</h1>
            <p className="text-slate-500 mt-1">Haz clic en el mapa para marcar restaurantes que quieras visitar</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar restaurantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm h-[600px]">
              <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                
                {filteredRestaurants.map((restaurant) => (
                  <Marker
                    key={restaurant.id}
                    position={[restaurant.latitude, restaurant.longitude]}
                    icon={restaurant.visited ? visitedIcon : pendingIcon}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-semibold text-slate-900">{restaurant.name}</h3>
                        {restaurant.cuisine && (
                          <p className="text-sm text-slate-500">{restaurant.cuisine}</p>
                        )}
                        {restaurant.city && (
                          <p className="text-sm text-slate-400">{restaurant.city}</p>
                        )}
                        {restaurant.notes && (
                          <p className="text-sm text-slate-600 mt-2">{restaurant.notes}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant={restaurant.visited ? "outline" : "default"}
                            onClick={() => toggleVisited(restaurant)}
                            className="flex-1"
                          >
                            {restaurant.visited ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Unmark
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Visited
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(restaurant.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Restaurant List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''}
              </h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {restaurants.filter(r => !r.visited).length} por visitar
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {restaurants.filter(r => r.visited).length} visitados
                </Badge>
              </div>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2">
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                  <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Sin restaurantes todavía</p>
                  <p className="text-sm text-slate-400 mt-1">Haz clic en el mapa para añadir uno</p>
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`p-4 bg-white rounded-xl border transition-all ${
                      restaurant.visited 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${restaurant.visited ? 'text-green-800' : 'text-slate-900'}`}>
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {restaurant.city && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {restaurant.city}
                            </span>
                          )}
                          {restaurant.cuisine && (
                            <Badge variant="secondary" className="text-xs">
                              {restaurant.cuisine}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleVisited(restaurant)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          restaurant.visited
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {restaurant.visited && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                    {restaurant.notes && (
                      <p className="text-sm text-slate-500 mt-2">{restaurant.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nombre</label>
              <Input
                placeholder="Nombre del restaurante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Ciudad</label>
              <Input
                placeholder="ej. Osaka"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Tipo de cocina</label>
              <Input
                placeholder="ej. Ramen, Sushi"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notas</label>
              <Textarea
                placeholder="Notas sobre este lugar..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-slate-900 hover:bg-slate-800"
                disabled={!formData.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}