// Các kiểu dữ liệu dùng chung cho mọi lời gọi API.

// Gói bọc mà API CyberSoft luôn trả về. Dữ liệu thật nằm trong content,
// statusCode là mã kết quả, dateTime là thời điểm server trả lời.
// Chữ T để trống cho nơi gọi quyết định: có chỗ content là một phòng,
// có chỗ là danh sách phòng.
export interface CyberSoftEnvelope<T> {
  statusCode: number;
  content: T;
  dateTime: string;
}

// Hình dạng của content khi gọi API phân trang: ngoài danh sách data còn có
// trang hiện tại, cỡ trang, tổng số dòng và từ khóa đang tìm.
export interface PaginatedContent<T> {
  pageIndex: number;
  pageSize: number;
  totalRow: number;
  keywords: string | null;
  data: T[];
}

// Những gì gửi lên khi xin một trang dữ liệu.
export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
}

// Dạng lỗi đã gom về một kiểu duy nhất, để mọi màn hình chỉ cần đọc message.
export interface ApiErrorShape {
  statusCode: number;
  message: string;
  content?: unknown;
}
