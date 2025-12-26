import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  PrinterResponse,
  PrinterRequest,
  UpdatePrinterStatusRequest,
  BulkPrinterStatusRequest,
  PaginatedApiResponse,
  ApiResponse,
  IdListRequest,
  PrinterImportResult,
} from '../../../types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for printers
 */
export const printerKeys = {
  all: ['printers'] as const,
  lists: () => [...printerKeys.all, 'list'] as const,
  list: (params: {
    page?: number;
    limit?: number;
    keyword?: string;
    status?: string;
    buildingId?: string;
    modelId?: string;
    roomId?: string;
  }) => [...printerKeys.lists(), params] as const,
  detail: (id: string) => [...printerKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch printers with filters
 */
export function usePrinters(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  buildingId?: string;
  modelId?: string;
  roomId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
  if (params?.modelId) queryParams.append('modelId', params.modelId);
  if (params?.roomId) queryParams.append('roomId', params.roomId);

  const url = `/printers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<PrinterResponse>>(
    printerKeys.list(params || {}),
    url
  );
}

/**
 * Hook to create a new printer
 */
export function useCreatePrinter() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<PrinterResponse>, PrinterRequest>(
    '/printers',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: printerKeys.all });
      },
    }
  );
}

/**
 * Hook to update a printer
 */
export function useUpdatePrinter() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<PrinterResponse>>,
    Error,
    PrinterRequest & { id: string }
  >({
    mutationFn: variables => {
      const { id, ...data } = variables;
      return apiClient.put<ApiResponse<PrinterResponse>>(
        `/printers/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerKeys.all });
    },
  });
}

/**
 * Hook to update printer status
 */
export function useUpdatePrinterStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<PrinterResponse>>,
    Error,
    UpdatePrinterStatusRequest & { id: string }
  >({
    mutationFn: variables => {
      const { id, ...data } = variables;
      return apiClient.patch<ApiResponse<PrinterResponse>>(
        `/printers/${id}/status`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerKeys.all });
    },
  });
}

/**
 * Hook to delete a printer
 */
export function useDeletePrinter() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<ApiResponse<void>>, Error, string>({
    mutationFn: (id: string) => {
      return apiClient.delete<ApiResponse<void>>(`/printers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerKeys.all });
    },
  });
}

/**
 * Hook to bulk update printer status
 */
export function useBulkUpdatePrinterStatus() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, BulkPrinterStatusRequest>(
    '/printers/bulk/status',
    'patch',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: printerKeys.all });
      },
    }
  );
}

/**
 * Hook to bulk delete printers
 */
export function useBulkDeletePrinters() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, IdListRequest>(
    '/printers/bulk',
    'delete',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: printerKeys.all });
      },
    }
  );
}

/**
 * Hook to import printers from Excel
 */
export function useImportPrinters() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<PrinterImportResult>>,
    Error,
    File
  >({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<ApiResponse<PrinterImportResult>>(
        '/printers/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          } as any,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printerKeys.all });
    },
  });
}

/**
 * Hook to export printers to Excel
 */
export function useExportPrinters() {
  return useMutation<
    Blob,
    Error,
    {
      keyword?: string;
      status?: string;
      buildingId?: string;
      modelId?: string;
      roomId?: string;
      page?: number;
      limit?: number;
    }
  >({
    mutationFn: async params => {
      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.status) queryParams.append('status', params.status);
      if (params.buildingId)
        queryParams.append('buildingId', params.buildingId);
      if (params.modelId) queryParams.append('modelId', params.modelId);
      if (params.roomId) queryParams.append('roomId', params.roomId);
      if (params.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params.limit !== undefined)
        queryParams.append('limit', params.limit.toString());

      const url = `/printers/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<Blob>(url, {
        responseType: 'blob',
        headers: {} as any,
      });
      return response.data;
    },
  });
}

