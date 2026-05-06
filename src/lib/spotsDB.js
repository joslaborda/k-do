/**
 * spotsDB.js — Seed content de spots curados para ciudades de todo el mundo
 * Contenido real y útil para el lanzamiento de Kōdo
 * Organizado por país → ciudad
 */

export const SEED_SPOTS = {

  // ── ESPAÑA ────────────────────────────────────────────────────────────────
  'España': {
    'Madrid': [
      { title: 'Mercado de San Miguel', type: 'food', address: 'Plaza de San Miguel, s/n', lat: 40.4153, lng: -3.7093, notes: 'Mercado gourmet con tapas y vinos. Mejor entre semana para evitar colas. No te pierdas las croquetas de La Sanabresa.', tags: ['tapas', 'mercado', 'gourmet'], price: 'mid', best_time: 'tarde', visits: 342 },
      { title: 'Barrio de las Letras', type: 'sight', address: 'Barrio de las Letras, Madrid', lat: 40.4138, lng: -3.6936, notes: 'El barrio más bohemio de Madrid. Calles empedradas, librerías y tabernas históricas. Imprescindible perderse por sus callejuelas.', tags: ['cultura', 'bohemio', 'paseo'], price: 'low', best_time: 'tarde', visits: 287 },
      { title: 'Mirador del Templo de Debod', type: 'sight', address: 'C. de Ferraz, 1', lat: 40.4243, lng: -3.7178, notes: 'Las mejores vistas del atardecer de Madrid. Llega 30 min antes del sunset para conseguir sitio. Entrada al templo gratuita.', tags: ['sunset', 'mirador', 'gratuito'], price: 'low', best_time: 'tarde', visits: 521 },
      { title: 'Casa Macareno', type: 'food', address: 'C. de la Ruda, 5', lat: 40.4121, lng: -3.7059, notes: 'Taberna madrileña de 1927. Cocido y callos imprescindibles. Reserva los fines de semana con antelación.', tags: ['cocido', 'tradicional', 'histórico'], price: 'mid', best_time: 'comida', visits: 198 },
      { title: 'El Rastro', type: 'shopping', address: 'Calle de la Ribera de Curtidores', lat: 40.4089, lng: -3.7083, notes: 'El mercadillo más famoso de Madrid, solo los domingos por la mañana. Llega antes de las 10h para ver lo mejor. Cuidado con los carteristas.', tags: ['mercadillo', 'domingo', 'vintage'], price: 'low', best_time: 'mañana', visits: 412 },
      { title: 'Rooftop del Círculo de Bellas Artes', type: 'sight', address: 'C. de Alcalá, 42', lat: 40.4187, lng: -3.6983, notes: 'Las mejores vistas de la Gran Vía. 4€ de entrada que merece la pena. Perfecto al atardecer con una cerveza.', tags: ['rooftop', 'vistas', 'terraza'], price: 'low', best_time: 'tarde', visits: 376 },
    ],
    'Barcelona': [
      { title: 'Bunkers del Carmel', type: 'sight', address: 'Turó de la Rovira', lat: 41.4179, lng: 2.1680, notes: 'Las mejores vistas panorámicas de Barcelona. Sube en bici o taxi. Al atardecer hay ambiente increíble. Lleva algo de beber.', tags: ['vistas', 'sunset', 'panorámica'], price: 'low', best_time: 'tarde', visits: 634 },
      { title: 'Mercado de Santa Caterina', type: 'food', address: 'Av. de Francesc Cambó, 16', lat: 41.3855, lng: 2.1789, notes: 'Alternativa menos turística al Boqueria. Techo ondulado precioso, precios razonables, productos frescos. El bar del mercado tiene tapas excelentes.', tags: ['mercado', 'local', 'tapas'], price: 'low', best_time: 'mañana', visits: 287 },
      { title: 'El Born', type: 'sight', address: 'El Born, Barcelona', lat: 41.3851, lng: 2.1834, notes: 'El barrio más trendy de Barcelona. Tiendas de diseño, cocktail bars y restaurantes con terraza. Mejor de jueves a sábado por la noche.', tags: ['trendy', 'barrio', 'nocturno'], price: 'mid', best_time: 'noche', visits: 445 },
      { title: 'Barceloneta al amanecer', type: 'activity', address: 'Playa de la Barceloneta', lat: 41.3789, lng: 2.1900, notes: 'La playa sin turistas. Amanecer en la Barceloneta con muy poca gente, es mágico. Lleva un café del bar de la esquina.', tags: ['playa', 'amanecer', 'tranquilo'], price: 'low', best_time: 'mañana', visits: 312 },
      { title: 'La Cova Fumada', type: 'food', address: 'C/ del Baluard, 56', lat: 41.3797, lng: 2.1876, notes: 'El bar que inventó la bombas (croqueta gigante de patata). Sin carta, sin reservas, llega antes de las 13h. Cierra cuando se acaba la comida.', tags: ['bomba', 'local', 'histórico'], price: 'low', best_time: 'comida', visits: 234 },
    ],
    'Sevilla': [
      { title: 'Azotea del Ateneo', type: 'sight', address: 'C. Orfila, 7', lat: 37.3882, lng: -5.9915, notes: 'Rooftop secreto con vistas a la Giralda. Cócteles a precios razonables. Solo abierto en verano. Una de las mejores vistas de Sevilla.', tags: ['rooftop', 'secreto', 'vistas'], price: 'mid', best_time: 'tarde', visits: 189 },
      { title: 'Bodega Dos de Mayo', type: 'food', address: 'Pl. de la Gavidia, 6', lat: 37.3912, lng: -5.9952, notes: 'La mejor manzanilla de Sevilla. Tapas de jamón, queso y boquerones. Los martes tienen flamenco espontáneo. Local de toda la vida.', tags: ['tapas', 'manzanilla', 'flamenco'], price: 'low', best_time: 'tarde', visits: 267 },
    ],
  },

  // ── JAPÓN ─────────────────────────────────────────────────────────────────
  'Japón': {
    'Tokio': [
      { title: 'Senso-ji al amanecer', type: 'sight', address: '2 Chome-3-1 Asakusa, Taito', lat: 35.7148, lng: 139.7967, notes: 'El templo más famoso de Tokio sin turistas. Llega antes de las 7h. El mercado de Nakamise está cerrado pero el templo y el ambiente son únicos.', tags: ['templo', 'amanecer', 'asakusa'], price: 'low', best_time: 'mañana', visits: 891 },
      { title: 'Shinjuku Gyoen', type: 'sight', address: '11 Naitomachi, Shinjuku', lat: 35.6852, lng: 139.7101, notes: 'El jardín más bello de Tokio. En primavera los cerezos son impresionantes. 500¥ de entrada. Prohibido el alcohol (pero todo el mundo lo lleva).', tags: ['jardín', 'sakura', 'naturaleza'], price: 'low', best_time: 'mañana', visits: 734 },
      { title: 'Tsukiji Outer Market', type: 'food', address: '4 Chome-16-2 Tsukiji, Chuo', lat: 35.6655, lng: 139.7707, notes: 'El mercado exterior (gratuito) sigue siendo increíble. Sushi y marisco fresco para desayunar por menos de 1000¥. Llega antes de las 8h.', tags: ['sushi', 'mercado', 'desayuno'], price: 'low', best_time: 'mañana', visits: 612 },
      { title: 'Omoide Yokocho', type: 'food', address: '1 Chome-2 Nishishinjuku, Shinjuku', lat: 35.6916, lng: 139.7003, notes: 'El callejón del recuerdo. Pequeños bares de yakitori llenos de humo y salaryman japoneses. La experiencia más auténtica de Tokio nocturno. Reserva imposible, llega y espera.', tags: ['yakitori', 'nocturno', 'auténtico'], price: 'low', best_time: 'noche', visits: 445 },
      { title: 'Yanaka Ginza', type: 'sight', address: 'Yanaka, Taito', lat: 35.7267, lng: 139.7714, notes: 'El barrio más tradicional de Tokio, casi sin cambios desde los años 60. Tiendas de artesanía, templos pequeños y gatos por todas partes. Tranquilo y sin turistas.', tags: ['tradicional', 'vintage', 'local'], price: 'low', best_time: 'tarde', visits: 378 },
      { title: 'TeamLab Borderless', type: 'activity', address: '1-3-8 Ariake, Koto', lat: 35.6339, lng: 139.7880, notes: 'Arte digital inmersivo impresionante. Reserva online con semanas de antelación. No lleves ropa blanca (absorbe las proyecciones). Mínimo 2 horas.', tags: ['arte', 'digital', 'inmersivo'], price: 'high', best_time: 'tarde', visits: 567 },
      { title: 'Ichiran Ramen', type: 'food', address: 'Varias ubicaciones en Tokio', lat: 35.6938, lng: 139.7034, notes: 'El ramen más famoso de Japón. Cabinas individuales para comer solo (cultura japonesa). El caldo de cerdo tonkotsu es adictivo. Cola inevitable pero merece.', tags: ['ramen', 'tonkotsu', 'clásico'], price: 'low', best_time: 'cualquier hora', visits: 823 },
    ],
    'Kioto': [
      { title: 'Fushimi Inari de noche', type: 'sight', address: '68 Fukakusa Yabunouchicho, Fushimi', lat: 34.9671, lng: 135.7727, notes: 'Los miles de torii naranjas sin turistas. Después de las 20h estás prácticamente solo. Lleva linterna o usa el móvil. Los zorros son sagrados, no los molestes.', tags: ['torii', 'nocturno', 'fotográfico'], price: 'low', best_time: 'noche', visits: 756 },
      { title: 'Arashiyama Bamboo Grove', type: 'sight', address: 'Sagaogurayama Tabuchiyamacho, Ukyo', lat: 35.0170, lng: 135.6720, notes: 'El bosque de bambú más famoso de Japón. Llega antes de las 7h o después de las 17h para evitar la multitud. 10 minutos a pie desde la estación.', tags: ['bambú', 'naturaleza', 'fotográfico'], price: 'low', best_time: 'mañana', visits: 892 },
      { title: 'Nishiki Market', type: 'food', address: 'Nishiki Market, Nakagyo', lat: 35.0052, lng: 135.7652, notes: 'La cocina de Kioto. 400 metros de puestos de comida callejera, encurtidos y dulces tradicionales. Cierra a las 18h. Prueba el tofu frito y los dango.', tags: ['mercado', 'comida', 'tradicional'], price: 'low', best_time: 'mediodía', visits: 634 },
      { title: 'Philosopher\'s Path al amanecer', type: 'sight', address: 'Philosopher\'s Walk, Sakyo', lat: 35.0268, lng: 135.7948, notes: 'El camino de los filósofos bordeando un canal con cerezos. En primavera es de los más bonitos del mundo. En verano y otoño también merece mucho.', tags: ['paseo', 'canal', 'sakura'], price: 'low', best_time: 'mañana', visits: 445 },
    ],
    'Osaka': [
      { title: 'Dotonbori de noche', type: 'sight', address: 'Dotonbori, Chuo', lat: 34.6687, lng: 135.5013, notes: 'El corazón de Osaka de noche. Letreros de neón, takoyaki en la calle y el famoso cartel del hombre corriendo. Ruidoso, caótico y absolutamente único.', tags: ['nocturno', 'comida', 'neon'], price: 'low', best_time: 'noche', visits: 934 },
      { title: 'Kuromon Market', type: 'food', address: '2 Chome-4-1 Nipponbashi, Chuo', lat: 34.6643, lng: 135.5072, notes: 'La cocina de Osaka. Marisco fresco, wagyu y frutas exóticas. Muchos puestos te cocinan en el momento. Mejor entre semana por la mañana.', tags: ['mercado', 'marisco', 'wagyu'], price: 'mid', best_time: 'mañana', visits: 523 },
    ],
  },

  // ── MÉXICO ────────────────────────────────────────────────────────────────
  'México': {
    'Ciudad de México': [
      { title: 'Mercado de Coyoacán', type: 'food', address: 'Ignacio Allende 6, Coyoacán', lat: 19.3500, lng: -99.1616, notes: 'El mercado más bonito de CDMX. Tostadas de tinga, quesillo y agua de jamaica. Los fines de semana hay artesanías y música. Cerca de la Casa Azul de Frida Kahlo.', tags: ['tostadas', 'mercado', 'local'], price: 'low', best_time: 'mediodía', visits: 567 },
      { title: 'Azotea del Hotel Ritz', type: 'sight', address: 'Av. Madero 30, Centro', lat: 19.4330, lng: -99.1392, notes: 'Vistas impresionantes al Zócalo y la Catedral. Acceso gratuito, solo consume algo en el bar. Al atardecer es especialmente bonito.', tags: ['rooftop', 'vistas', 'centro'], price: 'mid', best_time: 'tarde', visits: 389 },
      { title: 'Cantina La Faena', type: 'food', address: 'C. de Uruguay 4, Centro', lat: 19.4324, lng: -99.1344, notes: 'La cantina más antigua del Centro. Mezcal, pulque y botanas de regalo con cada copa. Ambiente de los años 50. Los mariachis pasan a veces.', tags: ['cantina', 'mezcal', 'histórico'], price: 'low', best_time: 'tarde', visits: 312 },
      { title: 'Roma Norte at Night', type: 'sight', address: 'Colonia Roma Norte, CDMX', lat: 19.4194, lng: -99.1617, notes: 'El barrio más cool de CDMX. Restaurantes de autor, natural wine bars y galerías. Álvaro Obregón de noche tiene una energía increíble. Nada que ver con la película.', tags: ['barrio', 'restaurantes', 'nocturno'], price: 'mid', best_time: 'noche', visits: 445 },
      { title: 'Tacos de Canasta El Karly', type: 'food', address: 'Mercado de Medellín, Roma', lat: 19.4089, lng: -99.1673, notes: 'Los mejores tacos de canasta de la ciudad. 10 pesos cada uno. De chicharrón, frijoles y papa. Desayuno perfecto antes de las 11h cuando se acaban.', tags: ['tacos', 'canasta', 'desayuno'], price: 'low', best_time: 'mañana', visits: 234 },
    ],
    'Oaxaca': [
      { title: 'Mercado 20 de Noviembre', type: 'food', address: 'C. 20 de Noviembre, Centro', lat: 17.0639, lng: -96.7200, notes: 'El mercado donde probar el mole negro, tlayudas y chapulines. Los pasillos de humo del asado son espectaculares. No te vayas sin probar el chocolate oaxaqueño.', tags: ['mole', 'tlayuda', 'chapulines'], price: 'low', best_time: 'mediodía', visits: 478 },
      { title: 'Monte Albán al atardecer', type: 'sight', address: 'San Pablo Villa de Mitla', lat: 17.0433, lng: -96.7672, notes: 'Zona arqueológica zapoteca con vistas de 360° al Valle de Oaxaca. Al atardecer es mágico. Tarda 30 min en taxi desde el centro. Cierra a las 18h.', tags: ['arqueología', 'sunset', 'zapoteca'], price: 'low', best_time: 'tarde', visits: 356 },
    ],
  },

  // ── COLOMBIA ──────────────────────────────────────────────────────────────
  'Colombia': {
    'Medellín': [
      { title: 'El Poblado de noche', type: 'sight', address: 'El Poblado, Medellín', lat: 6.2087, lng: -75.5671, notes: 'El barrio más seguro y animado para salir. Parque Lleras lleno de terrazas y bares. Empieza la noche en Pergamino tomando café.', tags: ['barrio', 'nocturno', 'terraza'], price: 'mid', best_time: 'noche', visits: 534 },
      { title: 'Metrocable a Santo Domingo', type: 'activity', address: 'Estación Acevedo, Metrocable', lat: 6.2813, lng: -75.5583, notes: 'El teleférico que transforma comunas en destino turístico. Vistas increíbles de la ciudad. Usa el metro normal hasta Acevedo y sube. Completamente seguro.', tags: ['teleférico', 'comunas', 'vistas'], price: 'low', best_time: 'tarde', visits: 423 },
      { title: 'Pergamino Café', type: 'food', address: 'Av. El Poblado 43A-106', lat: 6.2104, lng: -75.5680, notes: 'El mejor café de especialidad de Medellín. Granos colombianos de alta calidad, baristas expertos. Perfecto para trabajar o empezar el día. Cola frecuente pero rápida.', tags: ['café', 'especialidad', 'workfriendly'], price: 'mid', best_time: 'mañana', visits: 389 },
    ],
    'Cartagena': [
      { title: 'Ciudad Amurallada al atardecer', type: 'sight', address: 'Ciudad Amurallada, Cartagena', lat: 10.4236, lng: -75.5508, notes: 'Caminar las murallas al atardecer es uno de los mejores momentos de Colombia. Las casas de colores se iluminan con la luz dorada. Lleva agua — hace mucho calor.', tags: ['murallas', 'sunset', 'colonial'], price: 'low', best_time: 'tarde', visits: 712 },
      { title: 'Getsemaní', type: 'sight', address: 'Barrio Getsemaní, Cartagena', lat: 10.4258, lng: -75.5539, notes: 'El barrio más auténtico de Cartagena. Street art increíble, arepas de huevo en la esquina y menos turistas que el centro. De noche hay salsa en la calle.', tags: ['streetart', 'local', 'salsa'], price: 'low', best_time: 'tarde', visits: 456 },
    ],
  },

  // ── ARGENTINA ─────────────────────────────────────────────────────────────
  'Argentina': {
    'Buenos Aires': [
      { title: 'Feria de San Telmo', type: 'shopping', address: 'Defensa 1050, San Telmo', lat: -34.6213, lng: -58.3731, notes: 'El mercado de pulgas más famoso de BA, solo los domingos. Antigüedades, tango en la calle y empanadas. Llega antes de las 11h para ver lo mejor antes de las hordas.', tags: ['feria', 'domingo', 'tango'], price: 'low', best_time: 'mañana', visits: 623 },
      { title: 'La Birrera', type: 'food', address: 'Lavalle 947, San Nicolás', lat: -34.6028, lng: -58.3833, notes: 'Parrilla bonaerense de toda la vida. Vacío, entraña y chorizo al punto. Sin reservas. Los vinos de la casa son perfectos. El mejor precio-calidad de la ciudad.', tags: ['parrilla', 'vacío', 'auténtico'], price: 'mid', best_time: 'noche', visits: 345 },
      { title: 'Caminito La Boca', type: 'sight', address: 'Caminito, La Boca', lat: -34.6345, lng: -58.3631, notes: 'Las casas de chapa de colores más fotogénicas de BA. Solo visitar de día y no alejarse de la calle principal. Tango en vivo y mucho color.', tags: ['colorido', 'tango', 'fotográfico'], price: 'low', best_time: 'mediodía', visits: 789 },
      { title: 'El Ateneo Grand Splendid', type: 'sight', address: 'Av. Santa Fe 1860, Recoleta', lat: -34.5959, lng: -58.3929, notes: 'La librería más bonita del mundo según National Geographic. Teatro convertido en librería. Incluso si no compras nada, merece la visita solo por verla.', tags: ['librería', 'arquitectura', 'imprescindible'], price: 'low', best_time: 'tarde', visits: 934 },
    ],
  },

  // ── PERÚ ──────────────────────────────────────────────────────────────────
  'Perú': {
    'Cusco': [
      { title: 'Mirador de San Blas', type: 'sight', address: 'Barrio de San Blas, Cusco', lat: -13.5155, lng: -71.9773, notes: 'Las mejores vistas del centro histórico de Cusco. El barrio de artesanos es el más bonito de la ciudad. Sube caminando — aclimatación obligatoria.', tags: ['mirador', 'artesanos', 'vistas'], price: 'low', best_time: 'tarde', visits: 534 },
      { title: 'Mercado de San Pedro', type: 'food', address: 'C. Cascaparo, Cusco', lat: -13.5218, lng: -71.9794, notes: 'El mercado local de Cusco. Desayuno cusqueño por menos de 5 soles: api morada, tamales y chicharrón. Los turistas van al de San Blas pero este es el real.', tags: ['mercado', 'local', 'desayuno'], price: 'low', best_time: 'mañana', visits: 378 },
    ],
    'Lima': [
      { title: 'Miraflores Malecón', type: 'sight', address: 'Malecón de la Reserva, Miraflores', lat: -12.1328, lng: -77.0282, notes: 'El acantilado sobre el Pacífico más impresionante de Lima. Parapente disponible. Al atardecer con la ciudad de fondo es espectacular.', tags: ['acantilado', 'pacífico', 'parapente'], price: 'low', best_time: 'tarde', visits: 623 },
      { title: 'Central Restaurante', type: 'food', address: 'Av. Pedro de Osma 301, Barranco', lat: -12.1461, lng: -77.0219, notes: 'El mejor restaurante de Latinoamérica según rankings mundiales. Cocina de Virgilio Martínez. Reserva con meses de antelación. Una experiencia única de gastronomía peruana.', tags: ['fine dining', 'virgilio', 'imprescindible'], price: 'high', best_time: 'noche', visits: 234 },
    ],
  },

  // ── FRANCIA ───────────────────────────────────────────────────────────────
  'Francia': {
    'París': [
      { title: 'Sacré-Cœur al amanecer', type: 'sight', address: '35 Rue du Chevalier de la Barre, 75018', lat: 48.8867, lng: 2.3431, notes: 'La basílica sin turistas. Antes de las 7h tienes Montmartre para ti solo. Las vistas de París al amanecer son imposibles de superar. Lleva un croissant.', tags: ['amanecer', 'montmartre', 'vistas'], price: 'low', best_time: 'mañana', visits: 812 },
      { title: 'Marché d\'Aligre', type: 'food', address: 'Place d\'Aligre, 75012', lat: 48.8494, lng: 2.3783, notes: 'El mercado más auténtico de París, lejos del turismo. Frutas, quesos y vino natural. Los domingos hay además un mercado de pulgas. Precios de mercado local, no turístico.', tags: ['mercado', 'local', 'queso'], price: 'low', best_time: 'mañana', visits: 345 },
      { title: 'Canal Saint-Martin', type: 'sight', address: 'Canal Saint-Martin, 75010', lat: 48.8703, lng: 2.3636, notes: 'El canal más bonito de París. Terrazas de cafés, puentes de hierro y parisinos comiendo en la orilla. Los sábados hay mercadillo. Zona muy local.', tags: ['canal', 'terrazas', 'local'], price: 'low', best_time: 'tarde', visits: 567 },
    ],
  },

  // ── ITALIA ────────────────────────────────────────────────────────────────
  'Italia': {
    'Roma': [
      { title: 'Gianicolo al amanecer', type: 'sight', address: 'Passeggiata del Gianicolo, Roma', lat: 41.8926, lng: 12.4673, notes: 'Las mejores vistas de Roma sin turistas. Subida a pie de 20 min desde Trastevere. Los domingos hay espectáculo de marionetas para niños. La cañonada del mediodía es una tradición.', tags: ['vistas', 'amanecer', 'colina'], price: 'low', best_time: 'mañana', visits: 445 },
      { title: 'Testaccio Market', type: 'food', address: 'Via Galvani, Roma', lat: 41.8763, lng: 12.4785, notes: 'El mercado gastronómico más auténtico de Roma. Supplì, porchetta y frutta fresca. Precios de mercado local. El box 15 tiene la mejor pizza al taglio de la ciudad.', tags: ['mercado', 'supplì', 'local'], price: 'low', best_time: 'mediodía', visits: 378 },
    ],
    'Florencia': [
      { title: 'Piazzale Michelangelo al atardecer', type: 'sight', address: 'Piazzale Michelangelo, Firenze', lat: 43.7629, lng: 11.2652, notes: 'La panorámica más famosa de Florencia. En verano lleno de turistas pero merece la pena. Sube a pie por los jardines (20 min) o en autobús. Lleva algo de beber.', tags: ['panorámica', 'sunset', 'imprescindible'], price: 'low', best_time: 'tarde', visits: 789 },
    ],
  },

  // ── TAILANDIA ─────────────────────────────────────────────────────────────
  'Tailandia': {
    'Bangkok': [
      { title: 'Wat Arun al amanecer', type: 'sight', address: '158 Thanon Wang Doem, Bangkok', lat: 13.7437, lng: 100.4888, notes: 'El templo del amanecer desde el otro lado del río. Toma el ferry (4 baht) desde Tha Tien. Antes de las 8h estás casi solo. Las vistas de Wat Arun reflejado en el agua son mágicas.', tags: ['templo', 'amanecer', 'río'], price: 'low', best_time: 'mañana', visits: 678 },
      { title: 'Or Tor Kor Market', type: 'food', address: 'Kamphaeng Phet 1 Rd, Bangkok', lat: 13.7989, lng: 100.5498, notes: 'El mercado de frutas más bonito de Bangkok. Mangos, durian, mangostán y todo tipo de fruta tropical. El restaurante interior tiene curry excelente. Muy local.', tags: ['frutas', 'curry', 'local'], price: 'low', best_time: 'mañana', visits: 345 },
      { title: 'Khao San Road de noche', type: 'sight', address: 'Khao San Road, Phra Nakhon', lat: 13.7588, lng: 100.4974, notes: 'La calle más famosa de Bangkok. Caótica, ruidosa y absolutamente única. Cervezas baratas, comida callejera y todos los viajeros del mundo. Amor u odio, hay que verla.', tags: ['mochileros', 'nocturno', 'caótico'], price: 'low', best_time: 'noche', visits: 912 },
    ],
    'Chiang Mai': [
      { title: 'Doi Suthep al amanecer', type: 'sight', address: 'Doi Suthep-Pui National Park', lat: 18.8047, lng: 98.9216, notes: 'El templo en la montaña sobre Chiang Mai. Sale una songthaew (pickup compartido) desde el centro por 50 baht. Al amanecer las nubes rodean el templo. Espectacular.', tags: ['templo', 'montaña', 'amanecer'], price: 'low', best_time: 'mañana', visits: 534 },
    ],
  },

  // ── MARRUECOS ─────────────────────────────────────────────────────────────
  'Marruecos': {
    'Marrakech': [
      { title: 'Jardín Majorelle al abrir', type: 'sight', address: 'Rue Yves St Laurent, Marrakech', lat: 31.6416, lng: -8.0000, notes: 'El jardín azul más famoso de Marrakech. Llega justo cuando abre (9h) para estar casi solo. Diseñado por Yves Saint Laurent. Los cactus y el azul cobalto son únicos.', tags: ['jardín', 'azul', 'fotográfico'], price: 'mid', best_time: 'mañana', visits: 723 },
      { title: 'Derb Chtouka at dusk', type: 'sight', address: 'Medina de Marrakech', lat: 31.6258, lng: -7.9891, notes: 'Perderse por las calles de la medina al atardecer. Los souks se llenan de luz naranja. Contrata un guía local para la primera vez (20 dirhams) — el laberinto es real.', tags: ['medina', 'souk', 'sunset'], price: 'low', best_time: 'tarde', visits: 456 },
    ],
  },

  // ── PORTUGAL ──────────────────────────────────────────────────────────────
  'Portugal': {
    'Lisboa': [
      { title: 'Miradouro da Graça', type: 'sight', address: 'Largo da Graça, Lisboa', lat: 38.7165, lng: -9.1302, notes: 'El mirador más local de Lisboa, sin turistas. Vistas del castillo y el río. Los vecinos vienen a tomar cerveza al atardecer. Mucho mejor que el Portas do Sol.', tags: ['mirador', 'local', 'sunset'], price: 'low', best_time: 'tarde', visits: 534 },
      { title: 'Tasca do Chico', type: 'food', address: 'R. do Diário de Notícias 39, Lisboa', lat: 38.7116, lng: -9.1433, notes: 'El fado más auténtico de Lisboa. Pequeño, íntimo, sin turismo masivo. Solo 20 mesas — reserva imprescindible. El bacalhau à Brás es de los mejores de la ciudad.', tags: ['fado', 'bacalhau', 'auténtico'], price: 'mid', best_time: 'noche', visits: 389 },
      { title: 'LX Factory el domingo', type: 'shopping', address: 'R. Rodrigues de Faria 103, Lisboa', lat: 38.7027, lng: -9.1762, notes: 'El mercado hipster de Lisboa en una fábrica abandonada. Los domingos hay mercadillo, food trucks y música en vivo. Las librerías son increíbles. Ambiente muy cool.', tags: ['mercadillo', 'hipster', 'domingo'], price: 'low', best_time: 'mediodía', visits: 445 },
    ],
    'Porto': [
      { title: 'Livraria Lello', type: 'sight', address: 'R. das Carmelitas 144, Porto', lat: 41.1470, lng: -8.6151, notes: 'La librería que inspiró Harry Potter. Cola inevitable, pero comprar un libro por 3€ te da acceso. Las escaleras de madera son impresionantes. Llega antes de las 10h.', tags: ['librería', 'arquitectura', 'imprescindible'], price: 'low', best_time: 'mañana', visits: 867 },
      { title: 'Cais da Ribeira al atardecer', type: 'sight', address: 'Cais da Ribeira, Porto', lat: 41.1408, lng: -8.6136, notes: 'El paseo fluvial más bonito de Portugal. Las casas de colores reflejadas en el Douro al atardecer son mágicas. Las tascas de la orilla tienen el mejor vino del Porto.', tags: ['ribeira', 'douro', 'sunset'], price: 'low', best_time: 'tarde', visits: 712 },
    ],
  },
};

export function getSeedSpotsForCity(country, city) {
  return SEED_SPOTS[country]?.[city] || [];
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