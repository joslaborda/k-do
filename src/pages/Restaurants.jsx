import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, BookOpen, Image as ImageIcon, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger } from
'@/components/ui/collapsible';
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



const foodCategories = [
  {
    category: 'Sushi y Sashimi',
    icon: '🍣',
    items: [
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
    ]
  },
  {
    category: 'Ramen y fideos',
    icon: '🍜',
    items: [
      { name: 'Ramen Shoyu', description: 'Caldo de soya con fideos, carne y huevo.', image: 'https://pinchandswirl.com/wp-content/uploads/2024/10/Shoyu-Ramen-featured-image.jpg' },
      { name: 'Ramen Miso', description: 'Caldo de miso con fideos, maíz y carne.', image: 'https://www.orientalmarket.es/recetas/wp-content/uploads/2021/12/foto-receta-miso-de-ramen-y-crijiente-de-pollo-1-1500x2000.jpg' },
      { name: 'Ramen Shio', description: 'Ramen con caldo salado claro.', image: 'https://api.shinramyun.com.au/media/1gomzlhc/cold-ramyun.jpg' },
      { name: 'Tonkotsu ramen', description: 'Caldo cremoso de cerdo.', image: 'https://i0.wp.com/www.craftycookbook.com/wp-content/uploads/2023/03/img_8918_jpg.jpg' },
      { name: 'Hiyashi chuka', description: 'Ramen frío con vegetales y huevo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/07/Hiyashi-Chuka-8711-I-500x375.jpg' },
      { name: 'Tsukemen', description: 'Ramen para sumergir en caldo concentrado.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2024/07/tsukemen-8.jpg' },
      { name: 'Yakisoba', description: 'Fideos fritos con carne, vegetales y salsa.', image: 'https://www.chilipeppermadness.com/wp-content/uploads/2024/01/Yakisoba-Noodles-Recipe-SQ.jpg' },
      { name: 'Udon caliente', description: 'Fideos gruesos en caldo.', image: 'https://www.cilantroandcitronella.com/wp-content/uploads/2016/08/udon-stir-fry_1_07.jpg' },
      { name: 'Kitsune udon', description: 'Udon con tofu frito dulce.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/09/Kitsune-Udon-3783-II.jpg' },
      { name: 'Tempura udon', description: 'Udon con tempura encima.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/02/Nabeyaki-Udon-5163-II.jpg' },
      { name: 'Curry udon', description: 'Udon con salsa de curry japonés.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/09/Curry-Udon-II.jpg' },
      { name: 'Nabeyaki udon', description: 'Udon cocido en olla con huevo, pollo y vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/02/Nabeyaki-Udon-5163-II.jpg' },
      { name: 'Soba caliente', description: 'Fideos de trigo sarraceno en caldo.', image: 'https://www.cilantroandcitronella.com/wp-content/uploads/2016/12/toshikoshi-soba-photo-2.jpg' },
      { name: 'Zaru soba', description: 'Soba fría con salsa para mojar.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/06/Zaru-Soba-Cold-Soba-Noodles-3989-II.jpg' },
      { name: 'Kake soba', description: 'Soba simple en caldo.', image: 'https://sudachirecipes.com/wp-content/uploads/2025/12/kake-soba-new-thumb.jpg' },
      { name: 'Tempura soba', description: 'Soba con tempura encima.', image: 'https://www.sbfoods-worldwide.com/recipes/h9f2g10000000hbr-img/SobaNoodleSoupwithPrawnTempura_recipe.jpg' },
      { name: 'Sansai soba', description: 'Soba con vegetales de montaña.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/04/Kake-Soba-7300-II.jpg' },
      { name: 'Champon', description: 'Fideos en caldo con mariscos y vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/09/Champon-II.jpg' },
      { name: 'Yaki udon', description: 'Udon salteado con carne y vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/02/Yaki-Udon-7339-II.jpg' },
      { name: 'Houtou', description: 'Udon ancho y grueso con vegetales, típico de Yamanashi.', image: 'https://www.justonecookbook.com/wp-content/uploads/2019/03/Hoto-II.jpg' },
      { name: 'Okinawa soba', description: 'Fideos de trigo estilo Okinawa.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/06/Okinawa-Soba-II.jpg' },
      { name: 'Nagashi somen', description: 'Fideos finos que se comen al fluir en agua.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/08/Pork-Shabu-Shabu-and-Cold-Somen-with-Sesame-Miso-Sauce-0164-II.jpg' },
      { name: 'Sara udon', description: 'Fideos crujientes con carne y vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/01/Crispy-Noodles-with-Seafood-3-II.jpg' },
      { name: 'Yosenabe udon', description: 'Udon en olla caliente con varios ingredientes.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Yosenabe-4943-II.jpg' },
      { name: 'Mazesoba', description: 'Ramen seco mezclado con salsa, huevo y carne.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/09/Mazesoba-0047-II.jpg' }
    ]
  },
  {
    category: 'Donburi y platos con arroz',
    icon: '🍚',
    items: [
      { name: 'Gyudon', description: 'Arroz con carne de res y cebolla.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/11/Gyudon-7476-II.jpg' },
      { name: 'Oyakodon', description: 'Arroz con pollo y huevo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/10/Oyakodon-0595-II.jpg' },
      { name: 'Katsudon', description: 'Arroz con tonkatsu y huevo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/02/Katsudon-Pork-Cutlet-Rice-Bowl-0402-II.jpg' },
      { name: 'Unadon', description: 'Arroz con anguila a la parrilla.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/07/Unadon-Eel-Rice-9533-II.jpg' },
      { name: 'Tendon', description: 'Arroz con tempura.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/08/Ten-Don-Recipe-3168-II.jpg' },
      { name: 'Curry rice', description: 'Arroz con curry japonés.', image: 'https://i0.wp.com/beyondsweetandsavory.com/wp-content/uploads/2022/12/Japanese-chicken-curry-VyTran-5.jpg' },
      { name: 'Soboro don', description: 'Arroz con carne molida y huevo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/06/Soboro-Don-Ground-Chicken-Bowl-8370-II.jpg' },
      { name: 'Chahan', description: 'Arroz frito japonés estilo chino.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/02/Pickled-Mustard-Green-Fried-Rice-Takana-Chahan-6387-II.jpg' },
      { name: 'Omurice', description: 'Arroz frito envuelto en tortilla.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/05/Omurice-8905-II.jpg' },
      { name: 'Ikuradon', description: 'Arroz con huevas de salmón.', image: 'https://jeccachantilly.com/wp-content/uploads/2023/11/ikura-don-1.jpg' },
      { name: 'Kaisen don', description: 'Arroz con variedad de mariscos crudos.', image: 'https://sudachirecipes.com/wp-content/uploads/2022/06/kaisendon-sq.jpg' },
      { name: 'Tekka don', description: 'Arroz con atún crudo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2014/09/Tekka-Don-IIII-NEW.jpg' },
      { name: 'Anago don', description: 'Arroz con anguila de agua salada.', image: 'https://miro.medium.com/v2/resize:fit:2000/format:webp/1*1VKKVhw0bchbbhijiP4gnA.jpeg' },
      { name: 'Negitoro don', description: 'Arroz con ventresca de atún y cebolleta.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/04/Avocado-Negitoro-Donburi-II.jpg' },
      { name: 'Gomoku don', description: 'Arroz con cinco ingredientes: carne, huevo y vegetales.', image: 'https://japan.recipetineats.com/wp-content/uploads/2017/04/Gomokumame_0917.jpg' },
      { name: 'Chikuzen don', description: 'Arroz con pollo y vegetales estofados.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2024/11/chikuzenni-chicken-and-vegetable-stew-34.jpg' },
      { name: 'Mabodon', description: 'Arroz con tofu picante y carne.', image: 'https://pickledplum.com/wp-content/uploads/2014/07/mabodon-Writing.jpg' },
      { name: 'Tenmusu', description: 'Onigiri relleno de tempura de camarón.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/01/Tenmusu-1285-II.jpg' },
      { name: 'Katsumeshi', description: 'Arroz con tonkatsu y salsa demi-glace.', image: 'https://www.maff.go.jp/e/policies/market/k_ryouri/assets/uploads/2022/09/hyogo_4_1-1.jpg' },
      { name: 'Oshinko don', description: 'Arroz con vegetales encurtidos.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2020/12/Oshinko-Roll-20.jpg' },
      { name: 'Ebi don', description: 'Arroz con camarón frito.', image: 'https://cdn.foodfanatic.com/uploads/2017/01/ebi-katsu-don-photo.jpg' },
      { name: 'Sake don', description: 'Arroz con salmón crudo.', image: 'https://i0.wp.com/unfussyepicure.com/wp-content/uploads/2015/04/sake-don-1.jpg?w=2000' },
      { name: 'Hokkaido seafood don', description: 'Tazón con mariscos frescos de Hokkaido.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Hokkaido-Salmon-Hotpot-5011-II.jpg' },
      { name: 'Torimeshi', description: 'Arroz cocido con pollo y vegetales.', image: 'https://www.maff.go.jp/e/policies/market/k_ryouri/assets/uploads/2023/10/nagasaki_13_1.jpg' },
      { name: 'Negi toro ikura don', description: 'Arroz con ventresca de atún, cebolleta y huevas de salmón.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Hokkaido-Salmon-Hotpot-5011-II.jpg' }
    ]
  },
  {
    category: 'Tempura y frituras',
    icon: '🍤',
    items: [
      { name: 'Tempura variada', description: 'Mariscos y vegetales rebozados y fritos.', image: 'https://www.tokyo-ya.es/blog/wp-content/uploads/2015/05/tempura-21-825x510.jpg' },
      { name: 'Kakiage', description: 'Tempura de vegetales y mariscos picados.', image: 'https://www.justonecookbook.com/wp-content/uploads/2011/11/Kakiage-Don-II-e1321581605256.jpg' },
      { name: 'Tonkatsu', description: 'Cerdo empanizado y frito.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/09/Tonkatsu-Japanese-Pork-Cutlet-0030-II.jpg' },
      { name: 'Korokke', description: 'Croqueta de papa y carne.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/07/Korokke-Potato-Meat-Croquette-6484-II.jpg' },
      { name: 'Ebi fry', description: 'Camarones empanizados y fritos.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/04/Ebi-Fry-Fried-Shrimp-1181-II.jpg' },
      { name: 'Menchi katsu', description: 'Croqueta frita de carne molida.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/04/Menchi-Katsu-Ground-Meat-Cutlet-2228.jpg' },
      { name: 'Gyoza', description: 'Empanadillas japonesas rellenas de carne y vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/04/Gyoza-7436-II.jpg' },
      { name: 'Age tofu', description: 'Tofu frito.', image: 'https://sudachirecipes.com/wp-content/uploads/2022/11/agedashi-tofu-sq.jpg' },
      { name: 'Chicken karaage', description: 'Pollo marinado y frito.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/04/Karaage-Japanese-Fried-Chicken-9547-III.jpg' },
      { name: 'Gyu katsu', description: 'Filete de res empanizado y frito.', image: 'https://sudachirecipes.com/wp-content/uploads/2022/10/gyukatsu-sq.jpg' },
      { name: 'Agedashi tofu', description: 'Tofu frito servido en caldo dashi.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/06/Agedashi-Tofu-8400-II.jpg' },
      { name: 'Fish fry', description: 'Pescado empanizado frito.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/04/Ebi-Fry-Fried-Shrimp-1181-II.jpg' },
      { name: 'Kaki fry', description: 'Ostras empanizadas y fritas.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/04/Japanese-Fried-Oysters-Kaki-Fry-2118.jpg' },
      { name: 'Hotate fry', description: 'Vieiras empanizadas.', image: 'https://static.wixstatic.com/media/d60c54_e3326621ced64628ad3bcaff2368f318~mv2.jpeg/v1/fill/w_1133,h_835,al_c,q_85,enc_avif,quality_auto/d60c54_e3326621ced64628ad3bcaff2368f318~mv2.jpeg' },
      { name: 'Teba gyoza', description: 'Alitas rellenas estilo gyoza.', image: 'https://luni.com.sg/wp-content/uploads/2025/05/Teba-Gyoza.jpg' },
      { name: 'Shishamo fry', description: 'Pequeños peces fritos.', image: 'https://www.seriouseats.com/thmb/Ahnsx3F6MyJHXopaF3eB3zU0S20=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2012__01__20120103-185977-nasty-bits-smelt-primary-7a86ec31dfe84582bf02776eb4d4b968.jpg' },
      { name: 'Katsu curry', description: 'Tonkatsu servido con arroz y curry japonés.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/05/Katsu-Curry-4998-II.jpg' },
      { name: 'Satsuma-age', description: 'Pastel de pescado frito.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/05/satsumaage-4997.jpg' },
      { name: 'Menchi katsu sandwich', description: 'Croqueta frita en pan.', image: 'https://www.justonecookbook.com/wp-content/uploads/2011/01/Menchi-Katsu-Sandwich-II.jpg' },
      { name: 'Chicken nanban', description: 'Pollo frito con salsa agridulce y mayonesa.', image: 'https://www.justonecookbook.com/wp-content/uploads/2011/01/Menchi-Katsu-Sandwich-II.jpg' }
    ]
  },
  {
    category: 'Okonomiyaki y platos de sartén',
    icon: '🥞',
    items: [
      { name: 'Okonomiyaki Osaka', description: 'Tortilla con repollo, carne, mariscos, huevo y salsa dulce.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/02/Okonomiyaki-5953-V-2.jpg' },
      { name: 'Okonomiyaki Hiroshima', description: 'Con fideos y capas separadas de ingredientes.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/03/Hiroshima-OKonomiyaki-7682-II.jpg' },
      { name: 'Monjayaki', description: 'Masa líquida con vegetales y carne, cocida en plancha.', image: 'https://www.okonomikitchen.com/wp-content/uploads/2021/05/monjayaki-recipe-1-of-1-1024x683.jpg' },
      { name: 'Negiyaki', description: 'Variante con cebolleta en lugar de repollo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/05/Nagiyaki-9517-II.jpg' },
      { name: 'Takoyaki', description: 'Bolitas de masa con pulpo, cebolla y jengibre.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/08/Takoyaki-Recipe-2966-II.jpg' },
      { name: 'Yaki onigiri', description: 'Bolas de arroz a la parrilla con salsa de soya o miso.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/06/Yaki-Onigiri-Grilled-Rice-Ball-3065-III.jpg' },
      { name: 'Ikayaki', description: 'Calamar a la plancha.', image: 'https://asianinspirations.com.au/wp-content/uploads/2018/07/R00728_Ikayaki.jpg' },
      { name: 'Negi takoyaki', description: 'Takoyaki con cebolleta abundante.', image: 'https://static.japan-food.guide/uploads/ckeditor_asset/data/000/001/566/ac1e95237c259cf64efc3baee6c90feaad10dd86d49e576bc8149d705f5df714/negi-takoyaki_scallion_takoyaki_.jpg' }
    ]
  },
  {
    category: 'Guisos y platos calientes',
    icon: '🍲',
    items: [
      { name: 'Japanese curry', description: 'Curry japonés suave con carne, papas, zanahoria y cebolla, servido con arroz.', image: 'https://www.justonecookbook.com/wp-content/uploads/2012/03/Kare-Kare-Horizontal.jpg' },
      { name: 'Nikujaga', description: 'Estofado de carne, papa y cebolla en salsa dulce de soya.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/05/Nikujaga-6904-II.jpg' },
      { name: 'Oden', description: 'Guiso de invierno con huevo, konnyaku, daikon y pescado cocido en caldo dashi.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/10/Oden-Japanese-Fish-Cake-Stew-0945-II.jpg' },
      { name: 'Sukiyaki', description: 'Carne, tofu y vegetales cocidos en salsa dulce de soya y azúcar.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/01/Sukiyaki-4729-II.jpg' },
      { name: 'Shabu-shabu', description: 'Finas láminas de carne y vegetales cocidos en caldo caliente y sumergidos en salsas.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/05/Shabu-Shabu-Salad-4765-II.jpg' },
      { name: 'Chikuzenni', description: 'Estofado de pollo y vegetales, típico de Kyushu.', image: 'https://www.justonecookbook.com/wp-content/uploads/2019/12/Chikuzenni-7115-II.jpg' },
      { name: 'Yosenabe', description: 'Guiso con varios mariscos, pollo y tofu.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Yosenabe-4943-II.jpg' },
      { name: 'Motsunabe', description: 'Guiso picante de intestinos de res con repollo y ajo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/03/Motsunabe-Offal-Hot-Pot-6442-II.jpg' },
      { name: 'Ishikari nabe', description: 'Guiso de salmón y vegetales típico de Hokkaido.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Hokkaido-Salmon-Hotpot-5011-II.jpg' },
      { name: 'Kani nabe', description: 'Guiso de cangrejo y vegetales en caldo.', image: 'https://www.oksfood.com/image/kaninabe.jpg' },
      { name: 'Oshiruko', description: 'Guiso dulce de frijol rojo con mochi.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/04/Oshiruko-Red-Bean-Soup-8212-II.jpg' },
      { name: 'Fugu nabe', description: 'Guiso de pez globo (fugu) y vegetales.', image: 'https://wattention.com/wp-content/uploads/2015/10/Three-Ways-To-Eat-Fugu5.jpg' },
      { name: 'Tori nabe', description: 'Pollo cocido en caldo con vegetales.', image: 'http://justhungry.com/files/images/torinabe1.jpg' },
      { name: 'Miso nikomi udon', description: 'Udon cocido en caldo de miso espeso con huevo y pollo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/12/Miso-Nikomi-Udon-II.jpg' },
      { name: 'Kenchin jiru', description: 'Sopa de vegetales y tofu estofados.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/11/Kenchinjiru-0997-III.jpg' },
      { name: 'Kani cream stew', description: 'Guiso cremoso de cangrejo y vegetales, estilo occidentalizado japonés.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2024/11/creamed-stew-13.jpg' },
      { name: 'Butajiru', description: 'Sopa de cerdo y vegetales en caldo miso.', image: 'https://thejapanesekitchen.com/wp-content/uploads/2020/06/Butajiru_Two-Bowls-and-Pot.jpg' },
      { name: 'Omu curry', description: 'Curry japonés servido dentro de una tortilla.', image: 'https://jajabakes.com/wp-content/uploads/2020/04/curry-omurice-3.jpg' },
      { name: 'Tendon nabe', description: 'Tempura en guiso caliente.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/10/Japanese-Beef-Tendon-Stew-II.jpg' },
      { name: 'Ankake udon', description: 'Udon con salsa espesa a base de dashi y fécula.', image: 'https://kyoudo-ryouri.com/wp-content/uploads/2014/10/ankakeudon_iwate_p_1-400x360.jpg' },
      { name: 'Kaisen nabe', description: 'Guiso de mariscos surtidos.', image: 'https://www.oksfood.com/image/kaisen_nabe.jpg' },
      { name: 'Tamagotoji', description: 'Plato con huevo cocido sobre carne o vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/01/Yuba-Tamagotoji-0666-II.jpg' },
      { name: 'Nimono', description: 'Vegetales y carnes cocidos lentamente en dashi y salsa de soya.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/02/Simmered-Taro-Satoimo-no-Nimono-4988-II.jpg' },
      { name: 'Buta kakuni', description: 'Panceta de cerdo cocida lentamente en soja, sake y azúcar.', image: 'https://sudachirecipes.com/wp-content/uploads/2023/09/kakuni-thumb.jpg' }
    ]
  },
  {
    category: 'Snacks y comida callejera',
    icon: '🍡',
    items: [
      { name: 'Taiyaki', description: 'Pastel en forma de pez relleno de pasta de frijol rojo, crema o chocolate.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/12/Crispy-Taiyaki-4931-II.jpg' },
      { name: 'Dorayaki', description: 'Pancakes japoneses rellenos de anko (pasta de frijol dulce).', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/08/Japanese-Dorayaki-3708.jpg' },
      { name: 'Onigiri', description: 'Triángulo de arroz relleno y envuelto en alga nori.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/09/Onigiri-Japanese-Rice-Balls-2053-II.jpg' },
      { name: 'Kushikatsu', description: 'Brochetas fritas de carne o vegetales.', image: 'https://www.justonecookbook.com/wp-content/uploads/2018/08/Kushikatsu-II.jpg' },
      { name: 'Yaki imo', description: 'Batata asada, común en invierno.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/11/Baked-Japanese-Sweet-Potatoes-4369-II.jpg' },
      { name: 'Karaage sticks', description: 'Palitos de pollo frito estilo karaage.', image: 'https://m.media-amazon.com/images/I/51jtBNrFToL._AC_SX300_SY300_QL70_ML2_.jpg' },
      { name: 'Korokke pan', description: 'Bocadillo de croqueta dentro de pan.', image: 'https://www.sandwichtribunal.com/wp-content/uploads/2020/11/IMG_3992.jpg' },
      { name: 'Age manju', description: 'Pastelito frito relleno de anko.', image: 'https://www.justonecookbook.com/wp-content/uploads/2017/12/Manju-II.jpg' },
      { name: 'Nikuman', description: 'Pan al vapor relleno de carne.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/04/Nikuman-Steamed-Pork-Buns-5135-II.jpg' },
      { name: 'Gyu kushi', description: 'Brocheta de res a la parrilla.', image: 'https://www.oksfood.com/image/gyukushi.jpg' },
      { name: 'Yakitori', description: 'Brochetas de pollo a la parrilla.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/04/Yakitori-7804-II.jpg' },
      { name: 'Tsukune', description: 'Albóndigas de pollo en brocheta con salsa.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/11/Tsukune-Japanese-Chicken-Meatball-Skewers-3855-II.jpg' },
      { name: 'Yaki tomorokoshi', description: 'Mazorca de maíz a la parrilla con mantequilla y soya.', image: 'https://www.oksfood.com/image/yakitomorokoshi.jpg' },
      { name: 'Menchi katsu stick', description: 'Croqueta de carne frita en forma de bastón.', image: 'https://sudachirecipes.com/wp-content/uploads/2022/04/Menchi-Katsu-sq.png' },
      { name: 'Shioyaki ayu', description: 'Pez ayu a la parrilla, típico en festivales.', image: 'https://sudachirecipes.com/wp-content/uploads/2025/04/ayu-thumb.png' },
      { name: 'Oden street food', description: 'Mini porciones de oden en puestos callejeros.', image: 'https://en.wikipedia.org/wiki/Shizuoka_oden#/media/File:Shizoka_oden_9_20151022.jpg' },
      { name: 'Choco banana', description: 'Banana bañada en chocolate en palito.', image: 'https://blog.sakura.co/wp-content/uploads/2021/08/chocolate-bananas-1.jpg' },
      { name: 'Mitarashi dango', description: 'Bolitas de arroz pegajoso con salsa de soya dulce.', image: 'https://www.justonecookbook.com/wp-content/uploads/2019/09/Mitarashi-Dango-0697-II.jpg' },
      { name: 'Hanami dango', description: 'Bolitas de arroz de colores para festivales de cerezo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/03/Hanami-Dango-6504-II.jpg' },
      { name: 'Kushi dango', description: 'Brochetas de dango variadas.', image: 'https://media1.agfg.com.au/images/recipes/1654/hero-300.jpg' }
    ]
  },
  {
    category: 'Postres tradicionales y dulces',
    icon: '🍰',
    items: [
      { name: 'Mochi', description: 'Pastel de arroz glutinoso relleno de pasta de frijol o helado.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/08/Mochi-Ice-Cream-8680-I.jpg' },
      { name: 'Daifuku', description: 'Mochi relleno de pasta dulce.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/02/Daifuku-Mochi-8548-II.jpg' },
      { name: 'Anmitsu', description: 'Gelatina de agar con frutas, pasta de frijol y jarabe.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/11/Anmitsu-5302-II.jpg' },
      { name: 'Yokan', description: 'Gelatina firme de pasta de frijol y agar.', image: 'https://www.justonecookbook.com/wp-content/uploads/2015/10/Mizu-Yokan-II.jpg' },
      { name: 'Kuzumochi', description: 'Gelatina de almidón de kudzu espolvoreada con kinako.', image: 'https://blog.sakura.co/wp-content/uploads/2022/06/kuzumachi.png' },
      { name: 'Warabi mochi', description: 'Gelatina de helecho espolvoreada con kinako.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/03/Warabi-Mochi-1611-III.jpg' },
      { name: 'Imagawayaki', description: 'Pastel redondo relleno de crema o pasta de frijol.', image: 'https://www.justonecookbook.com/wp-content/uploads/2022/08/Japanese-Imagawayaki-9693.jpg' },
      { name: 'Taiyaki postre', description: 'Versión rellena de chocolate o crema pastelera.', image: 'https://norecipes.com/wp-content/uploads/2022/09/taiyaki-013.jpg' },
      { name: 'Monaka', description: 'Barquillo crujiente relleno de pasta de frijol.', image: 'https://cdn.shopify.com/s/files/1/0569/8224/1429/files/monaka_no_tsuki.jpg?v=1658833044' },
      { name: 'Kasutera', description: 'Bizcocho esponjoso importado de Portugal.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/04/Castella-Cake-8327-II.jpg' },
      { name: 'Matcha ice cream', description: 'Helado de té verde.', image: 'https://www.justonecookbook.com/wp-content/uploads/2021/08/Green-Tea-Ice-Cream-0120-II.jpg' },
      { name: 'Hojicha ice cream', description: 'Helado de té tostado.', image: 'https://sudachirecipes.com/wp-content/uploads/2022/08/hojicha-ice-cream-thumbnail.jpg' },
      { name: 'Azuki ice cream', description: 'Helado de frijol rojo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2020/12/Red-Bean-Ice-Cream-1158-II.jpg' },
      { name: 'Kintsuba', description: 'Dulce de pasta de frijol recubierto de harina y frito.', image: 'https://www.delectablehodgepodge.com/images/largerecipe/kintsuba.jpg' },
      { name: 'Yatsuhashi', description: 'Dulce de arroz y canela de Kyoto.', image: 'https://www.justonecookbook.com/wp-content/uploads/2023/01/Yatsuhashi-7144.jpg' },
      { name: 'Kuzuyu', description: 'Bebida dulce de kudzu caliente.', image: 'https://wawaza.com/products/pure-japanese-kudzu-root-powder/' },
      { name: 'Zenzai', description: 'Sopa dulce de frijol rojo con mochi.', image: 'https://www.justonecookbook.com/wp-content/uploads/2025/12/Zenzai-Sweet-Red-Bean-Soup-with-Mochi-7530-II.jpg' },
      { name: 'Oshiruko dulce', description: 'Versión más líquida de zenzai.', image: 'https://www.justonecookbook.com/wp-content/uploads/2024/04/Oshiruko-Red-Bean-Soup-8212-II.jpg' },
      { name: 'Kuzukiri', description: 'Fideos transparentes de kudzu con jarabe.', image: 'https://images.squarespace-cdn.com/content/v1/5cf7ddba98c8ee000167e0a5/5f69b2ee-1f64-412b-877e-4ea8b73a0e68/Kagizen-Yoshifusa-Shijo-04.jpg?format=2500w' },
      { name: 'Mizu yokan', description: 'Gelatina de frijol rojo fría para verano.', image: 'https://www.justonecookbook.com/wp-content/uploads/2015/10/Mizu-Yokan-II.jpg' },
      { name: 'Shiro-an daifuku', description: 'Mochi relleno de frijol blanco dulce.', image: 'https://www.justonecookbook.com/wp-content/uploads/2019/07/White-Bean-Paste-II.jpg' },
      { name: 'Sakuramochi', description: 'Mochi rosa con hoja de cerezo salada.', image: 'https://www.chopstickchronicles.com/wp-content/uploads/2024/03/sakura-mochi-15.jpg' },
      { name: 'Kuri kinton', description: 'Puré dulce de castaña, típico de Año Nuevo.', image: 'https://www.justonecookbook.com/wp-content/uploads/2019/12/Kuri-Kinton-7046-II.jpg' },
      { name: 'Hishi mochi', description: 'Mochi en capas de colores para el festival de chicas.', image: 'https://comerjapones.com/wp-content/uploads/4.hishimochi_1.jpg' }
    ]
  }
];

export default function Restaurants() {
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({ 
    '🍣 Sushi y Sashimi': true,
    '🍜 Ramen y fideos': false,
    '🍚 Donburi y platos con arroz': false,
    '🍤 Tempura y frituras': false,
    '🥞 Okonomiyaki y platos de sartén': false,
    '🍲 Guisos y platos calientes': false,
    '🍡 Snacks y comida callejera': false,
    '🍰 Postres tradicionales y dulces': false
  });

  const queryClient = useQueryClient();

  const { data: customFoodItems = [] } = useQuery({
    queryKey: ['foodItems'],
    queryFn: () => base44.entities.FoodItem.list()
  });

  // Inicializar FoodItems si no existen
  useEffect(() => {
    const initializeFoodItems = async () => {
      if (customFoodItems.length === 0) {
        const itemsToCreate = foodCategories.flatMap((cat) =>
          cat.items.map((food) => ({
            name: food.name,
            category: cat.category,
            description: food.description,
            default_image: food.image,
            image_url: food.image
          }))
        );
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
  const mergedGroupedFoodTypes = foodCategories.reduce((acc, cat) => {
    const mergedItems = cat.items.map((defaultFood) => {
      const customItem = customFoodItems.find((item) => item.name === defaultFood.name);
      return customItem ? {
        ...defaultFood,
        image: customItem.image_url || defaultFood.image,
        id: customItem.id
      } : defaultFood;
    });
    acc[`${cat.icon} ${cat.category}`] = mergedItems;
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

  const toggleCategory = (name) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
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
                onChange={(e) => setFoodSearchQuery(e.target.value)} className="bg-zinc-50 text-foreground pl-10 text-base rounded-md h-10 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-border placeholder:text-muted-foreground" />
              </div>
            </div>

            {Object.entries(filteredGroupedFoodTypes).length === 0 ?
          <div className="text-center py-12">
                <p className="text-muted-foreground font-light">No se encontraron resultados</p>
              </div> :

          <div className="grid gap-4">
                {Object.entries(filteredGroupedFoodTypes).map(([category, foods]) =>
              <Collapsible
                key={category}
                open={expandedCategories[category]}
                onOpenChange={() => toggleCategory(category)}>

                    <div className="glass border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-lg">
                      <CollapsibleTrigger className="bg-orange-200 px-6 py-5 text-left w-full flex items-center justify-between hover:bg-secondary/30 transition-colors">
                         <div className="flex items-center gap-4">
                           <div>
                             <span className="text-orange-700 text-lg font-bold">{category}</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>

                      <CollapsibleContent className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <div className="bg-orange-50 p-4">
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
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
              )}
              </div>
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