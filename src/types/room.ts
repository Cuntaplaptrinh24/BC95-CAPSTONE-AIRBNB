// Phòng
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

// Tạo phòng (PhongViewModel)
export type CreateRoomPayload = Room;

// Cập nhật phòng (PhongViewModel)
export type UpdateRoomPayload = Room;

// Danh sách tiện nghi dùng cho form Admin (khớp field boolean của Room)
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
