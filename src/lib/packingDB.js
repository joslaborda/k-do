/**
 * packingDB.js — Sugerencias inteligentes de equipaje por destino
 * Basado en: país destino, tipo de viaje, clima esperado
 */

// Requisitos por país: visado, adaptador, vacunas, moneda
export const COUNTRY_REQUIREMENTS = {
  'Japón': {
    visa: { needed: false, info: 'Los ciudadanos de la UE y España no necesitan visado para estancias de hasta 90 días.' },
    adapter: { needed: true, type: 'Tipo A/B', info: 'Los enchufes japoneses son de tipo A (dos clavijas planas). Necesitarás adaptador.' },
    currency: { info: 'El yen japonés (JPY) se usa en efectivo con frecuencia. Muchos locales no aceptan tarjeta.' },
    vaccines: [],
    tips: ['Descarga Google Maps offline antes de llegar.', 'Compra una SIM de datos o alquila un pocket WiFi en el aeropuerto.', 'Lleva tarjeta IC (Suica/Pasmo) para el transporte.'],
    emergency: '110 (policía) · 119 (ambulancia/bomberos)',
  },
  'Tailandia': {
    visa: { needed: false, info: 'España: sin visado hasta 30 días. México/Colombia: verificar en consulado.' },
    adapter: { needed: true, type: 'Tipo A/B/C', info: 'Tipo A y C más comunes. Lleva un adaptador universal.' },
    currency: { info: 'El baht tailandés (THB). Lleva efectivo — los cajeros cobran comisión alta.' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    tips: ['Compra SIM en el aeropuerto. AIS y DTAC son las mejores.', 'Usa Grab (como Uber) en lugar de taxis para evitar estafas.'],
    emergency: '191 (policía) · 1669 (ambulancia)',
  },
  'Francia': {
    visa: { needed: false, info: 'Espacio Schengen — libre circulación para ciudadanos de la UE.' },
    adapter: { needed: false, info: 'Mismo tipo de enchufe que España (tipo C/F).' },
    currency: { info: 'Euro. Tarjetas aceptadas en casi todos los sitios.' },
    vaccines: [],
    tips: ['El tren (TGV) conecta las ciudades principales muy rápido.', 'La mayoría de museos en París tienen día gratuito.'],
    emergency: '112 (emergencias) · 17 (policía) · 15 (SAMU)',
  },
  'Italia': {
    visa: { needed: false, info: 'Espacio Schengen — libre circulación.' },
    adapter: { needed: false, info: 'Tipo C/F — igual que España.' },
    currency: { info: 'Euro. En zonas turísticas muy populares lleva algo de efectivo.' },
    vaccines: [],
    tips: ['Reserva museos como el Vaticano o la Uffizi con antelación.', 'Valida siempre el billete de tren antes de subir.'],
    emergency: '112 · 118 (ambulancia) · 113 (policía)',
  },
  'Portugal': {
    visa: { needed: false, info: 'Schengen — libre circulación.' },
    adapter: { needed: false, info: 'Tipo C/F — igual que España.' },
    currency: { info: 'Euro.' },
    vaccines: [],
    tips: ['Las zonas de Lisboa tienen tranvías históricos muy concurridos. Cuidado con carteristas.'],
    emergency: '112',
  },
  'México': {
    visa: { needed: false, info: 'Sin visado para ciudadanos europeos hasta 180 días.' },
    adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes de tipo A/B (clavijas planas). Los europeos necesitan adaptador.' },
    currency: { info: 'Peso mexicano (MXN). Efectivo necesario en mercados y zonas más rurales.' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    tips: ['Usa Uber en ciudades grandes — más seguro que taxis de calle.', 'No bebas agua del grifo.'],
    emergency: '911',
  },
  'Colombia': {
    visa: { needed: false, info: 'Sin visado para europeos y muchos latinoamericanos.' },
    adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas planas americanas. Los europeos necesitan adaptador.' },
    currency: { info: 'Peso colombiano (COP). Lleva efectivo para zonas fuera de centros urbanos.' },
    vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada (zonas selváticas)' }],
    tips: ['Usa apps como InDriver o Uber para taxis.', 'Registra tu seguro de viaje antes de salir.'],
    emergency: '123',
  },
  'Argentina': {
    visa: { needed: false, info: 'Sin visado para europeos y latinoamericanos.' },
    adapter: { needed: true, type: 'Tipo I', info: 'Argentina usa tipo I (tres clavijas en triángulo). Adaptador necesario.' },
    currency: { info: 'Peso argentino (ARS). La economía es compleja — infórmate del cambio oficial vs informal.' },
    vaccines: [],
    tips: ['Buenos Aires es enorme — usa el metro (Subte) o apps de transporte.'],
    emergency: '911',
  },
  'Estados Unidos': {
    visa: { needed: true, info: 'ESTA requerido para europeos (visa exenta). Tramítalo en advance.travel.state.gov. Coste: 21 USD.' },
    adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas planas. Los europeos necesitan adaptador.' },
    currency: { info: 'Dólar (USD). Tarjeta aceptada en prácticamente todo.' },
    vaccines: [],
    tips: ['Contrata seguro médico — la sanidad es muy cara.', 'Propina del 15-20% es obligatoria socialmente.'],
    emergency: '911',
  },
  'Marruecos': {
    visa: { needed: false, info: 'Sin visado para europeos y ciudadanos de muchos países latinoamericanos.' },
    adapter: { needed: false, info: 'Tipo C/E — compatible con enchufes españoles.' },
    currency: { info: 'Dírham marroquí (MAD). No se puede sacar del país. Efectivo necesario en zocos.' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    tips: ['Negocia precios en zocos — el primer precio nunca es el final.', 'No bebas agua del grifo.'],
    emergency: '190 (policía) · 150 (ambulancia)',
  },
};

// Plantillas de items por categoría y tipo de viaje
export const PACKING_TEMPLATES = {
  base: [
    // Personal
    { name: 'Pasaporte', category: 'personal', essential: true },
    { name: 'DNI', category: 'personal', essential: true },
    { name: 'Tarjeta de crédito/débito', category: 'personal', essential: true },
    { name: 'Seguro de viaje', category: 'personal', essential: true },
    { name: 'Copia de reservas (hotel, vuelo)', category: 'personal', essential: true },
    { name: 'Efectivo en moneda local', category: 'personal', essential: true },
    { name: 'Cargador del móvil', category: 'tecnologia', essential: true },
    { name: 'Auriculares', category: 'tecnologia', essential: false },
    { name: 'Power bank', category: 'tecnologia', essential: false },
    // Neceser base
    { name: 'Cepillo y pasta de dientes', category: 'neceser', essential: true },
    { name: 'Desodorante', category: 'neceser', essential: true },
    { name: 'Champú y gel', category: 'neceser', essential: true },
    { name: 'Protector solar', category: 'neceser', essential: true },
    { name: 'Medicación habitual', category: 'medicinas', essential: true },
    { name: 'Ibuprofeno / Paracetamol', category: 'medicinas', essential: true },
    { name: 'Antidiarreico', category: 'medicinas', essential: false },
    { name: 'Tiritas y antiséptico', category: 'medicinas', essential: false },
    // Ropa base
    { name: 'Ropa interior (x días)', category: 'ropa', essential: true },
    { name: 'Calcetines (x días)', category: 'ropa', essential: true },
    { name: 'Camisetas', category: 'ropa', essential: true },
    { name: 'Pantalones/faldas', category: 'ropa', essential: true },
  ],
  adapter: [
    { name: 'Adaptador de enchufe', category: 'tecnologia', essential: true },
  ],
  warm: [
    { name: 'Gafas de sol', category: 'neceser', essential: true },
    { name: 'Bañador', category: 'ropa', essential: true },
    { name: 'Chanclas', category: 'ropa', essential: true },
    { name: 'Ropa ligera', category: 'ropa', essential: true },
  ],
  cold: [
    { name: 'Abrigo', category: 'ropa', essential: true },
    { name: 'Bufanda y guantes', category: 'ropa', essential: true },
    { name: 'Ropa térmica interior', category: 'ropa', essential: false },
    { name: 'Botas de agua', category: 'ropa', essential: false },
  ],
  asia: [
    { name: 'Repelente de mosquitos', category: 'neceser', essential: true },
    { name: 'Pastillas potabilizadoras', category: 'medicinas', essential: false },
    { name: 'Medicación antidiarreica extra', category: 'medicinas', essential: true },
  ],
  japan_specific: [
    { name: 'Tarjeta IC Suica/Pasmo', category: 'personal', essential: true },
    { name: 'Efectivo en yenes', category: 'personal', essential: true },
    { name: 'SIM de datos / Pocket WiFi', category: 'tecnologia', essential: true },
  ],
};

export function getSmartPackingList(country) {
  const req = COUNTRY_REQUIREMENTS[country] || null;
  const items = [...PACKING_TEMPLATES.base];

  if (req?.adapter?.needed) {
    items.push(...PACKING_TEMPLATES.adapter);
  }

  // Asia items
  const asiaCountries = ['Japón', 'Tailandia', 'Vietnam', 'India', 'Indonesia', 'China', 'Corea del Sur'];
  if (asiaCountries.includes(country)) {
    items.push(...PACKING_TEMPLATES.asia);
  }
  if (country === 'Japón') {
    items.push(...PACKING_TEMPLATES.japan_specific);
  }

  return { items: removeDuplicates(items), requirements: req };
}

function removeDuplicates(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}