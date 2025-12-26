import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  DepositResponse,
  CreateDepositRequest,
  CreateDepositResponse,
} from '../../../types/api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for deposits
 */
export const depositKeys = {
  all: ['student', 'deposits'] as const,
  lists: () => [...depositKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => [...depositKeys.lists(), params] as const,
  detail: (id: string) => [...depositKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch deposits list
 */
export function useDeposits(params?: {
  page?: number;
  limit?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const url = `/students/deposits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<DepositResponse>>(
    depositKeys.list(params),
    url
  );
}

/**
 * Hook to fetch deposit details
 */
export function useDepositDetail(depositId: string) {
  return useApiQuery<ApiResponse<DepositResponse>>(
    depositKeys.detail(depositId),
    `/students/deposits/${depositId}`
  );
}

/**
 * Hook to create a new deposit
 */
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<CreateDepositResponse>,
    CreateDepositRequest
  >('/students/deposits', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: depositKeys.all });
      queryClient.invalidateQueries({ queryKey: ['student', 'balance'] });
    },
  });
}

