/**
 * Backend API Response Types
 * These types match the Java DTOs from the backend
 */

// Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string; // ISO LocalDateTime string
}

export interface PageResponse {
  page: number; // 0-indexed
  limit: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PageResponse;
  timestamp: string; // ISO LocalDateTime string
}

// Brand types
export interface BrandResponse {
  brandId: string; // UUID as string
  brandName: string;
  countryOfOrigin: string;
  website: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface BrandRequest {
  brandName: string;
  countryOfOrigin?: string;
  website?: string;
}

// Printer Model types
export interface PrinterModelResponse {
  modelId: string; // UUID as string
  brandId: string; // UUID as string
  brandName: string;
  modelName: string;
  description?: string;
  maxPaperSizeId: string; // UUID as string
  maxPaperSizeName: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  image2dUrl?: string;
  image3dUrl?: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface PrinterModelRequest {
  brandId: string; // UUID as string
  modelName: string;
  description?: string;
  maxPaperSizeId: string; // UUID as string
  supportsColor?: boolean;
  supportsDuplex?: boolean;
}

// Printer Physical types
export interface PrinterResponse {
  printerId: string; // UUID as string
  serialNumber: string;
  isEnabled: boolean;
  installedDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  lastMaintenanceDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  createdAt: string; // ISO LocalDateTime string
  updatedAt: string; // ISO LocalDateTime string

  // Model info
  modelId: string; // UUID as string
  modelName: string;
  brandName: string;
  maxPageSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  image2dUrl?: string;
  image3dUrl?: string;

  // Room info
  roomId: string; // UUID as string
  roomCode: string;
  buildingId: string; // UUID as string
  buildingCode: string;
  campusName: string;
}

export interface PrinterRequest {
  modelId: string; // UUID as string
  roomId: string; // UUID as string
  serialNumber?: string;
  isEnabled?: boolean;
  installedDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  lastMaintenanceDate?: string; // ISO LocalDate string (YYYY-MM-DD)
}

export interface UpdatePrinterStatusRequest {
  isEnabled: boolean;
}

export interface BulkPrinterStatusRequest {
  ids: string[]; // UUIDs as strings
  isEnabled: boolean;
}

export interface PrinterImportResult {
  totalRows: number;
  successRows: number;
  errorMessages: string[];
}

// Printer Log types - matches PrinterLogResponse DTO from backend
export interface PrinterLogResponse {
  logId: string; // UUID as string
  timestamp: string; // ISO LocalDateTime string
  printerId: string; // UUID as string
  printerLocation: string | null; // Format: "BUILDING-ROOM"
  printerName: string | null; // Format: "Brand Model"
  logType: string; // 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
  severity: string; // 'info', 'warning', 'error', 'critical'
  description: string;
  errorCode: string | null;
  isResolved: boolean | null;
  userName: string | null;
  userType: string | null;
  relatedFileName: string | null;
  details: string | null; // JSON string
  ipAddress: string | null;
  createdAt: string; // ISO LocalDateTime string
  resolvedAt: string | null; // ISO LocalDateTime string
  resolvedBy: string | null; // UUID as string
  resolutionNotes: string | null;
  jobId: string | null; // UUID as string
  userId: string | null; // UUID as string
}

// Reference types (for dropdowns)
export interface RoomResponse {
  roomId: string; // UUID as string
  roomCode: string;
  roomType?: string;
  buildingId: string; // UUID as string
  buildingCode: string;
  campusName: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface BuildingResponse {
  buildingId: string; // UUID as string
  buildingCode: string;
  address?: string;
  campusName: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface PageSizeResponse {
  pageSizeId: string; // UUID as string
  sizeName: string;
  widthMm: number;
  heightMm: number;
}

// Bulk delete request
export interface IdListRequest {
  ids: string[]; // UUIDs as strings
}

// Student File Upload types
export interface UploadedFileResponse {
  uploadedFileId: string; // UUID
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  fileUrl: string;
  pageCount: number;
  uploadedAt: string; // ISO LocalDateTime
  lastPrintedAt?: string; // ISO LocalDateTime
  printCount?: number;
}

export interface UploadedFileDetailResponse extends UploadedFileResponse {
  printHistory?: Array<{
    jobId: string;
    printedAt: string;
    printerName: string;
  }>;
}

// Print Job types
export type PrintStatus = 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
export type PageOrientation = 'portrait' | 'landscape';
export type PrintSide = 'one-sided' | 'double-sided';
export type ColorModeName = 'black_white' | 'grayscale' | 'color';

export interface PrintJobResponse {
  jobId: string; // UUID
  printStatus: PrintStatus;
  uploadedFile: {
    fileName: string;
    fileUrl: string;
  };
  printer: {
    printerId: string;
    brandName: string;
    modelName: string;
    location: string;
  };
  config: {
    paperSize: string;
    colorMode: string;
    printSide: PrintSide;
    numberOfCopy: number;
    pageOrientation: PageOrientation;
  };
  pricing: {
    totalPages: number;
    totalPrice: number;
  };
  startTime?: string; // ISO LocalDateTime
  endTime?: string; // ISO LocalDateTime
  createdAt: string; // ISO LocalDateTime
}

export interface PrintJobProgressResponse {
  jobId: string;
  printStatus: PrintStatus;
  progress: {
    totalPages: number;
    printedPages: number;
    percentage: number;
    estimatedTimeRemainingMinutes: number;
  };
  queueInfo: {
    positionInQueue: number;
    jobsAhead: number;
    isCurrentlyPrinting: boolean;
  };
  timing: {
    startTime?: string;
    estimatedCompletionTime?: string;
    elapsedMinutes: number;
    elapsedSeconds: number;
  };
  printer: {
    printerId: string;
    printerName: string;
    location: string;
    status: string;
  };
}

export interface CreatePrintJobRequest {
  uploadedFileId: string;
  printerId: string;
  pageSizeId: string;
  colorModeId: string;
  pageOrientation: PageOrientation;
  printSide: PrintSide;
  numberOfCopy: number;
}

export interface CreatePrintJobResponse {
  jobId: string;
  printStatus: PrintStatus;
  totalPrice: number;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string;
  printer: {
    printerId: string;
    location: string;
    status: string;
  };
  estimatedCompletionTime: string;
  remainingBalance: number;
  createdAt: string;
}

export interface CalculateCostRequest {
  uploadedFileId: string;
  printerId: string;
  pageSizeId: string;
  colorModeId: string;
  pageOrientation: PageOrientation;
  printSide: PrintSide;
  numberOfCopy: number;
}

export interface CalculateCostResponse {
  totalPages: number;
  basePricePerPage: number;
  colorModePricePerPage: number;
  subtotalBeforeDiscount: number;
  discountPackageId?: string;
  discountPercentage?: number;
  discountAmount?: number;
  totalPrice: number;
  estimatedPages: number;
}

// Student Balance types
export interface StudentBalanceResponse {
  balanceAmount: number;
  balanceInPages: number;
  isSufficient?: boolean;
  shortage?: number;
}

export interface BalanceHistoryResponse {
  ledgerId: string; // UUID
  amount: number;
  direction: 'IN' | 'OUT';
  sourceType: 'DEPOSIT' | 'SEMESTER_BONUS' | 'PAYMENT' | 'REFUND';
  description: string;
  createdAt: string; // ISO LocalDateTime
}

// Printer Queue types
export interface PrinterQueueResponse {
  printerId: string;
  queueCount: number;
  status: string;
  currentJob?: {
    jobId: string;
    startedAt: string;
    estimatedCompletionTime: string;
  };
  queuedJobs: Array<{
    jobId: string;
    queuedAt: string;
    totalPages: number;
  }>;
  estimatedWaitTimeMinutes: number;
}

export interface AvailablePrinterResponse {
  printerId: string;
  serialNumber: string;
  isEnabled: boolean;
  status: string;
  printingStatus?: string | null;
  modelName: string;
  brandName: string;
  maxPageSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  roomCode: string;
  buildingCode: string;
  buildingAddress?: string;
  campusName: string;
}

export interface PrinterDetailResponse {
  printerId: string;
  serialNumber: string;
  brandName: string;
  modelName: string;
  buildingName: string;
  buildingCode: string;
  buildingAddress?: string;
  campusName: string;
  floorNumber: number;
  roomCode: string;
  roomName?: string;
  roomType?: string;
  printerPixelCoordinate?: string;
  status: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  maxPaperSize: string;
  installedDate?: string;
  lastMaintenanceDate?: string;
}

// Configuration types
export interface PageSizeConfigResponse {
  pageSizeId: string;
  sizeName: string;
  widthMm: number;
  heightMm: number;
  isDefault?: boolean;
}

export interface ColorModeResponse {
  colorModeId: string;
  colorModeName: ColorModeName;
  description: string;
  colorMultiplier: number;
}

export interface PermittedFileTypeResponse {
  fileTypeId: string;
  fileExtension: string;
  mimeType: string;
  description: string;
  isPermitted: boolean;
}

export interface PricingConfigResponse {
  pageSizePrices: Array<{
    pageSizeId: string;
    sizeName: string;
    pagePrice: number;
  }>;
  colorModePrices: Array<{
    colorModeId: string;
    colorModeName: string;
    pricePerPage: number;
  }>;
  discountPackages: Array<{
    packageId: string;
    minPages: number;
    discountPercentage: number;
    packageName: string;
  }>;
}

// User types
export interface UserResponse {
  userId: string; // UUID
  email: string;
  fullName: string;
  userType: 'student' | 'staff';
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string; // ISO LocalDateTime
  updatedAt: string; // ISO LocalDateTime
}

export interface UserRequest {
  email: string;
  fullName: string;
  passwordHash?: string;
  passwordSalt?: string;
  userType: 'student' | 'staff';
  phoneNumber?: string;
  isActive?: boolean;
}

// Student Profile types
export interface StudentProfileResponse {
  studentId: string; // UUID
  userId: string; // UUID
  email: string;
  fullName: string;
  phoneNumber?: string;
  studentCode: string;
  majorId?: string;
  majorName?: string;
  classId?: string;
  className?: string;
  facultyId?: string;
  facultyName?: string;
  departmentId?: string;
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStudentProfileRequest {
  fullName?: string;
  phoneNumber?: string;
}

// Deposit types
export interface DepositResponse {
  depositId: string; // UUID
  depositCode: string;
  studentId: string;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'expired' | 'cancelled';
  paymentMethod?: string;
  transactionDate?: string;
  expiredAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface CreateDepositRequest {
  amount: number;
  paymentMethod: string;
}

export interface CreateDepositResponse {
  depositId: string;
  depositCode: string;
  amount: number;
  paymentStatus: string;
  paymentUrl?: string;
  qrCode?: string;
  expiredAt: string;
}

