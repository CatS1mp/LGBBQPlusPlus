import { useApiQuery } from '../../hooks';
import type {
  ApiResponse,
  StudentDashboardResponse,
  BonusPackageResponse,
} from '../../../types/api';

/**
 * Query key factory for student
 */
export const studentKeys = {
  all: ['student'] as const,
  dashboard: () => [...studentKeys.all, 'dashboard'] as const,
};

/**
 * Hook to fetch student dashboard data
 */
export function useStudentDashboard() {
  return useApiQuery<ApiResponse<StudentDashboardResponse>>(
    studentKeys.dashboard(),
    '/student/dashboard',
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: 'always', // Only refetch if data is stale
    }
  );
}

/**
 * Query key factory for bonus packages
 */
export const bonusPackageKeys = {
  all: ['payment', 'bonus-packages'] as const,
  list: () => [...bonusPackageKeys.all, 'list'] as const,
};

/**
 * Hook to fetch bonus packages (discount packages for printing)
 */
export function useBonusPackages() {
  return useApiQuery<ApiResponse<BonusPackageResponse[]>>(
    bonusPackageKeys.list(),
    '/payment/bonus-packages',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

