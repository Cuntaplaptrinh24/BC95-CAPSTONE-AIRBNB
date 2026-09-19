// File này đọc hai dòng cấu hình trong .env.local để những chỗ khác dùng lại.

// Trả về địa chỉ API của CyberSoft.
// Địa chỉ này đã có sẵn đuôi /api, nên chỗ khác chỉ cần viết tiếp '/phong-thue'.
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  // Chưa khai báo địa chỉ thì dừng ngay và nói rõ thiếu dòng nào,
  // đỡ mất công dò lỗi khi trang chạy mà không ra dữ liệu.
  if (!value) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_API_URL.");
  }

  return value;
}

// Trả về token của lớp học. Token này giống tấm vé vào cửa,
// gọi API nào của CyberSoft cũng phải kèm theo.
export function getCybersoftToken(): string {
  const value = process.env.NEXT_PUBLIC_TOKEN_CYBERSOFT;

  // Báo lỗi chỉ ghi tên dòng cấu hình bị thiếu, không in token ra màn hình.
  if (!value) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_TOKEN_CYBERSOFT.");
  }

  return value;
}
