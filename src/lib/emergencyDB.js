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
    embassy_FR: { address: '4-11-44 Minami-Azabu, Minato-ku, Tokio', phone: '+81 3 5798 6000', hours: 'Lun-Vie 9:30-12:30', web: 'https://jp.ambafrance.org' },
    embassy_DE: { address: '4-5-10 Minami-Azabu, Minato-ku, Tokio', phone: '+81 3 5791 7700', hours: 'Lun-Vie 9:00-12:00', web: 'https://japan.diplo.de' },
    embassy_IT: { address: '2-5-4 Mita, Minato-ku, Tokio', phone: '+81 3 3453 5291', hours: 'Lun-Vie 9:00-13:00', web: 'https://ambtokyo.esteri.it' },
    embassy_BR: { address: '2-11-12 Kita-Aoyama, Minato-ku, Tokio', phone: '+81 3 3404 5211', hours: 'Lun-Vie 9:00-13:00', web: 'https://tokio.itamaraty.gov.br' },
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
    embassy_FR: { address: '35 Customs House Lane, Bangrak, Bangkok', phone: '+66 2 657 5100', hours: 'Lun-Vie 8:30-12:00', web: 'https://th.ambafrance.org' },
    embassy_DE: { address: '9 South Sathorn Road, Bangkok', phone: '+66 2 287 9000', hours: 'Lun-Vie 8:00-11:30', web: 'https://bangkok.diplo.de' },
    embassy_BR: { address: '34th Floor, Abdulrahim Place, 990 Rama IV Road, Bangkok', phone: '+66 2 266 6659', hours: 'Lun-Vie 9:00-12:00', web: 'https://bangkok.itamaraty.gov.br' },
    embassy_IT: { address: '399 Nang Linchi Road, Yan Nawa, Bangkok', phone: '+66 2 285 4090', hours: 'Lun-Vie 8:30-12:30', web: 'https://ambangkok.esteri.it' },
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
    embassy_FR: { address: '3 Rue Sahnoun, Agdal, Rabat', phone: '+212 5 37 68 97 00', hours: 'Lun-Vie 9:00-12:30', web: 'https://ma.ambafrance.org' },
    embassy_DE: { address: '7 Zankat Madnine, Rabat', phone: '+212 5 37 21 00 22', hours: 'Lun-Vie 8:30-11:30', web: 'https://rabat.diplo.de' },
    embassy_IT: { address: '2 Rue Idriss Al Azhar, Rabat', phone: '+212 5 37 72 68 07', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambrabat.esteri.it' },
    embassy_BR: { address: '3 Rue Thami Lamdawar, Souissi, Rabat', phone: '+212 5 37 65 04 56', hours: 'Lun-Vie 9:00-12:00', web: 'https://rabat.itamaraty.gov.br' },
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
    embassy_FR: { address: '29 Avenue Charles de Gaulle, Giza, El Cairo', phone: '+20 2 3567 3200', hours: 'Lun-Vie 9:00-12:00', web: 'https://eg.ambafrance.org' },
    embassy_DE: { address: '2 El Shaikh Mohamed Mahran St, Giza, El Cairo', phone: '+20 2 3748 8440', hours: 'Lun-Vie 8:30-11:30', web: 'https://kairo.diplo.de' },
    embassy_IT: { address: '15 Abd El Rahman Fahmy St, Garden City, El Cairo', phone: '+20 2 2794 3194', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambcairo.esteri.it' },
    embassy_BR: { address: '1 El Shaikh Mohamed Mahran St, Giza, El Cairo', phone: '+20 2 3748 7960', hours: 'Lun-Vie 9:00-12:00', web: 'https://cairo.itamaraty.gov.br' },
    embassy_PE: { address: 'El Cairo — Embajada del Perú: 34 Soliman Abaza, Mohandessin', phone: '+20 2 3748 8040', hours: 'Lun-Vie 9:00-13:00', web: 'https://www.embajadaperu.com.eg' },
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
    embassy_FR: { address: 'Abu Dabi: Corniche Road West, Abu Dabi', phone: '+971 2 443 5100', hours: 'Lun-Vie 8:30-12:30', web: 'https://ae.ambafrance.org' },
    embassy_DE: { address: 'Abu Dabi: PO Box 2591, Abu Dabi', phone: '+971 2 644 0700', hours: 'Lun-Vie 7:30-12:00', web: 'https://abudhabi.diplo.de' },
    embassy_IT: { address: 'Abu Dabi: Villa 3-7, Zone A, Abu Dabi', phone: '+971 2 443 5622', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambaboudhabi.esteri.it' },
    embassy_BR: { address: 'Abu Dabi: Khalidiyah, Abu Dabi', phone: '+971 2 674 4008', hours: 'Lun-Vie 9:00-12:00', web: 'https://abudhabi.itamaraty.gov.br' },
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


  // ══ EUROPA ADICIONAL ══════════════════════════════════════════════════════
  'Bélgica': {
    emergency_general: '112', police: '101', ambulance: '100', fire: '100',
    embassy_ES: 'Embajada de España en Bruselas: +32 2 230 03 40',
    useful_apps: [{ name: 'BE-Alert', icon: '🚨', description: 'Alertas de emergencia oficiales de Bélgica.' }],
    safety_tips: ['Los barrios del centro de Bruselas son seguros de día. Cuidado con carteristas en el metro.'],
  },
  'Países Bajos': {
    emergency_general: '112', police: '0900-8844', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en La Haya: +31 70 302 49 99',
    useful_apps: [{ name: 'Burgernet', icon: '🚔', description: 'Red ciudadana de seguridad de la policía holandesa.' }],
    safety_tips: ['Cuidado con los carriles bici en Amsterdam y otras ciudades — tienen prioridad.', 'Los robos de bicicletas son muy frecuentes.'],
  },
  'Suecia': {
    emergency_general: '112', police: '114 14', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Estocolmo: +46 8 667 43 00',
    useful_apps: [{ name: '112 Sverige', icon: '🆘', description: 'App oficial de emergencias sueca con geolocalización.' }],
    safety_tips: ['País muy seguro. Cuidado con el frío extremo en invierno.'],
  },
  'Noruega': {
    emergency_general: '112', police: '02800', ambulance: '113', fire: '110',
    embassy_ES: 'Embajada de España en Oslo: +47 22 92 28 80',
    useful_apps: [{ name: 'Hjelp112', icon: '🆘', description: 'App oficial de emergencias noruega.' }],
    safety_tips: ['País muy seguro. En senderismo avisa siempre de tu ruta. Clima cambiante.'],
  },
  'Dinamarca': {
    emergency_general: '112', police: '114', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Copenhague: +45 35 42 47 00',
    useful_apps: [{ name: '112 app', icon: '🆘', description: 'App de emergencias danesa.' }],
    safety_tips: ['Muy seguro. Cuidado con los robos en zonas turísticas de Copenhague (Nyhavn).'],
  },
  'Finlandia': {
    emergency_general: '112', police: '0295 419 800', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Helsinki: +358 9 687 00 80',
    useful_apps: [{ name: '112 Suomi', icon: '🆘', description: 'App oficial de emergencias finlandesa con GPS.' }],
    safety_tips: ['País muy seguro. Peligro de hipotermia en invierno. Nunca camines solo en el hielo sin comprobarlo.'],
  },
  'Irlanda': {
    emergency_general: '112/999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Dublín: +353 1 269 16 40',
    useful_apps: [],
    safety_tips: ['Muy seguro. Tráfico por la izquierda. Cuidado con los acantilados costeros sin barandilla.'],
  },
  'Polonia': {
    emergency_general: '112', police: '997', ambulance: '999', fire: '998',
    embassy_ES: 'Embajada de España en Varsovia: +48 22 583 40 00',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con taxis no regulados en Varsovia. Usa Bolt o Uber.'],
  },
  'República Checa': {
    emergency_general: '112', police: '158', ambulance: '155', fire: '150',
    embassy_ES: 'Embajada de España en Praga: +420 233 097 211',
    useful_apps: [],
    safety_tips: ['Seguro. Praga: cuidado con cambio de moneda en la calle — timo frecuente. Usa cajeros de banco.'],
  },
  'Hungría': {
    emergency_general: '112', police: '107', ambulance: '104', fire: '105',
    embassy_ES: 'Embajada de España en Budapest: +36 1 202 40 06',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con bares y clubes en Budapest que cobran precios abusivos a turistas.'],
  },
  'Croacia': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Zagreb: +385 1 4848 950',
    useful_apps: [],
    safety_tips: ['Seguro. Costa dálmata: cuidado con las embarcaciones en zonas de baño. Sol muy intenso en verano.'],
  },
  'Rumania': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Bucarest: +40 21 318 10 20',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Cuidado con perros callejeros en zonas rurales. Carreteras en mal estado.'],
  },
  'Bulgaria': {
    emergency_general: '112', police: '166', ambulance: '150', fire: '160',
    embassy_ES: 'Embajada de España en Sofía: +359 2 943 30 32',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con taxis sin taxímetro visible. Pregunta el precio antes.'],
  },
  'Serbia': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Belgrado: +381 11 2444 476',
    useful_apps: [],
    safety_tips: ['Seguro. Belgrado tiene vida nocturna activa — los barcos-discoteca (splavovi) en el Danubio son seguros.'],
  },
  'Portugal': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: null,
    useful_apps: [{ name: 'INEM app', icon: '🆘', description: 'App del Instituto Nacional de Emergencias Médicas de Portugal.' }],
    safety_tips: ['Muy seguro. Cuidado con carteristas en tranvías de Lisboa (línea 28). Oleaje fuerte en Costa Atlántica.'],
  },
  'Eslovaquia': {
    emergency_general: '112', police: '158', ambulance: '155', fire: '150',
    embassy_ES: 'Embajada de España en Bratislava: +421 2 5441 6597',
    useful_apps: [],
    safety_tips: ['Seguro. Montañas Tatra: riesgo de tormentas repentinas en verano. Sigue siempre los senderos marcados.'],
  },
  'Eslovenia': {
    emergency_general: '112', police: '113', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Ljubljana: +386 1 425 40 34',
    useful_apps: [],
    safety_tips: ['Muy seguro. Lago Bled: corrientes en zonas de natación. Cueva de Postojna: sigue al guía.'],
  },
  'Islandia': {
    emergency_general: '112', police: '444 1000', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Reikiavik: +354 511 28 50',
    useful_apps: [{ name: 'Safetravel IS', icon: '🌋', description: 'App oficial de seguridad en viajes por Islandia. Imprescindible.' }],
    safety_tips: ['Naturaleza peligrosa: géiseres queman, olas rogue en la costa negra, erupciones volcánicas. Consulta safetravel.is SIEMPRE.', 'Nunca cruces ríos sin conocer su profundidad. Alquila 4x4 para el interior (Highlands).'],
  },
  'Malta': {
    emergency_general: '112', police: '2122 4001', ambulance: '112', fire: '199',
    embassy_ES: 'Embajada de España en La Valeta: +356 21 232 843',
    useful_apps: [],
    safety_tips: ['Muy seguro. Calor extremo en verano. Tráfico por la izquierda. Buceo: avisa siempre a alguien.'],
  },

  // ══ ASIA ADICIONAL ════════════════════════════════════════════════════════
  'Tailandia': {
    emergency_general: '191/1669', police: '191', ambulance: '1669', fire: '199',
    embassy_ES: 'Embajada de España en Bangkok: +66 2 661 80 84',
    useful_apps: [
      { name: 'Tourist Police 1155', icon: '👮', description: 'Policía turística tailandesa. Inglés disponible.' },
      { name: 'Grab', icon: '🚗', description: 'Taxi/moto por app. Más seguro que taxis de calle.' },
    ],
    safety_tips: ['No insultes ni hagas gestos irrespetuosos con la familia real — es ilegal.', 'Cuidado con los tuktuk que te llevan a tiendas de joyería.', 'Moto sin casco es multa. Ponte siempre el casco aunque el conductor no lo lleve.'],
  },
  'Vietnam': {
    emergency_general: '113/115', police: '113', ambulance: '115', fire: '114',
    embassy_ES: 'Embajada de España en Hanói: +84 24 3771 5207',
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Imprescindible para motos y coches. Precios fijos, sin regateo.' },
    ],
    safety_tips: ['Cruzar la calle: camina despacio y constante — las motos te esquivarán.', 'Cuidado con robos en moto (bolso arrancado desde moto en movimiento). Lleva el bolso cruzado hacia el interior.', 'Nunca dejes objetos en la cesta del scooter que alquilas.'],
  },
  'Indonesia': {
    emergency_general: '112', police: '110', ambulance: '118', fire: '113',
    embassy_ES: 'Embajada de España en Yakarta: +62 21 314 30 52',
    useful_apps: [
      { name: 'Gojek', icon: '🛵', description: 'Transporte, comida y más. Imprescindible en Indonesia.' },
      { name: 'Grab', icon: '🚗', description: 'Alternativa a Gojek. Muy usado en Bali.' },
    ],
    safety_tips: ['Bali: cuidado con los monos del Templo de Ubud — pueden robar objetos.', 'Zona volcánica: consulta nivel de alerta del volcán antes de senderismo (Merapi, Rinjani, Agung).', 'Agua del grifo no potable en todo el país.'],
  },
  'India': {
    emergency_general: '112', police: '100', ambulance: '108', fire: '101',
    embassy_ES: 'Embajada de España en Nueva Delhi: +91 11 46 75 00 00',
    useful_apps: [
      { name: 'Ola Cabs', icon: '🚗', description: 'Taxi por app. Más seguro que taxis de calle.' },
      { name: 'Uber', icon: '🚗', description: 'Disponible en ciudades principales.' },
      { name: 'IRCTC Rail Connect', icon: '🚆', description: 'Reserva trenes de la red ferroviaria india.' },
    ],
    safety_tips: ['Agua del grifo no potable — solo agua embotellada con sello intacto.', 'Agencias de viaje "falsas" muy comunes en zonas turísticas. Compra directamente en taquillas oficiales.', 'Mujer viajera: ropa conservadora en zonas rurales y templos. Evita salidas nocturnas sola.'],
  },
  'China': {
    emergency_general: '120/110', police: '110', ambulance: '120', fire: '119',
    embassy_ES: 'Embajada de España en Pekín: +86 10 6532 3629',
    useful_apps: [
      { name: 'DiDi', icon: '🚗', description: 'Taxi por app (equivalente a Uber). Esencial.' },
      { name: 'WeChat / Alipay', icon: '💳', description: 'Para pagos — el efectivo apenas se usa en ciudades.' },
      { name: 'VPN', icon: '🔒', description: 'Google, WhatsApp, Instagram bloqueados. Instala VPN ANTES de llegar.' },
    ],
    safety_tips: ['Instala VPN antes de entrar — Google, WhatsApp, YouTube e Instagram están bloqueados.', 'WeChat o Alipay son imprescindibles para pagar (muchos sitios no aceptan efectivo ni tarjeta extranjera).', 'No fotografíes instalaciones militares, policía o protestas.'],
  },
  'Japón': {
    emergency_general: '110/119', police: '110', ambulance: '119', fire: '119',
    embassy_ES: 'Embajada de España en Tokio: +81 3 3583 8531',
    useful_apps: [
      { name: 'Safety Tips', icon: '🌊', description: 'App oficial del gobierno japonés: terremotos, tsunamis, alertas.' },
      { name: 'Google Maps', icon: '🗺️', description: 'Mejor app para transporte público en Japón. Fiabilísimo.' },
      { name: 'Hyperdia', icon: '🚆', description: 'Horarios de trenes y Shinkansen en detalle.' },
    ],
    safety_tips: ['País muy seguro. Mayor riesgo: terremotos y tsunamis. Aprende el protocolo de evacuación del hotel.', 'En terremoto: aléjate de ventanas, protégete bajo una mesa. Sal tras las réplicas.', 'Las clínicas médicas a menudo no hablan inglés — lleva tu documentación médica en japonés si tienes condición preexistente.'],
  },
  'Corea del Sur': {
    emergency_general: '119/112', police: '112', ambulance: '119', fire: '119',
    embassy_ES: 'Embajada de España en Seúl: +82 2 794 3581',
    useful_apps: [
      { name: 'Kakao T', icon: '🚕', description: 'Taxi por app. Imprescindible en Corea.' },
      { name: 'Naver Maps', icon: '🗺️', description: 'Mejor que Google Maps para Corea del Sur.' },
    ],
    safety_tips: ['País muy seguro. Cuidado con cruzar en rojo — multas frecuentes en ciudades.'],
  },
  'Singapur': {
    emergency_general: '999/995', police: '999', ambulance: '995', fire: '995',
    embassy_ES: 'Embajada de España en Singapur: +65 6379 7830',
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Taxi/transporte por app. El más usado en Singapur.' },
    ],
    safety_tips: ['País muy seguro con leyes estrictas.', 'Prohibido: chicle (multa), comer en metro (multa), fumar en zonas no designadas (multa).', 'Drogas: pena de muerte. Sin excepciones.'],
  },
  'Malasia': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '994',
    embassy_ES: 'Embajada de España en Kuala Lumpur: +60 3 2148 4868',
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Transporte y comida por app. Muy usado.' },
      { name: 'MyEG', icon: '📋', description: 'Trámites oficiales en Malasia.' },
    ],
    safety_tips: ['Seguro en zonas turísticas. Borneo: zona fronteriza Sabah (Lahad Datu) — evitar o consultar situación actual.', 'Conducción temeraria en algunos estados — usa cinturón siempre.'],
  },
  'Filipinas': {
    emergency_general: '911', police: '117', ambulance: '911', fire: '160',
    embassy_ES: 'Embajada de España en Manila: +63 2 8523 9586',
    useful_apps: [
      { name: 'Angkas', icon: '🛵', description: 'Mototaxi por app en Manila. Legal y seguro.' },
      { name: 'Grab', icon: '🚗', description: 'Taxi y entrega de comida.' },
    ],
    safety_tips: ['Cuidado en zonas de Mindanao (Maguindanao, Marawi) — riesgo de seguridad activo. Consulta aviso de viaje.', 'Tifones de junio a noviembre. Sigue instrucciones de evacuación.', 'Nunca lleves mochila en la espalda en zonas concurridas de Manila — riesgo de arrebato.'],
  },
  'Nepal': {
    emergency_general: '100/102', police: '100', ambulance: '102', fire: '101',
    embassy_ES: 'Embajada de España en Nueva Delhi cubre Nepal. En Katmandú: Honorary Consul.',
    useful_apps: [
      { name: 'Trekking Nepal', icon: '🏔️', description: 'Rutas de trekking y altitudes. Útil para Everest Base Camp.' },
    ],
    safety_tips: ['Trekking: nunca solo sin guía registrado. Seguro de evacuación en helicóptero obligatorio para rutas de alta montaña.', 'Mal de altura (AMS) a partir de 3.000m — ascende despacio, hidratate, y baja si tienes síntomas.', 'Agua solo embotellada o purificada.'],
  },
  'Sri Lanka': {
    emergency_general: '119/110', police: '119', ambulance: '110', fire: '111',
    embassy_ES: 'Embajada de España en Colombo: +94 11 269 11 11 (Consulado Hon.)',
    useful_apps: [
      { name: 'PickMe', icon: '🚗', description: 'App de taxi local. Alternativa a Uber.' },
    ],
    safety_tips: ['Costa este: cuidado con corrientes (undertow) en playas. Muchas muertes de bañistas por corrientes.', 'Agua del grifo no potable en general.'],
  },
  'Maldivas': {
    emergency_general: '119', police: '119', ambulance: '102', fire: '118',
    embassy_ES: 'No hay embajada española en Maldivas. La más cercana está en Colombo (Sri Lanka).',
    useful_apps: [],
    safety_tips: ['País muy seguro para turistas en resorts. Malé (capital): más cuidado que en los resorts.', 'Buceo: nunca solo. Certifícate con instructores de PADI.', 'Alcohol: solo se sirve en resorts de islas turísticas, no en isla locales habitadas.'],
  },

  // ══ ORIENTE MEDIO ═════════════════════════════════════════════════════════
  'Emiratos Árabes Unidos': {
    emergency_general: '999', police: '999', ambulance: '998', fire: '997',
    embassy_ES: 'Embajada de España en Abu Dabi: +971 2 626 90 44',
    useful_apps: [
      { name: 'Careem', icon: '🚗', description: 'App de taxi local. Muy usada en UAE.' },
      { name: 'RTA Dubai', icon: '🚇', description: 'App de transporte público de Dubai.' },
    ],
    safety_tips: ['Respeta las leyes locales: alcohol solo en lugares licenciados.', 'Ramadán: no comer, beber o fumar en público durante el ayuno (multa o detención).', 'Muestras de afecto en público entre parejas no casadas pueden ser multadas.', 'Fotografiar edificios gubernamentales, militares o personas sin permiso: ilegal.'],
  },
  'Arabia Saudí': {
    emergency_general: '911', police: '999', ambulance: '911', fire: '998',
    embassy_ES: 'Embajada de España en Riad: +966 11 488 08 05',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'Disponible en Arabia Saudí desde 2019.' },
      { name: 'Careem', icon: '🚗', description: 'App de taxi local muy usada.' },
    ],
    safety_tips: ['Respeta siempre las costumbres locales: ropa cubriente en público, especialmente en Meca y Medina (no-musulmanes no pueden entrar).', 'No muestres afecto en público. Alcohol: completamente prohibido.', 'Horario de negocios cambia drásticamente durante Ramadán.'],
  },
  'Israel': {
    emergency_general: '100/101/102', police: '100', ambulance: '101', fire: '102',
    embassy_ES: 'Embajada de España en Tel Aviv: +972 3 754 62 00',
    useful_apps: [
      { name: 'Home Front Command (Pikud HaOref)', icon: '🚨', description: 'Alertas de cohetes y emergencias de seguridad. Imprescindible.' },
      { name: 'Moovit', icon: '🚌', description: 'Transporte público en Israel.' },
    ],
    safety_tips: ['Consulta el nivel de alerta de seguridad antes y durante el viaje (Ministerio de Exteriores de tu país).', 'En alerta de cohetes: busca el mampara más cercano (mirpeset) — hay menos de 90 segundos. El hotel te indicará el refugio.', 'Controles de seguridad muy estrictos en aeropuertos — llega con 3+ horas de antelación.'],
  },
  'Jordania': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Ammán: +962 6 465 52 52',
    useful_apps: [
      { name: 'Careem', icon: '🚗', description: 'Taxi por app en Ammán.' },
    ],
    safety_tips: ['País seguro para turistas. Cuidado en zonas fronterizas con Siria e Iraq.', 'Wadi Rum y Petra: lleva agua suficiente (mínimo 3L/persona/día en verano). Calor extremo.', 'Agua del grifo no potable.'],
  },
  'Irán': {
    emergency_general: '115/110', police: '110', ambulance: '115', fire: '125',
    embassy_ES: 'Embajada de España en Teherán: +98 21 267 3800',
    useful_apps: [
      { name: 'Snapp', icon: '🚗', description: 'App de taxi local (equivalente a Uber en Irán).' },
    ],
    safety_tips: ['Mujeres: hiyab obligatorio en todo momento en espacios públicos.', 'Fotografiar instalaciones militares, gubernamentales o personas sin permiso: ilegal.', 'VPN necesaria — internet muy censurado. Instala antes de entrar.', 'No hacer comentarios sobre política en público.'],
  },

  // ══ AFRICA ════════════════════════════════════════════════════════════════
  'Sudáfrica': {
    emergency_general: '10111/10177', police: '10111', ambulance: '10177', fire: '10111',
    embassy_ES: 'Embajada de España en Pretoria: +27 12 460 07 99',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'IMPRESCINDIBLE en SA. Nunca tomes taxis de calle.' },
      { name: 'Panic Button SA', icon: '🚨', description: 'Botón de pánico para emergencias de seguridad.' },
    ],
    safety_tips: ['Nunca camines con el móvil visible en la calle en Johannesburgo o Cape Town.', 'Conduce con las puertas bloqueadas y ventanas subidas en ciudades.', 'Smash-and-grab en semáforos: no dejes nada visible en el coche.', 'Townships: solo con guía de confianza. Nunca solo/a.', 'Playas: corrientes fuertes. Algunas playas tienen tiburones (Cape Town — hay alertas).'],
  },
  'Kenia': {
    emergency_general: '999/112', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Nairobi: +254 20 228 64 60',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'Seguro y fiable en Nairobi.' },
      { name: 'Little Cab', icon: '🚗', description: 'Alternativa local a Uber.' },
      { name: 'M-Pesa', icon: '💳', description: 'Sistema de pagos por móvil. Muy útil.' },
    ],
    safety_tips: ['Nairobi: nunca pasees de noche en zonas no turísticas. Westlands y Karen son las más seguras.', 'Safari: nunca salgas del vehículo salvo en zonas designadas.', 'Costa de Kenya: zona fronteriza con Somalia (Lamu) — evitar o consultar avisos actuales.', 'Malaria: profilaxis recomendada. Consulta médico viajes de tu país.'],
  },
  'Tanzania': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '115',
    embassy_ES: 'Embajada de España en Nairobi cubre Tanzania. Consulado Honorario en Dar es Salaam.',
    useful_apps: [],
    safety_tips: ['Zanzíbar: muy segura en zonas turísticas. Evita playas solitarias de noche.', 'Safari Serengeti/Ngorongoro: respeta las normas del parque. Nunca fuera del vehículo.', 'Malaria: profilaxis recomendada. Mosquitera por la noche.', 'Kilimanjaro: seguro médico de evacuación obligatorio.'],
  },
  'Marruecos': {
    emergency_general: '19/15', police: '19', ambulance: '15', fire: '15',
    embassy_ES: 'Embajada de España en Rabat: +212 5 37 63 39 00. Consulado en Casablanca: +212 5 22 22 05 52',
    useful_apps: [
      { name: 'inDrive', icon: '🚗', description: 'App de taxi negociado. Más seguro que taxis de calle.' },
    ],
    safety_tips: ['Medinas: cuidado con guías "espontáneos" que luego cobran. Si no quieres su servicio, dilo claramente.', 'Regatear es normal en zocos. Nunca obligatorio comprar.', 'No fotografíes personas sin pedir permiso.', 'Ramadán: actitud de respeto en espacios públicos.'],
  },
  'Egipto': {
    emergency_general: '123/122', police: '122', ambulance: '123', fire: '180',
    embassy_ES: 'Embajada de España en El Cairo: +20 2 2735 6264',
    useful_apps: [
      { name: 'Careem', icon: '🚗', description: 'Taxi por app. Mucho más seguro que taxis de calle.' },
      { name: 'inDrive', icon: '🚗', description: 'Alternativa a Careem.' },
    ],
    safety_tips: ['Nunca tomes un taxi de calle sin negociar el precio antes.', 'El Sinaí norte (Al-Arish, Rafah): evitar completamente — riesgo terrorista activo.', 'Hidratación fundamental: calor extremo. Agua solo embotellada.', 'Luxor/Aswan: cuidado con fellucas sin chaleco salvavidas.'],
  },

  // ══ AMERICAS ══════════════════════════════════════════════════════════════
  'México': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Ciudad de México: +52 55 5282 2974',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'IMPRESCINDIBLE en CDMX. Evita taxis de calle.' },
      { name: 'CDMX', icon: '🚇', description: 'App oficial del metro de Ciudad de México.' },
    ],
    safety_tips: ['Nunca tomes taxis de calle en CDMX ni en aeropuertos — riesgo de secuestro exprés. Solo Uber, Cabify o taxis en parada oficial.', 'Jalisco, Tamaulipas, Guerrero: zonas con alerta activa de seguridad. Consulta mapa de riesgo.', 'CDMX es relativamente segura en Polanco, Roma, Condesa. Evita Tepito y algunos barrios del norte de noche.'],
  },
  'Colombia': {
    emergency_general: '123', police: '112', ambulance: '125', fire: '119',
    embassy_ES: 'Embajada de España en Bogotá: +57 601 622 0090',
    useful_apps: [
      { name: 'Cabify', icon: '🚗', description: 'Más seguro que taxis de calle en Colombia.' },
      { name: 'InDriver', icon: '🚗', description: 'Muy usado en ciudades intermedias.' },
    ],
    safety_tips: ['Nunca aceptes bebidas de desconocidos — riesgo de burundanga (escopolamina).', 'En Cartagena: cuidado con joyas y móvil visibles en la calle.', 'Medellín: zonas turísticas (El Poblado, Laureles) seguras. Evita el centro de noche.', 'Rumbles/Scopolamine: el mayor riesgo en Colombia. No aceptes cigarrillos, dulces ni bebidas de extraños.'],
  },
  'Argentina': {
    emergency_general: '911/101/107', police: '101', ambulance: '107', fire: '100',
    embassy_ES: 'Embajada de España en Buenos Aires: +54 11 4819 3000',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'Disponible pero con restricciones. Cabify es más fiable.' },
      { name: 'Cabify', icon: '🚗', description: 'Más usado que Uber en Argentina.' },
    ],
    safety_tips: ['Buenos Aires relativamente segura. Cuidado con "sauceo" (distracción + robo).', 'Cambio de divisas: solo en casas de cambio oficiales. Los "arbolitos" son ilegales.', 'Patagonia: clima extremadamente cambiante. Equipo técnico indispensable.'],
  },
  'Chile': {
    emergency_general: '133/131/132', police: '133', ambulance: '131', fire: '132',
    embassy_ES: 'Embajada de España en Santiago: +56 2 2235 2755',
    useful_apps: [
      { name: 'Cabify', icon: '🚗', description: 'Fiable en Santiago.' },
      { name: 'SafeTrip SENAPRED', icon: '🌋', description: 'Alertas de desastres naturales (terremotos, tsunamis, volcanes).' },
    ],
    safety_tips: ['País sísmico: aprende el protocolo de terremotos.', 'Santiago: cuidado con arrebatos de móvil en zonas concurridas. Taxis oficiales llevan taxímetro.', 'Torres del Paine: condiciones climatológicas extremas. Lleva equipo técnico y avisa de tu ruta.'],
  },
  'Perú': {
    emergency_general: '105/106/116', police: '105', ambulance: '106', fire: '116',
    embassy_ES: 'Embajada de España en Lima: +51 1 212 1100',
    useful_apps: [
      { name: 'InDriver', icon: '🚗', description: 'Taxi por app. Mejor que taxis de calle en Lima.' },
      { name: 'Grab Peru', icon: '🚗', description: 'Alternativa a InDriver.' },
    ],
    safety_tips: ['Lima: barrios seguros son Miraflores, San Isidro, Barranco. Evita el Centro Histórico de noche.', 'Cusco: mal de altura (>3.400m) — descansa 24h antes de actividad intensa. Coca disponible.', 'Camino Inca: contrata operadora registrada. El trekking sin guía no está permitido.', 'Agua solo embotellada.'],
  },
  'Brasil': {
    emergency_general: '190/192/193', police: '190', ambulance: '192', fire: '193',
    embassy_ES: 'Embajada de España en Brasilia: +55 61 3061 0900. Consulado en São Paulo: +55 11 3372 2200',
    useful_apps: [
      { name: '99 (taxi)', icon: '🚗', description: 'App de taxi. Fiable en todo Brasil.' },
      { name: 'Uber', icon: '🚗', description: 'Muy usado en Brasil.' },
    ],
    safety_tips: ['Nunca exhibas joyas, móvil o cámara cara en la calle — especialmente en Río y São Paulo.', 'Río: favelas solo con tour guiado oficial. Nunca entres solo.', 'Playas de Río: no dejes objetos sin vigilancia. Los "arrastões" (robos colectivos) existen.', 'Vacuna amarilla recomendada para zona amazónica.'],
  },
  'Cuba': {
    emergency_general: '106/105', police: '106', ambulance: '104', fire: '105',
    embassy_ES: 'Embajada de España en La Habana: +53 7 866 8025',
    useful_apps: [],
    safety_tips: ['Internet muy limitado — VPN recomendada.', 'Dinero en efectivo imprescindible — tarjetas de crédito/débito de bancos europeos raramente funcionan.', 'Jineteros (vendedores ambulantes) muy insistentes en zonas turísticas. Un "no" firme es suficiente.', 'Nunca compres cosas en mercado negro (ron, habanos "de regalo") — puede ser timo.'],
  },
  'Uruguay': {
    emergency_general: '911', police: '911', ambulance: '105', fire: '104',
    embassy_ES: 'Embajada de España en Montevideo: +598 2 708 6010',
    useful_apps: [],
    safety_tips: ['País muy seguro en Latinoamérica. Montevideo: cuidado con robos en Ciudad Vieja y zona del Puerto de noche.', 'Punta del Este en temporada alta: precios muy elevados. Reserva con meses de antelación.'],
  },

  // ══ OTROS ═════════════════════════════════════════════════════════════════
  'Nueva Zelanda': {
    emergency_general: '111', police: '111', ambulance: '111', fire: '111',
    embassy_ES: 'Embajada de España en Wellington: +64 4 802 5665',
    useful_apps: [
      { name: 'MetService NZ', icon: '🌦️', description: 'Tiempo oficial de Nueva Zelanda. Cambia muy rápido.' },
      { name: 'GeoNet NZ', icon: '🌋', description: 'Alertas de terremotos y volcanes en Nueva Zelanda.' },
    ],
    safety_tips: ['País muy seguro. Mayor riesgo: naturaleza. Clima cambia en minutos, especialmente en Fiordland.', 'Alertas sísmicas: NZ es zona sísmica activa. GeoNet app imprescindible.', 'Ríos: corrientes muy fuertes. No cruces ríos a pie sin evaluarlos con un guía.'],
  },
  'Georgia': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Ankara cubre Georgia. Embajada de Polonia representa a España en Tiflis.',
    useful_apps: [
      { name: 'Bolt', icon: '🚗', description: 'Taxi por app. Muy usado en Georgia.' },
      { name: 'Yandex Go', icon: '🚗', description: 'Alternativa muy usada en Cáucaso.' },
    ],
    safety_tips: ['País muy seguro. Tiflis: cuidado de noche en Gldani y zonas periféricas.', 'Conducción caótica — usa siempre el cinturón.', 'Zona de Osetia del Sur y Abjasia: evitar completamente. Son territorios ocupados con acceso restringido.'],
  },
  'Canadá': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Ottawa: +1 613 747 2252',
    useful_apps: [
      { name: 'WeatherCAN', icon: '🌦️', description: 'App meteorológica oficial de Environment Canada.' },
      { name: 'Uber', icon: '🚗', description: 'Disponible en ciudades principales.' },
    ],
    safety_tips: ['País muy seguro. Cuidado con osos en zonas de senderismo (Parques Rocosas). Lleva spray antiosos.', 'Inviernos extremos: frostbite puede ocurrir en minutos con viento. Cúbrete siempre.', 'Conducción: calzado de invierno en ruedas obligatorio en ciertas provincias.'],
  },


};

/**
 * Obtiene datos de emergencia hardcodeados para un país.
 * Compatible con la interfaz que espera Utilities.jsx.
 */
export function getHardcodedEmergencyInfo(countryLabel, homeCountry = 'España', secondNationality = null) {
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

  // Seleccionar embajada según país de origen — cubre todos los hispanohablantes
  let embassy = null;
  const homeNorm = (homeCountry || 'España').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mapeo país origen → clave de embajada en orden de prioridad
  const embassyKey = (() => {
    if (homeNorm.includes('mexic'))   return ['embassy_MX', 'embassy_ES'];
    if (homeNorm.includes('argentin')) return ['embassy_AR', 'embassy_ES'];
    if (homeNorm.includes('colombi')) return ['embassy_CO', 'embassy_ES'];
    if (homeNorm.includes('peru') || homeNorm.includes('peru')) return ['embassy_PE', 'embassy_ES'];
    if (homeNorm.includes('chile'))   return ['embassy_CL', 'embassy_ES'];
    if (homeNorm.includes('venezuel')) return ['embassy_VE', 'embassy_ES'];
    if (homeNorm.includes('ecuad'))   return ['embassy_EC', 'embassy_ES'];
    if (homeNorm.includes('boliv'))   return ['embassy_BO', 'embassy_ES'];
    if (homeNorm.includes('paragua')) return ['embassy_PY', 'embassy_ES'];
    if (homeNorm.includes('urugua'))  return ['embassy_UY', 'embassy_ES'];
    if (homeNorm.includes('costa ric')) return ['embassy_CR', 'embassy_ES'];
    if (homeNorm.includes('guatemal')) return ['embassy_GT', 'embassy_ES'];
    if (homeNorm.includes('hondur'))  return ['embassy_HN', 'embassy_ES'];
    if (homeNorm.includes('el salv') || homeNorm.includes('salvador')) return ['embassy_SV', 'embassy_ES'];
    if (homeNorm.includes('nicarag'))  return ['embassy_NI', 'embassy_ES'];
    if (homeNorm.includes('panam'))   return ['embassy_PA', 'embassy_ES'];
    if (homeNorm.includes('rep.*dom') || homeNorm.includes('dominican')) return ['embassy_DO', 'embassy_ES'];
    if (homeNorm.includes('cuba'))    return ['embassy_CU', 'embassy_ES'];
    if (homeNorm.includes('puert'))   return ['embassy_PR', 'embassy_ES'];
    if (homeNorm.includes('espana') || homeNorm.includes('espana') || homeNorm.includes('spain')) return ['embassy_ES'];
    return ['embassy_ES']; // fallback España
  })();

  for (const key of embassyKey) {
    if (data[key]) { embassy = data[key]; break; }
  }

  // Second nationality embassy — shown as alternative in Emergencies
  let secondEmbassy = null;
  if (secondNationality && secondNationality !== homeCountry) {
    const sNorm = (secondNationality).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const keys2 = (() => {
      if (sNorm.includes('espana') || sNorm.includes('spain')) return ['embassy_ES'];
      if (sNorm.includes('franc') || sNorm.includes('france')) return ['embassy_FR', 'embassy_ES'];
      if (sNorm.includes('aleman') || sNorm.includes('german') || sNorm.includes('deutsch')) return ['embassy_DE', 'embassy_ES'];
      if (sNorm.includes('ital'))   return ['embassy_IT', 'embassy_ES'];
      if (sNorm.includes('portug')) return ['embassy_PT', 'embassy_ES'];
      if (sNorm.includes('brasil') || sNorm.includes('brazil')) return ['embassy_BR', 'embassy_ES'];
      if (sNorm.includes('mexic'))   return ['embassy_MX', 'embassy_ES'];
      if (sNorm.includes('argentin')) return ['embassy_AR', 'embassy_ES'];
      if (sNorm.includes('colombi')) return ['embassy_CO', 'embassy_ES'];
      if (sNorm.includes('peru'))    return ['embassy_PE', 'embassy_ES'];
      if (sNorm.includes('chile'))   return ['embassy_CL', 'embassy_ES'];
      if (sNorm.includes('venezuel')) return ['embassy_VE', 'embassy_ES'];
      if (sNorm.includes('ecuad'))  return ['embassy_EC', 'embassy_ES'];
      if (sNorm.includes('reino unido') || sNorm.includes('united kingdom') || sNorm.includes('britain')) return ['embassy_GB', 'embassy_ES'];
      if (sNorm.includes('estados unidos') || sNorm.includes('united states')) return ['embassy_US', 'embassy_ES'];
      return ['embassy_ES'];
    })();
    for (const key of keys2) {
      if (data[key]) { secondEmbassy = data[key]; break; }
    }
  }

  return {
    emergency_general: data.emergency_general,
    police: data.police,
    ambulance: data.ambulance,
    fire: data.fire,
    embassy,
    secondEmbassy,
    useful_apps: data.useful_apps || [],
    safety_tips: data.safety_tips || [],
  };
}