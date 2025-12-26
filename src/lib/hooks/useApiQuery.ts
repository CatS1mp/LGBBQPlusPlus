import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../api/client';

type QueryKey = readonly unknown[];

export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<
    UseQueryOptions<AxiosResponse<TData>, TError>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<AxiosResponse<TData>, TError> {
  return useQuery<AxiosResponse<TData>, TError>({
    queryKey,
    queryFn: () => apiClient.get<TData>(url),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    ...options,
  });
}

