import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  ApiResponse,
  PaginatedApiResponse,
  UserResponse,
  UserRequest,
} from '../../../types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: 'student' | 'staff';
    isActive?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch users list with filters
 */
export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userType?: 'student' | 'staff';
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.userType) queryParams.append('userType', params.userType);
  if (params?.isActive !== undefined)
    queryParams.append('isActive', params.isActive.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortDirection)
    queryParams.append('sortDirection', params.sortDirection);

  const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<UserResponse>>(
    userKeys.list(params),
    url
  );
}

/**
 * Hook to fetch user by ID
 */
export function useUser(userId: string) {
  return useApiQuery<ApiResponse<UserResponse>>(
    userKeys.detail(userId),
    `/users/${userId}`
  );
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<UserResponse>, UserRequest>(
    '/users',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      },
    }
  );
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<UserResponse>>,
    Error,
    UserRequest & { userId: string }
  >({
    mutationFn: variables => {
      const { userId, ...data } = variables;
      return apiClient.put<ApiResponse<UserResponse>>(`/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<ApiResponse<void>>, Error, string>({
    mutationFn: (userId: string) => {
      return apiClient.delete<ApiResponse<void>>(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

