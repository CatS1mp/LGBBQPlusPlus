import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  StudentBalanceResponse,
  BalanceHistoryResponse,
} from '../../../types/api';

/**
 * Query key factory for student balance
 */
export const studentBalanceKeys = {
  all: ['student', 'balance'] as const,
  current: () => [...studentBalanceKeys.all, 'current'] as const,
  history: (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }) => [...studentBalanceKeys.all, 'history', params] as const,
};

/**
 * Hook to fetch current student balance
 */
export function useStudentBalance(checkForAmount?: number) {
  const queryParams = new URLSearchParams();
  if (checkForAmount !== undefined)
    queryParams.append('checkForAmount', checkForAmount.toString());

  const url = `/students/balance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<StudentBalanceResponse>>(
    studentBalanceKeys.current(),
    url,
    {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time balance
    }
  );
}

/**
 * Hook to fetch balance history
 */
export function useBalanceHistory(params?: {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);

  const url = `/students/balance/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<BalanceHistoryResponse>>(
    studentBalanceKeys.history(params),
    url
  );
}

