// Quy tắc kiểm tra dữ liệu cho form sửa hồ sơ cá nhân.

import { z } from "zod";
import { isNotInFuture, parseCalendarDate } from "./date-rules";

// Quy tắc cho từng ô trong form. refine là kiểm tra thêm sau khi ô đã đúng kiểu,
// ví dụ số điện thoại phải có từ 9 đến 15 chữ số sau khi bỏ dấu cách và dấu gạch.
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(50, "Họ tên không được vượt quá 50 ký tự."),

  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),

  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại.")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ.")
    .refine((value) => {
      const digitCount = value.replace(/\D/g, "").length;
      return digitCount >= 9 && digitCount <= 15;
    }, "Số điện thoại phải có từ 9 đến 15 chữ số."),

  birthday: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày sinh.")
    .refine(
      (value) => parseCalendarDate(value) !== null,
      "Ngày sinh không hợp lệ.",
    )
    .refine(
      isNotInFuture,
      "Ngày sinh không được ở tương lai.",
    ),

  gender: z.boolean({
    message: "Vui lòng chọn giới tính.",
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;