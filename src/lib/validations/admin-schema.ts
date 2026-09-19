// File này mô tả dữ liệu hợp lệ cho các form trong khu vực quản trị:
// người dùng, vị trí, phòng thuê, đặt phòng, bình luận.
// Mỗi dòng kèm sẵn câu báo lỗi sẽ hiện ngay dưới ô nhập khi nhập sai.

import { z } from 'zod';
import { USER_ROLES } from '@/types/user';
import { isNotInFuture, parseCalendarDate } from './date-rules';

// Những ô nhập giống nhau giữa form thêm mới và form sửa người dùng.
// Tách riêng ra đây để khỏi viết lại hai lần.
const adminUserBaseFields = {
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(/^[0-9+\-\s()]{10,15}$/, 'Số điện thoại không hợp lệ.'),
  // Ngày sinh phải là ngày có thật và không ở tương lai, dùng chung quy tắc
  // với form đăng ký và form sửa hồ sơ.
  birthday: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh.')
    .refine((value) => parseCalendarDate(value) !== null, 'Ngày sinh không hợp lệ.')
    .refine(isNotInFuture, 'Ngày sinh không được ở tương lai.'),
  gender: z.boolean({ message: 'Vui lòng chọn giới tính.' }),
  role: z.enum(USER_ROLES, { message: 'Vui lòng chọn vai trò.' }),
};

// Thêm người dùng mới thì cần thêm ô mật khẩu.
export const adminCreateUserSchema = z.object({
  ...adminUserBaseFields,
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

// Sửa người dùng thì không đụng tới mật khẩu, nên dùng đúng phần chung.
export const adminUpdateUserSchema = z.object(adminUserBaseFields);

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;

// Vị trí: ba ô đều bắt buộc nhập.
export const adminLocationSchema = z.object({
  tenViTri: z.string().min(1, 'Vui lòng nhập tên vị trí.'),
  tinhThanh: z.string().min(1, 'Vui lòng nhập tỉnh/thành.'),
  quocGia: z.string().min(1, 'Vui lòng nhập quốc gia.'),
});

export type AdminLocationFormValues = z.infer<typeof adminLocationSchema>;

// Phòng thuê: phần đầu là thông tin phòng, phần sau là danh sách tiện nghi,
// mỗi tiện nghi chỉ có hoặc không nên khai báo kiểu đúng sai.
//
// Các ô số ở đây nhận thẳng kiểu số, vì lúc khai báo ô nhập trong form đã
// bật sẵn tùy chọn đổi chữ thành số. Nếu để chỗ này đổi kiểu một lần nữa
// thì hai bên hiểu khác nhau và form báo lỗi sai.
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

// Đặt phòng: quản trị chỉ sửa ngày và số khách, không đổi phòng hay người đặt,
// vì lượt đặt là do người dùng tạo ra.
export const adminBookingSchema = z
  .object({
    ngayDen: z.string().min(1, 'Vui lòng chọn ngày đến.'),
    ngayDi: z.string().min(1, 'Vui lòng chọn ngày đi.'),
    soLuongKhach: z.number().int().min(1, 'Số khách tối thiểu là 1.'),
  })
  // Kiểm tra thêm sau khi từng ô đã hợp lệ: ngày đi phải sau ngày đến.
  .refine((values) => new Date(values.ngayDi) > new Date(values.ngayDen), {
    message: 'Ngày đi phải sau ngày đến.',
    path: ['ngayDi'],
  });

export type AdminBookingFormValues = z.infer<typeof adminBookingSchema>;

// Bình luận: quản trị chỉ sửa nội dung và số sao, tính từ 1 tới 5.
// Không đổi phòng, người viết hay ngày viết vì đó là thông tin của bình luận gốc.
export const adminCommentSchema = z.object({
  noiDung: z.string().min(1, 'Vui lòng nhập nội dung bình luận.'),
  saoBinhLuan: z.number().int().min(1, 'Số sao tối thiểu là 1.').max(5, 'Số sao tối đa là 5.'),
});

export type AdminCommentFormValues = z.infer<typeof adminCommentSchema>;
