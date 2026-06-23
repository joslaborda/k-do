import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './es.json';
import en from './en.json';

const STORAGE_KEY = 'kodo_language';

// Get saved language — localStorage first, then browser, then 'es'
const getSavedLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const SUPPORTED_LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: getSavedLanguage() || DEFAULT_LANGUAGE,
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
    detection: {
      // Only use localStorage, not browser — we control this explicitly
      order: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export const setLanguage = (lang) => {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
};

export const getLanguage = () => i18n.language || DEFAULT_LANGUAGE;

export default i18n;
