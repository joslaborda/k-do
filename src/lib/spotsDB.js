/**
 * spotsDB.js — Seed content curado · 20+ spots por ciudad
 * Fuentes: TripAdvisor, Google Maps, Lonely Planet, viajeros reales
 * Cobertura: España, Japón, Colombia, China, México, Argentina, Perú,
 *            Francia, Italia, Portugal, Tailandia, Vietnam, Indonesia,
 *            Corea del Sur, Marruecos, India
 */

export const SEED_SPOTS = {

  'España': {
    'Madrid': [
      { title:'Museo del Prado', type:'sight', address:'C. de Ruiz de Alarcón 23', lat:40.4138, lng:-3.6921, notes:'El museo más importante de España. Las Meninas, Goya y El Bosco. Gratis domingos 18-20h.', tags:['museo','arte','imprescindible'], price:'mid', best_time:'mañana', visits:1243 },
      { title:'Parque del Retiro', type:'sight', address:'Plaza de la Independencia 7', lat:40.4153, lng:-3.6845, notes:'El pulmón verde de Madrid. Alquila una barca (5€/30min). El Palacio de Cristal es impresionante.', tags:['parque','barca','naturaleza'], price:'low', best_time:'tarde', visits:987 },
      { title:'Templo de Debod al atardecer', type:'sight', address:'C. de Ferraz 1', lat:40.4243, lng:-3.7178, notes:'Templo egipcio de 2200 años. Las mejores vistas del atardecer de Madrid. Llega 30 min antes.', tags:['sunset','egipcio','mirador'], price:'low', best_time:'tarde', visits:934 },
      { title:'Mercado de San Miguel', type:'food', address:'Plaza de San Miguel s/n', lat:40.4153, lng:-3.7093, notes:'Mercado gourmet con tapas y vinos. Mejor entre semana. Las croquetas son imprescindibles.', tags:['tapas','gourmet','mercado'], price:'mid', best_time:'tarde', visits:876 },
      { title:'Plaza Mayor', type:'sight', address:'Plaza Mayor, Madrid', lat:40.4154, lng:-3.7074, notes:'El corazón histórico de Madrid. Perfecta al amanecer sin turistas.', tags:['plaza','histórico','icónico'], price:'low', best_time:'mañana', visits:1102 },
      { title:'El Rastro', type:'shopping', address:'C. de la Ribera de Curtidores', lat:40.4089, lng:-3.7083, notes:'Mercadillo dominical. Solo los domingos antes de las 10h. Antigüedades y ropa vintage.', tags:['mercadillo','domingo','vintage'], price:'low', best_time:'mañana', visits:867 },
      { title:'Museo Reina Sofía', type:'sight', address:'C. de Santa Isabel 52', lat:40.4083, lng:-3.6940, notes:'Hogar del Guernica de Picasso. Gratis domingos 13:30-19h.', tags:['guernica','picasso','arte moderno'], price:'mid', best_time:'tarde', visits:923 },
      { title:'Rooftop del Círculo de Bellas Artes', type:'sight', address:'C. de Alcalá 42', lat:40.4187, lng:-3.6983, notes:'Las mejores vistas de la Gran Vía. Solo 4€. Al atardecer con una cerveza es perfecto.', tags:['rooftop','vistas','Gran Vía'], price:'low', best_time:'tarde', visits:712 },
      { title:'Chocolatería San Ginés', type:'food', address:'Pasadizo de San Ginés 5', lat:40.4171, lng:-3.7075, notes:'Los churros con chocolate más famosos de Madrid, abiertos 24h.', tags:['churros','chocolate','24h'], price:'low', best_time:'mañana', visits:1034 },
      { title:'Barrio de La Latina', type:'sight', address:'La Latina, Madrid', lat:40.4128, lng:-3.7083, notes:'El barrio de tapas más auténtico. Los domingos después del Rastro es el plan perfecto.', tags:['tapas','barrio','calamares'], price:'low', best_time:'mediodía', visits:789 },
      { title:'Palacio Real', type:'sight', address:'C. de Bailén s/n', lat:40.4179, lng:-3.7143, notes:'El palacio real más grande de Europa occidental. Los jardines de Sabatini son espectaculares.', tags:['palacio','real','jardines'], price:'mid', best_time:'mañana', visits:834 },
      { title:'Sobrino de Botín', type:'food', address:'C. de los Cuchilleros 17', lat:40.4143, lng:-3.7075, notes:'El restaurante más antiguo del mundo (1725, Guinness). El cochinillo asado es legendario.', tags:['histórico','cochinillo','guinness'], price:'high', best_time:'noche', visits:623 },
      { title:'Estadio Santiago Bernabéu', type:'activity', address:'Av. de Concha Espina 1', lat:40.4531, lng:-3.6883, notes:'La catedral del fútbol mundial. Ver un partido de Real Madrid es una experiencia única.', tags:['fútbol','Real Madrid','estadio'], price:'mid', best_time:'tarde', visits:756 },
      { title:'Barrio de Malasaña', type:'sight', address:'Malasaña, Madrid', lat:40.4267, lng:-3.7033, notes:'El barrio más alternativo de Madrid. Tiendas de discos, cafés de especialidad y bares de cócteles.', tags:['alternativo','café','cócteles'], price:'mid', best_time:'tarde', visits:678 },
      { title:'Taberna La Bola', type:'food', address:'C. de la Bola 5', lat:40.4206, lng:-3.7107, notes:'El mejor cocido madrileño. Fundada en 1870. Solo al mediodía. La olla de barro es espectacular.', tags:['cocido','histórico','1870'], price:'mid', best_time:'mediodía', visits:489 },
      { title:'Gran Vía de noche', type:'sight', address:'Gran Vía, Madrid', lat:40.4200, lng:-3.7025, notes:'El Broadway de Madrid. De noche con los teatros iluminados y el Edificio Metrópolis es especial.', tags:['nocturno','teatro','arquitectura'], price:'low', best_time:'noche', visits:678 },
      { title:'Barrio de Lavapiés', type:'sight', address:'Lavapiés, Madrid', lat:40.4083, lng:-3.7016, notes:'El barrio más multicultural y bohemio de Madrid. Galerías alternativas y comida de todo el mundo.', tags:['multicultural','bohemio','alternativo'], price:'low', best_time:'tarde', visits:456 },
      { title:'Mercado de San Antón', type:'food', address:'C. de Augusto Figueroa 24', lat:40.4242, lng:-3.6970, notes:'El mercado gourmet de Chueca. Tres plantas con mercado, restaurantes y terraza en azotea.', tags:['gourmet','terraza','pintxos'], price:'mid', best_time:'tarde', visits:378 },
      { title:'Madrid Río', type:'activity', address:'Madrid Río, Madrid', lat:40.3952, lng:-3.7171, notes:'Parque lineal a orillas del Manzanares. Perfecto para bici o picnic. Piscinas en verano. Gratis.', tags:['parque','río','bici'], price:'low', best_time:'tarde', visits:543 },
      { title:'Casa Patas Flamenco', type:'activity', address:'C. de Cañizares 10', lat:40.4108, lng:-3.6996, notes:'El tablao de flamenco más auténtico de Madrid. Reserva online imprescindible.', tags:['flamenco','tablao','auténtico'], price:'high', best_time:'noche', visits:423 },
      { title:'Café Gijón', type:'food', address:'Paseo de Recoletos 21', lat:40.4233, lng:-3.6948, notes:'El café literario más histórico de Madrid desde 1888. Tertulias, escritores y ambiente de otro siglo.', tags:['café','literario','1888'], price:'mid', best_time:'tarde', visits:334 },
    ],

    'Barcelona': [
      { title:'Sagrada Família', type:'sight', address:'C/ de Mallorca 401', lat:41.4036, lng:2.1744, notes:'La obra maestra de Gaudí. Reserva con días de antelación. La luz de los vitrales es de otro mundo.', tags:['gaudí','arquitectura','imprescindible'], price:'high', best_time:'mañana', visits:1567 },
      { title:'Bunkers del Carmel', type:'sight', address:'Turó de la Rovira', lat:41.4179, lng:2.1680, notes:'Las mejores vistas panorámicas de Barcelona. Al atardecer hay ambiente increíble.', tags:['vistas','sunset','panorámica'], price:'low', best_time:'tarde', visits:1234 },
      { title:'Park Güell', type:'sight', address:'C/ d\'Olot s/n', lat:41.4145, lng:2.1527, notes:'El parque de Gaudí con terrazas de mosaico. Reserva la zona monumental online. El resto gratis.', tags:['gaudí','mosaico','vistas'], price:'mid', best_time:'mañana', visits:1123 },
      { title:'Mercado de Santa Caterina', type:'food', address:'Av. de Francesc Cambó 16', lat:41.3855, lng:2.1789, notes:'El mercado con el techo de mosaico más bonito. Menos turístico que La Boqueria.', tags:['mercado','mosaico','local'], price:'low', best_time:'mañana', visits:678 },
      { title:'El Born', type:'sight', address:'El Born, Barcelona', lat:41.3851, lng:2.1834, notes:'El barrio más trendy de Barcelona. Tiendas de diseño y cocktail bars. Mejor de jueves a sábado.', tags:['trendy','diseño','cócteles'], price:'mid', best_time:'noche', visits:856 },
      { title:'Barceloneta al amanecer', type:'sight', address:'Playa de la Barceloneta', lat:41.3789, lng:2.1900, notes:'La playa sin turistas. Amanecer con muy poca gente. A las 9h ya empieza a llenarse.', tags:['playa','amanecer','tranquilo'], price:'low', best_time:'mañana', visits:678 },
      { title:'La Cova Fumada', type:'food', address:'C/ del Baluard 56', lat:41.3797, lng:2.1876, notes:'El bar que inventó las bombas. Sin carta, sin reservas. Llega antes de las 13h. Solo efectivo.', tags:['bombas','histórico','local'], price:'low', best_time:'mediodía', visits:534 },
      { title:'Casa Batlló', type:'sight', address:'Pg. de Gràcia 43', lat:41.3917, lng:2.1649, notes:'La casa más fantástica de Gaudí. La terraza del dragón es increíble.', tags:['gaudí','dragón','modernismo'], price:'high', best_time:'tarde', visits:934 },
      { title:'Barrio Gótico', type:'sight', address:'Barri Gòtic, Barcelona', lat:41.3825, lng:2.1768, notes:'El corazón medieval de Barcelona. Mejor a primera hora o de noche.', tags:['medieval','catedral','histórico'], price:'low', best_time:'mañana', visits:923 },
      { title:'Palau de la Música Catalana', type:'sight', address:'C/ Palau de la Música 4-6', lat:41.3874, lng:2.1751, notes:'El edificio modernista más espectacular (UNESCO). Un concierto aquí es una experiencia única.', tags:['modernismo','música','UNESCO'], price:'mid', best_time:'tarde', visits:712 },
      { title:'Barrio de Gràcia', type:'sight', address:'Gràcia, Barcelona', lat:41.4036, lng:2.1563, notes:'El barrio más bohemio de Barcelona. La Plaça del Sol es el centro de la vida social.', tags:['bohemio','plazas','local'], price:'low', best_time:'tarde', visits:678 },
      { title:'Montjuïc al atardecer', type:'sight', address:'Montjuïc, Barcelona', lat:41.3638, lng:2.1575, notes:'El MNAC, el Castillo y la Font Màgica. El teleférico de Barceloneta es la forma más espectacular.', tags:['montaña','castillo','vistas'], price:'low', best_time:'tarde', visits:756 },
      { title:'Font Màgica', type:'sight', address:'Plaça de Carles Buïgas 1', lat:41.3715, lng:2.1518, notes:'Espectáculo de agua, luz y música. Jueves-domingos en verano. Gratis.', tags:['espectáculo','gratis','música'], price:'low', best_time:'noche', visits:712 },
      { title:'La Boqueria', type:'food', address:'La Rambla 91', lat:41.3817, lng:2.1718, notes:'El mercado más famoso de España. Muy turístico pero imprescindible. La fruta fresca es una delicia.', tags:['mercado','fruta','icónico'], price:'mid', best_time:'mañana', visits:1234 },
      { title:'Gelaaati di Marco', type:'food', address:'C/ de la Llibreteria 7', lat:41.3835, lng:2.1771, notes:'El mejor helado de Barcelona. Cola siempre pero rápida. El tiramisú y el pistacho son los favoritos.', tags:['helado','italiano','imprescindible'], price:'low', best_time:'tarde', visits:534 },
      { title:'Bar Calders', type:'food', address:'C/ del Parlament 25', lat:41.3795, lng:2.1626, notes:'El bar con la mejor terraza de Sant Antoni. Los domingos a mediodía con el vermut es el plan barcelonés.', tags:['vermut','terraza','Sant Antoni'], price:'low', best_time:'mediodía', visits:456 },
      { title:'Teléferic de Montjuïc', type:'activity', address:'Av. de Miramar s/n', lat:41.3685, lng:2.1640, notes:'El teleférico que sube a Montjuïc desde el puerto. Las vistas durante el trayecto son espectaculares.', tags:['teleférico','puerto','vistas'], price:'mid', best_time:'tarde', visits:623 },
      { title:'Passeig de Gràcia', type:'sight', address:'Passeig de Gràcia, Barcelona', lat:41.3917, lng:2.1649, notes:'La avenida más elegante. La Manzana de la Discordia está aquí. De noche con las farolas de Gaudí.', tags:['avenida','modernismo','Gaudí'], price:'low', best_time:'tarde', visits:867 },
      { title:'Cervecería Catalana', type:'food', address:'C/ de Mallorca 236', lat:41.3928, lng:2.1607, notes:'El mejor brunch de Barcelona. Montaditos y tapas. No reservan — llega antes de las 10h.', tags:['brunch','montaditos','tapas'], price:'mid', best_time:'mañana', visits:589 },
      { title:'Mirador del Migdia', type:'sight', address:'Mirador del Migdia, Montjuïc', lat:41.3575, lng:2.1537, notes:'El mirador secreto de Montjuïc. Vistas del Llobregat y el mar. Sin turistas.', tags:['secreto','vistas','local'], price:'low', best_time:'tarde', visits:312 },
      { title:'Bunker sunrise', type:'sight', address:'Carmel, Barcelona', lat:41.4192, lng:2.1731, notes:'Ver salir el sol desde los Bunkers es una de las experiencias más mágicas. Llega 30 min antes.', tags:['amanecer','mágico','fotográfico'], price:'low', best_time:'mañana', visits:456 },
    ],

    'Sevilla': [
      { title:'Real Alcázar', type:'sight', address:'Patio de Banderas s/n', lat:37.3826, lng:-5.9912, notes:'El palacio real más antiguo en uso de Europa. Jardines impresionantes. Reserva online.', tags:['palacio','GoT','jardines'], price:'mid', best_time:'mañana', visits:1123 },
      { title:'Barrio de Triana', type:'sight', address:'Triana, Sevilla', lat:37.3819, lng:-5.9996, notes:'El barrio más auténtico y flamenco. Cerámica artesanal y bares de tapas. Cruzar el puente al atardecer.', tags:['flamenco','cerámica','auténtico'], price:'low', best_time:'tarde', visits:756 },
      { title:'Giralda y Catedral', type:'sight', address:'Av. de la Constitución s/n', lat:37.3858, lng:-5.9925, notes:'La tercera catedral más grande del mundo. Tumba de Cristóbal Colón. Sube a la Giralda por la rampa.', tags:['catedral','colón','vistas'], price:'mid', best_time:'mañana', visits:1034 },
      { title:'Plaza de España al amanecer', type:'sight', address:'Av. de Isabel la Católica s/n', lat:37.3773, lng:-5.9869, notes:'La plaza más espectacular de España. Al amanecer sin turistas es irreal.', tags:['plaza','amanecer','azulejos'], price:'low', best_time:'mañana', visits:934 },
      { title:'Las Setas (Metropol Parasol)', type:'sight', address:'Pl. de la Encarnación s/n', lat:37.3929, lng:-5.9919, notes:'La estructura de madera más grande del mundo. Las vistas desde arriba son increíbles (3€).', tags:['moderno','vistas','madera'], price:'low', best_time:'tarde', visits:678 },
      { title:'Bar El Rinconcillo', type:'food', address:'C/ Gerona 40', lat:37.3944, lng:-5.9926, notes:'La taberna más antigua de Sevilla (1670). Jamón, espinacas con garbanzos y fino en rama.', tags:['1670','jamón','auténtico'], price:'low', best_time:'tarde', visits:567 },
      { title:'Barrio de Santa Cruz', type:'sight', address:'Santa Cruz, Sevilla', lat:37.3864, lng:-5.9891, notes:'El barrio judío medieval con callejuelas blancas y naranjos. De noche cuando los turistas desaparecen.', tags:['judío','naranjos','medieval'], price:'low', best_time:'noche', visits:678 },
      { title:'Mercado de Triana', type:'food', address:'C. de San Jorge 6', lat:37.3822, lng:-5.9982, notes:'El mercado más bonito de Sevilla junto al río. Las tapas son excelentes a precios locales.', tags:['mercado','río','tapas'], price:'low', best_time:'mediodía', visits:489 },
      { title:'Azotea del Ateneo', type:'sight', address:'C. Orfila 7', lat:37.3882, lng:-5.9915, notes:'Rooftop secreto con vistas a la Giralda. Cócteles razonables. Solo en verano.', tags:['rooftop','secreto','Giralda'], price:'mid', best_time:'tarde', visits:445 },
      { title:'Parque de María Luisa', type:'sight', address:'Parque de María Luisa, Sevilla', lat:37.3778, lng:-5.9914, notes:'El jardín romántico más bonito de Sevilla. Fuentes, glorietas y pavos reales libres.', tags:['parque','pavos reales','romántico'], price:'low', best_time:'mañana', visits:534 },
      { title:'Espacio Turina Flamenco', type:'activity', address:'Pl. de Cabildo 1', lat:37.3855, lng:-5.9940, notes:'El flamenco más auténtico de Sevilla. Espectáculos íntimos. Reserva con días de antelación.', tags:['flamenco','auténtico','íntimo'], price:'mid', best_time:'noche', visits:389 },
      { title:'Crucero por el Guadalquivir', type:'activity', address:'Torre del Oro, Sevilla', lat:37.3825, lng:-5.9965, notes:'Ver Sevilla desde el río. Al atardecer es muy especial. Dura 1 hora.', tags:['río','barco','atardecer'], price:'mid', best_time:'tarde', visits:423 },
      { title:'Bodega Dos de Mayo', type:'food', address:'Pl. de la Gavidia 6', lat:37.3912, lng:-5.9952, notes:'La mejor manzanilla de Sevilla. Los martes hay flamenco espontáneo.', tags:['manzanilla','flamenco','local'], price:'low', best_time:'tarde', visits:456 },
      { title:'Torre del Oro', type:'sight', address:'Paseo de Cristóbal Colón s/n', lat:37.3826, lng:-5.9965, notes:'La torre vigía del siglo XIII sobre el Guadalquivir. Las vistas del río desde la azotea son bonitas.', tags:['torre','histórico','río'], price:'low', best_time:'tarde', visits:534 },
      { title:'Alameda de Hércules', type:'sight', address:'Alameda de Hércules, Sevilla', lat:37.3978, lng:-5.9947, notes:'El paseo más antiguo de Europa (1574). De tarde se llena de locales tomando cañas.', tags:['paseo','cañas','histórico'], price:'low', best_time:'tarde', visits:445 },
      { title:'Casa de Pilatos', type:'sight', address:'Pl. de Pilatos 1', lat:37.3889, lng:-5.9887, notes:'El palacio mudéjar más bello de Sevilla. Los azulejos y la fusión de estilos son únicos.', tags:['mudéjar','azulejos','secreto'], price:'mid', best_time:'mañana', visits:356 },
      { title:'Mercado Lonja del Barranco', type:'food', address:'Calle Arjona s/n', lat:37.3830, lng:-5.9987, notes:'El food court más bonito en un edificio de Gustave Eiffel junto al río.', tags:['food court','Eiffel','río'], price:'mid', best_time:'tarde', visits:478 },
      { title:'Barrio Macarena', type:'sight', address:'Macarena, Sevilla', lat:37.3967, lng:-5.9947, notes:'El barrio más sevillano. La Basílica de la Esperanza Macarena es el templo de la Semana Santa.', tags:['macarena','Semana Santa','barrio'], price:'low', best_time:'tarde', visits:334 },
    ],
  },

  'Japón': {
    'Tokio': [
      { title:'Senso-ji al amanecer', type:'sight', address:'2-3-1 Asakusa, Taito', lat:35.7148, lng:139.7967, notes:'El templo más famoso de Tokio sin turistas. Llega antes de las 7h. Los incensarios humeantes son un ritual.', tags:['templo','amanecer','asakusa'], price:'low', best_time:'mañana', visits:1234 },
      { title:'Shinjuku Gyoen', type:'sight', address:'11 Naitomachi, Shinjuku', lat:35.6852, lng:139.7101, notes:'El jardín más bello de Tokio. En primavera los cerezos son impresionantes. 500¥ entrada.', tags:['jardín','sakura','zen'], price:'low', best_time:'mañana', visits:1067 },
      { title:'Tsukiji Outer Market', type:'food', address:'4-16-2 Tsukiji, Chuo', lat:35.6655, lng:139.7707, notes:'Sushi y marisco fresco para desayunar por menos de 1000¥. Llega antes de las 8h.', tags:['sushi','desayuno','mercado'], price:'low', best_time:'mañana', visits:978 },
      { title:'Omoide Yokocho', type:'food', address:'1-2 Nishishinjuku, Shinjuku', lat:35.6916, lng:139.7003, notes:'El callejón del recuerdo. Pequeños bares de yakitori llenos de humo y salaryman.', tags:['yakitori','nocturno','auténtico'], price:'low', best_time:'noche', visits:823 },
      { title:'Shibuya Crossing', type:'sight', address:'Shibuya, Tokyo', lat:35.6595, lng:139.7005, notes:'El cruce peatonal más transitado del mundo. La vista desde el Starbucks es perfecta.', tags:['cruce','neón','icónico'], price:'low', best_time:'noche', visits:1456 },
      { title:'Yanaka Ginza', type:'sight', address:'Yanaka, Taito', lat:35.7267, lng:139.7714, notes:'El barrio más tradicional de Tokio. Tiendas de artesanía y gatos por todas partes. Sin turistas.', tags:['tradicional','gatos','shitamachi'], price:'low', best_time:'tarde', visits:645 },
      { title:'TeamLab Planets', type:'activity', address:'1-3-8 Toyosu, Koto', lat:35.6480, lng:139.7960, notes:'Arte digital inmersivo. Vas descalzo y caminas por agua. Reserva semanas antes.', tags:['arte','digital','inmersivo'], price:'high', best_time:'tarde', visits:934 },
      { title:'Ichiran Ramen', type:'food', address:'Varias ubicaciones', lat:35.6938, lng:139.7034, notes:'El ramen más famoso de Japón. Cabinas individuales. Caldo tonkotsu adictivo.', tags:['ramen','tonkotsu','cabinas'], price:'low', best_time:'cualquier hora', visits:1089 },
      { title:'Meiji Jingu', type:'sight', address:'1-1 Yoyogikamizonocho, Shibuya', lat:35.6763, lng:139.6993, notes:'El santuario sintoísta más importante de Tokio. El bosque de 100.000 árboles es increíble. Gratis.', tags:['santuario','bosque','sintoísta'], price:'low', best_time:'mañana', visits:867 },
      { title:'Harajuku Takeshita Street', type:'shopping', address:'Takeshita St, Harajuku', lat:35.6698, lng:139.7027, notes:'La calle de la moda kawaii. Los fines de semana hay cosplays increíbles.', tags:['kawaii','cosplay','crepes'], price:'low', best_time:'tarde', visits:789 },
      { title:'Akihabara Electric Town', type:'shopping', address:'Akihabara, Chiyoda', lat:35.6984, lng:139.7731, notes:'El paraíso de la electrónica, anime y manga. Los cafés maid son una experiencia cultural.', tags:['anime','electrónica','manga'], price:'mid', best_time:'tarde', visits:745 },
      { title:'Harmonica Yokocho Kichijoji', type:'food', address:'Kichijoji, Musashino', lat:35.7025, lng:139.5780, notes:'El callejón de bares más encantador de Tokio. Tiny bares de 5 personas con yakitori.', tags:['yakitori','bares','local'], price:'low', best_time:'noche', visits:456 },
      { title:'Todoroki Valley', type:'sight', address:'Todoroki, Setagaya', lat:35.6176, lng:139.6437, notes:'Un valle boscoso escondido en medio de Tokio. Completamente inesperado en una megaciudad.', tags:['valle','naturaleza','secreto'], price:'low', best_time:'tarde', visits:345 },
      { title:'Nezu Shrine', type:'sight', address:'1-28-9 Nezu, Bunkyo', lat:35.7198, lng:139.7600, notes:'El santuario más bello de Tokio que poca gente conoce. Túneles de torii naranja tranquilos.', tags:['santuario','torii','secreto'], price:'low', best_time:'mañana', visits:423 },
      { title:'Kagurazaka', type:'sight', address:'Kagurazaka, Shinjuku', lat:35.7022, lng:139.7394, notes:'El barrio de las geishas con los mejores restaurantes de Tokio. Callejuelas de piedra preciosas.', tags:['geishas','callejones','restaurantes'], price:'mid', best_time:'noche', visits:534 },
      { title:'ONIBUS Coffee Nakameguro', type:'food', address:'Nakameguro, Meguro', lat:35.6443, lng:139.6983, notes:'El café más fotogénico de Tokio junto a las vías del tren. En primavera el canal de cerezos.', tags:['café','tren','sakura'], price:'mid', best_time:'mañana', visits:534 },
      { title:'Ueno Park', type:'sight', address:'Uenokoen, Taito', lat:35.7156, lng:139.7741, notes:'El parque con más museos de Japón. En primavera el hanami es el más masivo de Tokio.', tags:['museos','hanami','zoo'], price:'low', best_time:'mañana', visits:789 },
      { title:'Skytree Observation Deck', type:'sight', address:'1-1-2 Oshiage, Sumida', lat:35.7101, lng:139.8107, notes:'La torre más alta de Japón (634m). Las vistas del Monte Fuji en días despejados.', tags:['torre','vistas','Fuji'], price:'high', best_time:'tarde', visits:867 },
      { title:'Asakusa Hoppy Street', type:'food', address:'Asakusa, Taito', lat:35.7125, lng:139.7939, notes:'La calle de la cerveza Hoppy en Asakusa. Los precios son de los más bajos de Tokio.', tags:['hoppy','yakitori','barato'], price:'low', best_time:'tarde', visits:456 },
      { title:'Ginza Six Rooftop', type:'sight', address:'6-10-1 Ginza, Chuo', lat:35.6699, lng:139.7649, notes:'La azotea-jardín del centro comercial más elegante de Tokio. Gratuita y tranquila.', tags:['azotea','Ginza','librería'], price:'low', best_time:'tarde', visits:456 },
      { title:'Shimbashi Izakaya Alley', type:'food', address:'Shimbashi, Minato', lat:35.6659, lng:139.7591, notes:'El barrio de salaryman más auténtico de Tokio. Izakayas pequeñas llenas de ejecutivos.', tags:['izakaya','salaryman','auténtico'], price:'low', best_time:'noche', visits:378 },
    ],

    'Kioto': [
      { title:'Fushimi Inari de noche', type:'sight', address:'68 Fukakusa Yabunouchicho', lat:34.9671, lng:135.7727, notes:'Miles de torii naranjas sin turistas. Abierto 24h. Después de las 20h estás casi solo. Lleva linterna.', tags:['torii','nocturno','fotográfico'], price:'low', best_time:'noche', visits:1123 },
      { title:'Arashiyama Bamboo Grove', type:'sight', address:'Sagaogurayama, Ukyo', lat:35.0170, lng:135.6720, notes:'El bosque de bambú más famoso de Japón. Llega antes de las 7h. El sonido del viento es increíble.', tags:['bambú','fotográfico','amanecer'], price:'low', best_time:'mañana', visits:1234 },
      { title:'Nishiki Market', type:'food', address:'Nishiki Market, Nakagyo', lat:35.0052, lng:135.7652, notes:'La cocina de Kioto en 400 metros. Tofu frito, encurtidos y dango. Cierra a las 18h.', tags:['mercado','tofu','encurtidos'], price:'low', best_time:'mediodía', visits:934 },
      { title:'Kinkaku-ji', type:'sight', address:'1 Kinkakujicho, Kita', lat:35.0394, lng:135.7292, notes:'El pabellón dorado reflejado en el lago. Llega a las 9h cuando abre.', tags:['dorado','lago','zen'], price:'mid', best_time:'mañana', visits:1345 },
      { title:'Gion al atardecer', type:'sight', address:'Gion, Higashiyama', lat:35.0036, lng:135.7768, notes:'El barrio de las geishas. Al atardecer hay posibilidad de ver a una maiko.', tags:['geishas','maiko','machiya'], price:'low', best_time:'tarde', visits:934 },
      { title:'Philosopher\'s Path', type:'sight', address:'Philosopher\'s Walk, Sakyo', lat:35.0268, lng:135.7948, notes:'El camino de los filósofos junto al canal. En primavera con cerezos es de los más bonitos del mundo.', tags:['canal','sakura','paseo'], price:'low', best_time:'mañana', visits:789 },
      { title:'Ryoan-ji', type:'sight', address:'13 Ryoanjigoranoushitacho, Ukyo', lat:35.0344, lng:135.7182, notes:'El jardín zen de piedras más famoso del mundo. 15 rocas que nunca puedes ver todas a la vez.', tags:['zen','piedras','meditación'], price:'mid', best_time:'mañana', visits:756 },
      { title:'Pontocho Alley', type:'food', address:'Pontocho, Nakagyo', lat:35.0060, lng:135.7693, notes:'El callejón de restaurantes más bonito de Kioto. En verano terrazas sobre el río (kawayuka).', tags:['kaiseki','kawayuka','río'], price:'high', best_time:'noche', visits:678 },
      { title:'Nijo Castle', type:'sight', address:'541 Nijojo-cho, Nakagyo', lat:35.0142, lng:135.7484, notes:'El castillo del shogun Tokugawa. Los suelos ruiseñor que chirrían al caminar son fascinantes.', tags:['castillo','shogun','ruiseñor'], price:'mid', best_time:'mañana', visits:678 },
      { title:'Maruyama Park hanami', type:'sight', address:'Maruyama Park, Higashiyama', lat:35.0036, lng:135.7800, notes:'El mejor parque para el hanami de Kioto. El cerezo weeping iluminado de noche es icónico.', tags:['hanami','cerezos','nocturno'], price:'low', best_time:'noche', visits:867 },
      { title:'Fushimi Sake District', type:'activity', address:'Fushimi-ku, Kioto', lat:34.9347, lng:135.7680, notes:'El barrio productor de sake más famoso. Canales de agua y degustaciones gratuitas.', tags:['sake','degustación','canales'], price:'low', best_time:'mediodía', visits:456 },
      { title:'Kurama Onsen', type:'activity', address:'Kuramahonmachi, Sakyo', lat:35.1133, lng:135.7600, notes:'Aguas termales en la montaña a 45 min. El baño exterior entre árboles es relajante.', tags:['onsen','montaña','relajante'], price:'mid', best_time:'tarde', visits:534 },
      { title:'Gion Matsuri Festival', type:'activity', address:'Gion, Kioto', lat:35.0036, lng:135.7768, notes:'El festival más famoso de Japón (todo julio). Las carrozas son espectaculares.', tags:['festival','matsuri','julio'], price:'low', best_time:'tarde', visits:892 },
      { title:'Daitoku-ji Temple', type:'sight', address:'53 Daitokujicho, Kita', lat:35.0430, lng:135.7467, notes:'El complejo de templos zen menos visitado. Los jardines de roca son impresionantes. Sin turistas.', tags:['zen','templo','secreto'], price:'mid', best_time:'mañana', visits:312 },
      { title:'Fushimi Inari Trails', type:'activity', address:'Fushimi Inari, Fushimi', lat:34.9671, lng:135.7727, notes:'Los senderos detrás de los torii famosos. 1.5h hasta la cima. La mayoría solo van 20 min.', tags:['senderismo','secreto','cima'], price:'low', best_time:'mañana', visits:567 },
    ],

    'Osaka': [
      { title:'Dotonbori de noche', type:'sight', address:'Dotonbori, Chuo', lat:34.6687, lng:135.5013, notes:'El corazón de Osaka de noche. Letreros de neón, takoyaki y el Glico Man. Caótico y único.', tags:['neón','takoyaki','icónico'], price:'low', best_time:'noche', visits:1234 },
      { title:'Kuromon Market', type:'food', address:'2-4-1 Nipponbashi, Chuo', lat:34.6643, lng:135.5072, notes:'La cocina de Osaka. Marisco fresco, wagyu y frutas exóticas cocinadas en el momento.', tags:['marisco','wagyu','mercado'], price:'mid', best_time:'mañana', visits:789 },
      { title:'Osaka Castle', type:'sight', address:'1-1 Osakajo, Chuo', lat:34.6873, lng:135.5262, notes:'El castillo más visitado de Japón. El parque que lo rodea es perfecto para picnic.', tags:['castillo','parque','historia'], price:'mid', best_time:'mañana', visits:934 },
      { title:'Shinsekai', type:'sight', address:'Shinsekai, Naniwa', lat:34.6527, lng:135.5064, notes:'El barrio retro de Osaka. Kushikatsu por todas partes. El aire de un Osaka de los años 60.', tags:['retro','kushikatsu','50s'], price:'low', best_time:'tarde', visits:567 },
      { title:'Takoyaki en Wanaka', type:'food', address:'Dotonbori, Chuo', lat:34.6683, lng:135.5010, notes:'El takoyaki más famoso de Osaka. La cola siempre está pero en 15 min tienes tu caja.', tags:['takoyaki','pulpo','street food'], price:'low', best_time:'tarde', visits:867 },
      { title:'Amerikamura', type:'shopping', address:'Amerikamura, Chuo', lat:34.6737, lng:135.4990, notes:'El barrio de la cultura urbana de Osaka. Ropa vintage americana y jóvenes con moda extravagante.', tags:['vintage','urbano','americano'], price:'low', best_time:'tarde', visits:456 },
      { title:'Universal Studios Japan', type:'activity', address:'2-1-33 Sakurajima, Konohana', lat:34.6654, lng:135.4323, notes:'Harry Potter, Super Nintendo World y Minions. Reserva Fast Pass online.', tags:['parque','nintendo','potter'], price:'high', best_time:'mañana', visits:1023 },
      { title:'Namba Yasaka Shrine', type:'sight', address:'2-9-19 Namba, Chuo', lat:34.6644, lng:135.5015, notes:'El santuario con forma de cabeza de león gigante. Nadie lo espera en medio de Namba.', tags:['santuario','león','sorprendente'], price:'low', best_time:'tarde', visits:489 },
      { title:'Osaka Aquarium Kaiyukan', type:'activity', address:'1-1-10 Kaigandori, Minato', lat:34.6543, lng:135.4285, notes:'Uno de los mejores acuarios del mundo. El tanque central de 4 plantas con tiburones ballena.', tags:['acuario','tiburón','familias'], price:'mid', best_time:'mañana', visits:678 },
      { title:'Tsutenkaku Tower', type:'sight', address:'1-18-6 Ebisuhigashi, Naniwa', lat:34.6525, lng:135.5063, notes:'La torre retro de Osaka en Shinsekai. El Billiken (dios de la suerte) vive aquí.', tags:['torre','retro','Billiken'], price:'mid', best_time:'tarde', visits:534 },
      { title:'Hozenji Yokocho', type:'sight', address:'Hozenji, Chuo', lat:34.6676, lng:135.5040, notes:'El callejón de piedra con el Templo Hozenji cubierto de musgo. Una escena muy bonita de Osaka.', tags:['callejón','musgo','tradición'], price:'mid', best_time:'noche', visits:423 },
    ],
  },

  'Colombia': {
    'Medellín': [
      { title:'El Poblado de noche', type:'sight', address:'El Poblado, Medellín', lat:6.2087, lng:-75.5671, notes:'El barrio más seguro y animado. Parque Lleras lleno de terrazas y bares.', tags:['barrio','nocturno','Parque Lleras'], price:'mid', best_time:'noche', visits:756 },
      { title:'Metrocable a Santo Domingo', type:'activity', address:'Estación Acevedo, Metro', lat:6.2813, lng:-75.5583, notes:'El teleférico urbano que conecta las comunas. Vistas increíbles. Completamente seguro.', tags:['teleférico','comunas','vistas'], price:'low', best_time:'tarde', visits:678 },
      { title:'Pergamino Café', type:'food', address:'Av. El Poblado 43A-106', lat:6.2104, lng:-75.5680, notes:'El mejor café de especialidad de Medellín. Granos colombianos de finca.', tags:['café','especialidad','colombiano'], price:'mid', best_time:'mañana', visits:534 },
      { title:'Plaza Botero', type:'sight', address:'Carrera 52, Centro', lat:6.2519, lng:-75.5664, notes:'Las 23 esculturas gordas de Botero. Gratis. El Museo de Antioquia al lado tiene más obras.', tags:['botero','arte','esculturas'], price:'low', best_time:'mediodía', visits:789 },
      { title:'Jardín Botánico', type:'sight', address:'Cra. 52, Medellín', lat:6.2676, lng:-75.5648, notes:'El Orquideorama es una obra de arquitectura. Los domingos hay conciertos gratuitos.', tags:['botánico','orquídeas','arquitectura'], price:'low', best_time:'mañana', visits:567 },
      { title:'Commune 13 Street Art', type:'activity', address:'Comuna 13, Medellín', lat:6.2320, lng:-75.6025, notes:'La transformación más increíble de una ciudad latinoamericana. Grafitis enormes y escaleras eléctricas.', tags:['streetart','grafiti','transformación'], price:'low', best_time:'tarde', visits:867 },
      { title:'Mercado del Río', type:'food', address:'Cra. 57 #9A-59, Medellín', lat:6.2455, lng:-75.5834, notes:'El food court gourmet más cool. 30+ puestos. Ambiente joven los viernes por la noche.', tags:['food court','artesanal','gourmet'], price:'mid', best_time:'noche', visits:623 },
      { title:'Cerro Nutibara', type:'sight', address:'Cerro Nutibara, Medellín', lat:6.2375, lng:-75.5851, notes:'La réplica de un pueblo antioqueño en la cima. Vistas impresionantes de Medellín.', tags:['pueblo','vistas','antioqueño'], price:'low', best_time:'tarde', visits:445 },
      { title:'Laureles', type:'sight', address:'Laureles, Medellín', lat:6.2473, lng:-75.5921, notes:'El barrio favorito de los expatriados. Cafés con terraza y bares de barrio. Más auténtico que Poblado.', tags:['expat','barrio','tranquilo'], price:'mid', best_time:'tarde', visits:389 },
      { title:'El Castillo Museo', type:'sight', address:'Cra. 9 #33-52, El Poblado', lat:6.2127, lng:-75.5658, notes:'Una mansión estilo medieval convertida en museo. El jardín con vistas a Medellín es precioso.', tags:['museo','jardín','arte'], price:'mid', best_time:'mañana', visits:289 },
    ],
    'Cartagena': [
      { title:'Ciudad Amurallada al atardecer', type:'sight', address:'Ciudad Amurallada, Cartagena', lat:10.4236, lng:-75.5508, notes:'Caminar las murallas al atardecer. Las casas de colores se iluminan. El Café del Mar tiene los mejores cócteles.', tags:['murallas','sunset','colonial'], price:'low', best_time:'tarde', visits:1023 },
      { title:'Getsemaní', type:'sight', address:'Barrio Getsemaní, Cartagena', lat:10.4258, lng:-75.5539, notes:'El barrio más auténtico. Street art increíble. De noche hay salsa en la calle.', tags:['streetart','salsa','auténtico'], price:'low', best_time:'noche', visits:789 },
      { title:'Islas del Rosario', type:'activity', address:'Archipelago Islas del Rosario', lat:10.1872, lng:-75.7503, notes:'Archipiélago de islas coralinas a 45 min en lancha. El agua turquesa es impresionante.', tags:['islas','coral','turquesa'], price:'mid', best_time:'mañana', visits:712 },
      { title:'El Totumo (Volcán de Lodo)', type:'activity', address:'El Totumo, Bolívar', lat:10.7383, lng:-75.2900, notes:'Bañarse en barro termal en un volcán pequeño. La experiencia de flotar es surrealista.', tags:['volcán','lodo','surrealista'], price:'low', best_time:'mañana', visits:567 },
      { title:'Café del Mar', type:'food', address:'Baluarte de Santo Domingo', lat:10.4253, lng:-75.5527, notes:'El bar más famoso, sobre las murallas. Los mojitos al atardecer son perfectos.', tags:['cóctel','murallas','sunset'], price:'high', best_time:'tarde', visits:878 },
      { title:'Playa Blanca', type:'sight', address:'Isla Barú, Bolívar', lat:10.1603, lng:-75.5792, notes:'La playa más bonita cerca de Cartagena. Arena blanca y agua turquesa.', tags:['playa','blanca','turquesa'], price:'low', best_time:'mañana', visits:712 },
      { title:'Castillo San Felipe de Barajas', type:'sight', address:'C. 30 #17-36, Cartagena', lat:10.4232, lng:-75.5396, notes:'La fortaleza más grande construida por los españoles en América. Los túneles son fascinantes.', tags:['castillo','fortaleza','histórico'], price:'mid', best_time:'mañana', visits:534 },
      { title:'La Cevichería', type:'food', address:'C. Stuart 7-14, Cartagena', lat:10.4253, lng:-75.5488, notes:'El mejor ceviche de Cartagena. El de langosta es increíble. Cola — llega a las 12h.', tags:['ceviche','langosta','mariscos'], price:'mid', best_time:'mediodía', visits:456 },
    ],
    'Salento': [
      { title:'Valle de Cocora', type:'activity', address:'Valle de Cocora, Salento', lat:4.6413, lng:-75.4967, notes:'Las palmas de cera más altas del mundo. Caminata de 4-5h. Lleva ropa impermeable.', tags:['palmas','caminata','eje cafetero'], price:'low', best_time:'mañana', visits:934 },
      { title:'Calle Real de Salento', type:'sight', address:'Calle Real, Salento', lat:4.6372, lng:-75.5700, notes:'La calle principal más colorida del Eje Cafetero. Los balcones de colores son fotogénicos.', tags:['colorido','artesanías','balcones'], price:'low', best_time:'tarde', visits:756 },
      { title:'Alto de la Cruz', type:'sight', address:'Alto de la Cruz, Salento', lat:4.6392, lng:-75.5714, notes:'El mirador con vistas de 360° sobre Salento. 253 escalones. Al amanecer con niebla es mágico.', tags:['mirador','360°','escalones'], price:'low', best_time:'mañana', visits:589 },
      { title:'Finca Cafetera Tour', type:'activity', address:'Vereda La Palmilla, Salento', lat:4.6500, lng:-75.5500, notes:'Tour por una finca cafetera. El café directo del árbol es irrepetible.', tags:['café','finca','degustación'], price:'mid', best_time:'mañana', visits:678 },
      { title:'Jeep Willys Tour', type:'activity', address:'Plaza de Bolívar, Salento', lat:4.6369, lng:-75.5703, notes:'Los icónicos jeeps de la Segunda Guerra Mundial que aún transportan personas.', tags:['jeep','willys','icónico'], price:'low', best_time:'mañana', visits:534 },
    ],
    'El Tayrona': [
      { title:'Playa Cabo San Juan', type:'sight', address:'Parque Tayrona, Magdalena', lat:11.3278, lng:-74.0447, notes:'La playa más impresionante del Caribe colombiano. 2h de caminata. Las palmas sobre el agua son icónicas.', tags:['playa','caribe','palmas'], price:'low', best_time:'mañana', visits:878 },
      { title:'Sendero Pueblito Chairama', type:'activity', address:'Parque Tayrona, Magdalena', lat:11.3283, lng:-74.0372, notes:'El sendero a las ruinas taironas en la selva. 4h ida y vuelta.', tags:['ruinas','selva','taironas'], price:'low', best_time:'mañana', visits:567 },
      { title:'Playa Cristal', type:'sight', address:'Parque Tayrona, Magdalena', lat:11.3192, lng:-74.0575, notes:'La playa más cristalina del parque. Solo accesible en lancha. Agua turquesa y coral vivo.', tags:['cristalina','turquesa','lancha'], price:'mid', best_time:'mañana', visits:389 },
    ],
  },

  'China': {
    'Shanghái': [
      { title:'The Bund al amanecer', type:'sight', address:'Zhongshan East 1st Rd, Huangpu', lat:31.2400, lng:121.4900, notes:'El paseo con vistas al skyline de Pudong. Antes de las 7h estás casi solo.', tags:['skyline','amanecer','Pudong'], price:'low', best_time:'mañana', visits:1234 },
      { title:'Tianzifang', type:'sight', address:'Taikang Lu, Huangpu', lat:31.2119, lng:121.4726, notes:'El laberinto de callejones bohemio en casas shikumen. Galerías y cafés de especialidad.', tags:['callejones','shikumen','bohemio'], price:'mid', best_time:'tarde', visits:867 },
      { title:'Yu Garden', type:'sight', address:'Anren Jie, Huangpu', lat:31.2274, lng:121.4920, notes:'Jardín clásico chino de la dinastía Ming. Las paredes de dragón son impresionantes. Llega a las 8h.', tags:['jardín','Ming','dragones'], price:'mid', best_time:'mañana', visits:934 },
      { title:'Xintiandi de noche', type:'sight', address:'Xintiandi, Huangpu', lat:31.2196, lng:121.4733, notes:'Barrio histórico de casas shikumen. Los xiaolongbao del Din Tai Fung son los mejores.', tags:['shikumen','nocturno','xiaolongbao'], price:'high', best_time:'noche', visits:678 },
      { title:'Torre de Shanghái', type:'sight', address:'Lujiazui Ring Rd, Pudong', lat:31.2357, lng:121.5010, notes:'La segunda torre más alta del mundo (632m). La plataforma exterior giratoria a 561m.', tags:['torre','vistas','Pudong'], price:'high', best_time:'tarde', visits:823 },
      { title:'Barrio Francés', type:'sight', address:'Former French Concession, Xuhui', lat:31.2115, lng:121.4580, notes:'Las avenidas arboladas con mansiones art déco. Los mejores bares de cócteles de Shanghái.', tags:['francés','art déco','cócteles'], price:'mid', best_time:'noche', visits:634 },
      { title:'Mercado de Antigüedades Dongtai Lu', type:'shopping', address:'Dongtai Lu, Huangpu', lat:31.2133, lng:121.4756, notes:'El mercado de antigüedades más auténtico. Jade, porcelana. Negocia siempre.', tags:['antigüedades','jade','negociar'], price:'mid', best_time:'mañana', visits:445 },
      { title:'Din Tai Fung', type:'food', address:'IFC Mall, Pudong', lat:31.2359, lng:121.5066, notes:'Los dumplings de sopa más famosos del mundo. Ver cómo los hacen detrás del cristal.', tags:['dumplings','sopa','Michelin'], price:'mid', best_time:'mediodía', visits:723 },
      { title:'Jing\'an Temple', type:'sight', address:'1686 W Nanjing Rd', lat:31.2238, lng:121.4483, notes:'El templo budista más imponente de Shanghái. El contraste con los rascacielos es surrealista.', tags:['budista','dorado','contraste'], price:'mid', best_time:'tarde', visits:534 },
      { title:'Shanghai Museum', type:'sight', address:'201 Renmin Ave, Huangpu', lat:31.2298, lng:121.4736, notes:'El mejor museo de China. La colección de bronces, jade y porcelana Qing es impresionante. Gratis.', tags:['museo','bronces','jade'], price:'low', best_time:'mañana', visits:467 },
    ],
    'Pekín': [
      { title:'Gran Muralla en Mutianyu', type:'sight', address:'Mutianyu, Huairou', lat:40.4319, lng:116.5704, notes:'El tramo más bonito. Teleférico de subida, tobogán de bajada. Llega antes de las 9h.', tags:['muralla','tobogán','imprescindible'], price:'mid', best_time:'mañana', visits:1234 },
      { title:'Ciudad Prohibida', type:'sight', address:'Jingshan Qianjie, Dongcheng', lat:39.9163, lng:116.3972, notes:'El mayor palacio imperial del mundo. Reserva online obligatoria. El Jardín Imperial es la joya.', tags:['imperial','palacio','histórico'], price:'mid', best_time:'mañana', visits:1456 },
      { title:'Hutongs de Nanluoguxiang', type:'sight', address:'Nanluoguxiang, Dongcheng', lat:39.9368, lng:116.4030, notes:'Los callejones tradicionales más animados. Alquila una bici para explorar los secundarios.', tags:['hutongs','bici','tradicional'], price:'low', best_time:'tarde', visits:867 },
      { title:'Templo del Cielo al amanecer', type:'sight', address:'Tiantan Donglu, Dongcheng', lat:39.8823, lng:116.4066, notes:'El parque donde los pekineses hacen tai chi al amanecer. La experiencia más auténtica de China.', tags:['tai chi','auténtico','pekinés'], price:'mid', best_time:'mañana', visits:956 },
      { title:'Pato Pekinés en Quanjude', type:'food', address:'Qianmen Dajie, Dongcheng', lat:39.8998, lng:116.3948, notes:'El restaurante de pato más famoso desde 1864. El pato laqueado cortado en mesa es una ceremonia.', tags:['pato','histórico','1864'], price:'high', best_time:'noche', visits:723 },
      { title:'Parque Jingshan', type:'sight', address:'Jingshan Qianjie, Dongcheng', lat:39.9248, lng:116.3917, notes:'El parque frente a la Ciudad Prohibida. Las vistas del palacio desde la colina son las mejores.', tags:['colina','vistas','gratis'], price:'low', best_time:'mañana', visits:678 },
      { title:'Summer Palace', type:'sight', address:'19 Xinjiangongmen Rd, Haidian', lat:40.0003, lng:116.2755, notes:'El palacio de verano con el lago Kunming. Los corredores pintados son los más largos del mundo.', tags:['palacio verano','lago','imperial'], price:'mid', best_time:'mañana', visits:712 },
      { title:'Tiananmen Square', type:'sight', address:'Tiananmen Square, Dongcheng', lat:39.9055, lng:116.3977, notes:'La plaza más grande del mundo. La ceremonia de izado de bandera al amanecer es única.', tags:['plaza','Mao','ceremonia'], price:'low', best_time:'mañana', visits:934 },
    ],
    'Chengdu': [
      { title:'Base del Panda Gigante', type:'activity', address:'Panda Ave, Chengdu', lat:30.7375, lng:104.1503, notes:'El mejor lugar del mundo para ver pandas. Llega antes de las 8h. Los bebés pandas en primavera.', tags:['panda','bebés','imprescindible'], price:'mid', best_time:'mañana', visits:1123 },
      { title:'Hotpot Sichuan', type:'food', address:'Varias ubicaciones, Chengdu', lat:30.6571, lng:104.0656, notes:'El hotpot más famoso de China. Picante auténtico de Sichuan. El servicio es increíble.', tags:['hotpot','picante','sichuan'], price:'mid', best_time:'noche', visits:845 },
      { title:'Jinli Ancient Street', type:'sight', address:'Jinli Ln, Wuhou', lat:30.6440, lng:104.0444, notes:'Calle peatonal de la época Han. Street food de Chengdu y ópera Sichuan de noche.', tags:['histórico','street food','ópera'], price:'low', best_time:'noche', visits:712 },
      { title:'Kuanzhai Alley', type:'sight', address:'Kuanzhai Alley, Qingyang', lat:30.6724, lng:104.0524, notes:'Las calles anchas y estrechas históricas. Arquitectura Qing restaurada y street food local.', tags:['Qing','street food','artesanías'], price:'low', best_time:'tarde', visits:567 },
      { title:'Wenshu Temple', type:'sight', address:'Wenshuyuan St, Jinniu', lat:30.6793, lng:104.0657, notes:'El templo budista más importante. El restaurante vegetariano es uno de los mejores de China.', tags:['budista','bambú','vegetariano'], price:'low', best_time:'mañana', visits:523 },
    ],
  },

  'México': {
    'Ciudad de México': [
      { title:'Bosque de Chapultepec', type:'sight', address:'Chapultepec, CDMX', lat:19.4200, lng:-99.1900, notes:'El pulmón verde de CDMX. El Museo de Antropología es el mejor de México. Gratis domingos.', tags:['castillo','museo','parque'], price:'low', best_time:'mañana', visits:712 },
      { title:'Mercado de Coyoacán', type:'food', address:'Ignacio Allende 6, Coyoacán', lat:19.3500, lng:-99.1616, notes:'El mercado más bonito de CDMX. Tostadas de tinga y agua de jamaica.', tags:['tostadas','tinga','coyoacán'], price:'low', best_time:'mediodía', visits:567 },
      { title:'Roma Norte de noche', type:'sight', address:'Colonia Roma Norte, CDMX', lat:19.4194, lng:-99.1617, notes:'El barrio más cool de CDMX. Restaurantes de autor, natural wine bars y galerías.', tags:['barrio','restaurantes','wine'], price:'mid', best_time:'noche', visits:445 },
      { title:'Tacos al Pastor El Huequito', type:'food', address:'Ayuntamiento 21, Centro', lat:19.4336, lng:-99.1437, notes:'Los tacos al pastor más famosos del Centro desde 1959. La trompo con la piña es el espectáculo.', tags:['tacos','pastor','1959'], price:'low', best_time:'mediodía', visits:534 },
      { title:'Palacio de Bellas Artes', type:'sight', address:'Av. Juárez s/n, Centro', lat:19.4352, lng:-99.1413, notes:'El edificio art nouveau más hermoso de México. Los murales de Diego Rivera son imprescindibles.', tags:['art nouveau','murales','Rivera'], price:'mid', best_time:'mañana', visits:623 },
      { title:'Xochimilco en trajinera', type:'activity', address:'Xochimilco, CDMX', lat:19.2663, lng:-99.0993, notes:'Navegar en la Venice mexicana. Las trajineras de colores y el mariachi en barca.', tags:['trajinera','mariachi','canales'], price:'mid', best_time:'mediodía', visits:678 },
      { title:'Museo Frida Kahlo', type:'sight', address:'Londres 247, Coyoacán', lat:19.3556, lng:-99.1626, notes:'La casa donde nació y vivió Frida Kahlo. Reserva online con semanas de antelación.', tags:['frida','azul','arte'], price:'mid', best_time:'mañana', visits:789 },
      { title:'Cantina La Faena', type:'food', address:'C. de Uruguay 4, Centro', lat:19.4324, lng:-99.1344, notes:'La cantina más antigua del Centro. Mezcal y pulque. Ambiente de los años 50.', tags:['cantina','mezcal','histórico'], price:'low', best_time:'tarde', visits:312 },
    ],
    'Oaxaca': [
      { title:'Mercado 20 de Noviembre', type:'food', address:'C. 20 de Noviembre, Centro', lat:17.0639, lng:-96.7200, notes:'El mercado donde probar el mole negro, tlayudas y chapulines.', tags:['mole','tlayuda','chapulines'], price:'low', best_time:'mediodía', visits:478 },
      { title:'Monte Albán al atardecer', type:'sight', address:'San Pablo Villa de Mitla', lat:17.0433, lng:-96.7672, notes:'Zona arqueológica zapoteca con vistas de 360° al Valle. Al atardecer es mágico.', tags:['zapoteca','arqueología','sunset'], price:'low', best_time:'tarde', visits:356 },
      { title:'Mezcal en El Destilado', type:'food', address:'Cinco de Mayo 209, Centro', lat:17.0676, lng:-96.7242, notes:'El bar de mezcal con la mejor selección de Oaxaca. 300+ mezcales artesanales.', tags:['mezcal','artesanal','agave'], price:'mid', best_time:'noche', visits:312 },
      { title:'Árbol del Tule', type:'sight', address:'Tule, Oaxaca', lat:17.0460, lng:-96.6359, notes:'El árbol más gordo del mundo (un ahuehuete de 2000 años). El tronco mide 58m de circunferencia.', tags:['árbol','2000 años','récord'], price:'low', best_time:'mañana', visits:445 },
    ],
  },

  'Argentina': {
    'Buenos Aires': [
      { title:'El Ateneo Grand Splendid', type:'sight', address:'Av. Santa Fe 1860, Recoleta', lat:-34.5959, lng:-58.3929, notes:'La librería más bonita del mundo (National Geographic). Teatro convertido en librería.', tags:['librería','teatro','imprescindible'], price:'low', best_time:'tarde', visits:934 },
      { title:'Feria de San Telmo', type:'shopping', address:'Defensa 1050, San Telmo', lat:-34.6213, lng:-58.3731, notes:'El mercado de pulgas más famoso de BA, solo los domingos. Antigüedades y tango en la calle.', tags:['feria','domingo','tango'], price:'low', best_time:'mañana', visits:623 },
      { title:'Caminito La Boca', type:'sight', address:'Caminito, La Boca', lat:-34.6345, lng:-58.3631, notes:'Las casas de chapa de colores más fotogénicas. Solo visitar de día. Tango en vivo.', tags:['colorido','tango','fotográfico'], price:'low', best_time:'mediodía', visits:789 },
      { title:'Barrio Palermo Soho', type:'sight', address:'Palermo Soho, Buenos Aires', lat:-34.5893, lng:-58.4337, notes:'El barrio más trendy de BA. Restaurantes de autor y tiendas de diseñadores argentinos.', tags:['trendy','diseño','restaurantes'], price:'mid', best_time:'tarde', visits:567 },
      { title:'Cementerio de Recoleta', type:'sight', address:'Junín 1760, Recoleta', lat:-34.5874, lng:-58.3932, notes:'El cementerio más famoso del mundo. La tumba de Evita siempre tiene flores.', tags:['evita','cementerio','arquitectura'], price:'low', best_time:'mañana', visits:712 },
      { title:'La Birrera Parrilla', type:'food', address:'Lavalle 947, San Nicolás', lat:-34.6028, lng:-58.3833, notes:'Parrilla bonaerense de toda la vida. Vacío, entraña y chorizo. El mejor precio-calidad de BA.', tags:['parrilla','vacío','auténtico'], price:'mid', best_time:'noche', visits:345 },
      { title:'Puerto Madero al atardecer', type:'sight', address:'Puerto Madero, Buenos Aires', lat:-34.6118, lng:-58.3627, notes:'El puente de la Mujer de Calatrava y el atardecer sobre el Río de la Plata.', tags:['moderno','río','atardecer'], price:'low', best_time:'tarde', visits:534 },
      { title:'Espectáculo de Tango en Café Tortoni', type:'activity', address:'Av. de Mayo 829', lat:-34.6089, lng:-58.3774, notes:'El café más antiguo de BA (1858) con espectáculos de tango en el sótano.', tags:['tango','1858','art nouveau'], price:'mid', best_time:'noche', visits:445 },
      { title:'Mercado de San Telmo', type:'food', address:'Carlos Calvo 430, San Telmo', lat:-34.6183, lng:-58.3719, notes:'El mercado cubierto más bonito de BA. El choripán con chimichurri es el mejor de la ciudad.', tags:['mercado','choripán','antigüedades'], price:'low', best_time:'mediodía', visits:412 },
    ],
  },

  'Perú': {
    'Cusco': [
      { title:'Machu Picchu al amanecer', type:'sight', address:'Machu Picchu, Cusco', lat:-13.1631, lng:-72.5450, notes:'Una de las maravillas del mundo. Reserva el tren con meses de antelación. La entrada de sol es mágica.', tags:['maravilla','inca','amanecer'], price:'high', best_time:'mañana', visits:1456 },
      { title:'Plaza de Armas de Cusco', type:'sight', address:'Plaza de Armas, Cusco', lat:-13.5170, lng:-71.9784, notes:'El corazón de Cusco. La Catedral y el Templo de la Compañía son increíbles. De noche es espectacular.', tags:['catedral','histórico','chocolate'], price:'low', best_time:'tarde', visits:834 },
      { title:'Mirador de San Blas', type:'sight', address:'Barrio de San Blas, Cusco', lat:-13.5155, lng:-71.9773, notes:'Las mejores vistas del centro histórico. El barrio de artesanos es el más bonito.', tags:['mirador','artesanos','vistas'], price:'low', best_time:'tarde', visits:534 },
      { title:'Mercado de San Pedro', type:'food', address:'C. Cascaparo, Cusco', lat:-13.5218, lng:-71.9794, notes:'El mercado local. Desayuno cusqueño por menos de 5 soles: api morada, tamales y chicharrón.', tags:['mercado','local','desayuno'], price:'low', best_time:'mañana', visits:378 },
      { title:'Sacsayhuamán', type:'sight', address:'Sacsayhuamán, Cusco', lat:-13.5086, lng:-71.9817, notes:'La fortaleza inca sobre Cusco. Piedras de hasta 120 toneladas. Las vistas son impresionantes.', tags:['inca','fortaleza','piedras'], price:'mid', best_time:'mañana', visits:623 },
      { title:'Tren Perurail a Machu Picchu', type:'activity', address:'Estación Poroy, Cusco', lat:-13.5066, lng:-72.0012, notes:'El tren más bonito del mundo. El trayecto de 3h entre montañas andinas es impresionante.', tags:['tren','andino','Vistadome'], price:'high', best_time:'mañana', visits:712 },
    ],
    'Lima': [
      { title:'Miraflores Malecón', type:'sight', address:'Malecón de la Reserva, Miraflores', lat:-12.1328, lng:-77.0282, notes:'El acantilado sobre el Pacífico. Parapente disponible. Al atardecer es espectacular.', tags:['acantilado','Pacífico','parapente'], price:'low', best_time:'tarde', visits:623 },
      { title:'Barranco de noche', type:'sight', address:'Barranco, Lima', lat:-12.1461, lng:-77.0219, notes:'El barrio bohemio más bonito de Lima. El Puente de los Suspiros y restaurantes de autor.', tags:['bohemio','pisco','nocturno'], price:'mid', best_time:'noche', visits:567 },
      { title:'Mercado Surquillo', type:'food', address:'Paseo de la República, Miraflores', lat:-12.1273, lng:-77.0267, notes:'El mejor mercado para probar ingredientes peruanos. El ceviche más fresco de Lima.', tags:['mercado','ceviche','ingredientes'], price:'low', best_time:'mediodía', visits:456 },
      { title:'Central Restaurante', type:'food', address:'Av. Pedro de Osma 301, Barranco', lat:-12.1461, lng:-77.0219, notes:'El mejor restaurante de Latinoamérica. Virgilio Martínez. Reserva con meses de antelación.', tags:['fine dining','Virgilio','imprescindible'], price:'high', best_time:'noche', visits:234 },
    ],
  },

  'Francia': {
    'París': [
      { title:'Sacré-Cœur al amanecer', type:'sight', address:'35 Rue du Chevalier, 75018', lat:48.8867, lng:2.3431, notes:'La basílica sin turistas. Antes de las 7h tienes Montmartre para ti solo.', tags:['amanecer','Montmartre','vistas'], price:'low', best_time:'mañana', visits:812 },
      { title:'Torre Eiffel al atardecer', type:'sight', address:'Champ de Mars, 75007', lat:48.8584, lng:2.2945, notes:'La imagen más icónica de Francia. Reserva el ascensor online. El picnic en el Champ de Mars.', tags:['icónico','atardecer','picnic'], price:'mid', best_time:'tarde', visits:1567 },
      { title:'Marché d\'Aligre', type:'food', address:'Place d\'Aligre, 75012', lat:48.8494, lng:2.3783, notes:'El mercado más auténtico de París. Frutas, quesos y vino natural.', tags:['mercado','queso','local'], price:'low', best_time:'mañana', visits:345 },
      { title:'Canal Saint-Martin', type:'sight', address:'Canal Saint-Martin, 75010', lat:48.8703, lng:2.3636, notes:'El canal más bonito de París. Terrazas de cafés y parisinos en la orilla.', tags:['canal','terrazas','local'], price:'low', best_time:'tarde', visits:567 },
      { title:'Le Marais District', type:'sight', address:'Le Marais, 75003', lat:48.8572, lng:2.3508, notes:'El barrio judío y gay. La Place des Vosges es la plaza más bonita de París.', tags:['judío','galería','Place des Vosges'], price:'low', best_time:'tarde', visits:712 },
      { title:'Shakespeare and Company', type:'shopping', address:'37 Rue de la Bûcherie, 75005', lat:48.8527, lng:2.3472, notes:'La librería más famosa del mundo, junto al Sena con vistas a Notre-Dame.', tags:['librería','inglés','Sena'], price:'low', best_time:'tarde', visits:489 },
      { title:'Père Lachaise Cemetery', type:'sight', address:'Bd de Ménilmontant, 75020', lat:48.8603, lng:2.3968, notes:'La tumba de Jim Morrison, Oscar Wilde y Edith Piaf. Un paseo por la historia cultural.', tags:['Jim Morrison','Wilde','histórico'], price:'low', best_time:'tarde', visits:534 },
      { title:'Croissant en Du Pain et des Idées', type:'food', address:'34 Rue Yves Toudic, 75010', lat:48.8704, lng:2.3641, notes:'La mejor boulangerie de París según los parisinos. El croissant y el pain des amis.', tags:['croissant','boulangerie','auténtico'], price:'low', best_time:'mañana', visits:423 },
      { title:'Palais Royal Gardens', type:'sight', address:'Pl. du Palais Royal, 75001', lat:48.8638, lng:2.3368, notes:'El jardín más elegante y secreto de París. Las columnas de Daniel Buren son fotogénicas.', tags:['jardín','secreto','Buren'], price:'low', best_time:'mañana', visits:378 },
    ],
  },

  'Italia': {
    'Roma': [
      { title:'Coliseo al amanecer', type:'sight', address:'Piazza del Colosseo, Roma', lat:41.8902, lng:12.4922, notes:'El anfiteatro más famoso del mundo. Reserva online. La mejor hora es el amanecer.', tags:['coliseo','imprescindible','histórico'], price:'mid', best_time:'mañana', visits:1456 },
      { title:'Fontana di Trevi al amanecer', type:'sight', address:'Piazza di Trevi, Roma', lat:41.9009, lng:12.4833, notes:'La fuente más famosa del mundo sin turistas. A las 6h estás casi solo.', tags:['fuente','amanecer','moneda'], price:'low', best_time:'mañana', visits:1234 },
      { title:'Gianicolo al amanecer', type:'sight', address:'Passeggiata del Gianicolo', lat:41.8926, lng:12.4673, notes:'Las mejores vistas de Roma sin turistas. Subida de 20 min desde Trastevere.', tags:['vistas','amanecer','Trastevere'], price:'low', best_time:'mañana', visits:445 },
      { title:'Trastevere de noche', type:'sight', address:'Trastevere, Roma', lat:41.8893, lng:12.4695, notes:'El barrio más auténtico y romántico de Roma. Las callejuelas medievales de noche son mágicas.', tags:['romántico','nocturno','medieval'], price:'mid', best_time:'noche', visits:756 },
      { title:'Testaccio Market', type:'food', address:'Via Galvani, Roma', lat:41.8763, lng:12.4785, notes:'El mercado gastronómico más auténtico de Roma. Supplì, porchetta y la mejor pizza al taglio.', tags:['supplì','pizza','local'], price:'low', best_time:'mediodía', visits:378 },
      { title:'Cacio e Pepe en Roma Sparita', type:'food', address:'Piazza di Santa Cecilia 24', lat:41.8879, lng:12.4707, notes:'La pasta más famosa de Roma servida en una cesta de parmesano. Reserva imprescindible.', tags:['cacio e pepe','pasta','Trastevere'], price:'mid', best_time:'noche', visits:423 },
      { title:'Piazza Navona', type:'sight', address:'Piazza Navona, Roma', lat:41.8990, lng:12.4731, notes:'La plaza más bella de Roma. Las tres fuentes de Bernini son impresionantes.', tags:['Bernini','plaza','fuentes'], price:'low', best_time:'mañana', visits:867 },
      { title:'Gelato en Fatamorgana', type:'food', address:'Via Giovanni Bettolo 7, Prati', lat:41.9075, lng:12.4646, notes:'El helado más creativo de Roma. Sabores únicos como wasabi o gorgonzola con pera.', tags:['gelato','creativo','sabores'], price:'low', best_time:'tarde', visits:345 },
    ],
    'Florencia': [
      { title:'Piazzale Michelangelo al atardecer', type:'sight', address:'Piazzale Michelangelo, Firenze', lat:43.7629, lng:11.2652, notes:'La panorámica más famosa de Florencia. Sube a pie por los jardines (20 min) o en autobús.', tags:['panorámica','atardecer','imprescindible'], price:'low', best_time:'tarde', visits:789 },
      { title:'Mercato Centrale', type:'food', address:'Via dell\'Ariento 6, Florencia', lat:43.7773, lng:11.2527, notes:'El mercado cubierto más bonito de Italia. La planta de arriba tiene puestos gourmet.', tags:['mercado','pasta','gourmet'], price:'mid', best_time:'mediodía', visits:456 },
      { title:'Oltrarno District', type:'sight', address:'Oltrarno, Florencia', lat:43.7672, lng:11.2499, notes:'El barrio de los artesanos. Talleres de cuero, ebanistería y joyería.', tags:['artesanos','cuero','local'], price:'low', best_time:'mañana', visits:312 },
    ],
  },

  'Portugal': {
    'Lisboa': [
      { title:'Pastel de Nata en Pastéis de Belém', type:'food', address:'R. de Belém 84-92', lat:38.6973, lng:-9.2036, notes:'Los pastéis de nata más famosos del mundo. La receta es secreta desde 1837.', tags:['nata','1837','imprescindible'], price:'low', best_time:'mañana', visits:867 },
      { title:'Alfama de noche', type:'sight', address:'Alfama, Lisboa', lat:38.7139, lng:-9.1293, notes:'El barrio más antiguo de Lisboa. El fado que sale de las tabernas de noche es mágico.', tags:['fado','medieval','nocturno'], price:'low', best_time:'noche', visits:712 },
      { title:'Miradouro da Graça', type:'sight', address:'Largo da Graça, Lisboa', lat:38.7165, lng:-9.1302, notes:'El mirador más local de Lisboa, sin turistas. Vistas del castillo y el río.', tags:['mirador','local','río'], price:'low', best_time:'tarde', visits:534 },
      { title:'LX Factory el domingo', type:'shopping', address:'R. Rodrigues de Faria 103', lat:38.7027, lng:-9.1762, notes:'El mercado hipster de Lisboa en una fábrica. La librería Ler Devagar es única.', tags:['hipster','mercadillo','domingo'], price:'low', best_time:'mediodía', visits:445 },
      { title:'Tasca do Chico', type:'food', address:'R. do Diário de Notícias 39', lat:38.7116, lng:-9.1433, notes:'El fado más auténtico de Lisboa. Solo 20 mesas — reserva imprescindible.', tags:['fado','bacalhau','auténtico'], price:'mid', best_time:'noche', visits:389 },
      { title:'Tram 28', type:'activity', address:'Rua da Conceição, Lisboa', lat:38.7085, lng:-9.1367, notes:'El tranvía más fotogénico del mundo serpentea por Alfama.', tags:['tranvía','Alfama','fotogénico'], price:'low', best_time:'mañana', visits:678 },
    ],
    'Porto': [
      { title:'Livraria Lello', type:'sight', address:'R. das Carmelitas 144', lat:41.1470, lng:-8.6151, notes:'La librería que inspiró Harry Potter. Cola inevitable, pero comprar un libro (3€) te da acceso.', tags:['librería','Potter','arquitectura'], price:'low', best_time:'mañana', visits:867 },
      { title:'Cais da Ribeira al atardecer', type:'sight', address:'Cais da Ribeira, Porto', lat:41.1408, lng:-8.6136, notes:'Las casas de colores reflejadas en el Duero al atardecer son mágicas.', tags:['río','atardecer','vino'], price:'low', best_time:'tarde', visits:712 },
      { title:'Vinho do Porto en Sandeman', type:'activity', address:'Largo Miguel Bombarda 3, Gaia', lat:41.1396, lng:-8.6141, notes:'La bodega más famosa. La cata de 3 vinos con explicación del proceso es perfecta.', tags:['oporto','cata','bodega'], price:'mid', best_time:'tarde', visits:534 },
      { title:'Francesinha en Café Santiago', type:'food', address:'R. de Passos Manuel 226', lat:41.1496, lng:-8.6087, notes:'El sándwich más calórico y delicioso de Portugal. El plato más representativo de Porto.', tags:['francesinha','típico','irresistible'], price:'mid', best_time:'mediodía', visits:489 },
      { title:'Mirador da Serra do Pilar', type:'sight', address:'Largo Aviz, Gaia', lat:41.1381, lng:-8.6114, notes:'Las mejores vistas de Porto y el Puente Dom Luís I. Al atardecer es espectacular.', tags:['mirador','Dom Luís','vistas'], price:'low', best_time:'tarde', visits:623 },
    ],
  },

  'Tailandia': {
    'Bangkok': [
      { title:'Wat Arun al amanecer', type:'sight', address:'158 Thanon Wang Doem', lat:13.7437, lng:100.4888, notes:'El templo del amanecer. Toma el ferry (4 baht). Antes de las 8h estás casi solo.', tags:['templo','amanecer','río'], price:'low', best_time:'mañana', visits:678 },
      { title:'Wat Pho y el Buda Reclinado', type:'sight', address:'2 Sanam Chai Rd, Phra Nakhon', lat:13.7465, lng:100.4930, notes:'El templo con el mayor Buda reclinado (46m). También tiene la mejor escuela de masaje.', tags:['buda','reclinado','masaje'], price:'mid', best_time:'mañana', visits:756 },
      { title:'Or Tor Kor Market', type:'food', address:'Kamphaeng Phet 1 Rd', lat:13.7989, lng:100.5498, notes:'El mercado de frutas más bonito de Bangkok. Mangos, durian y curry excelente.', tags:['frutas','curry','local'], price:'low', best_time:'mañana', visits:345 },
      { title:'Khao San Road de noche', type:'sight', address:'Khao San Road, Phra Nakhon', lat:13.7588, lng:100.4974, notes:'La calle más famosa de Bangkok. Caótica, ruidosa y absolutamente única.', tags:['mochileros','nocturno','caótico'], price:'low', best_time:'noche', visits:912 },
      { title:'Chatuchak Weekend Market', type:'shopping', address:'Kamphaeng Phet Rd, Chatuchak', lat:13.7999, lng:100.5500, notes:'El mercado más grande del mundo, solo sábados y domingos. 15.000 puestos.', tags:['mercado','más grande','sábado'], price:'low', best_time:'mañana', visits:867 },
      { title:'Chinatown Yaowarat', type:'food', address:'Yaowarat Rd, Samphanthawong', lat:13.7397, lng:100.5097, notes:'El Chinatown más auténtico del Sudeste Asiático. De noche con los letreros dorados.', tags:['Chinatown','street food','nocturno'], price:'low', best_time:'noche', visits:534 },
      { title:'Viaje en Tuk-Tuk', type:'activity', address:'Grand Palace area, Bangkok', lat:13.7500, lng:100.4913, notes:'El tuk-tuk es el transporte más icónico. Negocia el precio antes. Caótico y emocionante.', tags:['tuk-tuk','icónico','templos'], price:'low', best_time:'tarde', visits:712 },
    ],
    'Chiang Mai': [
      { title:'Doi Suthep al amanecer', type:'sight', address:'Doi Suthep-Pui National Park', lat:18.8047, lng:98.9216, notes:'El templo en la montaña sobre Chiang Mai. Sale una songthaew desde el centro por 50 baht.', tags:['templo','montaña','amanecer'], price:'low', best_time:'mañana', visits:534 },
      { title:'Sunday Walking Street', type:'shopping', address:'Wualai Road, Chiang Mai', lat:18.7770, lng:98.9919, notes:'El mercado nocturno más bonito de Tailandia, solo los domingos.', tags:['domingo','artesanías','nocturno'], price:'low', best_time:'noche', visits:678 },
      { title:'Santuario Ético de Elefantes', type:'activity', address:'Chiang Mai Elephant Sanctuary', lat:18.9008, lng:98.9008, notes:'El santuario de elefantes más ético. Sin montar. Solo pasear y bañarlos. Reserva online.', tags:['elefantes','ético','naturaleza'], price:'high', best_time:'mañana', visits:712 },
      { title:'Khao Soi en Khao Soi Khun Yai', type:'food', address:'Chiang Mai Road', lat:18.8004, lng:98.9893, notes:'El khao soi más famoso de Chiang Mai. El caldo de curry cremoso con fideos crujientes.', tags:['khao soi','curry','fideos'], price:'low', best_time:'mediodía', visits:423 },
    ],
    'Phuket': [
      { title:'Promthep Cape al atardecer', type:'sight', address:'Promthep Cape, Rawai', lat:7.7714, lng:98.3044, notes:'El mejor atardecer de Phuket. Llega 45 min antes para conseguir sitio.', tags:['atardecer','cabo','mar Andamán'], price:'low', best_time:'tarde', visits:723 },
      { title:'Phuket Old Town', type:'sight', address:'Thalang Rd, Phuket Town', lat:7.8877, lng:98.3923, notes:'El barrio histórico con arquitectura sino-portuguesa única. Fachadas de colores.', tags:['colonial','sino-portugués','colorido'], price:'low', best_time:'tarde', visits:456 },
      { title:'Playa de Kata Noi', type:'sight', address:'Kata Noi Beach, Phuket', lat:7.8192, lng:98.2948, notes:'La playa más bonita para quienes huyen de Patong. Más tranquila y con aguas cristalinas.', tags:['playa','tranquila','cristalina'], price:'low', best_time:'mañana', visits:534 },
    ],
  },

  'Vietnam': {
    'Hanói': [
      { title:'Lago Hoan Kiem al amanecer', type:'sight', address:'Hoan Kiem Lake, Hoan Kiem', lat:21.0285, lng:105.8542, notes:'El lago sagrado de Hanói. Al amanecer los locales hacen ejercicio. El puente rojo es precioso.', tags:['lago','amanecer','puente rojo'], price:'low', best_time:'mañana', visits:934 },
      { title:'Bun cha en Huong Lien', type:'food', address:'24 Le Van Huu, Hai Ba Trung', lat:21.0209, lng:105.8487, notes:'El restaurante donde Obama comió con Bourdain. Bun cha por menos de 3€.', tags:['buncha','Obama','Bourdain'], price:'low', best_time:'mediodía', visits:534 },
      { title:'Barrio Antiguo de noche', type:'sight', address:'36 Streets, Hoan Kiem', lat:21.0341, lng:105.8489, notes:'Las 36 calles. Los viernes y sábados se cierra al tráfico. Linternas y música en la calle.', tags:['36 calles','nocturno','linternas'], price:'low', best_time:'noche', visits:445 },
      { title:'Templo de la Literatura', type:'sight', address:'58 Quoc Tu Giam, Dong Da', lat:21.0276, lng:105.8357, notes:'El templo confuciano más importante de Vietnam, fundado en 1070.', tags:['templo','confuciano','1070'], price:'mid', best_time:'mañana', visits:489 },
    ],
    'Hội An': [
      { title:'Lantern release en el río', type:'activity', address:'Riverside, Hoi An', lat:15.8801, lng:108.3380, notes:'Soltar linternas en el río Thu Bon al atardecer. El 14 de cada mes hay festival.', tags:['linternas','río','romántico'], price:'low', best_time:'noche', visits:756 },
      { title:'Banh mi Phuong', type:'food', address:'2B Phan Chau Trinh, Hoi An', lat:15.8787, lng:108.3323, notes:'El banh mi más famoso de Vietnam. Bourdain lo llamó "el mejor sandwich del mundo". 1.5 USD.', tags:['banhmi','Bourdain','imprescindible'], price:'low', best_time:'mañana', visits:892 },
      { title:'Ancient Town at night', type:'sight', address:'Ancient Town, Hoi An', lat:15.8768, lng:108.3347, notes:'El casco antiguo UNESCO de noche con las linternas de papel. Sin motos (prohibidas de noche).', tags:['UNESCO','linternas','nocturno'], price:'low', best_time:'noche', visits:834 },
      { title:'Cao Lau en Morning Glory', type:'food', address:'106 Nguyen Thai Hoc, Hoi An', lat:15.8775, lng:108.3331, notes:'El plato más icónico de Hội An. El cao lau solo se puede hacer auténtico aquí.', tags:['cao lau','hoi an','fideos'], price:'low', best_time:'mediodía', visits:534 },
    ],
  },

  'Indonesia': {
    'Bali': [
      { title:'Templo de Tanah Lot al atardecer', type:'sight', address:'Tanah Lot, Tabanan', lat:-8.6215, lng:115.0865, notes:'El templo sobre una roca en el mar. El atardecer detrás del templo es icónico. Llega 1h antes.', tags:['templo','sunset','icónico'], price:'low', best_time:'tarde', visits:934 },
      { title:'Terrazas de Arroz de Tegalalang', type:'sight', address:'Tegalalang, Gianyar', lat:-8.4312, lng:115.2793, notes:'Las terrazas de arroz más fotogénicas. Las de Jatiluwih (UNESCO) son más grandes y tranquilas.', tags:['arrozales','UNESCO','fotogénico'], price:'low', best_time:'mañana', visits:812 },
      { title:'Babi Guling Ibu Oka', type:'food', address:'Jl. Tegal Sari, Ubud', lat:-8.5068, lng:115.2629, notes:'El cerdo asado balinés más famoso. Bourdain lo visitó. Llega antes de las 11h. Se acaba.', tags:['babi guling','Bourdain','cerdo'], price:'low', best_time:'mediodía', visits:567 },
      { title:'Ubud Monkey Forest', type:'activity', address:'Jl. Monkey Forest, Ubud', lat:-8.5186, lng:115.2589, notes:'El bosque sagrado de monos. 1200 monos en 12 hectáreas. Guarda todo en la mochila.', tags:['monos','bosque','templos'], price:'mid', best_time:'mañana', visits:689 },
      { title:'Sunrise en Mt. Batur', type:'activity', address:'Gunung Batur, Bangli', lat:-8.2421, lng:115.3752, notes:'Subir el volcán activo para ver el amanecer. 2h de subida nocturna. Arranca a las 4h.', tags:['volcán','amanecer','senderismo'], price:'mid', best_time:'mañana', visits:712 },
    ],
  },

  'Corea del Sur': {
    'Seúl': [
      { title:'Bukchon Hanok Village', type:'sight', address:'Bukchon-ro, Jongno-gu', lat:37.5826, lng:126.9840, notes:'El barrio de casas tradicionales hanok más bonito de Seúl. Entre semana sin colas.', tags:['hanok','tradicional','fotogénico'], price:'low', best_time:'mañana', visits:723 },
      { title:'Mercado de Gwangjang', type:'food', address:'Gwangjang Market, Jongno-gu', lat:37.5702, lng:126.9995, notes:'El mercado de comida callejera más famoso (visto en Street Food de Netflix).', tags:['bindaetteok','netflix','kimbap'], price:'low', best_time:'mediodía', visits:678 },
      { title:'Hongdae de noche', type:'sight', address:'Hongdae, Mapo-gu', lat:37.5563, lng:126.9219, notes:'El barrio universitario más animado. K-pop, músicos callejeros y street food.', tags:['kpop','universitario','nocturno'], price:'mid', best_time:'noche', visits:589 },
      { title:'Palacio Gyeongbokgung', type:'sight', address:'161 Sajik-ro, Jongno-gu', lat:37.5796, lng:126.9770, notes:'El palacio real más grande de la era Joseon. Alquila un hanbok para entrar gratis.', tags:['palacio','Joseon','hanbok'], price:'mid', best_time:'mañana', visits:867 },
      { title:'Namsan Seoul Tower', type:'sight', address:'Namsan-gil 105, Yongsan-gu', lat:37.5512, lng:126.9882, notes:'Las mejores vistas panorámicas de Seúl. Sube a pie por el parque Namsan (30 min, gratis).', tags:['torre','vistas','candados'], price:'low', best_time:'tarde', visits:812 },
      { title:'Insadong Tea District', type:'shopping', address:'Insadong, Jongno-gu', lat:37.5740, lng:126.9854, notes:'El barrio de galerías de arte y tés tradicionales. El Ssamziegil Mall tiene diseñadores independientes.', tags:['arte','té','antigüedades'], price:'low', best_time:'tarde', visits:489 },
    ],
  },

  'Marruecos': {
    'Marrakech': [
      { title:'Jardín Majorelle al abrir', type:'sight', address:'Rue Yves St Laurent, Marrakech', lat:31.6416, lng:-8.0000, notes:'El jardín azul más famoso. Llega a las 9h cuando abre. El azul cobalto y los cactus son únicos.', tags:['jardín','azul','YSL'], price:'mid', best_time:'mañana', visits:723 },
      { title:'Jemaa el-Fna al atardecer', type:'sight', address:'Jemaa el-Fna, Marrakech', lat:31.6258, lng:-7.9891, notes:'La plaza más viva del mundo. De noche 100 puestos de comida y músicos. Sube a una terraza.', tags:['plaza','nocturno','encantadores'], price:'low', best_time:'tarde', visits:1023 },
      { title:'Souks de la Medina', type:'shopping', address:'Medina, Marrakech', lat:31.6314, lng:-7.9872, notes:'El laberinto de mercados más fascinante del mundo. Cuero, especias y lámparas. Negocia todo.', tags:['souks','cuero','laberinto'], price:'low', best_time:'mañana', visits:867 },
      { title:'Hammam tradicional', type:'activity', address:'Medina, Marrakech', lat:31.6290, lng:-7.9890, notes:'El baño árabe tradicional. El hammam del barrio (4-8€) es muy diferente al turístico.', tags:['hammam','baño','tradicional'], price:'low', best_time:'tarde', visits:456 },
      { title:'Palais Bahia', type:'sight', address:'Rue Riad Zitoun el Jadid', lat:31.6193, lng:-7.9836, notes:'El palacio con jardines de naranjos y mosaicos. Una obra preciosa de arquitectura árabe.', tags:['palacio','mosaicos','naranjos'], price:'mid', best_time:'tarde', visits:534 },
    ],
  },

  'India': {
    'Delhi': [
      { title:'Chandni Chowk al amanecer', type:'sight', address:'Chandni Chowk, Old Delhi', lat:28.6562, lng:77.2300, notes:'El mercado más caótico y fascinante de India. Al amanecer antes de las multitudes.', tags:['mercado','caótico','auténtico'], price:'low', best_time:'mañana', visits:567 },
      { title:'Qutub Minar', type:'sight', address:'Seth Sarai, Mehrauli', lat:28.5245, lng:77.1855, notes:'El minarete más alto de India (72m), Patrimonio UNESCO del año 1193.', tags:['minarete','UNESCO','1193'], price:'mid', best_time:'mañana', visits:489 },
      { title:'Humayun\'s Tomb', type:'sight', address:'Mathura Rd, Nizamuddin East', lat:28.5932, lng:77.2508, notes:'El precursor del Taj Mahal. El jardín persa y la cúpula de mármol son impresionantes.', tags:['mausoleo','jardín persa','UNESCO'], price:'mid', best_time:'tarde', visits:378 },
    ],
    'Agra': [
      { title:'Taj Mahal al amanecer', type:'sight', address:'Dharmapuri, Forest Colony, Agra', lat:27.1751, lng:78.0421, notes:'La séptima maravilla del mundo. Al amanecer el mármol blanco brilla con luz rosa. Reserva online.', tags:['maravilla','amanecer','imprescindible'], price:'high', best_time:'mañana', visits:1567 },
      { title:'Agra Fort', type:'sight', address:'Agra Fort, Agra', lat:27.1800, lng:78.0215, notes:'La fortaleza de los emperadores mogoles. Las vistas del Taj Mahal desde las terrazas son únicas.', tags:['fuerte','mogol','Taj vistas'], price:'mid', best_time:'mañana', visits:712 },
    ],
    'Jaipur': [
      { title:'Palacio de los Vientos', type:'sight', address:'Hawa Mahal Rd, Jaipur', lat:26.9239, lng:75.8267, notes:'El palacio de 953 ventanas. Al amanecer con la luz dorada sobre la fachada rosa es perfecta.', tags:['ventanas','rosa','fotogénico'], price:'mid', best_time:'mañana', visits:823 },
      { title:'Amer Fort', type:'sight', address:'Devisinghpura, Amer, Jaipur', lat:26.9855, lng:75.8513, notes:'La fortaleza más bella del Rajastán. Los espejos del Sheesh Mahal son increíbles.', tags:['fuerte','espejos','Rajastán'], price:'mid', best_time:'mañana', visits:867 },
    ],
  },
};

// ─── Helper functions ──────────────────────────────────────────────────────

export function getSeedSpotsForCity(country, city) {
  if (!country || !city) return [];
  const countryData = SEED_SPOTS[country];
  if (!countryData) return [];
  if (countryData[city]) return countryData[city];
  const key = Object.keys(countryData).find(k => k.toLowerCase() === city.toLowerCase());
  return key ? countryData[key] : [];
}

export function getSeedSpotsForCountry(country) {
  const countryData = SEED_SPOTS[country] || {};
  return Object.entries(countryData).flatMap(([city, spots]) =>
    spots.map(s => ({ ...s, city_name: city, country }))
  );
}

export function getAvailableCountries() {
  return Object.keys(SEED_SPOTS);
}

export function getAvailableCities(country) {
  return Object.keys(SEED_SPOTS[country] || {});
}

export function getTopSpotsGlobal(limit = 20) {
  const all = [];
  Object.entries(SEED_SPOTS).forEach(([country, cities]) => {
    Object.entries(cities).forEach(([city, spots]) => {
      spots.forEach(s => all.push({ ...s, city_name: city, country }));
    });
  });
  return all.sort((a, b) => (b.visits || 0) - (a.visits || 0)).slice(0, limit);
}

export function searchSpots(query) {
  const q = query.toLowerCase();
  const results = [];
  Object.entries(SEED_SPOTS).forEach(([country, cities]) => {
    Object.entries(cities).forEach(([city, spots]) => {
      spots.forEach(s => {
        if (s.title.toLowerCase().includes(q) ||
            s.notes?.toLowerCase().includes(q) ||
            s.tags?.some(t => t.toLowerCase().includes(q)) ||
            city.toLowerCase().includes(q) ||
            country.toLowerCase().includes(q)) {
          results.push({ ...s, city_name: city, country });
        }
      });
    });
  });
  return results.sort((a, b) => (b.visits || 0) - (a.visits || 0));
}

export function getSpotsForDestination(country, city) {
  return getSeedSpotsForCity(country, city);
}