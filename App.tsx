import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useTheme } from './src/lib/hooks/useTheme';
import { useLanguageInit } from './src/lib/hooks/useLanguageInit';
import { apiClient } from './src/lib/api/client';
import { Toast } from './src/components/ui/Toast';
import { useToastStore } from './src/lib/stores/useToastStore';
import {
  checkApiServer,
  getApiInfo,
  testApiInBrowser,
  getApiDiagnostics,
  testNetworkConnectivity,
} from './src/lib/utils/api';

// Initialize i18n with error handling
try {
  require('./src/lib/i18n/config');
} catch (error) {
  console.error('Failed to initialize i18n:', error);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduced from 2 to 1 for faster failure handling
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false, // Disable refetch on window focus to improve performance
      refetchOnReconnect: true, // Keep refetch on reconnect for network recovery
    },
  },
});

// Set queryClient in apiClient to enable query invalidation when mock mode is disabled
apiClient.setQueryClient(queryClient);

function App(): React.JSX.Element {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  useLanguageInit(); // Initialize language from storage
  const { message, type, visible, hideToast } = useToastStore();

  React.useEffect(() => {
    console.log('App component mounted');
    
    // Expose API check functions to global scope for debugging
    if (__DEV__ && typeof global !== 'undefined') {
      (global as any).checkApiServer = checkApiServer;
      (global as any).getApiInfo = getApiInfo;
      (global as any).testApiInBrowser = testApiInBrowser;
      (global as any).getApiDiagnostics = getApiDiagnostics;
      (global as any).testNetworkConnectivity = testNetworkConnectivity;
      console.log('💡 [Dev Tools] API check functions available:');
      console.log('  - checkApiServer() - Check if API server is online');
      console.log('  - getApiInfo() - Get API configuration info');
      console.log('  - testApiInBrowser() - Get URLs to test in browser');
      console.log('  - getApiDiagnostics() - Get troubleshooting guide');
      console.log('  - testNetworkConnectivity() - Test network connectivity');
    }
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
          <Toast
            message={message || ''}
            type={type}
            visible={visible}
            onDismiss={hideToast}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
