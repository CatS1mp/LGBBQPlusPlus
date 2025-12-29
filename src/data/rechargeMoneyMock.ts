export type PaymentMethod = 'bank' | 'momo';
export type RechargeStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface RechargePackage {
  id: string;
  name: string;
  amountVnd: number;
  bonusAmountVnd?: number;
  popular?: boolean;
  description?: string;
  isEvent?: boolean;
  eventTheme?: string;
}

export interface RechargeHistoryItem {
  id: string;
  transactionId: string;
  packageId?: string;
  packageName?: string;
  amountVnd: number;
  bonusAmountVnd: number;
  totalAmountVnd: number;
  paymentMethod: PaymentMethod;
  status: RechargeStatus;
  rechargedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface RechargeSummary {
  totalRecharges: number;
  totalAmountRecharged: number;
  totalBonusAmount: number;
  totalSpentVnd: number;
}

export const rechargePackagesMock: RechargePackage[] = [
  {
    id: 'pkg-1',
    name: 'Gói Cơ Bản',
    amountVnd: 50000,
    bonusAmountVnd: 0,
    description: 'Phù hợp cho nhu cầu in ít',
  },
  {
    id: 'pkg-2',
    name: 'Gói Tiết Kiệm',
    amountVnd: 100000,
    bonusAmountVnd: 10000,
    popular: true,
    description: 'Tiết kiệm 10% - Gói được yêu thích',
  },
  {
    id: 'pkg-3',
    name: 'Gói Giáng Sinh',
    amountVnd: 200000,
    bonusAmountVnd: 50000,
    popular: true,
    description: '🎄 Ưu đãi Giáng Sinh - Tiết kiệm 25%',
    isEvent: true,
    eventTheme: 'christmas',
  },
  {
    id: 'pkg-4',
    name: 'Gói Siêu Tiết Kiệm',
    amountVnd: 500000,
    bonusAmountVnd: 150000,
    description: 'Tiết kiệm 30% - Cho người dùng nhiều',
  },
];

export const rechargeHistoryMock: RechargeHistoryItem[] = [
  {
    id: 'recharge-1',
    transactionId: 'TXN-2025-1201-001',
    packageId: 'pkg-2',
    packageName: 'Gói Tiết Kiệm',
    amountVnd: 100000,
    bonusAmountVnd: 10000,
    totalAmountVnd: 110000,
    paymentMethod: 'momo',
    status: 'completed',
    rechargedAt: '2025-12-01T10:30:00Z',
    completedAt: '2025-12-01T10:31:00Z',
  },
  {
    id: 'recharge-2',
    transactionId: 'TXN-2025-1125-002',
    packageId: undefined,
    packageName: 'Nạp tùy chỉnh',
    amountVnd: 75000,
    bonusAmountVnd: 0,
    totalAmountVnd: 75000,
    paymentMethod: 'bank',
    status: 'completed',
    rechargedAt: '2025-11-25T14:20:00Z',
    completedAt: '2025-11-25T14:25:00Z',
  },
];

export const rechargeSummaryMock: RechargeSummary = {
  totalRecharges: rechargeHistoryMock.length,
  totalAmountRecharged: rechargeHistoryMock.reduce(
    (sum, r) => sum + r.amountVnd,
    0
  ),
  totalBonusAmount: rechargeHistoryMock.reduce(
    (sum, r) => sum + r.bonusAmountVnd,
    0
  ),
  totalSpentVnd: rechargeHistoryMock.reduce((sum, r) => sum + r.totalAmountVnd, 0),
};

