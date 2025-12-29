export type PrinterStatus = 'online' | 'busy' | 'offline' | 'maintenance';

export interface PrinterInfoMock {
  id: string;
  name: string;
  brand: string;
  model: string;
  building: string;
  room: string;
  floor: string;
  status: PrinterStatus;
  queueLength: number;
  uptime: number;
  supportsColor: boolean;
  supportsDuplex: boolean;
  maxPaperSize: 'A3' | 'A4';
  lastActive: string;
  ipAddress: string;
  serial: string;
  paperLevels: { size: 'A3' | 'A4'; level: number }[];
  tags?: string[];
  note?: string;
}

export interface PrinterInfoSummary {
  total: number;
  online: number;
  busy: number;
  offline: number;
  maintenance: number;
  avgQueue: number;
}

export interface PrinterNotice {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
}

export const printerInfoList: PrinterInfoMock[] = [
  {
    id: 'p-01',
    name: 'HP 4100 • R305',
    brand: 'HP',
    model: 'LaserJet Pro 4100',
    building: 'Tòa nhà A',
    room: 'R305',
    floor: 'Tầng 3',
    status: 'online',
    queueLength: 2,
    uptime: 98,
    supportsColor: false,
    supportsDuplex: true,
    maxPaperSize: 'A4',
    lastActive: '3 phút trước',
    ipAddress: '10.10.3.21',
    serial: 'HP-4100-001',
    paperLevels: [
      { size: 'A4', level: 76 },
      { size: 'A3', level: 0 },
    ],
    tags: ['ưu tiên'],
    note: 'Cấu hình cho lớp 9h - 11h',
  },
  {
    id: 'p-02',
    name: 'Canon G5500 • R402',
    brand: 'Canon',
    model: 'PIXMA G5500',
    building: 'Tòa nhà B',
    room: 'R402',
    floor: 'Tầng 4',
    status: 'busy',
    queueLength: 6,
    uptime: 94,
    supportsColor: true,
    supportsDuplex: true,
    maxPaperSize: 'A3',
    lastActive: 'Đang in 4/12 trang',
    ipAddress: '10.10.4.12',
    serial: 'CANON-5500-002',
    paperLevels: [
      { size: 'A4', level: 64 },
      { size: 'A3', level: 52 },
    ],
    tags: ['in màu', 'hỗ trợ đồ họa'],
  },
  {
    id: 'p-03',
    name: 'Epson L8500 • R201',
    brand: 'Epson',
    model: 'EcoTank L8500',
    building: 'Tòa nhà A',
    room: 'R201',
    floor: 'Tầng 2',
    status: 'online',
    queueLength: 0,
    uptime: 99,
    supportsColor: true,
    supportsDuplex: false,
    maxPaperSize: 'A4',
    lastActive: '15 phút trước',
    ipAddress: '10.10.2.15',
    serial: 'EPSON-8500-003',
    paperLevels: [
      { size: 'A4', level: 88 },
      { size: 'A3', level: 0 },
    ],
  },
];

export const printerInfoSummary: PrinterInfoSummary = {
  total: printerInfoList.length,
  online: printerInfoList.filter(p => p.status === 'online').length,
  busy: printerInfoList.filter(p => p.status === 'busy').length,
  offline: printerInfoList.filter(p => p.status === 'offline').length,
  maintenance: printerInfoList.filter(p => p.status === 'maintenance').length,
  avgQueue: Math.round(
    printerInfoList.reduce((sum, p) => sum + p.queueLength, 0) /
      printerInfoList.length
  ),
};

export const printerNotices: PrinterNotice[] = [
  {
    id: 'notice-1',
    title: 'Máy in R305 đang bảo trì',
    detail: 'Máy in sẽ hoạt động lại sau 2 giờ',
    severity: 'info',
  },
  {
    id: 'notice-2',
    title: 'Giấy A3 sắp hết tại R402',
    detail: 'Còn khoảng 20% giấy A3',
    severity: 'warning',
    actionLabel: 'Kiểm tra',
  },
];

