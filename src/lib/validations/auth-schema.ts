import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

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

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
