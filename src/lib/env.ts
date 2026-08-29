// Đọc biến môi trường. KHÔNG hiển thị giá trị token trong lỗi.

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_API_URL.");
  }
  return value;
}

export function getCybersoftToken(): string {
  const value = process.env.NEXT_PUBLIC_TOKEN_CYBERSOFT;
  if (!value) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_TOKEN_CYBERSOFT.");
  }
  return value;
}
