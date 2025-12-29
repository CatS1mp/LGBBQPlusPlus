import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  ApiResponse,
  PrintJobResponse,
  PrintJobProgressResponse,
  CreatePrintJobRequest,
  CreatePrintJobResponse,
  CalculateCostRequest,
  CalculateCostResponse,
} from '../../../types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for print jobs
 */
export const printJobKeys = {
  all: ['student', 'print-jobs'] as const,
  lists: () => [...printJobKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => [...printJobKeys.lists(), params] as const,
  detail: (id: string) => [...printJobKeys.all, 'detail', id] as const,
  progress: (id: string) => [...printJobKeys.all, 'progress', id] as const,
};

/**
 * Hook to fetch print jobs list
 */
export function usePrintJobs(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const url = `/students/print-jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<PrintJobResponse[]>>(
    printJobKeys.list(params),
    url
  );
}

/**
 * Hook to fetch print job details
 */
export function usePrintJobDetail(jobId: string) {
  return useApiQuery<ApiResponse<PrintJobResponse>>(
    printJobKeys.detail(jobId),
    `/students/print-jobs/${jobId}`
  );
}

/**
 * Hook to fetch print job progress
 */
export function usePrintJobProgress(jobId: string, enabled = true) {
  return useApiQuery<ApiResponse<PrintJobProgressResponse>>(
    printJobKeys.progress(jobId),
    `/students/print-jobs/${jobId}/progress`,
    {
      enabled,
      refetchInterval: enabled ? 3000 : false,
    }
  );
}

/**
 * Hook to create a print job
 */
export function useCreatePrintJob() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<CreatePrintJobResponse>,
    CreatePrintJobRequest
  >('/students/print-jobs', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['student', 'balance'] });
    },
  });
}

/**
 * Hook to calculate print cost
 * Endpoint: POST /students/print-jobs/calculate-cost
 * Note: If this endpoint returns 404, check backend documentation for correct endpoint
 * Possible alternatives: /student/print/calculate-cost, /print-jobs/calculate-cost
 */
export function useCalculatePrintCost() {
  return useApiMutation<
    ApiResponse<CalculateCostResponse>,
    CalculateCostRequest
  >('/students/print-jobs/calculate-cost', 'post');
}

/**
 * Hook to cancel a print job
 */
export function useCancelPrintJob() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<{ jobId: string; refundAmount: number }>>,
    Error,
    string
  >({
    mutationFn: (jobId: string) => {
      return apiClient.post<ApiResponse<{ jobId: string; refundAmount: number }>>(
        `/students/print-jobs/${jobId}/cancel`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['student', 'balance'] });
    },
  });
}

