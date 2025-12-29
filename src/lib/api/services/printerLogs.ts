import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PrinterLogResponse,
} from '../../../types/api';

/**
 * Query key factory for printer logs
 */
export const printerLogKeys = {
  all: ['printer-logs'] as const,
  lists: () => [...printerLogKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    printerId?: string;
    logType?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }) => [...printerLogKeys.lists(), params] as const,
};

/**
 * Hook to fetch printer logs with filters
 */
export function usePrinterLogs(params?: {
  page?: number;
  limit?: number;
  printerId?: string;
  logType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.printerId) queryParams.append('printerId', params.printerId);
  if (params?.logType) queryParams.append('logType', params.logType);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `/printer-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<PrinterLogResponse>>(
    printerLogKeys.list(params),
    url
  );
}

