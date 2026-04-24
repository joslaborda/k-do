/**
 * emergencyDB.js — Base de datos de emergencias hardcodeada por país
 * Estructura por país: { emergency_general, police, ambulance, fire, embassy, useful_apps, safety_tips }
 */

const EMERGENCY_DB = {
  'Japón': {
    emergency_general: '110/119',
    police: '110',
    ambulance: '119',
    fire: '119',
    embassy: {
      address: 'Chiyoda-ku, Tokyo 102-8381',
      phone: '+81-3-3580-3801',
      hours: 'Lun–Vie 9:00–13:00 y 14:00–17:30',
      web: 'https://www.exteriores.gob.es/Embajadas/tokio/',
    },
    useful_apps: [
      { icon: '🗺️', name: 'Google Maps', description: 'Navegación y transporte público en japonés y español.' },
      { icon: '🚇', name: 'Hyperdia / Navitime', description: 'Planificación de rutas en tren y Shinkansen.' },
      { icon: '💊', name: 'YakuYaku', description: 'Traduce medicamentos y prospectos al español.' },
      { icon: '💬', name: 'Google Translate', description: 'Imprescindible con cámara para leer menús y carteles.' },
    ],
    safety_tips: [
      'Japón es uno de los países más seguros del mundo — la tasa de criminalidad es muy baja.',
      'Los terremotos son frecuentes. Descarga la app Safety Tips del gobierno japonés.',
      'Guarda siempre tu pasaporte encima (ley obliga a extranjeros a llevarlo).',
      'Las ambulancias son gratuitas, pero el hospital puede ser caro sin seguro.',
      'No propinas — en Japón puede considerarse una ofensa.',
    ],
  },

  'Italia': {
    emergency_general: '112',
    police: '113',
    ambulance: '118',
    fire: '115',
    embassy: {
      address: 'Palazzo Borghese, Largo della Fontanella di Borghese 19, Roma',
      phone: '+39-06-6840-01',
      hours: 'Lun–Vie 9:00–13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/roma/',
    },
    useful_apps: [
      { icon: '🚌', name: 'Moovit', description: 'Transporte público en todas las ciudades italianas.' },
      { icon: '🚂', name: 'Trenitalia / Italo', description: 'Reserva de trenes de alta velocidad.' },
      { icon: '🍕', name: 'TheFork', description: 'Reservas en restaurantes con descuentos.' },
    ],
    safety_tips: [
      'Cuidado con carteristas en zonas turísticas como el Coliseo, Trevi y el Vaticano.',
      'Los taxistas no autorizados en aeropuertos pueden cobrarte el doble. Usa taxis oficiales.',
      'Evita llevar bolsos en bandolera en zonas muy concurridas.',
      'Guarda fotocopias del pasaporte separadas del original.',
    ],
  },

  'Francia': {
    emergency_general: '112',
    police: '17',
    ambulance: '15',
    fire: '18',
    embassy: {
      address: '22, Avenue Marceau, 75008 París',
      phone: '+33-1-44-43-18-00',
      hours: 'Lun–Vie 9:00–14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/paris/',
    },
    useful_apps: [
      { icon: '🚇', name: 'RATP', description: 'Metro, bus y RER en París.' },
      { icon: '🚂', name: 'SNCF Connect', description: 'Trenes en toda Francia.' },
      { icon: '🚲', name: 'Vélib / Lime', description: 'Bicicletas y patinetes en París.' },
    ],
    safety_tips: [
      'Atención a carteristas en el metro de París, especialmente líneas 1 y 4.',
      'Beber agua del grifo es seguro en toda Francia.',
      'Llevar siempre el documento de identidad — la policía puede pedirlo.',
    ],
  },

  'Tailandia': {
    emergency_general: '191',
    police: '191',
    ambulance: '1669',
    fire: '199',
    embassy: {
      address: '23 Phetburi Road, Bangkok 10400',
      phone: '+66-2-252-6112',
      hours: 'Lun–Vie 8:30–12:00 y 13:30–16:00',
      web: 'https://www.exteriores.gob.es/Embajadas/bangkok/',
    },
    useful_apps: [
      { icon: '🛺', name: 'Grab', description: 'Taxi y moto-taxi en toda Tailandia, precio fijo.' },
      { icon: '🗺️', name: 'Google Maps', description: 'Transporte y lugares en tailandés.' },
      { icon: '💊', name: 'BNH Hospital App', description: 'Hospital con atención en español en Bangkok.' },
    ],
    safety_tips: [
      'No toques ni insultes imágenes del rey — es delito grave con cárcel.',
      'El sol tropical es intenso. Usa factor 50+ y recuerda hidratarte.',
      'Los tuk-tuks negocian precio antes de subir. Acuerda siempre el precio.',
      'No compres tours desde la calle — usa agencias o tu hotel.',
      'Cuidado con las "gemas baratas" — es la estafa más común en Bangkok.',
    ],
  },

  'Vietnam': {
    emergency_general: '113',
    police: '113',
    ambulance: '115',
    fire: '114',
    embassy: {
      address: '16 Le Phung Hieu, Hanói',
      phone: '+84-24-3823-5780',
      hours: 'Lun–Vie 8:30–12:00 y 14:00–16:30',
      web: 'https://www.exteriores.gob.es/Embajadas/hanoi/',
    },
    useful_apps: [
      { icon: '🛵', name: 'Grab', description: 'Moto-taxi y coche con precio fijo. Imprescindible.' },
      { icon: '💱', name: 'XE Currency', description: 'Tipo de cambio del dong vietnamita en tiempo real.' },
      { icon: '🌐', name: 'VPN', description: 'Necesario para acceder a algunas apps en Vietnam.' },
    ],
    safety_tips: [
      'Guarda el dinero en diferentes lugares — carteristas en mercados de noche.',
      'Cruza la calle despacio y a paso constante — las motos te esquivarán.',
      'Bebe solo agua embotellada o hervida.',
      'Las motos de alquiler requieren carnet internacional — verifica tu seguro.',
    ],
  },

  'Marruecos': {
    emergency_general: '19',
    police: '19',
    ambulance: '15',
    fire: '15',
    embassy: {
      address: '3 Zankat Madnine, Rabat',
      phone: '+212-537-63-39-00',
      hours: 'Lun–Vie 9:00–13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/rabat/',
    },
    useful_apps: [
      { icon: '🚕', name: 'Careem / inDrive', description: 'Taxis con precio cerrado en las principales ciudades.' },
      { icon: '💱', name: 'XE Currency', description: 'Tipo de cambio del dírham en tiempo real.' },
      { icon: '🗺️', name: 'Maps.me', description: 'Mapas offline útiles en las medinas sin cobertura.' },
    ],
    safety_tips: [
      'Negocia el precio antes de usar taxis petit-taxi — no tienen taxímetro siempre.',
      'Las medinas pueden ser laberínticas — descarga un mapa offline.',
      'Respeta el Ramadán: no comer ni beber en la calle durante el día.',
      'Viste con moderación en zonas rurales y mezquitas.',
      'No fotographies personas sin permiso explícito.',
    ],
  },

  'Turquía': {
    emergency_general: '112',
    police: '155',
    ambulance: '112',
    fire: '110',
    embassy: {
      address: 'Tahran Caddesi No.45, Kavaklıdere, Ankara',
      phone: '+90-312-440-35-62',
      hours: 'Lun–Vie 9:00–13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/ankara/',
    },
    useful_apps: [
      { icon: '🚇', name: 'İstanbulkart', description: 'Transporte público integrado en Estambul.' },
      { icon: '🚕', name: 'BiTaksi', description: 'Taxis con taxímetro digital y precio estimado.' },
      { icon: '🗺️', name: 'Google Maps', description: 'Navegación y transporte en Turquía.' },
    ],
    safety_tips: [
      'Está prohibido fotografiar instalaciones militares, puertos y aeropuertos militares.',
      'El Bósforo tiene corrientes fuertes — nada solo en zonas habilitadas.',
      'Regatear en el Gran Bazar es normal y esperado.',
      'Las medinas de Estambul son muy seguras, pero cuidado con los "guías" no oficiales.',
    ],
  },

  'Grecia': {
    emergency_general: '112',
    police: '100',
    ambulance: '166',
    fire: '199',
    embassy: {
      address: 'Dionisiou Areopagitou 21, Atenas',
      phone: '+30-21-0345-6600',
      hours: 'Lun–Vie 9:00–14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/atenas/',
    },
    useful_apps: [
      { icon: '⛵', name: 'Ferryhopper', description: 'Ferrys entre islas griegas — compra con antelación.' },
      { icon: '🚌', name: 'OASA Telematics', description: 'Autobuses y metro en Atenas.' },
      { icon: '🏖️', name: 'Booking.com', description: 'Alojamiento en islas con mucha antelación en verano.' },
    ],
    safety_tips: [
      'El sol en las islas en julio-agosto es extremo. Hidratación y sombra obligatorias.',
      'Las tarjetas se aceptan en Atenas, pero en islas pequeñas llevar efectivo.',
      'Cuidado con las corrientes en algunas playas de las islas Cícladas.',
      'Los precios en Santorini y Mykonos son el doble que en el continente.',
    ],
  },

  'México': {
    emergency_general: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    embassy: {
      address: 'Galileo 114, Polanco, Ciudad de México',
      phone: '+52-55-5282-2974',
      hours: 'Lun–Vie 9:00–14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/mexico/',
    },
    useful_apps: [
      { icon: '🚕', name: 'Uber / DiDi', description: 'Siempre usa apps de transporte — no taxis de calle en CDMX.' },
      { icon: '🗺️', name: 'Google Maps', description: 'Transporte público y metro de CDMX.' },
      { icon: '💊', name: 'Farmacias del Ahorro', description: 'App para localizar farmacias abiertas 24h.' },
    ],
    safety_tips: [
      'Usa solo Uber/DiDi o taxis de sitio — los taxis de calle en CDMX pueden ser peligrosos.',
      'El agua del grifo no es potable en México. Solo agua embotellada.',
      'Cuidado con el "secuestro express" — no uses el móvil en la calle de noche.',
      'En Cancún y riviera Maya las zonas turísticas son seguras; sal con guía fuera de ellas.',
      'No lleves todo el efectivo junto — divide en diferentes bolsillos.',
    ],
  },

  'India': {
    emergency_general: '112',
    police: '100',
    ambulance: '108',
    fire: '101',
    embassy: {
      address: '12 Prithviraj Road, Nueva Delhi 110011',
      phone: '+91-11-4129-3000',
      hours: 'Lun–Vie 9:00–13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/nuevadelhi/',
    },
    useful_apps: [
      { icon: '🛺', name: 'Ola / Uber', description: 'Transporte seguro con precio fijo en todas las ciudades.' },
      { icon: '🚂', name: 'IRCTC Rail Connect', description: 'Reserva de trenes en India — reserva con semanas de antelación.' },
      { icon: '💊', name: 'PharmEasy', description: 'Localiza farmacias y medicamentos en India.' },
    ],
    safety_tips: [
      'Bebe solo agua embotellada con sello. Evita hielo en bebidas fuera de hoteles de confianza.',
      'La "Delhi Belly" es muy común — lleva medicación para diarrea del viajero.',
      'Usa siempre apps de taxi — los rikshaws deben negociar precio antes.',
      'Cubre hombros y rodillas en templos y zonas religiosas.',
      'No fotographies mujeres sin permiso explícito.',
    ],
  },

  'Portugal': {
    emergency_general: '112',
    police: '112',
    ambulance: '112',
    fire: '112',
    embassy: {
      address: 'Rua do Salitre 1, 1269-052 Lisboa',
      phone: '+351-213-472-381',
      hours: 'Lun–Vie 9:00–14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lisboa/',
    },
    useful_apps: [
      { icon: '🚇', name: 'Carris Metropolitana', description: 'Transporte público en Lisboa y área metropolitana.' },
      { icon: '🚂', name: 'CP Rail', description: 'Trenes nacionales en Portugal.' },
      { icon: '🛴', name: 'Bolt', description: 'Scooters, patinetes y taxis en Lisboa y Porto.' },
    ],
    safety_tips: [
      'Portugal es muy seguro. Atención normal a carteristas en el tram 28 de Lisboa.',
      'El agua del grifo es potable en todo el país.',
      'Conducir en Portugal: máximo 0,5 g/l de alcohol — más estricto en algunos tramos.',
    ],
  },

  'Corea del Sur': {
    emergency_general: '112',
    police: '112',
    ambulance: '119',
    fire: '119',
    embassy: {
      address: 'Hannam-daero 39, Yongsan-gu, Seúl',
      phone: '+82-2-794-3581',
      hours: 'Lun–Vie 9:00–13:00 y 14:30–17:30',
      web: 'https://www.exteriores.gob.es/Embajadas/seul/',
    },
    useful_apps: [
      { icon: '🚇', name: 'Kakao Metro', description: 'Metro de Seúl y otras ciudades coreanas.' },
      { icon: '🗺️', name: 'Naver Maps', description: 'Google Maps coreano — más preciso que Google en Corea.' },
      { icon: '🚕', name: 'Kakao T', description: 'Taxis con precio y conductor registrado.' },
    ],
    safety_tips: [
      'Corea del Sur es extraordinariamente seguro — crimen muy bajo.',
      'La T-money card sirve para metro, bus y taxis en todo el país.',
      'Muchos sitios solo aceptan efectivo en won — lleva siempre algo de cash.',
      'Descarga Naver Maps offline — Google Maps no funciona bien en Corea.',
    ],
  },
};

/**
 * Obtiene datos de emergencia para un país dado.
 * Busca primero por nombre exacto, luego case-insensitive normalizado.
 */
export function getHardcodedEmergencyInfo(countryLabel) {
  if (!countryLabel) return null;

  if (EMERGENCY_DB[countryLabel]) return EMERGENCY_DB[countryLabel];

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const key = Object.keys(EMERGENCY_DB).find(k => norm(k) === norm(countryLabel));
  if (key) return EMERGENCY_DB[key];

  return null;
}