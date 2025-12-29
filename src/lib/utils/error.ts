import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  // Handle AxiosError first - most common in API calls
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Server responded with error
    if (axiosError.response) {
      const responseData = axiosError.response.data;
      if (responseData && typeof responseData === 'object') {
        // Try to get message from response data
        const message = 
          (responseData as { message?: string })?.message ||
          (responseData as { error?: string })?.error ||
          axiosError.message;
        return message || 'An error occurred';
      }
      return axiosError.message || 'An error occurred';
    }
    
    // Request made but no response (network error)
    if (axiosError.request) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timeout. The server is taking too long to respond.';
      }
      if (axiosError.code === 'ERR_NETWORK') {
        return 'Network error. Please check your connection and try again.';
      }
      return axiosError.message || 'Network error. Please check your connection.';
    }
    
    return axiosError.message || 'An error occurred';
  }
  
  // Handle AppError
  if (isAppError(error)) {
    return error.message;
  }
  
  // Handle generic Error
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback
  return 'An unknown error occurred';
}

