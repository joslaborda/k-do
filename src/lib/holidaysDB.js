/**
 * holidaysDB.js
 * Base de datos de festivos nacionales por país.
 * Formato: { [countryCode]: { [YYYY-MM-DD]: 'Nombre del festivo' } }
 * Los festivos fijos se repiten cada año; los móviles (Semana Santa, etc.)
 * se calculan dinámicamente con funciones helper.
 */

// ── Easter (Gauss algorithm) ──────────────────────────────────────────────────
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmt(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── Fixed holidays by country (MM-DD → label) ─────────────────────────────────
const FIXED = {
  ES: {
    '01-01': 'Año Nuevo',
    '01-06': 'Reyes Magos',
    '05-01': 'Día del Trabajo',
    '08-15': 'Asunción de la Virgen',
    '10-12': 'Fiesta Nacional',
    '11-01': 'Todos los Santos',
    '12-06': 'Día de la Constitución',
    '12-08': 'Inmaculada Concepción',
    '12-25': 'Navidad',
  },
  MX: {
    '01-01': 'Año Nuevo',
    '02-05': 'Día de la Constitución', // 1er lunes febrero aprox
    '03-21': 'Natalicio de Benito Juárez',
    '05-01': 'Día del Trabajo',
    '09-16': 'Independencia de México',
    '11-02': 'Día de Muertos',
    '11-20': 'Revolución Mexicana',
    '12-25': 'Navidad',
  },
  US: {
    '01-01': 'New Year\'s Day',
    '07-04': 'Independence Day',
    '11-11': 'Veterans Day',
    '12-25': 'Christmas Day',
  },
  FR: {
    '01-01': 'Jour de l\'An',
    '05-01': 'Fête du Travail',
    '05-08': 'Victoire 1945',
    '07-14': 'Fête Nationale',
    '08-15': 'Assomption',
    '11-01': 'Toussaint',
    '11-11': 'Armistice',
    '12-25': 'Noël',
  },
  DE: {
    '01-01': 'Neujahr',
    '05-01': 'Tag der Arbeit',
    '10-03': 'Tag der Deutschen Einheit',
    '12-25': 'Erster Weihnachtstag',
    '12-26': 'Zweiter Weihnachtstag',
  },
  IT: {
    '01-01': 'Capodanno',
    '01-06': 'Epifania',
    '04-25': 'Liberazione',
    '05-01': 'Festa del Lavoro',
    '06-02': 'Festa della Repubblica',
    '08-15': 'Ferragosto',
    '11-01': 'Ognissanti',
    '12-08': 'Immacolata',
    '12-25': 'Natale',
    '12-26': 'Santo Stefano',
  },
  PT: {
    '01-01': 'Ano Novo',
    '04-25': 'Dia da Liberdade',
    '05-01': 'Dia do Trabalhador',
    '06-10': 'Dia de Portugal',
    '08-15': 'Assunção',
    '10-05': 'Implantação da República',
    '11-01': 'Todos os Santos',
    '12-01': 'Restauração da Independência',
    '12-08': 'Imaculada Conceição',
    '12-25': 'Natal',
  },
  GB: {
    '01-01': 'New Year\'s Day',
    '12-25': 'Christmas Day',
    '12-26': 'Boxing Day',
  },
  JP: {
    '01-01': '元日 (Año Nuevo)',
    '02-11': '建国記念の日',
    '02-23': '天皇誕生日',
    '04-29': '昭和の日',
    '05-03': '憲法記念日',
    '05-04': 'みどりの日',
    '05-05': 'こどもの日',
    '08-11': '山の日',
    '11-03': '文化の日',
    '11-23': '勤労感謝の日',
  },
  CN: {
    '01-01': '元旦',
    '05-01': '劳动节',
    '10-01': '国庆节',
    '10-02': '国庆节',
    '10-03': '国庆节',
  },
  TH: {
    '01-01': 'New Year\'s Day',
    '04-06': 'Chakri Day',
    '04-13': 'Songkran',
    '04-14': 'Songkran',
    '04-15': 'Songkran',
    '05-01': 'Labour Day',
    '05-04': 'Coronation Day',
    '06-03': 'Queen\'s Birthday',
    '07-28': 'King\'s Birthday',
    '08-12': 'Mother\'s Day',
    '10-13': 'Memorial Day',
    '10-23': 'Chulalongkorn Day',
    '12-05': 'Father\'s Day',
    '12-10': 'Constitution Day',
    '12-31': 'New Year\'s Eve',
  },
  VN: {
    '01-01': 'Tết Dương lịch',
    '04-30': 'Giải phóng miền Nam',
    '05-01': 'Quốc tế Lao động',
    '09-02': 'Quốc khánh',
  },
  ID: {
    '01-01': 'Tahun Baru',
    '05-01': 'Hari Buruh',
    '08-17': 'Hari Kemerdekaan',
    '12-25': 'Hari Natal',
  },
  MA: {
    '01-01': 'Año Nuevo',
    '01-11': 'Presentación del Manifiesto de la Independencia',
    '03-03': 'Fiesta del Trono',
    '05-01': 'Día del Trabajo',
    '07-30': 'Fiesta del Trono',
    '08-14': 'Día de Oued Eddahab',
    '08-20': 'Revolución del Rey y del Pueblo',
    '08-21': 'Día de la Juventud',
    '11-06': 'Marcha Verde',
    '11-18': 'Día de la Independencia',
  },
  TR: {
    '01-01': 'Yılbaşı',
    '04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
    '05-01': 'Emek ve Dayanışma Bayramı',
    '05-19': 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
    '07-15': 'Demokrasi ve Millî Birlik Günü',
    '08-30': 'Zafer Bayramı',
    '10-29': 'Cumhuriyet Bayramı',
  },
  EG: {
    '01-07': 'Navidad Copta',
    '01-25': 'Día de la Revolución',
    '04-25': 'Día de la Liberación del Sinaí',
    '05-01': 'Día del Trabajo',
    '06-30': 'Día de la Revolución (2013)',
    '07-23': 'Revolución de 1952',
    '10-06': 'Día de las Fuerzas Armadas',
  },
  AR: {
    '01-01': 'Año Nuevo',
    '03-24': 'Día Nacional de la Memoria',
    '04-02': 'Día del Veterano y de los Caídos',
    '05-01': 'Día del Trabajo',
    '05-25': 'Día de la Patria',
    '06-17': 'Paso a la Inmortalidad del Gral. Güemes',
    '06-20': 'Paso a la Inmortalidad del Gral. Belgrano',
    '07-09': 'Día de la Independencia',
    '08-17': 'Paso a la Inmortalidad del Gral. San Martín',
    '10-12': 'Día del Respeto a la Diversidad Cultural',
    '11-20': 'Día de la Soberanía Nacional',
    '12-08': 'Inmaculada Concepción de María',
    '12-25': 'Navidad',
  },
  CO: {
    '01-01': 'Año Nuevo',
    '05-01': 'Día del Trabajo',
    '07-20': 'Día de la Independencia',
    '08-07': 'Batalla de Boyacá',
    '10-12': 'Día de la Raza',
    '11-11': 'Independencia de Cartagena',
    '12-25': 'Navidad',
  },
  PE: {
    '01-01': 'Año Nuevo',
    '05-01': 'Día del Trabajo',
    '06-29': 'San Pedro y San Pablo',
    '07-28': 'Día de la Independencia',
    '07-29': 'Gran Unidad Nacional',
    '08-30': 'Santa Rosa de Lima',
    '10-08': 'Combate de Angamos',
    '11-01': 'Día de Todos los Santos',
    '12-08': 'Inmaculada Concepción',
    '12-25': 'Navidad',
  },
  CL: {
    '01-01': 'Año Nuevo',
    '05-01': 'Día del Trabajo',
    '05-21': 'Glorias Navales',
    '06-20': 'Día Nacional de los Pueblos Indígenas',
    '06-29': 'San Pedro y San Pablo',
    '07-16': 'Virgen del Carmen',
    '08-15': 'Asunción de la Virgen',
    '09-18': 'Independencia de Chile',
    '09-19': 'Día de las Glorias del Ejército',
    '10-12': 'Encuentro de Dos Mundos',
    '10-31': 'Día de las Iglesias Evangélicas',
    '11-01': 'Día de Todos los Santos',
    '12-08': 'Inmaculada Concepción',
    '12-25': 'Navidad',
  },
  BR: {
    '01-01': 'Confraternização Universal',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalho',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '12-25': 'Natal',
  },
};

// ── Country-code aliases (label → ISO code) ───────────────────────────────────
const ALIASES = {
  'españa': 'ES', 'spain': 'ES',
  'mexico': 'MX', 'méxico': 'MX',
  'united states': 'US', 'estados unidos': 'US', 'usa': 'US',
  'france': 'FR', 'francia': 'FR',
  'germany': 'DE', 'alemania': 'DE',
  'italy': 'IT', 'italia': 'IT',
  'portugal': 'PT',
  'united kingdom': 'GB', 'reino unido': 'GB', 'uk': 'GB',
  'japan': 'JP', 'japón': 'JP',
  'china': 'CN',
  'thailand': 'TH', 'tailandia': 'TH',
  'vietnam': 'VN',
  'indonesia': 'ID',
  'morocco': 'MA', 'marruecos': 'MA',
  'turkey': 'TR', 'turquía': 'TR',
  'egypt': 'EG', 'egipto': 'EG',
  'argentina': 'AR',
  'colombia': 'CO',
  'peru': 'PE', 'perú': 'PE',
  'chile': 'CL',
  'brazil': 'BR', 'brasil': 'BR',
};

function resolveCode(countryOrCode) {
  if (!countryOrCode) return null;
  const upper = countryOrCode.toUpperCase();
  if (FIXED[upper]) return upper;
  return ALIASES[countryOrCode.toLowerCase()] || null;
}

// ── Easter-based mobile holidays ──────────────────────────────────────────────
function getMobileHolidays(code, year) {
  const easter = easterDate(year);
  const result = {};

  const EASTER_COUNTRIES = ['ES', 'IT', 'PT', 'FR', 'DE', 'GB', 'AR', 'CO', 'PE', 'CL', 'BR', 'MX'];
  if (!EASTER_COUNTRIES.includes(code)) return result;

  // Good Friday (Viernes Santo)
  result[fmt(addDays(easter, -2))] = {
    ES: 'Viernes Santo', IT: 'Venerdì Santo', PT: 'Sexta-feira Santa',
    FR: 'Vendredi Saint', DE: 'Karfreitag', GB: 'Good Friday',
    AR: 'Viernes Santo', CO: 'Viernes Santo', PE: 'Viernes Santo',
    CL: 'Viernes Santo', BR: 'Sexta-feira Santa', MX: 'Viernes Santo',
  }[code] || 'Viernes Santo';

  // Easter Monday
  const easterMondayCountries = ['FR', 'DE', 'IT', 'PT', 'GB', 'AR', 'CO', 'PE', 'CL', 'BR'];
  if (easterMondayCountries.includes(code)) {
    result[fmt(addDays(easter, 1))] = {
      FR: 'Lundi de Pâques', DE: 'Ostermontag', IT: 'Lunedì dell\'Angelo',
      PT: 'Páscoa', GB: 'Easter Monday',
      AR: 'Lunes de Pascua', CO: 'Lunes de Pascua', PE: 'Lunes de Pascua',
      CL: 'Lunes de Pascua', BR: 'Páscoa',
    }[code] || 'Lunes de Pascua';
  }

  // Ascension (39 days after Easter) — FR, DE
  if (['FR', 'DE'].includes(code)) {
    result[fmt(addDays(easter, 39))] = code === 'FR' ? 'Ascension' : 'Christi Himmelfahrt';
  }

  // Pentecost Monday (50 days after Easter) — FR, DE
  if (['FR', 'DE'].includes(code)) {
    result[fmt(addDays(easter, 50))] = code === 'FR' ? 'Lundi de Pentecôte' : 'Pfingstmontag';
  }

  // Corpus Christi (60 days after Easter) — ES, CO, PE
  if (['ES', 'CO', 'PE'].includes(code)) {
    result[fmt(addDays(easter, 60))] = 'Corpus Christi';
  }

  return result;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Get all holidays for a given country and year.
 * @param {string} countryOrCode  Country name (Spanish/English) or ISO-3166-1 alpha-2 code.
 * @param {number} [year]         Year (defaults to current year).
 * @returns {Object}              { [YYYY-MM-DD]: 'Holiday name' }
 */
export function getHolidays(countryOrCode, year = new Date().getFullYear()) {
  const code = resolveCode(countryOrCode);
  if (!code || !FIXED[code]) return {};

  // Build fixed holidays for this year
  const result = {};
  Object.entries(FIXED[code]).forEach(([mmdd, label]) => {
    result[`${year}-${mmdd}`] = label;
  });

  // Add mobile/Easter-based holidays
  const mobile = getMobileHolidays(code, year);
  Object.assign(result, mobile);

  return result;
}

/**
 * Check if a specific date is a holiday.
 * @param {string} dateStr        YYYY-MM-DD
 * @param {string} countryOrCode  Country name or ISO code.
 * @returns {string|null}         Holiday name, or null if not a holiday.
 */
export function getHolidayName(dateStr, countryOrCode) {
  const year = parseInt(dateStr.slice(0, 4), 10);
  const holidays = getHolidays(countryOrCode, year);
  return holidays[dateStr] || null;
}

/**
 * Get holidays within a date range.
 * @param {string} fromDate   YYYY-MM-DD
 * @param {string} toDate     YYYY-MM-DD
 * @param {string} country    Country name or ISO code.
 * @returns {Array}           [{ date: 'YYYY-MM-DD', name: 'Holiday name' }]
 */
export function getHolidaysInRange(fromDate, toDate, country) {
  const fromYear = parseInt(fromDate.slice(0, 4), 10);
  const toYear   = parseInt(toDate.slice(0, 4), 10);

  const all = {};
  for (let y = fromYear; y <= toYear; y++) {
    Object.assign(all, getHolidays(country, y));
  }

  return Object.entries(all)
    .filter(([date]) => date >= fromDate && date <= toDate)
    .map(([date, name]) => ({ date, name }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * List supported country codes.
 */
export function getSupportedCountries() {
  return Object.keys(FIXED);
}