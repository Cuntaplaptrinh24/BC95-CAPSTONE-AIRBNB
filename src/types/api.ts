// Envelope chuẩn CyberSoft
export interface CyberSoftEnvelope<T> {
  statusCode: number;
  content: T;
  dateTime: string;
}

// Nội dung phân trang
export interface PaginatedContent<T> {
  pageIndex: number;
  pageSize: number;
  totalRow: number;
  keywords: string | null;
  data: T[];
}

// Tham số phân trang
export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
}

// Lỗi API chuẩn hóa
export interface ApiErrorShape {
  statusCode: number;
  message: string;
  content?: unknown;
}
