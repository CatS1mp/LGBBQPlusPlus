import { useApiQuery, useApiMutation } from '../../hooks';
import type {
  ApiResponse,
  StudentProfileResponse,
  UpdateStudentProfileRequest,
} from '../../../types/api';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for student profile
 */
export const studentProfileKeys = {
  all: ['student', 'profile'] as const,
  current: () => [...studentProfileKeys.all, 'current'] as const,
};

/**
 * Hook to fetch current student profile
 */
export function useStudentProfile() {
  return useApiQuery<ApiResponse<StudentProfileResponse>>(
    studentProfileKeys.current(),
    '/student/profile'
  );
}

/**
 * Hook to update student profile
 */
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<StudentProfileResponse>,
    UpdateStudentProfileRequest
  >('/student/profile', 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentProfileKeys.all });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useApiMutation<
    ApiResponse<{ message: string }>,
    {
      currentPassword: string;
      newPassword: string;
    }
  >('/auth/change-password', 'post');
}

