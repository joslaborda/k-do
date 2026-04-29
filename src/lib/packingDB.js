// ── Country Requirements ──────────────────────────────────────────────────────
// Requisitos de viaje por país: visado, adaptador eléctrico, vacunas, moneda, tips

export const COUNTRY_REQUIREMENTS = {
  japan: {
    name: 'Japón',
    aliases: ['japan', 'japón', 'japon', 'jp'],
    visa: { required: false, notes: 'Españoles: hasta 90 días sin visado' },
    adapter: { type: 'Tipo A/B', notes: '100V / 60Hz — lleva adaptador, el voltaje es diferente al europeo' },
    vaccines: ['Ninguna obligatoria', 'Recomendada: Hepatitis A/B', 'COVID-19 actualizada'],
    currency: { code: 'JPY', symbol: '¥', tip: 'El efectivo es rey. Retira yenes en 7-Eleven o Japan Post ATMs.' },
    tips: [
      'Lleva tarjetas de visita si vas por negocios',
      'Usa IC Card (Suica/Pasmo) para transporte',
      'Prohibido fumar salvo en zonas habilitadas',
      'Propinas no se dan — es de mala educación',
    ],
    weather_type: 'temperate',
  },
  thailand: {
    name: 'Tailandia',
    aliases: ['thailand', 'tailandia', 'th'],
    visa: { required: false, notes: 'Españoles: hasta 30 días sin visado' },
    adapter: { type: 'Tipo A/B/C', notes: '220V — adaptador universal recomendado' },
    vaccines: ['Hepatitis A', 'Fiebre tifoidea', 'Malaria (zonas rurales)'],
    currency: { code: 'THB', symbol: '฿', tip: 'Cambia divisas en casas de cambio locales, mejoran los rates.' },
    tips: [
      'Cubre hombros y rodillas para entrar a templos',
      'Regatear es habitual en mercados',
      'No toques la cabeza de nadie',
      'Irrespetar la monarquía es delito',
    ],
    weather_type: 'tropical',
  },
  usa: {
    name: 'Estados Unidos',
    aliases: ['usa', 'us', 'estados unidos', 'united states', 'eeuu'],
    visa: { required: false, notes: 'ESTA obligatorio — solicítalo con al menos 72h antes (21 USD)' },
    adapter: { type: 'Tipo A/B', notes: '120V / 60Hz — el cargador de tu portátil suele ser compatible' },
    vaccines: ['Ninguna obligatoria'],
    currency: { code: 'USD', symbol: '$', tip: 'Propinas del 15-20% en restaurantes son obligatorias culturalmente.' },
    tips: [
      'Seguro médico imprescindible — la sanidad es muy cara',
      'Propinas en taxis, hoteles y restaurantes',
      'Edad mínima para beber: 21 años',
      'Impuestos NO incluidos en los precios',
    ],
    weather_type: 'varies',
  },
  uk: {
    name: 'Reino Unido',
    aliases: ['uk', 'reino unido', 'united kingdom', 'england', 'inglaterra', 'gb'],
    visa: { required: false, notes: 'Post-Brexit: ETA obligatorio desde 2024 (aprox 10 GBP)' },
    adapter: { type: 'Tipo G', notes: '230V / 50Hz — adaptador de 3 clavijas necesario' },
    vaccines: ['Ninguna obligatoria'],
    currency: { code: 'GBP', symbol: '£', tip: 'Contactless aceptado casi en todas partes.' },
    tips: [
      'Conducen por la izquierda',
      'El tiempo cambia rápido — lleva impermeable',
      'Propinas del 10-15% en restaurantes',
      'Tarjetas de crédito muy aceptadas',
    ],
    weather_type: 'cold_wet',
  },
  france: {
    name: 'Francia',
    aliases: ['france', 'francia', 'fr'],
    visa: { required: false, notes: 'Zona Schengen — DNI suficiente para españoles' },
    adapter: { type: 'Tipo C/E', notes: '230V / 50Hz — compatible con enchufes españoles' },
    vaccines: ['Ninguna obligatoria'],
    currency: { code: 'EUR', symbol: '€', tip: 'Euro. Sin cambio de divisa.' },
    tips: [
      'Intenta saludar en francés — es muy valorado',
      'Muchas tiendas cierran los domingos',
      'Propinas no obligatorias pero apreciadas',
    ],
    weather_type: 'temperate',
  },
  italy: {
    name: 'Italia',
    aliases: ['italy', 'italia', 'it'],
    visa: { required: false, notes: 'Zona Schengen — DNI suficiente para españoles' },
    adapter: { type: 'Tipo C/L', notes: '230V / 50Hz — tipo L italiano puede requerir adaptador' },
    vaccines: ['Ninguna obligatoria'],
    currency: { code: 'EUR', symbol: '€', tip: 'Euro. Muchos negocios pequeños solo efectivo.' },
    tips: [
      'Cubre brazos y piernas para entrar a iglesias',
      'El coperto (cubierto) se cobra en restaurantes',
      'Agua del grifo potable en la mayoría de ciudades',
    ],
    weather_type: 'mediterranean',
  },
  mexico: {
    name: 'México',
    aliases: ['mexico', 'méxico', 'mx'],
    visa: { required: false, notes: 'Españoles: hasta 180 días sin visado' },
    adapter: { type: 'Tipo A/B', notes: '127V / 60Hz — adaptador recomendado' },
    vaccines: ['Hepatitis A', 'Fiebre tifoidea', 'COVID-19 actualizada'],
    currency: { code: 'MXN', symbol: '$', tip: 'Pesos mexicanos. Cambia en casas de cambio, evita el aeropuerto.' },
    tips: [
      'No bebas agua del grifo',
      'Negocia en mercados tradicionales',
      'Propinas del 10-15%',
      'Lleva protector solar factor alto',
    ],
    weather_type: 'tropical',
  },
  morocco: {
    name: 'Marruecos',
    aliases: ['morocco', 'marruecos', 'maroc', 'ma'],
    visa: { required: false, notes: 'Españoles: hasta 90 días sin visado' },
    adapter: { type: 'Tipo C/E', notes: '220V / 50Hz — compatible con enchufes europeos' },
    vaccines: ['Hepatitis A', 'Fiebre tifoidea', 'Rabia (zonas rurales)'],
    currency: { code: 'MAD', symbol: 'د.م.', tip: 'Dírham. No se puede sacar fuera del país — cambia lo justo.' },
    tips: [
      'Regatear es obligatorio en zocos',
      'Viste con ropa respetuosa, especialmente en zonas rurales',
      'No bebas agua del grifo',
      'Ramadán: respeta las normas locales si coincide',
    ],
    weather_type: 'desert',
  },
  turkey: {
    name: 'Turquía',
    aliases: ['turkey', 'turquía', 'turkiye', 'tr'],
    visa: { required: false, notes: 'Españoles: hasta 90 días sin visado (e-Visa disponible)' },
    adapter: { type: 'Tipo C/F', notes: '220V / 50Hz — compatible con enchufes europeos' },
    vaccines: ['Ninguna obligatoria', 'Hepatitis A recomendada'],
    currency: { code: 'TRY', symbol: '₺', tip: 'Lira turca. Cambia en bancos o cajeros locales.' },
    tips: [
      'Cubre cabeza y hombros en mezquitas',
      'Regatear en mercados es habitual',
      'Beber alcohol está permitido pero con restricciones',
    ],
    weather_type: 'mediterranean',
  },
  indonesia: {
    name: 'Indonesia / Bali',
    aliases: ['indonesia', 'bali', 'id'],
    visa: { required: true, notes: 'Visa on Arrival disponible (500.000 IDR aprox)' },
    adapter: { type: 'Tipo C/F', notes: '230V / 50Hz — compatible con enchufes europeos' },
    vaccines: ['Hepatitis A', 'Fiebre tifoidea', 'Rabia', 'Malaria (algunas islas)'],
    currency: { code: 'IDR', symbol: 'Rp', tip: 'Rupias indonesias. Mucho efectivo en zonas menos turísticas.' },
    tips: [
      'No bebas agua del grifo',
      'Respeta los rituales y templos',
      'Cubre hombros y usa sarong en templos',
      'Cuidado con las motos de alquiler',
    ],
    weather_type: 'tropical',
  },
  default: {
    name: 'Internacional',
    aliases: [],
    visa: { required: null, notes: 'Consulta los requisitos de visado en la web del Ministerio de Exteriores' },
    adapter: { type: 'Universal', notes: 'Lleva un adaptador universal' },
    vaccines: ['Consulta con tu médico según el destino'],
    currency: { code: '—', symbol: '—', tip: 'Investiga la moneda local antes de viajar' },
    tips: [
      'Lleva seguro de viaje',
      'Copia de documentos en la nube',
      'Comparte tu itinerario con alguien de confianza',
    ],
    weather_type: 'varies',
  },
};

// ── Helper: match country ─────────────────────────────────────────────────────
function matchCountry(country) {
  if (!country) return COUNTRY_REQUIREMENTS.default;
  const normalized = country.toLowerCase().trim();
  for (const [key, data] of Object.entries(COUNTRY_REQUIREMENTS)) {
    if (key === 'default') continue;
    if (data.aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return data;
    }
  }
  return COUNTRY_REQUIREMENTS.default;
}

// ── Packing templates by weather / destination type ───────────────────────────
const BASE_ITEMS = [
  // Documentos
  { name: 'Pasaporte / DNI', category: 'personal', quantity: 1 },
  { name: 'Fotocopia documentos (papel)', category: 'personal', quantity: 1 },
  { name: 'Seguro de viaje', category: 'personal', quantity: 1 },
  { name: 'Tarjetas de crédito / débito', category: 'personal', quantity: 2 },
  { name: 'Efectivo local', category: 'personal', quantity: 1 },

  // Tecnología
  { name: 'Cargador del móvil', category: 'tecnologia', quantity: 1 },
  { name: 'Batería externa (powerbank)', category: 'tecnologia', quantity: 1 },
  { name: 'Auriculares', category: 'tecnologia', quantity: 1 },
  { name: 'Adaptador de enchufe', category: 'tecnologia', quantity: 1 },

  // Neceser base
  { name: 'Cepillo + pasta de dientes', category: 'neceser', quantity: 1 },
  { name: 'Champú y gel (formato viaje)', category: 'neceser', quantity: 1 },
  { name: 'Desodorante', category: 'neceser', quantity: 1 },
  { name: 'Crema hidratante', category: 'neceser', quantity: 1 },
  { name: 'Afeitadora / depiladora', category: 'neceser', quantity: 1 },

  // Medicinas
  { name: 'Ibuprofeno / paracetamol', category: 'medicinas', quantity: 1 },
  { name: 'Tiritas y gasas', category: 'medicinas', quantity: 1 },
  { name: 'Medicación personal', category: 'medicinas', quantity: 1 },
  { name: 'Antihistamínico', category: 'medicinas', quantity: 1 },

  // Ropa base
  { name: 'Ropa interior', category: 'ropa', quantity: 7 },
  { name: 'Calcetines', category: 'ropa', quantity: 7 },
  { name: 'Camisetas', category: 'ropa', quantity: 5 },
  { name: 'Pantalón vaquero o largo', category: 'ropa', quantity: 2 },
  { name: 'Pijama', category: 'ropa', quantity: 1 },
];

const ITEMS_BY_WEATHER = {
  tropical: [
    { name: 'Protector solar FPS 50+', category: 'neceser', quantity: 2 },
    { name: 'Repelente de mosquitos', category: 'neceser', quantity: 1 },
    { name: 'Ropa ligera / transpirable', category: 'ropa', quantity: 3 },
    { name: 'Bañador', category: 'ropa', quantity: 2 },
    { name: 'Chanclas', category: 'ropa', quantity: 1 },
    { name: 'Sandalias', category: 'ropa', quantity: 1 },
    { name: 'Sombrero / gorra', category: 'ropa', quantity: 1 },
    { name: 'Pastillas de purificación de agua', category: 'medicinas', quantity: 1 },
    { name: 'Antidiarreico', category: 'medicinas', quantity: 1 },
  ],
  temperate: [
    { name: 'Chaqueta ligera', category: 'ropa', quantity: 1 },
    { name: 'Jersey / sudadera', category: 'ropa', quantity: 2 },
    { name: 'Paraguas compacto', category: 'ropa', quantity: 1 },
    { name: 'Zapatillas cómodas para caminar', category: 'ropa', quantity: 1 },
    { name: 'Protector solar FPS 30', category: 'neceser', quantity: 1 },
  ],
  cold_wet: [
    { name: 'Abrigo o chaqueta impermeable', category: 'ropa', quantity: 1 },
    { name: 'Jersey grueso / polar', category: 'ropa', quantity: 2 },
    { name: 'Paraguas resistente', category: 'ropa', quantity: 1 },
    { name: 'Botas impermeables', category: 'ropa', quantity: 1 },
    { name: 'Bufanda', category: 'ropa', quantity: 1 },
    { name: 'Guantes', category: 'ropa', quantity: 1 },
    { name: 'Gorro de lana', category: 'ropa', quantity: 1 },
    { name: 'Calcetines térmicos', category: 'ropa', quantity: 3 },
  ],
  mediterranean: [
    { name: 'Protector solar FPS 30', category: 'neceser', quantity: 1 },
    { name: 'Ropa ligera de verano', category: 'ropa', quantity: 3 },
    { name: 'Chaqueta fina para noches', category: 'ropa', quantity: 1 },
    { name: 'Sandalias', category: 'ropa', quantity: 1 },
    { name: 'Gafas de sol', category: 'ropa', quantity: 1 },
    { name: 'Sombrero', category: 'ropa', quantity: 1 },
  ],
  desert: [
    { name: 'Protector solar FPS 50+', category: 'neceser', quantity: 2 },
    { name: 'Repelente de mosquitos', category: 'neceser', quantity: 1 },
    { name: 'Ropa ligera y de colores claros', category: 'ropa', quantity: 4 },
    { name: 'Ropa de abrigo para noches (frío del desierto)', category: 'ropa', quantity: 1 },
    { name: 'Pañuelo / kufiya para el polvo', category: 'ropa', quantity: 1 },
    { name: 'Sombrero de ala ancha', category: 'ropa', quantity: 1 },
    { name: 'Botella de agua reutilizable', category: 'personal', quantity: 1 },
  ],
  varies: [
    { name: 'Chaqueta polivalente', category: 'ropa', quantity: 1 },
    { name: 'Paraguas compacto', category: 'ropa', quantity: 1 },
    { name: 'Protector solar FPS 30', category: 'neceser', quantity: 1 },
    { name: 'Gafas de sol', category: 'ropa', quantity: 1 },
  ],
};

const JAPAN_SPECIFIC = [
  { name: 'Bolsas de plástico pequeñas (para basura — no hay papeleras)', category: 'personal', quantity: 3 },
  { name: 'Tarjeta Suica / Pasmo (transporte)', category: 'personal', quantity: 1 },
  { name: 'Mascarilla (habitual en transporte público)', category: 'neceser', quantity: 5 },
  { name: 'Toallitas húmedas', category: 'neceser', quantity: 2 },
  { name: 'Zapatillas de estar por casa (ryokans)', category: 'ropa', quantity: 1 },
];

const BEACH_ITEMS = [
  { name: 'Bañador extra', category: 'ropa', quantity: 1 },
  { name: 'Toalla de microfibra', category: 'ropa', quantity: 1 },
  { name: 'Chanclas de agua', category: 'ropa', quantity: 1 },
  { name: 'After-sun', category: 'neceser', quantity: 1 },
];

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Returns a smart packing list based on the destination country.
 * @param {string} country - Country name or code
 * @param {object} options - Optional { includeBeach: boolean, durationDays: number }
 * @returns {Array} Array of packing items { name, category, quantity, packed: false }
 */
export function getSmartPackingList(country, options = {}) {
  const { includeBeach = false, durationDays = 7 } = options;
  const countryData = matchCountry(country);
  const weatherType = countryData.weather_type || 'varies';

  // Scale quantities with trip duration
  const scale = durationDays > 14 ? 1.5 : durationDays > 7 ? 1.2 : 1;

  const base = BASE_ITEMS.map(item => ({
    ...item,
    quantity: item.category === 'ropa' ? Math.min(Math.ceil(item.quantity * scale), 10) : item.quantity,
    packed: false,
  }));

  const weatherItems = (ITEMS_BY_WEATHER[weatherType] || ITEMS_BY_WEATHER.varies).map(item => ({
    ...item,
    packed: false,
  }));

  let extra = [];

  // Japan-specific items
  if (['japan'].includes(countryData.name?.toLowerCase()) ||
      countryData.aliases?.includes('japan') || countryData.aliases?.includes('japón')) {
    extra = [...extra, ...JAPAN_SPECIFIC.map(i => ({ ...i, packed: false }))];
  }

  // Tropical/beach countries get beach items
  if (includeBeach || weatherType === 'tropical') {
    extra = [...extra, ...BEACH_ITEMS.map(i => ({ ...i, packed: false }))];
  }

  // Merge — avoid duplicates by name
  const all = [...base, ...weatherItems, ...extra];
  const seen = new Set();
  return all.filter(item => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get country requirements for a given country name/code.
 * @param {string} country
 * @returns {object} Country requirements object
 */
export function getCountryRequirements(country) {
  return matchCountry(country);
}