import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/useAuthStore';
import { QueryClient } from '@tanstack/react-query';

import { ENV } from '../../config/env';

// Normalize API base URL - remove trailing slash to avoid double slashes
const getApiBaseUrl = (): string => {
  return ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
};

const API_BASE_URL = getApiBaseUrl();


class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private navigationRef: any = null;
  private queryClient: QueryClient | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      // SSL/TLS configuration
      // React Native uses system certificates by default
      // Android network security config handles SSL trust
      // For development: network_security_config.xml allows user certificates
      // For production: only system certificates are trusted
      // DO NOT use transformRequest for FormData in React Native
      // React Native's FormData polyfill needs to handle serialization directly
      // transformRequest can interfere with React Native's FormData handling
    });

    this.setupInterceptors();
  }

  public setNavigationRef(ref: any): void {
    this.navigationRef = ref;
  }

  public setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Handle FormData uploads - React Native requires special handling
        if (config.data instanceof FormData && config.headers) {
          if (__DEV__) {
            console.log('🔍 [Interceptor] FormData detected');
            console.log('   URL:', config.url);
            console.log('   Method:', config.method);
            console.log('   Has Authorization:', !!config.headers.Authorization);
          }
          
          // CRITICAL: Remove Content-Type header for FormData
          // React Native's FormData polyfill will set it with proper boundary
          delete config.headers['Content-Type'];
          
          if (__DEV__) {
            console.log('   Content-Type removed, FormData will set boundary');
          }
        }
        
        return config;
      },
      (error: unknown) => {
        if (__DEV__) {
          console.error('❌ [Interceptor] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // If API call succeeds, disable mock mode and invalidate queries
        const { useMockModeStore } = require('../stores/useMockModeStore');
        if (useMockModeStore.getState().isMockMode) {
          useMockModeStore.getState().setMockMode(false);
          // Only invalidate active queries to avoid unnecessary refetch
          if (this.queryClient) {
            this.queryClient.invalidateQueries({
              refetchType: 'active', // Only refetch active queries, not all cached queries
            });
          }
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 503 Service Unavailable - enable mock mode
        if (error.response?.status === 503) {
          const { useMockModeStore } = await import('../stores/useMockModeStore');
          useMockModeStore.getState().setMockMode(true);
          useMockModeStore.getState().setLastNetworkError('Service unavailable (503). Database or server is down.');
          
        }

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
    
    // Clear print progress on logout
    try {
      const { usePrintProgressStore } = await import('../stores/usePrintProgressStore');
      await usePrintProgressStore.getState().clearProgress();
    } catch (error) {
      console.error('Error clearing print progress on logout:', error);
    }
    
    const { logout } = useAuthStore.getState();
    logout();

    // Navigate to login screen
    if (this.navigationRef?.isReady()) {
      this.navigationRef.reset({
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
      const status = error.response.status;
      const errorData = error.response.data as { message?: string } | string;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || error.message || 'An error occurred';
      
      // Handle 404 or "No static resource" errors - enable mock mode
      if (status === 404 || errorMessage.includes('No static resource')) {
        const mockErrorMessage = `API endpoint not found (404). Using mock data.`;
        
        // Enable mock mode on 404 errors
        import('../stores/useMockModeStore').then(({ useMockModeStore }) => {
          useMockModeStore.getState().setMockMode(true);
          useMockModeStore.getState().setLastNetworkError(mockErrorMessage);
          
        });

        return new Error(mockErrorMessage);
      }
      
      // Handle 503 Service Unavailable as network/database unavailable
      if (status === 503) {
        const serviceErrorMessage = 'Service unavailable. Database or server is down.';
        
        // Enable mock mode on 503 errors
        import('../stores/useMockModeStore').then(({ useMockModeStore }) => {
          useMockModeStore.getState().setMockMode(true);
          useMockModeStore.getState().setLastNetworkError(serviceErrorMessage);
        });

        return new Error(serviceErrorMessage);
      }
      
      return new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response - this is a network error
      // This means: request was sent but no response received (CLIENT-SIDE ERROR, not from API)

      const errorMessage =
        error.code === 'ECONNABORTED'
          ? 'Request timeout. The server is taking too long to respond.'
          : error.code === 'ERR_NETWORK'
            ? `Network error. Cannot connect to API at ${API_BASE_URL}. Please check:\n1. The API server is running\n2. Your internet connection\n3. SSL certificate is valid`
          : error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
            ? `SSL certificate error. Please check the API server certificate.`
          : error.message || 'Network error. Please check your connection and API server status.';

      // Enable mock mode on network errors
      import('../stores/useMockModeStore').then(({ useMockModeStore }) => {
        useMockModeStore.getState().setMockMode(true);
        useMockModeStore.getState().setLastNetworkError(errorMessage);
      });

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

  /**
   * Check if API server is running and accessible
   * @returns Server status information
   */
  public async checkServerStatus(): Promise<{
    isOnline: boolean;
    baseUrl: string;
    responseTime?: number;
    error?: string;
    statusCode?: number;
  }> {
    const startTime = Date.now();
    const testEndpoint = '/health'; // Try health endpoint first
    const fallbackEndpoint = '/auth/login'; // Fallback to public endpoint

    try {
      // Try health endpoint first (if available)
      try {
        const response = await this.client.get(testEndpoint, {
          timeout: 5000, // Shorter timeout for health check
        });
        const responseTime = Date.now() - startTime;

        return {
          isOnline: true,
          baseUrl: API_BASE_URL,
          responseTime,
          statusCode: response.status,
        };
      } catch (healthError) {
        const healthAxiosError = healthError as AxiosError;
        const statusCode = healthAxiosError.response?.status;
        const hasResponse = !!healthAxiosError.response;
        const isNetworkError = healthAxiosError.code === 'ERR_NETWORK' || !hasResponse;

        // 401 Unauthorized means server is running but requires auth
        if (statusCode === 401) {
          const responseTime = Date.now() - startTime;

          return {
            isOnline: true,
            baseUrl: API_BASE_URL,
            responseTime,
            statusCode: 401,
          };
        }

        // If health endpoint doesn't exist (404) or network error, try fallback
        // Network error might mean endpoint doesn't exist, so try known working endpoint
        if (statusCode === 404 || isNetworkError) {
          // Health endpoint not found, try fallback with POST (same as login)
          const fallbackStartTime = Date.now();
          try {
            // Try POST to /auth/login with empty body (will return 400/401 but proves server is online)
            const response = await this.client.post(
              fallbackEndpoint,
              {}, // Empty body
              {
                timeout: 5000,
              }
            );
            const responseTime = Date.now() - fallbackStartTime;

            return {
              isOnline: true,
              baseUrl: API_BASE_URL,
              responseTime,
              statusCode: response.status,
            };
          } catch (fallbackError) {
            const fallbackAxiosError = fallbackError as AxiosError;
            const fallbackStatusCode = fallbackAxiosError.response?.status;
            
            // Any response status (400, 401, 422, etc.) means server is online
            if (fallbackStatusCode && fallbackStatusCode >= 400) {
              const responseTime = Date.now() - fallbackStartTime;

              return {
                isOnline: true,
                baseUrl: API_BASE_URL,
                responseTime,
                statusCode: fallbackStatusCode,
              };
            }
            throw fallbackError;
          }
        } else {
          throw healthError;
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const axiosError = error as AxiosError;
      
      const errorMessage = axiosError.response
        ? `Server responded with status ${axiosError.response.status}`
        : axiosError.code === 'ECONNABORTED'
          ? 'Request timeout'
          : axiosError.code === 'ERR_NETWORK'
            ? 'Cannot connect to server'
            : axiosError.message || 'Unknown error';


      return {
        isOnline: false,
        baseUrl: API_BASE_URL,
        responseTime,
        error: errorMessage,
        statusCode: axiosError.response?.status,
      };
    }
  }

  /**
   * Upload file using multiple methods with fallback
   * 1. XMLHttpRequest (default)
   * 2. Axios POST (fallback)
   * 3. Fetch API (last resort)
   * Returns AxiosResponse-like object for compatibility
   */
  public async uploadFile<T = unknown>(
    url: string,
    formData: FormData,
    config?: { timeout?: number; useAxios?: boolean; useFetch?: boolean }
  ): Promise<AxiosResponse<T>> {
    const token = await this.getToken();
    
    // Ensure we don't have duplicate /api in URL
    // Expected final URL: https://.../api/students/files/upload
    let finalUrl = url;
    
    // If API_BASE_URL already ends with /api, remove /api from start of url
    if (API_BASE_URL.endsWith('/api') && url.startsWith('/api')) {
      finalUrl = url.substring(4); // Remove '/api' from start
    }
    // If API_BASE_URL doesn't end with /api, ensure url starts with /api
    else if (!API_BASE_URL.endsWith('/api') && !url.startsWith('/api')) {
      finalUrl = `/api${url}`;
    }
    
    const fullUrl = `${API_BASE_URL}${finalUrl}`;
    const timeout = config?.timeout || 120000; // Default 120s for uploads
    const useAxios = config?.useAxios ?? true; // Default to axios (more reliable)
    const useFetch = config?.useFetch || false;
    
    // Debug logging
    if (__DEV__) {
      console.log('🔍 [UPLOAD DEBUG] Upload Configuration:');
      console.log('  API_BASE_URL:', API_BASE_URL);
      console.log('  Input URL:', url);
      console.log('  Final URL part:', finalUrl);
      console.log('  Full URL:', fullUrl);
      console.log('  Method:', useFetch ? 'Fetch' : useAxios ? 'Axios' : 'XHR');
      console.log('  Timeout:', timeout, 'ms');
      console.log('  Has Token:', !!token);
      console.log('  Token Length:', token?.length || 0);
      console.log('  FormData Type:', typeof formData);
      console.log('  FormData Instance:', formData instanceof FormData);
    }


    // Try fetch API if requested (last resort)
    if (useFetch) {
      try {
        if (__DEV__) {
          console.log('🌐 [UPLOAD] Using Fetch API method');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        // Don't set Content-Type - let fetch handle FormData boundary

        if (__DEV__) {
          console.log('📤 [FETCH] Sending request:', {
            url: fullUrl,
            method: 'POST',
            hasToken: !!token,
            timeout: timeout,
          });
        }

        const response = await fetch(fullUrl, {
          method: 'POST',
          body: formData as any,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (__DEV__) {
          console.log('📥 [FETCH] Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          if (__DEV__) {
            console.error('❌ [FETCH] Response not OK:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
            });
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as T;
        
        if (__DEV__) {
          console.log('✅ [FETCH] Upload successful');
        }

        // Convert fetch response to AxiosResponse-like object
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headersObj[key.toLowerCase()] = value;
        });

        const axiosResponse = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: headersObj,
          config: {
            url,
            method: 'post',
            timeout,
          },
        } as unknown as AxiosResponse<T>;


        return axiosResponse;
      } catch (error: any) {
        if (__DEV__) {
          console.error('❌ [FETCH] Upload failed:', {
            message: error?.message,
            name: error?.name,
            code: error?.code,
            isAbort: error?.name === 'AbortError',
          });
        }
        throw error;
      }
    }

    // Try axios if requested (preferred method)
    if (useAxios) {
      try {
        if (__DEV__) {
          console.log('📡 [UPLOAD] Using Axios method');
          console.log('📡 [AXIOS] FormData check:', {
            isFormData: formData instanceof FormData,
            formDataType: typeof formData,
          });
        }
        
        // CRITICAL: For React Native FormData, axios needs special config
        // maxContentLength and maxBodyLength must be set for large files
        // Use direct axios.post to bypass interceptors that might interfere with FormData
        
        // Create axios instance without interceptors for FormData uploads
        // This avoids interceptors modifying FormData or headers incorrectly
        const uploadAxios = axios.create({
          baseURL: API_BASE_URL,
          timeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // CRITICAL: Do NOT set Content-Type - React Native FormData polyfill will set it
          },
        });
        
        if (__DEV__) {
          console.log('📡 [AXIOS] Making direct POST request (bypassing interceptors)');
          console.log('📡 [AXIOS] Using finalUrl:', finalUrl);
        }
        
        const response = await uploadAxios.post<T>(finalUrl, formData);
        
        if (__DEV__) {
          console.log('✅ [AXIOS] Upload successful:', {
            status: response.status,
            statusText: response.statusText,
          });
        }
        
        return response;
      } catch (error: any) {
        if (__DEV__) {
          const errorInfo = {
            message: error?.message,
            code: error?.code,
            name: error?.name,
            isNetworkError: error?.code === 'ERR_NETWORK' || error?.message?.includes('Network'),
            isTimeout: error?.code === 'ECONNABORTED',
            isSSLError: error?.code?.includes('CERT') || error?.code?.includes('SSL'),
            hasResponse: !!error?.response,
            responseStatus: error?.response?.status,
            responseData: error?.response?.data,
            requestUrl: error?.config?.url,
            requestMethod: error?.config?.method,
            requestHeaders: error?.config?.headers,
            stack: error?.stack,
          };
          console.error('❌ [AXIOS] Upload failed:', errorInfo);
          
          // Additional debug for FormData issues
          if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
            console.error('🔍 [AXIOS] FormData Debug:');
            console.error('  FormData instance:', formData instanceof FormData);
            console.error('  FormData type:', typeof formData);
            console.error('  Full URL:', fullUrl);
            console.error('  Has token:', !!token);
            console.error('  Request config:', {
              url: error?.config?.url,
              method: error?.config?.method,
              headers: error?.config?.headers,
              data: error?.config?.data instanceof FormData ? 'FormData' : typeof error?.config?.data,
            });
          }
        }
        throw error;
      }
    }

    // Use XMLHttpRequest as fallback
    return new Promise((resolve, reject) => {
      if (__DEV__) {
        console.log('📡 [UPLOAD] Using XMLHttpRequest method');
      }
      
      const xhr = new XMLHttpRequest();
      let timeoutId: ReturnType<typeof setTimeout>;
      const startTime = Date.now();

      // Set timeout
      timeoutId = setTimeout(() => {
        xhr.abort();
        const duration = Date.now() - startTime;
        if (__DEV__) {
          console.error('⏱️ [XHR] Request timeout:', {
            duration: `${duration}ms`,
            timeout: timeout,
          });
        }
        reject(new Error('Request timeout. The server is taking too long to respond.'));
      }, timeout);

      // Handle success
      xhr.onload = () => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        if (__DEV__) {
          console.log('📥 [XHR] Response received:', {
            status: xhr.status,
            statusText: xhr.statusText,
            duration: `${duration}ms`,
          });
        }

        try {
          const data = JSON.parse(xhr.responseText) as T;
          
          if (__DEV__) {
            console.log('✅ [XHR] Upload successful');
          }
          
          // Convert XHR response to AxiosResponse-like object
          const headersObj: Record<string, string> = {};
          const headers = xhr.getAllResponseHeaders();
          if (headers) {
            headers.split('\r\n').forEach((line) => {
              const parts = line.split(': ');
              if (parts.length === 2) {
                headersObj[parts[0].toLowerCase()] = parts[1];
              }
            });
          }

          const axiosResponse = {
            data,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: headersObj,
            config: {
              url,
              method: 'post',
              timeout,
            },
          } as unknown as AxiosResponse<T>;


          resolve(axiosResponse);
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${parseError}`));
        }
      };

      // Handle error
      xhr.onerror = () => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        const errorInfo = {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
          duration: `${duration}ms`,
          isStatus0: xhr.status === 0,
          isFormDataIssue: xhr.status === 0,
          isNetworkIssue: xhr.status === 0,
        };
        
        if (__DEV__) {
          console.error('❌ [XHR] Upload failed:', errorInfo);
          console.error('  Possible causes:');
          if (xhr.status === 0) {
            console.error('    1. FormData serialization issue (React Native polyfill)');
            console.error('    2. Network security config blocking request');
            console.error('    3. SSL certificate validation failed');
            console.error('    4. Server not reachable');
            console.error('    5. CORS issue');
          } else {
            console.error('    HTTP error:', xhr.status, xhr.statusText);
          }
        }

        const errorMessage = xhr.status === 0
          ? `Network error. Cannot connect to API at ${API_BASE_URL}. XMLHttpRequest failed with status 0. This may be a FormData serialization issue. Try using axios POST instead.`
          : `Network error. HTTP ${xhr.status}: ${xhr.statusText}`;

        const error = new Error(errorMessage);
        (error as any).xhrError = errorInfo;
        reject(error);
      };

      // Handle abort
      xhr.onabort = () => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        if (__DEV__) {
          console.error('🛑 [XHR] Request aborted:', {
            duration: `${duration}ms`,
          });
        }
        reject(new Error('Request was aborted'));
      };

      // Open and send request
      xhr.open('POST', fullUrl, true);
      
      // Set headers
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // DO NOT set Content-Type - React Native FormData will set it with boundary
      // Setting Content-Type manually will break multipart/form-data boundary

      if (__DEV__) {
        console.log('📤 [XHR] Sending request:', {
          url: fullUrl,
          method: 'POST',
          hasToken: !!token,
          timeout: timeout,
        });
      }

      // Send FormData
      xhr.send(formData as any);
    });
  }
}

export const apiClient = new ApiClient();

