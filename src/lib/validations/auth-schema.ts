// File này mô tả dữ liệu thế nào là hợp lệ cho form đăng nhập và đăng ký.
// Form dựa vào đây để báo lỗi ngay tại chỗ, trước khi gửi lên server.

import { z } from 'zod';

// Đăng nhập: email phải đúng dạng, mật khẩu từ 6 ký tự trở lên.
export const signInSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

// Đăng ký: ngoài email và mật khẩu còn cần họ tên, số điện thoại,
// ngày sinh và giới tính. Mỗi dòng kèm sẵn câu báo lỗi hiện cho người dùng.
export const signUpSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(/^[0-9+\-\s()]{10,15}$/, 'Số điện thoại không hợp lệ.'),
  birthday: z.string().min(1, 'Vui lòng chọn ngày sinh.'),
  gender: z.boolean({ message: 'Vui lòng chọn giới tính.' }),
});

// Hai dòng dưới tạo ra kiểu dữ liệu của form từ đúng phần mô tả ở trên,
// nên sửa mô tả là kiểu dữ liệu tự đổi theo, không phải khai báo hai lần.
export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
