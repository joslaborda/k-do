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

// index.html traía <html lang="en"> fijo desde siempre, sin importar el
// idioma real que i18next estuviera sirviendo (por defecto 'es' para casi
// todo el mundo). El navegador y Google Translate usan ese atributo para
// decidir de qué idioma traducir — con el valor equivocado, "traducían"
// texto que ya estaba en español, produciendo resultados sin sentido (p.ej.
// "Guardados" convertido en texto random) en vez de simplemente no traducir
// nada, que es lo correcto ya que la app tiene su propio i18n completo.
// Se mantiene sincronizado en dos momentos: al resolver el idioma inicial
// (evento 'languageChanged' de i18next, que se dispara también en el
// arranque) y cada vez que cambia explícitamente vía setLanguage().
i18n.on('languageChanged', (lng) => {
  try {
    document.documentElement.lang = lng;
  } catch {}
});
// El evento de arriba puede no cubrir la resolución inicial si i18next la
// resuelve de forma síncrona durante el propio .init() (antes de que el
// listener quede registrado, ya que se pasa un "lng" explícito arriba en vez
// de depender solo de LanguageDetector) — se fija el valor actual ya mismo
// como red de seguridad.
try {
  document.documentElement.lang = i18n.language || DEFAULT_LANGUAGE;
} catch {}

export const setLanguage = (lang) => {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
};

export const getLanguage = () => i18n.language || DEFAULT_LANGUAGE;

export default i18n;
