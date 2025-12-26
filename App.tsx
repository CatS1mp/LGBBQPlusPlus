import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useTheme } from './src/lib/hooks/useTheme';
import { useLanguageInit } from './src/lib/hooks/useLanguageInit';

// Initialize i18n with error handling
try {
  require('./src/lib/i18n/config');
} catch (error) {
  console.error('Failed to initialize i18n:', error);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App(): React.JSX.Element {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  useLanguageInit(); // Initialize language from storage

  React.useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? '#0b0b16' : '#ffffff'}
          />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
