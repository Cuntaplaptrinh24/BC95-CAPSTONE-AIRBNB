// Kiểu dữ liệu về lượt đặt phòng.

// Một lượt đặt như API trả về. Chỉ lưu mã phòng và mã người đặt,
// muốn hiện tên phòng thì phải tra thêm từ danh sách phòng.
export interface Booking {
  id: number;
  maPhong: number;
  ngayDen: string;
  ngayDi: string;
  soLuongKhach: number;
  maNguoiDung: number;
}

// Gửi lên khi người dùng đặt phòng. id để 0 vì server tự sinh.
export interface CreateBookingPayload {
  id: number;
  maPhong: number;
  ngayDen: string;
  ngayDi: string;
  soLuongKhach: number;
  maNguoiDung: number;
}

// Gửi lên khi sửa lượt đặt. API nhận cả bản ghi nên phải gửi đủ trường,
// kể cả mã phòng và mã người đặt không đổi.
export interface UpdateBookingPayload {
  id: number;
  maPhong: number;
  ngayDen: string;
  ngayDi: string;
  soLuongKhach: number;
  maNguoiDung: number;
}