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
