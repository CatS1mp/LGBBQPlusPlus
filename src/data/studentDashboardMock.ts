import { printHistorySummaryMock } from './printHistoryMock';
import { studentProfileMock } from './studentProfileMock';

export interface StudentQuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface StudentHighlight {
  id: string;
  title: string;
  description: string | string[];
}

export const studentStatsMock = {
  giftedQuotaTotal: 150,
  giftedQuotaUsed: 90,
  topupBalance: 60000,
  quotaReset: studentProfileMock.quotaReset,
  jobsThisMonth: printHistorySummaryMock.totalJobsThisMonth,
  jobsLastMonth: 45,
  pagesThisMonth: printHistorySummaryMock.totalPagesThisMonth,
  pagesLastMonth: 320,
  successRate: Math.round(printHistorySummaryMock.successRate * 100),
  balance: 60000,
  get jobsChangePercent() {
    if (this.jobsLastMonth === 0) return 0;
    return Math.round(
      ((this.jobsThisMonth - this.jobsLastMonth) / this.jobsLastMonth) * 100
    );
  },
  get pagesChangePercent() {
    if (this.pagesLastMonth === 0) return 0;
    return Math.round(
      ((this.pagesThisMonth - this.pagesLastMonth) / this.pagesLastMonth) * 100
    );
  },
};

export const studentQuickActionsMock: StudentQuickAction[] = [
  {
    id: 'print',
    title: 'In tài liệu',
    description: 'Tải file và gửi lệnh in ngay',
    href: '/student/print',
    badge: 'Mới',
  },
  {
    id: 'buy',
    title: 'Nạp tiền',
    description: 'Nạp tiền vào tài khoản bằng ví hoặc thẻ',
    href: '/student/buy-pages',
  },
  {
    id: 'history',
    title: 'Lịch sử in',
    description: 'Theo dõi trạng thái và chi phí',
    href: '/student/history',
  },
  {
    id: 'printers',
    title: 'Máy in gần bạn',
    description: 'Xem máy in online theo tòa nhà',
    href: '/student/printers',
  },
];

export const studentHighlightsMock: StudentHighlight[] = [
  {
    id: 'quota',
    title: 'Quy đổi khổ giấy',
    description: [
      'A3 = 2 trang A4',
      'A5 = 0.5 trang A4',
      'Ví dụ: 10 trang A3 sẽ trừ 20 trang A4',
    ],
  },
  {
    id: 'reset',
    title: 'Làm mới hạn mức',
    description: `Hệ thống tự làm mới vào ${studentProfileMock.quotaReset}. Đảm bảo đủ hạn mức trước khi in tài liệu dài.`,
  },
  {
    id: 'support',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Liên hệ IT helpdesk nếu gặp lỗi kết nối hoặc kẹt giấy.',
  },
];

export const studentRecentPrintsMock = studentProfileMock.printHistory;
export const studentProfileSummaryMock = studentProfileMock;

