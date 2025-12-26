import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/useThemeStore';

export const useTheme = () => {
  const systemColorScheme = useColorScheme() || 'light';
  const { themeMode } = useThemeStore();
  
  const effectiveTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemColorScheme || 'light') : themeMode;

  return {
    theme: effectiveTheme,
    themeMode,
    setThemeMode: useThemeStore(state => state.setThemeMode),
  };
};

