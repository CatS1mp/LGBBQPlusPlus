export type Trend = 'up' | 'down' | 'flat';

export interface StatWidget {
  id: 'printersOnline' | 'jobsToday' | 'pagesMonth';
  value: number;
  suffix?: string;
  change: string;
  trend: Trend;
  captionKey?: 'total' | 'lastJob';
}

export interface WeeklyActivity {
  day: string;
  jobs: number;
  pages: number;
}

export interface PaperUsage {
  name: string;
  value: number;
  color: string;
}

export interface PrinterStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  queue: number;
  utilization: number;
  location: string;
}

export interface QuickAction {
  id: 'printers' | 'reports' | 'logs' | 'config';
  href: string;
  badgeKey?: 'realtime';
}

export interface AlertItem {
  id: 'lowPaper' | 'driverUpdate' | 'printerOffline';
  severity: 'info' | 'warning' | 'critical';
}

export const statWidgets: StatWidget[] = [
  {
    id: 'printersOnline',
    value: 24,
    change: '',
    trend: 'flat',
    captionKey: 'total',
  },
  {
    id: 'jobsToday',
    value: 182,
    change: '+12 jobs',
    trend: 'up',
    captionKey: 'lastJob',
  },
  {
    id: 'pagesMonth',
    value: 18420,
    change: '-2.3%',
    trend: 'down',
    captionKey: undefined,
  },
];

export const weeklyPrintingActivity: WeeklyActivity[] = [
  { day: 'Thứ 2', jobs: 42, pages: 610 },
  { day: 'Thứ 3', jobs: 51, pages: 720 },
  { day: 'Thứ 4', jobs: 48, pages: 690 },
  { day: 'Thứ 5', jobs: 44, pages: 630 },
  { day: 'Thứ 6', jobs: 56, pages: 810 },
  { day: 'Thứ 7', jobs: 23, pages: 320 },
  { day: 'CN', jobs: 12, pages: 180 },
];

export const paperSizeUsage: PaperUsage[] = [
  { name: 'A4', value: 55, color: '#6366f1' },
  { name: 'A3', value: 25, color: '#22c55e' },
  { name: 'A5', value: 20, color: '#f59e0b' },
];

export const printerStatusSummary = {
  online: 18,
  offline: 3,
  maintenance: 2,
  utilization: 76,
};

export const quickActions: QuickAction[] = [
  {
    id: 'printers',
    href: '/staff/manage-printers',
    badgeKey: 'realtime',
  },
  {
    id: 'reports',
    href: '/staff/reports',
  },
  {
    id: 'logs',
    href: '/staff/system-logs',
  },
  {
    id: 'config',
    href: '/staff/configuration',
  },
];

export const alerts: AlertItem[] = [
  {
    id: 'lowPaper',
    severity: 'warning',
  },
  {
    id: 'driverUpdate',
    severity: 'info',
  },
  {
    id: 'printerOffline',
    severity: 'critical',
  },
];

