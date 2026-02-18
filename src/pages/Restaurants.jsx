import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Plus, MapPin, Trash2, Check, X, UtensilsCrossed, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Tipos de comida japonesa
const japaneseFoodTypes = [
  {
    name: 'Donburi',
    description: 'Plato de arroz con ingredientes encima (carne, pescado, verduras)',
    image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400&h=300&fit=crop'
  },
  {
    name: 'Gyoza',
    description: 'Empanadillas japonesas rellenas de carne y verduras, fritas o al vapor',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop'
  },
  {
    name: 'Karaage',
    description: 'Pollo frito japonés marinado en salsa de soja y jengibre',
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=300&fit=crop'
  },
  {
    name: 'Katsu',
    description: 'Filete empanado y frito (cerdo=tonkatsu, pollo=chicken katsu)',
    image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400&h=300&fit=crop'
  },
  {
    name: 'Okonomiyaki',
    description: 'Tortilla salada japonesa tipo pizza con repollo, carne y salsa especial',
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop'
  },
  {
    name: 'Ramen',
    description: 'Sopa de fideos con caldo (miso, shoyu, tonkotsu), huevo, carne y verduras',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop'
  },
  {
    name: 'Sashimi',
    description: 'Pescado crudo cortado en láminas finas sin arroz',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
  },
  {
    name: 'Soba',
    description: 'Fideos finos de trigo sarraceno, servidos fríos o en caldo caliente',
    image: 'https://images.unsplash.com/photo-1623318971484-c970f3c0dc59?w=400&h=300&fit=crop'
  },
  {
    name: 'Sushi',
    description: 'Arroz con vinagre acompañado de pescado crudo, verduras o tortilla',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
  },
  {
    name: 'Takoyaki',
    description: 'Bolas de masa rellenas de pulpo, cubiertas con salsa y bonito seco',
    image: 'https://images.unsplash.com/photo-1625796528251-a4f9c8e8e3d4?w=400&h=300&fit=crop'
  },
  {
    name: 'Tempura',
    description: 'Verduras o mariscos rebozados en masa ligera y fritos',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop'
  },
  {
    name: 'Teppanyaki',
    description: 'Carne, mariscos y verduras cocinados a la plancha frente al cliente',
    image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop'
  },
  {
    name: 'Tonkatsu',
    description: 'Chuleta de cerdo empanada y frita, servida con salsa especial',
    image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400&h=300&fit=crop'
  },
  {
    name: 'Udon',
    description: 'Fideos gruesos de trigo en caldo caliente o fríos con salsa para mojar',
    image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400&h=300&fit=crop'
  },
  {
    name: 'Unagi',
    description: 'Anguila asada con salsa dulce teriyaki, servida sobre arroz',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop'
  },
  {
    name: 'Yakitori',
    description: 'Brochetas de pollo asadas a la parrilla con salsa tare o sal',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop'
  }
].sort((a, b) => a.name.localeCompare(b.name));

export default function Restaurants() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
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

  const filteredFoodTypes = japaneseFoodTypes.filter(food =>
    food.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
    food.description.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  const defaultCenter = [35.6762, 139.6503];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-stone-900">Yummy</h1>
          <p className="text-stone-500 mt-1 font-light">Descubre la gastronomía japonesa</p>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="w-4 h-4" />
              Mapa de Restaurantes
            </TabsTrigger>
            <TabsTrigger value="food" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Guía de Comida
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-stone-600 font-light">Haz clic en el mapa para marcar restaurantes</p>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
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
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm h-[600px]">
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
                            <h3 className="font-semibold text-stone-900">{restaurant.name}</h3>
                            {restaurant.cuisine && (
                              <p className="text-sm text-stone-500">{restaurant.cuisine}</p>
                            )}
                            {restaurant.city && (
                              <p className="text-sm text-stone-400">{restaurant.city}</p>
                            )}
                            {restaurant.notes && (
                              <p className="text-sm text-stone-600 mt-2">{restaurant.notes}</p>
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
                  <h2 className="font-medium text-stone-900">
                    {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''}
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      {restaurants.filter(r => !r.visited).length} pendientes
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {restaurants.filter(r => r.visited).length} visitados
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2">
                  {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
                      <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500 font-light">Sin restaurantes todavía</p>
                      <p className="text-sm text-stone-400 mt-1 font-light">Haz clic en el mapa</p>
                    </div>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`p-4 bg-white rounded-xl border transition-all ${
                          restaurant.visited 
                            ? 'border-green-200 bg-green-50/50' 
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${restaurant.visited ? 'text-green-800' : 'text-stone-900'}`}>
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {restaurant.city && (
                                <span className="text-xs text-stone-500 flex items-center gap-1">
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
                                : 'border-stone-300 hover:border-stone-400'
                            }`}
                          >
                            {restaurant.visited && <Check className="w-3 h-3" />}
                          </button>
                        </div>
                        {restaurant.notes && (
                          <p className="text-sm text-stone-500 mt-2">{restaurant.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="food" className="space-y-6">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Buscar tipo de comida..."
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodTypes.map((food) => (
                <div key={food.name} className="group bg-white border-2 border-stone-200 rounded-2xl overflow-hidden hover:border-red-400 transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={food.image} 
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{food.name}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">{food.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredFoodTypes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-stone-500 font-light">No se encontraron resultados</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Nombre</label>
              <Input
                placeholder="Nombre del restaurante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Ciudad</label>
              <Input
                placeholder="ej. Osaka"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Tipo de cocina</label>
              <Input
                placeholder="ej. Ramen, Sushi"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Notas</label>
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
                className="bg-stone-900 hover:bg-stone-800"
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