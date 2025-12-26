import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PageSizeConfigResponse,
  ColorModeResponse,
  PermittedFileTypeResponse,
  PricingConfigResponse,
} from '../../../types/api';

/**
 * Query key factory for config
 */
export const configKeys = {
  all: ['config'] as const,
  pageSizes: (printerId?: string) =>
    [...configKeys.all, 'page-sizes', printerId] as const,
  colorModes: () => [...configKeys.all, 'color-modes'] as const,
  permittedFileTypes: () =>
    [...configKeys.all, 'permitted-file-types'] as const,
  pricing: () => [...configKeys.all, 'pricing'] as const,
};

/**
 * Hook to fetch page sizes
 */
export function usePageSizes(printerId?: string) {
  const queryParams = new URLSearchParams();
  if (printerId) queryParams.append('printer_id', printerId);

  const url = `/config/page-sizes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<ApiResponse<PageSizeConfigResponse[]>>(
    configKeys.pageSizes(printerId),
    url
  );
}

/**
 * Hook to fetch color modes
 */
export function useColorModes() {
  return useApiQuery<ApiResponse<ColorModeResponse[]>>(
    configKeys.colorModes(),
    '/config/color-modes'
  );
}

/**
 * Hook to fetch permitted file types
 */
export function usePermittedFileTypes() {
  return useApiQuery<ApiResponse<PermittedFileTypeResponse[]>>(
    configKeys.permittedFileTypes(),
    '/config/permitted-file-types'
  );
}

/**
 * Hook to fetch pricing configuration
 */
export function usePricingConfig() {
  return useApiQuery<ApiResponse<PricingConfigResponse>>(
    configKeys.pricing(),
    '/config/pricing'
  );
}

