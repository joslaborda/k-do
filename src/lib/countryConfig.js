/**
 * countryConfig.js — Sistema global multi-país
 * Fuente de verdad para moneda, idioma, bandera, ciudades top y emergencias.
 * Soporta búsqueda por label (español) y por código ISO-3166.
 */

import { base44 } from '@/api/base44Client';

// ─── STATIC KNOWN METADATA ───────────────────────────────────────────────────
const KNOWN_META = {
  'España':          { currency: 'EUR', symbol: '€',    languageCode: 'es-ES', languageLabel: 'Español',    flag: '🇪🇸', iso: 'ES' },
  'Italia':          { currency: 'EUR', symbol: '€',    languageCode: 'it-IT', languageLabel: 'Italiano',   flag: '🇮🇹', iso: 'IT' },
  'Francia':         { currency: 'EUR', symbol: '€',    languageCode: 'fr-FR', languageLabel: 'Français',   flag: '🇫🇷', iso: 'FR' },
  'Portugal':        { currency: 'EUR', symbol: '€',    languageCode: 'pt-PT', languageLabel: 'Português',  flag: '🇵🇹', iso: 'PT' },
  'Alemania':        { currency: 'EUR', symbol: '€',    languageCode: 'de-DE', languageLabel: 'Deutsch',    flag: '🇩🇪', iso: 'DE' },
  'Grecia':          { currency: 'EUR', symbol: '€',    languageCode: 'el-GR', languageLabel: 'Ελληνικά',  flag: '🇬🇷', iso: 'GR' },
  'Países Bajos':    { currency: 'EUR', symbol: '€',    languageCode: 'nl-NL', languageLabel: 'Nederlands', flag: '🇳🇱', iso: 'NL' },
  'Bélgica':         { currency: 'EUR', symbol: '€',    languageCode: 'fr-BE', languageLabel: 'Français',   flag: '🇧🇪', iso: 'BE' },
  'Austria':         { currency: 'EUR', symbol: '€',    languageCode: 'de-AT', languageLabel: 'Deutsch',    flag: '🇦🇹', iso: 'AT' },
  'Irlanda':         { currency: 'EUR', symbol: '€',    languageCode: 'en-IE', languageLabel: 'English',    flag: '🇮🇪', iso: 'IE' },
  'Finlandia':       { currency: 'EUR', symbol: '€',    languageCode: 'fi-FI', languageLabel: 'Suomi',      flag: '🇫🇮', iso: 'FI' },
  'Croacia':         { currency: 'EUR', symbol: '€',    languageCode: 'hr-HR', languageLabel: 'Hrvatski',   flag: '🇭🇷', iso: 'HR' },
  'Reino Unido':     { currency: 'GBP', symbol: '£',    languageCode: 'en-GB', languageLabel: 'English',    flag: '🇬🇧', iso: 'GB' },
  'Suiza':           { currency: 'CHF', symbol: 'Fr',   languageCode: 'de-CH', languageLabel: 'Deutsch',    flag: '🇨🇭', iso: 'CH' },
  'Noruega':         { currency: 'NOK', symbol: 'kr',   languageCode: 'nb-NO', languageLabel: 'Norsk',      flag: '🇳🇴', iso: 'NO' },
  'Suecia':          { currency: 'SEK', symbol: 'kr',   languageCode: 'sv-SE', languageLabel: 'Svenska',    flag: '🇸🇪', iso: 'SE' },
  'Dinamarca':       { currency: 'DKK', symbol: 'kr',   languageCode: 'da-DK', languageLabel: 'Dansk',      flag: '🇩🇰', iso: 'DK' },
  'Polonia':         { currency: 'PLN', symbol: 'zł',   languageCode: 'pl-PL', languageLabel: 'Polski',     flag: '🇵🇱', iso: 'PL' },
  'República Checa': { currency: 'CZK', symbol: 'Kč',   languageCode: 'cs-CZ', languageLabel: 'Čeština',   flag: '🇨🇿', iso: 'CZ' },
  'Hungría':         { currency: 'HUF', symbol: 'Ft',   languageCode: 'hu-HU', languageLabel: 'Magyar',     flag: '🇭🇺', iso: 'HU' },
  'Rumanía':         { currency: 'RON', symbol: 'lei',  languageCode: 'ro-RO', languageLabel: 'Română',     flag: '🇷🇴', iso: 'RO' },
  'Estados Unidos':  { currency: 'USD', symbol: '$',    languageCode: 'en-US', languageLabel: 'English',    flag: '🇺🇸', iso: 'US' },
  'Canadá':          { currency: 'CAD', symbol: '$',    languageCode: 'en-CA', languageLabel: 'English',    flag: '🇨🇦', iso: 'CA' },
  'México':          { currency: 'MXN', symbol: '$',    languageCode: 'es-MX', languageLabel: 'Español',    flag: '🇲🇽', iso: 'MX' },
  'Argentina':       { currency: 'ARS', symbol: '$',    languageCode: 'es-AR', languageLabel: 'Español',    flag: '🇦🇷', iso: 'AR' },
  'Brasil':          { currency: 'BRL', symbol: 'R$',   languageCode: 'pt-BR', languageLabel: 'Português',  flag: '🇧🇷', iso: 'BR' },
  'Chile':           { currency: 'CLP', symbol: '$',    languageCode: 'es-CL', languageLabel: 'Español',    flag: '🇨🇱', iso: 'CL' },
  'Colombia':        { currency: 'COP', symbol: '$',    languageCode: 'es-CO', languageLabel: 'Español',    flag: '🇨🇴', iso: 'CO' },
  'Perú':            { currency: 'PEN', symbol: 'S/',   languageCode: 'es-PE', languageLabel: 'Español',    flag: '🇵🇪', iso: 'PE' },
  'Japón':           { currency: 'JPY', symbol: '¥',    languageCode: 'ja-JP', languageLabel: 'Japanese',   flag: '🇯🇵', iso: 'JP' },
  'Japan':           { currency: 'JPY', symbol: '¥',    languageCode: 'ja-JP', languageLabel: 'Japanese',   flag: '🇯🇵', iso: 'JP' },
  'China':           { currency: 'CNY', symbol: '¥',    languageCode: 'zh-CN', languageLabel: 'Chinese',    flag: '🇨🇳', iso: 'CN' },
  'Corea del Sur':   { currency: 'KRW', symbol: '₩',    languageCode: 'ko-KR', languageLabel: 'Korean',     flag: '🇰🇷', iso: 'KR' },
  'Tailandia':       { currency: 'THB', symbol: '฿',    languageCode: 'th-TH', languageLabel: 'Thai',       flag: '🇹🇭', iso: 'TH' },
  'Vietnam':         { currency: 'VND', symbol: '₫',    languageCode: 'vi-VN', languageLabel: 'Vietnamese', flag: '🇻🇳', iso: 'VN' },
  'India':           { currency: 'INR', symbol: '₹',    languageCode: 'hi-IN', languageLabel: 'Hindi',      flag: '🇮🇳', iso: 'IN' },
  'Indonesia':       { currency: 'IDR', symbol: 'Rp',   languageCode: 'id-ID', languageLabel: 'Indonesian', flag: '🇮🇩', iso: 'ID' },
  'Singapur':        { currency: 'SGD', symbol: '$',    languageCode: 'en-SG', languageLabel: 'English',    flag: '🇸🇬', iso: 'SG' },
  'Malasia':         { currency: 'MYR', symbol: 'RM',   languageCode: 'ms-MY', languageLabel: 'Malay',      flag: '🇲🇾', iso: 'MY' },
  'Filipinas':       { currency: 'PHP', symbol: '₱',    languageCode: 'fil-PH', languageLabel: 'Filipino',  flag: '🇵🇭', iso: 'PH' },
  'Turquía':         { currency: 'TRY', symbol: '₺',    languageCode: 'tr-TR', languageLabel: 'Türkçe',     flag: '🇹🇷', iso: 'TR' },
  'Marruecos':       { currency: 'MAD', symbol: 'DH',   languageCode: 'ar-MA', languageLabel: 'Arabic',     flag: '🇲🇦', iso: 'MA' },
  'Egipto':          { currency: 'EGP', symbol: '£',    languageCode: 'ar-EG', languageLabel: 'Arabic',     flag: '🇪🇬', iso: 'EG' },
  'Emiratos Árabes': { currency: 'AED', symbol: 'د.إ',  languageCode: 'ar-AE', languageLabel: 'Arabic',     flag: '🇦🇪', iso: 'AE' },
  'Arabia Saudí':    { currency: 'SAR', symbol: '﷼',    languageCode: 'ar-SA', languageLabel: 'Arabic',     flag: '🇸🇦', iso: 'SA' },
  'Israel':          { currency: 'ILS', symbol: '₪',    languageCode: 'he-IL', languageLabel: 'Hebrew',     flag: '🇮🇱', iso: 'IL' },
  'Australia':       { currency: 'AUD', symbol: '$',    languageCode: 'en-AU', languageLabel: 'English',    flag: '🇦🇺', iso: 'AU' },
  'Nueva Zelanda':   { currency: 'NZD', symbol: '$',    languageCode: 'en-NZ', languageLabel: 'English',    flag: '🇳🇿', iso: 'NZ' },
  'Sudáfrica':       { currency: 'ZAR', symbol: 'R',    languageCode: 'en-ZA', languageLabel: 'English',    flag: '🇿🇦', iso: 'ZA' },
  'Kenia':           { currency: 'KES', symbol: 'KSh',  languageCode: 'sw-KE', languageLabel: 'Swahili',    flag: '🇰🇪', iso: 'KE' },
  'Tanzania':        { currency: 'TZS', symbol: 'TSh',  languageCode: 'sw-TZ', languageLabel: 'Swahili',    flag: '🇹🇿', iso: 'TZ' },
  'Rusia':           { currency: 'RUB', symbol: '₽',    languageCode: 'ru-RU', languageLabel: 'Russian',    flag: '🇷🇺', iso: 'RU' },
  'Ucrania':         { currency: 'UAH', symbol: '₴',    languageCode: 'uk-UA', languageLabel: 'Ukrainian',  flag: '🇺🇦', iso: 'UA' },
};

// Build reverse lookup: ISO code → meta
const ISO_TO_META = {};
for (const [label, meta] of Object.entries(KNOWN_META)) {
  if (meta.iso && !ISO_TO_META[meta.iso]) {
    ISO_TO_META[meta.iso] = { ...meta, label };
  }
}

const DEFAULT_META = { currency: 'USD', symbol: '$', languageCode: 'en-US', languageLabel: 'English', flag: '🌍', iso: null };

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

export function normalizeText(str = '') {
  return str.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── COUNTRY META — supports both label (e.g. "Japón") and ISO code (e.g. "JP")
export function getCountryMeta(countryLabelOrCode) {
  if (!countryLabelOrCode) return { ...DEFAULT_META };

  // Try ISO code first (2-char uppercase)
  if (countryLabelOrCode.length === 2) {
    const byIso = ISO_TO_META[countryLabelOrCode.toUpperCase()];
    if (byIso) return { ...byIso };
  }

  // Exact label match
  const exact = KNOWN_META[countryLabelOrCode];
  if (exact) return { ...exact };

  // Case-insensitive
  const n = normalizeText(countryLabelOrCode);
  const ci = Object.keys(KNOWN_META).find((k) => normalizeText(k) === n);
  if (ci) return { ...KNOWN_META[ci] };

  // Partial
  const partial = Object.keys(KNOWN_META).find(
    (k) => normalizeText(k).includes(n) || n.includes(normalizeText(k))
  );
  if (partial) return { ...KNOWN_META[partial] };

  return { ...DEFAULT_META };
}

export function normalizeCountry(input) {
  if (!input) return '';
  const n = normalizeText(input);
  const found = Object.keys(KNOWN_META).find((k) => normalizeText(k) === n);
  return found || input.trim();
}

// ─── TOP CITIES ───────────────────────────────────────────────────────────────
const LS_CITIES_PREFIX = 'topCities_v2_';

export async function getTopCities(countryLabel) {
  if (!countryLabel) return [];
  const lsKey = LS_CITIES_PREFIX + normalizeText(countryLabel);

  try {
    const ls = localStorage.getItem(lsKey);
    if (ls) {
      const parsed = JSON.parse(ls);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  try {
    const rows = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
    if (rows.length > 0 && rows[0].top_cities?.length > 0) {
      const cities = rows[0].top_cities;
      localStorage.setItem(lsKey, JSON.stringify(cities));
      return cities;
    }
  } catch {}

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Dame las 20 ciudades o destinos turísticos más visitados de ${countryLabel}. Solo nombres de ciudades, sin numeración.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: { cities: { type: 'array', items: { type: 'string' } } },
      },
    });
    const cities = result?.cities || [];
    if (cities.length > 0) {
      localStorage.setItem(lsKey, JSON.stringify(cities));
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

  return [];
}

// ─── EMERGENCY INFO ────────────────────────────────────────────────────────────
const LS_EMERGENCY_PREFIX = 'emergency_v2_';

export async function getEmergencyInfo(countryLabel, homeCountry = 'España') {
  if (!countryLabel) return null;
  const lsKey = LS_EMERGENCY_PREFIX + normalizeText(countryLabel) + '_' + normalizeText(homeCountry);

  try {
    const ls = localStorage.getItem(lsKey);
    if (ls) return JSON.parse(ls);
  } catch {}

  try {
    const rows = await base44.entities.CountryInfo.filter({ country_label: countryLabel });
    if (rows.length > 0 && rows[0].emergency_info) {
      localStorage.setItem(lsKey, JSON.stringify(rows[0].emergency_info));
      return rows[0].emergency_info;
    }
  } catch {}

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Ciudadano de ${homeCountry} visita ${countryLabel}. Proporciona: número emergencias general, policía, ambulancia, bomberos; embajada de ${homeCountry} en ${countryLabel} (nombre, dirección, teléfono, web); 3-4 apps útiles de transporte/taxi; 3 consejos de seguridad.`,
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
              hours: { type: 'string' },
            },
          },
          useful_apps: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' } },
            },
          },
          safety_tips: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    if (result) {
      localStorage.setItem(lsKey, JSON.stringify(result));
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

// ─── EXCHANGE RATE (simple, for display converters) ────────────────────────────
const LS_RATE_PREFIX = 'rate_EUR_';

export async function getExchangeRate(toCurrency) {
  if (!toCurrency || toCurrency === 'EUR') return 1;
  const lsKey = LS_RATE_PREFIX + toCurrency;
  try {
    const ls = sessionStorage.getItem(lsKey);
    if (ls) return parseFloat(ls);
  } catch {}

  // Try Frankfurter first
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${toCurrency}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.[toCurrency];
      if (rate) {
        sessionStorage.setItem(lsKey, String(rate));
        return rate;
      }
    }
  } catch {}

  // LLM fallback
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Current exchange rate: 1 EUR to ${toCurrency}. Return only the number.`,
      response_json_schema: { type: 'object', properties: { rate: { type: 'number' } } },
    });
    const rate = result?.rate || 1;
    sessionStorage.setItem(lsKey, String(rate));
    return rate;
  } catch {
    return 1;
  }
}

// ─── AVAILABLE CURRENCIES for a trip ─────────────────────────────────────────
/**
 * Computes the union of currencies from:
 *  - cities (by city.country or city.country_code)
 *  - trip.base_currency
 *  - trip.currency (legacy)
 */
export function computeAvailableCurrencies(cities = [], baseCurrency = 'EUR') {
  const set = new Set([baseCurrency]);
  for (const city of cities) {
    const key = city.country_code || city.country || '';
    if (key) {
      const meta = getCountryMeta(key);
      if (meta.currency) set.add(meta.currency);
    }
  }
  return Array.from(set);
}