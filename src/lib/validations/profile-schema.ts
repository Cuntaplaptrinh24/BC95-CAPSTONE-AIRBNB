import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function isNotInFuture(value: string): boolean {
  const date = parseDate(value);
  if (!date) return false;

  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return date.getTime() <= today;
}

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
      (value) => parseDate(value) !== null,
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