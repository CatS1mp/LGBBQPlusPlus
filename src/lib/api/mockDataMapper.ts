/**
 * Mock data mapper - maps API endpoints to mock data
 * This is used when the app is in mock mode (offline/database unavailable)
 */

// Import all mock data
import { studentStatsMock, studentRecentPrintsMock } from '../../data/studentDashboardMock';
import { staffDashboardMock } from '../../data/staffDashboardMock';
import { printersInfoMock } from '../../data/printersInfoMock';
import { printHistoryMock } from '../../data/printHistoryMock';
import { studentsMock } from '../../data/studentsMock';
import { systemLogsMock } from '../../data/systemLogsMock';
import { uploadedFilesMock } from '../../data/uploadedFilesMock';
import { printMock } from '../../data/printMock';
import { rechargeMoneyMock } from '../../data/rechargeMoneyMock';
import { studentProfileMock } from '../../data/studentProfileMock';
import { reportsMock } from '../../data/reportsMock';
import type { AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedApiResponse } from '../../types/api';

type MockDataFunction = () => unknown;

/**
 * Map API endpoints to mock data functions
 */
const mockDataMap: Record<string, MockDataFunction> = {
  // Dashboard
  '/dashboard/printer-stats': () => ({
    success: true,
    message: 'Mock data: Printer statistics',
    data: {
      totalPrinters: 30,
      onlinePrinters: 24,
      offlinePrinters: 4,
      maintenancePrinters: 2,
    },
  }),

  // Student Dashboard
  '/student/balance': () => ({
    success: true,
    message: 'Mock data: Student balance',
    data: {
      balance: studentStatsMock.balance,
      quotaTotal: studentStatsMock.giftedQuotaTotal,
      quotaUsed: studentStatsMock.giftedQuotaUsed,
    },
  }),

  '/student/print/history/stats': () => ({
    success: true,
    message: 'Mock data: Print history stats',
    data: {
      // Theo API documentation: jobsThisMonth có { total, color, blackWhite, growthPercent }
      jobsThisMonth: {
        total: studentStatsMock.jobsThisMonth || 24,
        color: 10,
        blackWhite: 14,
        growthPercent: 8,
      },
      pagesLast30Days: studentStatsMock.pagesThisMonth || 320,
      // Theo API documentation: successRate có { percent, status }
      successRate: {
        percent: studentStatsMock.successRate || 96,
        status: 'STABLE' as const,
      },
    },
  }),

  '/student/print/history': () => {
    // Transform mock data to match StudentPrintHistoryItemResponse format (theo API documentation)
    const mockJobs = Array.isArray(studentRecentPrintsMock) ? studentRecentPrintsMock : [];
    const transformedJobs = mockJobs.map((item, index) => {
      const printerParts = item.printer?.split('•') || [];
      const brandName = printerParts[0]?.trim() || 'HP';
      const modelName = printerParts[1]?.trim() || 'Unknown';
      const location = item.printer || 'Unknown';
      
      return {
        jobId: item.id || `mock-job-${index}`,
        createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
        startTime: undefined,
        endTime: undefined,
        printerLocation: location, // BUILDING-ROOM format
        printerName: `${brandName} ${modelName}`, // Brand Model
        fileUrl: '',
        fileName: item.fileName || 'Unknown',
        fileType: (item.fileName?.split('.').pop() || 'pdf').toLowerCase(),
        colorMode: 'grayscale', // color / grayscale / black-white
        printSide: 'one-sided', // one-sided / double-sided
        pageOrientation: 'portrait', // portrait / landscape
        numberOfCopy: 1,
        totalPages: item.pagesUsedA4 || 0, // đã nhân với số bản copy
        printStatus: (item.status === 'completed' ? 'completed' : 
                     item.status === 'pending' ? 'queued' : 
                     item.status === 'failed' ? 'failed' : 'queued') as 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled',
      };
    });
    
    return {
      success: true,
      message: 'Mock data: Print history',
      data: transformedJobs,
      pagination: {
        page: 0,
        limit: 10,
        totalItems: transformedJobs.length,
        totalPages: 1,
        first: true,
        last: true,
      },
    };
  },

  // Student Profile
  '/student/profile': () => ({
    success: true,
    message: 'Mock data: Student profile',
    data: studentProfileMock,
  }),

  // Printers
  '/student/printers/available': () => ({
    success: true,
    message: 'Mock data: Available printers',
    data: {
      items: printersInfoMock,
      pagination: {
        page: 1,
        limit: 10,
        total: printersInfoMock.length,
        totalPages: 1,
      },
    },
  }),

  '/printers': () => ({
    success: true,
    message: 'Mock data: Printers list',
    data: {
      items: printersInfoMock,
      pagination: {
        page: 1,
        limit: 10,
        total: printersInfoMock.length,
        totalPages: 1,
      },
    },
  }),

  // Users/Students
  '/users': () => ({
    success: true,
    message: 'Mock data: Users list',
    data: {
      items: studentsMock,
      pagination: {
        page: 1,
        limit: 10,
        total: studentsMock.length,
        totalPages: 1,
      },
    },
  }),

  // System Logs
  '/printer-logs': () => ({
    success: true,
    message: 'Mock data: Printer logs',
    data: {
      items: systemLogsMock,
      pagination: {
        page: 1,
        limit: 10,
        total: systemLogsMock.length,
        totalPages: 1,
      },
    },
  }),

  // Student Files
  '/student/files': () => ({
    success: true,
    message: 'Mock data: Uploaded files',
    data: {
      items: uploadedFilesMock,
      pagination: {
        page: 1,
        limit: 10,
        total: uploadedFilesMock.length,
        totalPages: 1,
      },
    },
  }),

  // Print Jobs
  '/student/print-jobs': () => ({
    success: true,
    message: 'Mock data: Print jobs',
    data: {
      items: printMock.printJobs || [],
      pagination: {
        page: 1,
        limit: 10,
        total: (printMock.printJobs || []).length,
        totalPages: 1,
      },
    },
  }),

  // Reports
  '/reports': () => ({
    success: true,
    message: 'Mock data: Reports',
    data: reportsMock,
  }),
};

/**
 * Get mock data for a given endpoint
 */
export function getMockData(url: string): AxiosResponse<ApiResponse<unknown>> | null {
  // Remove query parameters and base URL
  const cleanUrl = url.replace(/^.*\/api/, '').split('?')[0];

  // Try exact match first
  if (mockDataMap[cleanUrl]) {
    const mockData = mockDataMap[cleanUrl]();
    return {
      data: mockData as ApiResponse<unknown>,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    } as AxiosResponse<ApiResponse<unknown>>;
  }

  // Try partial matches
  for (const [endpoint, mockFn] of Object.entries(mockDataMap)) {
    if (cleanUrl.startsWith(endpoint) || endpoint.includes(cleanUrl)) {
      const mockData = mockFn();
      return {
        data: mockData as ApiResponse<unknown>,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as AxiosResponse<ApiResponse<unknown>>;
    }
  }

  // Default empty response
  return {
    data: {
      success: true,
      message: 'Mock data: Empty response',
      data: null,
    } as ApiResponse<unknown>,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  } as AxiosResponse<ApiResponse<unknown>>;
}

/**
 * Check if an endpoint has mock data available
 */
export function hasMockData(url: string): boolean {
  const cleanUrl = url.replace(/^.*\/api/, '').split('?')[0];
  return (
    mockDataMap[cleanUrl] !== undefined ||
    Object.keys(mockDataMap).some(endpoint => cleanUrl.startsWith(endpoint))
  );
}

