import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/useAuthStore';

import { ENV } from '../../config/env';

// Normalize API base URL - remove trailing slash to avoid double slashes
const getApiBaseUrl = (): string => {
  return ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL in development
if (ENV.ENABLE_LOGGING) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private navigationRef: any = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public setNavigationRef(ref: any): void {
    this.navigationRef = ref;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          // Avoid trying to refresh while calling refresh
          if (originalRequest.url?.includes('/auth/refresh')) {
            await this.clearAuthAndRedirect();
            return Promise.reject(this.handleError(error));
          }

          const newAccessToken = await this.refreshAccessToken();
          if (newAccessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          }

          await this.clearAuthAndRedirect();
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      const authStorage = await AsyncStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth-storage');
      await AsyncStorage.removeItem('refresh-token');
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh-token');
    } catch {
      return null;
    }
  }

  private async clearAuthAndRedirect(): Promise<void> {
    await this.clearAuth();
    const { logout } = useAuthStore.getState();
    logout();

    // Navigate to login screen
    if (this.navigationRef?.current) {
      this.navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await axios.post<{
          accessToken: string;
          refreshToken?: string;
          expiresIn?: number;
        }>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        if (newAccessToken) {
          // Update auth store with new access token
          const { setToken } = useAuthStore.getState();
          setToken(newAccessToken);

          // If backend rotates refresh token, persist it
          if (response.data.refreshToken) {
            await AsyncStorage.setItem(
              'refresh-token',
              response.data.refreshToken
            );
          }

          return newAccessToken;
        }

        return null;
      } catch {
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message =
        (error.response.data as { message?: string })?.message ||
        error.message ||
        'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response - this is a network error
      const errorMessage =
        error.code === 'ECONNABORTED'
          ? 'Request timeout. The server is taking too long to respond.'
          : error.code === 'ERR_NETWORK'
            ? `Network error. Cannot connect to API at ${API_BASE_URL}. Please check:\n1. The API server is running\n2. CORS is configured correctly\n3. Your internet connection`
            : 'Network error. Please check your connection and API server status.';

      // Log detailed error in development
      if (ENV.ENABLE_LOGGING) {
        console.error('🚨 Network Error Details:', {
          code: error.code,
          message: error.message,
          baseURL: API_BASE_URL,
          config: error.config?.url,
        });
      }

      return new Error(errorMessage);
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  public get<T = unknown>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();

