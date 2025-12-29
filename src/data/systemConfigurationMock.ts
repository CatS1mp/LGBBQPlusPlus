export type ConfigurationCategory =
  | 'pricing'
  | 'limits'
  | 'timeouts'
  | 'security'
  | 'general';

export interface SystemConfigItem {
  configId: string;
  configKey: string;
  configValue: string;
  displayName: string;
  description: string;
  category: ConfigurationCategory;
  dataType: 'number' | 'string' | 'boolean' | 'json';
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
}

export const categoryLabels: Record<ConfigurationCategory, string> = {
  pricing: 'Giá cả',
  limits: 'Giới hạn',
  timeouts: 'Thời gian chờ',
  security: 'Bảo mật',
  general: 'Chung',
};

export const systemConfigurationMockData: SystemConfigItem[] = [
  {
    configId: 'config-001',
    configKey: 'colorPrintPricePerPage',
    configValue: '500',
    displayName: 'Giá in màu',
    description: 'Giá in màu mỗi trang (VND)',
    category: 'pricing',
    dataType: 'number',
    updatedAt: '2024-12-01T10:00:00',
    updatedBy: 'user-001',
    updatedByName: 'Nguyễn Văn Admin',
  },
  {
    configId: 'config-002',
    configKey: 'blackWhitePrintPricePerPage',
    configValue: '200',
    displayName: 'Giá in đen trắng',
    description: 'Giá in đen trắng mỗi trang (VND)',
    category: 'pricing',
    dataType: 'number',
    updatedAt: '2024-12-01T10:00:00',
    updatedBy: 'user-001',
    updatedByName: 'Nguyễn Văn Admin',
  },
  {
    configId: 'config-003',
    configKey: 'maxPagesPerJob',
    configValue: '100',
    displayName: 'Số trang tối đa mỗi công việc',
    description: 'Giới hạn số trang có thể in trong một công việc',
    category: 'limits',
    dataType: 'number',
    updatedAt: '2024-11-15T14:30:00',
    updatedBy: 'user-001',
    updatedByName: 'Nguyễn Văn Admin',
  },
  {
    configId: 'config-004',
    configKey: 'sessionTimeout',
    configValue: '3600',
    displayName: 'Thời gian chờ phiên (giây)',
    description: 'Thời gian chờ trước khi phiên đăng nhập hết hạn',
    category: 'timeouts',
    dataType: 'number',
    updatedAt: '2024-11-20T09:15:00',
    updatedBy: 'user-002',
    updatedByName: 'Trần Thị Staff',
  },
  {
    configId: 'config-005',
    configKey: 'enableTwoFactorAuth',
    configValue: 'false',
    displayName: 'Bật xác thực 2 yếu tố',
    description: 'Yêu cầu xác thực 2 yếu tố cho tài khoản admin',
    category: 'security',
    dataType: 'boolean',
    updatedAt: '2024-12-01T10:00:00',
    updatedBy: 'user-001',
    updatedByName: 'Nguyễn Văn Admin',
  },
];

