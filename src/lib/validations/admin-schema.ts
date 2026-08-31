import { z } from 'zod';
import { USER_ROLES } from '@/types/user';

// Các trường dùng chung cho tạo mới và chỉnh sửa người dùng ở Admin.
const adminUserBaseFields = {
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(/^[0-9+\-\s()]{10,15}$/, 'Số điện thoại không hợp lệ.'),
  birthday: z.string().min(1, 'Vui lòng chọn ngày sinh.'),
  gender: z.boolean({ message: 'Vui lòng chọn giới tính.' }),
  role: z.enum(USER_ROLES, { message: 'Vui lòng chọn vai trò.' }),
};

export const adminCreateUserSchema = z.object({
  ...adminUserBaseFields,
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

export const adminUpdateUserSchema = z.object(adminUserBaseFields);

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;

// Vị trí (Locations)
export const adminLocationSchema = z.object({
  tenViTri: z.string().min(1, 'Vui lòng nhập tên vị trí.'),
  tinhThanh: z.string().min(1, 'Vui lòng nhập tỉnh/thành.'),
  quocGia: z.string().min(1, 'Vui lòng nhập quốc gia.'),
});

export type AdminLocationFormValues = z.infer<typeof adminLocationSchema>;

// Phòng thuê (Rooms)
// Lưu ý: các trường số dùng z.number() (không coerce) vì input đã chuyển
// sang number tại register(..., { valueAsNumber: true }), tránh lệch kiểu
// input/output của zod khi dùng chung với react-hook-form.
export const adminRoomSchema = z.object({
  tenPhong: z.string().min(1, 'Vui lòng nhập tên phòng.'),
  maViTri: z.number().int().min(1, 'Vui lòng chọn vị trí.'),
  khach: z.number().int().min(1, 'Số khách tối thiểu là 1.'),
  phongNgu: z.number().int().min(0, 'Giá trị không hợp lệ.'),
  giuong: z.number().int().min(0, 'Giá trị không hợp lệ.'),
  phongTam: z.number().int().min(0, 'Giá trị không hợp lệ.'),
  giaTien: z.number().min(0, 'Giá tiền không hợp lệ.'),
  moTa: z.string().min(1, 'Vui lòng nhập mô tả.'),
  mayGiat: z.boolean(),
  banLa: z.boolean(),
  tivi: z.boolean(),
  dieuHoa: z.boolean(),
  wifi: z.boolean(),
  bep: z.boolean(),
  doXe: z.boolean(),
  hoBoi: z.boolean(),
  banUi: z.boolean(),
});

export type AdminRoomFormValues = z.infer<typeof adminRoomSchema>;

// Đặt phòng (Bookings) — Admin chỉ chỉnh sửa ngày và số khách, không đổi phòng/người đặt.
export const adminBookingSchema = z
  .object({
    ngayDen: z.string().min(1, 'Vui lòng chọn ngày đến.'),
    ngayDi: z.string().min(1, 'Vui lòng chọn ngày đi.'),
    soLuongKhach: z.number().int().min(1, 'Số khách tối thiểu là 1.'),
  })
  .refine((values) => new Date(values.ngayDi) > new Date(values.ngayDen), {
    message: 'Ngày đi phải sau ngày đến.',
    path: ['ngayDi'],
  });

export type AdminBookingFormValues = z.infer<typeof adminBookingSchema>;

// Bình luận (Comments) — Admin chỉ kiểm duyệt nội dung và số sao, không đổi
// phòng/người bình luận/ngày bình luận vì gắn với bình luận gốc.
export const adminCommentSchema = z.object({
  noiDung: z.string().min(1, 'Vui lòng nhập nội dung bình luận.'),
  saoBinhLuan: z.number().int().min(1, 'Số sao tối thiểu là 1.').max(5, 'Số sao tối đa là 5.'),
});

export type AdminCommentFormValues = z.infer<typeof adminCommentSchema>;
