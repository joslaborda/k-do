const COUNTRY_CONFIGS = {
  'España': { currency: 'EUR', symbol: '€', locale: 'es-ES', lang: 'Spanish', langNative: 'Español', flag: '🇪🇸' },
  'Italia': { currency: 'EUR', symbol: '€', locale: 'it-IT', lang: 'Italian', langNative: 'Italiano', flag: '🇮🇹' },
  'Francia': { currency: 'EUR', symbol: '€', locale: 'fr-FR', lang: 'French', langNative: 'Français', flag: '🇫🇷' },
  'Portugal': { currency: 'EUR', symbol: '€', locale: 'pt-PT', lang: 'Portuguese', langNative: 'Português', flag: '🇵🇹' },
  'Alemania': { currency: 'EUR', symbol: '€', locale: 'de-DE', lang: 'German', langNative: 'Deutsch', flag: '🇩🇪' },
  'Reino Unido': { currency: 'GBP', symbol: '£', locale: 'en-GB', lang: 'English', langNative: 'English', flag: '🇬🇧' },
  'Estados Unidos': { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🇺🇸' },
  'Mexico': { currency: 'MXN', symbol: '$', locale: 'es-MX', lang: 'Spanish', langNative: 'Español', flag: '🇲🇽' },
  'México': { currency: 'MXN', symbol: '$', locale: 'es-MX', lang: 'Spanish', langNative: 'Español', flag: '🇲🇽' },
  'Argentina': { currency: 'ARS', symbol: '$', locale: 'es-AR', lang: 'Spanish', langNative: 'Español', flag: '🇦🇷' },
  'Brasil': { currency: 'BRL', symbol: 'R$', locale: 'pt-BR', lang: 'Portuguese', langNative: 'Português', flag: '🇧🇷' },
  'Japon': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
  'Japón': { currency: 'JPY', symbol: '¥', locale: 'ja-JP', lang: 'Japanese', langNative: '日本語', flag: '🇯🇵' },
  'Tailandia': { currency: 'THB', symbol: '฿', locale: 'th-TH', lang: 'Thai', langNative: 'ภาษาไทย', flag: '🇹🇭' },
  'Corea del Sur': { currency: 'KRW', symbol: '₩', locale: 'ko-KR', lang: 'Korean', langNative: '한국어', flag: '🇰🇷' },
  'China': { currency: 'CNY', symbol: '¥', locale: 'zh-CN', lang: 'Chinese', langNative: '中文', flag: '🇨🇳' },
  'Vietnam': { currency: 'VND', symbol: '₫', locale: 'vi-VN', lang: 'Vietnamese', langNative: 'Tiếng Việt', flag: '🇻🇳' },
  'Singapur': { currency: 'SGD', symbol: '$', locale: 'en-SG', lang: 'English', langNative: 'English', flag: '🇸🇬' },
  'Indonesia': { currency: 'IDR', symbol: 'Rp', locale: 'id-ID', lang: 'Indonesian', langNative: 'Bahasa Indonesia', flag: '🇮🇩' },
  'Marruecos': { currency: 'MAD', symbol: 'DH', locale: 'ar-MA', lang: 'Arabic', langNative: 'العربية', flag: '🇲🇦' },
  'Turquia': { currency: 'TRY', symbol: '₺', locale: 'tr-TR', lang: 'Turkish', langNative: 'Türkçe', flag: '🇹🇷' },
  'Turquía': { currency: 'TRY', symbol: '₺', locale: 'tr-TR', lang: 'Turkish', langNative: 'Türkçe', flag: '🇹🇷' },
  'Suiza': { currency: 'CHF', symbol: 'Fr', locale: 'de-CH', lang: 'German', langNative: 'Deutsch', flag: '🇨🇭' },
  'Grecia': { currency: 'EUR', symbol: '€', locale: 'el-GR', lang: 'Greek', langNative: 'Ελληνικά', flag: '🇬🇷' },
};

const DEFAULT_CONFIG = { currency: 'USD', symbol: '$', locale: 'en-US', lang: 'English', langNative: 'English', flag: '🌍' };

export function getCountryConfig(country) {
  if (!country) return DEFAULT_CONFIG;
  return (
    COUNTRY_CONFIGS[country] ||
    Object.entries(COUNTRY_CONFIGS).find(([k]) => k.toLowerCase() === country.toLowerCase())?.[1] ||
    DEFAULT_CONFIG
  );
}