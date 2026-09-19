// Quy tắc kiểm tra ngày, dùng chung cho form đăng ký, form sửa hồ sơ
// và form thêm sửa người dùng ở khu quản trị.
// Trước đây chỉ form sửa hồ sơ kiểm tra, hai form kia chỉ bắt không được để trống.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Kiểm tra một chuỗi có phải ngày thật không.
// Không dùng thẳng new Date vì JavaScript tự chuyển 2026-02-31 thành 03-03.
// Ở đây dựng lại ngày rồi so từng phần năm, tháng, ngày, lệch là coi như sai.
export function parseCalendarDate(value: string): Date | null {
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

// Ngày không được nằm ở tương lai. So theo giờ quốc tế để khỏi lệch múi giờ.
export function isNotInFuture(value: string): boolean {
  const date = parseCalendarDate(value);
  if (!date) return false;

  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return date.getTime() <= today;
}
