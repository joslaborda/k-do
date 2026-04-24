/**
 * emergencyDB.js — Números de emergencia y datos de embajadas hardcodeados
 * Estructura por país destino. La embajada varía según país origen del usuario.
 *
 * emergency_general: número único de emergencias
 * police / ambulance / fire: números específicos si difieren
 * embassy_ES: embajada española en ese país
 * embassy_MX / embassy_AR / embassy_CO: otras embajadas hispanohablantes frecuentes
 * useful_apps: apps recomendadas para ese país
 * safety_tips: consejos de seguridad básicos
 */

const EMERGENCY_DB = {

  // ── EUROPA ────────────────────────────────────────────────────────────────

  'España': {
    emergency_general: '112',
    police: '091',
    ambulance: '061',
    fire: '080',
    embassy_ES: null, // Estás en España
    useful_apps: [
      { name: 'AlertCops', icon: '🚨', description: 'App oficial de la Policía Nacional para alertas de seguridad.' },
      { name: 'Emergencias 112', icon: '🆘', description: 'App oficial del 112 con geolocalización automática.' },
    ],
    safety_tips: [
      'Cuidado con los carteristas en zonas turísticas como Las Ramblas (Barcelona) o el Metro de Madrid.',
      'El 112 atiende en múltiples idiomas.',
      'En caso de accidente, la cobertura sanitaria pública es universal.',
    ],
  },

  'Francia': {
    emergency_general: '112',
    police: '17',
    ambulance: '15',
    fire: '18',
    embassy_ES: {
      address: '22 Avenue Marceau, 75008 París',
      phone: '+33 1 44 43 18 00',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/paris',
    },
    embassy_MX: { address: '9 Rue de Longchamp, 75116 París', phone: '+33 1 53 70 27 70', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/francia' },
    useful_apps: [
      { name: 'SNCF Connect', icon: '🚄', description: 'Billetes de tren TGV e Intercités.' },
      { name: 'Doctolib', icon: '🏥', description: 'Reserva cita médica online con médicos franceses.' },
      { name: 'Citymapper', icon: '🗺️', description: 'Transporte público en París y otras ciudades.' },
    ],
    safety_tips: [
      'Guarda el número de la embajada española (+33 1 44 43 18 00) en el móvil antes de salir.',
      'En el metro de París, cuidado con los grupos que distraen para robar.',
      'El SAMU (15) es la ambulancia; el SMUR atiende emergencias graves.',
      'La tarjeta sanitaria europea cubre atención en hospitales públicos.',
    ],
  },

  'Italia': {
    emergency_general: '112',
    police: '113',
    ambulance: '118',
    fire: '115',
    embassy_ES: {
      address: 'Palazzo Borghese, Largo della Fontanella di Borghese 19, Roma',
      phone: '+39 06 684 0401',
      hours: 'Lun-Vie 8:30-14:30',
      web: 'https://www.exteriores.gob.es/Embajadas/roma',
    },
    embassy_MX: { address: 'Via Lazzaro Spallanzani 16, 00161 Roma', phone: '+39 06 4416 5830', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/italia' },
    useful_apps: [
      { name: 'Trenitalia', icon: '🚂', description: 'Billetes de tren oficiales por toda Italia.' },
      { name: 'Italo', icon: '🚄', description: 'Tren de alta velocidad alternativo, a veces más barato.' },
      { name: 'MySOS', icon: '🆘', description: 'App de emergencias con geolocalización para extranjeros.' },
    ],
    safety_tips: [
      'En Roma y Nápoles, cuidado con los carteristas en el transporte público.',
      'Si te roban, denuncia en la Questura (policía) para el seguro de viaje.',
      'Guarda el número del consulado más cercano (Roma, Milán, Barcelona depende de zona).',
    ],
  },

  'Portugal': {
    emergency_general: '112',
    police: '213 421 634',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Rua do Salitre 1, 1269-052 Lisboa',
      phone: '+351 21 347 2381',
      hours: 'Lun-Vie 9:00-14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lisboa',
    },
    useful_apps: [
      { name: 'CP (Comboios de Portugal)', icon: '🚂', description: 'Trenes por todo Portugal.' },
      { name: 'Bolt', icon: '🚗', description: 'Taxi y VTC en Lisboa y Porto, más barato que Uber.' },
    ],
    safety_tips: [
      'Lisboa y Porto son ciudades seguras pero cuidado con carteristas en tranvías turísticos (especialmente el 28).',
      'En verano, zona de Alfama tiene mucha actividad turística — vigila pertenencias.',
    ],
  },

  'Alemania': {
    emergency_general: '112',
    police: '110',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Lichtensteinallee 1, 10787 Berlín',
      phone: '+49 30 254 007 0',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/berlin',
    },
    useful_apps: [
      { name: 'DB Navigator', icon: '🚂', description: 'Billetes y horarios de Deutsche Bahn, esencial en Alemania.' },
      { name: 'BVG / MVV', icon: '🚇', description: 'Transporte público en Berlín / Múnich respectivamente.' },
    ],
    safety_tips: [
      'Alemania es muy segura. En grandes estaciones (Hauptbahnhof) hay presencia de pickpockets en eventos masivos.',
      'La ambulancia (Rettungsdienst) es de pago — asegúrate de tener seguro médico de viaje.',
    ],
  },

  'Reino Unido': {
    emergency_general: '999',
    police: '101 (no urgencias) / 999',
    ambulance: '999',
    fire: '999',
    embassy_ES: {
      address: '39 Chesham Place, London SW1X 8SB',
      phone: '+44 20 7235 5555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/londres',
    },
    useful_apps: [
      { name: 'Citymapper', icon: '🚇', description: 'El mejor para navegar el metro y buses de Londres.' },
      { name: 'NHS App', icon: '🏥', description: 'Servicios de salud del NHS, incluyendo urgencias y médicos.' },
    ],
    safety_tips: [
      'El número de emergencias en UK es 999, no 112 (aunque 112 también funciona).',
      'Con tarjeta sanitaria europea (EHIC) o el nuevo GHIC post-Brexit tienes cobertura básica.',
      'En zonas como Brixton o Hackney en Londres, precaución nocturna como en cualquier capital.',
    ],
  },

  'Países Bajos': {
    emergency_general: '112',
    police: '0900-8844',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Lange Voorhout 50, 2514 EG La Haya',
      phone: '+31 70 302 4999',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lahaya',
    },
    useful_apps: [
      { name: '9292', icon: '🚲', description: 'Transporte público en Países Bajos — trenes, bus, tranvía.' },
      { name: 'NS (Nederlandse Spoorwegen)', icon: '🚂', description: 'Trenes nacionales holandeses.' },
    ],
    safety_tips: [
      'Amsterdam tiene alta incidencia de robos de bicicletas y carteristas en el barrio rojo.',
      'Ten cuidado con los ciclistas — tienen prioridad sobre los peatones en los carriles bici.',
    ],
  },

  'Suiza': {
    emergency_general: '112',
    police: '117',
    ambulance: '144',
    fire: '118',
    embassy_ES: {
      address: 'Kalcheggweg 24, 3006 Berna',
      phone: '+41 31 352 0412',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/berna',
    },
    useful_apps: [
      { name: 'SBB Mobile', icon: '🚂', description: 'Ferrocarriles suizos — compra y validación de billetes.' },
      { name: 'MeteoSwiss', icon: '🏔️', description: 'Meteorología oficial suiza, esencial en montaña.' },
    ],
    safety_tips: [
      'Suiza es muy segura. La asistencia sanitaria es excelente pero cara — seguro de viaje imprescindible.',
      'En montaña, avisa siempre de tu ruta y lleva ropa adecuada. El rescate alpino (Rega) es muy eficiente.',
    ],
  },

  'Austria': {
    emergency_general: '112',
    police: '133',
    ambulance: '144',
    fire: '122',
    embassy_ES: {
      address: 'Argentinierstrasse 34, 1040 Viena',
      phone: '+43 1 505 57 88',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/viena',
    },
    useful_apps: [
      { name: 'WienMobil', icon: '🚇', description: 'Transporte público en Viena.' },
      { name: 'ÖBB Tickets', icon: '🚂', description: 'Trenes austriacos.' },
    ],
    safety_tips: ['Viena es muy segura, considerada una de las ciudades más seguras de Europa.'],
  },

  'Grecia': {
    emergency_general: '112',
    police: '100',
    ambulance: '166',
    fire: '199',
    embassy_ES: {
      address: 'Dionysiou Areopagitou 21, 117 42 Atenas',
      phone: '+30 210 921 3123',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/atenas',
    },
    useful_apps: [
      { name: 'OASA Telematics', icon: '🚌', description: 'Transporte público de Atenas en tiempo real.' },
      { name: 'Beat (FreeNow)', icon: '🚗', description: 'Taxi en Atenas — mejor que intentar parar uno en la calle.' },
    ],
    safety_tips: [
      'En Atenas, el barrio de Omonia puede ser inseguro de noche. Exarchia también requiere precaución.',
      'En las islas, cuidado con los alquileres de moto/quad sin seguro — los accidentes son frecuentes.',
      'El agua del grifo en las islas puede no ser potable — beber agua embotellada.',
    ],
  },

  'Turquía': {
    emergency_general: '112',
    police: '155',
    ambulance: '112',
    fire: '110',
    embassy_ES: {
      address: 'Çankaya, Abdullah Cevdet Sokak No:22, 06690 Ankara',
      phone: '+90 312 438 0392',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/ankara',
    },
    useful_apps: [
      { name: 'BiTaksi', icon: '🚕', description: 'App oficial de taxis en Turquía — más seguro que taxis en calle.' },
      { name: 'Trafi', icon: '🚇', description: 'Metro y transporte público en Estambul.' },
    ],
    safety_tips: [
      'Estambul es generalmente segura para turistas. Cuidado con las estafas en el Gran Bazar.',
      'Evita protestas o manifestaciones — pueden volverse impredecibles.',
      'Lleva siempre una copia del pasaporte — la ley turca exige identificación en todo momento.',
    ],
  },

  'República Checa': {
    emergency_general: '112',
    police: '158',
    ambulance: '155',
    fire: '150',
    embassy_ES: {
      address: 'Pevnostní 9, 162 01 Praga 6',
      phone: '+420 233 097 211',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/praga',
    },
    useful_apps: [
      { name: 'PID Lítačka', icon: '🚇', description: 'Transporte público de Praga — billete y validación.' },
      { name: 'Bolt', icon: '🚗', description: 'VTC en Praga, más barato que taxis convencionales.' },
    ],
    safety_tips: [
      'En el Barrio Viejo y Puente de Carlos hay carteristas frecuentes en temporada alta.',
      'Los taxis sin taxímetro en Praga son una estafa habitual para turistas — usa siempre apps.',
    ],
  },

  'Hungría': {
    emergency_general: '112',
    police: '107',
    ambulance: '104',
    fire: '105',
    embassy_ES: {
      address: 'Eötvös utca 11-B, 1067 Budapest',
      phone: '+36 1 202 4006',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/budapest',
    },
    useful_apps: [
      { name: 'BKK Futár', icon: '🚇', description: 'Transporte público de Budapest en tiempo real.' },
      { name: 'Bolt', icon: '🚗', description: 'VTC en Budapest.' },
    ],
    safety_tips: [
      'Hay bares en el centro de Budapest conocidos como "ruin bars" — cuidado con bebidas adulteradas en algunos locales.',
      'Las tarjetas de crédito se aceptan ampliamente pero el forint (HUF) es necesario en algunos sitios pequeños.',
    ],
  },

  'Polonia': {
    emergency_general: '112',
    police: '997',
    ambulance: '999',
    fire: '998',
    embassy_ES: {
      address: 'ulica Mysia 5, 00-496 Varsovia',
      phone: '+48 22 583 4000',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/varsovia',
    },
    useful_apps: [
      { name: 'Bolt', icon: '🚗', description: 'VTC en las principales ciudades polacas.' },
      { name: 'KOLEO', icon: '🚂', description: 'Billetes de tren en Polonia.' },
    ],
    safety_tips: ['Polonia es segura para los turistas. Cracovia y Varsovia son ciudades tranquilas.'],
  },

  // ── ASIA ──────────────────────────────────────────────────────────────────

  'Japón': {
    emergency_general: '110 (policía) / 119 (bomberos y ambulancia)',
    police: '110',
    ambulance: '119',
    fire: '119',
    embassy_ES: {
      address: '1-3-29 Roppongi, Minato-ku, Tokio 106-0032',
      phone: '+81 3 3583 8531',
      hours: 'Lun-Vie 9:00-13:00 y 14:00-17:30',
      web: 'https://www.exteriores.gob.es/Embajadas/tokio',
    },
    embassy_MX: { address: '2-15-1 Nagata-cho, Chiyoda-ku, Tokio', phone: '+81 3 3581 1131', hours: 'Lun-Vie 9:30-13:00', web: 'https://embamex.sre.gob.mx/japon' },
    useful_apps: [
      { name: 'Google Translate + cámara', icon: '📷', description: 'Traduce menús y señales con la cámara en tiempo real.' },
      { name: 'Suica / PASMO', icon: '💳', description: 'Tarjeta de transporte recargable para metro y trenes.' },
      { name: 'Hyperdia', icon: '🚄', description: 'Rutas en Shinkansen y transporte local con horarios exactos.' },
      { name: 'LINE', icon: '💬', description: 'La app de mensajería principal en Japón.' },
    ],
    safety_tips: [
      'Japón es uno de los países más seguros del mundo — tasa de criminalidad mínima.',
      'En caso de terremoto: protégete bajo una mesa sólida, aléjate de ventanas. No uses ascensores.',
      'El servicio de urgencias (119) puede tener operadores sin inglés — lleva escrito tu dirección en japonés.',
      'Los hospitales requieren pago por adelantado sin seguro — lleva seguro médico de viaje obligatoriamente.',
    ],
  },

  'Tailandia': {
    emergency_general: '191 (policía) / 1669 (ambulancia)',
    police: '191',
    ambulance: '1669',
    fire: '199',
    embassy_ES: {
      address: '23F, Lake Rajada Office Complex, 193/126-130 New Rajadapisek Rd., Bangkok',
      phone: '+66 2 661 8284',
      hours: 'Lun-Vie 9:00-12:30',
      web: 'https://www.exteriores.gob.es/Embajadas/bangkok',
    },
    embassy_MX: { address: '20/69-70 Twin Towers, Rama IX Rd, Bangkok', phone: '+66 2 300 0435', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Grab', icon: '🛵', description: 'El Uber de Asia — taxis, motos y comida a domicilio en toda Tailandia.' },
      { name: 'LINE MAN', icon: '🍜', description: 'Delivery de comida tailandesa a domicilio.' },
      { name: 'Google Translate', icon: '🔤', description: 'El tailandés tiene alfabeto propio — imprescindible para menús y señales.' },
    ],
    safety_tips: [
      'Los "tuk-tuk estafa" son habituales en Bangkok: te llevan a tiendas de amigos antes del destino.',
      'Los escúter en islas: muchos turistas tienen accidentes sin casco. Seguro específico obligatorio.',
      'Las drogas tienen penas severísimas en Tailandia, incluyendo pena de muerte para tráfico.',
      'En zonas de manifestaciones políticas o alrededor del palacio real, mucho cuidado con comentarios sobre la monarquía.',
    ],
  },

  'Vietnam': {
    emergency_general: '113 (policía) / 115 (ambulancia)',
    police: '113',
    ambulance: '115',
    fire: '114',
    embassy_ES: {
      address: 'Edificio Horizon Towers, 40 Cat Linh Street, Hanói',
      phone: '+84 24 3771 5207',
      hours: 'Lun-Vie 8:30-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/hanoi',
    },
    useful_apps: [
      { name: 'Grab', icon: '🛵', description: 'Moto-taxi, taxi y comida en toda Vietnam — esencial.' },
      { name: 'Google Maps', icon: '🗺️', description: 'Funciona bien en Vietnam, mejor que Maps de Apple.' },
    ],
    safety_tips: [
      'Al cruzar la calle en Hanói/Ho Chi Minh: camina lento y constante, los vehículos esquivarán.',
      'Cuidado con los "xe ôm" (moto-taxi informales) — usa siempre Grab para precio fijo.',
      'Los cambios de dinero en la calle pueden darte billetes falsos — usa bancos o cajeros.',
    ],
  },

  'India': {
    emergency_general: '112',
    police: '100',
    ambulance: '102',
    fire: '101',
    embassy_ES: {
      address: '12 Prithviraj Road, Nueva Delhi 110011',
      phone: '+91 11 4129 3000',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/nuevadelhi',
    },
    useful_apps: [
      { name: 'Ola / Uber', icon: '🚖', description: 'Las dos apps de taxi más usadas en India — siempre precio cerrado.' },
      { name: 'IRCTC Rail Connect', icon: '🚂', description: 'Reservas de tren oficial en India — necesita registro previo.' },
      { name: 'MakeMyTrip', icon: '✈️', description: 'Vuelos y hoteles internos — los internos en India son baratos.' },
    ],
    safety_tips: [
      'Bebe siempre agua embotellada, nunca del grifo. Cuidado con el hielo en bebidas de puestos callejeros.',
      'Las mujeres deben evitar viajar solas de noche en algunas zonas, especialmente en transporte.',
      'El "estómago del viajero" es frecuente — lleva loperamida y sales de rehidratación.',
      'El regateo es esperable y parte de la cultura en mercados y con rickshaws.',
    ],
  },

  'China': {
    emergency_general: '110 (policía) / 120 (ambulancia)',
    police: '110',
    ambulance: '120',
    fire: '119',
    embassy_ES: {
      address: 'Sanlitun Lu 9, Chaoyang District, Pekín 100600',
      phone: '+86 10 6532 3629',
      hours: 'Lun-Vie 9:00-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/pekin',
    },
    useful_apps: [
      { name: 'DiDi', icon: '🚖', description: 'El Uber chino — taxi con conductor profesional.' },
      { name: 'WeChat Pay / AliPay', icon: '💳', description: 'Pago móvil esencial en China — muchos sitios no aceptan efectivo.' },
      { name: 'VPN (configurar antes de llegar)', icon: '🔐', description: 'Google, WhatsApp e Instagram están bloqueados en China.' },
    ],
    safety_tips: [
      'Instala una VPN fiable ANTES de llegar a China — después es difícil descargarla.',
      'WhatsApp y Google Maps no funcionan sin VPN. Descarga WeChat y Baidu Maps como alternativa.',
      'Registra tu alojamiento en la policía local (hoteles lo hacen automáticamente, pisos turísticos no siempre).',
    ],
  },

  'Corea del Sur': {
    emergency_general: '112 (policía) / 119 (bomberos y ambulancia)',
    police: '112',
    ambulance: '119',
    fire: '119',
    embassy_ES: {
      address: 'Hannam-daero 16-gil 29, Yongsan-gu, Seúl',
      phone: '+82 2 794 3581',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/seul',
    },
    useful_apps: [
      { name: 'Kakao T', icon: '🚕', description: 'La app de taxi oficial de Corea del Sur.' },
      { name: 'Naver Maps', icon: '🗺️', description: 'Mejor que Google Maps en Corea para transporte público.' },
      { name: 'T-money', icon: '💳', description: 'Tarjeta de transporte recargable para metro y bus.' },
    ],
    safety_tips: [
      'Corea del Sur es extremadamente segura — una de las más seguras de Asia.',
      'Los hospitales surcoreanos son de alta calidad y asequibles comparado con Europa.',
      'El metro de Seúl tiene pantallas en inglés — es fácil de usar para extranjeros.',
    ],
  },

  'Singapur': {
    emergency_general: '999 (policía) / 995 (ambulancia)',
    police: '999',
    ambulance: '995',
    fire: '995',
    embassy_ES: {
      address: '60 North Bridge Road, #08-02 Mapletree Business City, Singapur',
      phone: '+65 6732 9555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/singapur',
    },
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Taxis y VTC en Singapur.' },
      { name: 'MyTransport.SG', icon: '🚇', description: 'Transporte público oficial de Singapur.' },
    ],
    safety_tips: [
      'Singapur tiene leyes muy estrictas: mascar chicle, fumar en lugares no permitidos y arrojar basura tienen multas elevadas.',
      'La pena de muerte existe para tráfico de drogas — tolerancia cero absoluta.',
      'Es la ciudad más segura de Asia para turistas.',
    ],
  },

  'Indonesia': {
    emergency_general: '112',
    police: '110',
    ambulance: '118',
    fire: '113',
    embassy_ES: {
      address: 'Jl. H.R. Rasuna Said Kav. X Kav. 1-2, Kuningan, Yakarta',
      phone: '+62 21 2553 6000',
      hours: 'Lun-Vie 8:00-12:30',
      web: 'https://www.exteriores.gob.es/Embajadas/yakarta',
    },
    useful_apps: [
      { name: 'Gojek', icon: '🛵', description: 'El Grab indonesio — mototaxi, taxi y delivery en Indonesia.' },
      { name: 'Traveloka', icon: '✈️', description: 'Vuelos y hoteles para destinos internos en Indonesia.' },
    ],
    safety_tips: [
      'En Bali, los "money changers" en la calle pueden estafar con técnicas de desviar atención — usa bancos.',
      'Beber agua embotellada siempre. El agua del grifo no es potable.',
      'El volcán Agung en Bali está activo — consulta alertas volcánicas antes de visitar el área.',
    ],
  },

  // ── AMERICA ───────────────────────────────────────────────────────────────

  'México': {
    emergency_general: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    embassy_ES: {
      address: 'Galileo 114, Colonia Polanco, 11560 Ciudad de México',
      phone: '+52 55 5282 2977',
      hours: 'Lun-Vie 9:00-14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/mexico',
    },
    useful_apps: [
      { name: 'Uber / DiDi', icon: '🚗', description: 'Siempre usa taxi con app en CDMX — nunca taxis de calle.' },
      { name: 'CDMX app', icon: '🌆', description: 'App oficial de Ciudad de México con emergencias, metro y servicios.' },
      { name: 'Google Maps', icon: '🗺️', description: 'Funciona muy bien en México para transporte público.' },
    ],
    safety_tips: [
      'En CDMX y ciudades grandes, usa siempre Uber o DiDi — los "taxis piratas" son peligrosos.',
      'El Metro de CDMX tiene bolsillos en hora punta — usa mochila en el pecho.',
      'Consulta el mapa de zonas de seguridad antes de aventurarte por barrios desconocidos.',
      'Nunca saques el móvil en la calle en colonias de bajo nivel turístico.',
    ],
  },

  'Argentina': {
    emergency_general: '911',
    police: '101',
    ambulance: '107',
    fire: '100',
    embassy_ES: {
      address: 'Mariscal Ramón Castilla 2720, 1425 Buenos Aires',
      phone: '+54 11 4802 0444',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/buenosaires',
    },
    useful_apps: [
      { name: 'Cabify / Uber', icon: '🚗', description: 'VTC en Buenos Aires — los taxis regulares también son seguros pero usa apps.' },
      { name: 'Mercado Libre', icon: '💳', description: 'Para pagos con QR en muchos comercios.' },
    ],
    safety_tips: [
      'Buenos Aires tiene zonas turísticas muy seguras (Palermo, Recoleta) y otras que requieren más cautela (La Boca de noche).',
      'El "express kidnapping" (secuestro express) existe aunque es poco frecuente — no exhibas aparatos caros.',
      'Los cajeros automáticos: usa los de dentro de bancos, nunca los de la calle solos.',
    ],
  },

  'Colombia': {
    emergency_general: '123',
    police: '112',
    ambulance: '125',
    fire: '119',
    embassy_ES: {
      address: 'Calle 94 No. 11A-34, Bogotá',
      phone: '+57 1 700 0900',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/bogota',
    },
    useful_apps: [
      { name: 'Uber / InDriver', icon: '🚗', description: 'VTC en Colombia — más seguro que taxis en la calle.' },
      { name: 'Rappi', icon: '🍔', description: 'Delivery de comida y supermercado en Colombia.' },
    ],
    safety_tips: [
      'Colombia ha mejorado mucho en seguridad — Medellín y Cartagena son muy turísticas y relativamente seguras.',
      'La "burundanga" (escopolamina) es un riesgo real — nunca aceptes bebidas de desconocidos.',
      'El "paseo millonario" (taxi secuestro) existe — usa siempre apps de transporte.',
      'No exhibas joyas, móviles caros ni cámara de forma llamativa en la calle.',
    ],
  },

  'Perú': {
    emergency_general: '105 (policía) / 116 (bomberos)',
    police: '105',
    ambulance: '117',
    fire: '116',
    embassy_ES: {
      address: 'Calle Los Pinos 490, Av. El Rosario, San Isidro, Lima',
      phone: '+51 1 212 1200',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lima',
    },
    useful_apps: [
      { name: 'Uber / Cabify', icon: '🚗', description: 'VTC disponible en Lima y Cusco.' },
      { name: 'Machu Picchu Tickets', icon: '🏔️', description: 'Reserva de entradas a Machu Picchu con antelación — es obligatorio reservar.' },
    ],
    safety_tips: [
      'Machu Picchu requiere entrada con fecha y hora fijadas — resérvala con semanas o meses de antelación.',
      'El mal de altura (soroche) en Cusco (3400m) es real — descansa el primer día, bebe mucha agua y consume hoja de coca.',
      'En Lima, el Miraflores y Barranco son seguros para turistas; el Centro Histórico requiere más atención.',
    ],
  },

  'Chile': {
    emergency_general: '133 (policía) / 131 (ambulancia)',
    police: '133',
    ambulance: '131',
    fire: '132',
    embassy_ES: {
      address: 'Avda. Andrés Bello 1895, Providencia, Santiago',
      phone: '+56 2 2235 2755',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/santiago',
    },
    useful_apps: [
      { name: 'Cabify / Uber', icon: '🚗', description: 'VTC en Santiago.' },
      { name: 'Bip! (Metro de Santiago)', icon: '🚇', description: 'App del metro de Santiago.' },
    ],
    safety_tips: [
      'Chile es el país más seguro de Sudamérica para turistas.',
      'En el norte (Atacama), el sol es extremadamente intenso incluso con frío — usa factor 50 y sombrero.',
      'La carretera Austral puede tener tramos sin cobertura — informa a alguien de tu ruta antes de ir.',
    ],
  },

  'Brasil': {
    emergency_general: '190 (policía) / 192 (ambulancia)',
    police: '190',
    ambulance: '192',
    fire: '193',
    embassy_ES: {
      address: 'SES Av. das Nações Qd. 811, Lote 44, Brasília',
      phone: '+55 61 3345 2300',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/brasilia',
    },
    useful_apps: [
      { name: '99 / Uber', icon: '🚗', description: '99 es el Uber brasileño — más usado en Rio y São Paulo.' },
      { name: 'iFood', icon: '🍔', description: 'Delivery de comida en Brasil.' },
    ],
    safety_tips: [
      'Brasil tiene zonas muy seguras (Ipanema, Leblon en Rio) y otras que requieren máxima precaución (favelas sin tour guiado).',
      'Nunca salgas con el móvil caro a la vista en calles con poca gente — el "arrastão" (robo en grupo) existe.',
      'En playas, deja lo mínimo en la toalla — hay robos frecuentes.',
      'El Carnaval es espectacular pero los robos se multiplican — lleva solo efectivo mínimo.',
    ],
  },

  // ── AFRICA Y ORIENTE MEDIO ────────────────────────────────────────────────

  'Marruecos': {
    emergency_general: '19 (policía urbana) / 15 (SAMU)',
    police: '19',
    ambulance: '15',
    fire: '15',
    embassy_ES: {
      address: 'Rue Ain Khalouiya, km 5,3 Route des Zaers, Rabat',
      phone: '+212 537 63 39 00',
      hours: 'Lun-Vie 8:30-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/rabat',
    },
    useful_apps: [
      { name: 'Careem / inDrive', icon: '🚗', description: 'VTC en Casablanca y Marrakech — mucho más seguro que taxis informales.' },
      { name: 'WhatsApp', icon: '💬', description: 'La comunicación principal en Marruecos — todo el mundo lo usa.' },
    ],
    safety_tips: [
      'Los "falsos guías" en Marrakech son muy persistentes — di firmemente "non merci" y camina con decisión.',
      'En la medina, es normal perderse — lleva descargado el mapa offline de la medina.',
      'El regateo es obligatorio en souks — el precio inicial puede ser 5-10x el precio real.',
      'Las mujeres solas deben ser cautelosas especialmente de noche en medinas pequeñas.',
    ],
  },

  'Egipto': {
    emergency_general: '123 (policía) / 123 (ambulancia)',
    police: '122',
    ambulance: '123',
    fire: '180',
    embassy_ES: {
      address: '41 Ismail Mohamed Street, Zamalek, El Cairo',
      phone: '+20 2 2735 6535',
      hours: 'Lun-Vie 9:00-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/elcairo',
    },
    useful_apps: [
      { name: 'Uber / Careem', icon: '🚗', description: 'VTC en El Cairo — imprescindible para moverse con seguridad.' },
      { name: 'WhatsApp', icon: '💬', description: 'Principal comunicación en Egipto.' },
    ],
    safety_tips: [
      'El tráfico en El Cairo es caótico — usa siempre VTC, nunca cruces calles sin mirar en todas direcciones.',
      'Los vendedores en las pirámides son muy insistentes — di un "la shukran" (no gracias) firme.',
      'Bebe solo agua embotellada — evita el hielo en bebidas fuera de hoteles de calidad.',
      'En la zona de Luxor y Asuán, la policía turística es visible y el entorno es seguro.',
    ],
  },

  'Emiratos Árabes': {
    emergency_general: '999',
    police: '999',
    ambulance: '998',
    fire: '997',
    embassy_ES: {
      address: 'Embajada en Abu Dabi: Villa 1, al lado de la embajada de Bahrein, Abu Dabi',
      phone: '+971 2 6272 544',
      hours: 'Lun-Vie 8:30-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/abudabi',
    },
    useful_apps: [
      { name: 'Careem / Uber', icon: '🚗', description: 'VTC en Dubai y Abu Dabi — muy eficiente y económico.' },
      { name: 'Dubai Metro', icon: '🚇', description: 'Metro de Dubai muy moderno, con app oficial de la RTA.' },
    ],
    safety_tips: [
      'Los EAU tienen leyes muy estrictas: las relaciones homosexuales están prohibidas.',
      'Beber alcohol en la calle o conducir con alcohol está penado con cárcel.',
      'Durante el Ramadán, comer, beber o fumar en público durante el día puede conllevar arresto.',
      'Es uno de los países más seguros del mundo en términos de criminalidad ordinaria.',
    ],
  },

  // ── OCEANIA ───────────────────────────────────────────────────────────────

  'Australia': {
    emergency_general: '000',
    police: '000',
    ambulance: '000',
    fire: '000',
    embassy_ES: {
      address: '15 Arkana Street, Yarralumla, Canberra ACT 2600',
      phone: '+61 2 6273 3555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/canberra',
    },
    useful_apps: [
      { name: 'Emergency+ (112)', icon: '🆘', description: 'App oficial australiana de emergencias con GPS automático.' },
      { name: 'GovReady', icon: '🏛️', description: 'Alertas de desastres naturales y emergencias.' },
      { name: 'Uber / Ola', icon: '🚗', description: 'VTC en las ciudades australianas.' },
    ],
    safety_tips: [
      'La fauna australiana puede ser peligrosa: respeta distancias con cocodrilos (norte), medusas "box jellyfish" y serpientes.',
      'El sol es extremadamente intenso — factor 50, sombrero y evita exposición entre 11h-15h.',
      'Nada siempre entre las banderas en playas supervisadas — las corrientes pueden ser letales.',
      'El número de emergencias es 000, no 112 (aunque 112 funciona desde móvil).',
    ],
  },

};

/**
 * Obtiene datos de emergencia hardcodeados para un país.
 * Compatible con la interfaz que espera Utilities.jsx.
 */
export function getHardcodedEmergencyInfo(countryLabel, homeCountry = 'España') {
  if (!countryLabel) return null;

  // Exact match
  let data = EMERGENCY_DB[countryLabel];

  // Case-insensitive fallback
  if (!data) {
    const norm = countryLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = Object.keys(EMERGENCY_DB).find(
      k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm
    );
    if (key) data = EMERGENCY_DB[key];
  }

  if (!data) return null;

  // Seleccionar embajada según país de origen
  let embassy = null;
  const homeNorm = (homeCountry || 'España').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (homeNorm.includes('mexic')) embassy = data.embassy_MX || data.embassy_ES;
  else if (homeNorm.includes('argentin')) embassy = data.embassy_AR || data.embassy_ES;
  else if (homeNorm.includes('colombi')) embassy = data.embassy_CO || data.embassy_ES;
  else embassy = data.embassy_ES;

  return {
    emergency_general: data.emergency_general,
    police: data.police,
    ambulance: data.ambulance,
    fire: data.fire,
    embassy,
    useful_apps: data.useful_apps || [],
    safety_tips: data.safety_tips || [],
  };
}