/**
 * Environment configuration
 * Reads from .env file using react-native-config
 */
import Config from 'react-native-config';

const getApiUrl = (): string => {
  const apiUrl = Config.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined in .env file. Please add NEXT_PUBLIC_API_URL=your_api_url to your .env file.'
    );
  }

  return apiUrl;
};

export const ENV = {
  NEXT_PUBLIC_API_URL: getApiUrl(),
  API_TIMEOUT: 15000, // Reduced from 30s to 15s for better UX
  ENABLE_LOGGING: __DEV__,
} as const;

