import { useEffect } from 'react';
import { useLanguageStore } from '../stores/useLanguageStore';
import i18n from '../i18n/config';

/**
 * Hook to initialize language from storage on app mount
 * This ensures the language is loaded before components render
 */
export const useLanguageInit = () => {
  const { locale } = useLanguageStore();

  useEffect(() => {
    // Ensure i18n is set to the current locale from store
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch(error => {
        console.error('Error changing language:', error);
      });
    }
  }, [locale]);
};

