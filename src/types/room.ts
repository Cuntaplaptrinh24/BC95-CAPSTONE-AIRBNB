// Kiểu dữ liệu về phòng thuê.

// Một phòng như API trả về. Chín trường cuối kiểu đúng sai là các tiện nghi.
export interface Room {
  id: number;
  tenPhong: string;
  khach: number;
  phongNgu: number;
  giuong: number;
  phongTam: number;
  moTa: string;
  giaTien: number;
  mayGiat: boolean;
  banLa: boolean;
  tivi: boolean;
  dieuHoa: boolean;
  wifi: boolean;
  bep: boolean;
  doXe: boolean;
  hoBoi: boolean;
  banUi: boolean;
  maViTri: number;
  hinhAnh: string;
}

// Thêm và sửa phòng đều gửi lên đúng hình dạng của Room, nên đặt lại tên
// cho dễ đọc thay vì khai báo lại từ đầu.
export type CreateRoomPayload = Room;

// Cập nhật phòng (PhongViewModel)
export type UpdateRoomPayload = Room;

// Danh sách tiện nghi kèm nhãn tiếng Việt, dùng cho form thêm sửa phòng
// ở khu quản trị: có danh sách này thì chỉ cần viết một lần rồi vẽ ra chín ô tích,
// thay vì gõ tay chín lần. Phần satisfies ở cuối bắt TypeScript kiểm tra
// mọi key ở đây phải là trường có thật trong Room, gõ sai là báo lỗi ngay.
export const ROOM_AMENITY_FIELDS = [
  { key: 'mayGiat', label: 'Máy giặt' },
  { key: 'banLa', label: 'Bàn là' },
  { key: 'tivi', label: 'Tivi' },
  { key: 'dieuHoa', label: 'Điều hòa' },
  { key: 'wifi', label: 'Wifi' },
  { key: 'bep', label: 'Bếp' },
  { key: 'doXe', label: 'Đỗ xe' },
  { key: 'hoBoi', label: 'Hồ bơi' },
  { key: 'banUi', label: 'Bàn ủi' },
] as const satisfies ReadonlyArray<{ key: keyof Room; label: string }>;
