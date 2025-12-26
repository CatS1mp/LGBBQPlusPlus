import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/config';
import { Locale } from '../i18n/config';

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      locale: 'en',
      setLocale: (locale: Locale) => {
        set({ locale });
        i18n.changeLanguage(locale);
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        if (state?.locale) {
          i18n.changeLanguage(state.locale);
        }
        return state;
      },
    }
  )
);

