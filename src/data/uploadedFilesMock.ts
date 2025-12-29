export interface UploadedFileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  uploaded_at: string;
  page_count?: number;
  last_printed_at?: string;
  print_count: number;
}

export const uploadedFilesMock: UploadedFileItem[] = [
  {
    id: '1',
    file_name: 'BaiTapToan.pdf',
    file_type: 'application/pdf',
    file_size_kb: 245,
    uploaded_at: '2024-11-25T10:30:00Z',
    page_count: 15,
    last_printed_at: '2024-11-25T14:20:00Z',
    print_count: 2,
  },
  {
    id: '2',
    file_name: 'BaoCaoThucTap.docx',
    file_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size_kb: 512,
    uploaded_at: '2024-11-24T09:15:00Z',
    page_count: 25,
    last_printed_at: '2024-11-24T16:45:00Z',
    print_count: 1,
  },
  {
    id: '3',
    file_name: 'SlideThuyetTrinh.pptx',
    file_type:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    file_size_kb: 1024,
    uploaded_at: '2024-11-23T13:20:00Z',
    page_count: 30,
    print_count: 0,
  },
];

