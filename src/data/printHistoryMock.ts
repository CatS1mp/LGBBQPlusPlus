export type PrintJobStatus = 'completed' | 'processing' | 'queued' | 'failed';

export interface PrintHistoryItem {
  id: string;
  documentName: string;
  fileType: string;
  fileSizeKB: number;
  previewUrl?: string;
  printerName: string;
  printerSerial?: string;
  buildingName?: string;
  roomCode?: string;
  printerStatus?: 'online' | 'offline' | 'maintenance';
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  location: string;
  submittedAt: string;
  completedAt?: string;
  pageCount: number;
  copies: number;
  colorMode: 'color' | 'grayscale' | 'black-white';
  duplex: boolean;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  costVnd: number;
  status: PrintJobStatus;
  tags?: string[];
  errorMessage?: string;
}

export interface PrintHistorySummary {
  totalJobsThisMonth: number;
  totalPagesThisMonth: number;
  estimatedCostVnd: number;
  successRate: number;
}

export interface HistoryFilterOption {
  label: string;
  value: string;
}

export const printHistorySummaryMock: PrintHistorySummary = {
  totalJobsThisMonth: 24,
  totalPagesThisMonth: 358,
  estimatedCostVnd: 72000,
  successRate: 0.96,
};

export const printHistoryMock: PrintHistoryItem[] = [
  {
    id: 'JOB-12045',
    documentName: 'Báo cáo tài chính Q4.pdf',
    fileType: 'PDF',
    fileSizeKB: 2048,
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    printerName: 'HP LaserJet Pro 4100',
    printerSerial: 'HP-4100-001',
    buildingName: 'Tòa nhà A',
    roomCode: 'R305',
    printerStatus: 'online',
    supportsColor: false,
    supportsDuplex: true,
    location: 'R305 - Tòa nhà A',
    submittedAt: '2025-12-09T14:20:00Z',
    completedAt: '2025-12-09T14:22:00Z',
    pageCount: 12,
    copies: 1,
    colorMode: 'grayscale',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 12000,
    status: 'completed',
    tags: ['A4', '2 mặt'],
  },
  {
    id: 'JOB-12042',
    documentName: 'Slide bài giảng tuần 12.pptx',
    fileType: 'PPTX',
    fileSizeKB: 5120,
    printerName: 'Canon PIXMA G5500',
    printerSerial: 'CANON-5500-002',
    buildingName: 'Tòa nhà B',
    roomCode: 'R402',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R402 - Tòa nhà B',
    submittedAt: '2025-12-08T08:05:00Z',
    completedAt: '2025-12-08T08:09:00Z',
    pageCount: 32,
    copies: 1,
    colorMode: 'color',
    duplex: false,
    paperSize: 'A3',
    orientation: 'landscape',
    costVnd: 24000,
    status: 'completed',
    tags: ['A3', '1 mặt', 'Màu'],
  },
  {
    id: 'JOB-12038',
    documentName: 'Đồ án cuối kỳ.docx',
    fileType: 'DOCX',
    fileSizeKB: 1536,
    printerName: 'Brother HL-L8500CDW',
    printerSerial: 'BROTHER-8500-005',
    buildingName: 'Tòa nhà C',
    roomCode: 'R501',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R501 - Tòa nhà C',
    submittedAt: '2025-12-06T10:15:00Z',
    completedAt: '2025-12-06T10:17:00Z',
    pageCount: 48,
    copies: 2,
    colorMode: 'black-white',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 32000,
    status: 'processing',
    tags: ['A4', '2 mặt'],
  },
];

export const historyStatusFilters: HistoryFilterOption[] = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Thành công', value: 'completed' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đang chờ', value: 'queued' },
  { label: 'Lỗi', value: 'failed' },
];

