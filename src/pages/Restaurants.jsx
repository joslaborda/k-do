import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Plus, MapPin, Trash2, Check, X, UtensilsCrossed, Search, BookOpen, Image as ImageIcon, Heart } from 'lucide-react';
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

// Tipos de comida japonesa organizados por categorías
const japaneseFoodTypes = [
  // 🍜 Platos principales
  { category: '🍜 Platos principales', name: 'Ramen', description: 'Sopa de fideos con caldo, huevo, carne y verduras', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  { category: '🍜 Platos principales', name: 'Shoyu ramen', description: 'Ramen con caldo a base de salsa de soja', image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400' },
  { category: '🍜 Platos principales', name: 'Miso ramen', description: 'Ramen con caldo cremoso a base de pasta de miso', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400' },
  { category: '🍜 Platos principales', name: 'Tonkotsu ramen', description: 'Ramen con caldo de huesos de cerdo, cremoso y rico', image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=400' },
  { category: '🍜 Platos principales', name: 'Tsukemen', description: 'Fideos fríos que se mojan en caldo caliente concentrado', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400' },
  { category: '🍜 Platos principales', name: 'Udon', description: 'Fideos gruesos de trigo en caldo caliente', image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400' },
  { category: '🍜 Platos principales', name: 'Soba', description: 'Fideos finos de trigo sarraceno, fríos o en caldo', image: 'https://images.unsplash.com/photo-1623318971484-c970f3c0dc59?w=400' },
  { category: '🍜 Platos principales', name: 'Zaru soba', description: 'Fideos soba fríos servidos en bambú con salsa para mojar', image: 'https://images.unsplash.com/photo-1623318971484-c970f3c0dc59?w=400' },
  { category: '🍜 Platos principales', name: 'Kitsune udon', description: 'Udon con tofu frito dulce', image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400' },
  { category: '🍜 Platos principales', name: 'Tempura udon', description: 'Udon con tempura de camarón o verduras', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { category: '🍜 Platos principales', name: 'Curry udon', description: 'Udon en caldo de curry japonés', image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400' },
  { category: '🍜 Platos principales', name: 'Champon', description: 'Fideos con mariscos y verduras en caldo cremoso', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  { category: '🍜 Platos principales', name: 'Yakisoba', description: 'Fideos fritos con verduras, carne y salsa especial', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
  { category: '🍜 Platos principales', name: 'Okinawa soba', description: 'Fideos de Okinawa con caldo y carne de cerdo', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },

  // 🍣 Arroz y pescado
  { category: '🍣 Arroz y pescado', name: 'Sushi', description: 'Arroz con vinagre y pescado crudo o cocido', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Sashimi', description: 'Pescado crudo cortado en láminas finas, sin arroz', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Nigiri', description: 'Porción de pescado sobre arroz prensado', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Maki', description: 'Rollo de sushi envuelto en alga nori', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Temaki', description: 'Rollo de sushi en forma de cono', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Chirashi', description: 'Bowl de arroz cubierto con sashimi variado', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Tekka don', description: 'Bowl de arroz con atún crudo marinado', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Kaisen don', description: 'Bowl de arroz con mariscos y pescado variado', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Unagi don', description: 'Bowl de arroz con anguila asada en salsa dulce', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Salmon don', description: 'Bowl de arroz con salmón fresco o marinado', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Maguro don', description: 'Bowl de arroz con atún rojo', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Onigiri', description: 'Bola de arroz rellena, envuelta en alga nori', image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400' },
  { category: '🍣 Arroz y pescado', name: 'Inari sushi', description: 'Bolsita de tofu frito dulce rellena de arroz', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },

  // 🍱 Arroces y bowls
  { category: '🍱 Arroces y bowls', name: 'Bento', description: 'Caja con comida variada: arroz, proteína y acompañantes', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Gyudon', description: 'Bowl de arroz con carne de res y cebolla dulce', image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Oyakodon', description: 'Bowl de arroz con pollo y huevo (madre e hijo)', image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Katsudon', description: 'Bowl de arroz con cerdo empanado y huevo', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Tendon', description: 'Bowl de arroz con tempura de camarón y verduras', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Butadon', description: 'Bowl de arroz con cerdo al estilo Hokkaido', image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Soboro don', description: 'Bowl de arroz con carne picada, huevo y verduras', image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Curry rice', description: 'Arroz blanco con curry japonés espeso', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Hayashi rice', description: 'Arroz con salsa demi-glace de carne', image: 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Omurice', description: 'Arroz frito envuelto en tortilla con salsa ketchup', image: 'https://images.unsplash.com/photo-1568096889942-6eeab90ae85c?w=400' },
  { category: '🍱 Arroces y bowls', name: 'Takikomi gohan', description: 'Arroz cocido con verduras, setas y carne', image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400' },

  // 🍖 Carne y fritos
  { category: '🍖 Carne y fritos', name: 'Karaage', description: 'Pollo frito japonés marinado, jugoso y crujiente', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400' },
  { category: '🍖 Carne y fritos', name: 'Tonkatsu', description: 'Chuleta de cerdo empanada y frita', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🍖 Carne y fritos', name: 'Chicken katsu', description: 'Pechuga de pollo empanada y frita', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🍖 Carne y fritos', name: 'Menchi katsu', description: 'Croqueta de carne picada empanada', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🍖 Carne y fritos', name: 'Korokke', description: 'Croqueta japonesa de papa y carne', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🍖 Carne y fritos', name: 'Ebi fry', description: 'Camarones empanados y fritos', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { category: '🍖 Carne y fritos', name: 'Tebasaki', description: 'Alitas de pollo fritas con salsa dulce-picante', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400' },
  { category: '🍖 Carne y fritos', name: 'Hamburg steak', description: 'Hamburguesa japonesa con salsa demi-glace', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { category: '🍖 Carne y fritos', name: 'Yakiniku', description: 'Barbacoa japonesa: carne asada en la mesa', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400' },
  { category: '🍖 Carne y fritos', name: 'Sukiyaki', description: 'Olla caliente con carne, verduras y tofu en caldo dulce', image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400' },
  { category: '🍖 Carne y fritos', name: 'Shabu shabu', description: 'Carne y verduras cocidas en caldo hirviendo', image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400' },

  // 🍢 Callejera e izakaya
  { category: '🍢 Callejera e izakaya', name: 'Yakitori', description: 'Brochetas de pollo asadas a la parrilla', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Tsukune', description: 'Brochetas de albóndigas de pollo', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Negima', description: 'Brochetas de pollo con puerro', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Okonomiyaki', description: 'Tortilla salada con repollo, carne y salsa especial', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Takoyaki', description: 'Bolas de masa con pulpo, salsa y bonito seco', image: 'https://images.unsplash.com/photo-1625796528251-a4f9c8e8e3d4?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Kushikatsu', description: 'Brochetas de carne y verduras empanadas y fritas', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Ikayaki', description: 'Calamar a la plancha con salsa', image: 'https://images.unsplash.com/photo-1625796528251-a4f9c8e8e3d4?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Taiyaki', description: 'Pastel en forma de pez relleno de anko o crema', image: 'https://images.unsplash.com/photo-1545104969-c4f0e9e6f543?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Imagawayaki', description: 'Pastel redondo relleno de pasta de judía dulce', image: 'https://images.unsplash.com/photo-1545104969-c4f0e9e6f543?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Nikuman', description: 'Bollo al vapor relleno de carne', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { category: '🍢 Callejera e izakaya', name: 'Yakitori don', description: 'Bowl de arroz con yakitori', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400' },

  // 🥟 Snacks y acompañantes
  { category: '🥟 Snacks y acompañantes', name: 'Gyoza', description: 'Empanadillas japonesas de carne y verduras', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Shumai', description: 'Dumpling al vapor de camarón o cerdo', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Harumaki', description: 'Rollito de primavera japonés frito', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Edamame', description: 'Vainas de soja hervidas con sal', image: 'https://images.unsplash.com/photo-1583477964149-e852de6a570e?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Hiyayakko', description: 'Tofu frío con salsa de soja y jengibre', image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Tamagoyaki', description: 'Tortilla japonesa dulce enrollada', image: 'https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Tsukemono', description: 'Verduras encurtidas japonesas', image: 'https://images.unsplash.com/photo-1583477964149-e852de6a570e?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Potato salad', description: 'Ensalada de papa cremosa al estilo japonés', image: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Hijiki', description: 'Alga marina salteada con verduras', image: 'https://images.unsplash.com/photo-1583477964149-e852de6a570e?w=400' },
  { category: '🥟 Snacks y acompañantes', name: 'Kinpira gobo', description: 'Raíz de bardana salteada con zanahoria', image: 'https://images.unsplash.com/photo-1583477964149-e852de6a570e?w=400' },

  // 🍛 Curry y platos occidentales
  { category: '🍛 Curry y platos occidentales', name: 'Japanese curry', description: 'Curry japonés espeso y dulce con arroz', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Katsu curry', description: 'Curry japonés con cerdo empanado', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Beef curry', description: 'Curry japonés con carne de res', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Seafood curry', description: 'Curry japonés con mariscos', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Hamburger curry', description: 'Curry con hamburguesa japonesa', image: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Doria', description: 'Arroz gratinado con salsa bechamel', image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Napolitan pasta', description: 'Espaguetis con ketchup y salchicha', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Gratin', description: 'Gratinado japonés con macarrones o papa', image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400' },
  { category: '🍛 Curry y platos occidentales', name: 'Cream stew', description: 'Estofado cremoso con pollo y verduras', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },

  // 🍡 Dulces y postres
  { category: '🍡 Dulces y postres', name: 'Mochi', description: 'Pastel de arroz glutinoso suave', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Daifuku', description: 'Mochi relleno de pasta de judía dulce', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Dango', description: 'Brochetas de bolitas de mochi con salsa dulce', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Dorayaki', description: 'Dos pancakes con relleno de anko', image: 'https://images.unsplash.com/photo-1545104969-c4f0e9e6f543?w=400' },
  { category: '🍡 Dulces y postres', name: 'Taiyaki (dulce)', description: 'Pastel en forma de pez relleno de crema o chocolate', image: 'https://images.unsplash.com/photo-1545104969-c4f0e9e6f543?w=400' },
  { category: '🍡 Dulces y postres', name: 'Anmitsu', description: 'Postre con gelatina de agar, frutas y anko', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Warabi mochi', description: 'Gelatina de almidón con kinako (polvo de soja)', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Yokan', description: 'Gelatina densa de pasta de judía dulce', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Castella', description: 'Bizcocho esponjoso de origen portugués', image: 'https://images.unsplash.com/photo-1545104969-c4f0e9e6f543?w=400' },
  { category: '🍡 Dulces y postres', name: 'Matcha cake', description: 'Pastel de té verde matcha', image: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400' },
  { category: '🍡 Dulces y postres', name: 'Matcha ice cream', description: 'Helado de té verde matcha', image: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400' },
  { category: '🍡 Dulces y postres', name: 'Soft cream', description: 'Helado suave japonés (varios sabores)', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { category: '🍡 Dulces y postres', name: 'Purin', description: 'Flan japonés con caramelo', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
  { category: '🍡 Dulces y postres', name: 'Cheesecake japonés', description: 'Tarta de queso ligera y esponjosa', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400' },

  // 🏪 Konbini / rápido
  { category: '🏪 Konbini / rápido', name: 'Sandwich de huevo', description: 'Sandwich de ensalada de huevo cremosa', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Sandwich de pollo', description: 'Sandwich de pollo frito o ensalada de pollo', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Sandwich katsu', description: 'Sandwich con tonkatsu o chicken katsu', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Bento konbini', description: 'Bento preparado de tienda de conveniencia', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Onigiri atún mayo', description: 'Bola de arroz rellena de atún con mayonesa', image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Onigiri salmón', description: 'Bola de arroz rellena de salmón', image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Fried chicken', description: 'Pollo frito estilo konbini', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Croquettes', description: 'Croquetas de papa listas para comer', image: 'https://images.unsplash.com/photo-1604908813172-96d33c258b25?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Hot dogs', description: 'Hot dogs al estilo japonés de konbini', image: 'https://images.unsplash.com/photo-1612392062798-2dbaa2a777bb?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Curry bread', description: 'Pan frito relleno de curry', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Melon pan', description: 'Pan dulce con corteza crujiente tipo melón', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { category: '🏪 Konbini / rápido', name: 'Anpan', description: 'Pan dulce relleno de pasta de judía roja', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },

  // 🍜 Especialidades comunes
  { category: '🍜 Especialidades regionales', name: 'Hokkaido ramen', description: 'Ramen de Hokkaido con mantequilla y maíz', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Hakodate shio ramen', description: 'Ramen con caldo ligero de sal de Hakodate', image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Hiroshima okonomiyaki', description: 'Okonomiyaki en capas con fideos y huevo', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Osaka okonomiyaki', description: 'Okonomiyaki mezclado todo junto', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Kyoto yudofu', description: 'Tofu hervido en caldo suave de Kyoto', image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Tokyo monjayaki', description: 'Versión líquida de okonomiyaki de Tokyo', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Soba artesanal', description: 'Soba hecha a mano de calidad premium', image: 'https://images.unsplash.com/photo-1623318971484-c970f3c0dc59?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Udon artesanal', description: 'Udon hecho a mano de calidad premium', image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400' },
  { category: '🍜 Especialidades regionales', name: 'Seafood donburi', description: 'Bowl de arroz con mariscos frescos variados', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' }
];

// Agrupar por categorías
const groupedFoodTypes = japaneseFoodTypes.reduce((acc, food) => {
  if (!acc[food.category]) {
    acc[food.category] = [];
  }
  acc[food.category].push(food);
  return acc;
}, {});

export default function Restaurants() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
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

  const { data: customFoodItems = [] } = useQuery({
    queryKey: ['foodItems'],
    queryFn: () => base44.entities.FoodItem.list(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favoriteRestaurants'],
    queryFn: () => base44.entities.FavoriteRestaurant.list(),
  });

  // Inicializar FoodItems si no existen
  useEffect(() => {
    const initializeFoodItems = async () => {
      if (customFoodItems.length === 0) {
        const itemsToCreate = japaneseFoodTypes.map(food => ({
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

  const updateFoodImageMutation = useMutation({
    mutationFn: ({ id, image_url }) => base44.entities.FoodItem.update(id, { image_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems'] });
      setEditFoodDialogOpen(false);
      setSelectedFood(null);
      setCustomImageUrl('');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (restaurantId) => {
      const existing = favorites.find(f => f.restaurant_id === restaurantId);
      if (existing) {
        await base44.entities.FavoriteRestaurant.delete(existing.id);
      } else {
        await base44.entities.FavoriteRestaurant.create({ restaurant_id: restaurantId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoriteRestaurants'] }),
  });

  const isFavorite = (restaurantId) => {
    return favorites.some(f => f.restaurant_id === restaurantId);
  };

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

  // Mezclar datos por defecto con personalizaciones
  const mergedFoodTypes = japaneseFoodTypes.map(defaultFood => {
    const customItem = customFoodItems.find(item => item.name === defaultFood.name);
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
    const filtered = foods.filter(food =>
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

  const defaultCenter = [35.6762, 139.6503];

  return (
    <div className="min-h-screen bg-stone-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
         <div className="mb-8">
          <h1 className="text-3xl font-light text-stone-100">Yummy</h1>
          <p className="text-stone-400 mt-1 font-light">Descubre la gastronomía japonesa</p>
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
              <p className="text-stone-400 font-light">Haz clic en el mapa para marcar restaurantes</p>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Buscar restaurantes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden shadow-sm h-[300px]">
                  <MapContainer
                    center={defaultCenter}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-stone-900">{restaurant.name}</h3>
                              <button
                                onClick={() => toggleFavoriteMutation.mutate(restaurant.id)}
                                className="p-1 hover:bg-stone-100 rounded transition-colors"
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
                              </button>
                            </div>
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
                  <h2 className="font-medium text-stone-100">
                    {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''}
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-700 text-xs">
                      {restaurants.filter(r => !r.visited).length} pendientes
                    </Badge>
                    <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 text-xs">
                      {restaurants.filter(r => r.visited).length} visitados
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2">
                  {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-12 bg-stone-800 rounded-xl border border-stone-700">
                      <UtensilsCrossed className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-400 font-light">Sin restaurantes todavía</p>
                      <p className="text-sm text-stone-500 mt-1 font-light">Haz clic en el mapa</p>
                    </div>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`p-4 rounded-xl border transition-all ${
                          restaurant.visited 
                            ? 'border-green-700/50 bg-green-900/20' 
                            : 'border-stone-700 bg-stone-800 hover:border-stone-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${restaurant.visited ? 'text-green-300' : 'text-stone-100'}`}>
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {restaurant.city && (
                                <span className="text-xs text-stone-400 flex items-center gap-1">
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
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-stone-600 hover:border-stone-500'
                            }`}
                            aria-label={restaurant.visited ? 'Marcar como no visitado' : 'Marcar como visitado'}
                          >
                            {restaurant.visited && <Check className="w-3 h-3" />}
                          </button>
                        </div>
                        {restaurant.notes && (
                          <p className="text-sm text-stone-400 mt-2">{restaurant.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="food" className="space-y-8">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Buscar tipo de comida..."
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="pl-10 bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-400"
                />
              </div>
            </div>

            {Object.entries(filteredGroupedFoodTypes).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-400 font-light">No se encontraron resultados</p>
              </div>
            ) : (
              Object.entries(filteredGroupedFoodTypes).map(([category, foods]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-light text-stone-100 border-b border-stone-700 pb-2">
                    {category}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {foods.map((food) => (
                      <div key={food.name} className="group bg-stone-800 border-2 border-stone-700 rounded-xl overflow-hidden hover:border-red-500 transition-all duration-300 hover:shadow-xl">
                        <div className="aspect-square overflow-hidden relative">
                          <img 
                            src={food.image} 
                            alt={food.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400';
                            }}
                          />
                          <button
                            onClick={() => handleEditFoodImage(food)}
                            className="absolute top-2 right-2 bg-stone-900/90 hover:bg-stone-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Editar foto"
                          >
                            <ImageIcon className="w-4 h-4 text-stone-300" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="text-base font-bold text-stone-100 mb-1">{food.name}</h3>
                          <p className="text-xs text-stone-400 leading-relaxed font-light line-clamp-2">{food.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Añadir Restaurante</DialogTitle>
            <div className="sr-only">Formulario para añadir un nuevo restaurante</div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Nombre</label>
              <Input
                placeholder="Nombre del restaurante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Ciudad</label>
              <Input
                placeholder="ej. Osaka"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Tipo de cocina</label>
              <Input
                placeholder="ej. Ramen, Sushi"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">Notas</label>
              <Textarea
                placeholder="Notas sobre este lugar..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-600 text-stone-300 hover:bg-stone-700">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editFoodDialogOpen} onOpenChange={setEditFoodDialogOpen}>
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Editar foto: {selectedFood?.name}</DialogTitle>
            <div className="sr-only">Formulario para editar la foto del plato</div>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-1.5 block">URL de la imagen</label>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
              />
              <p className="text-xs text-stone-400 mt-1">
                Puedes usar una URL de Unsplash, Google Images, etc.
              </p>
            </div>
            {customImageUrl && (
              <div className="border border-stone-700 rounded-lg overflow-hidden">
                <img 
                  src={customImageUrl} 
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400';
                  }}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditFoodDialogOpen(false)} className="border-stone-600 text-stone-300 hover:bg-stone-700">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFoodImage}
                className="bg-green-600 hover:bg-green-700"
                disabled={!customImageUrl.trim() || updateFoodImageMutation.isPending}
              >
                {updateFoodImageMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}