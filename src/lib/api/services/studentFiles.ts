import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  UploadedFileResponse,
  UploadedFileDetailResponse,
} from '../../../types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import { useMockModeStore } from '../../stores/useMockModeStore';
import { ENV } from '../../../config/env';
import { useAuthStore } from '../../stores/useAuthStore';

// Try to import react-native-blob-util (optional dependency)
let RNFetchBlob: any = null;
let RNFetchBlobAvailable = false;

try {
  // Try multiple import methods for better compatibility
  let blobUtilModule: any = null;
  
  // Method 1: Default import
  try {
    blobUtilModule = require('react-native-blob-util');
  } catch {
    // Method 2: Try default export
    try {
      blobUtilModule = require('react-native-blob-util').default;
    } catch {
      // Method 3: Try named exports
      try {
        const module = require('react-native-blob-util');
        blobUtilModule = module.default || module;
      } catch (e) {
        throw e;
      }
    }
  }
  
  // Check if module has required methods
  if (blobUtilModule) {
    // Check for fetch method (can be in different locations)
    const hasFetch = 
      typeof blobUtilModule.fetch === 'function' ||
      typeof blobUtilModule.default?.fetch === 'function';
    
    const hasConfig = 
      typeof blobUtilModule.config === 'function' ||
      typeof blobUtilModule.default?.config === 'function';
    
    if (hasFetch && hasConfig) {
      // Use the module directly or default export
      RNFetchBlob = blobUtilModule.default || blobUtilModule;
      RNFetchBlobAvailable = true;
      if (__DEV__) {
        console.log('✅ [UPLOAD] react-native-blob-util loaded successfully');
      }
    } else {
      if (__DEV__) {
        console.warn('⚠️ [UPLOAD] react-native-blob-util module loaded but missing required methods (fetch/config)');
        console.warn('⚠️ [UPLOAD] Module structure:', Object.keys(blobUtilModule));
      }
    }
  }
} catch (error: any) {
  // Package not installed or not linked properly
  if (__DEV__) {
    console.warn('⚠️ [UPLOAD] react-native-blob-util not available:', error?.message || 'Module not found');
    console.warn('⚠️ [UPLOAD] Package is installed but native module may not be linked.');
    console.warn('⚠️ [UPLOAD] To fix: Rebuild the app - npx react-native run-android');
    console.warn('⚠️ [UPLOAD] Or restart Metro bundler and reload the app');
  }
}

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
 * Upload file using react-native-blob-util
 */
async function uploadWithBlobUtil(
  uri: string,
  type: string,
  name: string,
  token: string
): Promise<ApiResponse<UploadedFileResponse>> {
  if (!RNFetchBlob || !RNFetchBlobAvailable) {
    throw new Error('react-native-blob-util not available. Please install and rebuild app.');
  }

  const baseUrl = ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  const url = `${baseUrl}/students/files/upload`;

  if (__DEV__) {
    console.log('🟢 [UPLOAD] Attempting upload with react-native-blob-util...');
    console.log('🔍 [BLOB-UTIL] Config:', {
      url,
      filename: name,
      type,
      uri,
      hasToken: !!token,
      trusty: false,
    });
  }

  try {
    // Configure SSL handling for react-native-blob-util
    // IMPORTANT: trusty must be FALSE to use Android's system trust store
    // Android's system trust store includes our network_security_config.xml settings
    // which already trusts system certificates (Heroku SSL) + user certificates (debug)
    // 
    // trusty: true would require defining a custom trust manager (which we don't have)
    // This causes: "IllegalStateException: Use of own trust manager but none defined"
    //
    // Solution: trusty: false = use Android system trust store (includes our config)
    
    const response = await RNFetchBlob.config({
      // SSL configuration - use Android system trust store
      trusty: false, // Use system certificates (includes network_security_config.xml)
      // Add timeout
      timeout: 60000, // 60 seconds
    }).fetch(
      'POST',
      url,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'file',
          filename: name,
          type: type || 'application/octet-stream',
          data: RNFetchBlob.wrap(uri),
        },
      ]
    );

    const status = response.info().status;
    const responseData = response.json();

    if (__DEV__) {
      console.log('📥 [BLOB-UTIL] Response:', {
        status,
        statusText: response.info().statusText || 'OK',
      });
    }

    if (status >= 200 && status < 300) {
      console.log('✅ [UPLOAD] react-native-blob-util upload succeeded');
      return responseData;
    }

    throw new Error(`Upload failed with status ${status}`);
  } catch (error: any) {
    // Check if it's an SSL error
    const isSSLError = 
      error?.message?.includes('SSL') ||
      error?.message?.includes('certificate') ||
      error?.message?.includes('CERT') ||
      error?.code?.includes('SSL') ||
      error?.code?.includes('CERT');
    
    if (isSSLError) {
      console.error('❌ [UPLOAD] SSL error with react-native-blob-util:', error.message);
      const sslError = new Error(`SSL certificate error: ${error.message}`);
      (sslError as any).code = 'SSL_ERROR';
      (sslError as any).originalError = error;
      throw sslError;
    }
    
    console.error('❌ [UPLOAD] react-native-blob-util failed:', error.message);
    throw error;
  }
}

/**
 * Hook to upload a file using react-native-blob-util
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  const { isMockMode } = useMockModeStore();
  const { token } = useAuthStore();
  
  return useMutation<
    AxiosResponse<ApiResponse<UploadedFileResponse>>,
    Error,
    { uri: string; type: string; name: string }
  >({
    mutationFn: async ({ uri, type, name }) => {
      // Check if mock mode is enabled
      if (isMockMode) {
        const mockResponse: AxiosResponse<ApiResponse<UploadedFileResponse>> = {
          data: {
            success: true,
            message: 'File uploaded successfully (mock)',
            timestamp: new Date().toISOString(),
            data: {
              uploadedFileId: `mock-${Date.now()}`,
              fileName: name,
              fileType: type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
              fileSizeKb: Math.round(Math.random() * 1000 + 100),
              fileUrl: uri,
              pageCount: Math.round(Math.random() * 10 + 1),
              uploadedAt: new Date().toISOString(),
            },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        };
        return mockResponse;
      }

      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!RNFetchBlob || !RNFetchBlobAvailable) {
        throw new Error('react-native-blob-util not available. Please install and rebuild app.');
      }

      const responseData = await uploadWithBlobUtil(uri, type, name, token);
      // Convert to AxiosResponse format for consistency
      const response: AxiosResponse<ApiResponse<UploadedFileResponse>> = {
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      (response as any).usedMethod = 'blob-util';
      return response;
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

