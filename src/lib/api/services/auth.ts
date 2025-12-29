import { useApiQuery, useApiMutation } from '../../hooks';
import type { ApiResponse } from '../../../types/api';
import { apiClient } from '../client';
import { AxiosResponse } from 'axios';

/**
 * Query key factory for auth
 */
export const authKeys = {
  all: ['auth'] as const,
  validateResetToken: (token: string) => [...authKeys.all, 'validate-reset-token', token] as const,
};

/**
 * Request/Response types for auth
 */
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetTokenStatusResponse {
  valid: boolean;
  email?: string;
  userId?: string;
  expiryDate?: string;
  used?: boolean;
  message?: string;
}

/**
 * Hook to send forgot password email
 */
export function useForgotPassword() {
  return useApiMutation<ApiResponse<void>, ForgotPasswordRequest>(
    '/auth/forgot-password',
    'post'
  );
}

/**
 * Hook to reset password with token
 */
export function useResetPassword() {
  return useApiMutation<ApiResponse<void>, ResetPasswordRequest>(
    '/auth/reset-password',
    'post'
  );
}

/**
 * Hook to validate reset password token
 */
export function useValidateResetToken(token: string, enabled: boolean = true) {
  return useApiQuery<ApiResponse<ResetTokenStatusResponse>>(
    authKeys.validateResetToken(token),
    `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
    { enabled: enabled && !!token }
  );
}

