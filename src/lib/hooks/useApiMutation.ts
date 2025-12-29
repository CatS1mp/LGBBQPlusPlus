import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../api/client';
import { useMockModeStore } from '../stores/useMockModeStore';
import { getMockData } from '../api/mockDataMapper';

export function useApiMutation<
  TData = unknown,
  TVariables = unknown,
  TError = Error,
>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<
    UseMutationOptions<AxiosResponse<TData>, TError, TVariables>,
    'mutationFn'
  >
): UseMutationResult<AxiosResponse<TData>, TError, TVariables> {
  const queryClient = useQueryClient();
  const { isMockMode } = useMockModeStore();

  return useMutation<AxiosResponse<TData>, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      // Always try API first, only use mock if API fails
      try {
        let response: AxiosResponse<TData>;
        switch (method) {
          case 'post':
            response = await apiClient.post<TData>(url, variables);
            break;
          case 'put':
            response = await apiClient.put<TData>(url, variables);
            break;
          case 'patch':
            response = await apiClient.patch<TData>(url, variables);
            break;
          case 'delete':
            response = await apiClient.delete<TData>(url);
            break;
          default:
            response = await apiClient.post<TData>(url, variables);
        }
        return response;
      } catch (error) {
        // If API fails and mock mode is enabled, use mock data
        if (isMockMode) {
          const mockResponse = getMockData(url);
          if (mockResponse) {
            return mockResponse as AxiosResponse<TData>;
          }
          // Default success response for mutations
          return {
            data: {
              success: true,
              message: `Mock: ${method.toUpperCase()} operation successful`,
              data: null,
            } as TData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          } as AxiosResponse<TData>;
        }
        // Error will be handled by interceptor which will enable mock mode
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

