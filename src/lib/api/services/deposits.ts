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
  current: () => [...depositKeys.all, 'current'] as const,
  status: (id: string) => [...depositKeys.all, 'status', id] as const,
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

  const url = `/payment/deposits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
    `/payment/deposits/${depositId}`
  );
}

/**
 * Hook to create a new deposit
 */
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<DepositResponse>,
    CreateDepositRequest
  >('/payment/create-deposit', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: depositKeys.all });
      queryClient.invalidateQueries({ queryKey: ['student', 'balance'] });
    },
  });
}

/**
 * Hook to fetch current pending deposit
 */
export function useCurrentPendingDeposit() {
  return useApiQuery<ApiResponse<DepositResponse>>(
    depositKeys.current(),
    '/payment/current'
  );
}

/**
 * Hook to poll deposit status (for checking payment completion)
 * @param depositId - Deposit ID to check
 * @param enabled - Whether to enable polling (default: true)
 * @param interval - Polling interval in milliseconds (default: 5000 = 5 seconds)
 */
export function useDepositStatus(
  depositId: string | null,
  enabled = true,
  interval = 5000
) {
  return useApiQuery<ApiResponse<DepositResponse>>(
    depositKeys.status(depositId || ''),
    depositId ? `/payment/deposits/${depositId}` : '',
    {
      enabled: enabled && !!depositId,
      refetchInterval: enabled && depositId ? interval : false,
    }
  );
}

