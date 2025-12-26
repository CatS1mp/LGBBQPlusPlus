import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  AvailablePrinterResponse,
  PrinterDetailResponse,
  PrinterQueueResponse,
} from '../../../types/api';

/**
 * Query key factory for student printers
 */
export const studentPrinterKeys = {
  all: ['student', 'printers'] as const,
  available: (params?: {
    keyword?: string;
    buildingId?: string;
    roomId?: string;
    status?: string;
    supportsColor?: boolean;
    supportsDuplex?: boolean;
    page?: number;
    limit?: number;
  }) => [...studentPrinterKeys.all, 'available', params] as const,
  detail: (id: string) => [...studentPrinterKeys.all, 'detail', id] as const,
  queue: (id: string) => [...studentPrinterKeys.all, 'queue', id] as const,
};

/**
 * Hook to fetch available printers for students
 */
export function useAvailablePrinters(params?: {
  keyword?: string;
  buildingId?: string;
  roomId?: string;
  status?: string;
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
  if (params?.roomId) queryParams.append('roomId', params.roomId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.supportsColor !== undefined)
    queryParams.append('supportsColor', params.supportsColor.toString());
  if (params?.supportsDuplex !== undefined)
    queryParams.append('supportsDuplex', params.supportsDuplex.toString());
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortDirection)
    queryParams.append('sortDirection', params.sortDirection);

  const url = `/printers/available${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<AvailablePrinterResponse>>(
    studentPrinterKeys.available(params),
    url
  );
}

/**
 * Hook to fetch printer details
 */
export function usePrinterDetail(printerId: string) {
  return useApiQuery<ApiResponse<PrinterDetailResponse>>(
    studentPrinterKeys.detail(printerId),
    `/printers/${printerId}`
  );
}

/**
 * Hook to fetch printer queue information (real-time)
 */
export function usePrinterQueue(printerId: string, enabled = true) {
  return useApiQuery<ApiResponse<PrinterQueueResponse>>(
    studentPrinterKeys.queue(printerId),
    `/printers/${printerId}/queue`,
    {
      enabled,
      refetchInterval: enabled ? 5000 : false, // Refetch every 5 seconds for real-time updates
    }
  );
}

