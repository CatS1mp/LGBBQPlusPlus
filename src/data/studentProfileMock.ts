export type StudentPrintStatus = 'completed' | 'pending' | 'failed';

export interface StudentPaperConversion {
  size: 'A3' | 'A4' | 'A5';
  ratioFromA4: number;
  note: string;
}

export interface StudentPrintHistoryItem {
  id: string;
  fileName: string;
  printer: string;
  size: 'A3' | 'A4' | 'A5';
  pagesUsedA4: number;
  timeAgo: string;
  status: StudentPrintStatus;
}

export interface StudentProfileMock {
  id: string;
  fullName: string;
  studentCode: string;
  avatarInitials: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  major: string;
  className: string;
  yearLevel: number;
  status: 'active' | 'graduated' | 'suspended';
  gpa: number;
  enrollmentDate: string;
  expectedGraduate: string;
  a4Balance: number;
  quotaReset: string;
  paperConversions: StudentPaperConversion[];
  printHistory: StudentPrintHistoryItem[];
  achievements: { title: string; description: string }[];
}

export const studentProfileMock: StudentProfileMock = {
  id: 'stu-profile-001',
  fullName: 'Nguyen Van A',
  studentCode: 'ITITIU19000',
  avatarInitials: 'NA',
  email: 'nva@hcmiu.edu.vn',
  phone: '0912345678',
  faculty: 'Computer Science & Engineering',
  department: 'Computer Science & Engineering',
  major: 'Information Technology',
  className: 'IT2021',
  yearLevel: 4,
  status: 'active',
  gpa: 3.62,
  enrollmentDate: '2021-09-01',
  expectedGraduate: '2025-06-30',
  a4Balance: 500,
  quotaReset: '01/01/2026',
  paperConversions: [
    { size: 'A3', ratioFromA4: 2, note: '1 A3 = 2 A4' },
    { size: 'A4', ratioFromA4: 1, note: 'Chuẩn hệ thống' },
    { size: 'A5', ratioFromA4: 0.5, note: '2 A5 = 1 A4' },
  ],
  printHistory: [
    {
      id: 'ph-01',
      fileName: 'BaoCao_TotNghiep.pdf',
      printer: 'HP 4100 • R305',
      size: 'A4',
      pagesUsedA4: 32,
      timeAgo: '15 phút trước',
      status: 'completed',
    },
    {
      id: 'ph-02',
      fileName: 'Slide-BaoVe.pptx',
      printer: 'Canon G5500 • R402',
      size: 'A3',
      pagesUsedA4: 8,
      timeAgo: '2 giờ trước',
      status: 'completed',
    },
    {
      id: 'ph-03',
      fileName: 'HoSoThucTap.docx',
      printer: 'Epson L8500 • R201',
      size: 'A5',
      pagesUsedA4: 6,
      timeAgo: 'Hôm qua',
      status: 'pending',
    },
  ],
  achievements: [
    {
      title: 'Top 10% GPA khoa CNTT',
      description: 'Kỳ Fall 2024',
    },
    {
      title: 'Leader CLB Dev Hub',
      description: 'Tổ chức workshop Git & CI/CD',
    },
  ],
};

