import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PrintHistoryStatsResponse,
  PrintHistoryQueryParams,
  StudentPrintHistoryItemResponse,
  StudentPrintJobDetailResponse,
} from '../../../types/api';

/**
 * Query key factory for print history
 */
export const printHistoryKeys = {
  all: ['student', 'print-history'] as const,
  lists: () => [...printHistoryKeys.all, 'list'] as const,
  list: (params?: PrintHistoryQueryParams) =>
    [...printHistoryKeys.lists(), params] as const,
  stats: () => [...printHistoryKeys.all, 'stats'] as const,
  detail: (jobId: string) => [...printHistoryKeys.all, 'detail', jobId] as const,
};

/**
 * Hook to fetch print history list
 */
export function usePrintHistory(params?: PrintHistoryQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  // Support both legacy and new param names
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  else if (params?.start_date) queryParams.append('fromDate', params.start_date);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  else if (params?.end_date) queryParams.append('toDate', params.end_date);
  if (params?.supportsColor !== undefined)
    queryParams.append('supportsColor', params.supportsColor.toString());
  if (params?.supportsDuplex !== undefined)
    queryParams.append('supportsDuplex', params.supportsDuplex.toString());
  if (params?.fileType) queryParams.append('fileType', params.fileType);
  // Support both legacy and new param names
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  else if (params?.sort_by) queryParams.append('sortBy', params.sort_by);
  if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
  else if (params?.sort_direction) queryParams.append('sortDirection', params.sort_direction);

  // Ensure URL doesn't have trailing slash
  const baseUrl = '/student/print/history'.replace(/\/+$/, '');
  const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const queryResult = useApiQuery<PaginatedApiResponse<StudentPrintHistoryItemResponse>>(
    printHistoryKeys.list(params),
    url
  );

  return queryResult;
}

/**
 * Hook to fetch print history statistics
 */
export function usePrintHistoryStats() {
  const url = '/student/print/history/stats';

  const queryResult = useApiQuery<ApiResponse<PrintHistoryStatsResponse>>(
    printHistoryKeys.stats(),
    url
  );

  return queryResult;
}

/**
 * Hook to fetch print history detail by job ID
 */
export function usePrintHistoryDetail(jobId: string) {
  if (!jobId) {
    // Return a disabled query if no jobId
    return useApiQuery<ApiResponse<StudentPrintJobDetailResponse>>(
      printHistoryKeys.detail(''),
      `/student/print/history/${jobId}`,
      { enabled: false }
    );
  }
  
  return useApiQuery<ApiResponse<StudentPrintJobDetailResponse>>(
    printHistoryKeys.detail(jobId),
    `/student/print/history/${jobId}`
  );
}

