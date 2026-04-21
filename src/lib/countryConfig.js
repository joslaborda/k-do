/**
 * countryConfig.js — Sistema global multi-país
 * Fuente de verdad para moneda, idioma, bandera, ciudades top y emergencias.
 * NO modifica datos existentes; solo añade capacidades hacia adelante.
 */

import { base44 } from '@/api/base44Client';

// ─── STATIC KNOWN METADATA ────────────────────────────────────────────────────
// Cubre los países más comunes con datos fiables. Para el resto se usa IA.
const KNOWN_META = {
  'España':          { currency: 'EUR', symbol: '€', languageCode: 'es-ES', languageLabel: 'Español',    flag: '🇪🇸' },
  'Italia':          { currency: 'EUR', symbol: '€', languageCode: 'it-IT', languageLabel: 'Italiano',   flag: '🇮🇹' },
  'Francia':         { currency: 'EUR', symbol: '€', languageCode: 'fr-FR', languageLabel: 'Français',   flag: '🇫🇷' },
  'Portugal':        { currency: 'EUR', symbol: '€', languageCode: 'pt-PT', languageLabel: 'Português',  flag: '🇵🇹' },
  'Alemania':        { currency: 'EUR', symbol: '€', languageCode: 'de-DE', languageLabel: 'Deutsch',    flag: '🇩🇪' },
  'Grecia':          { currency: 'EUR', symbol: '€', languageCode: 'el-GR', languageLabel: 'Ελληνικά',  flag: '🇬🇷' },
  'Países Bajos':    { currency: 'EUR', symbol: '€', languageCode: 'nl-NL', languageLabel: 'Nederlands', flag: '🇳🇱' },
  'Bélgica':         { currency: 'EUR', symbol: '€', languageCode: 'fr-BE', languageLabel: 'Français',   flag: '🇧🇪' },
  'Austria':         { currency: 'EUR', symbol: '€', languageCode: 'de-AT', languageLabel: 'Deutsch',    flag: '🇦🇹' },
  'Irlanda':         { currency: 'EUR', symbol: '€', languageCode: 'en-IE', languageLabel: 'English',    flag: '🇮🇪' },
  'Finlandia':       { currency: 'EUR', symbol: '€', languageCode: 'fi-FI', languageLabel: 'Suomi',      flag: '🇫🇮' },
  'Reino Unido':     { currency: 'GBP', symbol: '£', languageCode: 'en-GB', languageLabel: 'English',    flag: '🇬🇧' },
  'Suiza':           { currency: 'CHF', symbol: 'Fr', languageCode: 'de-CH', languageLabel: 'Deutsch',   flag: '🇨🇭' },
  'Noruega':         { currency: 'NOK', symbol: 'kr', languageCode: 'nb-NO', languageLabel: 'Norsk',     flag: '🇳🇴' },
  'Suecia':          { currency: 'SEK', symbol: 'kr', languageCode: 'sv-SE', languageLabel: 'Svenska',   flag: '🇸🇪' },
  'Dinamarca':       { currency: 'DKK', symbol: 'kr', languageCode: 'da-DK', languageLabel: 'Dansk',     flag: '🇩🇰' },
  'Polonia':         { currency: 'PLN', symbol: 'zł', languageCode: 'pl-PL', languageLabel: 'Polski',    flag: '🇵🇱' },
  'República Checa': { currency: 'CZK', symbol: 'Kč', languageCode: 'cs-CZ', languageLabel: 'Čeština',  flag: '🇨🇿' },
  'Hungría':         { currency: 'HUF', symbol: 'Ft', languageCode: 'hu-HU', languageLabel: 'Magyar',    flag: '🇭🇺' },
  'Rumanía':         { currency: 'RON', symbol: 'lei', languageCode: 'ro-RO', languageLabel: 'Română',   flag: '🇷🇴' },
  'Croacia':         { currency: 'EUR', symbol: '€', languageCode: 'hr-HR', languageLabel: 'Hrvatski',   flag: '🇭🇷' },
  'Estados Unidos':  { currency: 'USD', symbol: '$', languageCode: 'en-US', languageLabel: 'English',    flag: '🇺🇸' },
  'Canadá':          { currency: 'CAD', symbol: '$', languageCode: 'en-CA', languageLabel: 'English',    flag: '🇨🇦' },
  'México':          { currency: 'MXN', symbol: '$', languageCode: 'es-MX', languageLabel: 'Español',    flag: '🇲🇽' },
  'Meico':           { currency: 'MXN', symbol: '$', languageCode: 'es-MX', languageLabel: 'Español',    flag: '🇲🇽' },
  'Argentina':       { currency: 'ARS', symbol: '$', languageCode: 'es-AR', languageLabel: 'Español',    flag: '🇦🇷' },
  'Brasil':          { currency: 'BRL', symbol: 'R$', languageCode: 'pt-BR', languageLabel: 'Português', flag: '🇧🇷' },
  'Chile':           { currency: 'CLP', symbol: '$', languageCode: 'es-CL', languageLabel: 'Español',    flag: '🇨🇱' },
  'Colombia':        { currency: 'COP', symbol: '$', languageCode: 'es-CO', languageLabel: 'Español',    flag: '🇨🇴' },
  'Perú':            { currency: 'PEN', symbol: 'S/', languageCode: 'es-PE', languageLabel: 'Español',   flag: '🇵🇪' },
  'Japón':           { currency: 'JPY', symbol: '¥', languageCode: 'ja-JP', languageLabel: 'Japanese',   flag: '🇯🇵' },
  'Japan':           { currency: 'JPY', symbol: '¥', languageCode: 'ja-JP', languageLabel: 'Japanese',   flag: '🇯🇵' },
  'China':           { currency: 'CNY', symbol: '¥', languageCode: 'zh-CN', languageLabel: 'Chinese',    flag: '🇨🇳' },
  'Corea del Sur':   { currency: 'KRW', symbol: '₩', languageCode: 'ko-KR', languageLabel: 'Korean',     flag: '🇰🇷' },
  'Tailandia':       { currency: 'THB', symbol: '฿', languageCode: 'th-TH', languageLabel: 'Thai',       flag: '🇹🇭' },
  'Vietnam':         { currency: 'VND', symbol: '₫', languageCode: 'vi-VN', languageLabel: 'Vietnamese', flag: '🇻🇳' },
  'India':           { currency: 'INR', symbol: '₹', languageCode: 'hi-IN', languageLabel: 'Hindi',      flag: '🇮🇳' },
  'Indonesia':       { currency: 'IDR', symbol: 'Rp', languageCode: 'id-ID', languageLabel: 'Indonesian',flag: '🇮🇩' },
  'Singapur':        { currency: 'SGD', symbol: '$', languageCode: 'en-SG', languageLabel: 'English',    flag: '🇸🇬' },
  'Malasia':         { currency: 'MYR', symbol: 'RM', languageCode: 'ms-MY', languageLabel: 'Malay',     flag: '🇲🇾' },
  'Filipinas':       { currency: 'PHP', symbol: '₱', languageCode: 'fil-PH', languageLabel: 'Filipino',  flag: '🇵🇭' },
  'Turquía':         { currency: 'TRY', symbol: '₺', languageCode: 'tr-TR', languageLabel: 'Türkçe',     flag: '🇹🇷' },
  'Turquia':         { currency: 'TRY', symbol: '₺', languageCode: 'tr-TR', languageLabel: 'Türkçe',     flag: '🇹🇷' },
  'Marruecos':       { currency: 'MAD', symbol: 'DH', languageCode: 'ar-MA', languageLabel: 'Arabic',    flag: '🇲🇦' },
  'Egipto':          { currency: 'EGP', symbol: '£', languageCode: 'ar-EG', languageLabel: 'Arabic',     flag: '🇪🇬' },
  'Emiratos Árabes': { currency: 'AED', symbol: 'د.إ', languageCode: 'ar-AE', languageLabel: 'Arabic',  flag: '🇦🇪' },
  'Arabia Saudí':    { currency: 'SAR', symbol: '﷼', languageCode: 'ar-SA', languageLabel: 'Arabic',    flag: '🇸🇦' },
  'Israel':          { currency: 'ILS', symbol: '₪', languageCode: 'he-IL', languageLabel: 'Hebrew',     flag: '🇮🇱' },
  'Australia':       { currency: 'AUD', symbol: '$', languageCode: 'en-AU', languageLabel: 'English',    flag: '🇦🇺' },
  'Nueva Zelanda':   { currency: 'NZD', symbol: '$', languageCode: 'en-NZ', languageLabel: 'English',    flag: '🇳🇿' },
  'Sudáfrica':       { currency: 'ZAR', symbol: 'R', languageCode: 'en-ZA', languageLabel: 'English',    flag: '🇿🇦' },
  'Kenia':           { currency: 'KES', symbol: 'KSh', languageCode: 'sw-KE', languageLabel: 'Swahili', flag: '🇰🇪' },
  'Tanzania':        { currency: 'TZS', symbol: 'TSh', languageCode: 'sw-TZ', languageLabel: 'Swahili', flag: '🇹🇿' },
  'Rusia':           { currency: 'RUB', symbol: '₽', languageCode: 'ru-RU', languageLabel: 'Russian',    flag: '🇷🇺' },
  'Ucrania':         { currency: 'UAH', symbol: '₴', languageCode: 'uk-UA', languageLabel: 'Ukrainian',  flag: '🇺🇦' },
};

const DEFAULT_META = { currency: 'USD', symbol: '$', languageCode: 'en-US', languageLabel: 'English', flag: '🌍' };

// ─── COUNTRY LIST ─────────────────────────────────────────────────────────────
export function getCountries(locale = 'es-ES') {
  try {
    const regions = Intl.supportedValuesOf('region');
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return regions
      .map((code) => ({ code, label: dn.of(code) }))
      .filter((c) => c.label && c.label !== c.code)
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  } catch {
    return Object.keys(KNOWN_META).map((label) => ({ code: label, label }));
  }
}

// ─── COUNTRY META ─────────────────────────────────────────────────────────────
export function getCountryMeta(countryLabel) {
  if (!countryLabel) return DEFAULT_META;
  // Exact match
  const exact = KNOWN_META[countryLabel];
  if (exact) return { ...exact };
  // Case-insensitive
  const key = Object.keys(KNOWN_META).find(
    (k) => k.toLowerCase() === countryLabel.toLowerCase()
  );
  if (key) return { ...KNOWN_META[key] };
  // Partial match
  const partial = Object.keys(KNOWN_META).find(
    (k) => k.toLowerCase().includes(countryLabel.toLowerCase()) ||
           countryLabel.toLowerCase().includes(k.toLowerCase())
  );
  if (partial) return { ...KNOWN_META[partial] };
  return { ...DEFAULT_META };
}

// ─── NORMALIZERS ──────────────────────────────────────────────────────────────
export function normalizeText(str = '') {
  return str.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCountry(input) {
  if (!input) return '';
  const n = normalizeText(input);
  const found = Object.keys(KNOWN_META).find((k) => normalizeText(k) === n);
  return found || input.trim();
}

// ─── TOP CITIES — cache in Base44 entity CountryInfo ─────────────────────────
const LS_CITIES_PREFIX = 'topCities_v2_';

export async function getTopCities(countryLabel) {
  if (!countryLabel) return [];

  const lsKey = LS_CITIES_PREFIX + normalizeText(countryLabel);

  // 1. Check localStorage
  try {
    const ls = localStorage.getItem(lsKey);
    if (ls) {
      const parsed = JSON.parse(ls);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // 2. Check Base44 CountryInfo entity
  try {
    const rows = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
    if (rows.length > 0 && rows[0].top_cities?.length > 0) {
      const cities = rows[0].top_cities;
      localStorage.setItem(lsKey, JSON.stringify(cities));
      return cities;
    }
  } catch {}

  // 3. Generate with AI
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Dame las 20 ciudades o destinos turísticos más visitados de ${countryLabel} para viajeros españoles. 
Incluye las ciudades principales y los destinos turísticos más conocidos.
Devuelve solo una lista de nombres de ciudades en el idioma oficial del país (o nombre más conocido internacionalmente), sin numeración ni explicaciones.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cities: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    const cities = result?.cities || [];
    if (cities.length > 0) {
      localStorage.setItem(lsKey, JSON.stringify(cities));
      // Save to CountryInfo entity
      try {
        const existing = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
        if (existing.length > 0) {
          await base44.entities.CountryInfo.update(existing[0].id, { top_cities: cities });
        } else {
          await base44.entities.CountryInfo.create({ country_label: countryLabel, top_cities: cities });
        }
      } catch {}
      return cities;
    }
  } catch {}

  // Fallback: return empty (UI shows "Other" option)
  return [];
}

// ─── EMERGENCY INFO ────────────────────────────────────────────────────────────
const LS_EMERGENCY_PREFIX = 'emergency_v2_';

export async function getEmergencyInfo(countryLabel, homeCountry = 'España') {
  if (!countryLabel) return null;
  const lsKey = LS_EMERGENCY_PREFIX + normalizeText(countryLabel) + '_' + normalizeText(homeCountry);

  // 1. localStorage
  try {
    const ls = localStorage.getItem(lsKey);
    if (ls) return JSON.parse(ls);
  } catch {}

  // 2. Base44 entity
  try {
    const rows = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
    if (rows.length > 0 && rows[0].emergency_info) {
      localStorage.setItem(lsKey, JSON.stringify(rows[0].emergency_info));
      return rows[0].emergency_info;
    }
  } catch {}

  // 3. AI
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un experto en seguridad para viajeros. Un ciudadano de ${homeCountry} visita ${countryLabel}.
Proporciona EXACTAMENTE:
1. Número de emergencias generales de ${countryLabel}
2. Número de policía de ${countryLabel}
3. Número de ambulancia de ${countryLabel}
4. Número de bomberos de ${countryLabel}
5. Embajada/Consulado de ${homeCountry} en ${countryLabel}: nombre oficial, dirección completa, teléfono, web oficial
6. 3-4 apps más útiles para moverse en ${countryLabel} (transporte, mapas, taxi)
7. 3 consejos de seguridad específicos para ${countryLabel}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          emergency_general: { type: 'string' },
          police: { type: 'string' },
          ambulance: { type: 'string' },
          fire: { type: 'string' },
          embassy: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
              web: { type: 'string' },
              hours: { type: 'string' }
            }
          },
          useful_apps: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' } }
            }
          },
          safety_tips: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    if (result) {
      localStorage.setItem(lsKey, JSON.stringify(result));
      // Persist to CountryInfo
      try {
        const existing = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
        if (existing.length > 0) {
          await base44.entities.CountryInfo.update(existing[0].id, { emergency_info: result });
        } else {
          await base44.entities.CountryInfo.create({ country_label: countryLabel, emergency_info: result });
        }
      } catch {}
    }
    return result;
  } catch {}

  return null;
}

// ─── EXCHANGE RATE ─────────────────────────────────────────────────────────────
const LS_RATE_PREFIX = 'rate_EUR_';

export async function getExchangeRate(toCurrency) {
  if (!toCurrency || toCurrency === 'EUR') return 1;
  const lsKey = LS_RATE_PREFIX + toCurrency;
  try {
    const ls = sessionStorage.getItem(lsKey);
    if (ls) return parseFloat(ls);
  } catch {}

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Dame la tasa de cambio aproximada de 1 EUR a ${toCurrency}. Solo el número, sin texto.`,
      response_json_schema: { type: 'object', properties: { rate: { type: 'number' } } }
    });
    const rate = result?.rate || 1;
    sessionStorage.setItem(lsKey, String(rate));
    return rate;
  } catch {
    return 1;
  }
}