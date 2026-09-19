import type { User } from './user';

// Kiểu dữ liệu cho việc đăng nhập và đăng ký.

// Gửi lên khi đăng nhập.
export interface SignInPayload {
  email: string;
  password: string;
}

// Gửi lên khi đăng ký. Tên các trường đặt theo đúng tài liệu API của CyberSoft.
// Trường id để 0 vì server tự sinh, role cố định là USER vì người tự đăng ký
// thì không thể tự cho mình quyền quản trị.
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

// Nhận về sau khi đăng nhập thành công: thông tin người dùng kèm token.
export interface AuthResult {
  user: User;
  token: string;
}
