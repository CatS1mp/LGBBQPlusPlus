import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  UploadedFileResponse,
  UploadedFileDetailResponse,
} from '../../../types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for student files
 */
export const studentFileKeys = {
  all: ['student', 'files'] as const,
  lists: () => [...studentFileKeys.all, 'list'] as const,
  list: (params: {
    page?: number;
    limit?: number;
    search?: string;
    file_type?: string;
    date_range?: 'today' | 'week' | 'month' | '3months' | 'all';
    start_date?: string;
    end_date?: string;
    sort_by?: 'file_name' | 'uploaded_at' | 'last_printed_at' | 'print_count';
    sort_direction?: 'asc' | 'desc';
  }) => [...studentFileKeys.lists(), params] as const,
  detail: (id: string) => [...studentFileKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch uploaded files list
 */
export function useUploadedFiles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  file_type?: string;
  date_range?: 'today' | 'week' | 'month' | '3months' | 'all';
  start_date?: string;
  end_date?: string;
  sort_by?: 'file_name' | 'uploaded_at' | 'last_printed_at' | 'print_count';
  sort_direction?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.file_type) queryParams.append('file_type', params.file_type);
  if (params?.date_range) queryParams.append('date_range', params.date_range);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);

  const url = `/students/files${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<UploadedFileResponse>>(
    studentFileKeys.list(params || {}),
    url
  );
}

/**
 * Hook to fetch file details
 */
export function useUploadedFileDetail(fileId: string) {
  return useApiQuery<ApiResponse<UploadedFileDetailResponse>>(
    studentFileKeys.detail(fileId),
    `/students/files/${fileId}`
  );
}

/**
 * Hook to upload a file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<UploadedFileResponse>>,
    Error,
    { uri: string; type: string; name: string }
  >({
    mutationFn: async ({ uri, type, name }) => {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type,
        name,
      } as any);

      return apiClient.post<ApiResponse<UploadedFileResponse>>(
        '/students/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          } as any,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentFileKeys.all });
    },
  });
}

/**
 * Hook to delete an uploaded file
 */
export function useDeleteUploadedFile() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<void>>,
    Error,
    string
  >({
    mutationFn: (fileId: string) => {
      return apiClient.delete<ApiResponse<void>>(`/students/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentFileKeys.all });
    },
  });
}

