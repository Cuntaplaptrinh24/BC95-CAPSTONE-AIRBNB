// Kiểu dữ liệu về người dùng.

// Một người dùng như API trả về. avatar có dấu hỏi vì có thể không có.
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
  avatar?: string | null;
}

// Gửi lên khi sửa người dùng. Không có mật khẩu vì API cập nhật không nhận.
export interface UpdateUserPayload {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
}

// Gửi lên khi quản trị thêm người dùng mới. Khác bản cập nhật ở chỗ có mật khẩu.
export interface CreateUserPayload {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
}

// Hai vai trò hợp lệ. Khai báo ở một chỗ để form quản trị và chỗ kiểm tra quyền
// dùng chung, tránh gõ nhầm chuỗi 'ADMIN' ở nơi này và 'Admin' ở nơi khác.
export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];
