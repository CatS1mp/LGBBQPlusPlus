export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT';

export interface SystemLogItem {
  auditId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType: ActionType;
  tableName: string;
  recordId: string | null;
  changedField: string | null;
  ipAddress: string;
  userAgent: string;
  actionTimestamp: string;
}

export interface SystemLogsSummary {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  uniqueUsers: number;
}

export const actionTypeLabels: Record<ActionType, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  VIEW: 'Xem',
  EXPORT: 'Xuất dữ liệu',
};

export const actionTypeColors: Record<ActionType, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-rose-100 text-rose-700',
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-amber-100 text-amber-700',
  VIEW: 'bg-slate-100 text-slate-700',
  EXPORT: 'bg-purple-100 text-purple-700',
};

export const systemLogsMockData: SystemLogItem[] = [
  {
    auditId: 'audit-001',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'LOGIN',
    tableName: 'user',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    actionTimestamp: '2024-12-09T08:30:00',
  },
  {
    auditId: 'audit-002',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'CREATE',
    tableName: 'student',
    recordId: 'student-123',
    changedField: 'fullName, email, studentCode',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    actionTimestamp: '2024-12-09T09:15:00',
  },
  {
    auditId: 'audit-003',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'UPDATE',
    tableName: 'printer_physical',
    recordId: 'printer-456',
    changedField: 'status, is_enabled',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    actionTimestamp: '2024-12-09T10:00:00',
  },
];

export const systemLogsSummaryMock: SystemLogsSummary = {
  totalLogs: systemLogsMockData.length,
  logsToday: systemLogsMockData.filter(
    log => new Date(log.actionTimestamp).toDateString() === new Date().toDateString()
  ).length,
  logsThisWeek: systemLogsMockData.length,
  logsThisMonth: systemLogsMockData.length,
  uniqueUsers: new Set(systemLogsMockData.map(log => log.userId)).size,
};

