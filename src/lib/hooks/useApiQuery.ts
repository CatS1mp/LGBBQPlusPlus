import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useEffect } from 'react';
import { apiClient } from '../api/client';
import { useMockModeStore } from '../stores/useMockModeStore';
import { getMockData } from '../api/mockDataMapper';

type QueryKey = readonly unknown[];

export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<
    UseQueryOptions<AxiosResponse<TData>, TError>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<AxiosResponse<TData>, TError> {
  const { isMockMode } = useMockModeStore();
  const queryClient = useQueryClient();

  // Refetch when mock mode is disabled to get real data
  // Only invalidate if we have data (to avoid unnecessary refetch on initial mount)
  useEffect(() => {
    if (!isMockMode) {
      // Only invalidate if query has data, to avoid refetch on initial mount
      queryClient.invalidateQueries({ 
        queryKey,
        refetchType: 'active', // Only refetch active queries
      });
    }
  }, [isMockMode, queryKey, queryClient]);

  // Debug: Log when query is created
  if (__DEV__ && url.includes('/student/print/history')) {
    console.log('🔧 [useApiQuery] Query Created:', {
      url,
      queryKey: JSON.stringify(queryKey),
      isMockMode,
      timestamp: new Date().toISOString(),
    });
  }

  return useQuery<AxiosResponse<TData>, TError>({
    queryKey,
    queryFn: async () => {
      // Debug: Log when query function is called
      if (__DEV__ && url.includes('/student/print/history')) {
        console.log('⚡ [useApiQuery] Query Function Called:', {
          url,
          isMockMode,
          timestamp: new Date().toISOString(),
        });
      }

      // Always try API first, only use mock if API fails
      try {
        const response = await apiClient.get<TData>(url);
        
        // Debug: Log successful response
        if (__DEV__ && url.includes('/student/print/history')) {
          console.log('✅ [useApiQuery] Query Success:', {
            url,
            status: response.status,
            hasData: !!response.data,
            timestamp: new Date().toISOString(),
          });
        }
        
        return response;
      } catch (error: any) {
        // Debug: Log error
        if (__DEV__ && url.includes('/student/print/history')) {
          console.error('❌ [useApiQuery] Query Error:', {
            url,
            error: error?.message || error,
            errorStatus: error?.response?.status,
            isMockMode,
            timestamp: new Date().toISOString(),
          });
        }

        // Check if error is 404 or "No static resource" - try mock data immediately
        const is404Error = error?.response?.status === 404 || 
                          (typeof error?.message === 'string' && error.message.includes('No static resource'));
        
        // If API fails and mock mode is enabled, or if it's a 404 error, use mock data
        if (isMockMode || is404Error) {
          const mockResponse = getMockData(url);
          if (mockResponse) {
            if (__DEV__ && url.includes('/student/print/history')) {
              console.log('🎭 [useApiQuery] Using Mock Data:', {
                url,
                reason: is404Error ? '404 error - endpoint not found' : 'mock mode enabled',
                timestamp: new Date().toISOString(),
              });
            }
            return mockResponse as AxiosResponse<TData>;
          }
        }
        
        // Error will be handled by interceptor which will enable mock mode
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry in mock mode
      if (isMockMode) return false;
      // Retry only once for faster failure handling
      if (failureCount < 1) {
        return true;
      }
      return false;
    },
    ...options,
  });
}

