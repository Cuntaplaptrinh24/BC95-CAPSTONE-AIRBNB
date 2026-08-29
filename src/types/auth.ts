import type { User } from './user';

// Đăng nhập
export interface SignInPayload {
  email: string;
  password: string;
}

// Đăng ký (ThongTinNguoiDung)
export interface SignUpPayload {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  birthday: string;
  gender: boolean;
  role: 'USER';
}

// Auth response (content)
export interface AuthResult {
  user: User;
  token: string;
}
