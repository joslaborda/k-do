import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';



// Sushi y Sashimi
const sushiFoodTypes = [
{ name: 'Sushi', description: 'Arroz avinagrado con pescado, mariscos o vegetales.', image: 'https://media.vogue.es/photos/681b4e55491cd7da98fa417e/2:3/w_2560%2Cc_limit/Nikkei%2520.jpg' },
{ name: 'Nigiri', description: 'Bola de arroz con pescado crudo encima.', image: 'https://www.ferwer.cz/img/blog/objevte-umeni-pripravy-nigiri-sushi-jako-doma-bez-stresu-1753961499827.webp' },
{ name: 'Maki', description: 'Rollos de arroz y relleno envueltos en nori.', image: 'https://dinnerthendessert.com/wp-content/uploads/2022/06/Maki-Rolls-52-4x3-1.jpg' },
{ name: 'Uramaki', description: 'Maki invertido con arroz por fuera.', image: 'https://www.giallozafferano.es/images/245-24519/uramaki_650x433_wm.jpg' },
{ name: 'Temaki', description: 'Cono de alga relleno de arroz y pescado.', image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/f560efb8-676a-4d39-8be9-3072bb4674c3/Derivates/8f1e68c2-1680-4c2a-9e89-b3b05596b14d.jpg' },
{ name: 'Sashimi', description: 'Pescado o marisco crudo servido solo.', image: 'https://www.pequerecetas.com/wp-content/uploads/2020/11/sashimi-de-salmon-receta.jpg' },
{ name: 'Chirashi-zushi', description: 'Arroz con pescado y vegetales encima.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/02/Chirashi-Sushi-7722-I-1.jpg' },
{ name: 'Inari-zushi', description: 'Tofu frito relleno de arroz.', image: 'https://web-japan.org/kidsweb/img/cook_inarizushi_pic01.jpg' },
{ name: 'Gunkan maki', description: 'Maki en forma de barco, relleno de huevas o mariscos.', image: 'https://www.savorysweetspoon.com/wp-content/uploads/2023/08/Gunkan-1x1-1.jpg' },
{ name: 'Futomaki', description: 'Maki grueso con varios rellenos.', image: 'https://veganeverytime.com/wp-content/uploads/2023/08/futomaki-500x375.jpg' },
{ name: 'Hosomaki', description: 'Maki delgado, normalmente con un solo ingrediente.', image: 'https://howdaily.com/wp-content/uploads/2019/03/hosomaki-sushi-roll-500x500.jpg' },
{ name: 'Temari sushi', description: 'Bolitas de arroz con topping de pescado o huevo.', image: 'https://pickledplum.com/wp-content/uploads/2019/11/temari-sushi-2OPTM.jpg' },
{ name: 'Oshizushi', description: 'Sushi prensado típico de Osaka.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2020/02/Salmon-Oshizushi-20.jpg' },
{ name: 'Aburi sushi', description: 'Sushi ligeramente flameado.', image: 'https://thegridfoodmarket.com/cdn/shop/products/SalmonAburiSushi_1000x.jpg' },
{ name: 'Uni sushi', description: 'Sushi con erizo de mar.', image: 'https://popmenucloud.com/cdn-cgi/image/width%3D1200%2Cheight%3D1200%2Cfit%3Dscale-down%2Cformat%3Dauto%2Cquality%3D60/ezgtirbw/32b0fbfd-564b-45cd-b946-fcdb282062db.jpg' },
{ name: 'Ikura sushi', description: 'Sushi con huevas de salmón.', image: 'https://globalseafoods.com/cdn/shop/articles/dreamstime_s_24915148_53909dd7-cd3d-45d5-bdf6-66ebe268a32a_2048x.jpg' },
{ name: 'Tako sushi', description: 'Sushi con pulpo.', image: 'https://freshcado.es/wp-content/uploads/2022/06/Sushi-pulpo.jpg' },
{ name: 'Ebi sushi', description: 'Sushi con camarón cocido.', image: 'https://freshcado.es/wp-content/uploads/2022/06/gamba.jpg' },
{ name: 'Hamachi sushi', description: 'Sushi con pez limón.', image: 'https://www.tasteatlas.com/images/dishes/c4a6f1c0404f45b5b74c33569562e429.jpg' },
{ name: 'Maguro sushi', description: 'Sushi con atún.', image: 'https://www.sushi-pedia.com/_astro/sushi-maguro-zuke-tuna-soy-marinated-japanese-style_Z29MJlt.jpeg' },
{ name: 'Toro sushi', description: 'Sushi con ventresca de atún.', image: 'https://sushisenaz.com/wp-content/uploads/2025/08/freepik-Toro-Sushi-179.jpg' },
{ name: 'Kani sushi', description: 'Sushi con carne de cangrejo.', image: 'https://www.savorysweetspoon.com/wp-content/uploads/2023/08/Kanikama-Sushi-1x1-1.jpg' },
{ name: 'Ika sushi', description: 'Sushi con calamar.', image: 'https://freshcado.es/wp-content/uploads/2022/06/Sushi-sepia-1.jpg' },
{ name: 'Saba sushi', description: 'Sushi con caballa marinada.', image: 'https://thehappyfoodie.co.uk/wp-content/uploads/2021/08/sushi_at_home_4_73_img_s900x0_c1775x1037_l456x1361.jpg' },
{ name: 'Tamago sushi', description: 'Sushi con tortilla dulce japonesa.', image: 'https://www.japanesecooking101.com/wp-content/uploads/2019/04/DSC00452b.jpg' }
];


// Agrupar por categorías
const groupedFoodTypes = sushiFoodTypes.reduce((acc, food) => {
  const category = '🍣 Sushi y Sashimi';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push({ ...food, category });
  return acc;
}, {});

export default function Restaurants() {
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const queryClient = useQueryClient();

  const { data: customFoodItems = [] } = useQuery({
    queryKey: ['foodItems'],
    queryFn: () => base44.entities.FoodItem.list()
  });

  // Inicializar FoodItems si no existen
  useEffect(() => {
    const initializeFoodItems = async () => {
      if (customFoodItems.length === 0) {
        const itemsToCreate = japaneseFoodTypes.map((food) => ({
          name: food.name,
          category: food.category,
          description: food.description,
          default_image: food.image,
          image_url: food.image
        }));
        await base44.entities.FoodItem.bulkCreate(itemsToCreate);
        queryClient.invalidateQueries({ queryKey: ['foodItems'] });
      }
    };
    initializeFoodItems();
  }, [customFoodItems.length, queryClient]);

  const updateFoodImageMutation = useMutation({
    mutationFn: ({ id, image_url }) => base44.entities.FoodItem.update(id, { image_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems'] });
      setEditFoodDialogOpen(false);
      setSelectedFood(null);
      setCustomImageUrl('');
    }
  });

  // Mezclar datos por defecto con personalizaciones
  const mergedFoodTypes = japaneseFoodTypes.map((defaultFood) => {
    const customItem = customFoodItems.find((item) => item.name === defaultFood.name);
    return customItem ? {
      ...defaultFood,
      image: customItem.image_url || defaultFood.image,
      id: customItem.id
    } : defaultFood;
  });

  const mergedGroupedFoodTypes = mergedFoodTypes.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {});

  const filteredGroupedFoodTypes = Object.entries(mergedGroupedFoodTypes).reduce((acc, [category, foods]) => {
    const filtered = foods.filter((food) =>
    food.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
    food.description.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const handleEditFoodImage = (food) => {
    setSelectedFood(food);
    setCustomImageUrl(food.image || '');
    setEditFoodDialogOpen(true);
  };

  const handleSaveFoodImage = () => {
    if (selectedFood && selectedFood.id) {
      updateFoodImageMutation.mutate({
        id: selectedFood.id,
        image_url: customImageUrl
      });
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Yummy 🍜</h1>
          <p className="text-white/90 mt-2">Descubre la gastronomía japonesa</p>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-7xl -mt-12">
        <div className="space-y-8">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                placeholder="Buscar tipo de comida..."
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)} className="bg-zinc-50 text-foreground pl-10 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-border placeholder:text-muted-foreground" />




              </div>
            </div>

            {Object.entries(filteredGroupedFoodTypes).length === 0 ?
          <div className="text-center py-12">
                <p className="text-muted-foreground font-light">No se encontraron resultados</p>
              </div> :

          Object.entries(filteredGroupedFoodTypes).map(([category, foods]) =>
          <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-light text-foreground border-b border-border pb-2">
                    {category}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {foods.map((food) =>
              <div key={food.name} className="group glass border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-xl">
                        <div className="aspect-square overflow-hidden relative">
                          <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400';
                    }} />

                          <button
                    onClick={() => handleEditFoodImage(food)}
                    className="absolute top-2 right-2 bg-foreground/90 hover:bg-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Editar foto">

                            <ImageIcon className="w-4 h-4 text-background" />
                          </button>
                        </div>
                        <div className="bg-zinc-50 p-3">
                          <h3 className="text-base font-bold text-foreground mb-1">{food.name}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-2">{food.description}</p>
                        </div>
                      </div>
              )}
                  </div>
                </div>
          )
          }
        </div>
      </div>

      <Dialog open={editFoodDialogOpen} onOpenChange={setEditFoodDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar foto: {selectedFood?.name}</DialogTitle>
            <div className="sr-only">Formulario para editar la foto del plato</div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">URL de la imagen</label>
               <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

               <p className="text-xs text-muted-foreground mt-1">
                Puedes usar una URL de Unsplash, Google Images, etc.
              </p>
            </div>
            {customImageUrl &&
            <div className="border border-border rounded-lg overflow-hidden">
                <img
                src={customImageUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400';
                }} />

              </div>
            }
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditFoodDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button
                onClick={handleSaveFoodImage}
                className="bg-green-600 hover:bg-green-700"
                disabled={!customImageUrl.trim() || updateFoodImageMutation.isPending}>

                {updateFoodImageMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}