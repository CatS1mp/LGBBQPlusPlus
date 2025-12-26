import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../api/client';

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

  return useMutation<AxiosResponse<TData>, TError, TVariables>({
    mutationFn: (variables: TVariables) => {
      switch (method) {
        case 'post':
          return apiClient.post<TData>(url, variables);
        case 'put':
          return apiClient.put<TData>(url, variables);
        case 'patch':
          return apiClient.patch<TData>(url, variables);
        case 'delete':
          return apiClient.delete<TData>(url);
        default:
          return apiClient.post<TData>(url, variables);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

