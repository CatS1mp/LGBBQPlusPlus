import { useApiQuery } from '../../hooks';
import type { ApiResponse, PrinterStatsResponse } from '../../../types/api';

/**
 * Query key factory for dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  printerStats: () => [...dashboardKeys.all, 'printer-stats'] as const,
};

/**
 * Hook to fetch printer statistics for dashboard
 */
export function usePrinterStats() {
  return useApiQuery<ApiResponse<PrinterStatsResponse>>(
    dashboardKeys.printerStats(),
    '/dashboard/printer-stats'
  );
}

