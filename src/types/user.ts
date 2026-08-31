// Thông tin người dùng
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

// Cập nhật người dùng (CapNhatNguoiDung)
export interface UpdateUserPayload {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: string;
}

// Tạo người dùng từ trang Admin (ThongTinNguoiDung)
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

// Vai trò người dùng hợp lệ trong hệ thống
export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];
