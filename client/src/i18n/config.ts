import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources.js';
import { syncDocumentDirection } from './syncDocumentDirection.js';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'en',
    supportedLngs: ['ar', 'en'],
    defaultNS: 'common',
    ns: ['common', 'nav'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'university_i18nLng',
    },
  });

i18n.on('languageChanged', (lng) => {
  syncDocumentDirection(lng);
});

syncDocumentDirection(i18n.language);

export default i18n;
