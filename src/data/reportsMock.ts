export interface PrintJobStats {
  date: string;
  completed: number;
  failed: number;
  queued: number;
  total: number;
}

export interface PrintStatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PagesPrintedStats {
  date: string;
  pages: number;
  colorPages: number;
  blackWhitePages: number;
}

export interface RevenueStats {
  month: string;
  revenue: number;
  purchases: number;
}

export interface TopPrinterStats {
  printerName: string;
  totalJobs: number;
  totalPages: number;
  successRate: number;
}

export interface ColorModeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PaperSizeDistribution {
  size: string;
  count: number;
  percentage: number;
}

export interface ReportsData {
  printJobsByDate: PrintJobStats[];
  printStatusDistribution: PrintStatusDistribution[];
  pagesPrintedByDate: PagesPrintedStats[];
  revenueByMonth: RevenueStats[];
  topPrinters: TopPrinterStats[];
  colorModeDistribution: ColorModeDistribution[];
  paperSizeDistribution: PaperSizeDistribution[];
  summary: {
    totalPrintJobs: number;
    totalPagesPrinted: number;
    totalRevenue: number;
    averageJobsPerDay: number;
    successRate: number;
  };
}

const printJobsByDateMock: PrintJobStats[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    completed: Math.floor(Math.random() * 30) + 40,
    failed: Math.floor(Math.random() * 5) + 1,
    queued: Math.floor(Math.random() * 5) + 1,
    total: 0,
  };
}).map(item => ({ ...item, total: item.completed + item.failed + item.queued }));

export const printStatusDistributionMock: PrintStatusDistribution[] = [
  { name: 'Hoàn tất', value: 1685, color: '#10b981' },
  { name: 'Thất bại', value: 48, color: '#ef4444' },
  { name: 'Đang chờ', value: 67, color: '#64748b' },
];

export const pagesPrintedByDateMock: PagesPrintedStats[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      pages: Math.floor(Math.random() * 500) + 1000,
      colorPages: Math.floor(Math.random() * 100) + 150,
      blackWhitePages: 0,
    };
  }
).map(item => ({
  ...item,
  blackWhitePages: item.pages - item.colorPages,
}));

export const revenueByMonthMock: RevenueStats[] = [
  { month: 'Tháng 7', revenue: 12500000, purchases: 245 },
  { month: 'Tháng 8', revenue: 13800000, purchases: 268 },
  { month: 'Tháng 9', revenue: 15200000, purchases: 295 },
  { month: 'Tháng 10', revenue: 14500000, purchases: 282 },
  { month: 'Tháng 11', revenue: 16800000, purchases: 312 },
  { month: 'Tháng 12', revenue: 14200000, purchases: 278 },
];

export const topPrintersMock: TopPrinterStats[] = [
  {
    printerName: 'HP LaserJet Pro M404dn - P101',
    totalJobs: 342,
    totalPages: 12450,
    successRate: 0.98,
  },
  {
    printerName: 'Canon PIXMA G3010 - P205',
    totalJobs: 298,
    totalPages: 11200,
    successRate: 0.96,
  },
  {
    printerName: 'HP OfficeJet Pro 9015e - P301',
    totalJobs: 275,
    totalPages: 9850,
    successRate: 0.97,
  },
];

export const colorModeDistributionMock: ColorModeDistribution[] = [
  { name: 'Đen trắng', value: 1245, color: '#1e293b' },
  { name: 'In màu', value: 342, color: '#3b82f6' },
  { name: 'In xám', value: 98, color: '#64748b' },
];

export const paperSizeDistributionMock: PaperSizeDistribution[] = [
  { size: 'A4', count: 1520, percentage: 85.2 },
  { size: 'A3', count: 145, percentage: 8.1 },
  { size: 'A5', count: 20, percentage: 1.1 },
];

export const reportsSummaryMock = {
  totalPrintJobs: 1800,
  totalPagesPrinted: 43250,
  totalRevenue: 87000000,
  averageJobsPerDay: 60,
  successRate: 0.94,
};

export const reportsDataMock: ReportsData = {
  printJobsByDate: printJobsByDateMock,
  printStatusDistribution: printStatusDistributionMock,
  pagesPrintedByDate: pagesPrintedByDateMock,
  revenueByMonth: revenueByMonthMock,
  topPrinters: topPrintersMock,
  colorModeDistribution: colorModeDistributionMock,
  paperSizeDistribution: paperSizeDistributionMock,
  summary: reportsSummaryMock,
};

