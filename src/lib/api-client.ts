// File này tạo sẵn một bộ gọi API để cả dự án dùng chung.

import axios from 'axios';
import { getApiBaseUrl, getCybersoftToken } from './env';

// Bộ gọi API dùng chung, đã cài sẵn địa chỉ gốc lấy từ .env.local.
// Nhờ vậy các hàm trong src/services chỉ cần viết '/phong-thue' hay '/vi-tri'.
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
});

// Axios cho phép chèn một bước chạy trước mỗi lần gọi API.
// Ở đây dùng bước đó để tự kèm token lớp học vào mọi lời gọi,
// khỏi phải nhớ kèm ở từng hàm.
apiClient.interceptors.request.use((config) => {
  config.headers.set('tokenCybersoft', getCybersoftToken());
  return config;
});

// Khai báo kiểu dữ liệu của phần thông tin kèm theo lời gọi API.
export type AuthHeader = import('axios').AxiosRequestHeaders;

// Dùng cho những việc gắn với một người cụ thể: đặt phòng, sửa hồ sơ, viết bình luận.
// Lúc đó kèm thêm token của người đang đăng nhập để server biết ai đang thao tác.
export function buildAuthHeaders(accessToken: string): AuthHeader {
  return new axios.AxiosHeaders({ token: accessToken });
}
