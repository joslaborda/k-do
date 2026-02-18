import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CityCard from '@/components/cities/CityCard';

const defaultCities = ['Osaka', 'Hiroshima', 'Hakone', 'Kyoto', 'Tokyo'];

export default function Cities() {
  const [open, setOpen] = useState(false);
  const [newCity, setNewCity] = useState('');
  const queryClient = useQueryClient();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('order'),
  });

  const { data: itineraryDays = [] } = useQuery({
    queryKey: ['itineraryDays'],
    queryFn: () => base44.entities.ItineraryDay.list(),
  });

  const createMutation = useMutation({
    mutationFn: (name) => base44.entities.City.create({ 
      name, 
      order: cities.length 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setNewCity('');
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.City.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cities'] }),
  });

  const getDaysCount = (cityId) => {
    return itineraryDays.filter(day => day.city_id === cityId).length;
  };

  const handleAddCity = () => {
    if (newCity.trim()) {
      createMutation.mutate(newCity.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ciudades</h1>
            <p className="text-slate-500 mt-1">Planifica tu itinerario para cada destino</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Ciudad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir nueva ciudad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {defaultCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setNewCity(city)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newCity === city 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="O escribe el nombre de otra ciudad"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                />
                <Button 
                  onClick={handleAddCity} 
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  disabled={!newCity.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Añadiendo...' : 'Añadir Ciudad'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">Sin ciudades todavía</h3>
            <p className="text-slate-500 mb-6">Empieza añadiendo las ciudades que visitarás en Japón</p>
            <Button onClick={() => setOpen(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Añadir primera ciudad
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <CityCard 
                key={city.id} 
                city={city} 
                daysCount={getDaysCount(city.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}