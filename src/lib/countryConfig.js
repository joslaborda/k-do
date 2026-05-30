/**
 * countryConfig.js — Sistema global multi-país
 * Fuente de verdad para moneda, idioma, bandera, ciudades top y emergencias.
 * Soporta búsqueda por label (español) y por código ISO-3166.
 */

import { base44 } from '@/api/base44Client';

// ─── STATIC KNOWN METADATA ───────────────────────────────────────────────────
const KNOWN_META = {
  // ── Europa occidental ──────────────────────────────────────────────────────
  'España':             { currency: 'EUR', symbol: '€',    languageCode: 'es-ES', languageLabel: 'Español',      flag: '🇪🇸', iso: 'ES' },
  'Italia':             { currency: 'EUR', symbol: '€',    languageCode: 'it-IT', languageLabel: 'Italiano',     flag: '🇮🇹', iso: 'IT' },
  'Francia':            { currency: 'EUR', symbol: '€',    languageCode: 'fr-FR', languageLabel: 'Français',     flag: '🇫🇷', iso: 'FR' },
  'Portugal':           { currency: 'EUR', symbol: '€',    languageCode: 'pt-PT', languageLabel: 'Português',    flag: '🇵🇹', iso: 'PT' },
  'Alemania':           { currency: 'EUR', symbol: '€',    languageCode: 'de-DE', languageLabel: 'Deutsch',      flag: '🇩🇪', iso: 'DE' },
  'Grecia':             { currency: 'EUR', symbol: '€',    languageCode: 'el-GR', languageLabel: 'Ελληνικά',     flag: '🇬🇷', iso: 'GR' },
  'Países Bajos':       { currency: 'EUR', symbol: '€',    languageCode: 'nl-NL', languageLabel: 'Nederlands',   flag: '🇳🇱', iso: 'NL' },
  'Bélgica':            { currency: 'EUR', symbol: '€',    languageCode: 'fr-BE', languageLabel: 'Français',     flag: '🇧🇪', iso: 'BE' },
  'Austria':            { currency: 'EUR', symbol: '€',    languageCode: 'de-AT', languageLabel: 'Deutsch',      flag: '🇦🇹', iso: 'AT' },
  'Irlanda':            { currency: 'EUR', symbol: '€',    languageCode: 'en-IE', languageLabel: 'English',      flag: '🇮🇪', iso: 'IE' },
  'Finlandia':          { currency: 'EUR', symbol: '€',    languageCode: 'fi-FI', languageLabel: 'Suomi',        flag: '🇫🇮', iso: 'FI' },
  'Croacia':            { currency: 'EUR', symbol: '€',    languageCode: 'hr-HR', languageLabel: 'Hrvatski',     flag: '🇭🇷', iso: 'HR' },
  'Eslovenia':          { currency: 'EUR', symbol: '€',    languageCode: 'sl-SI', languageLabel: 'Slovenščina',  flag: '🇸🇮', iso: 'SI' },
  'Eslovaquia':         { currency: 'EUR', symbol: '€',    languageCode: 'sk-SK', languageLabel: 'Slovenčina',   flag: '🇸🇰', iso: 'SK' },
  'Luxemburgo':         { currency: 'EUR', symbol: '€',    languageCode: 'fr-LU', languageLabel: 'Français',     flag: '🇱🇺', iso: 'LU' },
  'Malta':              { currency: 'EUR', symbol: '€',    languageCode: 'mt-MT', languageLabel: 'Malti',        flag: '🇲🇹', iso: 'MT' },
  'Chipre':             { currency: 'EUR', symbol: '€',    languageCode: 'el-CY', languageLabel: 'Ελληνικά',     flag: '🇨🇾', iso: 'CY' },
  'Reino Unido':        { currency: 'GBP', symbol: '£',    languageCode: 'en-GB', languageLabel: 'English',      flag: '🇬🇧', iso: 'GB' },
  'Suiza':              { currency: 'CHF', symbol: 'Fr',   languageCode: 'de-CH', languageLabel: 'Deutsch',      flag: '🇨🇭', iso: 'CH' },
  'Mónaco':             { currency: 'EUR', symbol: '€',    languageCode: 'fr-MC', languageLabel: 'Français',     flag: '🇲🇨', iso: 'MC' },
  'Andorra':            { currency: 'EUR', symbol: '€',    languageCode: 'ca-AD', languageLabel: 'Català',       flag: '🇦🇩', iso: 'AD' },

  // ── Europa nórdica ─────────────────────────────────────────────────────────
  'Noruega':            { currency: 'NOK', symbol: 'kr',   languageCode: 'nb-NO', languageLabel: 'Norsk',        flag: '🇳🇴', iso: 'NO' },
  'Suecia':             { currency: 'SEK', symbol: 'kr',   languageCode: 'sv-SE', languageLabel: 'Svenska',      flag: '🇸🇪', iso: 'SE' },
  'Dinamarca':          { currency: 'DKK', symbol: 'kr',   languageCode: 'da-DK', languageLabel: 'Dansk',        flag: '🇩🇰', iso: 'DK' },
  'Islandia':           { currency: 'ISK', symbol: 'kr',   languageCode: 'is-IS', languageLabel: 'Íslenska',     flag: '🇮🇸', iso: 'IS' },

  // ── Europa del Este ────────────────────────────────────────────────────────
  'Polonia':            { currency: 'PLN', symbol: 'zł',   languageCode: 'pl-PL', languageLabel: 'Polski',       flag: '🇵🇱', iso: 'PL' },
  'República Checa':    { currency: 'CZK', symbol: 'Kč',   languageCode: 'cs-CZ', languageLabel: 'Čeština',      flag: '🇨🇿', iso: 'CZ' },
  'Hungría':            { currency: 'HUF', symbol: 'Ft',   languageCode: 'hu-HU', languageLabel: 'Magyar',       flag: '🇭🇺', iso: 'HU' },
  'Rumanía':            { currency: 'RON', symbol: 'lei',  languageCode: 'ro-RO', languageLabel: 'Română',       flag: '🇷🇴', iso: 'RO' },
  'Bulgaria':           { currency: 'BGN', symbol: 'лв',   languageCode: 'bg-BG', languageLabel: 'Български',    flag: '🇧🇬', iso: 'BG' },
  'Serbia':             { currency: 'RSD', symbol: 'din',  languageCode: 'sr-RS', languageLabel: 'Srpski',       flag: '🇷🇸', iso: 'RS' },
  'Albania':            { currency: 'ALL', symbol: 'L',    languageCode: 'sq-AL', languageLabel: 'Shqip',        flag: '🇦🇱', iso: 'AL' },
  'Macedonia del Norte':{ currency: 'MKD', symbol: 'ден', languageCode: 'mk-MK', languageLabel: 'Македонски',   flag: '🇲🇰', iso: 'MK' },
  'Bosnia':             { currency: 'BAM', symbol: 'KM',   languageCode: 'bs-BA', languageLabel: 'Bosanski',     flag: '🇧🇦', iso: 'BA' },
  'Montenegro':         { currency: 'EUR', symbol: '€',    languageCode: 'sr-ME', languageLabel: 'Crnogorski',   flag: '🇲🇪', iso: 'ME' },
  'Estonia':            { currency: 'EUR', symbol: '€',    languageCode: 'et-EE', languageLabel: 'Eesti',        flag: '🇪🇪', iso: 'EE' },
  'Letonia':            { currency: 'EUR', symbol: '€',    languageCode: 'lv-LV', languageLabel: 'Latviešu',     flag: '🇱🇻', iso: 'LV' },
  'Lituania':           { currency: 'EUR', symbol: '€',    languageCode: 'lt-LT', languageLabel: 'Lietuvių',     flag: '🇱🇹', iso: 'LT' },
  'Ucrania':            { currency: 'UAH', symbol: '₴',    languageCode: 'uk-UA', languageLabel: 'Українська',   flag: '🇺🇦', iso: 'UA' },
  'Rusia':              { currency: 'RUB', symbol: '₽',    languageCode: 'ru-RU', languageLabel: 'Русский',      flag: '🇷🇺', iso: 'RU' },
  'Georgia':            { currency: 'GEL', symbol: '₾',    languageCode: 'ka-GE', languageLabel: 'ქართული',      flag: '🇬🇪', iso: 'GE' },
  'Armenia':            { currency: 'AMD', symbol: '֏',    languageCode: 'hy-AM', languageLabel: 'Հայերեն',      flag: '🇦🇲', iso: 'AM' },
  'Azerbaiyán':         { currency: 'AZN', symbol: '₼',    languageCode: 'az-AZ', languageLabel: 'Azərbaycan',   flag: '🇦🇿', iso: 'AZ' },
  'Kosovo':             { currency: 'EUR', symbol: '€',    languageCode: 'sq-XK', languageLabel: 'Shqip',        flag: '🇽🇰', iso: 'XK' },
  'Moldova':            { currency: 'MDL', symbol: 'L',    languageCode: 'ro-MD', languageLabel: 'Română',       flag: '🇲🇩', iso: 'MD' },
  'Bielorrusia':        { currency: 'BYN', symbol: 'Br',   languageCode: 'be-BY', languageLabel: 'Беларуская',   flag: '🇧🇾', iso: 'BY' },

  // ── Norteamérica ───────────────────────────────────────────────────────────
  'Estados Unidos':     { currency: 'USD', symbol: '$',    languageCode: 'en-US', languageLabel: 'English',      flag: '🇺🇸', iso: 'US' },
  'Canadá':             { currency: 'CAD', symbol: '$',    languageCode: 'en-CA', languageLabel: 'English',      flag: '🇨🇦', iso: 'CA' },
  'México':             { currency: 'MXN', symbol: '$',    languageCode: 'es-MX', languageLabel: 'Español',      flag: '🇲🇽', iso: 'MX' },
  'Cuba':               { currency: 'CUP', symbol: '$',    languageCode: 'es-CU', languageLabel: 'Español',      flag: '🇨🇺', iso: 'CU' },
  'Costa Rica':         { currency: 'CRC', symbol: '₡',    languageCode: 'es-CR', languageLabel: 'Español',      flag: '🇨🇷', iso: 'CR' },
  'Panamá':             { currency: 'PAB', symbol: 'B/.',  languageCode: 'es-PA', languageLabel: 'Español',      flag: '🇵🇦', iso: 'PA' },
  'Guatemala':          { currency: 'GTQ', symbol: 'Q',    languageCode: 'es-GT', languageLabel: 'Español',      flag: '🇬🇹', iso: 'GT' },
  'Honduras':           { currency: 'HNL', symbol: 'L',    languageCode: 'es-HN', languageLabel: 'Español',      flag: '🇭🇳', iso: 'HN' },
  'El Salvador':        { currency: 'USD', symbol: '$',    languageCode: 'es-SV', languageLabel: 'Español',      flag: '🇸🇻', iso: 'SV' },
  'Nicaragua':          { currency: 'NIO', symbol: 'C$',   languageCode: 'es-NI', languageLabel: 'Español',      flag: '🇳🇮', iso: 'NI' },
  'República Dominicana':{ currency: 'DOP', symbol: 'RD$', languageCode: 'es-DO', languageLabel: 'Español',     flag: '🇩🇴', iso: 'DO' },
  'Jamaica':            { currency: 'JMD', symbol: '$',    languageCode: 'en-JM', languageLabel: 'English',      flag: '🇯🇲', iso: 'JM' },
  'Trinidad y Tobago':  { currency: 'TTD', symbol: '$',    languageCode: 'en-TT', languageLabel: 'English',      flag: '🇹🇹', iso: 'TT' },
  'Barbados':           { currency: 'BBD', symbol: '$',    languageCode: 'en-BB', languageLabel: 'English',      flag: '🇧🇧', iso: 'BB' },
  'Bahamas':            { currency: 'BSD', symbol: '$',    languageCode: 'en-BS', languageLabel: 'English',      flag: '🇧🇸', iso: 'BS' },
  'Haití':              { currency: 'HTG', symbol: 'G',    languageCode: 'fr-HT', languageLabel: 'Français',     flag: '🇭🇹', iso: 'HT' },
  'Saint-Martin':       { currency: 'EUR', symbol: '€',    languageCode: 'fr-MF', languageLabel: 'Français',     flag: '🇲🇫', iso: 'MF' },
  'Saint Martin':       { currency: 'EUR', symbol: '€',    languageCode: 'fr-MF', languageLabel: 'Français',     flag: '🇲🇫', iso: 'MF' },
  'Sint Maarten':       { currency: 'ANG', symbol: 'ƒ',    languageCode: 'nl-SX', languageLabel: 'Nederlands',   flag: '🇸🇽', iso: 'SX' },
  'Martinica':          { currency: 'EUR', symbol: '€',    languageCode: 'fr-MQ', languageLabel: 'Français',     flag: '🇲🇶', iso: 'MQ' },
  'Guadalupe':          { currency: 'EUR', symbol: '€',    languageCode: 'fr-GP', languageLabel: 'Français',     flag: '🇬🇵', iso: 'GP' },
  'Puerto Rico':        { currency: 'USD', symbol: '$',    languageCode: 'es-PR', languageLabel: 'Español',      flag: '🇵🇷', iso: 'PR' },
  'Bermudas':           { currency: 'BMD', symbol: '$',    languageCode: 'en-BM', languageLabel: 'English',      flag: '🇧🇲', iso: 'BM' },
  'Aruba':              { currency: 'AWG', symbol: 'ƒ',    languageCode: 'nl-AW', languageLabel: 'Papiamento',   flag: '🇦🇼', iso: 'AW' },
  'Curazao':            { currency: 'ANG', symbol: 'ƒ',    languageCode: 'nl-CW', languageLabel: 'Papiamento',   flag: '🇨🇼', iso: 'CW' },
  'Antigua y Barbuda':  { currency: 'XCD', symbol: '$',    languageCode: 'en-AG', languageLabel: 'English',      flag: '🇦🇬', iso: 'AG' },
  'Santa Lucía':        { currency: 'XCD', symbol: '$',    languageCode: 'en-LC', languageLabel: 'English',      flag: '🇱🇨', iso: 'LC' },
  'San Vicente':        { currency: 'XCD', symbol: '$',    languageCode: 'en-VC', languageLabel: 'English',      flag: '🇻🇨', iso: 'VC' },
  'Granada':            { currency: 'XCD', symbol: '$',    languageCode: 'en-GD', languageLabel: 'English',      flag: '🇬🇩', iso: 'GD' },
  'Dominica':           { currency: 'XCD', symbol: '$',    languageCode: 'en-DM', languageLabel: 'English',      flag: '🇩🇲', iso: 'DM' },

  // ── Sudamérica ─────────────────────────────────────────────────────────────
  'Argentina':          { currency: 'ARS', symbol: '$',    languageCode: 'es-AR', languageLabel: 'Español',      flag: '🇦🇷', iso: 'AR' },
  'Brasil':             { currency: 'BRL', symbol: 'R$',   languageCode: 'pt-BR', languageLabel: 'Português',    flag: '🇧🇷', iso: 'BR' },
  'Chile':              { currency: 'CLP', symbol: '$',    languageCode: 'es-CL', languageLabel: 'Español',      flag: '🇨🇱', iso: 'CL' },
  'Colombia':           { currency: 'COP', symbol: '$',    languageCode: 'es-CO', languageLabel: 'Español',      flag: '🇨🇴', iso: 'CO' },
  'Perú':               { currency: 'PEN', symbol: 'S/',   languageCode: 'es-PE', languageLabel: 'Español',      flag: '🇵🇪', iso: 'PE' },
  'Uruguay':            { currency: 'UYU', symbol: '$',    languageCode: 'es-UY', languageLabel: 'Español',      flag: '🇺🇾', iso: 'UY' },
  'Bolivia':            { currency: 'BOB', symbol: 'Bs.',  languageCode: 'es-BO', languageLabel: 'Español',      flag: '🇧🇴', iso: 'BO' },
  'Ecuador':            { currency: 'USD', symbol: '$',    languageCode: 'es-EC', languageLabel: 'Español',      flag: '🇪🇨', iso: 'EC' },
  'Venezuela':          { currency: 'VES', symbol: 'Bs.S', languageCode: 'es-VE', languageLabel: 'Español',      flag: '🇻🇪', iso: 'VE' },
  'Paraguay':           { currency: 'PYG', symbol: '₲',    languageCode: 'es-PY', languageLabel: 'Español',      flag: '🇵🇾', iso: 'PY' },
  'Guyana':             { currency: 'GYD', symbol: '$',    languageCode: 'en-GY', languageLabel: 'English',      flag: '🇬🇾', iso: 'GY' },
  'Surinam':            { currency: 'SRD', symbol: '$',    languageCode: 'nl-SR', languageLabel: 'Nederlands',   flag: '🇸🇷', iso: 'SR' },

  // ── Asia Oriental ──────────────────────────────────────────────────────────
  'Japón':              { currency: 'JPY', symbol: '¥',    languageCode: 'ja-JP', languageLabel: 'Japanese',     flag: '🇯🇵', iso: 'JP' },
  'Japan':              { currency: 'JPY', symbol: '¥',    languageCode: 'ja-JP', languageLabel: 'Japanese',     flag: '🇯🇵', iso: 'JP' },
  'China':              { currency: 'CNY', symbol: '¥',    languageCode: 'zh-CN', languageLabel: 'Chinese',      flag: '🇨🇳', iso: 'CN' },
  'Corea del Sur':      { currency: 'KRW', symbol: '₩',    languageCode: 'ko-KR', languageLabel: 'Korean',       flag: '🇰🇷', iso: 'KR' },
  'Taiwan':             { currency: 'TWD', symbol: 'NT$',  languageCode: 'zh-TW', languageLabel: 'Chinese',      flag: '🇹🇼', iso: 'TW' },
  'Mongolia':           { currency: 'MNT', symbol: '₮',    languageCode: 'mn-MN', languageLabel: 'Mongolian',    flag: '🇲🇳', iso: 'MN' },

  // ── Asia Sudoriental ───────────────────────────────────────────────────────
  'Tailandia':          { currency: 'THB', symbol: '฿',    languageCode: 'th-TH', languageLabel: 'Thai',         flag: '🇹🇭', iso: 'TH' },
  'Vietnam':            { currency: 'VND', symbol: '₫',    languageCode: 'vi-VN', languageLabel: 'Vietnamese',   flag: '🇻🇳', iso: 'VN' },
  'Camboya':            { currency: 'KHR', symbol: '៛',    languageCode: 'km-KH', languageLabel: 'Khmer',        flag: '🇰🇭', iso: 'KH' },
  'Laos':               { currency: 'LAK', symbol: '₭',    languageCode: 'lo-LA', languageLabel: 'Lao',          flag: '🇱🇦', iso: 'LA' },
  'Myanmar':            { currency: 'MMK', symbol: 'K',    languageCode: 'my-MM', languageLabel: 'Burmese',      flag: '🇲🇲', iso: 'MM' },
  'Indonesia':          { currency: 'IDR', symbol: 'Rp',   languageCode: 'id-ID', languageLabel: 'Indonesian',   flag: '🇮🇩', iso: 'ID' },
  'Singapur':           { currency: 'SGD', symbol: '$',    languageCode: 'en-SG', languageLabel: 'English',      flag: '🇸🇬', iso: 'SG' },
  'Malasia':            { currency: 'MYR', symbol: 'RM',   languageCode: 'ms-MY', languageLabel: 'Malay',        flag: '🇲🇾', iso: 'MY' },
  'Filipinas':          { currency: 'PHP', symbol: '₱',    languageCode: 'fil-PH', languageLabel: 'Filipino',    flag: '🇵🇭', iso: 'PH' },
  'Brunéi':             { currency: 'BND', symbol: '$',    languageCode: 'ms-BN', languageLabel: 'Malay',        flag: '🇧🇳', iso: 'BN' },
  'Timor Oriental':     { currency: 'USD', symbol: '$',    languageCode: 'pt-TL', languageLabel: 'Português',    flag: '🇹🇱', iso: 'TL' },

  // ── Asia del Sur ───────────────────────────────────────────────────────────
  'India':              { currency: 'INR', symbol: '₹',    languageCode: 'hi-IN', languageLabel: 'Hindi',        flag: '🇮🇳', iso: 'IN' },
  'Nepal':              { currency: 'NPR', symbol: '₨',    languageCode: 'ne-NP', languageLabel: 'Nepali',       flag: '🇳🇵', iso: 'NP' },
  'Sri Lanka':          { currency: 'LKR', symbol: '₨',    languageCode: 'si-LK', languageLabel: 'Sinhala',      flag: '🇱🇰', iso: 'LK' },
  'Maldivas':           { currency: 'MVR', symbol: 'Rf',   languageCode: 'dv-MV', languageLabel: 'Dhivehi',      flag: '🇲🇻', iso: 'MV' },
  'Bután':              { currency: 'BTN', symbol: 'Nu',   languageCode: 'dz-BT', languageLabel: 'Dzongkha',     flag: '🇧🇹', iso: 'BT' },
  'Pakistán':           { currency: 'PKR', symbol: '₨',    languageCode: 'ur-PK', languageLabel: 'Urdu',         flag: '🇵🇰', iso: 'PK' },
  'Bangladés':          { currency: 'BDT', symbol: '৳',    languageCode: 'bn-BD', languageLabel: 'Bengali',      flag: '🇧🇩', iso: 'BD' },

  // ── Asia Central ───────────────────────────────────────────────────────────
  'Uzbekistán':         { currency: 'UZS', symbol: 'soʻm', languageCode: 'uz-UZ', languageLabel: 'Uzbek',        flag: '🇺🇿', iso: 'UZ' },
  'Kazajistán':         { currency: 'KZT', symbol: '₸',    languageCode: 'kk-KZ', languageLabel: 'Kazakh',       flag: '🇰🇿', iso: 'KZ' },
  'Kirguistán':         { currency: 'KGS', symbol: 'som',  languageCode: 'ky-KG', languageLabel: 'Kyrgyz',       flag: '🇰🇬', iso: 'KG' },

  // ── Oriente Medio ──────────────────────────────────────────────────────────
  'Turquía':            { currency: 'TRY', symbol: '₺',    languageCode: 'tr-TR', languageLabel: 'Türkçe',       flag: '🇹🇷', iso: 'TR' },
  'Emiratos Árabes':    { currency: 'AED', symbol: 'د.إ',  languageCode: 'ar-AE', languageLabel: 'Arabic',       flag: '🇦🇪', iso: 'AE' },
  'Arabia Saudí':       { currency: 'SAR', symbol: '﷼',    languageCode: 'ar-SA', languageLabel: 'Arabic',       flag: '🇸🇦', iso: 'SA' },
  'Israel':             { currency: 'ILS', symbol: '₪',    languageCode: 'he-IL', languageLabel: 'Hebrew',       flag: '🇮🇱', iso: 'IL' },
  'Jordania':           { currency: 'JOD', symbol: 'JD',   languageCode: 'ar-JO', languageLabel: 'Arabic',       flag: '🇯🇴', iso: 'JO' },
  'Líbano':             { currency: 'LBP', symbol: 'ل.ل',  languageCode: 'ar-LB', languageLabel: 'Arabic',       flag: '🇱🇧', iso: 'LB' },
  'Omán':               { currency: 'OMR', symbol: '﷼',    languageCode: 'ar-OM', languageLabel: 'Arabic',       flag: '🇴🇲', iso: 'OM' },
  'Qatar':              { currency: 'QAR', symbol: '﷼',    languageCode: 'ar-QA', languageLabel: 'Arabic',       flag: '🇶🇦', iso: 'QA' },
  'Kuwait':             { currency: 'KWD', symbol: 'KD',   languageCode: 'ar-KW', languageLabel: 'Arabic',       flag: '🇰🇼', iso: 'KW' },
  'Bahréin':            { currency: 'BHD', symbol: 'BD',   languageCode: 'ar-BH', languageLabel: 'Arabic',       flag: '🇧🇭', iso: 'BH' },
  'Irán':               { currency: 'IRR', symbol: '﷼',    languageCode: 'fa-IR', languageLabel: 'Farsi',        flag: '🇮🇷', iso: 'IR' },

  // ── África del Norte ───────────────────────────────────────────────────────
  'Marruecos':          { currency: 'MAD', symbol: 'DH',   languageCode: 'ar-MA', languageLabel: 'Arabic',       flag: '🇲🇦', iso: 'MA' },
  'Egipto':             { currency: 'EGP', symbol: '£',    languageCode: 'ar-EG', languageLabel: 'Arabic',       flag: '🇪🇬', iso: 'EG' },
  'Túnez':              { currency: 'TND', symbol: 'DT',   languageCode: 'ar-TN', languageLabel: 'Arabic',       flag: '🇹🇳', iso: 'TN' },
  'Argelia':            { currency: 'DZD', symbol: 'دج',   languageCode: 'ar-DZ', languageLabel: 'Arabic',       flag: '🇩🇿', iso: 'DZ' },
  'Libia':              { currency: 'LYD', symbol: 'LD',   languageCode: 'ar-LY', languageLabel: 'Arabic',       flag: '🇱🇾', iso: 'LY' },
  'Sudán':              { currency: 'SDG', symbol: '£',    languageCode: 'ar-SD', languageLabel: 'Arabic',       flag: '🇸🇩', iso: 'SD' },

  // ── África Subsahariana ────────────────────────────────────────────────────
  'Sudáfrica':          { currency: 'ZAR', symbol: 'R',    languageCode: 'en-ZA', languageLabel: 'English',      flag: '🇿🇦', iso: 'ZA' },
  'Kenia':              { currency: 'KES', symbol: 'KSh',  languageCode: 'sw-KE', languageLabel: 'Swahili',      flag: '🇰🇪', iso: 'KE' },
  'Tanzania':           { currency: 'TZS', symbol: 'TSh',  languageCode: 'sw-TZ', languageLabel: 'Swahili',      flag: '🇹🇿', iso: 'TZ' },
  'Uganda':             { currency: 'UGX', symbol: 'USh',  languageCode: 'sw-UG', languageLabel: 'Swahili',      flag: '🇺🇬', iso: 'UG' },
  'Ruanda':             { currency: 'RWF', symbol: 'RF',   languageCode: 'rw-RW', languageLabel: 'Kinyarwanda',  flag: '🇷🇼', iso: 'RW' },
  'Rwanda':             { currency: 'RWF', symbol: 'RF',   languageCode: 'rw-RW', languageLabel: 'Kinyarwanda',  flag: '🇷🇼', iso: 'RW' },
  'Etiopía':            { currency: 'ETB', symbol: 'Br',   languageCode: 'am-ET', languageLabel: 'Amharic',      flag: '🇪🇹', iso: 'ET' },
  'Ghana':              { currency: 'GHS', symbol: '₵',    languageCode: 'en-GH', languageLabel: 'English',      flag: '🇬🇭', iso: 'GH' },
  'Nigeria':            { currency: 'NGN', symbol: '₦',    languageCode: 'en-NG', languageLabel: 'English',      flag: '🇳🇬', iso: 'NG' },
  'Senegal':            { currency: 'XOF', symbol: 'CFA',  languageCode: 'fr-SN', languageLabel: 'Français',     flag: '🇸🇳', iso: 'SN' },
  'Camerún':            { currency: 'XAF', symbol: 'CFA',  languageCode: 'fr-CM', languageLabel: 'Français',     flag: '🇨🇲', iso: 'CM' },
  'Angola':             { currency: 'AOA', symbol: 'Kz',   languageCode: 'pt-AO', languageLabel: 'Português',    flag: '🇦🇴', iso: 'AO' },
  'Mozambique':         { currency: 'MZN', symbol: 'MT',   languageCode: 'pt-MZ', languageLabel: 'Português',    flag: '🇲🇿', iso: 'MZ' },
  'Zambia':             { currency: 'ZMW', symbol: 'ZK',   languageCode: 'en-ZM', languageLabel: 'English',      flag: '🇿🇲', iso: 'ZM' },
  'Zimbabue':           { currency: 'ZWL', symbol: '$',    languageCode: 'en-ZW', languageLabel: 'English',      flag: '🇿🇼', iso: 'ZW' },
  'Botsuana':           { currency: 'BWP', symbol: 'P',    languageCode: 'en-BW', languageLabel: 'English',      flag: '🇧🇼', iso: 'BW' },
  'Namibia':            { currency: 'NAD', symbol: '$',    languageCode: 'en-NA', languageLabel: 'English',      flag: '🇳🇦', iso: 'NA' },
  'Madagascar':         { currency: 'MGA', symbol: 'Ar',   languageCode: 'mg-MG', languageLabel: 'Malagasy',     flag: '🇲🇬', iso: 'MG' },

  // ── Oceanía ────────────────────────────────────────────────────────────────
  'Australia':          { currency: 'AUD', symbol: '$',    languageCode: 'en-AU', languageLabel: 'English',      flag: '🇦🇺', iso: 'AU' },
  'Nueva Zelanda':      { currency: 'NZD', symbol: '$',    languageCode: 'en-NZ', languageLabel: 'English',      flag: '🇳🇿', iso: 'NZ' },
  'Fiyi':               { currency: 'FJD', symbol: '$',    languageCode: 'en-FJ', languageLabel: 'English',      flag: '🇫🇯', iso: 'FJ' },

  // ── Caribe completo ────────────────────────────────────────────────────────
  'San Cristóbal y Nieves':    { currency: 'XCD', symbol: '$',   languageCode: 'en-KN', languageLabel: 'English',    flag: '🇰🇳', iso: 'KN' },
  'Saint Kitts':               { currency: 'XCD', symbol: '$',   languageCode: 'en-KN', languageLabel: 'English',    flag: '🇰🇳', iso: 'KN' },
  'Montserrat':                { currency: 'XCD', symbol: '$',   languageCode: 'en-MS', languageLabel: 'English',    flag: '🇲🇸', iso: 'MS' },
  'Anguila':                   { currency: 'XCD', symbol: '$',   languageCode: 'en-AI', languageLabel: 'English',    flag: '🇦🇮', iso: 'AI' },
  'Islas Vírgenes Británicas': { currency: 'USD', symbol: '$',   languageCode: 'en-VG', languageLabel: 'English',    flag: '🇻🇬', iso: 'VG' },
  'Islas Vírgenes EEUU':       { currency: 'USD', symbol: '$',   languageCode: 'en-VI', languageLabel: 'English',    flag: '🇻🇮', iso: 'VI' },
  'Islas Turcos y Caicos':     { currency: 'USD', symbol: '$',   languageCode: 'en-TC', languageLabel: 'English',    flag: '🇹🇨', iso: 'TC' },
  'Islas Caimán':              { currency: 'KYD', symbol: '$',   languageCode: 'en-KY', languageLabel: 'English',    flag: '🇰🇾', iso: 'KY' },
  'Martinica':                 { currency: 'EUR', symbol: '€',   languageCode: 'fr-MQ', languageLabel: 'Français',   flag: '🇲🇶', iso: 'MQ' },
  'Guadalupe':                 { currency: 'EUR', symbol: '€',   languageCode: 'fr-GP', languageLabel: 'Français',   flag: '🇬🇵', iso: 'GP' },
  'San Bartolomé':             { currency: 'EUR', symbol: '€',   languageCode: 'fr-BL', languageLabel: 'Français',   flag: '🇧🇱', iso: 'BL' },
  'Saint Martin':              { currency: 'EUR', symbol: '€',   languageCode: 'fr-MF', languageLabel: 'Français',   flag: '🇲🇫', iso: 'MF' },
  'Bonaire':                   { currency: 'USD', symbol: '$',   languageCode: 'nl-BQ', languageLabel: 'Papiamento', flag: '🇧🇶', iso: 'BQ' },
  'Saba':                      { currency: 'USD', symbol: '$',   languageCode: 'en-BQ', languageLabel: 'English',    flag: '🇧🇶', iso: 'BQ' },
  'Sint Eustatius':            { currency: 'USD', symbol: '$',   languageCode: 'nl-BQ', languageLabel: 'Nederlands', flag: '🇧🇶', iso: 'BQ' },
  'Bermudas':                  { currency: 'BMD', symbol: '$',   languageCode: 'en-BM', languageLabel: 'English',    flag: '🇧🇲', iso: 'BM' },
  'Haití':                     { currency: 'HTG', symbol: 'G',   languageCode: 'fr-HT', languageLabel: 'Français',   flag: '🇭🇹', iso: 'HT' },
  'Guyana Francesa':           { currency: 'EUR', symbol: '€',   languageCode: 'fr-GF', languageLabel: 'Français',   flag: '🇬🇫', iso: 'GF' },
  'Surinam':                   { currency: 'SRD', symbol: '$',   languageCode: 'nl-SR', languageLabel: 'Nederlands', flag: '🇸🇷', iso: 'SR' },
  'Guyana':                    { currency: 'GYD', symbol: '$',   languageCode: 'en-GY', languageLabel: 'English',    flag: '🇬🇾', iso: 'GY' },

  // ── Oceanía completa ───────────────────────────────────────────────────────
  'Papúa Nueva Guinea':        { currency: 'PGK', symbol: 'K',   languageCode: 'en-PG', languageLabel: 'English',    flag: '🇵🇬', iso: 'PG' },
  'Islas Salomón':             { currency: 'SBD', symbol: '$',   languageCode: 'en-SB', languageLabel: 'English',    flag: '🇸🇧', iso: 'SB' },
  'Vanuatu':                   { currency: 'VUV', symbol: 'Vt',  languageCode: 'bi-VU', languageLabel: 'Bislama',    flag: '🇻🇺', iso: 'VU' },
  'Samoa':                     { currency: 'WST', symbol: 'T',   languageCode: 'sm-WS', languageLabel: 'Samoan',     flag: '🇼🇸', iso: 'WS' },
  'Samoa Americana':           { currency: 'USD', symbol: '$',   languageCode: 'sm-AS', languageLabel: 'Samoan',     flag: '🇦🇸', iso: 'AS' },
  'Tonga':                     { currency: 'TOP', symbol: 'T$',  languageCode: 'to-TO', languageLabel: 'Tongan',     flag: '🇹🇴', iso: 'TO' },
  'Kiribati':                  { currency: 'AUD', symbol: '$',   languageCode: 'en-KI', languageLabel: 'English',    flag: '🇰🇮', iso: 'KI' },
  'Tuvalu':                    { currency: 'AUD', symbol: '$',   languageCode: 'en-TV', languageLabel: 'English',    flag: '🇹🇻', iso: 'TV' },
  'Nauru':                     { currency: 'AUD', symbol: '$',   languageCode: 'en-NR', languageLabel: 'English',    flag: '🇳🇷', iso: 'NR' },
  'Palaos':                    { currency: 'USD', symbol: '$',   languageCode: 'en-PW', languageLabel: 'English',    flag: '🇵🇼', iso: 'PW' },
  'Micronesia':                { currency: 'USD', symbol: '$',   languageCode: 'en-FM', languageLabel: 'English',    flag: '🇫🇲', iso: 'FM' },
  'Islas Marshall':            { currency: 'USD', symbol: '$',   languageCode: 'en-MH', languageLabel: 'English',    flag: '🇲🇭', iso: 'MH' },
  'Islas Marianas del Norte':  { currency: 'USD', symbol: '$',   languageCode: 'en-MP', languageLabel: 'English',    flag: '🇲🇵', iso: 'MP' },
  'Guam':                      { currency: 'USD', symbol: '$',   languageCode: 'en-GU', languageLabel: 'English',    flag: '🇬🇺', iso: 'GU' },
  'Polinesia Francesa':        { currency: 'XPF', symbol: 'F',   languageCode: 'fr-PF', languageLabel: 'Français',   flag: '🇵🇫', iso: 'PF' },
  'Tahití':                    { currency: 'XPF', symbol: 'F',   languageCode: 'fr-PF', languageLabel: 'Français',   flag: '🇵🇫', iso: 'PF' },
  'Nueva Caledonia':           { currency: 'XPF', symbol: 'F',   languageCode: 'fr-NC', languageLabel: 'Français',   flag: '🇳🇨', iso: 'NC' },
  'Wallis y Futuna':           { currency: 'XPF', symbol: 'F',   languageCode: 'fr-WF', languageLabel: 'Français',   flag: '🇼🇫', iso: 'WF' },
  'Islas Cook':                { currency: 'NZD', symbol: '$',   languageCode: 'en-CK', languageLabel: 'English',    flag: '🇨🇰', iso: 'CK' },
  'Niue':                      { currency: 'NZD', symbol: '$',   languageCode: 'en-NU', languageLabel: 'English',    flag: '🇳🇺', iso: 'NU' },
  'Tokelau':                   { currency: 'NZD', symbol: '$',   languageCode: 'en-TK', languageLabel: 'English',    flag: '🇹🇰', iso: 'TK' },
  'Isla de Navidad':           { currency: 'AUD', symbol: '$',   languageCode: 'en-CX', languageLabel: 'English',    flag: '🇨🇽', iso: 'CX' },
  'Islas Cocos':               { currency: 'AUD', symbol: '$',   languageCode: 'en-CC', languageLabel: 'English',    flag: '🇨🇨', iso: 'CC' },
  'Islas Norfolk':             { currency: 'AUD', symbol: '$',   languageCode: 'en-NF', languageLabel: 'English',    flag: '🇳🇫', iso: 'NF' },
  'Islas Pitcairn':            { currency: 'NZD', symbol: '$',   languageCode: 'en-PN', languageLabel: 'English',    flag: '🇵🇳', iso: 'PN' },
  'Hawái':                     { currency: 'USD', symbol: '$',   languageCode: 'en-US', languageLabel: 'English',    flag: '🇺🇸', iso: 'US' },

  // ── África completa ────────────────────────────────────────────────────────
  'Cabo Verde':                { currency: 'CVE', symbol: '$',   languageCode: 'pt-CV', languageLabel: 'Português',  flag: '🇨🇻', iso: 'CV' },
  'Santo Tomé y Príncipe':     { currency: 'STN', symbol: 'Db',  languageCode: 'pt-ST', languageLabel: 'Português',  flag: '🇸🇹', iso: 'ST' },
  'Guinea-Bisáu':              { currency: 'XOF', symbol: 'CFA', languageCode: 'pt-GW', languageLabel: 'Português',  flag: '🇬🇼', iso: 'GW' },
  'Guinea':                    { currency: 'GNF', symbol: 'Fr',  languageCode: 'fr-GN', languageLabel: 'Français',   flag: '🇬🇳', iso: 'GN' },
  'Guinea Ecuatorial':         { currency: 'XAF', symbol: 'CFA', languageCode: 'es-GQ', languageLabel: 'Español',    flag: '🇬🇶', iso: 'GQ' },
  'Gambia':                    { currency: 'GMD', symbol: 'D',   languageCode: 'en-GM', languageLabel: 'English',    flag: '🇬🇲', iso: 'GM' },
  'Sierra Leona':              { currency: 'SLL', symbol: 'Le',  languageCode: 'en-SL', languageLabel: 'English',    flag: '🇸🇱', iso: 'SL' },
  'Liberia':                   { currency: 'LRD', symbol: '$',   languageCode: 'en-LR', languageLabel: 'English',    flag: '🇱🇷', iso: 'LR' },
  'Costa de Marfil':           { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-CI', languageLabel: 'Français',   flag: '🇨🇮', iso: 'CI' },
  'Burkina Faso':              { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-BF', languageLabel: 'Français',   flag: '🇧🇫', iso: 'BF' },
  'Malí':                      { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-ML', languageLabel: 'Français',   flag: '🇲🇱', iso: 'ML' },
  'Mauritania':                { currency: 'MRU', symbol: 'UM',  languageCode: 'ar-MR', languageLabel: 'Arabic',     flag: '🇲🇷', iso: 'MR' },
  'Níger':                     { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-NE', languageLabel: 'Français',   flag: '🇳🇪', iso: 'NE' },
  'Chad':                      { currency: 'XAF', symbol: 'CFA', languageCode: 'fr-TD', languageLabel: 'Français',   flag: '🇹🇩', iso: 'TD' },
  'República Centroafricana':  { currency: 'XAF', symbol: 'CFA', languageCode: 'fr-CF', languageLabel: 'Français',   flag: '🇨🇫', iso: 'CF' },
  'República del Congo':       { currency: 'XAF', symbol: 'CFA', languageCode: 'fr-CG', languageLabel: 'Français',   flag: '🇨🇬', iso: 'CG' },
  'República Democrática del Congo': { currency: 'CDF', symbol: 'FC', languageCode: 'fr-CD', languageLabel: 'Français', flag: '🇨🇩', iso: 'CD' },
  'Congo':                     { currency: 'XAF', symbol: 'CFA', languageCode: 'fr-CG', languageLabel: 'Français',   flag: '🇨🇬', iso: 'CG' },
  'Gabón':                     { currency: 'XAF', symbol: 'CFA', languageCode: 'fr-GA', languageLabel: 'Français',   flag: '🇬🇦', iso: 'GA' },
  'Togo':                      { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-TG', languageLabel: 'Français',   flag: '🇹🇬', iso: 'TG' },
  'Benín':                     { currency: 'XOF', symbol: 'CFA', languageCode: 'fr-BJ', languageLabel: 'Français',   flag: '🇧🇯', iso: 'BJ' },
  'Eritrea':                   { currency: 'ERN', symbol: 'Nfk', languageCode: 'ti-ER', languageLabel: 'Tigrinya',   flag: '🇪🇷', iso: 'ER' },
  'Yibuti':                    { currency: 'DJF', symbol: 'Fdj', languageCode: 'fr-DJ', languageLabel: 'Français',   flag: '🇩🇯', iso: 'DJ' },
  'Somalia':                   { currency: 'SOS', symbol: 'Sh',  languageCode: 'so-SO', languageLabel: 'Somali',     flag: '🇸🇴', iso: 'SO' },
  'Sudán del Sur':             { currency: 'SSP', symbol: '£',   languageCode: 'en-SS', languageLabel: 'English',    flag: '🇸🇸', iso: 'SS' },
  'Burundi':                   { currency: 'BIF', symbol: 'Fr',  languageCode: 'fr-BI', languageLabel: 'Français',   flag: '🇧🇮', iso: 'BI' },
  'Malaui':                    { currency: 'MWK', symbol: 'MK',  languageCode: 'en-MW', languageLabel: 'English',    flag: '🇲🇼', iso: 'MW' },
  'Lesoto':                    { currency: 'LSL', symbol: 'L',   languageCode: 'st-LS', languageLabel: 'Sesotho',    flag: '🇱🇸', iso: 'LS' },
  'Suazilandia':               { currency: 'SZL', symbol: 'L',   languageCode: 'ss-SZ', languageLabel: 'Swati',      flag: '🇸🇿', iso: 'SZ' },
  'Esuatini':                  { currency: 'SZL', symbol: 'L',   languageCode: 'ss-SZ', languageLabel: 'Swati',      flag: '🇸🇿', iso: 'SZ' },
  'Comoras':                   { currency: 'KMF', symbol: 'Fr',  languageCode: 'ar-KM', languageLabel: 'Arabic',     flag: '🇰🇲', iso: 'KM' },
  'Seychelles':                { currency: 'SCR', symbol: '₨',   languageCode: 'fr-SC', languageLabel: 'Français',   flag: '🇸🇨', iso: 'SC' },
  'Mauricio':                  { currency: 'MUR', symbol: '₨',   languageCode: 'en-MU', languageLabel: 'English',    flag: '🇲🇺', iso: 'MU' },
  'Reunión':                   { currency: 'EUR', symbol: '€',   languageCode: 'fr-RE', languageLabel: 'Français',   flag: '🇷🇪', iso: 'RE' },
  'Mayotte':                   { currency: 'EUR', symbol: '€',   languageCode: 'fr-YT', languageLabel: 'Français',   flag: '🇾🇹', iso: 'YT' },
  'Isla de Santa Elena':       { currency: 'SHP', symbol: '£',   languageCode: 'en-SH', languageLabel: 'English',    flag: '🇸🇭', iso: 'SH' },
  'Sahara Occidental':         { currency: 'MAD', symbol: 'DH',  languageCode: 'ar-EH', languageLabel: 'Arabic',     flag: '🇪🇭', iso: 'EH' },

  // ── Asia completa + territorios ────────────────────────────────────────────
  'Hong Kong':                 { currency: 'HKD', symbol: '$',   languageCode: 'zh-HK', languageLabel: 'Cantonese',  flag: '🇭🇰', iso: 'HK' },
  'Macao':                     { currency: 'MOP', symbol: 'P',   languageCode: 'zh-MO', languageLabel: 'Cantonese',  flag: '🇲🇴', iso: 'MO' },
  'Corea del Norte':           { currency: 'KPW', symbol: '₩',   languageCode: 'ko-KP', languageLabel: 'Korean',     flag: '🇰🇵', iso: 'KP' },
  'Afganistán':                { currency: 'AFN', symbol: '؋',   languageCode: 'ps-AF', languageLabel: 'Pashto',     flag: '🇦🇫', iso: 'AF' },
  'Tayikistán':                { currency: 'TJS', symbol: 'SM',  languageCode: 'tg-TJ', languageLabel: 'Tajik',      flag: '🇹🇯', iso: 'TJ' },
  'Turkmenistán':              { currency: 'TMT', symbol: 'T',   languageCode: 'tk-TM', languageLabel: 'Turkmen',    flag: '🇹🇲', iso: 'TM' },
  'Yemén':                     { currency: 'YER', symbol: '﷼',   languageCode: 'ar-YE', languageLabel: 'Arabic',     flag: '🇾🇪', iso: 'YE' },
  'Siria':                     { currency: 'SYP', symbol: '£',   languageCode: 'ar-SY', languageLabel: 'Arabic',     flag: '🇸🇾', iso: 'SY' },
  'Irak':                      { currency: 'IQD', symbol: 'ع.د', languageCode: 'ar-IQ', languageLabel: 'Arabic',     flag: '🇮🇶', iso: 'IQ' },
  'Palestina':                 { currency: 'ILS', symbol: '₪',   languageCode: 'ar-PS', languageLabel: 'Arabic',     flag: '🇵🇸', iso: 'PS' },
  'Chipre del Norte':          { currency: 'TRY', symbol: '₺',   languageCode: 'tr-CY', languageLabel: 'Türkçe',     flag: '🇨🇾', iso: 'CY' },
  'Isla de Man':               { currency: 'GBP', symbol: '£',   languageCode: 'en-IM', languageLabel: 'English',    flag: '🇮🇲', iso: 'IM' },
  'Islas del Canal':           { currency: 'GBP', symbol: '£',   languageCode: 'en-GG', languageLabel: 'English',    flag: '🇬🇬', iso: 'GG' },
  'Guernsey':                  { currency: 'GBP', symbol: '£',   languageCode: 'en-GG', languageLabel: 'English',    flag: '🇬🇬', iso: 'GG' },
  'Jersey':                    { currency: 'GBP', symbol: '£',   languageCode: 'en-JE', languageLabel: 'English',    flag: '🇯🇪', iso: 'JE' },
  'Gibraltar':                 { currency: 'GIP', symbol: '£',   languageCode: 'es-GI', languageLabel: 'Español',    flag: '🇬🇮', iso: 'GI' },
  'Liechtenstein':             { currency: 'CHF', symbol: 'Fr',  languageCode: 'de-LI', languageLabel: 'Deutsch',    flag: '🇱🇮', iso: 'LI' },
  'San Marino':                { currency: 'EUR', symbol: '€',   languageCode: 'it-SM', languageLabel: 'Italiano',   flag: '🇸🇲', iso: 'SM' },
  'Ciudad del Vaticano':       { currency: 'EUR', symbol: '€',   languageCode: 'it-VA', languageLabel: 'Italiano',   flag: '🇻🇦', iso: 'VA' },
  'Escocia':                   { currency: 'GBP', symbol: '£',   languageCode: 'en-GB', languageLabel: 'English',    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso: 'GB' },
  'Gales':                     { currency: 'GBP', symbol: '£',   languageCode: 'cy-GB', languageLabel: 'Welsh',      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', iso: 'GB' },
  'Irlanda del Norte':         { currency: 'GBP', symbol: '£',   languageCode: 'en-GB', languageLabel: 'English',    flag: '🇬🇧', iso: 'GB' },
  'Islas Feroe':               { currency: 'DKK', symbol: 'kr',  languageCode: 'fo-FO', languageLabel: 'Faroese',    flag: '🇫🇴', iso: 'FO' },
  'Groenlandia':               { currency: 'DKK', symbol: 'kr',  languageCode: 'kl-GL', languageLabel: 'Kalaallisut',flag: '🇬🇱', iso: 'GL' },
  'Svalbard':                  { currency: 'NOK', symbol: 'kr',  languageCode: 'nb-NO', languageLabel: 'Norsk',      flag: '🇸🇯', iso: 'SJ' },
  'Åland':                     { currency: 'EUR', symbol: '€',   languageCode: 'sv-AX', languageLabel: 'Svenska',    flag: '🇦🇽', iso: 'AX' },
  'Macedonia':                 { currency: 'MKD', symbol: 'ден', languageCode: 'mk-MK', languageLabel: 'Macedonski', flag: '🇲🇰', iso: 'MK' },

  // ── Américas completo ──────────────────────────────────────────────────────
  'Belice':                    { currency: 'BZD', symbol: '$',   languageCode: 'en-BZ', languageLabel: 'English',    flag: '🇧🇿', iso: 'BZ' },
  'Islas Malvinas':            { currency: 'FKP', symbol: '£',   languageCode: 'en-FK', languageLabel: 'English',    flag: '🇫🇰', iso: 'FK' },
  'Islas Georgias del Sur':    { currency: 'SHP', symbol: '£',   languageCode: 'en-GS', languageLabel: 'English',    flag: '🇬🇸', iso: 'GS' },
  'Territorios Antárticos':    { currency: 'GBP', symbol: '£',   languageCode: 'en-AQ', languageLabel: 'English',    flag: '🇦🇶', iso: 'AQ' },
  'Alaska':                    { currency: 'USD', symbol: '$',   languageCode: 'en-US', languageLabel: 'English',    flag: '🇺🇸', iso: 'US' },
  'Islas Vírgenes de EE.UU':  { currency: 'USD', symbol: '$',   languageCode: 'en-VI', languageLabel: 'English',    flag: '🇻🇮', iso: 'VI' },
  'Isla Reunión':              { currency: 'EUR', symbol: '€',   languageCode: 'fr-RE', languageLabel: 'Français',   flag: '🇷🇪', iso: 'RE' },

  // ── Oriente Medio completo ─────────────────────────────────────────────────
  'Uzbekistán':                { currency: 'UZS', symbol: 'soʻm',languageCode: 'uz-UZ', languageLabel: 'Uzbek',      flag: '🇺🇿', iso: 'UZ' },
  'Kazajistán':                { currency: 'KZT', symbol: '₸',   languageCode: 'kk-KZ', languageLabel: 'Kazakh',     flag: '🇰🇿', iso: 'KZ' },
  'Kirguistán':                { currency: 'KGS', symbol: 'som', languageCode: 'ky-KG', languageLabel: 'Kyrgyz',     flag: '🇰🇬', iso: 'KG' },

  // ── Pacífico EEUU ──────────────────────────────────────────────────────────
  'Islas Marianas':            { currency: 'USD', symbol: '$',   languageCode: 'en-MP', languageLabel: 'English',    flag: '🇲🇵', iso: 'MP' },
  'Islas Wake':                { currency: 'USD', symbol: '$',   languageCode: 'en-UM', languageLabel: 'English',    flag: '🇺🇲', iso: 'UM' },
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

// Exhaustive English → Spanish map (OSM returns English country names)
const EN_TO_ES = {
  // Europe
  'Spain':'España','France':'Francia','Germany':'Alemania','Italy':'Italia',
  'Portugal':'Portugal','United Kingdom':'Reino Unido','Great Britain':'Reino Unido',
  'England':'Reino Unido','Scotland':'Reino Unido','Wales':'Reino Unido',
  'Netherlands':'Países Bajos','Holland':'Países Bajos','Belgium':'Bélgica',
  'Switzerland':'Suiza','Austria':'Austria','Sweden':'Suecia','Norway':'Noruega',
  'Denmark':'Dinamarca','Finland':'Finlandia','Greece':'Grecia','Croatia':'Croacia',
  'Czech Republic':'República Checa','Czechia':'República Checa','Poland':'Polonia',
  'Hungary':'Hungría','Romania':'Rumanía','Bulgaria':'Bulgaria','Slovakia':'Eslovaquia',
  'Slovenia':'Eslovenia','Serbia':'Serbia','Montenegro':'Montenegro',
  'Bosnia and Herzegovina':'Bosnia','Bosnia & Herzegovina':'Bosnia',
  'Albania':'Albania','North Macedonia':'Macedonia','Kosovo':'Kosovo',
  'Estonia':'Estonia','Latvia':'Letonia','Lithuania':'Lituania','Iceland':'Islandia',
  'Ireland':'Irlanda','Luxembourg':'Luxemburgo','Malta':'Malta','Cyprus':'Chipre',
  'Turkey':'Turquía','Russia':'Rusia','Ukraine':'Ucrania','Belarus':'Bielorrusia',
  'Moldova':'Moldova','Georgia':'Georgia','Armenia':'Armenia','Azerbaijan':'Azerbaiyán',
  'Kazakhstan':'Kazajistán','Uzbekistan':'Uzbekistán','Kyrgyzstan':'Kirguistán',
  'Tajikistan':'Tayikistán','Turkmenistan':'Turkmenistán',
  'Monaco':'Mónaco','Andorra':'Andorra','San Marino':'San Marino',
  'Liechtenstein':'Liechtenstein',
  // Americas
  'United States':'Estados Unidos','United States of America':'Estados Unidos',
  'USA':'Estados Unidos','US':'Estados Unidos',
  'Canada':'Canadá','Mexico':'México','Brazil':'Brasil','Argentina':'Argentina',
  'Colombia':'Colombia','Chile':'Chile','Peru':'Perú','Venezuela':'Venezuela',
  'Ecuador':'Ecuador','Bolivia':'Bolivia','Paraguay':'Paraguay','Uruguay':'Uruguay',
  'Cuba':'Cuba','Dominican Republic':'República Dominicana',
  'Costa Rica':'Costa Rica','Panama':'Panamá','Guatemala':'Guatemala',
  'Honduras':'Honduras','El Salvador':'El Salvador','Nicaragua':'Nicaragua',
  'Belize':'Belice','Jamaica':'Jamaica','Haiti':'Haití',
  'Trinidad and Tobago':'Trinidad y Tobago','Barbados':'Barbados',
  'Bahamas':'Bahamas','Puerto Rico':'Puerto Rico','Guyana':'Guyana',
  'Suriname':'Surinam',
  // Asia
  'Japan':'Japón','China':'China','South Korea':'Corea del Sur','Korea':'Corea del Sur',
  'North Korea':'Corea del Norte','Thailand':'Tailandia','Vietnam':'Vietnam',
  'Indonesia':'Indonesia','Philippines':'Filipinas','Malaysia':'Malasia',
  'Singapore':'Singapur','Myanmar':'Myanmar','Burma':'Myanmar','Cambodia':'Camboya',
  'Laos':'Laos','India':'India','Nepal':'Nepal','Pakistan':'Pakistán',
  'Bangladesh':'Bangladés','Sri Lanka':'Sri Lanka','Maldives':'Maldivas',
  'Afghanistan':'Afganistán','Iran':'Irán','Irak':'Irak','Iraq':'Irak',
  'Saudi Arabia':'Arabia Saudí','Saudi':'Arabia Saudí',
  'United Arab Emirates':'Emiratos Árabes','UAE':'Emiratos Árabes',
  'Qatar':'Qatar','Kuwait':'Kuwait','Bahrain':'Baréin','Oman':'Omán',
  'Yemen':'Yemen','Jordan':'Jordania','Lebanon':'Líbano','Syria':'Siria',
  'Israel':'Israel','Palestine':'Palestina','Taiwan':'Taiwán',
  'Hong Kong':'Hong Kong','Macau':'Macao','Mongolia':'Mongolia','Bhutan':'Bután',
  'Brunei':'Brunéi','Timor-Leste':'Timor Oriental',
  // Africa
  'Morocco':'Marruecos','Egypt':'Egipto','Tunisia':'Túnez','Algeria':'Argelia',
  'Libya':'Libia','South Africa':'Sudáfrica','Kenya':'Kenia','Tanzania':'Tanzania',
  'Ethiopia':'Etiopía','Nigeria':'Nigeria','Ghana':'Ghana','Senegal':'Senegal',
  "Ivory Coast":"Costa de Marfil","Côte d'Ivoire":"Costa de Marfil",
  'Cameroon':'Camerún','Rwanda':'Ruanda','Uganda':'Uganda',
  'Mozambique':'Mozambique','Zimbabwe':'Zimbabue','Zambia':'Zambia',
  'Botswana':'Botsuana','Namibia':'Namibia','Madagascar':'Madagascar',
  'Mauritius':'Mauricio','Seychelles':'Seychelles','Cape Verde':'Cabo Verde',
  'Sudan':'Sudán','South Sudan':'Sudán del Sur','Somalia':'Somalia',
  'Mali':'Malí','Niger':'Níger','Chad':'Chad',
  'Democratic Republic of the Congo':'República Democrática del Congo',
  'Republic of the Congo':'República del Congo','Congo':'Congo',
  'Angola':'Angola','Gabon':'Gabón','Equatorial Guinea':'Guinea Ecuatorial',
  'Gambia':'Gambia','The Gambia':'Gambia','Eswatini':'Suazilandia',
  'Swaziland':'Suazilandia',
  // Oceania
  'Australia':'Australia','New Zealand':'Nueva Zelanda','Fiji':'Fiyi',
  'Papua New Guinea':'Papúa Nueva Guinea','Samoa':'Samoa','Tonga':'Tonga',
  'Vanuatu':'Vanuatu',
};

export function normalizeCountry(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // 1. Direct English match
  if (EN_TO_ES[trimmed]) return EN_TO_ES[trimmed];
  // 2. Case-insensitive English match
  const lc = trimmed.toLowerCase();
  const engMatch = Object.keys(EN_TO_ES).find(k => k.toLowerCase() === lc);
  if (engMatch) return EN_TO_ES[engMatch];
  // 3. Direct Spanish match (already correct)
  const n = normalizeText(trimmed);
  const found = Object.keys(KNOWN_META).find((k) => normalizeText(k) === n);
  return found || trimmed;
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

  return 1;
}

// ─── AVAILABLE CURRENCIES for a trip ─────────────────────────────────────────
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