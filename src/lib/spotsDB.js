/**
 * spotsDB.js
 * Librería de spots/lugares destacados hardcodeados por ciudad y país.
 * Sin dependencias externas.
 */

// ── Spots por ciudad ──────────────────────────────────────────────────────────

const spotsByCity = {
  // JAPÓN
  'tokyo': [
    { title: 'Senso-ji', type: 'sight', notes: 'Templo budista más antiguo de Tokio, en Asakusa', address: 'Asakusa, Taito, Tokyo' },
    { title: 'Shibuya Crossing', type: 'sight', notes: 'El cruce peatonal más famoso del mundo', address: 'Shibuya, Tokyo' },
    { title: 'Shinjuku Gyoen', type: 'activity', notes: 'Jardín nacional con cerezos espectaculares en primavera', address: 'Shinjuku, Tokyo' },
    { title: 'Tsukiji Outer Market', type: 'food', notes: 'Mercado con el mejor sushi y marisco fresco', address: 'Tsukiji, Chuo, Tokyo' },
    { title: 'Meiji Shrine', type: 'sight', notes: 'Santuario sintoísta rodeado de bosque en plena ciudad', address: 'Yoyogi, Shibuya, Tokyo' },
    { title: 'Akihabara', type: 'shopping', notes: 'Barrio electrónico y cultura otaku', address: 'Akihabara, Chiyoda, Tokyo' },
    { title: 'teamLab Borderless', type: 'activity', notes: 'Museo de arte digital inmersivo', address: 'Odaiba, Koto, Tokyo' },
    { title: 'Ramen Street (Tokyo Station)', type: 'food', notes: '8 de los mejores ramen de Japón bajo tierra', address: 'Tokyo Station B1, Marunouchi' },
  ],
  'kyoto': [
    { title: 'Fushimi Inari Taisha', type: 'sight', notes: 'Miles de torii naranjas en la montaña. Madrugad para evitar turistas', address: 'Fukakusa Yabunouchicho, Fushimi, Kyoto' },
    { title: 'Arashiyama Bamboo Grove', type: 'sight', notes: 'Bosque de bambú mágico', address: 'Sagaogurayama Tabuchiyamacho, Ukyo, Kyoto' },
    { title: 'Kinkaku-ji', type: 'sight', notes: 'El Pabellón Dorado. Uno de los más fotografiados de Japón', address: 'Kinkakujicho, Kita, Kyoto' },
    { title: 'Nishiki Market', type: 'food', notes: 'El estómago de Kyoto. 400 años de historia gastronómica', address: 'Nishiki, Nakagyo, Kyoto' },
    { title: 'Philosopher\'s Path', type: 'activity', notes: 'Paseo junto al canal bordeado de cerezos', address: 'Jodoji, Sakyo, Kyoto' },
    { title: 'Gion District', type: 'sight', notes: 'El barrio de las geishas. Mejor al atardecer', address: 'Gion, Higashiyama, Kyoto' },
  ],
  'osaka': [
    { title: 'Dotonbori', type: 'sight', notes: 'El corazón gastronómico de Osaka, lleno de vida nocturna', address: 'Dotonbori, Chuo, Osaka' },
    { title: 'Osaka Castle', type: 'sight', notes: 'Castillo histórico con vistas panorámicas', address: 'Osakajo, Chuo, Osaka' },
    { title: 'Kuromon Market', type: 'food', notes: 'Mercado cubierto con 150 tiendas de productos frescos', address: 'Nipponbashi, Naniwa, Osaka' },
    { title: 'Takoyaki Juhachiban', type: 'food', notes: 'Los mejores takoyaki de Osaka, frente al castillo', address: 'Tanimachi, Chuo, Osaka' },
    { title: 'Universal Studios Japan', type: 'activity', notes: 'Parque temático con zona de Harry Potter y Nintendo', address: 'Sakurajima, Konohana, Osaka' },
  ],

  // TAILANDIA
  'bangkok': [
    { title: 'Wat Phra Kaew', type: 'sight', notes: 'Templo del Buda de Esmeralda, el más sagrado de Tailandia', address: 'Grand Palace, Bangkok' },
    { title: 'Chatuchak Weekend Market', type: 'shopping', notes: 'Uno de los mercados más grandes del mundo (15.000 puestos)', address: 'Chatuchak, Bangkok' },
    { title: 'Khao San Road', type: 'activity', notes: 'La calle mochilera por excelencia, ambiente vibrante', address: 'Khao San Rd, Phra Nakhon, Bangkok' },
    { title: 'Floating Market Damnoen Saduak', type: 'sight', notes: 'Mercado flotante tradicional, mejor ir temprano', address: 'Damnoen Saduak, Ratchaburi' },
    { title: 'Pad Thai Fawt Ew', type: 'food', notes: 'Considerado el mejor pad thai de Bangkok', address: 'Wang Lang Market, Bangkok' },
    { title: 'Wat Arun', type: 'sight', notes: 'El Templo del Amanecer con vistas al río Chao Phraya', address: 'Arun Amarin Rd, Bangkok Yai' },
  ],
  'chiang mai': [
    { title: 'Doi Suthep', type: 'sight', notes: 'Templo dorado en lo alto de la montaña, vistas increíbles', address: 'Doi Suthep, Chiang Mai' },
    { title: 'Night Bazaar', type: 'shopping', notes: 'Mercado nocturno con artesanía local y comida callejera', address: 'Chang Klan Rd, Chiang Mai' },
    { title: 'Elephant Nature Park', type: 'activity', notes: 'Santuario ético para elefantes rescatados', address: 'Mae Taeng, Chiang Mai' },
    { title: 'Sunday Walking Street', type: 'shopping', notes: 'La calle peatonal más popular del domingo por la noche', address: 'Wualai Rd, Chiang Mai' },
  ],

  // VIETNAM
  'hanoi': [
    { title: 'Hoan Kiem Lake', type: 'sight', notes: 'El lago del centro histórico, precioso al amanecer', address: 'Hoan Kiem, Hanoi' },
    { title: 'Old Quarter', type: 'sight', notes: '36 calles medievales, la Medina de Asia', address: 'Hoan Kiem, Hanoi' },
    { title: 'Bun Cha Huong Lien', type: 'food', notes: 'El restaurante donde Obama y Bourdain comieron bun cha', address: '24 Le Van Huu, Hanoi' },
    { title: 'Temple of Literature', type: 'sight', notes: 'Primera universidad de Vietnam, fundada en 1070', address: 'Dong Da, Hanoi' },
  ],
  'ho chi minh': [
    { title: 'War Remnants Museum', type: 'sight', notes: 'Museo impactante sobre la guerra de Vietnam', address: '28 Vo Van Tan, Ho Chi Minh City' },
    { title: 'Ben Thanh Market', type: 'shopping', notes: 'Mercado central histórico con productos locales', address: 'Le Loi, District 1, Ho Chi Minh City' },
    { title: 'Cu Chi Tunnels', type: 'activity', notes: 'Red de túneles subterráneos usados durante la guerra', address: 'Cu Chi District, Ho Chi Minh City' },
    { title: 'Banh Mi Huynh Hoa', type: 'food', notes: 'El mejor banh mi de la ciudad, colas kilométricas', address: '26 Le Thi Rieng, District 1' },
  ],
  'hoi an': [
    { title: 'Ancient Town', type: 'sight', notes: 'Casco histórico UNESCO, precioso de noche con linternas', address: 'Hoi An Ancient Town' },
    { title: 'White Rose Restaurant', type: 'food', notes: 'Especialidad local: banh bao vac (rosas blancas de arroz)', address: '533 Hai Ba Trung, Hoi An' },
    { title: 'An Bang Beach', type: 'activity', notes: 'La playa más tranquila cerca de Hoi An', address: 'An Bang, Hoi An' },
    { title: 'Cao Lau', type: 'food', notes: 'Plato único de Hoi An que solo se puede comer aquí', address: 'Central Market, Hoi An' },
  ],

  // INDONESIA
  'bali': [
    { title: 'Tanah Lot', type: 'sight', notes: 'Templo sobre una roca en el mar, espectacular al atardecer', address: 'Tanah Lot, Tabanan, Bali' },
    { title: 'Ubud Monkey Forest', type: 'activity', notes: 'Bosque sagrado con cientos de macacos', address: 'Ubud, Gianyar, Bali' },
    { title: 'Tegallalang Rice Terraces', type: 'sight', notes: 'Terrazas de arroz icónicas, mejor por la mañana', address: 'Tegallalang, Gianyar, Bali' },
    { title: 'Seminyak Beach', type: 'activity', notes: 'La playa más animada con bares y puestas de sol', address: 'Seminyak, Kuta Utara, Bali' },
    { title: 'Nasi Goreng Bali', type: 'food', notes: 'Arroz frito balinés, mejor en warungs locales', address: 'Ubud Market, Bali' },
  ],

  // INDIA
  'delhi': [
    { title: 'Red Fort', type: 'sight', notes: 'Fortaleza Mughal declarada Patrimonio de la Humanidad', address: 'Netaji Subhash Marg, Lal Qila, Delhi' },
    { title: 'Jama Masjid', type: 'sight', notes: 'La mezquita más grande de India', address: 'Jama Masjid Rd, Old Delhi' },
    { title: 'Chandni Chowk', type: 'shopping', notes: 'El bazar más antiguo y caótico de Delhi', address: 'Chandni Chowk, Old Delhi' },
    { title: 'Humayun\'s Tomb', type: 'sight', notes: 'Precursora del Taj Mahal, menos turistas', address: 'Mathura Rd, Nizamuddin, Delhi' },
  ],
  'agra': [
    { title: 'Taj Mahal', type: 'sight', notes: 'Una de las 7 maravillas del mundo. Entrar al amanecer', address: 'Dharmapuri, Agra, Uttar Pradesh' },
    { title: 'Agra Fort', type: 'sight', notes: 'Fortaleza con vistas al Taj Mahal', address: 'Rakabganj, Agra' },
    { title: 'Mehtab Bagh', type: 'sight', notes: 'Los jardines frente al Taj, perfectos para la puesta de sol', address: 'Nagla Devjit, Agra' },
  ],

  // COREA DEL SUR
  'seoul': [
    { title: 'Gyeongbokgung Palace', type: 'sight', notes: 'El palacio más grande de la dinastía Joseon', address: 'Sejongno, Jongno-gu, Seoul' },
    { title: 'Bukchon Hanok Village', type: 'sight', notes: 'Barrio de casas tradicionales coreanas (hanok)', address: 'Gahoe-dong, Jongno-gu, Seoul' },
    { title: 'Myeongdong', type: 'shopping', notes: 'El paraíso del K-beauty y la moda coreana', address: 'Myeongdong, Jung-gu, Seoul' },
    { title: 'N Seoul Tower', type: 'sight', notes: 'Torre icónica con vistas panorámicas de la ciudad', address: 'Yongsan-gu, Seoul' },
    { title: 'Gwangjang Market', type: 'food', notes: 'Mercado histórico con bindaetteok y bibimbap auténtico', address: 'Jongno, Seoul' },
  ],

  // MARRUECOS
  'marrakech': [
    { title: 'Jemaa el-Fna', type: 'sight', notes: 'La plaza más famosa de África, llena de vida día y noche', address: 'Jemaa el-Fna, Marrakech' },
    { title: 'Souks de Marrakech', type: 'shopping', notes: 'Laberinto de mercados tradicionales', address: 'Medina, Marrakech' },
    { title: 'Bahia Palace', type: 'sight', notes: 'Palacio del siglo XIX con patios y jardines increíbles', address: 'Rue Riad Zitoun el Jedid, Marrakech' },
    { title: 'Jardín Majorelle', type: 'sight', notes: 'Jardín botánico y museo Berber de Yves Saint Laurent', address: 'Rue Yves Saint Laurent, Marrakech' },
    { title: 'Café des Épices', type: 'food', notes: 'Terraza con vistas a la plaza de las especias', address: '75 Rahba Lakdima, Marrakech' },
  ],

  // TURQUÍA
  'istanbul': [
    { title: 'Hagia Sophia', type: 'sight', notes: 'Basílica-mezquita del siglo VI, imprescindible', address: 'Sultanahmet, Fatih, Istanbul' },
    { title: 'Grand Bazaar', type: 'shopping', notes: 'Uno de los mercados cubiertos más grandes del mundo', address: 'Beyazit, Fatih, Istanbul' },
    { title: 'Bosphorus Cruise', type: 'activity', notes: 'Crucero entre Europa y Asia, vistas únicas', address: 'Eminonu Pier, Istanbul' },
    { title: 'Blue Mosque', type: 'sight', notes: 'La única mezquita de Estambul con 6 alminares', address: 'Sultanahmet, Fatih, Istanbul' },
    { title: 'Galata Tower', type: 'sight', notes: 'Torre medieval con vistas 360° de la ciudad', address: 'Galata, Beyoglu, Istanbul' },
    { title: 'Karakoy Gulluoglu', type: 'food', notes: 'El baklava más famoso de Estambul desde 1949', address: 'Mumhane Cad 171, Karakoy' },
  ],

  // GRECIA
  'athens': [
    { title: 'Acropolis', type: 'sight', notes: 'El símbolo de la civilización occidental. Ir por la mañana', address: 'Acropolis, Athens' },
    { title: 'Monastiraki Flea Market', type: 'shopping', notes: 'Mercadillo ecléctico en el corazón de Atenas', address: 'Monastiraki, Athens' },
    { title: 'Plaka District', type: 'sight', notes: 'El barrio más pintoresco de Atenas, al pie de la Acrópolis', address: 'Plaka, Athens' },
    { title: 'Tzitzikas Kai Mermigas', type: 'food', notes: 'Taverna moderna con los mejores mezes de la ciudad', address: '12 Mitropoleos, Athens' },
  ],

  // ITALIA
  'rome': [
    { title: 'Colosseum', type: 'sight', notes: 'El anfiteatro romano más grande del mundo. Reservar online', address: 'Piazza del Colosseo, Rome' },
    { title: 'Trevi Fountain', type: 'sight', notes: 'La fuente más famosa del mundo. Mejor de madrugada', address: 'Piazza di Trevi, Rome' },
    { title: 'Vatican Museums', type: 'sight', notes: 'La Capilla Sixtina y los museos del Vaticano', address: 'Viale Vaticano, Vatican City' },
    { title: 'Trastevere', type: 'sight', notes: 'El barrio más auténtico de Roma para cenar', address: 'Trastevere, Rome' },
    { title: 'Supplì Roma', type: 'food', notes: 'Las mejores supplì (croquetas de arroz) de Roma', address: 'Via di San Francesco a Ripa 137, Rome' },
  ],
  'florence': [
    { title: 'Uffizi Gallery', type: 'sight', notes: 'El mejor museo del Renacimiento. Reserva con antelación', address: 'Piazzale degli Uffizi, Florence' },
    { title: 'Ponte Vecchio', type: 'sight', notes: 'El puente medieval más famoso de Italia', address: 'Ponte Vecchio, Florence' },
    { title: 'Mercato Centrale', type: 'food', notes: 'Mercado histórico con la mejor comida florentina', address: 'Piazza del Mercato Centrale, Florence' },
    { title: 'Piazzale Michelangelo', type: 'sight', notes: 'Las mejores vistas de Florencia, ideal al atardecer', address: 'Piazzale Michelangelo, Florence' },
  ],
  'venice': [
    { title: 'St. Mark\'s Basilica', type: 'sight', notes: 'La catedral más espectacular de Italia', address: 'Piazza San Marco, Venice' },
    { title: 'Rialto Market', type: 'food', notes: 'El mercado de pescado más antiguo de Venecia', address: 'Rialto, San Polo, Venice' },
    { title: 'Burano Island', type: 'sight', notes: 'La isla de las casas de colores, a 40 min en vaporetto', address: 'Burano, Venice' },
    { title: 'Cicchetti Bar All\'Arco', type: 'food', notes: 'Los mejores cicchetti (tapas venecianas) de la ciudad', address: 'Calle Arco 436, Rialto, Venice' },
  ],

  // ESPAÑA
  'barcelona': [
    { title: 'Sagrada Família', type: 'sight', notes: 'La obra maestra de Gaudí. Reservar con meses de antelación', address: 'Carrer de Mallorca 401, Barcelona' },
    { title: 'Park Güell', type: 'sight', notes: 'Jardín de mosaicos de Gaudí con vistas a la ciudad', address: 'Carrer d\'Olot, Barcelona' },
    { title: 'La Boqueria', type: 'food', notes: 'El mercado más famoso de Barcelona', address: 'La Rambla 91, Barcelona' },
    { title: 'El Born', type: 'sight', notes: 'El barrio más cool de Barcelona, lleno de bares y arte', address: 'El Born, Barcelona' },
    { title: 'Bar El Xampanyet', type: 'food', notes: 'La mejor bodega de pintxos de El Born', address: 'Carrer de Montcada 22, Barcelona' },
  ],
  'madrid': [
    { title: 'Museo del Prado', type: 'sight', notes: 'Uno de los mejores museos del mundo. Imprescindible', address: 'Calle Ruiz de Alarcón 23, Madrid' },
    { title: 'Mercado de San Miguel', type: 'food', notes: 'Mercado gourmet en el corazón de Madrid', address: 'Plaza de San Miguel, Madrid' },
    { title: 'Retiro Park', type: 'activity', notes: 'El pulmón verde de Madrid. Alquilar barcas en el lago', address: 'Plaza de la Independencia 7, Madrid' },
    { title: 'Sobrino de Botín', type: 'food', notes: 'El restaurante más antiguo del mundo (1725)', address: 'Calle de los Cuchilleros 17, Madrid' },
  ],

  // FRANCIA
  'paris': [
    { title: 'Eiffel Tower', type: 'sight', notes: 'El símbolo de París. Subir al atardecer para el mejor show de luces', address: 'Champ de Mars, 5 Av. Anatole France, Paris' },
    { title: 'Louvre Museum', type: 'sight', notes: 'El museo más visitado del mundo. Reservar online', address: 'Rue de Rivoli, Paris' },
    { title: 'Montmartre', type: 'sight', notes: 'El barrio bohemio de los artistas', address: 'Montmartre, Paris' },
    { title: 'Marché des Enfants Rouges', type: 'food', notes: 'El mercado cubierto más antiguo de París (1615)', address: '39 Rue de Bretagne, Paris' },
    { title: 'Sainte-Chapelle', type: 'sight', notes: 'Las vidrieras góticas más impresionantes de Europa', address: '8 Bd du Palais, Paris' },
  ],

  // REINO UNIDO
  'london': [
    { title: 'British Museum', type: 'sight', notes: 'El museo más visitado del mundo. Entrada gratuita', address: 'Great Russell St, London' },
    { title: 'Borough Market', type: 'food', notes: 'El mercado gastronómico más famoso de Londres', address: '8 Southwark St, London' },
    { title: 'Tower of London', type: 'sight', notes: 'Fortaleza medieval con las joyas de la Corona', address: 'Tower of London, London' },
    { title: 'Shoreditch', type: 'sight', notes: 'El barrio del street art y las startups', address: 'Shoreditch, London' },
    { title: 'Dishoom', type: 'food', notes: 'El mejor restaurante indio-irani de Londres, colas épicas', address: '12 Upper St Martin\'s Lane, London' },
  ],

  // ALEMANIA
  'berlin': [
    { title: 'Brandenburg Gate', type: 'sight', notes: 'El símbolo de la reunificación alemana', address: 'Pariser Platz, Berlin' },
    { title: 'East Side Gallery', type: 'sight', notes: '1,3 km del muro de Berlín convertido en galería de arte', address: 'Mühlenstraße 3-100, Berlin' },
    { title: 'Markthalle Neun', type: 'food', notes: 'Mercado gourmet en Kreuzberg, mejor los jueves', address: 'Eisenbahnstraße 42-43, Berlin' },
    { title: 'Museum Island', type: 'sight', notes: 'Cinco museos en una isla en el centro de Berlín', address: 'Museum Island, Mitte, Berlin' },
  ],

  // PORTUGAL
  'lisbon': [
    { title: 'Alfama District', type: 'sight', notes: 'El barrio más antiguo de Lisboa, precioso al atardecer', address: 'Alfama, Lisbon' },
    { title: 'Pastéis de Belém', type: 'food', notes: 'Los pasteles de nata originales desde 1837', address: 'Rua de Belém 84-92, Lisbon' },
    { title: 'Tram 28', type: 'transport', notes: 'El tranvía histórico que recorre los barrios más pintorescos', address: 'Largo Martim Moniz, Lisbon' },
    { title: 'LX Factory', type: 'shopping', notes: 'Mercado dominical en una fábrica del siglo XIX', address: 'Rua Rodrigues Faria 103, Lisbon' },
    { title: 'Miradouro da Graça', type: 'sight', notes: 'El mejor mirador de Lisboa, sin turistas', address: 'Largo da Graça, Lisbon' },
  ],

  // EEUU
  'new york': [
    { title: 'Central Park', type: 'activity', notes: '341 hectáreas de naturaleza en el centro de Manhattan', address: 'Central Park, New York, NY' },
    { title: 'Metropolitan Museum of Art', type: 'sight', notes: 'Uno de los mejores museos del mundo', address: '1000 5th Ave, New York, NY' },
    { title: 'Brooklyn Bridge', type: 'sight', notes: 'El puente más famoso de Nueva York. Cruzarlo a pie', address: 'Brooklyn Bridge, New York, NY' },
    { title: 'Katz\'s Delicatessen', type: 'food', notes: 'El deli más famoso de NY, abierto desde 1888', address: '205 E Houston St, New York, NY' },
    { title: 'High Line', type: 'activity', notes: 'Parque elevado sobre una vía de tren en desuso', address: 'High Line, New York, NY' },
  ],
  'los angeles': [
    { title: 'Griffith Observatory', type: 'sight', notes: 'Vistas panorámicas de LA y las estrellas por la noche', address: '2800 E Observatory Rd, Los Angeles, CA' },
    { title: 'Venice Beach', type: 'activity', notes: 'La playa más característica de LA con el paseo Muscle Beach', address: 'Venice Beach, Los Angeles, CA' },
    { title: 'Getty Center', type: 'sight', notes: 'Museo de arte gratuito con vistas espectaculares', address: '1200 Getty Center Dr, Los Angeles, CA' },
    { title: 'Grand Central Market', type: 'food', notes: 'Mercado histórico con lo mejor de la gastronomía angelina', address: '317 S Broadway, Los Angeles, CA' },
  ],

  // MÉXICO
  'ciudad de mexico': [
    { title: 'Teotihuacán', type: 'sight', notes: 'Pirámides a 50 km de la ciudad. Ir al amanecer', address: 'Teotihuacán, Estado de México' },
    { title: 'Xochimilco', type: 'activity', notes: 'Canales con trajineras de colores y música en vivo', address: 'Xochimilco, CDMX' },
    { title: 'Museo Nacional de Antropología', type: 'sight', notes: 'El mejor museo de arqueología prehispánica del mundo', address: 'Av. Paseo de la Reforma, CDMX' },
    { title: 'Mercado de Medellín', type: 'food', notes: 'El mercado más auténtico de la Roma, sin turistas', address: 'Calle Medellín 234, Colonia Roma' },
    { title: 'Taqueria Los Cocuyos', type: 'food', notes: 'Los mejores tacos nocturnos del centro histórico', address: 'Calle Aranda 14, Centro Histórico' },
  ],

  // COLOMBIA
  'cartagena': [
    { title: 'Ciudad Amurallada', type: 'sight', notes: 'El casco histórico más bello de Colombia, Patrimonio UNESCO', address: 'Centro, Cartagena de Indias' },
    { title: 'Castillo San Felipe', type: 'sight', notes: 'La fortaleza española más grande de América', address: 'Carrera 17, San Felipe, Cartagena' },
    { title: 'La Vitrola', type: 'food', notes: 'El restaurante más famoso de Cartagena, gastronomía caribeña', address: 'Calle Baloco 2-01, Cartagena' },
    { title: 'Playa Blanca', type: 'activity', notes: 'La playa más bonita cerca de Cartagena, en las Islas del Rosario', address: 'Isla Barú, Cartagena' },
  ],

  // ARGENTINA
  'buenos aires': [
    { title: 'La Boca - El Caminito', type: 'sight', notes: 'El barrio más colorido de Buenos Aires', address: 'El Caminito, La Boca, Buenos Aires' },
    { title: 'San Telmo Market', type: 'shopping', notes: 'Mercado vintage y antigüedades en el barrio más antiguo', address: 'Defensa 961, San Telmo, Buenos Aires' },
    { title: 'Recoleta Cemetery', type: 'sight', notes: 'El cementerio más fascinante del mundo, con la tumba de Evita', address: 'Junín 1760, Recoleta, Buenos Aires' },
    { title: 'Don Julio', type: 'food', notes: 'La mejor parrilla de Buenos Aires según muchos porteños', address: 'Guatemala 4691, Palermo, Buenos Aires' },
  ],

  // EMIRATOS ÁRABES
  'dubai': [
    { title: 'Burj Khalifa', type: 'sight', notes: 'El edificio más alto del mundo. Subir al atardecer', address: '1 Sheikh Mohammed Bin Rashid Blvd, Dubai' },
    { title: 'Dubai Creek', type: 'sight', notes: 'El corazón histórico de Dubai, cruzar en abra', address: 'Al Seef, Bur Dubai' },
    { title: 'Gold Souk', type: 'shopping', notes: 'El mercado de oro más grande del mundo', address: 'Gold Souk, Deira, Dubai' },
    { title: 'Al Ustad Special Kabab', type: 'food', notes: 'Kebabs legendarios en Bur Dubai desde los 70s', address: 'Bur Dubai, Dubai' },
  ],

  // SINGAPUR
  'singapore': [
    { title: 'Gardens by the Bay', type: 'sight', notes: 'El jardín futurista con Supertrees. El show de luces es gratis', address: '18 Marina Gardens Dr, Singapore' },
    { title: 'Hawker Centre Maxwell', type: 'food', notes: 'El hawker centre más famoso de Singapur, Hainanese Chicken Rice', address: '1 Kadayanallur St, Singapore' },
    { title: 'Marina Bay Sands', type: 'sight', notes: 'El hotel icónico con la piscina infinita más alta del mundo', address: '10 Bayfront Ave, Singapore' },
    { title: 'Chinatown Heritage Centre', type: 'sight', notes: 'El barrio chino más auténtico del sudeste asiático', address: '48 Pagoda St, Singapore' },
  ],
};

// ── Spots genéricos por tipo de destino ──────────────────────────────────────

const genericSpotsByCountry = {
  'japan': [
    { title: '7-Eleven Japan', type: 'food', notes: 'Los konbini japoneses son un fenómeno: onigiri, ramen y mucho más a cualquier hora' },
    { title: 'Onsen local', type: 'activity', notes: 'Baño termal tradicional japonés. Busca los sentos públicos, más baratos que los resorts' },
    { title: 'Depachika', type: 'food', notes: 'La planta de alimentación de los grandes almacenes japoneses. Una joya gastronómica' },
  ],
  'thailand': [
    { title: 'Night market local', type: 'food', notes: 'Los mercados nocturnos tailandeses son la mejor forma de comer auténtico y barato' },
    { title: 'Wat local', type: 'sight', notes: 'Cada pueblo tailandés tiene un templo budista que merece una visita tranquila' },
    { title: 'Masaje tailandés tradicional', type: 'activity', notes: 'Masaje de 1 hora por 5-10€. Busca los que usan mat en el suelo' },
  ],
  'vietnam': [
    { title: 'Pho local', type: 'food', notes: 'La sopa nacional de Vietnam. Busca los locales sin carta en inglés' },
    { title: 'Bia Hoi Corner', type: 'food', notes: 'La cerveza más barata del mundo (20 centavos) en pequeñas sillas de plástico' },
    { title: 'Motorbike street food tour', type: 'activity', notes: 'La mejor forma de explorar la gastronomía callejera vietnamita' },
  ],
  'morocco': [
    { title: 'Hammam local', type: 'activity', notes: 'Baño árabe tradicional. Evita los turísticos y busca los de barrio' },
    { title: 'Mechoui local', type: 'food', notes: 'Cordero asado en horno de barro. La comida más auténtica de Marruecos' },
    { title: 'Riad con terraza', type: 'sight', notes: 'Pide subir a la terraza de cualquier riad para vistas sobre la medina' },
  ],
  'italy': [
    { title: 'Aperitivo local', type: 'food', notes: 'Entre las 18 y las 20h, muchos bares sirven aperitivo con snacks incluidos' },
    { title: 'Mercato locale', type: 'food', notes: 'El mercado local es siempre más auténtico que los turísticos' },
    { title: 'Gellateria artigianale', type: 'food', notes: 'Busca gelatería con cubetas cubiertas, señal de que es artesanal' },
  ],
};

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Devuelve spots destacados para una ciudad y/o país dados.
 * @param {string} cityName - Nombre de la ciudad
 * @param {string} countryName - Nombre del país (en inglés o español)
 * @returns {{ spots: Array, hasData: boolean }}
 */
export function getSpotsForDestination(cityName = '', countryName = '') {
  const cityKey = cityName.toLowerCase().trim();
  const countryKey = countryName.toLowerCase().trim();

  const citySpots = spotsByCity[cityKey] || [];

  // Intentar país en inglés o español
  const countryKeyMap = {
    'japón': 'japan', 'japan': 'japan',
    'tailandia': 'thailand', 'thailand': 'thailand',
    'vietnam': 'vietnam',
    'marruecos': 'morocco', 'morocco': 'morocco',
    'italia': 'italy', 'italy': 'italy',
  };
  const normalizedCountry = countryKeyMap[countryKey] || countryKey;
  const countrySpots = genericSpotsByCountry[normalizedCountry] || [];

  // Combinar: primero los de ciudad, luego los genéricos del país
  const combined = [...citySpots, ...countrySpots];

  return {
    spots: combined,
    hasData: combined.length > 0,
    cityOnly: citySpots.length > 0,
  };
}

/**
 * Devuelve las ciudades disponibles en la DB.
 */
export function getAvailableCities() {
  return Object.keys(spotsByCity);
}

/**
 * Busca spots por texto en título o notas.
 * @param {string} query
 * @returns {Array}
 */
export function searchSpots(query = '') {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = [];
  for (const [city, spots] of Object.entries(spotsByCity)) {
    for (const spot of spots) {
      if (
        spot.title.toLowerCase().includes(q) ||
        (spot.notes || '').toLowerCase().includes(q) ||
        city.includes(q)
      ) {
        results.push({ ...spot, city });
      }
    }
  }
  return results;
}

export { spotsByCity, genericSpotsByCountry };