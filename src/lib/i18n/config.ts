import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enCommon from '../../locales/en/common.json';
import enPages from '../../locales/en/pages.json';
import viCommon from '../../locales/vi/common.json';
import viPages from '../../locales/vi/pages.json';

export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

// Initialize i18n synchronously first
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: {
      common: enCommon,
      pages: enPages,
    },
    vi: {
      common: viCommon,
      pages: viPages,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
});

// Load saved language asynchronously and update
AsyncStorage.getItem('language-storage')
  .then(saved => {
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.state?.locale && locales.includes(parsed.state.locale)) {
          i18n.changeLanguage(parsed.state.locale);
        }
      } catch (error) {
        console.error('Error parsing saved language:', error);
      }
    }
  })
  .catch(error => {
    console.error('Error loading saved language:', error);
  });

// Listen for language changes from store
if (typeof window !== 'undefined') {
  // For web compatibility, but React Native doesn't have window
  // This will be handled by useLanguageInit hook
}

export default i18n;
