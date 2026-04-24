/**
 * gastronomyDB.js — Base de datos gastronómica hardcodeada por país
 * Estructura: { [countryLabel]: { categories: [{ category, icon, items: [{ name, description, tags }] }] } }
 */

export const GASTRONOMY_DB = {

  // ── JAPÓN ─────────────────────────────────────────────────────────────────
  'Japón': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🍱',
        items: [
          { name: 'Ramen', description: 'Sopa de fideos con caldo de cerdo, pollo o mariscos. Existen variantes regionales: tonkotsu (Fukuoka), shoyu (Tokyo), miso (Hokkaido).', tags: ['popular', 'caliente'] },
          { name: 'Sushi', description: 'Arroz avinagrado con pescado crudo, marisco o verduras. El omakase (a elección del chef) es la experiencia definitiva.', tags: ['popular', 'frío'] },
          { name: 'Tempura', description: 'Mariscos y verduras rebozados en una masa muy ligera y fritos. Se sirve con salsa tentsuyu y daikon rallado.', tags: ['frito'] },
          { name: 'Tonkatsu', description: 'Filete de cerdo empanado y frito, servido con col finamente cortada y salsa tonkatsu. Muy popular en menú del día.', tags: ['frito', 'popular'] },
          { name: 'Yakitori', description: 'Brochetas de pollo a la parrilla con tare (salsa dulce) o sal. Perfectas para acompañar con cerveza en izakayas.', tags: ['parrilla', 'tapeo'] },
          { name: 'Gyoza', description: 'Empanadillas rellenas de cerdo y verduras, a la plancha por un lado. Se mojan en vinagre de arroz con aceite de sésamo.', tags: ['popular', 'snack'] },
          { name: 'Udon', description: 'Fideos gruesos de trigo en caldo dashi. Admite múltiples toppings: tempura, kitsune (tofu frito), curry...', tags: ['caliente'] },
          { name: 'Okonomiyaki', description: 'Tortita salada con col, carne o marisco a elección. Especialidad de Osaka y Hiroshima, cada ciudad con su versión propia.', tags: ['Osaka', 'Hiroshima'] },
        ],
      },
      {
        category: 'Sushi y pescado',
        icon: '🍣',
        items: [
          { name: 'Sashimi', description: 'Pescado o marisco crudo en láminas, sin arroz. Pedir omakase en mercado de Tsukiji o Toyosu para máxima frescura.', tags: ['fresco'] },
          { name: 'Chirashi', description: 'Cuenco de arroz de sushi cubierto con variedad de pescados y mariscos. Muy popular en almuerzos.', tags: ['almuerzo'] },
          { name: 'Onigiri', description: 'Bola de arroz rellena (atún, salmón, umeboshi) envuelta en alga nori. En cualquier konbini 24h, desde 100¥.', tags: ['barato', 'konbini', 'snack'] },
          { name: 'Kaiten-sushi', description: 'Sushi en cinta transportadora. Económico y divertido. Cadenas como Sushiro o Kura Sushi son excelentes opciones.', tags: ['económico', 'experiencia'] },
        ],
      },
      {
        category: 'Street food y snacks',
        icon: '🥢',
        items: [
          { name: 'Takoyaki', description: 'Bolitas de pulpo fritas en molde especial, con salsa, mayonesa y katsuobushi. Especialidad de Osaka, en Dotonbori.', tags: ['Osaka', 'street food'] },
          { name: 'Taiyaki', description: 'Pastel en forma de pez relleno de anko (pasta de judía roja), natillas o chocolate. Clásico snack de festival.', tags: ['dulce', 'festival'] },
          { name: 'Mochi', description: 'Pastel de arroz glutinoso, blando y elástico. Rellenos variados: anko, helado, fresa. Los mejores en templos y mercados.', tags: ['dulce', 'tradicional'] },
          { name: 'Yakisoba', description: 'Fideos fritos con verduras y cerdo, sazonados con salsa Worcestershire japonesa. Omnipresente en festivales.', tags: ['festival', 'street food'] },
          { name: 'Matcha todo', description: 'Kit Kat de matcha, helado, lattes, dorayaki... El té verde tiñe de verde cualquier postre en Kyoto especialmente.', tags: ['Kyoto', 'dulce'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🍶',
        items: [
          { name: 'Sake', description: 'Vino de arroz fermentado. Puede servirse frío (reishu) o caliente (atsukan). Mejor calidad en izakayas y sake bars.', tags: ['alcohol'] },
          { name: 'Asahi / Sapporo / Kirin', description: 'Las tres grandes cervezas japonesas. Asahi Super Dry es la más popular. Siempre frescas en máquinas expendedoras.', tags: ['alcohol'] },
          { name: 'Canned coffee', description: 'Café en lata caliente o frío, de las máquinas expendedoras. Boss Rainbow Mountain Blend es un clásico.', tags: ['bebida', 'máquina'] },
        ],
      },
    ],
  },

  // ── ITALIA ────────────────────────────────────────────────────────────────
  'Italia': {
    categories: [
      {
        category: 'Pasta',
        icon: '🍝',
        items: [
          { name: 'Carbonara', description: 'Pasta con guanciale, huevo, pecorino y pimienta negra. Sin nata — eso es un crimen en Roma. Solo en la capital.', tags: ['Roma', 'clásico'] },
          { name: 'Amatriciana', description: 'Salsa de tomate con guanciale y pecorino. Originaria de Amatrice, icónica en Roma con pasta bucatini.', tags: ['Roma', 'clásico'] },
          { name: 'Cacio e Pepe', description: 'Tres ingredientes: pasta, pecorino romano y pimienta negra. La simpleza elevada a arte culinario romano.', tags: ['Roma', 'simple'] },
          { name: 'Pesto alla Genovese', description: 'Salsa de albahaca, piñones, ajo, parmesano y aceite de oliva. Original de Génova, con pasta trofie o linguine.', tags: ['Génova', 'clásico'] },
          { name: 'Ragù alla Bolognese', description: 'Salsa de carne cocinada lentamente, servida con tagliatelle (nunca spaghetti, eso es americano) en Bolonia.', tags: ['Bolonia', 'clásico'] },
        ],
      },
      {
        category: 'Pizza',
        icon: '🍕',
        items: [
          { name: 'Pizza Napoletana', description: 'Masa fermentada 48h, mozzarella di bufala, tomate San Marzano. Cocinada en horno de leña a 485°C. Nápoles.', tags: ['Nápoles', 'DOP'] },
          { name: 'Pizza al taglio', description: 'Pizza rectangular vendida por peso en Roma. Perfecta para comer de pie. Variedades: bianca, rossa, con verduras.', tags: ['Roma', 'street food'] },
          { name: 'Focaccia', description: 'Pan plano esponjoso con aceite de oliva. En Génova es delgada y crujiente; en Puglia más gruesa y esponjosa.', tags: ['Génova', 'pan'] },
        ],
      },
      {
        category: 'Antipasti y platos',
        icon: '🧀',
        items: [
          { name: 'Burrata', description: 'Queso de mozzarella relleno de stracciatella y nata. Fresca, en ensalada con tomate y albahaca. Origen Puglia.', tags: ['Puglia', 'queso'] },
          { name: 'Prosciutto di Parma', description: 'Jamón curado de Parma, 18-24 meses. Con melón en verano o envolviendo grissini. No confundir con el cocido.', tags: ['Parma', 'embutido'] },
          { name: 'Ribollita', description: 'Sopa toscana contundente de pan duro, judías blancas y verduras. Cocinada y "re-hervida" al día siguiente.', tags: ['Toscana', 'invierno'] },
          { name: 'Arancini', description: 'Croquetas de arroz rellenas de ragù o mozzarella, fritas. Especialidad siciliana, imprescindibles en Palermo.', tags: ['Sicilia', 'street food'] },
        ],
      },
      {
        category: 'Postres y cafés',
        icon: '☕',
        items: [
          { name: 'Gelato', description: 'Helado italiano con menos grasa y más denso que el americano. Pistacchio (verde natural, no flúor) y nocciola son imprescindibles.', tags: ['dulce', 'verano'] },
          { name: 'Tiramisù', description: 'Capas de savoiardi empapados en café y mascarpone con cacao. Postre original de Treviso, Véneto.', tags: ['postre', 'clásico'] },
          { name: 'Espresso', description: 'Se toma de pie en el bar, en 30 segundos. Máximo 1€ en Roma (por ley). Pedir "un caffè" sin más especificaciones.', tags: ['café', 'ritual'] },
          { name: 'Cannoli', description: 'Tubo de masa frita relleno de ricotta endulzada con pepitas de chocolate. Clásico siciliano.', tags: ['Sicilia', 'dulce'] },
        ],
      },
    ],
  },

  // ── FRANCIA ───────────────────────────────────────────────────────────────
  'Francia': {
    categories: [
      {
        category: 'Platos clásicos',
        icon: '🥐',
        items: [
          { name: 'Croissant', description: 'El auténtico tiene capas hojaldradas de mantequilla y sabor ligeramente salado. El mejor en boulangeries antes de las 9h.', tags: ['desayuno', 'panadería'] },
          { name: 'Croque-monsieur', description: 'Sándwich tostado de jamón y gruyère con bechamel. Con huevo encima se llama croque-madame. En cualquier brasserie.', tags: ['almuerzo', 'clásico'] },
          { name: 'Steak frites', description: 'Filete con patatas fritas, el plato más pedido de Francia. El punto "saignant" (poco hecho) es el estándar local.', tags: ['clásico', 'bistró'] },
          { name: 'Bouillabaisse', description: 'Guiso de pescados y mariscos de Marsella con azafrán. Servida en dos tiempos: caldo primero, pescado después.', tags: ['Marsella', 'marisco'] },
          { name: 'Coq au vin', description: 'Pollo guisado lentamente en vino tinto con champiñones y panceta. Reconfortante plato de bistró invernal.', tags: ['tradicional', 'invierno'] },
          { name: 'Confit de canard', description: 'Muslo de pato confitado en su propia grasa a baja temperatura. Especialidad del Périgord, con patatas sarladaises.', tags: ['Périgord', 'tradicional'] },
        ],
      },
      {
        category: 'Pan y quesos',
        icon: '🧀',
        items: [
          { name: 'Baguette tradition', description: 'La "tradition" lleva solo harina, agua, sal y levadura — sin aditivos. Crujiente por fuera, alveolada por dentro.', tags: ['pan', 'básico'] },
          { name: 'Comté', description: 'Queso de montaña de la región del Jura, curado entre 4 y 36 meses. Afrutado y complejo. El más vendido de Francia.', tags: ['queso', 'Jura'] },
          { name: 'Brie de Meaux', description: 'El rey de los quesos blandos. Con corteza blanca florida y interior cremoso. Temperatura ambiente, nunca frío.', tags: ['queso', 'Île-de-France'] },
          { name: 'Roquefort', description: 'Queso azul de leche de oveja de Roquefort-sur-Soulzon. Intenso y salado. AOP protegida desde 1925.', tags: ['queso', 'azul'] },
        ],
      },
      {
        category: 'Pastelería',
        icon: '🍮',
        items: [
          { name: 'Macarons', description: 'Dos galletas de merengue de almendra unidas por ganache o crema. Ladurée y Pierre Hermé son los templos parisinos.', tags: ['París', 'dulce'] },
          { name: 'Tarte Tatin', description: 'Tarta de manzana invertida caramelizada. Creada por accidente en el hotel Tatin de Sologne en 1898.', tags: ['postre', 'clásico'] },
          { name: 'Crème brûlée', description: 'Natilla de vainilla con costra de azúcar quemada. Se rompe con la cuchara — ese sonido es parte del placer.', tags: ['postre', 'clásico'] },
          { name: 'Pain au chocolat', description: 'Hojaldre con una o dos barritas de chocolate negro. Debate nacional: ¿pain au chocolat o chocolatine (sur)?', tags: ['desayuno', 'panadería'] },
        ],
      },
    ],
  },

  // ── TAILANDIA ─────────────────────────────────────────────────────────────
  'Tailandia': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🍜',
        items: [
          { name: 'Pad Thai', description: 'Fideos de arroz salteados con gambas o pollo, huevo, brotes de soja y cacahuetes. El plato más conocido internacionalmente.', tags: ['popular', 'fideos'] },
          { name: 'Som Tam', description: 'Ensalada de papaya verde rallada con lima, chile, ajo y salsa de pescado. Picante, ácida y adictiva. Origen noreste.', tags: ['picante', 'ensalada'] },
          { name: 'Massaman Curry', description: 'Curry suave de influencia persa con leche de coco, patata, maní y especias. El menos picante de los currys tailandeses.', tags: ['curry', 'suave'] },
          { name: 'Green Curry', description: 'Curry verde con leche de coco, berenjenas, albahaca thai. Picante y aromático. Se sirve con arroz jazmín.', tags: ['curry', 'picante'] },
          { name: 'Tom Yum Goong', description: 'Sopa ácida y picante con gambas, limoncillo, galanga y hojas de lima kaffir. Icónica de la cocina tailandesa.', tags: ['sopa', 'picante'] },
          { name: 'Khao Pad', description: 'Arroz frito con huevo, verduras y carne o marisco. El plato del día tailandés, omnipresente y siempre correcto.', tags: ['arroz', 'popular'] },
        ],
      },
      {
        category: 'Street food',
        icon: '🛵',
        items: [
          { name: 'Mango Sticky Rice', description: 'Arroz glutinoso con leche de coco y mango fresco maduro. El postre estrella de la temporada de mangos (marzo-mayo).', tags: ['postre', 'dulce'] },
          { name: 'Satay', description: 'Brochetas de pollo o cerdo marinadas con cúrcuma, a la parrilla. Con salsa de cacahuete y encurtidos de pepino.', tags: ['parrilla', 'snack'] },
          { name: 'Pad Kra Pao', description: 'Salteado de carne picada con albahaca santa tailandesa y chile. Con huevo frito encima. Favorito local a todas horas.', tags: ['picante', 'popular'] },
          { name: 'Roti', description: 'Pan plano hojaldrado frito en plancha, con leche condensada, banana o huevo. Desayuno y snack nocturno.', tags: ['dulce', 'snack'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🥤',
        items: [
          { name: 'Thai Iced Tea', description: 'Té negro fuerte con leche condensada y evaporada sobre hielo. Naranja intenso, muy dulce. En cualquier puesto.', tags: ['bebida', 'dulce'] },
          { name: 'Coconut water', description: 'Agua de coco fresca directamente del coco, cortado al momento. Refrescante y con electrolitos naturales.', tags: ['bebida', 'natural'] },
          { name: 'Chang / Singha', description: 'Las dos cervezas nacionales. Chang es más suave, Singha más amarga. Siempre con mucho hielo en los locales.', tags: ['alcohol', 'cerveza'] },
        ],
      },
    ],
  },

  // ── VIETNAM ───────────────────────────────────────────────────────────────
  'Vietnam': {
    categories: [
      {
        category: 'Sopas',
        icon: '🍲',
        items: [
          { name: 'Pho', description: 'Sopa de fideos de arroz con caldo de buey cocido 12h con especias (anís, clavo, canela). Desayuno nacional vietnamita.', tags: ['desayuno', 'popular'] },
          { name: 'Bun Bo Hue', description: 'Sopa de fideos redondos con buey y cerdo, picante, del centro de Vietnam. Más intensa que el pho del norte.', tags: ['Hue', 'picante'] },
          { name: 'Mi Quang', description: 'Fideos amarillos con menos caldo, gambas, cerdo, maní y arroz frito. Especialidad de Da Nang y alrededores.', tags: ['Da Nang', 'fideos'] },
        ],
      },
      {
        category: 'Banh (pan y bocadillos)',
        icon: '🥖',
        items: [
          { name: 'Banh Mi', description: 'Baguette vietnamita rellena con pâté, charcutería, cilantro, zanahoria encurtida y chile. Legado de la colonización francesa.', tags: ['street food', 'popular'] },
          { name: 'Banh Xeo', description: 'Crepe crujiente de harina de arroz con cúrcuma, rellena de gambas, cerdo y brotes. Se envuelve en lechuga y hierbas.', tags: ['sur', 'crujiente'] },
          { name: 'Banh Cuon', description: 'Láminas de arroz al vapor rellenas de cerdo y setas. Con salsa de pescado y camarones secos. Desayuno del norte.', tags: ['norte', 'desayuno'] },
        ],
      },
      {
        category: 'Platos principales',
        icon: '🫕',
        items: [
          { name: 'Goi Cuon', description: 'Rollitos frescos de papel de arroz con gambas, cerdo, fideos y hierbas aromáticas. Sin freír. Con salsa hoisin.', tags: ['fresco', 'sano'] },
          { name: 'Com Tam', description: 'Arroz roto con costilla de cerdo a la parrilla, huevo y salsa de pescado. Desayuno y almuerzo en Saigón.', tags: ['Ho Chi Minh', 'almuerzo'] },
          { name: 'Cao Lau', description: 'Fideos gruesos con cerdo y hierbas solo en Hoi An, hechos con agua del pozo de Cham. Plato 100% local.', tags: ['Hoi An', 'único'] },
        ],
      },
    ],
  },

  // ── MARRUECOS ─────────────────────────────────────────────────────────────
  'Marruecos': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🫕',
        items: [
          { name: 'Tagine', description: 'Guiso de carne (cordero, pollo, buey) con verduras y especias cocido lentamente en recipiente cónico de barro. El plato nacional.', tags: ['tradicional', 'popular'] },
          { name: 'Cuscús', description: 'Sémola de trigo al vapor con verduras y carne, servida los viernes. El cuscús del viernes familiar es ritual nacional.', tags: ['viernes', 'tradicional'] },
          { name: 'Pastilla', description: 'Pastel hojaldrado de pichón o pollo con almendras, canela y azúcar glas. Salado y dulce a la vez. Típico de Fez.', tags: ['Fez', 'especial'] },
          { name: 'Harira', description: 'Sopa espesa de tomate, lentejas, garbanzos, cilantro y limón. Plato del Ramadán para romper el ayuno (ftour).', tags: ['sopa', 'Ramadán'] },
          { name: 'Mechoui', description: 'Cordero asado entero a la brasa, deshuesado a mano. Se sirve en grandes celebraciones y en algunos restaurantes de Marrakech.', tags: ['especial', 'cordero'] },
        ],
      },
      {
        category: 'Street food y mezze',
        icon: '🥙',
        items: [
          { name: 'Msemen', description: 'Pan plano hojaldrado a la plancha, ligeramente hojaldrado. Con miel y mantequilla en el desayuno, o relleno salado.', tags: ['desayuno', 'pan'] },
          { name: 'Briwat', description: 'Triángulos de hojaldre rellenos de carne especiada o almendra y miel. Fritos o al horno. En bodas y fiestas.', tags: ['snack', 'festivo'] },
          { name: 'Caracoles (babouche)', description: 'Caracoles cocidos en caldo de especias (comino, tomillo, anís). En cualquier puesto callejero de Marrakech por 5 DH.', tags: ['street food', 'Marrakech'] },
          { name: 'Kefta', description: 'Brochetas de carne picada especiada (comino, cilantro, paprika) a la parrilla. En la plaza Jemaa el-Fna por la noche.', tags: ['Marrakech', 'parrilla'] },
        ],
      },
      {
        category: 'Bebidas y postres',
        icon: '🍵',
        items: [
          { name: 'Atay (té de menta)', description: 'Té verde con menta fresca y mucho azúcar, servido desde altura para crear espuma. Hospitalidad básica marroquí.', tags: ['bebida', 'tradicional'] },
          { name: 'Chebakia', description: 'Rosquillas de sésamo y anís fritas, bañadas en miel y cubiertas de sésamo. Especialmente en Ramadán.', tags: ['dulce', 'Ramadán'] },
          { name: 'Argan oil products', description: 'Amlou: pasta de almendras, aceite de argán y miel. Para untar en pan en el desayuno. Típico del Souss.', tags: ['Souss', 'desayuno'] },
        ],
      },
    ],
  },

  // ── TURQUÍA ───────────────────────────────────────────────────────────────
  'Turquía': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🥙',
        items: [
          { name: 'Döner Kebab', description: 'Carne (cordero, pollo o mixto) en asador vertical, servida en pan, lavash o plato con arroz y ensalada.', tags: ['popular', 'street food'] },
          { name: 'İskender Kebab', description: 'Döner sobre pan de pita, con salsa de tomate, mantequilla derretida y yogur. Especialidad de Bursa.', tags: ['Bursa', 'especial'] },
          { name: 'Manti', description: 'Mini raviolis de carne con ajo y yogur, mantequilla de tomate y especias. Originario de Anatolia central.', tags: ['pasta', 'tradicional'] },
          { name: 'Lahmacun', description: 'Pizza turca: masa fina con carne picada especiada. Se enrolla con perejil, cebolla y limón. Callejero y barato.', tags: ['street food', 'popular'] },
          { name: 'Pide', description: 'Pan de barca relleno de carne, queso o verduras. El equivalente turco a la pizza. Mejor en restaurantes tradicionales.', tags: ['pan', 'popular'] },
        ],
      },
      {
        category: 'Mezze y entrantes',
        icon: '🧆',
        items: [
          { name: 'Hummus', description: 'Crema de garbanzos con tahini, aceite de oliva y pimentón. En Turquía más texturoso que en Oriente Medio.', tags: ['mezze', 'vegetariano'] },
          { name: 'Ezme', description: 'Salsa picante de tomate, pimiento y cebolla finamente picados. Acompañamiento inevitable de cualquier comida.', tags: ['mezze', 'picante'] },
          { name: 'Sigara Böreği', description: 'Cilindros de masa filo rellenos de queso feta y eneldo, fritos. Crujientes y adictivos como entrante.', tags: ['mezze', 'frito'] },
          { name: 'Mercimek Çorbası', description: 'Sopa de lentejas rojas cremosa con comino y menta. Abundante en todos los restaurantes, perfecta en invierno.', tags: ['sopa', 'vegetariano'] },
        ],
      },
      {
        category: 'Postres y bebidas',
        icon: '🍯',
        items: [
          { name: 'Baklava', description: 'Hojaldre con nueces o pistachos y miel/almíbar. La referencia es Gaziantep, ciudad en el sureste del país.', tags: ['dulce', 'Gaziantep'] },
          { name: 'Simit', description: 'Rosquilla de sésamo crujiente, el desayuno callejero de Estambul. Con queso blanco y tomate para el auténtico kahvaltı.', tags: ['desayuno', 'Istanbul', 'street food'] },
          { name: 'Çay (té turco)', description: 'Té negro muy fuerte en vasito de tulipán, con azúcar. Se toma todo el día. Ofrecerlo es gesto de hospitalidad.', tags: ['bebida', 'ritual'] },
          { name: 'Ayran', description: 'Yogur batido con agua y sal, ligeramente espumoso. La bebida refrescante por excelencia, perfecta con kebab.', tags: ['bebida', 'yogur'] },
        ],
      },
    ],
  },

  // ── GRECIA ────────────────────────────────────────────────────────────────
  'Grecia': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🫒',
        items: [
          { name: 'Moussaka', description: 'Capas de berenjena, carne picada especiada y bechamel gratinada. El plato más internacional de la cocina griega.', tags: ['clásico', 'popular'] },
          { name: 'Souvlaki', description: 'Brochetas de cerdo a la parrilla en pita con tomate, cebolla, tzatziki y patatas fritas. El fast food griego por excelencia.', tags: ['street food', 'popular'] },
          { name: 'Spanakopita', description: 'Hojaldre de espinacas y queso feta. En triángulo (snack) o en bandeja (plato). Perfecto para picnic en las islas.', tags: ['vegetariano', 'snack'] },
          { name: 'Kleftiko', description: 'Cordero marinado cocido lentamente en papel de horno o barro. Tierno, aromático, deshuesado solo. Especialidad local.', tags: ['cordero', 'asado'] },
        ],
      },
      {
        category: 'Mezze y entrantes',
        icon: '🥗',
        items: [
          { name: 'Tzatziki', description: 'Yogur griego con pepino rallado, ajo, aceite de oliva y eneldo. Acompañamiento de todo, especialmente carnes a la parrilla.', tags: ['mezze', 'yogur'] },
          { name: 'Taramasalata', description: 'Crema de huevas de pescado (bacalao o carpa) con pan empapado, aceite y limón. Rosa suave, sabor intenso y salado.', tags: ['mezze', 'marisco'] },
          { name: 'Saganaki', description: 'Queso duro (graviera o kefalotiri) frito en sartén hasta dorarse. Se flambea con ouzo en algunos restaurantes.', tags: ['queso', 'frito'] },
          { name: 'Horiatiki (ensalada griega)', description: 'Tomate, pepino, aceitunas Kalamata, pimiento verde y feta en bloque, con aceite de oliva. Sin lechuga, como manda la tradición.', tags: ['ensalada', 'clásico'] },
        ],
      },
      {
        category: 'Postres y bebidas',
        icon: '🍋',
        items: [
          { name: 'Baklava griego', description: 'Similar al turco pero con miel griega (timo) en lugar de almíbar. Con nueces o pistachos. En cualquier zacharoplastio.', tags: ['dulce', 'miel'] },
          { name: 'Loukoumades', description: 'Buñuelos de masa frita bañados en miel y canela. El postre callejero de las fiestas. En Atenas, cerca del mercado.', tags: ['dulce', 'street food'] },
          { name: 'Ouzo', description: 'Licor anisado que se vuelve blanco al añadir agua o hielo. Se toma con mezze. El aperitivo nacional griego.', tags: ['alcohol', 'aperitivo'] },
          { name: 'Frappé griego', description: 'Café soluble batido con hielo hasta hacer espuma. Inventado en Salónica en 1957. El café frío original.', tags: ['café', 'frío'] },
        ],
      },
    ],
  },

  // ── MEXICO ────────────────────────────────────────────────────────────────
  'México': {
    categories: [
      {
        category: 'Tacos y antojitos',
        icon: '🌮',
        items: [
          { name: 'Tacos al pastor', description: 'Carne de cerdo marinada en achiote, cocida en trompo vertical con piña. Con cilantro y cebolla. Origen libanés adaptado.', tags: ['CDMX', 'popular'] },
          { name: 'Tacos de carnitas', description: 'Cerdo confitado en manteca, desmenuzado. Con guacamole, salsa verde y tortilla de maíz. Michoacán los hace mejor.', tags: ['Michoacán', 'popular'] },
          { name: 'Tamales', description: 'Masa de maíz rellena de mole, rajas o puerco, envuelta en hoja de maíz o plátano al vapor. Desayuno y festividades.', tags: ['desayuno', 'tradicional'] },
          { name: 'Enchiladas', description: 'Tortillas enrolladas rellenas de pollo o queso, bañadas en salsa roja o mole, con crema y queso cotija.', tags: ['clásico', 'popular'] },
          { name: 'Chiles en nogada', description: 'Chile poblano relleno de picadillo de carne y frutas, con salsa de nuez, granada y perejil. Temporada agosto-septiembre.', tags: ['Puebla', 'temporada'] },
        ],
      },
      {
        category: 'Sopas y platos fuertes',
        icon: '🍲',
        items: [
          { name: 'Pozole', description: 'Caldo de maíz cacahuazintle con cerdo o pollo, col, rábano, orégano y chile. En blanco, rojo o verde según región.', tags: ['sopa', 'tradicional'] },
          { name: 'Mole negro', description: 'Salsa oscura de 30+ ingredientes (chiles, chocolate, especias) de Oaxaca. Se sirve sobre pavo o pollo. Obra maestra culinaria.', tags: ['Oaxaca', 'especial'] },
          { name: 'Cochinita pibil', description: 'Cerdo marinado en achiote cocido en hoyo bajo tierra envuelto en hoja de plátano. Especialidad yucateca, con cebolla encurtida.', tags: ['Yucatán', 'cerdo'] },
        ],
      },
      {
        category: 'Street food y bebidas',
        icon: '🥤',
        items: [
          { name: 'Elotes', description: 'Maíz en mazorca hervido o asado, con mayonesa, chile, limón y queso cotija. En cualquier esquina de ciudad mexicana.', tags: ['street food', 'popular'] },
          { name: 'Guacamole', description: 'Aguacate machacado con limón, cilantro, cebolla y chile. Base de la cocina mexicana. Siempre fresco, nunca industrial.', tags: ['básico', 'vegetariano'] },
          { name: 'Agua de horchata', description: 'Bebida de arroz con canela, vainilla y azúcar. Fresca y dulce. Con tacos es combinación perfecta.', tags: ['bebida', 'sin alcohol'] },
          { name: 'Mezcal', description: 'Destilado de agave diferente al tequila — más complejo y ahumado. Se toma solo, en vasito de barro, con sal de gusano.', tags: ['alcohol', 'Oaxaca'] },
        ],
      },
    ],
  },

  // ── INDIA ─────────────────────────────────────────────────────────────────
  'India': {
    categories: [
      {
        category: 'Currys y platos principales',
        icon: '🍛',
        items: [
          { name: 'Butter Chicken (Murgh Makhani)', description: 'Pollo marinado en yogur y especias, en salsa cremosa de tomate y mantequilla. El curry más suave y popular internacionalmente.', tags: ['Delhi', 'popular', 'suave'] },
          { name: 'Biryani', description: 'Arroz basmati cocido con carne (cordero, pollo, camarones) y especias en capas. Hyderabad y Lucknow tienen las versiones más famosas.', tags: ['arroz', 'popular'] },
          { name: 'Dal Makhani', description: 'Lentejas negras cocinadas a fuego lento con mantequilla y nata. Plato punjabi reconfortante, mejor después de reposar un día.', tags: ['Punjab', 'vegetariano'] },
          { name: 'Palak Paneer', description: 'Queso fresco indio en salsa cremosa de espinacas. Plato vegetariano clásico del norte, suave y nutritivo.', tags: ['norte', 'vegetariano'] },
          { name: 'Rogan Josh', description: 'Curry de cordero intenso y aromático de Cachemira con chile kashmiri y especias enteras. Rojo intenso, fragante.', tags: ['Cachemira', 'cordero'] },
        ],
      },
      {
        category: 'Pan y acompañamientos',
        icon: '🫓',
        items: [
          { name: 'Naan', description: 'Pan plano de horno tandoor. Butter naan, garlic naan o peshwari (relleno dulce). Para mojar en cualquier curry.', tags: ['pan', 'básico'] },
          { name: 'Paratha', description: 'Pan integral hojaldrado a la plancha, relleno (aloo = patata, gobi = coliflor). Desayuno punjabi con yogur y encurtidos.', tags: ['desayuno', 'Punjab'] },
          { name: 'Dosa', description: 'Crepe crujiente de arroz y lentejas fermentados. Rellena de masala de patata (masala dosa). Especialidad del sur de India.', tags: ['sur', 'vegetariano'] },
          { name: 'Samosa', description: 'Triángulo de masa frita relleno de patata especiada y guisantes. El snack más ubicuo de India, con chutney verde.', tags: ['snack', 'street food'] },
        ],
      },
      {
        category: 'Postres y bebidas',
        icon: '🥭',
        items: [
          { name: 'Lassi de mango', description: 'Batido de yogur con mango, especialmente el Alphonso. En Amritsar el lassi es famoso mundialmente, servido en vasitos de barro.', tags: ['bebida', 'dulce'] },
          { name: 'Chai Masala', description: 'Té negro con leche, azúcar y especias (cardamomo, jengibre, canela). Se prepara hirviendo todo junto. Ritual diario indio.', tags: ['bebida', 'té'] },
          { name: 'Gulab Jamun', description: 'Bolas de leche en polvo fritas en almíbar de rosas. Empalagoso y delicioso. En todas las celebraciones y postres de restaurante.', tags: ['postre', 'dulce'] },
        ],
      },
    ],
  },

  // ── PORTUGAL ──────────────────────────────────────────────────────────────
  'Portugal': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🐟',
        items: [
          { name: 'Bacalhau à Brás', description: 'Bacalao desmigado salteado con cebolla, patatas paja, huevo revuelto y aceitunas. Una de las 365 recetas de bacalao.', tags: ['bacalao', 'Lisboa', 'clásico'] },
          { name: 'Francesinha', description: 'Sándwich de pan con varios embutidos y queso fundido, bañado en salsa picante de tomate y cerveza. Especialidad de Porto.', tags: ['Porto', 'contundente'] },
          { name: 'Caldo Verde', description: 'Sopa de col galega con patata y chorizo. El plato nacional no oficial. Con broa de milho (pan de maíz).', tags: ['sopa', 'tradicional'] },
          { name: 'Bifanas', description: 'Bocadillo de lomo de cerdo marinado en vino y ajo. El street food lisboeta por excelencia, en A Cevicheria o cualquier tasca.', tags: ['Lisboa', 'street food'] },
          { name: 'Polvo à Lagareiro', description: 'Pulpo asado con aceite de oliva, ajos y patatas a murro (aplastadas). En la Beira Litoral y Alentejo especialmente.', tags: ['pulpo', 'clásico'] },
        ],
      },
      {
        category: 'Pasteles y snacks',
        icon: '🥐',
        items: [
          { name: 'Pastel de Nata', description: 'Tartaleta de crema horneada con canela y azúcar glas. Los originales en Pastéis de Belém (Lisboa) desde 1837, receta secreta.', tags: ['Lisboa', 'icónico'] },
          { name: 'Prego', description: 'Bocadillo de filete de ternera con mostaza y ajo. En algunos sitios con huevo frito. Rápido y contundente.', tags: ['bocadillo', 'popular'] },
          { name: 'Rissóis', description: 'Empanadillas semicirculares fritas rellenas de gambas en bechamel. En cualquier pastelería tradicional portuguesa.', tags: ['snack', 'pastelería'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🍷',
        items: [
          { name: 'Vinho Verde', description: 'Vino blanco ligeramente efervescente y ácido del Minho. Bajo en alcohol (9-11°). Perfecto para mariscos y días calurosos.', tags: ['vino', 'blanco'] },
          { name: 'Ginjinha', description: 'Licor de guindas. En Lisboa se toma en el bar A Ginjinha, en vasito o en vasito de chocolate comestible. 1€.', tags: ['Lisboa', 'licor'] },
          { name: 'Galão', description: 'Café con mucha leche espumada, servido en vaso alto. El equivalente portugués al latte. Desayuno de tasca.', tags: ['café', 'desayuno'] },
        ],
      },
    ],
  },

  // ── COREA DEL SUR ─────────────────────────────────────────────────────────
  'Corea del Sur': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🍚',
        items: [
          { name: 'Bibimbap', description: 'Cuenco de arroz con verduras salteadas, proteína (ternera, tofu), huevo frito y gochujang. Mezclar todo antes de comer.', tags: ['popular', 'colorido'] },
          { name: 'Bulgogi', description: 'Ternera marinada en salsa de soja, azúcar, sésamo y ajo, a la parrilla o salteada. El plato más reconocido internacionalmente.', tags: ['ternera', 'popular'] },
          { name: 'Samgyeopsal', description: 'Panceta de cerdo a la parrilla en la mesa, envuelta en hoja de lechuga con ajo, pasta gochujang y kimchi.', tags: ['parrilla', 'experiencia'] },
          { name: 'Sundubu Jjigae', description: 'Estofado picante de tofu sedoso con mariscos, cerdo o verduras. Servido hirviendo en cazuela de barro, con huevo crudo.', tags: ['estofado', 'picante'] },
          { name: 'Japchae', description: 'Fideos de boniato salteados con verduras y ternera, con salsa de soja y aceite de sésamo. Plato festivo suave.', tags: ['fideos', 'festivo'] },
        ],
      },
      {
        category: 'Street food coreano',
        icon: '🦑',
        items: [
          { name: 'Tteokbokki', description: 'Pasteles de arroz cilíndricos en salsa picante de gochujang. El street food más popular de Corea, en cualquier pojangmacha.', tags: ['picante', 'street food'] },
          { name: 'Kimbap', description: 'Rollos de arroz con verduras y proteína envueltos en alga. Sin pescado crudo — diferente al sushi japonés. Para llevar.', tags: ['picnic', 'snack'] },
          { name: 'Mandu', description: 'Empanadillas coreanas de cerdo y verduras, fritas, al vapor o en sopa. Con kimchi son especialmente buenas.', tags: ['empanadillas', 'snack'] },
          { name: 'Hotteok', description: 'Tortita dulce rellena de azúcar moreno, canela y nueces. Snack callejero de invierno, especialmente en Seúl.', tags: ['dulce', 'invierno'] },
        ],
      },
      {
        category: 'Kimchi y banchan',
        icon: '🥬',
        items: [
          { name: 'Kimchi', description: 'Col fermentada con gochugaru, ajo y jengibre. Se sirve gratis como acompañamiento en cualquier restaurante coreano.', tags: ['fermentado', 'gratis'] },
          { name: 'Banchan', description: 'Sistema de pequeños platos de acompañamiento que se sirven con cada comida: espinacas, brotes, patata, tofu...', tags: ['acompañamiento', 'gratis'] },
          { name: 'Soju', description: 'Destilado suave de arroz o boniato, 16-25°. La bebida alcohólica más vendida del mundo. Con cerveza en "somaek".', tags: ['alcohol', 'popular'] },
        ],
      },
    ],
  },


  // ── ESPAÑA ────────────────────────────────────────────────────────────────
  'España': {
    categories: [
      {
        category: 'Tapas y raciones',
        icon: '🍷',
        items: [
          { name: 'Jamón ibérico', description: 'Jamón curado de cerdo ibérico, el mejor de bellota. La pierna entera en tablas de madera es el símbolo de la gastronomía española.', tags: ['icónico', 'embutido'] },
          { name: 'Patatas bravas', description: 'Patatas fritas con salsa brava picante y/o alioli. Cada bar tiene su receta secreta. Las mejores en Madrid en Docamar o Las Bravas.', tags: ['Madrid', 'tapa'] },
          { name: 'Croquetas', description: 'Croquetas cremosas de jamón, bacalao o pollo. La bechamel perfecta es casi líquida por dentro y crujiente por fuera.', tags: ['tapa', 'popular'] },
          { name: 'Pan con tomate (Pa amb tomàquet)', description: 'Pan tostado frotado con tomate maduro y aceite de oliva. Base de la gastronomía catalana, lo acompaña todo.', tags: ['Cataluña', 'básico'] },
          { name: 'Pimientos de Padrón', description: 'Pimientos pequeños fritos en aceite y sal. La mayoría no pica pero alguno sí — la ruleta gallega. De Padrón, Galicia.', tags: ['Galicia', 'tapa'] },
          { name: 'Tortilla española', description: 'Tortilla de patata con o sin cebolla — debate nacional eterno. Jugosa por dentro, dorada por fuera. Desayuno, almuerzo o cena.', tags: ['icónico', 'popular'] },
        ],
      },
      {
        category: 'Platos principales',
        icon: '🥘',
        items: [
          { name: 'Paella valenciana', description: 'Arroz con pollo, conejo, judías verdes y garrofó. La auténtica es de Valencia, cocinada en paellera sobre fuego de leña. Sin marisco.', tags: ['Valencia', 'arroz'] },
          { name: 'Cocido madrileño', description: 'Guiso de garbanzos con verduras, chorizo, morcilla y carne. Se sirve en tres vuelcos: caldo, garbanzos y carnes. Típico en invierno.', tags: ['Madrid', 'invierno'] },
          { name: 'Gazpacho', description: 'Sopa fría de tomate, pepino, pimiento y aceite de oliva. Refrescante en verano, omnipresente en Andalucía. También salmorejo (más denso).', tags: ['Andalucía', 'verano'] },
          { name: 'Pulpo a la gallega (Pulpo á feira)', description: 'Pulpo cocido sobre patatas, con aceite de oliva, pimentón dulce y sal gruesa. Especialidad de Galicia, en ferias y pulperías.', tags: ['Galicia', 'pulpo'] },
          { name: 'Pintxos', description: 'Tapas sobre pan del País Vasco. Desde anchoas con guindilla hasta elaboraciones con foie o bacalao. San Sebastián tiene los mejores del mundo.', tags: ['País Vasco', 'San Sebastián'] },
          { name: 'Fabada asturiana', description: 'Guiso de fabes (alubias blancas grandes) con compango: chorizo, morcilla y tocino. El plato más contundente de la cocina asturiana.', tags: ['Asturias', 'invierno'] },
        ],
      },
      {
        category: 'Postres y bebidas',
        icon: '🍮',
        items: [
          { name: 'Churros con chocolate', description: 'Masa frita en forma de churro con chocolate espeso para mojar. En chocolatería San Ginés (Madrid, abierta 24h) o en cualquier feria.', tags: ['Madrid', 'desayuno'] },
          { name: 'Crema catalana', description: 'Natilla de yema de huevo con corteza de naranja, quemada con caramelo. La crème brûlée original, de Cataluña. En San José (19 de marzo).', tags: ['Cataluña', 'postre'] },
          { name: 'Sangría / Tinto de verano', description: 'Sangría: vino tinto con frutas y gaseosa. Tinto de verano: vino con Casera o Sprite — más ligero y más bebido por los locales.', tags: ['bebida', 'verano'] },
          { name: 'Sidra asturiana', description: 'Sidra natural que se escancia desde altura para oxigenarla. En Asturias hay sidrería en cada pueblo. La temporada es septiembre-octubre.', tags: ['Asturias', 'bebida'] },
        ],
      },
    ],
  },

  // ── PERÚ ──────────────────────────────────────────────────────────────────
  'Perú': {
    categories: [
      {
        category: 'Cevicherías y mar',
        icon: '🐟',
        items: [
          { name: 'Ceviche peruano', description: 'Pescado crudo marinado en leche de tigre (jugo de limón, ají, cebolla). Se sirve con choclo, camote y cancha. El plato nacional.', tags: ['icónico', 'fresco'] },
          { name: 'Tiradito', description: 'Similar al ceviche pero sin cebolla y el pescado cortado en láminas finas al estilo sashimi. Influencia japonesa (nikkei).', tags: ['Lima', 'nikkei'] },
          { name: 'Leche de tigre', description: 'El jugo que sobra del ceviche — limón, ají, cebolla, cilantro. Se bebe como chupito o se sirve en vaso. Dicen que cura el resacón.', tags: ['Lima', 'shots'] },
          { name: 'Causa limeña', description: 'Pastel frío de papa amarilla con ají amarillo, relleno de atún o pollo con mayonesa. Un color amarillo intenso y sabor suave.', tags: ['Lima', 'entrada'] },
        ],
      },
      {
        category: 'Platos de la sierra',
        icon: '🥔',
        items: [
          { name: 'Lomo saltado', description: 'Salteado de tiras de carne con tomate, cebolla roja y soja, servido con papas fritas y arroz. Fusión chifa (chino-peruana) definitiva.', tags: ['fusión', 'popular'] },
          { name: 'Ají de gallina', description: 'Pollo desmenuzado en salsa cremosa de ají amarillo con pan, nueces y queso. Sobre arroz y con papa amarilla. Reconfortante.', tags: ['clásico', 'Lima'] },
          { name: 'Anticuchos', description: 'Brochetas de corazón de res marinadas en ají panca y vinagre, a la parrilla. Street food nocturno con papa y choclo. Anticucheras en cada esquina.', tags: ['street food', 'nocturno'] },
          { name: 'Pachamanca', description: 'Carne, papa, choclo y habas cocidos bajo tierra con piedras calientes. Ritual andino, normalmente en celebraciones familiares en la sierra.', tags: ['sierra', 'ritual'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🍹',
        items: [
          { name: 'Pisco sour', description: 'Cóctel de pisco (aguardiente de uva), limón, clara de huevo y amargo de angostura. El cóctel nacional peruano. Mejor en bar Huaringas (Lima).', tags: ['cóctel', 'nacional'] },
          { name: 'Chicha morada', description: 'Bebida de maíz morado con frutas, canela y clavo. No alcohólica, refrescante, de color morado intenso. En todos los menús del día.', tags: ['sin alcohol', 'tradicional'] },
          { name: 'Inca Kola', description: 'Refresco amarillo de sabor dulce floral (hierba luisa). Más popular que Coca-Cola en Perú. Un sabor único que o amas o no entiendes.', tags: ['bebida', 'local'] },
        ],
      },
    ],
  },

  // ── ARGENTINA ─────────────────────────────────────────────────────────────
  'Argentina': {
    categories: [
      {
        category: 'Asado y carnes',
        icon: '🥩',
        items: [
          { name: 'Asado argentino', description: 'Ritual de parrilla con costillas, vacío, chorizo y morcilla cocidos lentamente a las brasas. El asado es cultura, no solo comida. Los domingos son sagrados.', tags: ['ritual', 'icónico'] },
          { name: 'Empanadas', description: 'Masa rellena de carne picada especiada, cocida al horno o frita. Cada provincia tiene su versión: salteñas, cordobesas, tucumanas. Las mejores de carne cortada a cuchillo.', tags: ['popular', 'snack'] },
          { name: 'Choripán', description: 'Chorizo a la parrilla en pan, con chimichurri y salsa criolla. El street food argentino definitivo. En las puertas de los estadios de fútbol.', tags: ['street food', 'fútbol'] },
          { name: 'Milanesa', description: 'Filete de carne empanado y frito. En napolitana (con salsa de tomate y queso), en sándwich (milanesa completa) o con papas fritas. Omnipresente.', tags: ['popular', 'clásico'] },
        ],
      },
      {
        category: 'Dulces y panaderías',
        icon: '🥐',
        items: [
          { name: 'Dulce de leche', description: 'Caramelo cremoso de leche concentrada y azúcar. En todo: medialunas, alfajores, facturas. Los argentinos lo ponen en absolutamente todo.', tags: ['dulce', 'icónico'] },
          { name: 'Medialunas', description: 'Croissant argentino más pequeño, tierno y dulce (con almíbar). Desayuno de panadería con café con leche. Las mejores en panaderías de barrio en Buenos Aires.', tags: ['desayuno', 'Buenos Aires'] },
          { name: 'Alfajores', description: 'Dos galletas de maicena unidas con dulce de leche, bañadas en chocolate o azúcar glas. Havanna es la marca nacional de referencia.', tags: ['dulce', 'regalo'] },
          { name: 'Facturas', description: 'Bollería variada de las panaderías argentinas: cuernitos, vigilantes, cañoncitos. Para el desayuno o la merienda con mate.', tags: ['desayuno', 'panadería'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🧉',
        items: [
          { name: 'Mate', description: 'Infusión de yerba mate servida en calabaza con bombilla de metal. No es solo una bebida, es una forma de relacionarse. Se comparte en ronda.', tags: ['ritual', 'icónico'] },
          { name: 'Vino Malbec', description: 'Uva francesa que encontró su casa en Mendoza a 900m de altitud. Cuerpo intenso, taninos suaves, notas a fruta roja. El vino argentino por excelencia.', tags: ['Mendoza', 'vino'] },
          { name: 'Fernet con Coca', description: 'Fernet Branca con Coca-Cola en vaso con mucho hielo. Considerado casi una bebida nacional, especialmente en Córdoba. Sabor amargo e intenso.', tags: ['Córdoba', 'alcohol'] },
        ],
      },
    ],
  },

  // ── CHINA ─────────────────────────────────────────────────────────────────
  'China': {
    categories: [
      {
        category: 'Dim Sum y dumplings',
        icon: '🥟',
        items: [
          { name: 'Xiaolongbao (sopa en bolsa)', description: 'Dim sum relleno de carne de cerdo y caldo que explota en la boca. Originarios de Shanghai. Técnica: morder la punta, aspirar el caldo, comer.', tags: ['Shanghai', 'dim sum'] },
          { name: 'Jiaozi', description: 'Empanadillas cocidas o al vapor rellenas de cerdo y col. Se comen en Año Nuevo Chino por tradición. Con vinagre de arroz y salsa de soja.', tags: ['tradicional', 'norte'] },
          { name: 'Baozi', description: 'Bollos esponjosos al vapor rellenos de cerdo (char siu), verduras o pasta de judías rojas. Desayuno callejero omnipresente en toda China.', tags: ['desayuno', 'street food'] },
          { name: 'Har Gow', description: 'Dim sum de gambas en masa translúcida y fina al vapor. El más delicado de todos los dim sum. Medida del buen cocinero en los restaurantes cantoneses.', tags: ['cantonés', 'dim sum'] },
        ],
      },
      {
        category: 'Platos regionales',
        icon: '🌶️',
        items: [
          { name: 'Pato de Pekín', description: 'Pato asado con piel lacada crujiente, servido con tortitas, pepino, cebolleta y salsa hoisin. El plato más icónico de Beijing. En Quanjude o Da Dong.', tags: ['Beijing', 'icónico'] },
          { name: 'Mapo Tofu', description: 'Tofu sedoso en salsa picante de pasta de judías fermentadas y carne picada con pimienta de Sichuan (provoca entumecimiento). Ardiente y adictivo.', tags: ['Sichuan', 'picante'] },
          { name: 'Hot Pot de Sichuan', description: 'Caldo hirviendo muy picante donde se cocinan carnes, verduras y tofu. Experiencia social imprescindible. El caldo de Chongqing es el más intenso.', tags: ['Sichuan', 'experiencia'] },
          { name: 'Char Siu (cerdo a la barbacoa)', description: 'Lomo de cerdo marinado en salsa dulce y roja, asado hasta caramelizarse. Base de muchos dim sum. Sobre arroz o en baozi.', tags: ['cantonés', 'popular'] },
        ],
      },
      {
        category: 'Street food y bebidas',
        icon: '🧋',
        items: [
          { name: 'Jianbing (crepe de la mañana)', description: 'Crepe de harina de mijo con huevo, salsa hoisin, cilantro y cracker frito. El desayuno callejero más popular del norte de China. Menos de 2€.', tags: ['desayuno', 'street food'] },
          { name: 'Bubble Tea (Boba)', description: 'Té con leche y perlas de tapioca. Originario de Taiwan pero omnipresente en toda China. Infinitas variantes de té, leche y toppings.', tags: ['bebida', 'popular'] },
          { name: 'Baijiu', description: 'Licor de sorgo, entre 40-60° de alcohol. El alcohol más consumido del mundo. Sabor muy intenso, se bebe en brindis en banquetes. Moutai es la marca de lujo.', tags: ['alcohol', 'banquete'] },
        ],
      },
    ],
  },

  // ── INDONESIA ─────────────────────────────────────────────────────────────
  'Indonesia': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🍚',
        items: [
          { name: 'Nasi Goreng', description: 'Arroz frito con huevo, kecap manis (salsa de soja dulce), gambas o pollo. El plato nacional de Indonesia, disponible a cualquier hora del día.', tags: ['nacional', 'popular'] },
          { name: 'Rendang', description: 'Carne de res cocida horas en leche de coco y especias hasta absorber todo el líquido. Seco, intenso, picante. Originario de Sumatra occidental (Minang).', tags: ['Sumatra', 'icónico'] },
          { name: 'Gado-Gado', description: 'Ensalada de verduras y tofu hervidos con salsa de cacahuete cremosa. Vegetariano, nutritivo y muy popular como almuerzo en Java.', tags: ['Java', 'vegetariano'] },
          { name: 'Satay (Sate)', description: 'Brochetas de carne o pollo marinadas en salsa de cacahuete, a la parrilla sobre carbón. Con lontong (arroz comprimido) y salsa de soja dulce.', tags: ['parrilla', 'street food'] },
          { name: 'Mie Goreng', description: 'Fideos fritos con huevo, verduras y salsa kecap, similares al Nasi Goreng pero con fideos. Indomie (versión instantánea) es el producto más vendido del país.', tags: ['popular', 'fideos'] },
        ],
      },
      {
        category: 'Bali especial',
        icon: '🌺',
        items: [
          { name: 'Babi Guling (lechón de Bali)', description: 'Lechón entero asado con especias balinesas: cúrcuma, jengibre, galanga. Plato ceremonial que hoy se sirve en warungs. El más famoso en Ibu Oka, Ubud.', tags: ['Bali', 'Ubud', 'especial'] },
          { name: 'Bebek Betutu', description: 'Pato envuelto en hojas de plátano con pasta de especias (betutu) y cocinado horas. Plato ritual balinés de preparación lenta y aroma intenso.', tags: ['Bali', 'ritual'] },
          { name: 'Nasi Campur', description: 'Arroz con múltiples acompañamientos pequeños: sate, tempeh, verduras, salado y picante. El plato del día balinés, diferente en cada warung.', tags: ['Bali', 'popular'] },
        ],
      },
      {
        category: 'Bebidas y snacks',
        icon: '🥥',
        items: [
          { name: 'Kopi Luwak', description: 'Café de los granos "procesados" por la civeta de palma. El café más caro del mundo. En Bali hay granjas donde puedes verlo y probarlo — precio honesto son unas 50.000 IDR.', tags: ['Bali', 'café', 'experiencia'] },
          { name: 'Es Teh Manis', description: 'Té dulce con hielo, la bebida más consumida de Indonesia. Refrescante, muy azucarado, con menos de 0,50€ en cualquier warung.', tags: ['bebida', 'económico'] },
          { name: 'Tempeh', description: 'Soja fermentada en bloque y frita. Más nutritivo que el tofu, textura más densa. Originario de Java, base de la dieta vegetariana indonesia.', tags: ['Java', 'vegetariano'] },
        ],
      },
    ],
  },

  // ── BRASIL ────────────────────────────────────────────────────────────────
  'Brasil': {
    categories: [
      {
        category: 'Platos principales',
        icon: '🫕',
        items: [
          { name: 'Feijoada', description: 'Guiso de frijoles negros con cerdo (costilla, chorizo, oreja, rabo). El plato nacional, servido los sábados con arroz, col rehogada, farofa y naranja.', tags: ['sábados', 'nacional'] },
          { name: 'Churrasco brasileiro', description: 'Carne a la parrilla, especialmente picanha (corte de cadera con grasa). En churrascarías rodízio el camarero pasa con espadas de carne sin parar.', tags: ['parrilla', 'rodízio'] },
          { name: 'Moqueca', description: 'Guiso de pescado o gambas con leche de coco, dendê (aceite de palma), tomate y cilantro. Especialidad de Bahía y Espírito Santo, dos versiones distintas.', tags: ['Bahía', 'pescado'] },
          { name: 'Pão de queijo', description: 'Panecillo esponjoso de almidón de yuca y queso minas. Sin gluten naturalmente. Caliente recién hecho es insuperable. De Minas Gerais.', tags: ['Minas Gerais', 'snack'] },
        ],
      },
      {
        category: 'Street food y snacks',
        icon: '🍢',
        items: [
          { name: 'Coxinha', description: 'Croqueta con forma de muslo de pollo, rellena de pollo desmenuzado y catupiry (queso crema). El snack más popular de São Paulo.', tags: ['São Paulo', 'snack'] },
          { name: 'Acarajé', description: 'Bolita de masa de frijol careto frita en aceite de dendê, rellena de vatapá (pasta de gambas y cacahuetes). Iconico de Salvador de Bahía, vendido por Baianas.', tags: ['Salvador', 'Bahía'] },
          { name: 'Brigadeiro', description: 'Trufa de chocolate condensado con cacao y granillo. El dulce nacional, en todas las fiestas de cumpleaños. Sencillo y adictivo.', tags: ['dulce', 'icónico'] },
        ],
      },
      {
        category: 'Bebidas',
        icon: '🍹',
        items: [
          { name: 'Caipirinha', description: 'Cachaça (aguardiente de caña), lima machacada, azúcar y hielo. El cóctel nacional. Con frutas tropicales (maracuyá, mango) en versión caipifruta.', tags: ['cóctel', 'nacional'] },
          { name: 'Açaí', description: 'Pulpa de baya amazónica servida helada con granola y plátano. En Brasil es espeso como helado, no el smoothie diluido que conoces en Europa.', tags: ['salud', 'Amazonia'] },
          { name: 'Guaraná Antarctica', description: 'Refresco de guaraná (baya amazónica), más popular que Coca-Cola en Brasil. Sabor dulce y ligeramente amargo, muy energético por su cafeína natural.', tags: ['bebida', 'local'] },
        ],
      },
    ],
  },

};

/**
 * Obtiene datos gastronómicos para un país dado.
 * Busca primero por nombre exacto, luego por coincidencia parcial.
 */
export function getGastronomyData(countryLabel) {
  if (!countryLabel) return null;

  // Exact match
  if (GASTRONOMY_DB[countryLabel]) return GASTRONOMY_DB[countryLabel];

  // Case-insensitive
  const norm = countryLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const key = Object.keys(GASTRONOMY_DB).find(
    k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm
  );
  if (key) return GASTRONOMY_DB[key];

  return null;
}