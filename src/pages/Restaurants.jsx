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
  DialogTitle,
} from '@/components/ui/dialog';



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
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const queryClient = useQueryClient();

  const { data: customFoodItems = [] } = useQuery({
    queryKey: ['foodItems'],
    queryFn: () => base44.entities.FoodItem.list(),
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

  const updateFoodImageMutation = useMutation({
    mutationFn: ({ id, image_url }) => base44.entities.FoodItem.update(id, { image_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems'] });
      setEditFoodDialogOpen(false);
      setSelectedFood(null);
      setCustomImageUrl('');
    },
  });

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

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Yummy 🍜</h1>
          <p className="text-white/90 mt-2">Descubre la gastronomía japonesa</p>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-24 max-w-7xl -mt-12">
        <div className="space-y-8">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tipo de comida..."
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {Object.entries(filteredGroupedFoodTypes).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-light">No se encontraron resultados</p>
              </div>
            ) : (
              Object.entries(filteredGroupedFoodTypes).map(([category, foods]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-light text-foreground border-b border-border pb-2">
                    {category}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {foods.map((food) => (
                      <div key={food.name} className="group glass border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-xl">
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
                            className="absolute top-2 right-2 bg-foreground/90 hover:bg-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Editar foto"
                          >
                            <ImageIcon className="w-4 h-4 text-background" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="text-base font-bold text-foreground mb-1">{food.name}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-2">{food.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
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
                 className="bg-input border-border text-foreground placeholder:text-muted-foreground"
               />
               <p className="text-xs text-muted-foreground mt-1">
                Puedes usar una URL de Unsplash, Google Images, etc.
              </p>
            </div>
            {customImageUrl && (
              <div className="border border-border rounded-lg overflow-hidden">
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
              <Button variant="outline" onClick={() => setEditFoodDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
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